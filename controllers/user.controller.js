const User = require("../models/user.model");
const  transporter  = require("../services/email_services");
const UserService = require("../services/user.services")
const bcrypt = require('bcrypt');
const jwt=require('jsonwebtoken');


exports.register=async(req,res,next)=>{
    try{
        const {email,password,name,user_name,notification_id}=req.body;
        const user=await UserService.checkuser(email);
        const uu=await User.findOne({user_name});
        if(uu)
            {
                res.status(401).json({status:true,success:"User Name already used"});   
            }
        else if(user)
            {
                res.status(401).json({status:true,success:"User already registered"});
            }
        else if(email && password && name&&notification_id && user_name)
            {
                const secret=process.env.JWT_SECRET_KEY;
                const token_verify =jwt.sign({email,password,name,user_name,notification_id},secret,{expiresIn:'10m'});
                const link=`${process.env.LINK}/${token_verify}`;  
                console.log(link);
                const info=await transporter.sendMail({
                    form:process.env.EMAIL_FROM,
                    to:email,
                    subject:"Keep It All - Verification Email",
                    html:`<a href=${link}>Click Here to Verify your email</a>`
                });

                res.status(200).json({status:true,success:"Verify your email"});  
            }
        else
            {    
                res.status(401).json({status:false,success:"All fields required"});
            }
    }catch(err)
    {
        console.log(err);
        return res.status(401).json({status:false,success:"Some error occurred while registering"});
    }
}

exports.verify_email=async(req,res)=>{
    const{token}=req.params;
    try{
        const decoded =jwt.verify(token,process.env.JWT_SECRET_KEY);
        const{email,password,name,user_name,notification_id}=decoded;

        const successRes=await UserService.registerUser(email,password,name,user_name,notification_id);

        const user=await UserService.checkuser(email);

        let tokenData={_id:user._id,email:user.email};

                const token_new=await UserService.genrateToken(tokenData,process.env.JWT_SECRET_KEY,'30d');

                res.status(200).json({status:true,token:token_new,success:"User Registered Successfully"}); 
            
    }catch(err)
    {
        console.log(err);
        return res.status(401).json({status:false,success:"Some error occoured"});   
    }

}

exports.login=async(req,res,next)=>{
    try{
        const {email,password}=req.body;

        if(!email || !password)
            {
                return res.status(401).json({status:false,success:"All fields required"});
            }
        const user=await UserService.checkuser(email);

        if(!user)
            {
               return res.status(401).json({status:false,success:"User dont exist"});
            }

        const isMatch=await user.compairPassword(password);
        if(isMatch==false)
            {
               return res.status(401).json({status:false,success:"Incorrect Password"});
            }
        let tokenData={_id:user._id,email:user.email};

        const token=await UserService.genrateToken(tokenData,process.env.JWT_SECRET_KEY,'10d');
        res.status(200).json({status:true,token:token,success:"Login successfully"})
            
        
    }catch(err)
    {
        return res.status(401).json({status:false,success:"Some error occurred while logging-in"});
    }
}

exports.changePassword=async(req,res,next)=>{
    try{
        const {old_password,new_password}=req.body;

        if(!old_password || !new_password)
            {
                return res.status(401).json({status:false,success:"All fields required"});
            }
        
        const isMatch= await bcrypt.compare(old_password,req.user.password);
        
        if(isMatch==false)
            {
               return res.status(401).json({status:false,success:"Incorrect Password"});
            } 

        const salt=await bcrypt.genSalt(10);
        const newhashedpassword=await bcrypt.hash(new_password,salt);

        await User.findByIdAndUpdate(req.user._id,{$set:{password : newhashedpassword}});
       
        res.status(200).json({status:true,success:"Password Updated successfully"});

    }catch(err)
    {
        console.log(err);
        return res.status(401).json({status:false,success:"Some error occurred while changing password"});   
    }
}

exports.userdata=async(req,res)=>{
    res.send({"name":req.user.name,"email":req.user.email,"token":req.user.token});
}

exports.forgetpassword=async(req,res)=>{
    const{email}=req.body;

    if(email)
        {
            const user=await UserService.checkuser(email);
        if(!user)
            {
               return res.status(401).json({status:true,success:"No such user exists"});
            }
            else{
                const secret=user._id+process.env.JWT_SECRET_KEY;
                const token =jwt.sign({_id:user._id},secret,{expiresIn:'15m'});
                const link=`${process.env.LINK}${user._id}/${token}`;  
                console.log(link);

                const info=await transporter.sendMail({
                    form:process.env.EMAIL_FROM,
                    to:user.email,
                    subject:"Keep It All - Reset your password",
                    html:`<a href=${link}>Click Here to reset your password</a>`
                });
                res.send({"status":"success","message":"reset password email have been send"})
            }

        }
    else
    {
        return res.status(401).json({status:false,success:"All fields are required"});   
    }
}

