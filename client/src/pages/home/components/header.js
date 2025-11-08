import { useDispatch, useSelector} from "react-redux"
import { useNavigate } from "react-router-dom";

function Header({socket}){
    const { user } = useSelector(state => state.userReducer)
    const navigate = useNavigate();
    function getFullname(){
        let fname = user?.firstname.at(0).toUpperCase() + user?.firstname.slice(1).toLowerCase()
        let lname = user?.lastname.at(0).toUpperCase() + user?.lastname.slice(1).toLowerCase();
        return fname + ' ' + lname;   
    }

    function getInitials(){
        let f = user?.firstname.toUpperCase()[0];
        let l = user?.lastname.toUpperCase()[0];
        return f + l
    }

    const logout = () => {
        localStorage.removeItem('token')
        navigate('/login')
        socket.emit('user-logout',user._id)
    }
    
    return (
        <div className="app_header">
            <div className="app_logo">
                <i className="fa-solid fa-comments" aria-hidden="true"></i>
                ChitChatty
            </div>
            <div className="app_user_profile">
                <div className="logged_user_name">{getFullname()}</div>
                { user?.profilePic && <img src={user?.profilePic} alt="profile-pic" className="logged_user_profile_pic" onClick={ () => navigate('/profile')}></img>}
                { !user?.profilePic && <div className="logged_user_profile_pic" onClick={ () => navigate('/profile')}>{getInitials()}</div>}
                <button className="logout-btn" onClick={ logout }>
                    <i className="fa-solid fa-power-off"></i>
                </button>
            </div>
        </div>
    )
}

export default Header