import { NextFunction, Request, Response } from "express";
import { QuizUseCase } from "../../../../application/use-cases/quiz/quizUseCase";
import { QuizRepository } from "../../../../infrastructure/repositories/quizRepository";
import { CertificateRepository } from "../../../../infrastructure/repositories/certificateRepository";
import { CourseRepositoryClass } from "../../../../infrastructure/repositories/courseRepository";
import { CustomError } from "../../../middlewares/errorMiddleWare";

const quizRepository = new QuizRepository();
const certificateRepository = new CertificateRepository();
const courseRepository = new CourseRepositoryClass();
const quizUseCase = new QuizUseCase(quizRepository, certificateRepository, courseRepository);

export const getQuizForCourseController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { courseId } = req.params;
        if (!courseId) throw new CustomError("Course ID is required", 400);

        const quiz = await quizUseCase.getQuizForCourse(courseId);
        if (!quiz) {
            return res.status(404).json({ 
                success: false, 
                message: "No quiz found for this course" 
            });
        }

        res.status(200).json({ 
            success: true, 
            data: quiz 
        });
    } catch (error) {
        next(error);
    }
};

export const submitQuizController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = req.user;
        if (!user) throw new CustomError("User not found", 401);

        const { courseId } = req.params;
        const { answers, timeSpent } = req.body;

        if (!courseId) throw new CustomError("Course ID is required", 400);
        if (!answers || !Array.isArray(answers)) {
            throw new CustomError("Valid answers array is required", 400);
        }
        if (typeof timeSpent !== 'number' || timeSpent < 0) {
            throw new CustomError("Valid time spent is required", 400);
        }

        const result = await quizUseCase.submitQuiz(
            user.id,
            courseId,
            answers,
            timeSpent
        );

        res.status(200).json({
            success: true,
            data: result.attempt,
            certificateGenerated: result.certificateGenerated,
            message: result.attempt.isPassed 
                ? "Congratulations! You passed the quiz!" 
                : "Quiz submitted. You can retry if attempts are remaining."
        });
    } catch (error) {
        next(error);
    }
};

export const getUserQuizAttemptsController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = req.user;
        if (!user) throw new CustomError("User not found", 401);

        const { courseId } = req.params;
        if (!courseId) throw new CustomError("Course ID is required", 400);

        const attempts = await quizUseCase.getUserQuizAttempts(user.id, courseId);

        res.status(200).json({
            success: true,
            data: attempts
        });
    } catch (error) {
        next(error);
    }
};

export const checkQuizEligibilityController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = req.user;
        if (!user) throw new CustomError("User not found", 401);

        const { courseId } = req.params;
        if (!courseId) throw new CustomError("Course ID is required", 400);

        const eligibility = await quizUseCase.canUserTakeQuiz(user.id, courseId);

        res.status(200).json({
            success: true,
            data: eligibility
        });
    } catch (error) {
        next(error);
    }
};
