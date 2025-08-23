import { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { sendChatbotMessage, getConversationHistory, endConversation } from '../../api/chatbotApi';
import { toast } from 'react-toastify';
import { useLocation } from 'react-router-dom';
import './Chatbot.css';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  
  const { user } = useSelector((state) => state.auth);
  const location = useLocation();

  // Get current page context
  const getCurrentContext = () => {
    const path = location.pathname;
    const context = {
      currentPage: path
    };

    // Extract course ID if on course page
    const courseMatch = path.match(/\/courses\/(\w+)/);
    if (courseMatch) {
      context.courseId = courseMatch[1];
    }

    // Extract other page contexts
    if (path.includes('/profile')) {
      context.pageType = 'profile';
    } else if (path.includes('/dashboard')) {
      context.pageType = 'dashboard';
    } else if (path.includes('/wishlist')) {
      context.pageType = 'wishlist';
    }

    return context;
  };

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px';
    }
  }, [inputValue]);

  // Initialize chatbot when opened
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: getWelcomeMessage(),
        timestamp: new Date()
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen]);

  const getWelcomeMessage = () => {
    const role = user?.role;
    const context = getCurrentContext();
    
    let baseMessage = "";
    switch (role) {
      case 'student':
        baseMessage = "Hello! I'm your learning assistant. I can help you with courses, assignments, progress tracking, and answer any questions about your studies.";
        break;
      case 'instructor':
        baseMessage = "Hi! I'm here to help you with course management, student engagement, content creation, and platform features.";
        break;
      case 'admin':
        baseMessage = "Welcome! I can assist you with platform administration, user management, analytics, and system configuration.";
        break;
      default:
        baseMessage = "Hello! Welcome to LearnLab. I'm here to help guide you through our platform.";
    }

    // Add context-specific information
    if (context.courseId) {
      baseMessage += " I can see you're viewing a course - feel free to ask me about it!";
    } else if (context.pageType === 'profile') {
      baseMessage += " I can help you with profile settings and account management.";
    } else if (context.pageType === 'dashboard') {
      baseMessage += " I can help you navigate your dashboard and understand your data.";
    }

    return baseMessage + " How can I assist you today?";
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      const response = await sendChatbotMessage({
        message: userMessage.content,
        sessionId: sessionId || undefined,
        context: getCurrentContext()
      });

      // Update session ID if we got a new one
      if (!sessionId) {
        setSessionId(response.sessionId);
      }

      const botMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chatbot error:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm sorry, I'm having trouble responding right now. Please try again in a moment, or contact our support team at support@learnlab.com if the issue persists.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClose = async () => {
    setIsOpen(false);
    if (sessionId) {
      try {
        await endConversation(sessionId);
      } catch (error) {
        console.error('Error ending conversation:', error);
      }
      setSessionId(null);
    }
    setMessages([]);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Format message content with markdown-like formatting
  const formatMessageContent = (content) => {
    // Convert **text** to bold
    let formatted = content.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Convert *text* to italic
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Convert line breaks to <br>
    formatted = formatted.replace(/\n/g, '<br>');
    
    // Convert numbered lists
    formatted = formatted.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');
    
    return formatted;
  };

  // Quick action buttons for common queries
  const getQuickActions = () => {
    const role = user?.role;
    const actions = {
      student: [
        { text: "How to unlock videos?", action: "How do I unlock the next video in a course?" },
        { text: "Get certificate", action: "How do I get my course certificate?" },
        { text: "Track progress", action: "How can I track my course progress?" },
        { text: "Enroll in course", action: "How do I enroll in a course?" }
      ],
      instructor: [
        { text: "Create course", action: "How do I create a new course?" },
        { text: "Upload video", action: "How do I upload videos to my course?" },
        { text: "Create quiz", action: "How do I create a quiz for my course?" },
        { text: "View earnings", action: "How can I view my earnings?" }
      ],
      admin: [
        { text: "Manage users", action: "How do I manage users on the platform?" },
        { text: "Approve courses", action: "How do I approve instructor courses?" },
        { text: "View analytics", action: "How can I access platform analytics?" },
        { text: "System settings", action: "How do I configure system settings?" }
      ]
    };

    return actions[role] || actions.student;
  };

  const handleQuickAction = (action) => {
    setInputValue(action);
    // Auto-send the quick action
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  if (!user) return null;

  return (
    <>
      {/* Chat Button */}
      <button 
        className={`chatbot-toggle-btn ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle chatbot"
        title="Chat with LearnLab Assistant"
      >
        {isOpen ? (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"></path>
          </svg>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="chatbot-avatar">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"></path>
                </svg>
              </div>
              <div>
                <h4>LearnLab Assistant</h4>
                <span className="status-indicator">
                  <span className="status-dot"></span>
                  Online
                </span>
              </div>
            </div>
            <button 
              className="chatbot-close-btn"
              onClick={handleClose}
              aria-label="Close chatbot"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`message ${message.role === 'user' ? 'user-message' : 'bot-message'}`}
              >
                <div className="message-content">
                  <div 
                    className="message-text"
                    dangerouslySetInnerHTML={{ __html: formatMessageContent(message.content) }}
                  />
                  <span className="message-time">{formatTime(message.timestamp)}</span>
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="message bot-message">
                <div className="message-content typing">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length === 1 && (
            <div className="quick-actions">
              <p className="quick-actions-title">Quick actions:</p>
              <div className="quick-actions-buttons">
                {getQuickActions().map((action, index) => (
                  <button
                    key={index}
                    className="quick-action-btn"
                    onClick={() => handleQuickAction(action.action)}
                    disabled={isLoading}
                  >
                    {action.text}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="chatbot-input">
            <div className="input-container">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message... (Press Enter to send)"
                disabled={isLoading}
                rows={1}
                maxLength={500}
              />
              <button 
                onClick={handleSendMessage} 
                disabled={!inputValue.trim() || isLoading}
                className="send-btn"
                aria-label="Send message"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22,2 15,22 11,13 2,9"></polygon>
                </svg>
              </button>
            </div>
            <div className="input-footer">
              <span className="char-count">{inputValue.length}/500</span>
              <span className="support-info">
                Need urgent help? <a href="mailto:support@learnlab.com">Contact support</a>
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
