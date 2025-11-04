import { useState } from "react";
import Search from "./search"
import UsersList from "./userList";

function Sidebar({ socket, onlineUser }){
    const [searchKey, setSearchKey] = useState('')
    return(
        <div className="side_bar">
            <Search
                searchKey = {searchKey}
                setSearchKey = {setSearchKey}>
            </Search>
            <UsersList 
                searchKey = {searchKey} 
                socket = {socket}
                onlineUser = {onlineUser}>
            </UsersList>
        </div>
    )
}

export default Sidebar ;