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
            // Get or create conversation
            const conversation = await this.chatbotRepository.getOrCreateConversation(
                request.userId,
                request.userRole,
                request.sessionId
            );

            // Add user message to conversation
            const userMessage: IChatbotMessage = {
                role: 'user',
                content: request.message,
                timestamp: new Date()
            };

            await this.chatbotRepository.addMessage(conversation.sessionId, userMessage);

            // Get user context for AI
            const userContext = await this.buildUserContext(request, conversation.context);

            // Try quick response first
            let aiResponse = this.aiService.getQuickResponse(request.message, userContext);

            // If no quick response, use AI
            if (!aiResponse) {
                const messages = [...conversation.messages, userMessage];
                aiResponse = await this.aiService.generateResponse(messages, userContext);
            }

            // Add AI response to conversation
            const assistantMessage: IChatbotMessage = {
                role: 'assistant',
                content: aiResponse,
                timestamp: new Date()
            };

            await this.chatbotRepository.addMessage(conversation.sessionId, assistantMessage);

            // Update context if needed
            if (request.context) {
                await this.chatbotRepository.updateContext(
                    conversation.sessionId,
                    { ...conversation.context, ...request.context }
                );
            }

            return {
                sessionId: conversation.sessionId,
                response: aiResponse,
                context: conversation.context
            };

        } catch (error) {
            console.error('Chatbot processing error:', error);
            throw new Error('Failed to process message');
        }
    }

    async getConversationHistory(sessionId: string) {
        const conversation = await this.chatbotRepository.getConversation(sessionId);
        if (!conversation) {
            throw new Error('Conversation not found');
        }
        return conversation.messages;
    }

    async endConversation(sessionId: string) {
        return await this.chatbotRepository.endConversation(sessionId);
    }

    async getUserConversations(userId: string, limit: number = 5) {
        return await this.chatbotRepository.getUserConversations(userId, limit);
    }

    private async buildUserContext(request: ChatRequest, existingContext?: any) {
        const context = {
            userId: request.userId,
            userRole: request.userRole,
            courseId: request.context?.courseId || existingContext?.courseId,
            currentPage: request.context?.currentPage || existingContext?.currentPage,
            userProgress: null
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
                // Progress not available, continue without it
            }
        }

        return context;
    }

    // Admin function to clean up old conversations
    async cleanupOldConversations(daysOld: number = 30) {
        return await this.chatbotRepository.cleanupOldConversations(daysOld);
    }

    // Get chatbot analytics
    async getChatbotAnalytics(days: number = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);

        // This would require additional aggregation methods in the repository
        // For now, return basic info
        return {
            message: 'Analytics feature to be implemented',
            timeframe: `${days} days`
        };
    }
}
