const mongoose=require('mongoose');
const bcrypt = require('bcrypt');
const db=require('../db/db');


const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true,
        validate: {
            validator: value => /^[a-zA-Z\s]{3,20}$/.test(value),
            message: 'Teamname is not valid',
           
        },
    },
    email:{
        type:String,
        lowercase:true,
        required:true,
        unique:true,
        trim:true,
        validate: {
            validator: value => /^[a-z]+[0-9.]+@gmail\.com$/.test(value),
            message: 'Email is not valid',
        },
    },
    password:{
        type:String,
        trim:true,
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