import { axiosInstance, url } from "./index";

export const getAllChats = async () => {
    try{
        const response = await axiosInstance.get( url + 'api/chat/get-all-chats')
        return response.data;
    }catch(error){
        return error;
    }
}

export const createNewChat = async ( members ) => {
    try{
        const response = await axiosInstance.post(url + 'api/chat/create-new-chat', { members })
        return response.data;
    }catch(error){
        return error;
    }
}

export const clearUnreadMsgCount = async ( chatId ) => {
    try{
        const response = await axiosInstance.post( url + 'api/chat/clear-unread-msg', { chatId : chatId })
        return response.data;
    }catch(error){
        return error;
    }
}