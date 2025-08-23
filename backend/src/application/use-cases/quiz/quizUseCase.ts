import { QuizRepository } from "../../../infrastructure/repositories/quizRepository";
import { CertificateRepository } from "../../../infrastructure/repositories/certificateRepository";
import { CourseRepository } from "../../../infrastructure/repositories/courseRepository";
import { IQuiz } from "../../../domain/models/Quiz";
import { IQuizAttempt, IQuizAnswer } from "../../../domain/models/QuizAttempt";
import { CustomError } from "../../../interfaces/middlewares/errorMiddleWare";
import User from "../../../domain/models/User";

export class QuizUseCase {
    constructor(
        private quizRepository: QuizRepository,
        private certificateRepository: CertificateRepository,
        private courseRepository: CourseRepository
    ) {}

    // Instructor methods
    async createQuiz(instructorId: string, quizData: Partial<IQuiz>): Promise<IQuiz> {
        const course = await this.courseRepository.getCourseById(quizData.courseId as string);
        if (!course) {
            throw new CustomError("Course not found", 404);
        }

        if (course.instructor.toString() !== instructorId) {
            throw new CustomError("Unauthorized: You can only create quizzes for your own courses", 403);
        }

        // Check if quiz already exists for this course
        const existingQuiz = await this.quizRepository.getQuizByCourseId(course._id as string);
        if (existingQuiz) {
            throw new CustomError("A quiz already exists for this course", 400);
        }

        return await this.quizRepository.createQuiz({
            ...quizData,
            createdBy: instructorId
        });
    }

    async updateQuiz(instructorId: string, quizId: string, updateData: Partial<IQuiz>): Promise<IQuiz> {
        const quiz = await this.quizRepository.getQuizById(quizId);
        if (!quiz) {
            throw new CustomError("Quiz not found", 404);
        }

        if (quiz.createdBy.toString() !== instructorId) {
            throw new CustomError("Unauthorized: You can only update your own quizzes", 403);
        }

        const updatedQuiz = await this.quizRepository.updateQuiz(quizId, updateData);
        if (!updatedQuiz) {
            throw new CustomError("Failed to update quiz", 500);
        }

        return updatedQuiz;
    }

    async getInstructorQuizzes(instructorId: string): Promise<IQuiz[]> {
        return await this.quizRepository.getQuizzesByInstructor(instructorId);
    }

    // Student methods
    async getQuizForCourse(courseId: string): Promise<IQuiz | null> {
        const quiz = await this.quizRepository.getQuizByCourseId(courseId);
        if (!quiz) return null;

        // Remove correct answers from questions for students
        const studentQuiz = {
            ...quiz.toObject(),
            questions: quiz.questions.map(q => ({
                _id: q._id,
                question: q.question,
                options: q.options
            }))
        };

        return studentQuiz as IQuiz;
    }

    async submitQuiz(
        userId: string,
        courseId: string,
        answers: { questionId: string; selectedAnswer: number }[],
        timeSpent: number
    ): Promise<{ attempt: IQuizAttempt; certificateGenerated: boolean }> {
        const quiz = await this.quizRepository.getQuizByCourseId(courseId);
        if (!quiz) {
            throw new CustomError("Quiz not found for this course", 404);
        }

        // Check attempt limit
        const attemptCount = await this.quizRepository.getQuizAttemptCount(userId, quiz._id as string);
        if (attemptCount >= quiz.maxAttempts) {
            throw new CustomError(`Maximum attempts (${quiz.maxAttempts}) reached for this quiz`, 400);
        }

        // Validate answers
        const quizAnswers: IQuizAnswer[] = answers.map(answer => {
            const question = quiz.questions.find(q => q._id?.toString() === answer.questionId);
            if (!question) {
                throw new CustomError(`Invalid question ID: ${answer.questionId}`, 400);
            }

            return {
                questionId: answer.questionId,
                selectedAnswer: answer.selectedAnswer,
                isCorrect: question.correctAnswer === answer.selectedAnswer
            };
        });

        // Calculate score
        const correctAnswers = quizAnswers.filter(a => a.isCorrect).length;
        const score = Math.round((correctAnswers / quiz.questions.length) * 100);
        const isPassed = score >= quiz.passingScore;

        // Create quiz attempt
        const attempt = await this.quizRepository.createQuizAttempt({
            userId,
            courseId,
            quizId: quiz._id,
            answers: quizAnswers,
            score,
            isPassed,
            timeSpent,
            attemptNumber: attemptCount + 1,
            completedAt: new Date()
        });

        let certificateGenerated = false;

        // Generate certificate if passed and doesn't already exist
        if (isPassed) {
            const existingCertificate = await this.certificateRepository.getCertificateByUserAndCourse(userId, courseId);
            
            if (!existingCertificate) {
                const user = await User.findById(userId);
                const course = await this.courseRepository.getCourseById(courseId);
                
                if (user && course) {
                    const instructorInfo = course.instructor as any;
                    await this.certificateRepository.createCertificate({
                        userId,
                        courseId,
                        studentName: `${user.firstName} ${user.lastName}`,
                        courseName: course.title,
                        instructorName: `${instructorInfo.firstName} ${instructorInfo.lastName}`,
                        completionDate: new Date(),
                        finalScore: score
                    });
                    certificateGenerated = true;
                }
            }
        }

        return { attempt, certificateGenerated };
    }

    async getUserQuizAttempts(userId: string, courseId: string): Promise<IQuizAttempt[]> {
        const quiz = await this.quizRepository.getQuizByCourseId(courseId);
        if (!quiz) return [];

        return await this.quizRepository.getQuizAttempts(userId, quiz._id as string);
    }

    async canUserTakeQuiz(userId: string, courseId: string): Promise<{
        canTake: boolean;
        attemptsUsed: number;
        maxAttempts: number;
        hasPassedBefore: boolean;
    }> {
        const quiz = await this.quizRepository.getQuizByCourseId(courseId);
        if (!quiz) {
            throw new CustomError("Quiz not found for this course", 404);
        }

        const attemptsUsed = await this.quizRepository.getQuizAttemptCount(userId, quiz._id as string);
        const hasPassedBefore = await this.quizRepository.hasPassedQuiz(userId, courseId);

        return {
            canTake: attemptsUsed < quiz.maxAttempts && !hasPassedBefore,
            attemptsUsed,
            maxAttempts: quiz.maxAttempts,
            hasPassedBefore
        };
    }
}
