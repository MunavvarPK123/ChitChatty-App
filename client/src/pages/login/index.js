import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../../apiCalls/auth";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { hideLoader, showLoader } from "../../redux/loaderSlice";

function Login(){
    const dispatch = useDispatch()
    const [user, setUser] = React.useState({
            email: '',
            password: ''
    });

    const navigate = useNavigate();

    async function onFormSubmit(event){
        event.preventDefault();
        dispatch(showLoader());
        const response = await loginUser(user);
        dispatch(hideLoader());
        
        if(response.success){
            toast.success(response.message);
            localStorage.removeItem("token");
            localStorage.setItem('token', response.token);
            navigate("/");
            window.location.reload();
        }else{
            toast.error(response.message);
        }
    }

    return (
        <div className="container">
            <div className="container-back-img"></div>
            <div className="container-back-color"></div>
            <div className="sign_up_page">
                <div className="sign_up_page_title">
                    <h1>Let's Login</h1>
                </div>
                <div className="form">
                    <form onSubmit={onFormSubmit}>
                        <input type="text" placeholder="Email" value = {user.email}
                            onChange={(e) => setUser({...user, email: e.target.value})}></input>
                        <input type="password" placeholder="Password" value = {user.password}
                            onChange={(e) => setUser({...user, password: e.target.value})}></input>
                        <button>Login</button>
                    </form>
                </div>
                <div className="sign_up_page_check">
                    <span> Don't have an account yet? 
                        <Link to= "/signup"> Signup Here</Link>
                    </span>
                </div>
            </div>
        </div>
    )
}

export default Login;