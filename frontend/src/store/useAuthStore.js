import {create} from "zustand"
import { axiosInstance } from "../lib/axios"
import toast from "react-hot-toast";
import {io} from "socket.io-client";

const BASE_URL="http://localhost:5001"
export const useAuthStore=create((set,get)=>({
    authUser:null,
    isSigningUp:false,
    isUpdatingProfile:false,
    isLoggingIn:false,
    isCheckingAuth: true,
    socket:null,
    onlineUsers:[],
    checkAuth:async()=>{
        try {
            const res=await axiosInstance("/auth/check");
            set({authUser:res.data});
            get().connectSocket()
            
        } catch (error) {
            console.log("Error in CheckAuth:",error.message);
            set({authUser:null})
            
        }finally{
            set({isCheckingAuth:false})

        }
    },
    signup: async(data)=>{
        set({isSigningUp:true});
        try {
            const res=await axiosInstance.post("/auth/signup",data);
            toast.success("Account Created Successfully");
            set({authUser:res.data})
            get().connectSocket()
            
        } catch (error) {
            toast.error(error.response.data.message);
            
        }finally{
            set({isSigningUp:false})
        }
    },
    logout: async()=>{
        try{
        await axiosInstance.post("/auth/logout");
        set({authUser:null});
        toast.success("Logged Out successfully");
        get.disconnectSocket();
        }catch(error){
            toast.error(error.response.data.message);
            
        }
    },
    login: async(data)=>{
         set({isLoggingIn:true});
        try {
           
            const res=await axiosInstance.post("/auth/login",data);
            toast.success("Login successfull");
            set({authUser:res.data});
            get().connectSocket()
            
        } catch (error) {
            toast.error(error.response.data.message);
            
        }finally{
            set({isLoggingIn:false});
        }
    },
    updateProfile:async(data)=>{
        set({isUpdatingProfile:true});
        try {
            const res=await axiosInstance.put("/auth/updateProfile",data);
            toast.success("Profile Picture Updated Successfully!");
            set({authUser:res.data});
            
        } catch (error) {
              toast.error(error.response.data.message);
            
        }finally{
            set({isUpdatingProfile:false});
        }
    },
    connectSocket:()=>{
        const {authUser}=get();
        if(!authUser|| get().socket?.connected) return;

        const socket=io(BASE_URL,{
            query:{
                userId: authUser._id,
            },
    })
        socket.connect()
        set({socket:socket})
        socket.on("getOnlineUsers", (userIds)=>{
            set({onlineUsers:userIds});
        });
    },
    disconnectSocket:()=>{
        if(get().socket?.connected) get().socket.disconnect();
    },

}))
    
