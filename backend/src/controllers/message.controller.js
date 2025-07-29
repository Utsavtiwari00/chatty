import Users from "../models/user.model.js"
import Message from "../models/message.model.js"
import cloudinary from "../lib/cloudinary.js"
import { getRecieverSocketId,io } from "../lib/socket.js";
export const getUserForSidebar=async(req,res)=>{
    try {
        const loggedInuserId=req.user._id;
        const filteredUsers=await Users.find({_id:{$ne:loggedInuserId}}).select("-password");

        res.status(200).json(filteredUsers);

    } catch (error) {
        console.log("Error is getUSersForSidebar: ",error.message);
        res.status(500).json({error: "Internal server error"});
        
    }
};
export const getMessages=async(req,res)=>{
    try {
        const {id:userToChatId}=req.params
        const myId=req.user._id;
        const messages =await Message.find({
            $or:[
                {senderId:myId,recieverId:userToChatId},
                {senderId:userToChatId,recieverId:myId}
            ]
        })
        res.status(200).json({messages})
    } catch (error) {
        console.log("Error is getMessages controller: ",error.message);
        res.status(500).json({error: "Internal server error"});
    }
}
export const sendMessage=async(req,res)=>{
    try {
        const {text,image}=req.body;
        const {id:recieverId}=req.params;
        const senderId=req.user._id;
        const { id: receiverId } = req.params;
        let imageUrl;
        if(image){
            const uploadResponse=await cloudinary.uploader.upload(image);
            imageUrl=uploadResponse.secure_url;
        }
        const newMessage=new Message({
            senderId,
            recieverId,
            text,
            image:imageUrl,
        });
        await newMessage.save();
        const recieverSocketId=getRecieverSocketId(recieverId);
        if(recieverSocketId){
            io.to(recieverSocketId).emit("newMessage",newMessage);
        }

        res.status(201).json(newMessage);
    } catch (error) {
        console.log("Error in sending Message: ",error.message);
        res.status(500).json({error: "Internal server error"});
    }
}
