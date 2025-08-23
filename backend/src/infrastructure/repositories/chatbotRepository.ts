import ChatbotConversation, { IChatbotConversation, IChatbotMessage } from "../../domain/models/Chatbot";
import { v4 as uuidv4 } from 'uuid';

export class ChatbotRepository {
    async createConversation(
        userId: string, 
        userRole: 'student' | 'instructor' | 'admin',
        context?: any
    ): Promise<IChatbotConversation> {
        const sessionId = uuidv4();
        const conversation = new ChatbotConversation({
            userId,
            sessionId,
            userRole,
            messages: [],
            context: context || {}
        });
        return await conversation.save();
    }

    async getConversation(sessionId: string): Promise<IChatbotConversation | null> {
        return await ChatbotConversation.findOne({ sessionId, isActive: true });
    }

    async getOrCreateConversation(
        userId: string,
        userRole: 'student' | 'instructor' | 'admin',
        sessionId?: string
    ): Promise<IChatbotConversation> {
        if (sessionId) {
            const existing = await this.getConversation(sessionId);
            if (existing) {
                return existing;
            }
        }

        // Get the most recent active conversation for this user
        const recentConversation = await ChatbotConversation.findOne({
            userId,
            isActive: true
        }).sort({ lastInteraction: -1 });

        if (recentConversation && this.isRecentInteraction(recentConversation.lastInteraction)) {
            return recentConversation;
        }

        // Create new conversation
        return await this.createConversation(userId, userRole);
    }

    async addMessage(sessionId: string, message: IChatbotMessage): Promise<IChatbotConversation | null> {
        return await ChatbotConversation.findOneAndUpdate(
            { sessionId, isActive: true },
            { 
                $push: { messages: message },
                $set: { lastInteraction: new Date() }
            },
            { new: true }
        );
    }

    async updateContext(sessionId: string, context: any): Promise<IChatbotConversation | null> {
        return await ChatbotConversation.findOneAndUpdate(
            { sessionId, isActive: true },
            { 
                $set: { 
                    context: context,
                    lastInteraction: new Date()
                }
            },
            { new: true }
        );
    }

    async getUserConversations(userId: string, limit: number = 10): Promise<IChatbotConversation[]> {
        return await ChatbotConversation.find({ userId, isActive: true })
            .sort({ lastInteraction: -1 })
            .limit(limit);
    }

    async endConversation(sessionId: string): Promise<IChatbotConversation | null> {
        return await ChatbotConversation.findOneAndUpdate(
            { sessionId },
            { $set: { isActive: false } },
            { new: true }
        );
    }

    async cleanupOldConversations(daysOld: number = 30): Promise<void> {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - daysOld);
        
        await ChatbotConversation.updateMany(
            { lastInteraction: { $lt: cutoffDate } },
            { $set: { isActive: false } }
        );
    }

    private isRecentInteraction(lastInteraction: Date): boolean {
        const now = new Date();
        const diffInMinutes = (now.getTime() - lastInteraction.getTime()) / (1000 * 60);
        return diffInMinutes < 30; // Consider conversation recent if within 30 minutes
    }
}
