const express = require('express');
const router = express.Router();
router.use(express.json())
const Ucontroller = require('../controller/U-controller');
const {Authentication} = require('../middlware/U-middleware');

router.get('/signup',Ucontroller.signupGet);
router.post('/signup',Ucontroller.signupPost);
router.get('/login',Ucontroller.loginGet);
router.get('/verify/:id',Ucontroller.verify);
router.post('/login',Ucontroller.loginPost);
router.get('/dash',Ucontroller.dash);
router.get('/reset',Ucontroller.resetGet);
router.post('/reset',Authentication, Ucontroller.resetPost);
router.get('/forgot',Ucontroller.Getforgot);
router.post('/forgot',Ucontroller.forgotlink);
router.get('/forgot/:id',Ucontroller.forgot);
router.post(`/forgot/:id`,Ucontroller.forgotPost);


module.exports = router;