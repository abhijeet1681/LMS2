import { NextFunction, Request, Response } from "express";
import { ProgressUseCase } from "../../../../application/use-cases/student/courseProgress";
import { CourseProgressRepository } from "../../../../infrastructure/repositories/courseProgressRepository";
import { CustomError } from "../../../middlewares/errorMiddleWare";
import Courses from "../../../../domain/models/Courses";

const courseProgressRepository = new CourseProgressRepository();
const progressUseCase = new ProgressUseCase(courseProgressRepository);
export const getUserProgressController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    const { courseId } = req.params;
    if (!user) throw new CustomError("User not found", 400);
    let progress = await progressUseCase.getProgress(user.id, courseId);
    if (!progress) {
      const createdProgress = await progressUseCase.initializeProgress(
        user.id,
        courseId
      );
      progress = createdProgress;
    }
    res.status(200).json({ data: progress, success: true });
  } catch (error) {
    next(error);
  }
};

export const markAsIncompletedController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    if (!user) throw new CustomError("User not found", 400);
    const { courseId } = req.params;
    if (!courseId) throw new CustomError("Course id not found", 400);
    const updateProgress = await progressUseCase.markCourseIncomplete(
      user.id,
      courseId
    );
    if (!updateProgress)
      throw new CustomError("Course progress update error", 400);
    res
      .status(200)
      .json({ success: true, message: "Course progress marked as incompleted" , data: updateProgress });
  } catch (error) {
    next(error);
  }
};
export const markAsCompletedController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = req.user;
    if (!user) throw new CustomError("User not found", 400);
    const { courseId } = req.params;
    if (!courseId) throw new CustomError("Course id not found", 400);
    const updateProgress = await progressUseCase.markCourseComplete(
      user.id,
      courseId
    );
    if (!updateProgress)
      throw new CustomError("Course progress update error", 400);
    res
      .status(200)
      .json({ success: true, message: "Course progress marked as completed", data: updateProgress });
  } catch (error) {
    next(error);
  }
};

export const completeVideoController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  const { courseId, lectureId, videoId } = req.params;
  try {
    if (!user) throw new CustomError("User not found", 400);
    const progress = await progressUseCase.completeVideo(
      user.id,
      courseId,
      lectureId,
      videoId
    );
    if (!progress) {
      throw new CustomError("Unable to update course progress", 400);
    }
    res
      .status(200)
      .json({
        success: true,
        data: progress,
        message: "Course progress updated",
      });
  } catch (error) {
    next(error);
  }
};

export const updateVideoProgressController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  const { courseId, lectureId, videoId } = req.params;
  const { watchPercentage } = req.body;
  
  try {
    if (!user) throw new CustomError("User not found", 400);
    if (typeof watchPercentage !== 'number' || watchPercentage < 0 || watchPercentage > 100) {
      throw new CustomError("Invalid watch percentage", 400);
    }
    
    const progress = await progressUseCase.updateVideoProgress(
      user.id,
      courseId,
      lectureId,
      videoId,
      watchPercentage
    );
    
    if (!progress) {
      throw new CustomError("Unable to update video progress", 400);
    }
    
    res.status(200).json({
      success: true,
      data: progress,
      message: watchPercentage >= 80 ? "Video marked as complete!" : "Video progress updated"
    });
  } catch (error) {
    next(error);
  }
};

export const checkVideoAccessController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const user = req.user;
  const { courseId, lectureId, videoId } = req.params;
  
  try {
    if (!user) throw new CustomError("User not found", 400);
    
    // Get course lectures to check access
    const courseProgressRepo = new CourseProgressRepository();
    const course = await Courses.findById(courseId);
    
    if (!course || !course.lectures) {
      throw new CustomError("Course not found", 404);
    }
    
    const canAccess = await progressUseCase.checkVideoAccess(
      user.id,
      courseId,
      lectureId,
      videoId,
      course.lectures
    );
    
    res.status(200).json({
      success: true,
      canAccess,
      message: canAccess ? "Access granted" : "Previous video must be 80% completed"
    });
  } catch (error) {
    next(error);
  }
};
