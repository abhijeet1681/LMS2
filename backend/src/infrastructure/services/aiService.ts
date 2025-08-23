import OpenAI from 'openai';
import { IChatbotMessage } from '../../domain/models/Chatbot';
import { config } from '../config/config';

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
        if (!config.openai.OPENAI_API_KEY) {
            console.warn('OpenAI API key not found. Chatbot will use fallback responses only.');
        }
        
        this.openai = new OpenAI({
            apiKey: config.openai.OPENAI_API_KEY || 'dummy-key'
        });
    }

    async generateResponse(
        messages: IChatbotMessage[], 
        userContext: UserContext
    ): Promise<string> {
        try {
            // Check if OpenAI is properly configured
            if (!config.openai.OPENAI_API_KEY || config.openai.OPENAI_API_KEY === 'dummy-key') {
                return this.getFallbackResponse(userContext);
            }

            const systemPrompt = this.buildSystemPrompt(userContext);
            const conversationMessages = this.formatMessagesForOpenAI(messages, systemPrompt);

            const completion = await this.openai.chat.completions.create({
                model: config.openai.OPENAI_MODEL || "gpt-3.5-turbo",
                messages: conversationMessages,
                max_tokens: config.openai.OPENAI_MAX_TOKENS || 400,
                temperature: config.openai.OPENAI_TEMPERATURE || 0.7,
                presence_penalty: 0.1,
                frequency_penalty: 0.1,
            });

            return completion.choices[0]?.message?.content?.trim() || 
                   this.getFallbackResponse(userContext);
        } catch (error) {
            console.error('OpenAI API Error:', error);
            return this.getFallbackResponse(userContext);
        }
    }

    private buildSystemPrompt(userContext: UserContext): string {
        const basePrompt = `You are LearnLab Assistant, a helpful AI chatbot for the LearnLab e-learning platform. 
        You provide guidance, support, and information to users. Always be friendly, professional, and helpful.
        Keep responses concise but informative. Use markdown formatting when appropriate for better readability.`;

        const roleSpecificPrompts = {
            student: `
                You are helping a STUDENT. Your role is to:
                - Guide students through course navigation and learning processes
                - Help with course enrollment, progress tracking, and certificate requirements
                - Explain how to access videos, quizzes, and course materials
                - Provide study tips and learning strategies
                - Assist with technical issues like video playback, progress tracking
                - Explain the 80% video completion requirement for progression
                - Guide through quiz attempts and certificate generation
                - Answer questions about course content and learning paths
                - Help with profile management and settings
                - Assist with wishlist and course discovery
                
                Key features to mention:
                - Sequential video access (80% completion required)
                - Quiz completion for certificates (75% passing score)
                - Progress tracking and course completion
                - Certificate verification and download
                - Course ratings and reviews
                - Wishlist functionality
                - Profile customization
                
                Be encouraging, helpful, and student-focused. Keep responses concise and actionable.
                If you don't know something specific, suggest contacting support or checking the help section.`,

            instructor: `
                You are helping an INSTRUCTOR. Your role is to:
                - Assist with course creation, management, and publishing
                - Guide through video upload, lecture organization, and course structure
                - Help with student progress monitoring and analytics
                - Explain quiz creation, question management, and grading
                - Assist with course pricing, descriptions, and marketing
                - Provide guidance on course quality and best practices
                - Help with earnings tracking and financial reports
                - Support with student communication and engagement
                - Guide through instructor registration and verification
                - Assist with course editing and updates
                
                Key features to mention:
                - Course builder with lectures and videos
                - Quiz creation and management tools
                - Student progress and completion tracking
                - Revenue sharing and payment processing
                - Course analytics and performance metrics
                - Certificate management for students
                - Instructor dashboard and earnings
                - Course approval process
                
                Be professional, detailed, and focused on teaching success.
                Provide step-by-step guidance when explaining complex processes.`,

            admin: `
                You are helping an ADMIN. Your role is to:
                - Assist with platform management and user administration
                - Help with course approval, content moderation, and quality control
                - Guide through user management, role assignments, and permissions
                - Explain analytics, reports, and platform performance metrics
                - Assist with payment processing, revenue tracking, and financial reports
                - Help with platform settings, configurations, and maintenance
                - Support with dispute resolution and customer support
                - Guide through certificate verification and validation
                - Assist with category management and course organization
                - Help with instructor application processing
                
                Key features to mention:
                - User management and role administration
                - Course approval and content moderation
                - Platform analytics and reporting
                - Revenue management and payment processing
                - Certificate validation and verification
                - System configuration and maintenance tools
                - Category and course management
                - Instructor application processing
                
                Be authoritative, comprehensive, and focused on platform management.
                Provide detailed explanations for administrative tasks.`
        };

        const rolePrompt = roleSpecificPrompts[userContext.userRole] || roleSpecificPrompts.student;
        
        return `${basePrompt}\n\n${rolePrompt}`;
    }

    private formatMessagesForOpenAI(messages: IChatbotMessage[], systemPrompt: string) {
        const formattedMessages: any[] = [
            { role: 'system', content: systemPrompt }
        ];

        // Include last 15 messages for context (increased from 10)
        const recentMessages = messages.slice(-15);
        
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
                "I'm your learning assistant! Feel free to ask about course access, video completion requirements, or study tips.",
                "Having trouble with your courses? I can help with video progression, quiz completion, or certificate generation.",
                "I'm here to support your learning! Ask me about course features, progress tracking, or technical issues."
            ],
            instructor: [
                "I'm here to help you create and manage your courses! Ask me about course creation, student management, or platform features.",
                "Need assistance with your teaching? I can help with course setup, quiz creation, or student progress tracking.",
                "I'm your instructor assistant! Feel free to ask about course management, analytics, or best practices.",
                "Looking to improve your courses? I can guide you through content creation, student engagement, or platform features.",
                "I'm here to support your teaching journey! Ask me about course creation, student management, or earnings tracking."
            ],
            admin: [
                "I'm here to help you manage the LearnLab platform! Ask me about user management, course moderation, or system administration.",
                "Need help with platform administration? I can guide you through user management, analytics, or system settings.",
                "I'm your admin assistant! Feel free to ask about platform management, reports, or administrative tasks.",
                "Looking to optimize the platform? I can help with user management, course approval, or system configuration.",
                "I'm here to support platform administration! Ask me about analytics, user management, or system maintenance."
            ]
        };

        const responses = fallbackResponses[userContext.userRole] || fallbackResponses.student;
        return responses[Math.floor(Math.random() * responses.length)];
    }

    // Enhanced quick response patterns for common queries
    getQuickResponse(query: string, userContext: UserContext): string | null {
        const lowerQuery = query.toLowerCase();

        // Greetings
        if (lowerQuery.includes('hello') || lowerQuery.includes('hi') || lowerQuery.includes('hey')) {
            return `Hello! I'm your LearnLab assistant. As a ${userContext.userRole}, I can help you with platform navigation, ${
                userContext.userRole === 'student' ? 'learning' : 
                userContext.userRole === 'instructor' ? 'teaching' : 'administration'
            }. What would you like to know?`;
        }

        // Student-specific quick responses
        if (userContext.userRole === 'student') {
            if (lowerQuery.includes('video') && (lowerQuery.includes('unlock') || lowerQuery.includes('next'))) {
                return "To unlock the next video, you need to watch at least **80%** of the current video. The progress bar will turn green when you've watched enough! 📹";
            }
            if (lowerQuery.includes('certificate') || lowerQuery.includes('cert')) {
                return "To get your certificate: 1) Complete all videos (80% each) 2) Pass the final quiz with **75% or higher** 3) Certificate will be automatically generated! 🎓";
            }
            if (lowerQuery.includes('quiz') || lowerQuery.includes('test')) {
                return "Quizzes appear after completing all course videos. You need **75% to pass** and get your certificate. You have limited attempts, so review the material first! 📝";
            }
            if (lowerQuery.includes('progress') || lowerQuery.includes('track')) {
                return "Your progress is tracked automatically! Check your course dashboard to see completion percentages, quiz scores, and overall progress. 📊";
            }
            if (lowerQuery.includes('enroll') || lowerQuery.includes('join')) {
                return "To enroll in a course: Browse courses → Select one → Click 'Enroll' → Complete payment → Start learning! 🚀";
            }
            if (lowerQuery.includes('wishlist') || lowerQuery.includes('save')) {
                return "Add courses to your wishlist by clicking the heart icon! This helps you save courses for later and track your interests. ❤️";
            }
        }

        // Instructor-specific quick responses
        if (userContext.userRole === 'instructor') {
            if (lowerQuery.includes('course') && lowerQuery.includes('create')) {
                return "To create a course: Dashboard → Create Course → Add title/description → Upload thumbnail → Create lectures → Add videos → Create quiz → Publish! 📚";
            }
            if (lowerQuery.includes('quiz') && lowerQuery.includes('create')) {
                return "Create quizzes in your course editor: Add questions → Set multiple choice answers → Set passing score (default 75%) → Set time/attempt limits → Save! 📝";
            }
            if (lowerQuery.includes('video') && lowerQuery.includes('upload')) {
                return "Upload videos in your course editor: Select lecture → Click 'Add Video' → Choose file → Wait for processing → Video will be available to students! 🎥";
            }
            if (lowerQuery.includes('earnings') || lowerQuery.includes('money')) {
                return "Track your earnings in the instructor dashboard! View revenue, student enrollments, and payment history. Payments are processed monthly. 💰";
            }
            if (lowerQuery.includes('student') && lowerQuery.includes('progress')) {
                return "Monitor student progress in your course dashboard! See completion rates, quiz scores, and engagement metrics for each student. 📊";
            }
        }

        // Admin-specific quick responses
        if (userContext.userRole === 'admin') {
            if (lowerQuery.includes('user') && lowerQuery.includes('manage')) {
                return "Manage users in the admin dashboard: View all users → Edit roles → Suspend/activate accounts → Monitor activity → Generate reports! 👥";
            }
            if (lowerQuery.includes('course') && lowerQuery.includes('approve')) {
                return "Approve courses in the admin panel: Review submissions → Check content quality → Approve/reject → Provide feedback → Monitor published courses! ✅";
            }
            if (lowerQuery.includes('analytics') || lowerQuery.includes('report')) {
                return "Access platform analytics: User growth → Course performance → Revenue reports → Engagement metrics → System health → Export data! 📈";
            }
            if (lowerQuery.includes('payment') || lowerQuery.includes('revenue')) {
                return "Monitor payments in admin dashboard: Track revenue → View transactions → Process refunds → Generate financial reports → Manage payouts! 💳";
            }
        }

        // General platform questions
        if (lowerQuery.includes('help') || lowerQuery.includes('support')) {
            return "I'm here to help! You can ask me about platform features, technical issues, or general questions. For urgent support, contact our team at support@learnlab.com 📧";
        }
        if (lowerQuery.includes('contact') || lowerQuery.includes('email')) {
            return "Contact us at **support@learnlab.com** or call **+026 2020202**. Our support team is available Monday-Friday 9 AM-6 PM! 📞";
        }
        if (lowerQuery.includes('password') || lowerQuery.includes('login')) {
            return "Having login issues? Try resetting your password or contact support. For security, never share your login credentials! 🔐";
        }

        return null; // Return null if no quick response found
    }
}
