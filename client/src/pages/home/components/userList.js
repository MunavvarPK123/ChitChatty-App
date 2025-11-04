import toast from "react-hot-toast"; 
import { useDispatch, useSelector } from "react-redux"
import { createNewChat } from "../../../apiCalls/chat";
import { hideLoader, showLoader} from "../../../redux/loaderSlice";
import { setAllChats, setSelectedChat } from './../../../redux/userSlice'
import moment from "moment";
import { useEffect } from "react";
import store from "../../../redux/store";

function UsersList({searchKey, socket, onlineUser}){
    const {allUsers, allChats, user: currentUser, selectedChat } = useSelector(state => state.userReducer)
    const dispatch = useDispatch();
    
    const startNewChat = async (searchedUserId) => {
        let response = null;
        try{
            dispatch(showLoader());
            response = await createNewChat([currentUser._id, searchedUserId])
            dispatch(hideLoader());

            if(response.success){
                toast.success(response.message);
                const newChat = response.data;
                const updatedChat = [...allChats, newChat]
                dispatch ( setAllChats(updatedChat));
                dispatch(setSelectedChat(newChat));
            }
        }catch(error){
            toast.error(response.message);
            dispatch(hideLoader());
        }
    }

    const openChat = (selectedUserId) => {
        const chat = allChats.find(chat => 
            chat.members.map(m => m._id).includes(currentUser._id) && chat.members.map(m => m._id).includes(selectedUserId)
        )

        if(chat){
            dispatch(setSelectedChat(chat));
        }
    }

    const IsSelectedChat = (user) => {
        if (selectedChat){
            return selectedChat.members.map( m => m._id).includes(user._id)
        } 
        return false;
    };


    const getLastMessageTimeStamp = (userId) => {
        const chat = allChats.find(chat => chat.members.map( m => m._id).includes(userId))
        if (!chat || !chat?.lastMessage)
            return "";
        else
            return moment(chat?.lastMessage?.createdAt).format('hh:mm A') 
    }

    const getLastMessage = (userId) => {
        const chat = allChats.find(chat => chat.members.map( m => m._id).includes(userId))
        if (!chat || !chat.lastMessage)
            return "";
        else{
            const msgPrefix = chat?.lastMessage?.sender === currentUser._id ? "You : " : ""
            const msg = chat?.lastMessage?.text;
            const shortMsg = msg.length > 25 ? msg.substring(0, 25) + "..." : msg;
            return msgPrefix + shortMsg
        }    
    }

    function formatName (user){
        let fname = user.firstname.at(0).toUpperCase() + user.firstname.slice(1).toLowerCase()
        let lname = user.lastname?.at(0).toUpperCase() + user.lastname.slice(1).toLowerCase();
        return fname + ' ' + lname;   
    }

    const getUnreadMsgCount = (userId) => {
        const chat = allChats.find( chat => chat.members.map(m => m._id).includes(userId))
        
        if( chat && chat.unreadmsgCount && chat.lastMessage?.sender !== currentUser._id){
            return <div className="unread_msg_count"> {chat.unreadmsgCount}</div>
        }else{
            return "";
        }
    }

    function getData(){
        if(searchKey === "")
            return allChats
        else{
            return allUsers.filter(user => {
                user.firstname?.toLowerCase().includes(searchKey?.toLowerCase()) || 
                user.lastname?.toLowerCase().includes(searchKey?.toLowerCase())
            });
        }
    }

    useEffect (() => {
        socket.off('set_msg_count').on('set_msg_count', (message) =>{
            const selectedChat = store.getState().userReducer.selectedChat;
            let allChats = store.getState().userReducer.allChats;

            if(selectedChat?._id !== message.chatId){
                const updatedChats = allChats.map(chat => {
                    if(chat._id === message.chatId){
                        return{
                            ...chat,
                            unreadmsgCount : (chat?.unreadmsgCount || 0) + 1,
                            lastMessage : message
                        }
                    }
                    return chat;
                })
                allChats = updatedChats
            }
            //sort chatlist in real time
            const latestChat = allChats.find(chat => chat._id === message.chatId)  //To find latest chat
            const otherChats = allChats.filter(chat => chat._id !== message.chatId)  // To get all other messages
            allChats = [latestChat, ...otherChats]; //create new array in which latest chat on top and then other chats
            dispatch(setAllChats(allChats))
        })
    }, [])

    return (
        getData()
        .map(obj => {
            let user = obj;
            if(obj.members){
                user = obj.members.find(mem => mem._id !== currentUser._id)
            }
            return <div className = "user_search_filter" onClick={() => openChat(user._id)} key = {user._id}>
                <div className = { IsSelectedChat(user) ? "selected_user" : "filtered_users"}>
                <div className ="filtered_user_display">
                    {user.profilePic && <img src={user.profilePic} alt="profile pic" className="user_profile_image" style={onlineUser.includes(user._id) ? {border: 'yellow 3px solid'} : {}}/>}
                    {!user.profilePic &&
                      <div className={IsSelectedChat(user) ? "user_selected_profile" : "user_default_profile"} style={onlineUser.includes(user._id) ? {border: 'yellow 3px solid'} : {}}>
                        {`${user?.firstname?.charAt(0)?.toUpperCase() || ''}${user?.lastname?.charAt(0)?.toUpperCase() || ''}`}
                    </div>
                    }

                    <div className ="filtered_user_details">
                        <div className ="user_display_name">{ formatName (user)}</div>
                        <div className ="user_display_email">{ getLastMessage(user._id) || user.email }</div>
                    </div>
                    <div>
                       { getUnreadMsgCount(user._id) }
                        <div className="last_msg_timestamp">
                            { getLastMessageTimeStamp(user._id) }
                        </div>
                    </div>
                    {!allChats.some(chat => chat.members.some(m => m._id === user._id || m === user._id)) &&
                        <div className="user_start_chat">
                            <button className ="start_chat_btn" onClick={(e) => {
                                e.stopPropagation();
                                startNewChat(user._id)}}>
                                Start Chat</button>
                        </div>
                    }       
                </div>
            </div>
        </div>
        })
    )
}


export default UsersList