import axios from "axios";

export const url = "https://chitchatty-app-server.onrender.com";

export const axiosInstance = axios.create({
    headers:{
        authorization : `Bearer ${localStorage.getItem('token')}`
    }
});
