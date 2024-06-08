
const router=require('express').Router();
const UserController=require('../controllers/user.controller');
const Middleware=require('../middlewares/auth-middleware');

//  Public Routes

router.post('/registration',UserController.register);

router.post('/verify-email',UserController.verify_email);

router.post('/login',UserController.login);

router.post('/forgetpassword',UserController.forgetpassword);

router.post('/resetforgetpassword/:id/:token',UserController.resetforgetpassword);

//Protected Routes

router.post('/friend_request',Middleware.checkUserAuth,UserController.frendRequests);

router.post('/accept_request',Middleware.checkUserAuth,UserController.acceptRequests);

router.post('/showfriends',Middleware.checkUserAuth,UserController.showfriends);

router.post('/pendingRequests',Middleware.checkUserAuth,UserController.pendingRequests);

router.post('/sentPendingRequests',Middleware.checkUserAuth,UserController.sentPendingRequests);

router.get('/search_user',Middleware.checkUserAuth,UserController.search);

router.post('/logout',Middleware.checkUserAuth,UserController.logout);

router.post('/changepassword',Middleware.checkUserAuth,UserController.changePassword);

router.get('/userdata',Middleware.checkUserAuth,UserController.userdata);

module.exports=router;