import Header from "./components/header";
import Sidebar from "./components/sidebar";
import ChatArea from "./components/chat";
import { useSelector } from "react-redux";
import { io } from "socket.io-client";
import { use, useEffect, useState } from "react";

const socket = io('https://chitchatty-app-server.onrender.com');

function Home(){
    const { selectedChat, user } = useSelector( state => state.userReducer);
    const [onlineUser, setOnlineUser] = useState([]);
    useEffect (() => {
        if(user){
            socket.emit('join_room', user._id);
            socket.emit('user_login', user._id);
            socket.on('all_online_users', onlineusers => {
                setOnlineUser(onlineusers);
            })
            socket.on('online_users_updated', onlineusers => {
                setOnlineUser(onlineusers);
            })
        }
    }, [user, onlineUser])

    // Mobile UI behavior
    useEffect(() => {
        if (selectedChat && window.innerWidth <= 1000) {
            const chat = document.querySelector(".app_chat_area");
            const sidebar = document.querySelector(".side_bar");

            if (chat && sidebar) {
                chat.classList.add("active");
                sidebar.style.display = "none";
            }
        }
    }, [selectedChat]);

    return (
        <div className="home_page">
            <Header socket={socket}></Header>
            <div className="main_content">
                <Sidebar socket = { socket } onlineUser = {onlineUser} > </Sidebar>
                {selectedChat && <ChatArea socket={socket}></ChatArea>}
            </div>
        </div>
    )
}

export default Home;