import UserCourseProgress, { IUserCourseProgress } from "../../domain/models/CourseProgress";

export class CourseProgressRepository {
    async getUserCourseProgress (userId: string, courseId: string): Promise<IUserCourseProgress | null>{
        return await UserCourseProgress.findOne({userId, courseId}).exec();
    }

    //create progress for course
    async createProgress(userId: string, courseId: string, lectures:any[]):Promise<IUserCourseProgress> {
        const progressLectures = lectures.map((lecture) => ({
            lectureId: lecture._id,
            completedVideos: lecture.videos.map((video: any) => ({
                videoId : video._id,
                isCompleted: false,
                watchPercentage: 0,
                lastWatchedAt: undefined
            }))
        }))
        
        const newProgress = new UserCourseProgress({
            userId, 
            courseId,
            completedLectures: progressLectures
        })
        return await newProgress.save();
    }

    //update progress for a video 
    async markVideoComplete(
        userId: string,
        courseId : string, 
        lectureId : string,
        videoId : string,
    ): Promise<IUserCourseProgress | null> {
        const progress = await UserCourseProgress.findOne({userId, courseId});
        if(!progress) return null;

        const lecture = progress.completedLectures.find((l)=> l.lectureId.toString() ===  lectureId)

        if(!lecture) return null;

        const video = lecture.completedVideos.find((v) => v.videoId.toString() === videoId)
        if(video) video.isCompleted = true;

        const totalVideos = progress.completedLectures.reduce(
            (acc, l) => acc + l.completedVideos.length, 0
        )

        const completedVideos = progress.completedLectures.reduce(
            (acc, l) => acc + l.completedVideos.filter((v) => v.isCompleted).length, 0 
        )

        progress.progressPercentage = (completedVideos / totalVideos) * 100;
        return await progress.save(); 
    }

    async markCourseIncomplete (userId: string, courseId:string){
        const progress = await UserCourseProgress.findOne({userId, courseId});
        if(!progress) return null;
        progress.completedLectures.forEach((lecture) => {
            lecture.completedVideos.forEach((video) => {
                video.isCompleted = false;
            })
        })
        progress.progressPercentage = 0;
       return await progress.save();
    }

    async markCourseComplete(userId: string, courseId : string) {
        const progress = await UserCourseProgress.findOne({userId, courseId});
        if(!progress) return null;
        progress.completedLectures.forEach((lecture) => {
            lecture.completedVideos.forEach((video) => {
                video.isCompleted = true;
                video.watchPercentage = 100;
                video.lastWatchedAt = new Date();
            })
        })
        
        progress.progressPercentage = 100;
        return await progress.save();
    }

    // Update video watch progress with percentage
    async updateVideoWatchProgress(
        userId: string,
        courseId: string,
        lectureId: string,
        videoId: string,
        watchPercentage: number
    ): Promise<IUserCourseProgress | null> {
        const progress = await UserCourseProgress.findOne({userId, courseId});
        if(!progress) return null;

        const lecture = progress.completedLectures.find((l) => l.lectureId.toString() === lectureId);
        if(!lecture) return null;

        const video = lecture.completedVideos.find((v) => v.videoId.toString() === videoId);
        if(!video) return null;

        video.watchPercentage = Math.max(video.watchPercentage, watchPercentage);
        video.lastWatchedAt = new Date();
        
        // Mark as completed if 80% or more watched
        if(video.watchPercentage >= 80) {
            video.isCompleted = true;
        }

        // Recalculate progress percentage
        const totalVideos = progress.completedLectures.reduce(
            (acc, l) => acc + l.completedVideos.length, 0
        );

        const completedVideos = progress.completedLectures.reduce(
            (acc, l) => acc + l.completedVideos.filter((v) => v.isCompleted).length, 0 
        );

        progress.progressPercentage = totalVideos > 0 ? (completedVideos / totalVideos) * 100 : 0;
        return await progress.save();
    }

    // Check if user can access next video (previous video must be 80% watched)
    async canAccessNextVideo(
        userId: string,
        courseId: string,
        lectureId: string,
        videoId: string,
        lectures: any[]
    ): Promise<boolean> {
        const progress = await UserCourseProgress.findOne({userId, courseId});
        if(!progress) return false;

        // Find current video position
        let currentLectureIndex = -1;
        let currentVideoIndex = -1;
        
        for(let i = 0; i < lectures.length; i++) {
            const lecture = lectures[i];
            if(lecture._id.toString() === lectureId) {
                currentLectureIndex = i;
                for(let j = 0; j < lecture.videos.length; j++) {
                    if(lecture.videos[j]._id.toString() === videoId) {
                        currentVideoIndex = j;
                        break;
                    }
                }
                break;
            }
        }

        if(currentLectureIndex === -1 || currentVideoIndex === -1) return false;

        // If it's the first video, allow access
        if(currentLectureIndex === 0 && currentVideoIndex === 0) return true;

        // Check previous video completion
        let prevLectureIndex = currentLectureIndex;
        let prevVideoIndex = currentVideoIndex - 1;
        
        if(prevVideoIndex < 0 && currentLectureIndex > 0) {
            prevLectureIndex = currentLectureIndex - 1;
            prevVideoIndex = lectures[prevLectureIndex].videos.length - 1;
        }

        if(prevVideoIndex < 0) return true; // No previous video

        const prevLecture = progress.completedLectures.find(
            (l) => l.lectureId.toString() === lectures[prevLectureIndex]._id.toString()
        );
        
        if(!prevLecture) return false;
        
        const prevVideo = prevLecture.completedVideos.find(
            (v) => v.videoId.toString() === lectures[prevLectureIndex].videos[prevVideoIndex]._id.toString()
        );

        return prevVideo ? prevVideo.watchPercentage >= 80 : false;
    }

}
