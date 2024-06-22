const UserModel=require('../models/user.model');
const jwt=require('jsonwebtoken');
const cloudinary=require('cloudinary').v2;

cloudinary.config({ 
    cloud_name: 'dh0iwk3em', 
    api_key: '459286182181928', 
    api_secret: '7j4GT2YYuSMphN6hlw38kKp10Zk' // Click 'View Credentials' below to copy your API secret
});

class UserService{
    static async registerUser(email,password,name,user_name,image)
    {
        try{
            const user=new UserModel({email,password,name,user_name,image});
            return await user.save();
        }catch(err){
            throw err;
        }
    }

    static async checkuser(email){
        try{
            return await UserModel.findOne({email});
        }catch(err)
        {
            throw err;
        }
    }

    static async genrateToken(tokenData,secretKey,jwt_expire){
        return jwt.sign(tokenData,secretKey,{expiresIn:jwt_expire});
    }


    static async uploadFile(filePath){
        try {
            const result=await cloudinary.uploader.upload(filePath);
            return result.secure_url;
        } catch (error) {
            console.log(error);
        }
    }

}

module.exports=UserService