const app=require('./app');
const port=process.env.PORT || 8080;
const db=require('./db/db');
require('dotenv').config();
const User=require('./models/user.model')

db().then(()=>{
app.get('/',(req,res)=>{
    res.send(" ☠︎︎☠︎︎ KIA Backend Services ☠︎︎☠︎︎ ")
});

app.listen(port,()=>console.log("server live"));
}).catch((err)=>{console.log("connection to database failed:",err);})


// async function deleteUnverifiedUsers() {
//     try {
//         const users = await User.find({ verified: false });

//         const now = Math.floor(Date.now() / 1000);

//         for (const user of users) {
//             try {
//                 const decoded = jwt.verify(user.token, secret);
//                 // If the token is valid and not expired, skip this user
//                 if (decoded.exp > now) {
//                     continue;
//                 }
//             } catch (err) {
//                 // If token is expired or invalid, delete the user
//                 if (err.name === 'TokenExpiredError' || err.name === 'JsonWebTokenError') {
//                     await User.deleteOne({ _id: user._id });
//                     console.log(`Deleted user ${user.username} with expired token`);
//                 }
//             }
//         }
//     } catch (error) {
//         console.error('Error deleting unverified users:', error);
//     }
// }