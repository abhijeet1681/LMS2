# LearnLab Chatbot Setup Guide

## Overview

The LearnLab chatbot is an AI-powered assistant that provides personalized support to students, instructors, and administrators. It uses OpenAI's GPT models for intelligent responses and includes role-based assistance, quick responses, and context-aware conversations.

## Features

### 🤖 AI-Powered Responses
- OpenAI GPT-3.5-turbo integration
- Role-based system prompts (Student, Instructor, Admin)
- Context-aware conversations
- Fallback responses when AI is unavailable

### 🎯 Quick Actions
- Pre-defined quick action buttons
- Role-specific common queries
- One-click question submission

### 💬 Enhanced UI/UX
- Modern chat interface
- Real-time typing indicators
- Message formatting (bold, italic, lists)
- Responsive design for mobile/desktop
- Dark mode support

### 🔧 Smart Features
- Session management
- Conversation history
- Context tracking
- Error handling
- Analytics support

## Setup Instructions

### 1. Environment Variables

Add the following to your `.env` file in the backend directory:

```env
# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_MAX_TOKENS=400
OPENAI_TEMPERATURE=0.7

# Other existing variables...
MONGO_URI=your_mongodb_uri
ACCESS_TOKEN_SECRET=your_access_token_secret
# ... etc
```

### 2. Install Dependencies

The required dependencies are already included in `package.json`:

```bash
# Backend dependencies
npm install openai uuid

# Frontend dependencies (already included)
# No additional installation needed
```

### 3. Database Setup

The chatbot uses MongoDB with the following collections:
- `ChatbotConversation` - Stores conversation sessions and messages

The schema is automatically created when the application starts.

### 4. API Endpoints

The chatbot provides the following endpoints:

#### User Endpoints
- `POST /api/chatbot/message` - Send a message to the chatbot
- `GET /api/chatbot/conversations/:sessionId/history` - Get conversation history
- `DELETE /api/chatbot/conversations/:sessionId` - End a conversation
- `GET /api/chatbot/conversations` - Get user conversations

#### Admin Endpoints
- `DELETE /api/chatbot/admin/cleanup` - Clean up old conversations
- `GET /api/chatbot/admin/analytics` - Get chatbot analytics

## Usage

### For Students

The chatbot helps students with:
- Course navigation and enrollment
- Video progression (80% completion requirement)
- Quiz completion and certificates
- Progress tracking
- Technical support
- Profile management

**Example queries:**
- "How do I unlock the next video?"
- "How do I get my certificate?"
- "How can I track my progress?"
- "How do I enroll in a course?"

### For Instructors

The chatbot assists instructors with:
- Course creation and management
- Video upload and organization
- Quiz creation and management
- Student progress monitoring
- Earnings tracking
- Platform features

**Example queries:**
- "How do I create a new course?"
- "How do I upload videos?"
- "How do I create a quiz?"
- "How can I view my earnings?"

### For Administrators

The chatbot supports admins with:
- User management
- Course approval and moderation
- Platform analytics
- System configuration
- Payment processing
- Content management

**Example queries:**
- "How do I manage users?"
- "How do I approve courses?"
- "How can I access analytics?"
- "How do I configure system settings?"

## Configuration

### OpenAI Settings

You can customize the AI behavior by modifying these environment variables:

```env
OPENAI_MODEL=gpt-3.5-turbo          # AI model to use
OPENAI_MAX_TOKENS=400               # Maximum response length
OPENAI_TEMPERATURE=0.7              # Response creativity (0.0-1.0)
```

### Quick Responses

Quick responses are defined in `aiService.ts` and provide instant answers for common queries. You can add more patterns by modifying the `getQuickResponse` method.

### System Prompts

Role-specific system prompts are defined in `aiService.ts`. You can customize these to change how the AI responds to different user types.

## Troubleshooting

### Common Issues

1. **Chatbot not responding**
   - Check if OpenAI API key is set correctly
   - Verify internet connection
   - Check server logs for errors

2. **Messages not sending**
   - Ensure user is authenticated
   - Check if the chatbot component is properly imported
   - Verify API endpoints are accessible

3. **AI responses are generic**
   - Check OpenAI API key validity
   - Verify API quota and billing
   - Check system prompts configuration

### Debug Mode

Enable debug logging by setting:

```env
NODE_ENV=development
```

This will show detailed logs for chatbot operations.

## Security

- All chatbot endpoints require authentication
- User sessions are validated for each request
- API keys are stored securely in environment variables
- Conversation data is isolated per user

## Performance

- Quick responses provide instant answers for common queries
- AI responses are cached in conversation history
- Message context is limited to last 15 messages
- Automatic cleanup of old conversations (30+ days)

## Analytics

Admin users can access chatbot analytics including:
- Total conversations
- Average response time
- User satisfaction metrics
- Common query patterns
- Platform usage statistics

## Future Enhancements

Planned features:
- Multi-language support
- Advanced analytics dashboard
- Voice input/output
- Integration with help documentation
- Automated ticket creation
- Learning path recommendations

## Support

For technical support or questions about the chatbot:
- Email: support@learnlab.com
- Check the application logs for detailed error information
- Review the OpenAI API documentation for AI-related issues

---

**Note:** The chatbot requires an active OpenAI API key to function with AI responses. Without the API key, it will fall back to predefined responses only.
