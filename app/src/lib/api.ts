import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from "axios";

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "";

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  withCredentials: true, // Important for cookies
  headers: {
    "Content-Type": "application/json",
    "x-api-key": API_KEY,
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Ensure x-api-key is always included
    if (API_KEY) {
      config.headers["x-api-key"] = API_KEY;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Unauthorized - redirect to login
      const isPublicPath = ["/", "/about", "/contact"].some(
        (path) =>
          window.location.pathname === path ||
          window.location.pathname.startsWith(path + "/")
      );

      // Don't redirect if we're on a public path and it's just the 'me' endpoint failing (user not logged in)
      const isMeEndpoint = error.config?.url?.includes("/auth/me");

      if (
        typeof window !== "undefined" &&
        !window.location.pathname.includes("/login") &&
        !(isPublicPath && isMeEndpoint)
      ) {
        window.location.href = `/login?redirect=${encodeURIComponent(
          window.location.pathname
        )}`;
      }
    }
    return Promise.reject(error);
  }
);

// API Methods
export const api = {
  // Auth endpoints
  auth: {
    login: async (email: string, password: string) => {
      const response = await apiClient.post("/auth/login", { email, password });
      return response.data;
    },

    loginWithGoogle: async (idToken: string) => {
      const response = await apiClient.post("/auth/google", { idToken });
      return response.data;
    },

    register: async (email: string, password: string, name: string) => {
      const response = await apiClient.post("/auth/register", {
        email,
        password,
        name,
      });
      return response.data;
    },

    logout: async () => {
      const response = await apiClient.post("/auth/logout");
      return response.data;
    },

    getProfile: async () => {
      const response = await apiClient.get("/auth/me");
      return response.data;
    },
  },

  // Admins endpoints
  admins: {
    getAll: async () => {
      const response = await apiClient.get("/admins");
      return response.data;
    },

    getById: async (id: string) => {
      const response = await apiClient.get(`/admins/${id}`);
      return response.data;
    },

    create: async (data: {
      email: string;
      password: string;
      fullName: string;
      adminLevel: "super" | "system" | "support";
      permissions: string[];
      avatarUrl?: string;
    }) => {
      const response = await apiClient.post("/admins", data);
      return response.data;
    },

    update: async (
      id: string,
      data: {
        email?: string;
        password?: string;
        fullName?: string;
        adminLevel?: "super" | "system" | "support";
        permissions?: string[];
        avatarUrl?: string;
      }
    ) => {
      const response = await apiClient.patch(`/admins/${id}`, data);
      return response.data;
    },

    delete: async (id: string) => {
      const response = await apiClient.delete(`/admins/${id}`);
      return response.data;
    },
  },

  // Teachers endpoints
  teachers: {
    getAll: async () => {
      const response = await apiClient.get("/teachers");
      return response.data;
    },

    getById: async (id: string) => {
      const response = await apiClient.get(`/teachers/${id}`);
      return response.data;
    },

    create: async (data: {
      email: string;
      password: string;
      fullName: string;
      specialization: string[];
      experienceYears: number;
      certifications?: string[];
      phone: string;
      bio?: string;
      avatarUrl?: string;
    }) => {
      const response = await apiClient.post("/teachers", data);
      return response.data;
    },

    update: async (
      id: string,
      data: {
        email?: string;
        password?: string;
        fullName?: string;
        specialization?: string[];
        experienceYears?: number;
        certifications?: string[];
        phone?: string;
        bio?: string;
        avatarUrl?: string;
      }
    ) => {
      const response = await apiClient.patch(`/teachers/${id}`, data);
      return response.data;
    },

    delete: async (id: string) => {
      const response = await apiClient.delete(`/teachers/${id}`);
      return response.data;
    },
  },

  // Students endpoints
  students: {
    getAll: async () => {
      const response = await apiClient.get("/students");
      return response.data;
    },

    getById: async (id: string) => {
      const response = await apiClient.get(`/students/${id}`);
      return response.data;
    },

    getMyCourses: async () => {
      const response = await apiClient.get("/students/me/courses");
      return response.data;
    },

    getMyCoursesWithProgress: async () => {
      const response = await apiClient.get(
        "/students/me/courses-with-progress"
      );
      return response.data;
    },

    getCoursesWithProgress: async (studentId: string) => {
      const response = await apiClient.get(
        `/students/${studentId}/courses-with-progress`
      );
      return response.data;
    },

    create: async (data: {
      email: string;
      password: string;
      fullName: string;
      studentCode: string;
      gradeLevel: number;
      schoolName: string;
      dateOfBirth: string;
      gender: "male" | "female" | "other";
      avatarUrl?: string;
    }) => {
      const response = await apiClient.post("/students", data);
      return response.data;
    },

    update: async (
      id: string,
      data: {
        email?: string;
        password?: string;
        fullName?: string;
        studentCode?: string;
        gradeLevel?: number;
        schoolName?: string;
        dateOfBirth?: string;
        gender?: "male" | "female" | "other";
        avatarUrl?: string;
      }
    ) => {
      const response = await apiClient.patch(`/students/${id}`, data);
      return response.data;
    },

    delete: async (id: string) => {
      const response = await apiClient.delete(`/students/${id}`);
      return response.data;
    },
  },

  // Parents endpoints
  parents: {
    getAll: async () => {
      const response = await apiClient.get("/parents");
      return response.data;
    },

    getById: async (id: string) => {
      const response = await apiClient.get(`/parents/${id}`);
      return response.data;
    },

    create: async (data: {
      email: string;
      password: string;
      fullName: string;
      phone: string;
      address: string;
      relationshipType: "father" | "mother" | "guardian";
      avatarUrl?: string;
      studentIds: string[];
    }) => {
      const response = await apiClient.post("/parents", data);
      return response.data;
    },

    update: async (
      id: string,
      data: {
        email?: string;
        password?: string;
        fullName?: string;
        phone?: string;
        address?: string;
        relationshipType?: "father" | "mother" | "guardian";
        avatarUrl?: string;
        studentIds?: string[];
      }
    ) => {
      const response = await apiClient.patch(`/parents/${id}`, data);
      return response.data;
    },

    getStudents: async (id: string) => {
      const response = await apiClient.get(`/parents/${id}/students`);
      return response.data;
    },

    addStudent: async (parentId: string, studentId: string) => {
      const response = await apiClient.post(
        `/parents/${parentId}/students/${studentId}`
      );
      return response.data;
    },

    removeStudent: async (parentId: string, studentId: string) => {
      const response = await apiClient.delete(
        `/parents/${parentId}/students/${studentId}`
      );
      return response.data;
    },

    delete: async (id: string) => {
      const response = await apiClient.delete(`/parents/${id}`);
      return response.data;
    },
  },

  // Classes endpoints
  classes: {
    getAll: async () => {
      const response = await apiClient.get("/classes");
      return response.data;
    },

    getById: async (id: string) => {
      const response = await apiClient.get(`/classes/${id}`);
      return response.data;
    },

    create: async (data: {
      className: string;
      gradeLevel: number;
      schoolYear: string;
      homeroomTeacherId?: string;
    }) => {
      const response = await apiClient.post("/classes", data);
      return response.data;
    },

    update: async (
      id: string,
      data: {
        className?: string;
        gradeLevel?: number;
        schoolYear?: string;
        homeroomTeacherId?: string;
      }
    ) => {
      const response = await apiClient.patch(`/classes/${id}`, data);
      return response.data;
    },

    delete: async (id: string) => {
      const response = await apiClient.delete(`/classes/${id}`);
      return response.data;
    },

    // Student Enrollment
    enrollStudent: async (
      classId: string,
      data: {
        studentId: string;
        status?: "active" | "withdrawn" | "completed";
      }
    ) => {
      const response = await apiClient.post(
        `/classes/${classId}/students`,
        data
      );
      return response.data;
    },

    getClassStudents: async (classId: string) => {
      const response = await apiClient.get(`/classes/${classId}/students`);
      return response.data;
    },

    removeStudent: async (classId: string, studentId: string) => {
      const response = await apiClient.delete(
        `/classes/${classId}/students/${studentId}`
      );
      return response.data;
    },

    // Teacher Assignment
    assignTeacher: async (
      classId: string,
      data: {
        teacherId: string;
        role: "homeroom" | "subject_teacher" | "assistant";
        status?: "active" | "inactive";
      }
    ) => {
      const response = await apiClient.post(
        `/classes/${classId}/teachers`,
        data
      );
      return response.data;
    },

    getClassTeachers: async (classId: string) => {
      const response = await apiClient.get(`/classes/${classId}/teachers`);
      return response.data;
    },

    removeTeacher: async (classId: string, teacherId: string) => {
      const response = await apiClient.delete(
        `/classes/${classId}/teachers/${teacherId}`
      );
      return response.data;
    },

    // Course Assignment
    assignCourse: async (
      classId: string,
      data: {
        courseId: string;
        assignedBy?: string;
        status?: "active" | "inactive";
      }
    ) => {
      const response = await apiClient.post(
        `/classes/${classId}/courses`,
        data
      );
      return response.data;
    },

    getClassCourses: async (
      classId: string,
      status?: "active" | "inactive"
    ) => {
      const url = status
        ? `/classes/${classId}/courses?status=${status}`
        : `/classes/${classId}/courses`;
      const response = await apiClient.get(url);
      return response.data;
    },

    updateClassCourseStatus: async (
      classId: string,
      courseId: string,
      status: "active" | "inactive"
    ) => {
      const response = await apiClient.patch(
        `/classes/${classId}/courses/${courseId}/status`,
        { status }
      );
      return response.data;
    },

    removeCourse: async (classId: string, courseId: string) => {
      const response = await apiClient.delete(
        `/classes/${classId}/courses/${courseId}`
      );
      return response.data;
    },
  },

  // Courses endpoints
  courses: {
    getAll: async (params?: {
      gradeLevel?: number;
      subject?: string;
      active?: boolean;
    }) => {
      const queryParams = new URLSearchParams();
      if (params?.gradeLevel)
        queryParams.append("gradeLevel", params.gradeLevel.toString());
      if (params?.subject) queryParams.append("subject", params.subject);
      if (params?.active !== undefined)
        queryParams.append("active", params.active.toString());

      const queryString = queryParams.toString();
      const url = queryString ? `/courses?${queryString}` : "/courses";
      const response = await apiClient.get(url);
      return response.data;
    },

    getById: async (id: string) => {
      const response = await apiClient.get(`/courses/${id}`);
      return response.data;
    },

    getStructure: async (id: string) => {
      const response = await apiClient.get(`/courses/${id}/structure`);
      return response.data;
    },

    getForLearning: async (id: string) => {
      const response = await apiClient.get(`/courses/${id}/learn`);
      return response.data;
    },

    create: async (data: {
      title: string;
      description: string;
      thumbnailUrl: string;
      subject: string;
      gradeLevel: number;
      active?: boolean;
      visibility?: "public" | "private" | "school_only";
    }) => {
      const response = await apiClient.post("/courses", data);
      return response.data;
    },

    update: async (
      id: string,
      data: {
        title?: string;
        description?: string;
        thumbnailUrl?: string;
        subject?: string;
        gradeLevel?: number;
        active?: boolean;
        visibility?: "public" | "private" | "school_only";
      }
    ) => {
      const response = await apiClient.patch(`/courses/${id}`, data);
      return response.data;
    },

    delete: async (id: string) => {
      const response = await apiClient.delete(`/courses/${id}`);
      return response.data;
    },

    // Modules
    getAllModules: async (courseId: string) => {
      const response = await apiClient.get(`/courses/${courseId}/modules`);
      return response.data;
    },

    getModule: async (moduleId: string) => {
      const response = await apiClient.get(`/courses/modules/${moduleId}`);
      return response.data;
    },

    createModule: async (data: {
      courseId: string;
      title: string;
      description: string;
      orderIndex: number;
    }) => {
      const response = await apiClient.post("/courses/modules", data);
      return response.data;
    },

    updateModule: async (
      moduleId: string,
      data: {
        title?: string;
        description?: string;
        orderIndex?: number;
      }
    ) => {
      const response = await apiClient.patch(
        `/courses/modules/${moduleId}`,
        data
      );
      return response.data;
    },

    deleteModule: async (moduleId: string) => {
      const response = await apiClient.delete(`/courses/modules/${moduleId}`);
      return response.data;
    },

    // Sections
    getAllSections: async (moduleId: string) => {
      const response = await apiClient.get(
        `/courses/modules/${moduleId}/sections`
      );
      return response.data;
    },

    getSection: async (sectionId: string) => {
      const response = await apiClient.get(`/courses/sections/${sectionId}`);
      return response.data;
    },

    createSection: async (data: {
      moduleId: string;
      title: string;
      orderIndex: number;
      knowledgePoints?: {
        title: string;
        description: string;
        content: any;
        difficultyLevel: number;
        tags?: string[];
      }[];
    }) => {
      const response = await apiClient.post("/courses/sections", data);
      return response.data;
    },

    updateSection: async (
      sectionId: string,
      data: {
        title?: string;
        orderIndex?: number;
      }
    ) => {
      const response = await apiClient.patch(
        `/courses/sections/${sectionId}`,
        data
      );
      return response.data;
    },

    deleteSection: async (sectionId: string) => {
      const response = await apiClient.delete(`/courses/sections/${sectionId}`);
      return response.data;
    },

    getSectionKnowledgePoints: async (sectionId: string) => {
      const response = await apiClient.get(
        `/courses/sections/${sectionId}/knowledge-points`
      );
      return response.data;
    },
  },

  // Knowledge Points endpoints
  knowledgePoints: {
    getAll: async () => {
      const response = await apiClient.get("/knowledge-points");
      return response.data;
    },

    getById: async (id: string) => {
      const response = await apiClient.get(`/knowledge-points/${id}/details`);
      return response.data;
    },

    getByIdWithDetails: async (id: string) => {
      const response = await apiClient.get(`/knowledge-points/${id}/details`);
      return response.data;
    },

    getBySection: async (sectionId: string) => {
      const response = await apiClient.get(
        `/knowledge-points/sections/${sectionId}/kps`
      );
      return response.data;
    },

    assignToSection: async (data: {
      sectionId: string;
      kpId: string;
      orderIndex: number;
    }) => {
      const response = await apiClient.post(
        "/knowledge-points/assign-to-section",
        data
      );
      return response.data;
    },

    create: async (data: {
      title: string;
      description: string;
      content: any;
      difficultyLevel: number;

      prerequisites?: string[];
      resources?: {
        resourceType: "video" | "article" | "interactive" | "quiz" | "other";
        url: string;
        title: string;
        description: string;
        orderIndex: number;
      }[];
    }) => {
      const response = await apiClient.post("/knowledge-points", data);
      return response.data;
    },

    update: async (
      id: string,
      data: {
        title?: string;
        description?: string;
        content?: any;
        difficultyLevel?: number;

        prerequisites?: string[];
        resources?: {
          resourceType: "video" | "article" | "interactive" | "quiz" | "other";
          url: string;
          title: string;
          description: string;
          orderIndex: number;
        }[];
      }
    ) => {
      const response = await apiClient.patch(`/knowledge-points/${id}`, data);
      return response.data;
    },

    delete: async (id: string) => {
      const response = await apiClient.delete(`/knowledge-points/${id}`);
      return response.data;
    },

    removeFromSection: async (sectionId: string, kpId: string) => {
      const response = await apiClient.delete(
        `/knowledge-points/sections/${sectionId}/kps/${kpId}`
      );
      return response.data;
    },

    generateContent: async (data: {
      topic: string;
      description?: string;
      theoryContent?: string;
      prompt?: string;
      contentType: "visualization";
      aiModel: "openai" | "gemini";
    }) => {
      const response = await apiClient.post(
        "/knowledge-points/generate-content",
        data
      );
      return response.data;
    },
  },

  // Question Bank endpoints
  questionBank: {
    getAll: async (params?: { questionType?: string; isActive?: boolean }) => {
      const queryParams = new URLSearchParams();
      if (params?.questionType)
        queryParams.append("questionType", params.questionType);
      if (params?.isActive !== undefined)
        queryParams.append("isActive", params.isActive.toString());

      const queryString = queryParams.toString();
      const url = queryString
        ? `/question-bank?${queryString}`
        : "/question-bank";
      const response = await apiClient.get(url);
      return response.data;
    },

    getById: async (id: string) => {
      const response = await apiClient.get(`/question-bank/${id}`);
      return response.data;
    },

    getByIdWithMetadata: async (id: string) => {
      const response = await apiClient.get(`/question-bank/${id}/metadata`);
      return response.data;
    },

    create: async (data: {
      questionText: string;
      options: string[];
      correctAnswer: string;
      questionType:
        | "multiple_choice"
        | "true_false"
        | "fill_in_blank"
        | "short_answer";
      isActive?: boolean;
      metadata: {
        difficulty: number;
        discrimination: number;
        skillId: string;
        tags?: string[];
        estimatedTime?: number;
      };
    }) => {
      const response = await apiClient.post("/question-bank", data);
      return response.data;
    },

    update: async (
      id: string,
      data: {
        questionText?: string;
        options?: string[];
        correctAnswer?: string;
        questionType?:
          | "multiple_choice"
          | "true_false"
          | "fill_in_blank"
          | "short_answer";
        isActive?: boolean;
        metadata?: {
          difficulty?: number;
          discrimination?: number;
          skillId?: string;
          tags?: string[];
          estimatedTime?: number;
        };
      }
    ) => {
      const response = await apiClient.patch(`/question-bank/${id}`, data);
      return response.data;
    },

    delete: async (id: string) => {
      const response = await apiClient.delete(`/question-bank/${id}`);
      return response.data;
    },

    // KP Assignments
    assignToKp: async (data: {
      kpId: string;
      questionId: string;
      difficulty: number;
    }) => {
      const response = await apiClient.post(
        "/question-bank/assign-to-kp",
        data
      );
      return response.data;
    },

    removeFromKp: async (kpId: string, questionId: string) => {
      const response = await apiClient.delete(
        `/question-bank/kps/${kpId}/questions/${questionId}`
      );
      return response.data;
    },

    getQuestionsByKp: async (kpId: string) => {
      const response = await apiClient.get(
        `/question-bank/kps/${kpId}/questions`
      );
      return response.data;
    },

    getMetadata: async (questionId: string) => {
      const response = await apiClient.get(
        `/question-bank/${questionId}/metadata`
      );
      return response.data;
    },

    generateQuestion: async (data: {
      knowledgePointTitle: string;
      knowledgePointDescription?: string;
      aiModel: "openai" | "gemini";
      questionType:
        | "multiple_choice"
        | "true_false"
        | "fill_in_blank"
        | "short_answer";
      difficulty: number;
      skillId?: string;
    }) => {
      const response = await apiClient.post("/question-bank/generate", data);
      return response.data;
    },
  },

  // Upload endpoints
  upload: {
    avatar: async (
      file: File,
      onProgress?: (progress: number) => void
    ): Promise<{ message: string; url: string }> => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await apiClient.post("/upload/avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "x-api-key": API_KEY,
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        },
      });
      return response.data;
    },

    file: async (
      file: File,
      onProgress?: (progress: number) => void
    ): Promise<{ message: string; url: string }> => {
      const formData = new FormData();
      formData.append("file", file);

      const response = await apiClient.post("/upload/file", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          "x-api-key": API_KEY,
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress && progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            onProgress(percentCompleted);
          }
        },
      });
      return response.data;
    },

    image: async (
      file: File,
      onProgress?: (progress: number) => void
    ): Promise<{ message: string; url: string }> => {
      return api.upload.file(file, onProgress);
    },
  },

  // Explorer endpoints
  explorer: {
    getPublicCourses: async (params?: {
      gradeLevel?: number;
      subject?: string;
    }) => {
      const queryParams = new URLSearchParams();
      if (params?.gradeLevel)
        queryParams.append("gradeLevel", params.gradeLevel.toString());
      if (params?.subject) queryParams.append("subject", params.subject);

      const queryString = queryParams.toString();
      const url = queryString
        ? `/explorer/courses?${queryString}`
        : "/explorer/courses";
      const response = await apiClient.get(url);
      return response.data;
    },

    getPublicCourseDetails: async (id: string) => {
      const response = await apiClient.get(`/explorer/courses/${id}`);
      return response.data;
    },

    cloneCourse: async (courseId: string) => {
      const response = await apiClient.post(
        `/explorer/courses/${courseId}/clone`
      );
      return response.data;
    },
  },

  // Course Analytics endpoints
  courseAnalytics: {
    getCourseAnalytics: async (courseId: string) => {
      const response = await apiClient.get(
        `/course-analytics/courses/${courseId}`
      );
      return response.data;
    },

    getModuleAnalytics: async (courseId: string, moduleId: string) => {
      const response = await apiClient.get(
        `/course-analytics/courses/${courseId}/modules/${moduleId}`
      );
      return response.data;
    },
  },

  // Student Progress endpoints
  studentProgress: {
    submitQuestionAttempt: async (data: {
      studentId: string;
      questionId: string;
      kpId: string;
      selectedAnswer: string;
      timeSpent?: number;
    }) => {
      const response = await apiClient.post(
        "/student-progress/submit-question",
        data
      );
      return response.data;
    },

    updateKpProgress: async (data: {
      studentId: string;
      kpId: string;
      masteryScore: number;
      confidence: number;
      lastAttemptId: string;
    }) => {
      const response = await apiClient.post(
        "/student-progress/kp-progress",
        data
      );
      return response.data;
    },

    getStudentKpProgress: async (studentId: string, kpId: string) => {
      const response = await apiClient.get(
        `/student-progress/students/${studentId}/kps/${kpId}`
      );
      return response.data;
    },

    getAllStudentProgress: async (studentId: string) => {
      const response = await apiClient.get(
        `/student-progress/students/${studentId}/all-progress`
      );
      return response.data;
    },

    getKpHistory: async (studentId: string, kpId: string) => {
      const response = await apiClient.get(
        `/student-progress/students/${studentId}/kps/${kpId}/history`
      );
      return response.data;
    },

    getStudentMastery: async (studentId: string, courseId: string) => {
      const response = await apiClient.get(
        `/student-progress/students/${studentId}/mastery/${courseId}`
      );
      return response.data;
    },

    getAllStudentMastery: async (studentId: string) => {
      const response = await apiClient.get(
        `/student-progress/students/${studentId}/mastery`
      );
      return response.data;
    },

    getStudentInsights: async (studentId: string) => {
      const response = await apiClient.get(
        `/student-progress/students/${studentId}/insights`
      );
      return response.data;
    },

    getStudentQuestionAttempts: async (studentId: string, kpId: string) => {
      const response = await apiClient.get(
        `/student-progress/students/${studentId}/kps/${kpId}/attempts`
      );
      return response.data;
    },
  },

  // Dashboard endpoints
  dashboard: {
    getStats: async (params?: {
      startDate?: string;
      endDate?: string;
      gradeLevel?: number;
    }) => {
      const queryParams = new URLSearchParams();
      if (params?.startDate) queryParams.append("startDate", params.startDate);
      if (params?.endDate) queryParams.append("endDate", params.endDate);
      if (params?.gradeLevel)
        queryParams.append("gradeLevel", params.gradeLevel.toString());

      const queryString = queryParams.toString();
      const url = queryString
        ? `/dashboard/stats?${queryString}`
        : "/dashboard/stats";
      const response = await apiClient.get(url);
      return response.data;
    },

    getTopCourses: async (limit?: number) => {
      const url = limit
        ? `/dashboard/top-courses?limit=${limit}`
        : "/dashboard/top-courses";
      const response = await apiClient.get(url);
      return response.data;
    },

    getDifficultKPs: async (limit?: number) => {
      const url = limit
        ? `/dashboard/difficult-kps?limit=${limit}`
        : "/dashboard/difficult-kps";
      const response = await apiClient.get(url);
      return response.data;
    },

    getGameCompletions: async (limit?: number) => {
      const url = limit
        ? `/dashboard/game-completions?limit=${limit}`
        : "/dashboard/game-completions";
      const response = await apiClient.get(url);
      return response.data;
    },

    getClassDistribution: async () => {
      const response = await apiClient.get("/dashboard/class-distribution");
      return response.data;
    },

    getLearningHealth: async (params?: {
      startDate?: string;
      endDate?: string;
    }) => {
      const queryParams = new URLSearchParams();
      if (params?.startDate) queryParams.append("startDate", params.startDate);
      if (params?.endDate) queryParams.append("endDate", params.endDate);

      const queryString = queryParams.toString();
      const url = queryString
        ? `/dashboard/learning-health?${queryString}`
        : "/dashboard/learning-health";
      const response = await apiClient.get(url);
      return response.data;
    },

    getTeacherHighlights: async (limit?: number) => {
      const url = limit
        ? `/dashboard/teacher-highlights?limit=${limit}`
        : "/dashboard/teacher-highlights";
      const response = await apiClient.get(url);
      return response.data;
    },

    getLowProgressClasses: async (limit?: number) => {
      const url = limit
        ? `/dashboard/low-progress-classes?limit=${limit}`
        : "/dashboard/low-progress-classes";
      const response = await apiClient.get(url);
      return response.data;
    },
  },

  // Generic request methods
  get: async <T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    const response = await apiClient.get<T>(url, config);
    return response.data;
  },

  post: async <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    const response = await apiClient.post<T>(url, data, config);
    return response.data;
  },

  put: async <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    const response = await apiClient.put<T>(url, data, config);
    return response.data;
  },

  patch: async <T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    const response = await apiClient.patch<T>(url, data, config);
    return response.data;
  },

  delete: async <T = any>(
    url: string,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    const response = await apiClient.delete<T>(url, config);
    return response.data;
  },
};

export default apiClient;
