export const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "https://nxt-serve-by-toast.onrender.com";

export const API_PATHS = {
  AUTH: {
    REGISTER: "/api/auth/register", // Signup
    LOGIN: "/api/auth/login", // Authenticate user & return JWT token
    GET_PROFILE: "/api/auth/me", // Get logged-in user details
    UPDATE_PROFILE: "/api/user/profile", // Update profile details
    DELETE_RESUME: "/api/user/resume", // Delete Resume details
  },
  USER: {
    UPDATE_PREFERENCES: "/api/user/preferences",
  },
  AI: {
    GENERATE_CONTENT: "/api/ai/generate",
    MATCHES: "/api/ai/matches",
  },
  NEWSLETTER: {
    SUBSCRIBE: "/api/newsletter",
  },
  MESSAGES: {
    USERS: "/api/messages/users",
    CONVERSATION: (id) => `/api/messages/conversation/${id}`,
  },
  BADGES: {
    CATALOG: "/api/badges/catalog",
    MINE: "/api/badges/my",
    PENDING: "/api/badges/pending",
    REQUEST: "/api/badges",
    VERIFY: (id) => `/api/badges/${id}/verify`,
  },

  DASHBOARD: {
    OVERVIEW: `/api/analytics/overview`,
  },

  JOBS: {
    GET_ALL_JOBS: '/api/jobs',
    GET_JOB_By_ID: (id) => `/api/jobs/${id}`,
    POST_JOB: "/api/jobs",
    GET_JOBS_EMPLOYER: "/api/jobs/get-jobs-employer",
    GET_JOB_BY_ID: (id) => `/api/jobs/${id}`,
    UPDATE_JOB: (id) => `/api/jobs/${id}`,
    TOGGLE_CLOSE: (id) => `/api/jobs/${id}/toggle-close`,
    DELETE_JOB: (id) => `/api/jobs/${id}`,

    SAVE_JOB: (id) => `/api/save-jobs/${id}`,
    UNSAVE_JOB: (id) => `/api/save-jobs/${id}`,
    GET_SAVED_JOBS: '/api/save-jobs/my',
  },

  APPLICATIONS: {
    APPLY_TO_JOB: (id) => `/api/applications/${id}`,
    GET_ALL_APPLICATIONS: (id) => `/api/applications/job/${id}`,
    UPDATE_STATUS: (id) => `/api/applications/${id}/status`,
  },

  IMAGE: {
    UPLOAD_IMAGE: "/api/auth/upload-image", // Upload profile picture
  },
};
