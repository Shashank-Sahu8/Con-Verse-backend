const express=require('express');
const cors=require('cors');
const body_parser=require('body-parser');
const app=express();
const UserRouter=require('./routs/user.routs');
const helmet=require('helmet');
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
    windowMs: 3 * 60 * 1000, 
    max: 30, 
    message: 'Bado Badi Bado Badi !!'
  });


  app.use(limiter);
app.use(helmet());
app.use(body_parser.json());

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials:true,
}))
app.use('/',UserRouter); 
module.exports=app;
