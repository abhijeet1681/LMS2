import mongoose, { Document, Schema, ObjectId } from "mongoose";

export interface IQuizQuestion {
  _id?: string | ObjectId;
  question: string;
  options: string[];
  correctAnswer: number; // index of correct option
  explanation?: string;
}

export interface IQuiz extends Document {
  _id?: string | ObjectId;
  courseId: string | ObjectId;
  title: string;
  description?: string;
  questions: IQuizQuestion[];
  passingScore: number; // minimum percentage to pass
  timeLimit?: number; // in minutes
  maxAttempts: number;
  isActive: boolean;
  createdBy: string | ObjectId; // instructor who created it
  createdAt: Date;
  updatedAt: Date;
}

const QuizQuestionSchema = new Schema<IQuizQuestion>({
  question: { type: String, required: true },
  options: { type: [String], required: true, validate: [arrayLimit, 'Quiz must have at least 2 options'] },
  correctAnswer: { type: Number, required: true, min: 0 },
  explanation: { type: String }
}, { _id: true });

function arrayLimit(val: string[]) {
  return val.length >= 2 && val.length <= 6;
}

const QuizSchema = new Schema<IQuiz>(
  {
    courseId: { type: Schema.Types.ObjectId, ref: "Courses", required: true },
    title: { type: String, required: true },
    description: { type: String },
    questions: { 
      type: [QuizQuestionSchema], 
      required: true,
      validate: [questionsArrayLimit, 'Quiz must have at least 1 question']
    },
    passingScore: { type: Number, required: true, min: 0, max: 100, default: 75 },
    timeLimit: { type: Number, min: 1 }, // in minutes
    maxAttempts: { type: Number, required: true, min: 1, default: 3 },
    isActive: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

function questionsArrayLimit(val: IQuizQuestion[]) {
  return val.length >= 1;
}

// Compound index to ensure one quiz per course for now
QuizSchema.index({ courseId: 1 }, { unique: true });

const Quiz = mongoose.model<IQuiz>("Quiz", QuizSchema);

export default Quiz;
