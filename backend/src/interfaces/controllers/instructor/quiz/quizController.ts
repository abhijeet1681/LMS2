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

export const createQuizController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = req.user;
        if (!user) throw new CustomError("User not found", 401);

        const quizData = req.body;
        if (!quizData.courseId) throw new CustomError("Course ID is required", 400);

        const quiz = await quizUseCase.createQuiz(user.id, quizData);

        res.status(201).json({
            success: true,
            data: quiz,
            message: "Quiz created successfully"
        });
    } catch (error) {
        next(error);
    }
};

export const updateQuizController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = req.user;
        const { quizId } = req.params;
        const updateData = req.body;

        if (!user) throw new CustomError("User not found", 401);
        if (!quizId) throw new CustomError("Quiz ID is required", 400);

        const updatedQuiz = await quizUseCase.updateQuiz(user.id, quizId, updateData);

        res.status(200).json({
            success: true,
            data: updatedQuiz,
            message: "Quiz updated successfully"
        });
    } catch (error) {
        next(error);
    }
};

export const getInstructorQuizzesController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = req.user;
        if (!user) throw new CustomError("User not found", 401);

        const quizzes = await quizUseCase.getInstructorQuizzes(user.id);

        res.status(200).json({
            success: true,
            data: quizzes
        });
    } catch (error) {
        next(error);
    }
};

export const getQuizController = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const user = req.user;
        const { quizId } = req.params;

        if (!user) throw new CustomError("User not found", 401);
        if (!quizId) throw new CustomError("Quiz ID is required", 400);

        const quiz = await quizRepository.getQuizById(quizId);
        if (!quiz) {
            throw new CustomError("Quiz not found", 404);
        }

        // Check if user owns the quiz
        if (quiz.createdBy.toString() !== user.id) {
            throw new CustomError("Unauthorized access to quiz", 403);
        }

        res.status(200).json({
            success: true,
            data: quiz
        });
    } catch (error) {
        next(error);
    }
};
