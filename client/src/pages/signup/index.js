import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { signUpUser } from "../../apiCalls/auth";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { hideLoader, showLoader } from "../../redux/loaderSlice";

function Signup(){
    const navigate = useNavigate()
    const dispatch = useDispatch();
    const [user, setUser] = React.useState({
    firstname: '',
    lastname: '',
    email: '',
    password: ''
    });
    
    async function onFormSubmit(event){
        event.preventDefault();
        let response = null;
        try{
            dispatch(showLoader());
            response = await signUpUser(user);
            dispatch(hideLoader());
            
            if(response.success){
                toast.success(response.message);
                navigate("/login")
            }else{
                toast.error(response.message);
            }
        }catch(err){
            dispatch(hideLoader());
            toast.error(response.message);
        }
    }

    return (
        <div className="container">
            <div className="container-back-img"></div>
            <div className="container-back-color"></div>
            <div className="sign_up_page">
                <div className="sign_up_page_title">
                    <h1>Create Account</h1>
                </div>
                <div className="form">
                    <form onSubmit={onFormSubmit}>
                        <div className="columns">
                            <input type="text" placeholder="First Name" value = {user.firstname} 
                                onChange={(e) => setUser({...user, firstname: e.target.value})}></input>
                            <input type="text" placeholder="Last Name" value = {user.lastname}
                                onChange={(e) => setUser({...user, lastname: e.target.value})}></input>
                        </div>
                        <input type="text" placeholder="Email" value = {user.email}
                            onChange={(e) => setUser({...user, email: e.target.value})}></input>
                        <input type="password" placeholder="Password" value = {user.password}
                            onChange={(e) => setUser({...user, password: e.target.value})}></input>
                        <button>Sign Up</button>
                    </form>
                </div>

                <div className="sign_up_page_check">
                    <span> Already have an account? 
                        <Link to= "/login"> Login Here</Link>
                    </span>
                </div>
            </div>
        </div>
    )
}

export default Signup;