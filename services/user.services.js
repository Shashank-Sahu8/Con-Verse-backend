const UserModel=require('../models/user.model');
const jwt=require('jsonwebtoken');

class UserService{
    static async registerUser(email,password,name,user_name,notification_id)
    {
        try{
            const user=new UserModel({email,password,name,user_name,notification_id});
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

}

module.exports=UserService