exports.resetforgetpassword=async(req,res)=>{
    const{password,confirm_password}=req.body;
    const{id,token}=req.params;
    const user=await User.findById(id);
    const new_token=user._id+process.env.JWT_SECRET_KEY;

    try{
        jwt.verify(token,new_token);
        if(password&&confirm_password)
            {
                if(password!==confirm_password)
                    {
                        return res.status(401).json({status:false,success:"Password not matching"});
                    }
                const salt=await bcrypt.genSalt(10);
                const newhashedpassword=await bcrypt.hash(password,salt);
                await User.findByIdAndUpdate(user._id,{$set:{password : newhashedpassword}});
                return res.status(200).json({status:true,success:"Password updated successfully"});   
            }
            else
            {
                return res.status(401).json({status:false,success:"All fields are required"});   
            }
    }catch(err)
    {
        return res.status(401).json({status:false,success:"Some error occoured"});   
    }
}

exports.frendRequests=async(req,res)=>{
    const { userId, friendId } = req.body;
    try {
        const user = await User.findOne({user_name:userId});
        const friend = await User.findOne({user_name:friendId});
        if (!user || !friend) {
            return res.status(404).send({ error: 'User not found!' });
        }
        const friendRequestExists = user.sentRequests.some(req => req.to === friendId);
        if (friendRequestExists) {
            return res.status(400).send({ error: 'Friend request already sent!' });
        }
        await User.updateOne(
            { user_name:userId },
            { $addToSet: { sentRequests: { to: friendId } } }
        );
        await User.updateOne(
            { user_name: friendId },
            { $addToSet: { friendRequests: { from: userId } } }
        );

        res.status(200).send({ message: 'Friend request sent!' });
    } catch (error) {
       console.log(error);
        res.status(500).send(error);
    }
}


exports.acceptRequests=async(req,res)=>{
    const { username, friendUsername } = req.body;
    try {

        const user = await User.findOne({user_name:username});
        if (!user) {
            return res.status(404).send({ error: 'User not found!' });
        }

        const friend = await User.findOne({ user_name: friendUsername });
        if (!friend) {
            return res.status(404).send({ error: 'Friend not found!' });
        }

        if (!user.friendRequests || !Array.isArray(user.friendRequests)) {
            return res.status(404).send({ error: 'User friend requests not found!' });
        }

        if (!friend.sentRequests || !Array.isArray(friend.sentRequests)) {
            return res.status(404).send({ error: 'Friend sent requests not found!' });
        }

        const friendRequest = user.friendRequests.find(req => req.from === friendUsername);
        if (!friendRequest) {
            return res.status(404).send({ error: 'Friend request not found!' });
        }
        friendRequest.accepted = true;

        const sentRequest = friend.sentRequests.find(req => req.to === username);
        if (sentRequest) {
            sentRequest.accepted = true;
        }

        await user.save();
        await friend.save();
        res.status(200).send({ message: 'Friend request accepted' });
    } catch (error) {
       console.log(error);
        res.status(500).send(error);
    }
}

exports.showfriends=async(req,res)=>{
    const { username } = req.body;
    try {
        const user = await User.findOne({ user_name:username });
        if (!user) {
            return res.status(404).send({ error: 'User not found!' });
        }

        const acceptedFriends = await User.find({
            'friendRequests.from': username,
            'friendRequests.accepted': true
        }).select('user_name');

        const acceptedUsers = await User.find({
            'sentRequests.to': username,
            'sentRequests.accepted': true
        }).select('user_name');

        const acceptedUsersAndFriends = [...acceptedFriends, ...acceptedUsers];
        res.status(200).send(acceptedUsersAndFriends);
    } catch (error) {
        console.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
}

exports.pendingRequests=async(req,res)=>{
    const{username}=req.body;
    try{
        const user = await User.findOne({ user_name:username });
        if (!user) {
            return res.status(404).send({ error: 'User not found!' });
        }
        const acceptedFriends = await User.find({
            'friendRequests.from': username,
            'friendRequests.accepted': false
        }).select('user_name');
        res.status(200).send(acceptedFriends);
    }catch(err)
    {
        console.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
}

exports.sentPendingRequests=async(req,res)=>{
    const{username}=req.body;
    try{
        const user = await User.findOne({ user_name:username });
        if (!user) {
            return res.status(404).send({ error: 'User not found!' });
        }
        const acceptedUsers = await User.find({
            'sentRequests.to': username,
            'sentRequests.accepted': false
        }).select('user_name');
        res.status(200).send(acceptedFriends);
    }catch(err)
    {
        console.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
}

exports.search=async(req,res)=>{
    const{query}=req.query;
    try{
        const users = await User.find({
            user_name: { $regex: query, $options: 'i' } 
        }).select('user_name');

        res.status(200).send(users);
    }catch(error)
    {
        console.error(error);
        res.status(500).send({ error: 'Internal Server Error' });
    }
}
exports.logout=(req,res)=>{

}