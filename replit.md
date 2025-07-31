# Utility Customer Support Bot with AWS Lambda Integration

## Overview

This is a full-stack utility customer support application built with React and Express that integrates with AWS Lambda functions for AI-powered customer service conversations. The application features a modern UI with a floating chatbot component specifically designed for utility customer support (electricity, gas, water, and emergency services) and uses PostgreSQL with Drizzle ORM for data persistence.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

**January 31, 2025**
- ✓ Added AWS Cognito authentication integration
- ✓ Created comprehensive auth system with sign up, sign in, email verification, password reset
- ✓ Added authentication UI components with modal dialogs
- ✓ Updated database schema to support Cognito users (cognitoSub, email, name)
- ✓ Implemented JWT token management for API requests
- ✓ Added authentication header and user bar to home page
- ✓ Integrated auth tokens with chatbot API calls
- ✓ Created user context and auth service for frontend state management

## System Architecture

The application follows a monorepo structure with clear separation between frontend and backend concerns:

- **Frontend**: React SPA with TypeScript, using Vite for build tooling
- **Backend**: Express.js server with TypeScript
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **UI Framework**: Tailwind CSS with shadcn/ui component library
- **External Integration**: AWS Lambda functions for AI chat functionality

## Key Components

### Frontend Architecture
- **React 18** with TypeScript for type safety
- **Vite** as the build tool and development server
- **wouter** for lightweight client-side routing
- **TanStack Query** for server state management and caching
- **shadcn/ui** components built on Radix UI primitives
- **Tailwind CSS** for utility-first styling

### Backend Architecture
- **Express.js** server with TypeScript
- **Drizzle ORM** with PostgreSQL dialect for database operations
- **Neon Database** as the PostgreSQL provider
- Session-based architecture for chat conversations
- Proxy pattern for AWS Lambda integration

### Database Schema
- **users**: Basic user management with username/password
- **chat_messages**: Stores chat history with bot/user distinction and session grouping
- Uses UUID primary keys with PostgreSQL's `gen_random_uuid()`

### Chat System
- **Floating chatbot UI** component with collapsible interface
- **Session-based conversations** for context preservation
- **Real-time message display** with auto-scrolling
- **Error handling** with user-friendly toast notifications

## Data Flow

1. **User Interaction**: User types message in chatbot interface
2. **Frontend Processing**: React component validates input and shows loading state
3. **API Request**: Frontend sends message to Express `/api/chat` endpoint
4. **Lambda Proxy**: Express server forwards request to configured AWS Lambda endpoint
5. **AI Processing**: Lambda function processes message and returns response
6. **Response Handling**: Server forwards Lambda response back to frontend
7. **UI Update**: Frontend displays both user message and AI response
8. **State Management**: TanStack Query handles caching and error states

## External Dependencies

### Core Dependencies
- **React ecosystem**: react, react-dom, @tanstack/react-query
- **Backend**: express, drizzle-orm, @neondatabase/serverless
- **UI/Styling**: tailwindcss, @radix-ui/* components, lucide-react icons
- **Development**: vite, typescript, tsx for development server

### AWS Integration
- **Lambda**: Requires `LAMBDA_ENDPOINT` environment variable for Lambda function URL
- **Lambda Authentication**: Optional `LAMBDA_API_KEY` for authentication
- **Cognito Authentication**: Requires the following environment variables:
  - `AWS_REGION` (e.g., 'us-east-1')
  - `AWS_ACCESS_KEY_ID` (AWS access key)
  - `AWS_SECRET_ACCESS_KEY` (AWS secret key)
  - `COGNITO_CLIENT_ID` (Cognito app client ID)
  - `COGNITO_USER_POOL_ID` (Cognito user pool ID)
  - `JWT_SECRET` (Secret for signing JWT tokens)
- Support for AWS credential-based authentication

### Database
- **Neon Database** for managed PostgreSQL
- **Drizzle Kit** for schema migrations
- Connection string via `DATABASE_URL` environment variable

## Deployment Strategy

### Development
- **Vite dev server** for frontend with HMR
- **tsx** for TypeScript execution of Express server
- **Concurrent development** with frontend proxy to backend

### Production Build
- **Vite build** creates optimized frontend bundle
- **esbuild** bundles Express server for Node.js deployment
- **Static file serving** of frontend assets by Express in production
- **Environment-based configuration** for database and Lambda endpoints

### Database Management
- **Schema migrations** managed by Drizzle Kit
- **Push-based deployment** with `db:push` command
- **Type-safe schema** with automatic TypeScript generation

The architecture prioritizes developer experience with strong typing throughout the stack, modern tooling, and clear separation of concerns while maintaining flexibility for cloud deployment and external service integration.