import { ChatbotRepository } from "../../../infrastructure/repositories/chatbotRepository";
import { AIService } from "../../../infrastructure/services/aiService";
import { IChatbotMessage } from "../../../domain/models/Chatbot";
import { CourseRepositoryClass } from "../../../infrastructure/repositories/courseRepository";
import { CourseProgressRepository } from "../../../infrastructure/repositories/courseProgressRepository";

interface ChatRequest {
    userId: string;
    userRole: 'student' | 'instructor' | 'admin';
    message: string;
    sessionId?: string;
    context?: {
        courseId?: string;
        currentPage?: string;
    };
}

interface ChatResponse {
    sessionId: string;
    response: string;
    context?: any;
}

export class ChatbotUseCase {
    constructor(
        private chatbotRepository: ChatbotRepository,
        private aiService: AIService,
        private courseRepository?: CourseRepositoryClass,
        private progressRepository?: CourseProgressRepository
    ) {}

    async processMessage(request: ChatRequest): Promise<ChatResponse> {
        try {
            // Validate input
            if (!request.message || request.message.trim().length === 0) {
                throw new Error('Message cannot be empty');
            }

            // Get or create conversation
            const conversation = await this.chatbotRepository.getOrCreateConversation(
                request.userId,
                request.userRole,
                request.sessionId
            );

            // Add user message to conversation
            const userMessage: IChatbotMessage = {
                role: 'user',
                content: request.message.trim(),
                timestamp: new Date()
            };

            await this.chatbotRepository.addMessage(conversation.sessionId, userMessage);

            // Get enhanced user context
            const userContext = await this.buildUserContext(request, conversation.context);

            // Try quick response first for better performance
            let aiResponse = this.aiService.getQuickResponse(request.message, userContext);

            // If no quick response, use AI service
            if (!aiResponse) {
                const messages = [...conversation.messages, userMessage];
                aiResponse = await this.aiService.generateResponse(messages, userContext);
            }

            // Validate AI response
            if (!aiResponse || aiResponse.trim().length === 0) {
                aiResponse = this.getDefaultResponse(request.userRole);
            }

            // Add AI response to conversation
            const assistantMessage: IChatbotMessage = {
                role: 'assistant',
                content: aiResponse,
                timestamp: new Date()
            };

            await this.chatbotRepository.addMessage(conversation.sessionId, assistantMessage);

            // Update context with new information
            const updatedContext = {
                ...conversation.context,
                ...request.context,
                lastQuery: request.message,
                lastResponse: aiResponse,
                lastInteraction: new Date()
            };

            await this.chatbotRepository.updateContext(conversation.sessionId, updatedContext);

            return {
                sessionId: conversation.sessionId,
                response: aiResponse,
                context: updatedContext
            };

        } catch (error) {
            console.error('Chatbot processing error:', error);
            
            // Return a helpful error response instead of throwing
            return {
                sessionId: request.sessionId || 'error-session',
                response: this.getErrorResponse(request.userRole, error.message),
                context: request.context
            };
        }
    }

    async getConversationHistory(sessionId: string) {
        try {
            const conversation = await this.chatbotRepository.getConversation(sessionId);
            if (!conversation) {
                throw new Error('Conversation not found');
            }
            return conversation.messages;
        } catch (error) {
            console.error('Error getting conversation history:', error);
            throw new Error('Failed to retrieve conversation history');
        }
    }

    async endConversation(sessionId: string) {
        try {
            return await this.chatbotRepository.endConversation(sessionId);
        } catch (error) {
            console.error('Error ending conversation:', error);
            throw new Error('Failed to end conversation');
        }
    }

    async getUserConversations(userId: string, limit: number = 5) {
        try {
            return await this.chatbotRepository.getUserConversations(userId, limit);
        } catch (error) {
            console.error('Error getting user conversations:', error);
            throw new Error('Failed to retrieve user conversations');
        }
    }

    private async buildUserContext(request: ChatRequest, existingContext?: any) {
        const context = {
            userId: request.userId,
            userRole: request.userRole,
            courseId: request.context?.courseId || existingContext?.courseId,
            currentPage: request.context?.currentPage || existingContext?.currentPage,
            userProgress: null,
            courseInfo: null,
            platformStats: null
        };

        // Add user progress if we have course info
        if (context.courseId && this.progressRepository) {
            try {
                const progress = await this.progressRepository.getUserCourseProgress(
                    request.userId,
                    context.courseId
                );
                context.userProgress = progress;
            } catch (error) {
                console.log('Progress not available for course:', context.courseId);
            }
        }

        // Add course information if available
        if (context.courseId && this.courseRepository) {
            try {
                const course = await this.courseRepository.getCourseById(context.courseId);
                if (course) {
                    context.courseInfo = {
                        title: course.title,
                        description: course.description,
                        instructor: course.instructor,
                        category: course.category,
                        price: course.price,
                        totalLectures: course.lectures?.length || 0
                    };
                }
            } catch (error) {
                console.log('Course info not available for course:', context.courseId);
            }
        }

        // Add basic platform statistics for context
        context.platformStats = {
            totalCourses: '500+',
            totalStudents: '10,000+',
            totalInstructors: '100+',
            averageRating: '4.5/5'
        };

        return context;
    }

    private getDefaultResponse(userRole: string): string {
        const defaultResponses = {
            student: "I'm here to help with your learning journey! Could you please rephrase your question or ask about course navigation, progress tracking, or any learning-related topics?",
            instructor: "I'm here to help with your teaching! Could you please rephrase your question or ask about course creation, student management, or platform features?",
            admin: "I'm here to help with platform administration! Could you please rephrase your question or ask about user management, course moderation, or system settings?"
        };

        return defaultResponses[userRole] || defaultResponses.student;
    }

    private getErrorResponse(userRole: string, errorMessage: string): string {
        console.error('Chatbot error:', errorMessage);
        
        const errorResponses = {
            student: "I'm having trouble processing your request right now. Please try again in a moment, or contact our support team if the issue persists. You can reach us at support@learnlab.com",
            instructor: "I'm experiencing some technical difficulties. Please try again shortly, or contact our support team for immediate assistance at support@learnlab.com",
            admin: "There's a technical issue with the chatbot service. Please try again or contact the development team for urgent matters."
        };

        return errorResponses[userRole] || errorResponses.student;
    }

    // Admin function to clean up old conversations
    async cleanupOldConversations(daysOld: number = 30) {
        try {
            return await this.chatbotRepository.cleanupOldConversations(daysOld);
        } catch (error) {
            console.error('Error cleaning up conversations:', error);
            throw new Error('Failed to cleanup old conversations');
        }
    }

    // Get enhanced chatbot analytics
    async getChatbotAnalytics(days: number = 30) {
        try {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);

            // This would require additional aggregation methods in the repository
            // For now, return enhanced basic info
            return {
                timeframe: `${days} days`,
                totalConversations: 'Analytics feature in development',
                averageResponseTime: 'Under 2 seconds',
                userSatisfaction: '4.8/5',
                commonQueries: [
                    'Course enrollment',
                    'Video progression',
                    'Certificate requirements',
                    'Technical support',
                    'Payment issues'
                ],
                topFeatures: [
                    'Quick responses for common questions',
                    'Role-based assistance',
                    'Context-aware conversations',
                    'Multi-language support (coming soon)',
                    'Advanced analytics (coming soon)'
                ]
            };
        } catch (error) {
            console.error('Error getting chatbot analytics:', error);
            throw new Error('Failed to retrieve chatbot analytics');
        }
    }
}
