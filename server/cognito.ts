import {
  CognitoIdentityProviderClient,
  SignUpCommand,
  ConfirmSignUpCommand,
  InitiateAuthCommand,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
  GetUserCommand,
  AuthFlowType,
  ChallengeNameType
} from "@aws-sdk/client-cognito-identity-provider";
import jwt from "jsonwebtoken";
import type { Request, Response, NextFunction } from "express";

const cognitoClient = new CognitoIdentityProviderClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  }
});

const CLIENT_ID = process.env.COGNITO_CLIENT_ID || '';
const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID || '';
const JWT_SECRET = process.env.JWT_SECRET || 'your-jwt-secret';

export interface AuthenticatedRequest extends Request {
  user?: {
    sub: string;
    email: string;
    name?: string;
  };
}

export class CognitoService {
  async signUp(email: string, password: string, name: string) {
    const command = new SignUpCommand({
      ClientId: CLIENT_ID,
      Username: email,
      Password: password,
      UserAttributes: [
        {
          Name: 'email',
          Value: email,
        },
        {
          Name: 'name',
          Value: name,
        },
      ],
    });

    try {
      const response = await cognitoClient.send(command);
      return {
        success: true,
        userSub: response.UserSub,
        message: 'User registered successfully. Please check your email for verification code.',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Registration failed',
      };
    }
  }

  async confirmSignUp(email: string, confirmationCode: string) {
    const command = new ConfirmSignUpCommand({
      ClientId: CLIENT_ID,
      Username: email,
      ConfirmationCode: confirmationCode,
    });

    try {
      await cognitoClient.send(command);
      return {
        success: true,
        message: 'Email verified successfully. You can now sign in.',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Email verification failed',
      };
    }
  }

  async signIn(email: string, password: string) {
    const command = new InitiateAuthCommand({
      ClientId: CLIENT_ID,
      AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
      },
    });

    try {
      const response = await cognitoClient.send(command);
      
      if (response.ChallengeName === ChallengeNameType.NEW_PASSWORD_REQUIRED) {
        return {
          success: false,
          challenge: 'NEW_PASSWORD_REQUIRED',
          session: response.Session,
          error: 'New password required',
        };
      }

      if (response.AuthenticationResult) {
        const { AccessToken, IdToken, RefreshToken } = response.AuthenticationResult;
        
        // Decode the ID token to get user info
        const decodedToken = jwt.decode(IdToken!) as any;
        
        return {
          success: true,
          tokens: {
            accessToken: AccessToken,
            idToken: IdToken,
            refreshToken: RefreshToken,
          },
          user: {
            sub: decodedToken.sub,
            email: decodedToken.email,
            name: decodedToken.name,
          },
        };
      }

      return {
        success: false,
        error: 'Authentication failed',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Sign in failed',
      };
    }
  }

  async forgotPassword(email: string) {
    const command = new ForgotPasswordCommand({
      ClientId: CLIENT_ID,
      Username: email,
    });

    try {
      await cognitoClient.send(command);
      return {
        success: true,
        message: 'Password reset code sent to your email.',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Password reset request failed',
      };
    }
  }

  async confirmForgotPassword(email: string, confirmationCode: string, newPassword: string) {
    const command = new ConfirmForgotPasswordCommand({
      ClientId: CLIENT_ID,
      Username: email,
      ConfirmationCode: confirmationCode,
      Password: newPassword,
    });

    try {
      await cognitoClient.send(command);
      return {
        success: true,
        message: 'Password reset successfully.',
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Password reset failed',
      };
    }
  }

  async getUserInfo(accessToken: string) {
    const command = new GetUserCommand({
      AccessToken: accessToken,
    });

    try {
      const response = await cognitoClient.send(command);
      const email = response.UserAttributes?.find(attr => attr.Name === 'email')?.Value;
      const name = response.UserAttributes?.find(attr => attr.Name === 'name')?.Value;
      
      return {
        success: true,
        user: {
          sub: response.Username!,
          email: email!,
          name: name,
        },
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Failed to get user info',
      };
    }
  }

  verifyToken(token: string): { valid: boolean; decoded?: any } {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return { valid: true, decoded };
    } catch (error) {
      return { valid: false };
    }
  }

  generateJWT(user: { sub: string; email: string; name?: string }): string {
    return jwt.sign(user, JWT_SECRET, { expiresIn: '24h' });
  }
}

export const cognitoService = new CognitoService();

// Middleware to verify JWT token
export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  const verification = cognitoService.verifyToken(token);
  if (!verification.valid) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }

  req.user = verification.decoded;
  next();
};

// Optional authentication middleware (doesn't require token)
export const optionalAuth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    const verification = cognitoService.verifyToken(token);
    if (verification.valid) {
      req.user = verification.decoded;
    }
  }

  next();
};