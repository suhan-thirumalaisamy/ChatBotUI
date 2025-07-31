import { Amplify } from 'aws-amplify';
import { getCurrentUser, signIn, signUp, signOut, confirmSignUp, resendSignUpCode } from 'aws-amplify/auth';

// Configure Amplify with your Cognito settings
// You'll need to replace these with your actual Cognito configuration
const amplifyConfig = {
  Auth: {
    Cognito: {
      userPoolId: process.env.VITE_COGNITO_USER_POOL_ID || 'your-user-pool-id',
      userPoolClientId: process.env.VITE_COGNITO_USER_POOL_CLIENT_ID || 'your-client-id',
      region: process.env.VITE_AWS_REGION || 'us-east-1',
      signUpVerificationMethod: 'code' as const,
    }
  }
};

Amplify.configure(amplifyConfig);

export interface AuthUser {
  username: string;
  email?: string;
}

export const authService = {
  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const user = await getCurrentUser();
      return {
        username: user.username,
        email: user.signInDetails?.loginId
      };
    } catch (error) {
      return null;
    }
  },

  async signIn(username: string, password: string): Promise<AuthUser> {
    const result = await signIn({ username, password });
    if (result.isSignedIn) {
      return await this.getCurrentUser() as AuthUser;
    }
    throw new Error('Sign in failed');
  },

  async signUp(username: string, email: string, password: string): Promise<void> {
    await signUp({
      username,
      password,
      options: {
        userAttributes: {
          email
        }
      }
    });
  },

  async confirmSignUp(username: string, confirmationCode: string): Promise<void> {
    await confirmSignUp({ username, confirmationCode });
  },

  async resendConfirmationCode(username: string): Promise<void> {
    await resendSignUpCode({ username });
  },

  async signOut(): Promise<void> {
    await signOut();
  }
};