const mongoose=require('mongoose');
const bcrypt = require('bcrypt');
const db=require('../db/db');


const userSchema=new mongoose.Schema({
    email:{
        type:String,
        lowercase:true,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
    }
},{timestamps:true});

userSchema.pre('save',async function(){
    try{
        var user=this;
        const salt=await(bcrypt.genSalt(10));
        const hashpassword=await bcrypt.hash(user.password,salt);

        user.password=hashpassword;
    }catch(err)
    {
        throw err;
    }
});

userSchema.methods.compairPassword=async function(userPassword){
    try{
        const isMatch=await bcrypt.compare(userPassword,this.password); 
        return isMatch;
    }catch(err){
        throw err;
    }
}

const User=mongoose.model("User",userSchema);
module.exports=User;