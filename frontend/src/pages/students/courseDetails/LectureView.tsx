import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import { IoIosArrowBack } from "react-icons/io";
import ReactPlayer from "react-player";
import { IoLogoYoutube } from "react-icons/io5";
import { CheckCircle2, ChevronDown, Lock, PlayCircle } from "lucide-react";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { useAppSelector } from "@/app/hooks";
import { ICourses, IVideo } from "@/types/course";
import {
  getCourseByIdUserApi,
  getCourseProgressApi,
  markAsCompletedApi,
  markAsIncompletedApi,
  markVideoCompleteApi,
  updateVideoProgressApi,
  checkVideoAccessApi,
  getQuizForCourseApi,
} from "@/api/student";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { getVideoUrl } from "@/utils/getVideoUrl";
import { Progress } from "@/components/ui/progress";
import LoadingScreen from "@/components/common/Loading/LoadingScreen";
import { Quiz } from "@/components/Quiz/Quiz";

interface ProgressVideo {
  videoId: string;
  isCompleted: boolean;
  watchPercentage: number;
  lastWatchedAt?: string;
}

interface ProgressLecture {
  lectureId: string;
  completedVideos: ProgressVideo[];
}

interface CourseProgress {
  courseId: string;
  userId: string;
  completedLectures: ProgressLecture[];
  progressPercentage: number;
}

