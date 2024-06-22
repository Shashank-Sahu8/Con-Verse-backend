const mongoose=require('mongoose');
const bcrypt = require('bcrypt');
const db=require('../db/db');

const FriendRequestSchema = new mongoose.Schema({
    from: { type: String },
    accepted: { type: Boolean, default: false }
});

const SentRequestSchema = new mongoose.Schema({
    to: { type: String },
    accepted: { type: Boolean, default: false }
});

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
        trim:true
    },
    user_name:{
        type:String,
        required:true,
        trim:true,
        unique:true,
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
    },
    image:{
        type:String,
        trim:true
    },
     friendRequests: { type: [FriendRequestSchema], default: [] },
     sentRequests: { type: [SentRequestSchema], default: [] }
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