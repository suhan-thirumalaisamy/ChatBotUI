# AWS Cognito Setup Instructions

## Overview
This application uses AWS Cognito for user authentication. You'll need to set up a Cognito User Pool and configure the necessary environment variables.

## Step 1: Create AWS Cognito User Pool

1. **Sign in to AWS Console**
   - Go to [AWS Console](https://aws.amazon.com/console/)
   - Navigate to **Amazon Cognito**

2. **Create User Pool**
   - Click "Create user pool"
   - Choose "User name" and "Email" as sign-in options
   - Set password policy (minimum 8 characters recommended)
   - Enable "Email" for verification
   - Choose "Send email with Cognito" for email delivery

3. **Configure App Client**
   - Add an app client with these settings:
     - **Authentication flows**: Enable "ALLOW_USER_PASSWORD_AUTH"
     - **Security**: Disable "Generate client secret" (for public clients)
   - Note the **App Client ID** - you'll need this

4. **Note Important IDs**
   - **User Pool ID**: Found in the pool overview (format: us-east-1_xxxxxxxxx)
   - **App Client ID**: Found in the app client settings

## Step 2: Configure Environment Variables

Add these environment variables to your Replit secrets or .env file:

```bash
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here

# Cognito Configuration
COGNITO_USER_POOL_ID=us-east-1_xxxxxxxxx
COGNITO_CLIENT_ID=your_app_client_id_here

# JWT Secret (generate a random string)
JWT_SECRET=your_random_jwt_secret_here

# Lambda Configuration (optional)
LAMBDA_ENDPOINT=your_lambda_function_url_here
LAMBDA_API_KEY=your_lambda_api_key_here
```

## Step 3: AWS IAM Permissions

Ensure your AWS credentials have these permissions:
- `cognito-idp:SignUp`
- `cognito-idp:ConfirmSignUp`
- `cognito-idp:InitiateAuth`
- `cognito-idp:ForgotPassword`
- `cognito-idp:ConfirmForgotPassword`
- `cognito-idp:GetUser`

## Step 4: Test Authentication

1. **Start the application**: Run `npm run dev`
2. **Open the app**: Click the "Sign In" button in the top right
3. **Create account**: Use the "Sign Up" tab to create a test account
4. **Verify email**: Check your email for the verification code
5. **Sign in**: Use your credentials to sign in

## Security Notes

- Keep your AWS credentials secure and never commit them to version control
- Use environment variables for all sensitive configuration
- Consider using AWS IAM roles for production deployments
- The JWT secret should be a long, random string

## Troubleshooting

### Common Issues:

1. **"User Pool not found"**: Check your `COGNITO_USER_POOL_ID`
2. **"App client not found"**: Check your `COGNITO_CLIENT_ID`
3. **"Access denied"**: Verify your AWS credentials and IAM permissions
4. **"Invalid password"**: Ensure passwords meet your pool's policy requirements

### Testing Without Cognito

If you need to test the app without setting up Cognito:
- The chatbot will work without authentication
- Some features may be limited for anonymous users
- Set up Cognito when ready for user accounts and personalized features