interface ISelectedVideo {
  video: IVideo;
  lectureId: string;
  lectureTitle: string;
  lectureDescription: string;
}
const LectureView: React.FC = () => {
  const { id } = useParams();
  const [course, setCourse] = useState<ICourses | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAppSelector((state) => state.auth);
  const [progress, setProgress] = useState<CourseProgress | null>(null);
  const [userCoursePurchaseStatus, setUserCoursePurchaseStatus] =
    useState(false);
  const [selectedVideo, setSelectedVideo] = useState<ISelectedVideo | null>(
    null
  );
  const [showQuizButton, setShowQuizButton] = useState(false);
  const [videoAccessRestricted, setVideoAccessRestricted] = useState<Record<string, boolean>>({});
  const [showQuiz, setShowQuiz] = useState(false);
  const [playerRef, setPlayerRef] = useState<any>(null);
  const [lastProgressUpdate, setLastProgressUpdate] = useState(0);
  const navigate = useNavigate();

  if (!id) {
    navigate(-1);
    toast.error("Course details not found");
    return;
  }
  useEffect(() => {
    const fetchCourse = async () => {
      if (!id) {
        throw new Error("Course id not found");
      }
      try {
        setLoading(true);
        let userId = null;
        if (user?._id) {
          userId = user._id;
        }
        const response = await getCourseByIdUserApi(id, userId);
        setCourse(response.data);
        setUserCoursePurchaseStatus(response.purchaseStatus);
        if (response.data.lectures?.[0].videos?.[0]) {
          setSelectedVideo({
            video: response.data.lectures[0].videos[0],
            lectureId: response.data.lectures[0]._id,
            lectureTitle: response.data.lectures[0].title,
            lectureDescription: response.data.lectures[0].description,
          });
        }
      } catch (error: any) {
        toast.error(error.message || "failed to fetch course");
        navigate("/home");
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, []);

  useEffect(() => {
    const getProgress = async () => {
      try {
        const response = await getCourseProgressApi(id!);
        setProgress(response.data);
        
        // Check if quiz should be shown (100% course completion)
        if (response.data.progressPercentage === 100) {
          try {
            const quizResponse = await getQuizForCourseApi(id!);
            setShowQuizButton(true);
          } catch (error) {
            // Quiz doesn't exist or other error
            setShowQuizButton(false);
          }
        }
      } catch (error) {
        console.error("Failed to fetch progress", error);
      }
    };
    getProgress();
  }, [id]);

  const handleMarkVideoComplete = async (
    lectureId: string,
    videoId: string,
    videoTitle: string
  ) => {
    try {
      await markVideoCompleteApi(id!, lectureId, videoId);
      toast.success(`Video ${videoTitle} marked as complete!`);

      // Update progress state locally
      setProgress((prev) => {
        if (!prev) return null;

        const updatedLectures = prev.completedLectures.map((lecture) => {
          if (lecture.lectureId === lectureId) {
            return {
              ...lecture,
              completedVideos: lecture.completedVideos.map((video) =>
                video.videoId === videoId
                  ? { ...video, isCompleted: true }
                  : video
              ),
            };
          }
          return lecture;
        });

        // Calculate progress percentage
        const totalVideos = course?.lectures?.reduce(
          (acc, lecture) => acc + lecture.videos.length,
          0
        );
        const completedVideos = updatedLectures.reduce(
          (acc, lecture) =>
            acc +
            lecture.completedVideos.filter((video) => video.isCompleted).length,
          0
        );

        const progressPercentage =
          totalVideos && completedVideos
            ? (completedVideos / totalVideos) * 100
            : 0;

        return {
          ...prev,
          completedLectures: updatedLectures,
          progressPercentage,
        };
      });
    } catch (error) {
      console.error("Failed to mark video complete:", error);
      toast.error("Error marking video as complete.");
    }
  };

  const handleMarkAsIncompleted = async () => {
    if (!id) return "course id not found";
    try {
      const response = await markAsIncompletedApi(id);
      toast.success(response.message);
      setProgress(response.data);
    } catch (error) {
      console.error("failed to mark progress as incompleted", error);
    }
  };
  const handleMarkAsCompleted = async () => {
    if (!id) return "course id not found";
    try {
      const response = await markAsCompletedApi(id);
      toast.success(response.message);
      setProgress(response.data);
    } catch (error) {
      console.error("failed to mark progress as completed", error);
    }
  };

  // Handle video progress updates during playback
  const handleVideoProgress = async (progressData: any) => {
    if (!selectedVideo || !id) return;
    
    const watchPercentage = Math.floor((progressData.played || 0) * 100);
    
    // Only update progress every 10% to avoid excessive API calls
    if (watchPercentage > lastProgressUpdate && watchPercentage % 10 === 0) {
      setLastProgressUpdate(watchPercentage);
      
      try {
        const response = await updateVideoProgressApi(
          id,
          selectedVideo.lectureId,
          selectedVideo.video._id,
          watchPercentage
        );
        
        // Update local progress state
        setProgress(response.data);
        
        if (watchPercentage >= 80) {
          toast.success(`Video is ${watchPercentage}% complete!`);
        }
      } catch (error) {
        console.error('Failed to update video progress:', error);
      }
    }
  };

  // Check if user can access a video based on 80% rule
  const canAccessVideo = (videoId: string, lectureId: string): boolean => {
    if (!progress || !course) return false;
    
    // Find the position of current video
    let videoIndex = -1;
    let lectureIndex = -1;
    
    for (let i = 0; i < course.lectures.length; i++) {
      const lecture = course.lectures[i];
      if (lecture._id === lectureId) {
        lectureIndex = i;
        for (let j = 0; j < lecture.videos.length; j++) {
          if (lecture.videos[j]._id === videoId) {
            videoIndex = j;
            break;
          }
        }
        break;
      }
    }
    
    // First video is always accessible
    if (lectureIndex === 0 && videoIndex === 0) return true;
    
    // Find previous video
    let prevLectureIndex = lectureIndex;
    let prevVideoIndex = videoIndex - 1;
    
    if (prevVideoIndex < 0 && lectureIndex > 0) {
      prevLectureIndex = lectureIndex - 1;
      prevVideoIndex = course.lectures[prevLectureIndex].videos.length - 1;
    }
    
    if (prevVideoIndex < 0) return true; // No previous video
    
    // Check if previous video has 80% completion
    const prevLecture = progress.completedLectures.find(
      l => l.lectureId === course.lectures[prevLectureIndex]._id
    );
    
    if (!prevLecture) return false;
    
    const prevVideoProgress = prevLecture.completedVideos.find(
      v => v.videoId === course.lectures[prevLectureIndex].videos[prevVideoIndex]._id
    );
    
    return prevVideoProgress ? prevVideoProgress.watchPercentage >= 80 : false;
  };

  const handleVideoSelect = async (video: IVideo, lectureId: string, lectureTitle: string, lectureDescription: string) => {
    // Check access if course is purchased
    if (userCoursePurchaseStatus) {
      const hasAccess = canAccessVideo(video._id, lectureId);
      if (!hasAccess) {
        toast.error('You must watch at least 80% of the previous video to unlock this one.');
        return;
      }
    }
    
    // Reset progress tracking for new video
    setLastProgressUpdate(0);
    
    setSelectedVideo({
      video,
      lectureId,
      lectureTitle,
      lectureDescription
    });
  };

  const [openLecture, setOpenLecture] = useState<string | null>(null);

  const toggleLecture = (lectureId: string) => {
    setOpenLecture((prev) => (prev === lectureId ? null : lectureId));
  };

  const videoUrl = selectedVideo
    ? getVideoUrl(id, selectedVideo.video._id)
    : "";

  return loading ? (
    <LoadingScreen />
  ) : (
    <>
      {/* Quiz Modal */}
      {showQuiz && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="relative w-full max-w-4xl mx-4">
            <Quiz
              courseId={id!}
              onClose={() => setShowQuiz(false)}
              onCertificateGenerated={() => {
                toast.success('Certificate generated! Check your certificates page.');
                setShowQuiz(false);
              }}
            />
          </div>
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row min-h-[90vh] max-w-7xl place-self-center w-full ">
        <div className="flex w-full sm:w-2/3 lg:w-3/4 h-full order-2 sm:order-1 pb-10">
          <div className="flex flex-col w-full">
          <div className="flex justify-between items-center bg-blue-500 dark:bg-blue-700 w-full text-white gap-2 p-2 h-16 max-h-16">
            <div className="flex items-center gap-2">
              <div
                className="hover:bg-slate-50 hover:bg-opacity-50 rounded-full p-2 transition-all duration-300"
                onClick={() => navigate(-1)}
              >
                <IoIosArrowBack className="text-xl" />
              </div>
              <div>
                <h1 className="text-lg font-medium">
                  {course?.title || "course title"}
                </h1>
                <h2 className="font-light text-xs">
                  <span>Your progress : </span>
                  {progress?.progressPercentage?.toFixed(2) || 0} %
                </h2>
                <Progress
                  className="bg-white"
                  value={
                    progress?.progressPercentage
                      ? parseFloat(progress.progressPercentage.toFixed(2))
                      : 0
                  }
                />
              </div>
            </div>
            {progress?.progressPercentage == 100 ? (
              <Button
                className="bg-white  dark:bg-slate-800 dark:hover:bg-slate-700 hover:bg-slate-100 hover:scale-105 transition-all duration-300 text-blue-500 dark:text-gray-100"
                onClick={() => handleMarkAsIncompleted()}
              >
                Mark as incomplete
              </Button>
            ) : (
              <Button
                className="bg-white dark:bg-slate-800 dark:hover:bg-slate-700 hover:bg-slate-100 hover:scale-105 transition-all duration-300 text-blue-500 dark:text-gray-100"
                onClick={() => handleMarkAsCompleted()}
              >
                Mark as complete
              </Button>
            )}
          </div>
          <div className="w-full h-max flex flex-col gap-2">
            <div className="player-wrapper">
              <ReactPlayer
                // Disable download button
                config={{
                  file: { attributes: { controlsList: "nodownload" } },
                }}
                // Disable right click
                onContextMenu={(e: React.MouseEvent) => e.preventDefault()}
                className="react-player"
                width="100%"
                height="100%"
                controls
                playing
                url={videoUrl}
                onProgress={handleVideoProgress}
                onEnded={() => {
                  if (selectedVideo && id) {
                    handleMarkVideoComplete(
                      selectedVideo.lectureId,
                      selectedVideo.video._id,
                      selectedVideo.video.title
                    );
                  }
                }}
              />
            </div>
            <div className="space-y-2 p-2">
              <h1 className="font-semibold underline underline-offset-2">
                Current video details
              </h1>
              <div className="flex flex-col">
                <span>{selectedVideo?.video.title}</span>
              </div>
            </div>
            <div className="space-y-3 p-2">
              <h1 className="font-semibold underline underline-offset-2">
                About lesson
              </h1>
              <div className="flex flex-col">
                <h3 className="font-bold text-slate-800 dark:text-gray-300">
                  {selectedVideo?.lectureTitle}
                </h3>
                <p className="italic">{selectedVideo?.lectureDescription}</p>
              </div>
            </div>
            
            {/* Quiz Button - Show when course is 100% complete */}
            {showQuizButton && (
              <div className="p-4 bg-green-50 dark:bg-green-900 rounded-lg mx-2">
                <h3 className="font-bold text-green-800 dark:text-green-200 mb-2">
                  🎉 Course Complete!
                </h3>
                <p className="text-green-700 dark:text-green-300 mb-3 text-sm">
                  Take the final quiz to earn your certificate. You need 75% or higher to pass.
                </p>
                <Button 
                  onClick={() => setShowQuiz(true)}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  Take Final Quiz
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="flex flex-col order-1 sm:order-2 w-full sm:w-1/3 lg:w-1/4 bg-slate-100 dark:bg-slate-800 border border-l-slate-300 dark:border-l-slate-700">
        <h1 className="text-lg font-medium bg-white dark:bg-slate-900 py-3 pl-1 ">
          Table of contents
        </h1>
        <div className="flex">
          <div className="w-full flex items-center shadow-sm">
            <div className="w-full">
              {course?.lectures
                ?.sort((a, b) => a.order - b.order)
                .map((lecture) => (
                  <Collapsible
                    key={lecture._id}
                    open={openLecture === lecture._id}
                    onOpenChange={() => toggleLecture(lecture._id)}
                  >
                    <CollapsibleTrigger
                      className={`w-full flex gap-2 items-center justify-between border border-b-gray-300 dark:border-b-slate-700 min-h-12 max-h-16 py-2 px-2 cursor-pointer ${
                        lecture._id === selectedVideo?.lectureId
                          ? "text-blue-600 bg-blue-100"
                          : "bg-slate-200 dark:bg-slate-700"
                      }`}
                    >
                      <div className=" gap-2 items-center flex">
                        <div className="w-max">
                          {userCoursePurchaseStatus ? (
                            <IoLogoYoutube size={16} />
                          ) : lecture.isFree ? (
                            <IoLogoYoutube size={16} />
                          ) : (
                            <Lock size={16} />
                          )}
                        </div>

                        <h2 className="font-medium max-w-52 text-start">
                          {lecture.title}
                        </h2>
                      </div>
                      <ChevronDown
                        size={16}
                        className={`transition-transform duration-200 ${
                          openLecture === lecture._id
                            ? "rotate-180"
                            : "rotate-0"
                        }`}
                      />
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      {lecture.videos.map((video) => {
                        const videoProgress = progress?.completedLectures
                          .find((l) => l.lectureId === lecture._id)
                          ?.completedVideos.find(
                            (v) => v.videoId === video._id
                          );
                        const isCompleted = videoProgress?.isCompleted || false;
                        const watchPercentage = videoProgress?.watchPercentage || 0;
                        const hasAccess = !userCoursePurchaseStatus || canAccessVideo(video._id, lecture._id);
                        
                        return (
                          <div key={video._id} className="w-full">
                            <div
                              className={`flex flex-col gap-1 p-2 pl-6 cursor-pointer w-full ${
                                selectedVideo?.video._id === video._id
                                  ? "bg-blue-600 border dark:bg-blue-700 dark:hover:bg-blue-600 shadow-md text-white hover:bg-blue-500"
                                  : hasAccess 
                                    ? "bg-white dark:bg-slate-600 hover:bg-slate-100 dark:hover:bg-slate-500"
                                    : "bg-gray-200 dark:bg-gray-700 opacity-60 cursor-not-allowed"
                              }`}
                              onClick={() => {
                                if (hasAccess) {
                                  handleVideoSelect(
                                    video,
                                    lecture._id,
                                    lecture.title,
                                    lecture.description
                                  );
                                } else {
                                  toast.error('You must watch at least 80% of the previous video to unlock this one.');
                                }
                              }}
                            >
                              <div className="flex gap-2 items-center">
                                {!hasAccess ? (
                                  <Lock size={18} className="text-gray-500" />
                                ) : isCompleted ? (
                                  <CheckCircle2
                                    size={18}
                                    className="text-green-500"
                                  />
                                ) : (
                                  <PlayCircle size={18} />
                                )}
                                <span className="text-xs flex-1">
                                  {video.title || "Video Title"}
                                </span>
                              </div>
                              
                              {/* Watch Progress Bar */}
                              {userCoursePurchaseStatus && watchPercentage > 0 && (
                                <div className="flex items-center gap-2 mt-1">
                                  <div className="flex-1 h-1 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
                                    <div 
                                      className={`h-full transition-all duration-300 ${
                                        watchPercentage >= 80 ? 'bg-green-500' : 'bg-yellow-500'
                                      }`}
                                      style={{ width: `${watchPercentage}%` }}
                                    />
                                  </div>
                                  <span className={`text-xs ${
                                    selectedVideo?.video._id === video._id ? 'text-white' : 'text-gray-600 dark:text-gray-400'
                                  }`}>
                                    {watchPercentage}%
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </CollapsibleContent>
                  </Collapsible>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default LectureView;
