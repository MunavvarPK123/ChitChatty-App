import { useDispatch, useSelector } from "react-redux";
import moment from "moment";
import { useEffect, useState } from "react";
import { uploadProf } from "../../apiCalls/user";
import { hideLoader, showLoader } from "../../redux/loaderSlice";
import toast from "react-hot-toast";
import { setUser } from "../../redux/userSlice"

function Profile(){
    const { user } = useSelector(state => state.userReducer);
    const [ image, setImage ] = useState('');
    const dispatch = useDispatch()

    useEffect(() => {
        if(user?.profilePic){
            setImage(user.profilePic)
        }
    })

    function getInitials(){
        let f = user?.firstname.toUpperCase()[0];
        let l = user?.lastname.toUpperCase()[0];
        return f + l
    }

    function getFullname(){
        let fname = user?.firstname.at(0).toUpperCase() + user?.firstname.slice(1).toLowerCase()
        let lname = user?.lastname.at(0).toUpperCase() + user?.lastname.slice(1).toLowerCase();
        return fname + ' ' + lname;   
    }

    const onFileSelect = async (e) => {
        const file = e.target.files[0];
        const reader = new FileReader(file);
        reader.readAsDataURL(file)
        reader.onloadend = async () => {
            setImage(reader.result)
        }

    }
    
    const updateProfPic = async () => {
        try{
            dispatch(showLoader())
            const response = await uploadProf(image);
            dispatch(hideLoader())

            if(response.success){
                toast.success(response.message);
                dispatch(setUser(response.data));
            }else{
                toast.error(response.message)
            }
        }catch(err){
            toast.error(err.message)
            dispatch(hideLoader())
        }
    }

    return( 
        <div className="prof_page_container">
            <div className="prof_pic_container">
                { image && <img src = {image} alt = "Profile Pic" className="user_prof_pic_upload"/>}
                { !image && <div className="user_default_prof_pic">
                    { getInitials() }
                </div>
                }
            </div>
            <div className="prof_info_container">
                <div className="user_prof_name">
                    <h1>{ getFullname() }</h1>
                </div>
                <div>
                    <b>Email : </b> { user?.email }
                </div>
                <div>
                    <b>Account Created : </b> { moment( user?.createdAt).format('MMM-DD-YYYY') }
                </div>
                <div className="select_prof_pic_container">
                    <input type="file" onChange={ onFileSelect } />
                    <button className="upload_img_btn"  style={{cursor: "pointer"}} onClick={updateProfPic}>
                        Upload
                    </button>
                </div>
            </div>
        </div>
    )

}

export default Profile;