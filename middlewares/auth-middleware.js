const jwt=require('jsonwebtoken');
const User = require("../models/user.model");

exports.checkUserAuth=async(req,res,next)=>{
    let token;
    const {authorization}=req.headers;
    if(authorization &&authorization.startsWith('Bearer'))
        {
            try{
                token=authorization.split(' ')[1];

                const{_id}=jwt.verify(token,process.env.JWT_SECRET_KEY);

                req.user=await User.findById(_id);
                next();

            }catch(err)
            {
                console.log(err);
                 res.status(401).json({status:false,success:"Unauthorized User"});
            }
        }
        if(!token)
            {
                 res.status(401).json({status:false,success:"Unauthorized User"}); 
            }
}