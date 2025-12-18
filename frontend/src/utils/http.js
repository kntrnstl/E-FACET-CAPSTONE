// src/utils/http.js
const API_URL = 'http://localhost:3000/api';

async function request(endpoint, options = {}) {
  const url = `${API_URL}${endpoint}`;
  
  const defaultOptions = {
    credentials: 'include', // IMPORTANT for sessions
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const config = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    
    if (response.status === 401) {
      // Unauthorized - redirect to login
      window.location.href = '/login';
      return;
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Request failed');
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
}

export const authAPI = {
  login: (credentials) => request('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials)
  }),
  
  signup: (userData) => request('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(userData)
  }),
  
  logout: () => request('/auth/logout', {
    method: 'GET'
  }),
  
  checkAuth: () => request('/auth/check', {
    method: 'GET'
  }),
  
  checkAdmin: () => request('/auth/check-admin', {
    method: 'GET'
  })
};

export const studentAPI = {
  getDashboard: () => request('/student/dashboard'),
  enroll: (courseId) => request(`/student/enroll/${courseId}`, {
    method: 'POST'
  }),
  getCourses: () => request('/student/courses')
};