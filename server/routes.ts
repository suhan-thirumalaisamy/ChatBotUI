import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  lambdaRequestSchema, 
  cognitoSignUpSchema,
  cognitoSignInSchema,
  cognitoConfirmSignUpSchema,
  cognitoForgotPasswordSchema,
  cognitoResetPasswordSchema
} from "@shared/schema";
import { z } from "zod";
import { cognitoService, authenticateToken, optionalAuth, type AuthenticatedRequest } from "./cognito";

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication Routes
  
  // Sign up with AWS Cognito
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { email, password, name } = cognitoSignUpSchema.parse(req.body);
      
      const result = await cognitoService.signUp(email, password, name);
      
      if (result.success) {
        res.json({ 
          message: result.message,
          userSub: result.userSub 
        });
      } else {
        res.status(400).json({ error: result.error });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Invalid request data", 
          details: error.errors 
        });
      }
      res.status(500).json({ error: "Registration failed" });
    }
  });

  // Confirm sign up
  app.post("/api/auth/confirm-signup", async (req, res) => {
    try {
      const { email, confirmationCode } = cognitoConfirmSignUpSchema.parse(req.body);
      
      const result = await cognitoService.confirmSignUp(email, confirmationCode);
      
      if (result.success) {
        res.json({ message: result.message });
      } else {
        res.status(400).json({ error: result.error });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Invalid request data", 
          details: error.errors 
        });
      }
      res.status(500).json({ error: "Email verification failed" });
    }
  });

  // Sign in
  app.post("/api/auth/signin", async (req, res) => {
    try {
      const { email, password } = cognitoSignInSchema.parse(req.body);
      
      const result = await cognitoService.signIn(email, password);
      
      if (result.success && result.user) {
        // Create or update user in database
        await storage.upsertUser({
          cognitoSub: result.user.sub,
          email: result.user.email,
          name: result.user.name,
        });

        // Generate JWT for our application
        const appToken = cognitoService.generateJWT(result.user);
        
        res.json({
          token: appToken,
          user: result.user,
          cognitoTokens: result.tokens,
        });
      } else {
        res.status(401).json({ error: result.error });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Invalid request data", 
          details: error.errors 
        });
      }
      res.status(500).json({ error: "Sign in failed" });
    }
  });

  // Forgot password
  app.post("/api/auth/forgot-password", async (req, res) => {
    try {
      const { email } = cognitoForgotPasswordSchema.parse(req.body);
      
      const result = await cognitoService.forgotPassword(email);
      
      if (result.success) {
        res.json({ message: result.message });
      } else {
        res.status(400).json({ error: result.error });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Invalid request data", 
          details: error.errors 
        });
      }
      res.status(500).json({ error: "Password reset request failed" });
    }
  });

  // Reset password
  app.post("/api/auth/reset-password", async (req, res) => {
    try {
      const { email, confirmationCode, newPassword } = cognitoResetPasswordSchema.parse(req.body);
      
      const result = await cognitoService.confirmForgotPassword(email, confirmationCode, newPassword);
      
      if (result.success) {
        res.json({ message: result.message });
      } else {
        res.status(400).json({ error: result.error });
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Invalid request data", 
          details: error.errors 
        });
      }
      res.status(500).json({ error: "Password reset failed" });
    }
  });

  // Get current user (protected route)
  app.get("/api/auth/me", authenticateToken, async (req: AuthenticatedRequest, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: "User not authenticated" });
      }

      const user = await storage.getUserByCognitoSub(req.user.sub);
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      res.json({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          lastLogin: user.lastLogin,
        }
      });
    } catch (error) {
      res.status(500).json({ error: "Failed to get user information" });
    }
  });

  // Sign out (optional - mainly client-side token removal)
  app.post("/api/auth/signout", authenticateToken, async (req: AuthenticatedRequest, res) => {
    // With JWT, signout is mainly handled client-side by removing the token
    // But we can update last login time here
    try {
      if (req.user) {
        await storage.updateUserLastLogin(req.user.sub);
      }
      res.json({ message: "Signed out successfully" });
    } catch (error) {
      res.status(500).json({ error: "Sign out failed" });
    }
  });

  // Chat endpoint to proxy requests to AWS Lambda (now with optional authentication)
  app.post("/api/chat", optionalAuth, async (req: AuthenticatedRequest, res) => {
    try {
      const { message, sessionId } = lambdaRequestSchema.parse(req.body);
      
      // Get Lambda endpoint from environment variables
      const lambdaEndpoint = process.env.LAMBDA_ENDPOINT || process.env.AWS_LAMBDA_ENDPOINT;
      
      if (!lambdaEndpoint) {
        return res.status(500).json({ 
          error: "Lambda endpoint not configured. Please set LAMBDA_ENDPOINT environment variable." 
        });
      }

      // Make request to AWS Lambda
      const lambdaResponse = await fetch(lambdaEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add any additional headers if needed for authentication
          ...(process.env.LAMBDA_API_KEY && {
            'x-api-key': process.env.LAMBDA_API_KEY
          }),
          ...(process.env.AWS_ACCESS_KEY_ID && {
            'Authorization': `AWS4-HMAC-SHA256 Credential=${process.env.AWS_ACCESS_KEY_ID}`
          })
        },
        body: JSON.stringify({
          message,
          sessionId: sessionId || `session_${Date.now()}`,
          timestamp: new Date().toISOString()
        })
      });

      if (!lambdaResponse.ok) {
        const errorText = await lambdaResponse.text();
        return res.status(lambdaResponse.status).json({ 
          error: `Lambda function error: ${errorText || 'Unknown error'}` 
        });
      }

      const lambdaData = await lambdaResponse.json();
      
      res.json({
        response: lambdaData.response || lambdaData.message || "I received your message.",
        sessionId: lambdaData.sessionId || sessionId || `session_${Date.now()}`
      });

    } catch (error) {
      console.error('Chat API error:', error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          error: "Invalid request data", 
          details: error.errors 
        });
      }
      
      res.status(500).json({ 
        error: "Internal server error. Please try again later." 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
