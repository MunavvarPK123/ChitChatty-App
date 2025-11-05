import {axiosInstance} from './index'

export const signUpUser = async (user) => {
    try{
        const response = await axiosInstance.post('/api/auth/signup', user);
        return response.data;
    }catch(error){
        if (error.response) {
            // return a clean object with backend message
            return {
                success: false,
                message: error.response.data.message || "Something went wrong"
            };
        } else if (error.request) {
            return {
                success: false,
                message: "Network error. Could not connect to the server."
            };
        } else {
            return {
                success: false,
                message: "An unexpected error occurred. Please try again."
            };
        }
    }
}

export const loginUser = async (user) => {
    try{
        const response = await axiosInstance.post('/api/auth/login', user);
        return response.data;
    }catch(error){
        if (error.response) {
            return {
                success: false,
                message: error.response.data.message || "Something went wrong"
            };
        } else if (error.request) {
            return {
                success: false,
                message: "Network error. Could not connect to the server."
            };
        } else {
            return {
                success: false,
                message: "An unexpected error occurred. Please try again."
            };
        }
    }
}