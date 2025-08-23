import { Router } from 'express';
import { ChatbotController } from '../controllers/chatbotController';
import authMiddleware from '../../middleware/authMiddleware';

const router = Router();
const chatbotController = new ChatbotController();

// Apply authentication to all chatbot routes
router.use(authMiddleware);

// Chat endpoints
router.post('/message', chatbotController.sendMessage.bind(chatbotController));
router.get('/conversations/:sessionId/history', chatbotController.getConversationHistory.bind(chatbotController));
router.delete('/conversations/:sessionId', chatbotController.endConversation.bind(chatbotController));
router.get('/conversations', chatbotController.getUserConversations.bind(chatbotController));

// Admin endpoints
router.delete('/admin/cleanup', chatbotController.cleanupOldConversations.bind(chatbotController));
router.get('/admin/analytics', chatbotController.getChatbotAnalytics.bind(chatbotController));

export default router;
