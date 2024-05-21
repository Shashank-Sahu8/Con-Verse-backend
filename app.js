const express=require('express');
const cors=require('cors');
const body_parser=require('body-parser');
const app=express();
const UserRouter=require('./routs/user.routs');

app.use(body_parser.json());

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials:true,
}))
app.use('/',UserRouter);
module.exports=app;
