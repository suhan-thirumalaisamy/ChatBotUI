import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { lambdaRequestSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Chat endpoint to proxy requests to AWS Lambda
  app.post("/api/chat", async (req, res) => {
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
