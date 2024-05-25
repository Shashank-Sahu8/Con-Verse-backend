const User = require("../models/user.model");
const  transporter  = require("../services/email_services");
const UserService = require("../services/user.services")
const bcrypt = require('bcrypt');
const jwt=require('jsonwebtoken');

exports.register=async(req,res,next)=>{
    try{
        const {email,password,name}=req.body;
        const user=await UserService.checkuser(email);
        if(user)
            {
                res.status(401).json({status:true,success:"User already registered"});
            }
        else if(email && password && name)
            {
                const successRes=await UserService.registerUser(email,password,name);

                const user=await UserService.checkuser(email);

                let tokenData={_id:user._id,email:user.email};

                const token=await UserService.genrateToken(tokenData,process.env.JWT_SECRET_KEY,'10d');

                res.status(200).json({status:true,token:token,success:"User Registered Successfully"});
            }
        else
            {    
                res.status(401).json({status:false,success:"All fields required"});
            }
    }catch(err)
    {
        return res.status(401).json({status:false,success:"Some error occurred while registering"});
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