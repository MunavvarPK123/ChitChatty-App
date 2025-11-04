import { useDispatch, useSelector } from "react-redux"
import { createNewMessage, getAllMessages } from "../../../apiCalls/message";
import { hideLoader, showLoader } from "../../../redux/loaderSlice";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";
import moment from "moment";
import { clearUnreadMsgCount } from "../../../apiCalls/chat";
import store from './../../../redux/store'
import { setAllChats } from "../../../redux/userSlice";
import EmojiPicker from "emoji-picker-react";

function ChatArea({ socket }){
    const dispatch = useDispatch();
    const { selectedChat, user, allChats} = useSelector (state => state.userReducer); 
    const selectedUser = selectedChat.members.find( u => u._id !== user._id)
    const [ message, setMessage] = useState('');
    const [ allMessages, setAllMessages] = useState([]);
    const [ isTyping, setIsTyping ] = useState(false);
    const [ showEmojiPicker, setShowEmojiPicker] = useState(false)
    const [ data, setData ] = useState(null);

    const sendMessage = async( image ) => {
        try{
            const newMessage = {
                chatId: selectedChat._id,
                sender: user._id,
                text: message,
                image : image
            }

            socket.emit('send_msg',{
                ...newMessage,
                members: selectedChat.members.map(m => m._id),
                read : false,
                createdAt: moment().format("YYYY-MM-DD HH:mm:ss")
            })

            const response = await createNewMessage(newMessage);

            if(response.success){
                setMessage('');
                setShowEmojiPicker(false)
            }
        }catch(error){
            toast.error(error.message);
        }
    }

    const getMessages = async() => {
        try{
            dispatch(showLoader())
            const response = await getAllMessages(selectedChat._id);
            dispatch(hideLoader())
            
            if(response.success){
                setAllMessages(response.data);
            }
        }catch(error){
            dispatch(hideLoader())
            toast.error(error.message);
        }
    }

    const clearUnreadMessages = async() => {
        try{
            socket.emit('clear_unread_msgs',{
                chatId : selectedChat._id,
                members : selectedChat.members.map(m => m._id)
            })
            const response = await clearUnreadMsgCount(selectedChat._id);
            
            if(response.success){
                allChats.map(chat => {
                    if(chat._id === selectedChat._id){
                        return response.data;
                    }
                    return chat;
                })
            }
        }catch(error){
            toast.error(error.message);
        }
    }

    function formatName (user){
        let fname = user.firstname.at(0).toUpperCase() + user.firstname.slice(1).toLowerCase()
        let lname = user.lastname.at(0).toUpperCase() + user.lastname.slice(1).toLowerCase();
        return fname + ' ' + lname;   
    }

    const sendImg = async (e) => {
        const file = e.target.files[0];
        const reader = new FileReader(file);
        reader.readAsDataURL(file);
        reader.onloadend = async () => {
            sendMessage(reader.result);
        }
    }

    useEffect(() => {
        getMessages();
        if(selectedChat?.lastMessage?.sender !== user._id){
            clearUnreadMessages();
        }

        socket.off('recv_msg').on('recv_msg',(message) => {
            const selectedChat = store.getState().userReducer.selectedChat
            if(selectedChat._id === message.chatId){
                setAllMessages( prevmsg => [...prevmsg, message] )
            }

            if( selectedChat._id === message.chatId && message.sender !== user._id){
                clearUnreadMessages()
            }
        })

        socket.on('msg_count_cleared', data => {
            const selectedChat = store.getState().userReducer.selectedChat
            const allChats = store.getState().userReducer.allChats
            
            if(selectedChat._id === data.chatId){
                //update unread msg count
                const updatedChats = allChats.map(chat =>{
                    if(chat._id === data.chatId){
                        return { ...chat, unreadmsgCount: 0}
                    }
                    return chat;
                })
                dispatch(setAllChats(updatedChats))

                //Updating read property
                setAllMessages(prevMsgs => {
                    return prevMsgs.map(msg => {
                        return {...msg, read: true}
                    })
                })
            }
        })

        socket.on('typing_started', (data) => {
            setData(data)
            if(selectedChat._id === data.chatId && data.sender !== user._id){
                setIsTyping(true);
                setTimeout(() =>{
                    setIsTyping(false);
                },2000)
            }
        })

    }, [selectedChat])

    useEffect( () => {
        const msgContainer = document.getElementById('chat_area')
        msgContainer.scrollTop = msgContainer.scrollHeight;
    }, [allMessages, isTyping])

    const formatTime = (timestamp) => {
        const now = moment()
        const diff = now.diff(moment(timestamp), 'days')
        if(diff < 1)
            return `Today ${moment(timestamp).format('hh:mm A')}`;
        else if(diff === 1)
            return `Yesterday ${moment(timestamp).format('hh:mm A')}`;
        else
            if(diff < 1)
            return moment(timestamp).format('MMM D, hh:mm A');
    }

    return <>
            {
                selectedChat && <div className="app_chat_area">
                    <div className="app_chat_area_header">
                            { formatName(selectedUser) }
                    </div>
                    <div className="chat_area" id="chat_area"> 
                        { allMessages.map(msg =>{
                            const isCurrentUserSender = msg.sender === user._id;
                            return <div className="msg_container" style={isCurrentUserSender ? {justifyContent: 'end'} : {justifyContent: 'start'}}>
                                <div>
                                    <div className={ isCurrentUserSender ? "send_msg" : "rcv_msg"}>
                                        <div> { msg.text} </div>
                                        <div> { msg.image && <img src={msg.image} alt = "image" height="120" width="120"></img>}</div>
                                    </div>
                                    <div className="msg_timestamp" style={isCurrentUserSender ? {float : 'right'} : {float : "left"}}> 
                                        { formatTime(msg.createdAt) } { isCurrentUserSender && msg.read &&
                                            <i className="fa fa-check-circle" aria-hidden="true" style={{color : "blue"}}></i>}
                                    </div>
                                </div>
                            </div>
                        })}
                        <div className="typing_indicator">
                            { isTyping && selectedChat?.members.map( m => m._id ).includes(data?.sender) && <i> Typing... </i>}</div>
                        </div>

                    {showEmojiPicker && <div style={{width : '100%', display: 'flex', padding:'0px 20px', justifyContent:'right'}}>
                        <EmojiPicker style={{width:'300px', height:'400px'}} onEmojiClick={(e) => setMessage(message + e.emoji)}></EmojiPicker>
                    </div>}

                    <div className = "send_msg_div">
                        <input type="text" className="send_msg_input" placeholder="Type a Message" value = {message} 
                            onChange={ (e) => {
                                setMessage(e.target.value)
                                socket.emit('user_typing',{
                                    chatId: selectedChat._id,
                                    members: selectedChat.members.map(m => m._id),
                                    sender : user._id
                                })
                            }}

                            onKeyDown={(e) => {
                                if (e.key === "Enter") sendMessage();
                        }}/>

                        <label for= "file">
                            <i className="fa-solid fa-image send-img-btn"></i>
                        <input 
                            type = "file"
                            id = "file"
                            style={{ display : 'none'}}
                            accept="image/jpg, image/png, image/jpeg, image/gif"
                            onChange={sendImg}>
                        </input>
                        </label>
                        <button className="fa-regular fa-face-smile send-emoji-btn" aria-hidden = "true" onClick={ () => { setShowEmojiPicker(!showEmojiPicker)} }></button> 
                        <button className="fa-solid fa-paper-plane send-message-btn" aria-hidden = "true" onClick={ () => sendMessage('') }></button> 
                    </div>
                </div>
            }
        </>
}

export default ChatArea;