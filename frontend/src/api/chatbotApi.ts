import api from "@/axios/auth/authInterceptors";

export const sendChatbotMessage = async (request) => {
  try {
    const response = await api.post('/chatbot/message', request);
    return response.data.data;
  } catch (error) {
    console.error('Error sending chatbot message:', error);
    throw new Error(error.response?.data?.error || 'Failed to send message');
  }
};

// Get conversation history
export const getConversationHistory = async (sessionId) => {
  try {
    const response = await api.get(`/chatbot/conversations/${sessionId}/history`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching conversation history:', error);
    throw new Error(error.response?.data?.error || 'Failed to fetch conversation history');
  }
};

// End a conversation
export const endConversation = async (sessionId) => {
  try {
    await api.delete(`/chatbot/conversations/${sessionId}`);
  } catch (error) {
    console.error('Error ending conversation:', error);
    throw new Error(error.response?.data?.error || 'Failed to end conversation');
  }
};

// Get user conversations
export const getUserConversations = async (limit) => {
  try {
    const response = await api.get('/chatbot/conversations', {
      params: { limit }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching user conversations:', error);
    throw new Error(error.response?.data?.error || 'Failed to fetch conversations');
  }
};

// Admin only - Clean up old conversations
export const cleanupOldConversations = async (days = 30) => {
  try {
    const response = await api.delete('/chatbot/admin/cleanup', {
      params: { days }
    });
    return response.data;
  } catch (error) {
    console.error('Error cleaning up conversations:', error);
    throw new Error(error.response?.data?.error || 'Failed to cleanup conversations');
  }
};

// Admin only - Get chatbot analytics
export const getChatbotAnalytics = async (days = 30) => {
  try {
    const response = await api.get('/chatbot/admin/analytics', {
      params: { days }
    });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching chatbot analytics:', error);
    throw new Error(error.response?.data?.error || 'Failed to fetch analytics');
  }
};
