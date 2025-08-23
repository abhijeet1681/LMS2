import api from "@/axios/auth/authInterceptors"
import { config } from "@/config/config";
const API_URL = config.app.PORT;

//get all courses list
interface GetFilteredCourseParams {
  categories?: string;
  sortBy? : string;
  rating?: number;
  level ? : string;
  page? : number;
  limit ? : number;
  query? : string
}

export const getFilteredCoursesUserApi = async (params: GetFilteredCourseParams) => {
    const response = await api.get(`${API_URL}/api/student/courses-filtered`, {params : params});
    return response.data;
}

export const getAllCoursesUserApi = async () => {
    const response = await api.get(`${API_URL}/api/student/home/courses`);
    return response.data;
}

export const getTopRatedCoursesApi = async (limit: number) => {
    const response = await api.get(`${API_URL}/api/student/home/top-rated-courses`, {params: { limit: limit}});
    return response.data;
}

export const getAllCategoriesApi = async () => {
    try {
    const response = await api.get(`${API_URL}/api/student/categories`, {withCredentials: true});
    return response.data;
    } catch (error) {
      throw error
    }
  }

  export const getCourseByIdUserApi = async (courseId: string, userId: string | null) => {
    const url = userId 
            ? `${API_URL}/api/student/courses/${courseId}?userId=${userId}`
            : `${API_URL}/api/student/courses/${courseId}`

    try {
        const response = await api.get(url, { withCredentials: true });
        return response.data;
    } catch (error: any) {
        throw error?.response?.data || error; // Propagate error to caller
      }
    
  }


  interface Course {
    courseId: string ;
      courseTitle : string;
      coursePrice : Number;
      courseImage: string;
      courseInstructor ?: string;
      courseLevel ?: string;
      courseDescription ?:string ;
      courseDuration ?: number
      courseLecturesCount ?: number
      courseInstructorImage ?: string
  }
  export const purchaseCourseApi = async (courses:[Course]) => {
    try {
        const response = await api.post(`${API_URL}/api/student/order/create`,{courses}, { withCredentials: true });
        return response.data;
    } catch (error: any) {
        throw error?.response?.data || error; // Propagate error to caller
      }
    
  }
  export const fetchMyCoursesApi = async () => {
    try {
        const response = await api.get(`${API_URL}/api/student/profile/courses`, { withCredentials: true });
        return response.data;
    } catch (error: any) {
        throw error?.response?.data || error; // Propagate error to caller
      }
    
  }

  export const getCourseProgressApi = async(courseId: string) => {
    try {
      const response = await api.get(`${API_URL}/api/student/progress/${courseId}`, { withCredentials: true})
      return response.data;
    } catch (error: any) {
      throw error?.response?.data || error
    }
  }
  export const markAsIncompletedApi = async(courseId: string) => {
    try {
      const response = await api.put(`${API_URL}/api/student/progress/${courseId}/incompleted`, { withCredentials: true})
      return response.data;
    } catch (error: any) {
      throw error?.response?.data || error
    }
  }
  export const markAsCompletedApi = async(courseId: string) => {
    try {
      const response = await api.put(`${API_URL}/api/student/progress/${courseId}/completed`, { withCredentials: true})
      return response.data;
    } catch (error: any) {
      throw error?.response?.data || error
    }
  }

  export const markVideoCompleteApi = async (
    courseId: string,
    lectureId: string,
    videoId: string
  ) => {
    const response = await api.post(
      `${API_URL}/api/student/progress/${courseId}/lectures/${lectureId}/videos/${videoId}`
    );
    return response.data;
  };
  export const getVideoSecureUrl = async (
    courseId: string,
    lectureId: string,
    videoId: string
  ) => {
    const response = await api.get(
      `${API_URL}/api/student/stream/${courseId}/${lectureId}/${videoId}`,
      {responseType: 'blob', withCredentials: true}
    );
    return response.data;
  };

  export const addToWishlistApi = async(courseId: string)=> {
    const response = await api.post(`${API_URL}/api/student/wishlist/add`, {courseId})
    return response.data
  }
  export const removeFromWishlistApi = async(courseId: string)=> {
    const response = await api.post(`${API_URL}/api/student/wishlist/delete`, {courseId})
    return response.data
  }
  export const getWishlistApi = async()=> {
    const response = await api.get(`${API_URL}/api/student/wishlist`)
    return response.data
  }
  
export const getWishlistCourseIds = async() => {
  const response = await api.get(`${API_URL}/api/student/wishlist/ids`)
  return response.data;
}
export const getCourseRatingsApi = async(courseId: string) => {
  const response = await api.get(`${API_URL}/api/student/rating/${courseId}`)
  return response.data;
}
export const submitRatingApi = async(data:{courseId:string, rating: number, review:string}) => {
  const response = await api.post(`${API_URL}/api/student/rate`, {...data})
  return response.data;
}
export const updateRatingApi = async(data:{ratingId: string, rating: number, review:string}) => {
  const response = await api.put(`${API_URL}/api/student/rate/${data.ratingId}`, {rating:data.rating, review: data.review})
  return response.data;
}
export const deleteRatingApi = async(ratingId:string) => {
  const response = await api.delete(`${API_URL}/api/student/rate/${ratingId}`)
  return response.data;
}

// Video Progress APIs
export const updateVideoProgressApi = async (
  courseId: string,
  lectureId: string,
  videoId: string,
  watchPercentage: number
) => {
  const response = await api.put(
    `${API_URL}/api/student/progress/${courseId}/lectures/${lectureId}/videos/${videoId}/progress`,
    { watchPercentage }
  );
  return response.data;
};

export const checkVideoAccessApi = async (
  courseId: string,
  lectureId: string,
  videoId: string
) => {
  const response = await api.get(
    `${API_URL}/api/student/progress/${courseId}/lectures/${lectureId}/videos/${videoId}/access`
  );
  return response.data;
};

// Quiz APIs
export const getQuizForCourseApi = async (courseId: string) => {
  const response = await api.get(`${API_URL}/api/student/quiz/${courseId}`);
  return response.data;
};

export const submitQuizApi = async (
  courseId: string,
  answers: { questionId: string; selectedAnswer: number }[],
  timeSpent: number
) => {
  const response = await api.post(`${API_URL}/api/student/quiz/${courseId}/submit`, {
    answers,
    timeSpent
  });
  return response.data;
};

export const getUserQuizAttemptsApi = async (courseId: string) => {
  const response = await api.get(`${API_URL}/api/student/quiz/${courseId}/attempts`);
  return response.data;
};

export const checkQuizEligibilityApi = async (courseId: string) => {
  const response = await api.get(`${API_URL}/api/student/quiz/${courseId}/eligibility`);
  return response.data;
};

// Certificate APIs
export const getUserCertificatesApi = async () => {
  const response = await api.get(`${API_URL}/api/student/certificates`);
  return response.data;
};

export const getCertificateApi = async (certificateId: string) => {
  const response = await api.get(`${API_URL}/api/student/certificate/${certificateId}`);
  return response.data;
};

export const downloadCertificateApi = async (certificateId: string) => {
  const response = await api.get(`${API_URL}/api/student/certificate/${certificateId}/download`);
  return response.data;
};

export const verifyCertificateApi = async (certificateId: string) => {
  const response = await api.get(`${API_URL}/api/student/certificate/${certificateId}/verify`);
  return response.data;
};
