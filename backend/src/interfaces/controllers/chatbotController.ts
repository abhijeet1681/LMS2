import { Request, Response } from 'express';
import { ChatbotUseCase } from '../../application/use-cases/chatbot/chatbotUseCase';
import { ChatbotRepository } from '../../infrastructure/repositories/chatbotRepository';
import { AIService } from '../../infrastructure/services/aiService';
import { CourseRepositoryClass } from '../../infrastructure/repositories/courseRepository';
import { CourseProgressRepository } from '../../infrastructure/repositories/courseProgressRepository';

export class ChatbotController {
    private chatbotUseCase: ChatbotUseCase;

    constructor() {
        const chatbotRepository = new ChatbotRepository();
        const aiService = new AIService();
        const courseRepository = new CourseRepositoryClass();
        const progressRepository = new CourseProgressRepository();

        this.chatbotUseCase = new ChatbotUseCase(
            chatbotRepository,
            aiService,
            courseRepository,
            progressRepository
        );
    }

    // Send a message to chatbot
    async sendMessage(req: Request, res: Response) {
        try {
            const { message, sessionId, context } = req.body;
            const userId = req.user?.id;
            const userRole = req.user?.role;

            if (!userId || !userRole) {
                return res.status(401).json({ error: 'User authentication required' });
            }

            if (!message || typeof message !== 'string') {
                return res.status(400).json({ error: 'Message is required and must be a string' });
            }

            const response = await this.chatbotUseCase.processMessage({
                userId,
                userRole: userRole as 'student' | 'instructor' | 'admin',
                message: message.trim(),
                sessionId,
                context
            });

            res.json({
                success: true,
                data: response
            });

        } catch (error) {
            console.error('Chatbot send message error:', error);
            res.status(500).json({ 
                success: false,
                error: 'Failed to send message to chatbot' 
            });
        }
    }

    // Get conversation history
    async getConversationHistory(req: Request, res: Response) {
        try {
            const { sessionId } = req.params;

            if (!sessionId) {
                return res.status(400).json({ error: 'Session ID is required' });
            }

            const messages = await this.chatbotUseCase.getConversationHistory(sessionId);

            res.json({
                success: true,
                data: messages
            });

        } catch (error) {
            console.error('Get conversation history error:', error);
            if (error.message === 'Conversation not found') {
                return res.status(404).json({ 
                    success: false,
                    error: 'Conversation not found' 
                });
            }
            res.status(500).json({ 
                success: false,
                error: 'Failed to retrieve conversation history' 
            });
        }
    }

    // End conversation
    async endConversation(req: Request, res: Response) {
        try {
            const { sessionId } = req.params;

            if (!sessionId) {
                return res.status(400).json({ error: 'Session ID is required' });
            }

            await this.chatbotUseCase.endConversation(sessionId);

            res.json({
                success: true,
                message: 'Conversation ended successfully'
            });

        } catch (error) {
            console.error('End conversation error:', error);
            res.status(500).json({ 
                success: false,
                error: 'Failed to end conversation' 
            });
        }
    }

    // Get user conversations
    async getUserConversations(req: Request, res: Response) {
        try {
            const userId = req.user?.id;
            const limit = parseInt(req.query.limit as string) || 5;

            if (!userId) {
                return res.status(401).json({ error: 'User authentication required' });
            }

            const conversations = await this.chatbotUseCase.getUserConversations(userId, limit);

            res.json({
                success: true,
                data: conversations
            });

        } catch (error) {
            console.error('Get user conversations error:', error);
            res.status(500).json({ 
                success: false,
                error: 'Failed to retrieve user conversations' 
            });
        }
    }

    // Admin only - Clean up old conversations
    async cleanupOldConversations(req: Request, res: Response) {
        try {
            const userRole = req.user?.role;

            if (userRole !== 'admin') {
                return res.status(403).json({ error: 'Admin access required' });
            }

            const daysOld = parseInt(req.query.days as string) || 30;
            const result = await this.chatbotUseCase.cleanupOldConversations(daysOld);

            res.json({
                success: true,
                message: `Cleaned up conversations older than ${daysOld} days`,
                data: result
            });

        } catch (error) {
            console.error('Cleanup conversations error:', error);
            res.status(500).json({ 
                success: false,
                error: 'Failed to cleanup old conversations' 
            });
        }
    }

    // Admin only - Get chatbot analytics
    async getChatbotAnalytics(req: Request, res: Response) {
        try {
            const userRole = req.user?.role;

            if (userRole !== 'admin') {
                return res.status(403).json({ error: 'Admin access required' });
            }

            const days = parseInt(req.query.days as string) || 30;
            const analytics = await this.chatbotUseCase.getChatbotAnalytics(days);

            res.json({
                success: true,
                data: analytics
            });

        } catch (error) {
            console.error('Get chatbot analytics error:', error);
            res.status(500).json({ 
                success: false,
                error: 'Failed to retrieve chatbot analytics' 
            });
        }
    }
}
