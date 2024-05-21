const User = require("../models/user.model");
const UserService = require("../services/user.services")

exports.register=async(req,res,next)=>{
    try{
        const {email,password}=req.body;
        const user=await UserService.checkuser(email);
        if(user)
            {
                res.status(401).json({status:true,success:"User already registered"});
            }
            else 
            {
                const successRes=await UserService.registerUser(email,password);

                res.status(200).json({status:true,success:"User Registered Successfully"});
            }
    }catch(err)
    {
        throw err;
    }
}

exports.login=async(req,res,next)=>{
    try{
        const {email,password}=req.body;

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

        const token=await UserService.genrateToken(tokenData,"secretKey",'1h');

        res.status(200).json({status:true,token:token,success:"Login successfully"})
            
        
    }catch(err)
    {
        throw err;
    }
}