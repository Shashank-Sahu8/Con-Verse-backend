const router=require('express').Router();
const UserController=require('../controllers/user.controller');
const Middleware=require('../middlewares/auth-middleware');

//  Public Routes

router.post('/registration',UserController.register);

router.post('/login',UserController.login);
router.post('/forgetpassword',UserController.forgetpassword);
router.post('/resetforgetpassword/:id/:token',UserController.resetforgetpassword);
//Protected Routes

router.post('/changepassword',Middleware.checkUserAuth,UserController.changePassword);

router.get('/userdata',Middleware.checkUserAuth,UserController.userdata);

module.exports=router;