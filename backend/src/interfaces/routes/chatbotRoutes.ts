import { Router } from 'express';
import { ChatbotController } from '../controllers/chatbotController';
import { isAuthenticated, authorizeRole } from '../middlewares/authMiddleware';

const router = Router();
const chatbotController = new ChatbotController();

// Apply authentication to all chatbot routes
router.use(isAuthenticated);

// Chat endpoints
router.post('/message', chatbotController.sendMessage.bind(chatbotController));
router.get('/conversations/:sessionId/history', chatbotController.getConversationHistory.bind(chatbotController));
router.delete('/conversations/:sessionId', chatbotController.endConversation.bind(chatbotController));
router.get('/conversations', chatbotController.getUserConversations.bind(chatbotController));

// Admin endpoints
router.delete('/admin/cleanup', authorizeRole(['admin']), chatbotController.cleanupOldConversations.bind(chatbotController));
router.get('/admin/analytics', authorizeRole(['admin']), chatbotController.getChatbotAnalytics.bind(chatbotController));

export default router;
