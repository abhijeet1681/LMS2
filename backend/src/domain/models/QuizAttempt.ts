import mongoose, { Document, Schema, ObjectId } from "mongoose";

export interface IQuizAnswer {
  questionId: string | ObjectId;
  selectedAnswer: number;
  isCorrect: boolean;
}

export interface IQuizAttempt extends Document {
  _id?: string | ObjectId;
  userId: string | ObjectId;
  courseId: string | ObjectId;
  quizId: string | ObjectId;
  answers: IQuizAnswer[];
  score: number; // percentage score
  isPassed: boolean;
  timeSpent: number; // in seconds
  attemptNumber: number;
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const QuizAnswerSchema = new Schema<IQuizAnswer>({
  questionId: { type: Schema.Types.ObjectId, required: true },
  selectedAnswer: { type: Number, required: true, min: 0 },
  isCorrect: { type: Boolean, required: true }
}, { _id: false });

const QuizAttemptSchema = new Schema<IQuizAttempt>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Courses", required: true },
    quizId: { type: Schema.Types.ObjectId, ref: "Quiz", required: true },
    answers: { type: [QuizAnswerSchema], required: true },
    score: { type: Number, required: true, min: 0, max: 100 },
    isPassed: { type: Boolean, required: true },
    timeSpent: { type: Number, required: true, min: 0 }, // in seconds
    attemptNumber: { type: Number, required: true, min: 1 },
    completedAt: { type: Date, required: true }
  },
  { timestamps: true }
);

// Compound index for user-course-quiz combinations
QuizAttemptSchema.index({ userId: 1, courseId: 1, quizId: 1, attemptNumber: 1 }, { unique: true });
QuizAttemptSchema.index({ userId: 1, courseId: 1 });

const QuizAttempt = mongoose.model<IQuizAttempt>("QuizAttempt", QuizAttemptSchema);

export default QuizAttempt;
