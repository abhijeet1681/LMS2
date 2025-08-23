import mongoose, { Document, Schema, ObjectId } from "mongoose";

export interface IChatbotMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface IChatbotConversation extends Document {
  _id?: string | ObjectId;
  userId: string | ObjectId;
  sessionId: string;
  userRole: 'student' | 'instructor' | 'admin';
  messages: IChatbotMessage[];
  isActive: boolean;
  lastInteraction: Date;
  context?: {
    courseId?: string;
    currentPage?: string;
    userProgress?: any;
    lastQuery?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const ChatbotMessageSchema = new Schema<IChatbotMessage>({
  role: { 
    type: String, 
    enum: ['user', 'assistant', 'system'], 
    required: true 
  },
  content: { 
    type: String, 
    required: true 
  },
  timestamp: { 
    type: Date, 
    default: Date.now 
  }
}, { _id: false });

const ChatbotConversationSchema = new Schema<IChatbotConversation>(
  {
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: "User", 
      required: true 
    },
    sessionId: { 
      type: String, 
      required: true,
      unique: true
    },
    userRole: { 
      type: String, 
      enum: ['student', 'instructor', 'admin'], 
      required: true 
    },
    messages: { 
      type: [ChatbotMessageSchema], 
      default: [] 
    },
    isActive: { 
      type: Boolean, 
      default: true 
    },
    lastInteraction: { 
      type: Date, 
      default: Date.now 
    },
    context: {
      courseId: { type: String },
      currentPage: { type: String },
      userProgress: { type: Schema.Types.Mixed },
      lastQuery: { type: String }
    }
  },
  { timestamps: true }
);

// Index for performance
ChatbotConversationSchema.index({ userId: 1, sessionId: 1 });
ChatbotConversationSchema.index({ isActive: 1, lastInteraction: -1 });

const ChatbotConversation = mongoose.model<IChatbotConversation>(
  "ChatbotConversation", 
  ChatbotConversationSchema
);

export default ChatbotConversation;
