const mongoose=require('mongoose')
require('dotenv').config();

const connection=async()=>{
    try{
        await mongoose.connect(process.env.MONGODB_URI)
        console.log(`MongoDB connected`)
    }catch(error){
        console.log("Mongo DB connection error",error);
        process.exit(1)
    }
}



module.exports=connection;