import axios from 'axios';

const api = axios.create({
  // REPLACE 'http://localhost:5000/api' with your Render URL
  baseURL: 'https://pos-cafe-svr-1.onrender.com/api', 
});

// The rest of the interceptor code stays exactly the same...
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;