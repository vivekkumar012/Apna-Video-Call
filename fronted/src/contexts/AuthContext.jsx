import axios from "axios";
import httpStatus from "http-status";
import { createContext, useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import server from "../environment";




export const AuthContext = createContext({});

const client = axios.create({
    baseURL: `${server}/api/v1/users`
})

export const AuthProvider = ({children}) => {

    const authContext = useContext(AuthContext);
    const [userData, setUserData] = useState(authContext);
    const navigate = useNavigate();

    const handleRegister = async(name, username, password) => {
        try{
            let request = await client.post("/register", {
                name: name,
                username: username,
                password: password
            });
            if(request.status === httpStatus.CREATED) {
                return request.data.message;
            }
        } catch(err) {
            throw err;
        }
    }

    const handleLogin = async (username, password) => {
        try {
            let request = await client.post("/login", {
                username: username,
                password: password
            });

            if(request.status === httpStatus.OK) {
                localStorage.setItem("token", request.data.token);
                navigate("/home");
                return request.data.message;
            }
        } catch(err) {
            throw err;
            // console.error("Login failed:", err.response?.data || err.message);
            // alert(err.response?.data?.message || "Failed to log in. Please try again.");
        }
    }

    const getHistoryOfUser = async () => {
        try {
            let request = await client.get("/get_all_activity", {
                params: {
                    token: localStorage.getItem("token")
                }
            });
            return request.data;
        } catch (err) {
            throw err;
        }
    }

    const addToUserHistory = async (meetingCode) => {
        try {
            let request = await client.post("/add_to_activity", {
                token: localStorage.getItem("token"),
                meeting_code: meetingCode
            });
            return request
        } catch (e) {
            throw e;
        }
    }


    const data = {
        userData, setUserData, getHistoryOfUser, addToUserHistory, handleRegister, handleLogin
    }

    return(
        <AuthContext.Provider value={data}>
            {children}
        </AuthContext.Provider>
    )
}