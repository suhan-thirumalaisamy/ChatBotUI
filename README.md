# Utility Customer Support Bot with Amazon Lex Integration

## Overview

This is a full-stack utility customer support application built with React and Express that integrates with Amazon Lex for AI-powered customer service conversations. The application features a modern UI with a floating chatbot component specifically designed for utility customer support (electricity, gas, water, and emergency services) and includes voice message support.

## Features

- **Amazon Lex Integration**: Direct integration with Amazon Lex for natural language processing
- **Voice Messages**: Support for voice input using Web Speech API and microphone recording
- **Text Chat**: Traditional text-based chat interface
- **Session Management**: Maintains conversation context across messages
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time UI**: Loading states, typing indicators, and smooth animations

## Prerequisites

Before setting up the application, you'll need:

1. **AWS Account** with access to Amazon Lex
2. **Amazon Lex Bot** configured and deployed
3. **AWS Credentials** with permissions to access Lex Runtime V2

## Environment Variables

Create a `.env` file in the `client` directory with the following variables:

```env
# AWS Configuration
VITE_AWS_REGION=us-east-1
VITE_AWS_ACCESS_KEY_ID=your-access-key-id
VITE_AWS_SECRET_ACCESS_KEY=your-secret-access-key

# Amazon Lex Configuration
VITE_LEX_BOT_ID=your-lex-bot-id
VITE_LEX_BOT_ALIAS_ID=TSTALIASID
VITE_LEX_LOCALE_ID=en_US

# AWS Cognito Configuration (for authentication)
VITE_COGNITO_USER_POOL_ID=your-user-pool-id
VITE_COGNITO_USER_POOL_CLIENT_ID=your-client-id
```

## Amazon Lex Setup

1. **Create a Lex Bot**:
   - Go to Amazon Lex console
   - Create a new bot or use an existing one
   - Configure intents, slots, and responses for utility support scenarios
   - Deploy the bot to get the Bot ID

2. **Configure Bot Alias**:
   - Create or use the default test alias (`TSTALIASID`)
   - Note the alias ID for configuration

3. **Set Permissions**:
   - Ensure your AWS credentials have the following permissions:
     - `lex:RecognizeText`
     - `lex:RecognizeUtterance`

## Installation

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment**:
   - Copy `.env.example` to `.env`
   - Fill in your AWS and Lex configuration values

3. **Start Development Server**:
   ```bash
   npm run dev
   ```

## Usage

### Text Messages
- Type your message in the chat input
- Press Enter or click the Send button
- The bot will respond using Amazon Lex

### Voice Messages
- Click the microphone icon to start recording
- Speak your message clearly
- Click the microphone icon again to stop recording
- The audio will be sent to Lex for processing
- Both the transcribed text and bot response will appear in the chat

### Chat Management
- Click the trash icon to clear the chat history
- Each chat session maintains context until cleared
- The chat interface is responsive and works on mobile devices

## Technical Architecture

### Frontend Components
- **Chatbot Component**: Main chat interface with voice and text support
- **Voice Recording**: Uses MediaRecorder API for audio capture
- **AWS SDK Integration**: Direct connection to Amazon Lex Runtime V2

### Amazon Lex Integration
- **Text Processing**: Uses `RecognizeTextCommand` for text messages
- **Voice Processing**: Uses `RecognizeUtteranceCommand` for audio messages
- **Session Management**: Maintains conversation state across interactions

### Audio Processing
- **Format**: WebM with Opus codec for optimal compression
- **Browser Support**: Works in modern browsers with microphone access
- **Permissions**: Requests microphone permission when first used

## Troubleshooting

### Common Issues

1. **Microphone Not Working**:
   - Check browser permissions for microphone access
   - Ensure HTTPS is used (required for microphone API)
   - Verify MediaRecorder API support in your browser

2. **Lex Connection Errors**:
   - Verify AWS credentials are correct
   - Check that the Bot ID and Alias ID are valid
   - Ensure the bot is deployed and active

3. **Authentication Issues**:
   - Confirm AWS region matches your Lex bot region
   - Verify IAM permissions for Lex access
   - Check that credentials haven't expired

### Browser Compatibility

- **Voice Features**: Requires modern browsers with MediaRecorder support
- **Audio Format**: WebM/Opus is preferred, falls back to available formats
- **Permissions**: HTTPS required for microphone access

## Security Considerations

- **Credentials**: Never commit AWS credentials to version control
- **Permissions**: Use least-privilege IAM policies
- **HTTPS**: Required for microphone access and secure communication
- **Session Management**: Sessions are client-side only, no server storage

## Development

### Adding New Features

1. **Custom Intents**: Add new intents in Amazon Lex console
2. **UI Modifications**: Update the chatbot component for new functionality
3. **Error Handling**: Extend error handling for new scenarios

### Testing

- Test both text and voice inputs
- Verify error handling with invalid inputs
- Check responsive design on different screen sizes
- Test microphone permissions and audio quality

## Deployment

The application can be deployed to any static hosting service:

1. **Build the Application**:
   ```bash
   npm run build
   ```

2. **Deploy Static Files**:
   - Upload the `dist` folder to your hosting service
   - Ensure HTTPS is configured for voice features

3. **Environment Variables**:
   - Configure environment variables in your hosting platform
   - Never expose AWS credentials in client-side code in production

## Support

For issues related to:
- **Amazon Lex**: Check AWS documentation and console logs
- **Voice Recording**: Verify browser compatibility and permissions
- **UI Issues**: Check browser developer tools for errors

The application provides user-friendly error messages and toast notifications to help diagnose issues.