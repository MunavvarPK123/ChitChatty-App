import { useEffect, useState } from "react";
import {  useNavigate } from "react-router-dom";
import { getLoggedUser, getAllUsers } from "../apiCalls/user";
import { useDispatch, useSelector} from "react-redux"
import {showLoader, hideLoader} from "../redux/loaderSlice"
import toast from "react-hot-toast"
import { setAllChats, setAllUsers, setUser } from "../redux/userSlice";
import { getAllChats } from "../apiCalls/chat";

function ProtectedRoute({children}){
    const { user } = useSelector(state => state.userReducer)
    const navigate = useNavigate()
    const dispatch = useDispatch()
    const [verified, setVerified] = useState(false);

    const getLoggedInUser = async () => {
        let response = null
        try{
            dispatch(showLoader())
            response = await getLoggedUser();
            dispatch(hideLoader())

            if (response.success){
                dispatch(setUser(response.data))
                setVerified(true);
            }else{
                toast.error(response.message)
                navigate('/login');
            } 
        }catch(error){
            dispatch(hideLoader())
            navigate('/login');
        }
    }

    const getAllUsersName = async () => {
        let response = null;
        try{
            dispatch(showLoader())
            response = await getAllUsers();
            dispatch(hideLoader())

            if (response.success){
                dispatch(setAllUsers(response.data))
            }else{
                toast.error(response.message)
                navigate('/login');
            } 
        }catch(error){
            dispatch(hideLoader())
            navigate('/login');
        }
    }

    const getCurrentUserChats = async () => {
        try {
            const response = await getAllChats();
            if(response.success){
                dispatch(setAllChats(response.data))
            }
        }catch(error){
            navigate('/login');
        }
  }

    useEffect(() => {
        if(localStorage.getItem('token')){
            getLoggedInUser();
            getAllUsersName();
            getCurrentUserChats();
        }else{
            navigate('/login');
        }
    },[]);

    if (!verified) {
    return <div>Loading...</div>;
  }

    return ( 
    <div>
       { children }
    </div>
    )
}

export default ProtectedRoute;