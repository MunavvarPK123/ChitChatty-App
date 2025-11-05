import axios from "axios";

export const url = "https://chitchatty-app-server.onrender.com";

export const axiosInstance = axios.create({
    baseURL: url,
    timeout: 15000,
});

// Request Interceptor to dynamically set the Authorization header
axiosInstance.interceptors.request.use(
    (config) => {
        // Read the token every time a request is made
        const token = localStorage.getItem('token'); 
        
        // If a token exists, add it to the Authorization header
        if (token){
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);
