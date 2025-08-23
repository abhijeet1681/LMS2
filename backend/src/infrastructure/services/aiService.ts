import OpenAI from 'openai';
import { IChatbotMessage } from '../../domain/models/Chatbot';

interface UserContext {
    userId: string;
    userRole: 'student' | 'instructor' | 'admin';
    courseId?: string;
    currentPage?: string;
    userProgress?: any;
}

export class AIService {
    private openai: OpenAI;

    constructor() {
        this.openai = new OpenAI({
            apiKey: process.env.OPENAI_API_KEY || 'your-openai-api-key'
        });
    }

    async generateResponse(
        messages: IChatbotMessage[], 
        userContext: UserContext
    ): Promise<string> {
        try {
            const systemPrompt = this.buildSystemPrompt(userContext);
            const conversationMessages = this.formatMessagesForOpenAI(messages, systemPrompt);

            const completion = await this.openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: conversationMessages,
                max_tokens: 300,
                temperature: 0.7,
            });

            return completion.choices[0]?.message?.content?.trim() || 
                   "I apologize, but I'm having trouble generating a response right now. Please try again.";
        } catch (error) {
            console.error('OpenAI API Error:', error);
            return this.getFallbackResponse(userContext);
        }
    }

    private buildSystemPrompt(userContext: UserContext): string {
        const basePrompt = `You are LearnLab Assistant, a helpful AI chatbot for the LearnLab e-learning platform. 
        You provide guidance, support, and information to users.`;

        switch (userContext.userRole) {
            case 'student':
                return `${basePrompt}
                
                You are helping a STUDENT. Your role is to:
                - Guide students through course navigation and learning processes
                - Help with course enrollment, progress tracking, and certificate requirements
                - Explain how to access videos, quizzes, and course materials
                - Provide study tips and learning strategies
                - Assist with technical issues like video playback, progress tracking
                - Explain the 80% video completion requirement for progression
                - Guide through quiz attempts and certificate generation
                - Answer questions about course content and learning paths
                
                Key features to mention:
                - Sequential video access (80% completion required)
                - Quiz completion for certificates (75% passing score)
                - Progress tracking and course completion
                - Certificate verification and download
                
                Be encouraging, helpful, and student-focused. Keep responses concise and actionable.`;

            case 'instructor':
                return `${basePrompt}
                
                You are helping an INSTRUCTOR. Your role is to:
                - Assist with course creation, management, and publishing
                - Guide through video upload, lecture organization, and course structure
                - Help with student progress monitoring and analytics
                - Explain quiz creation, question management, and grading
                - Assist with course pricing, descriptions, and marketing
                - Provide guidance on course quality and best practices
                - Help with earnings tracking and financial reports
                - Support with student communication and engagement
                
                Key features to mention:
                - Course builder with lectures and videos
                - Quiz creation and management tools
                - Student progress and completion tracking
                - Revenue sharing and payment processing
                - Course analytics and performance metrics
                - Certificate management for students
                
                Be professional, detailed, and focused on teaching success.`;

            case 'admin':
                return `${basePrompt}
                
                You are helping an ADMIN. Your role is to:
                - Assist with platform management and user administration
                - Help with course approval, content moderation, and quality control
                - Guide through user management, role assignments, and permissions
                - Explain analytics, reports, and platform performance metrics
                - Assist with payment processing, revenue tracking, and financial reports
                - Help with platform settings, configurations, and maintenance
                - Support with dispute resolution and customer support
                - Guide through certificate verification and validation
                
                Key features to mention:
                - User management and role administration
                - Course approval and content moderation
                - Platform analytics and reporting
                - Revenue management and payment processing
                - Certificate validation and verification
                - System configuration and maintenance tools
                
                Be authoritative, comprehensive, and focused on platform management.`;

            default:
                return basePrompt;
        }
    }

    private formatMessagesForOpenAI(messages: IChatbotMessage[], systemPrompt: string) {
        const formattedMessages: any[] = [
            { role: 'system', content: systemPrompt }
        ];

        // Include last 10 messages for context (to stay within token limits)
        const recentMessages = messages.slice(-10);
        
        recentMessages.forEach(msg => {
            if (msg.role === 'user' || msg.role === 'assistant') {
                formattedMessages.push({
                    role: msg.role,
                    content: msg.content
                });
            }
        });

        return formattedMessages;
    }

    private getFallbackResponse(userContext: UserContext): string {
        const fallbackResponses = {
            student: [
                "I'm here to help you with your learning journey! You can ask me about course navigation, progress tracking, or any learning-related questions.",
                "Need help with your courses? I can guide you through video lessons, quiz requirements, or certificate processes.",
                "I'm your learning assistant! Feel free to ask about course access, video completion requirements, or study tips."
            ],
            instructor: [
                "I'm here to help you create and manage your courses! Ask me about course creation, student management, or platform features.",
                "Need assistance with your teaching? I can help with course setup, quiz creation, or student progress tracking.",
                "I'm your instructor assistant! Feel free to ask about course management, analytics, or best practices."
            ],
            admin: [
                "I'm here to help you manage the LearnLab platform! Ask me about user management, course moderation, or system administration.",
                "Need help with platform administration? I can guide you through user management, analytics, or system settings.",
                "I'm your admin assistant! Feel free to ask about platform management, reports, or administrative tasks."
            ]
        };

        const responses = fallbackResponses[userContext.userRole] || fallbackResponses.student;
        return responses[Math.floor(Math.random() * responses.length)];
    }

    // Quick response patterns for common queries
    getQuickResponse(query: string, userContext: UserContext): string | null {
        const lowerQuery = query.toLowerCase();

        // Common patterns
        if (lowerQuery.includes('hello') || lowerQuery.includes('hi') || lowerQuery.includes('hey')) {
            return `Hello! I'm your LearnLab assistant. As a ${userContext.userRole}, I can help you with platform navigation, ${
                userContext.userRole === 'student' ? 'learning' : 
                userContext.userRole === 'instructor' ? 'teaching' : 'administration'
            }. What would you like to know?`;
        }

        if (userContext.userRole === 'student') {
            if (lowerQuery.includes('video') && lowerQuery.includes('unlock')) {
                return "To unlock the next video, you need to watch at least 80% of the current video. The progress bar will turn green when you've watched enough!";
            }
            if (lowerQuery.includes('certificate')) {
                return "To get your certificate, complete all videos (80% each) and pass the final quiz with 75% or higher. The certificate will be automatically generated!";
            }
            if (lowerQuery.includes('quiz')) {
                return "Quizzes appear after completing all course videos. You need 75% to pass and get your certificate. You have limited attempts, so review the material first!";
            }
        }

        if (userContext.userRole === 'instructor') {
            if (lowerQuery.includes('course') && lowerQuery.includes('create')) {
                return "To create a course: Go to your dashboard → Create Course → Add title, description, and thumbnail → Create lectures → Upload videos → Add quiz questions → Publish!";
            }
            if (lowerQuery.includes('quiz') && lowerQuery.includes('create')) {
                return "Create quizzes in your course editor: Add questions with multiple choice answers → Set passing score (default 75%) → Set time limits and attempt limits → Save!";
            }
        }

        return null; // Return null if no quick response found
    }
}
