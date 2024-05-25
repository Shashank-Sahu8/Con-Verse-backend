const mongoose=require('mongoose')
require('dotenv').config();

const connection=async()=>{
    try{
        await mongoose.connect("mongodb+srv://Shashank_Sahu:Shashank%40Sahu123@shashank.mftcvnz.mongodb.net/")
        console.log(`MongoDB connected`)
    }catch(error){
        console.log("Mongo DB connection error",error);
        process.exit(1)
    }
}



module.exports=connection;