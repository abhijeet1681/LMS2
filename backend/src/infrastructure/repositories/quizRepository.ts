import Quiz, { IQuiz } from "../../domain/models/Quiz";
import QuizAttempt, { IQuizAttempt } from "../../domain/models/QuizAttempt";

export class QuizRepository {
    async createQuiz(quizData: Partial<IQuiz>): Promise<IQuiz> {
        const quiz = new Quiz(quizData);
        return await quiz.save();
    }

    async getQuizById(quizId: string): Promise<IQuiz | null> {
        return await Quiz.findById(quizId).populate('createdBy', 'firstName lastName');
    }

    async getQuizByCourseId(courseId: string): Promise<IQuiz | null> {
        return await Quiz.findOne({ courseId, isActive: true }).populate('createdBy', 'firstName lastName');
    }

    async updateQuiz(quizId: string, updateData: Partial<IQuiz>): Promise<IQuiz | null> {
        return await Quiz.findByIdAndUpdate(quizId, updateData, { new: true });
    }

    async deleteQuiz(quizId: string): Promise<IQuiz | null> {
        return await Quiz.findByIdAndUpdate(quizId, { isActive: false }, { new: true });
    }

    async getQuizzesByInstructor(instructorId: string): Promise<IQuiz[]> {
        return await Quiz.find({ createdBy: instructorId, isActive: true })
            .populate('courseId', 'title')
            .sort({ createdAt: -1 });
    }

    // Quiz Attempt methods
    async createQuizAttempt(attemptData: Partial<IQuizAttempt>): Promise<IQuizAttempt> {
        const attempt = new QuizAttempt(attemptData);
        return await attempt.save();
    }

    async getQuizAttempts(userId: string, quizId: string): Promise<IQuizAttempt[]> {
        return await QuizAttempt.find({ userId, quizId }).sort({ attemptNumber: -1 });
    }

    async getLatestQuizAttempt(userId: string, quizId: string): Promise<IQuizAttempt | null> {
        return await QuizAttempt.findOne({ userId, quizId }).sort({ attemptNumber: -1 });
    }

    async getBestQuizAttempt(userId: string, courseId: string): Promise<IQuizAttempt | null> {
        return await QuizAttempt.findOne({ userId, courseId, isPassed: true })
            .sort({ score: -1, completedAt: 1 });
    }

    async getQuizAttemptCount(userId: string, quizId: string): Promise<number> {
        return await QuizAttempt.countDocuments({ userId, quizId });
    }

    async hasPassedQuiz(userId: string, courseId: string): Promise<boolean> {
        const attempt = await QuizAttempt.findOne({ 
            userId, 
            courseId, 
            isPassed: true 
        });
        return !!attempt;
    }
}
