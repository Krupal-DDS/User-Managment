require('dotenv').config()
const User = require("../model/U-model");
const validator = require("validator");
const bcrypt = require("bcrypt");
const sendEmail = require("../model/U-nodemailer");
const jwt = require("jsonwebtoken"); 

//create token
const extime = 3 * 24 * 60 * 60;
const createtoken = (id) => {
  return jwt.sign({id},process.env.JWT_SECRET_KEY,{
    
  });
};

//get signpage page
const signupGet = async (req, res) => {
  res.render("U-signup.ejs");
};

//get login page
const loginGet = async (req, res) => {
  res.render("U-login.ejs");
};


//post or create user
const signupPost = async (req, res) => {
  const { username, email, password, cpassword } = req.body;
  console.log(req.body); 
  try {
    if (!username || !email || !password || !cpassword) {
      res.status(400).json("please enter a all details");
    } else {
      if (!validator.isEmail(req.body.email)) {
        res.status(400).json("please enter a valid email");
      } else {
        const strongPassword = new RegExp("(?=.*[a-z])(?=.*[0-9])(?=.*[^a-z0-9])(?=.{8,})");
        if (!strongPassword.test(password.trim())) {
          return res.status(400).json({
            message:
            "Password must have 8 character include(alphabate,num and special character)",
          });
        } else {
          const person = await User.findOne({ email: req.body.email });
          if (!person) {
            if (req.body.password == req.body.cpassword) {
              const hashpassword = await bcrypt.hash(req.body.password, 10);
              const newuser = await new User({...req.body,password: hashpassword});
              newuser.save()
              .then(async (result) => {
                console.log("mail in");                
                const message = `http://localhost:9999/verify/${newuser.id}`;
                await sendEmail(req.body.email,'New User verification link', message);
                console.log(message);
                return res.status(200).json({ message: result });
              })
              .catch((error) => {
                return res
                .status(400)
                .json({ code: 400, message: error.message });
              });
            } else {
              res.status(400).json("password is not match");
            }
          } else {
            res.status(400).json("User is already registered");
          }
        }
      }
    }
  } catch (error) {
    res.status(500).json({ code: 500, message: error.message });
  }
};

//verify the User 
const verify = async (req, res) => { 
  try {    
    const user = await User.findOne({ _id: req.params.id });
    if (!user){
      return res.status(400).send("Invalid link");
    }else{      
        user.status = "active";
        user.save();
        console.log('user verified');
        res.render('U-verify.ejs');
    }    
  } catch (error) {
    res.status(400).send("An error occured");
  }
};

//for login user
const loginPost = async (req, res) => {
  const { email, password } = req.body;
  console.log(req.body);
  if (!validator.isEmail(req.body.email)) {
    res.status(404).json("please enter a valid email");
  } else {
    const userlogin = await User.findOne({ email: email });
    if (userlogin) {
      if(userlogin.status != 'active'){
        res.status(404).json('User is not verified please verified first !!');          
      }else{
        const validate = await bcrypt.compare(password, userlogin.password);
          if (validate) {
            const token = createtoken(userlogin.id);              
            res.status(200).json({
                id: userlogin.id,
                email: userlogin.email,
                token: token,
                message: "User login successfully",
              });
          } else {
            res.status(404).json("please enter valid password");
          }
      }      
    } else {
      res.status(404).json("User is not find please register first");
    }
  }
};

//Get the reset Pass Page
const resetGet = async (req,res)=>{
  res.render('U-reset.ejs');
}

//update password when you remeber old password
const resetPost = async (req, res) => {
console.log(req.user.id);
const {oldpass ,newpass ,newcpass} = req.body;
const user = await User.findOne({_id : req.user.id})  
console.log(user.password);
if(!user){
  res.status(404).json("User is not exist please signup");
}else{       
  const validate = await bcrypt.compare(oldpass, user.password);
      
      if(!validate){        
        res.status(400).json('your password is not match !!')
      }else{
        const strongPassword = new RegExp("(?=.*[a-z])(?=.*[0-9])(?=.*[^a-z0-9])(?=.{8,})");        
        if (!strongPassword.test(newpass.trim())) {
            res.status(400).json({message:"Password must have 8 character include(alphabate,num and special character)"});
        }else{          
          if(newpass == newcpass){
            const hashpassword = await bcrypt.hash(newpass, 10);            
            user.password = hashpassword;                     
            await user.save();       
            res.status(200).json({message:"Password Reset Successfully"});
          }else{
            res.status(404).json('New Passwords does not match');
          }
        }         
      }
    }
}

//show forgot email page
const Getforgot = async (req,res)=>{  
  res.render('U-forgot-email.ejs');
}

//send the forget passwrod link
const forgotlink = async (req,res)=>{
  const {email} = req.body;
  const user = await User.findOne({email})
  if(!user){
    res.status(404).json('User is not found !!');
  }else{
    const link = `http://localhost:9999/forgot/${user.id}`;
    console.log(user.id);
    await sendEmail(req.body.email,'forgot password link', link);    
    return res.status(200).json({ message: 'Email send successfully'});
  }
}

//verification user onclick on link in mail
const forgot = async (req, res) => {  
  try {    
    const user = await User.findOne({_id :req.params.id});
    console.log(user,"----");
    if (!user){
      return res.status(400).send("Invalid link");
    }else{      
      res.render('U-forgot.ejs',{id : user._id});
    }    
  } catch (error) {
    res.status(400).send("An error occured");
  }
};

//update the password at time of forget
const forgotPost = async(req,res)=>{
  const { newpass , cnewpass} = req.body;  ;
  const user = await User.findOne({_id : req.params.id});
  console.log(user);
  if(!user){
    res.status(404).json("User is not found")
  }else{
    const strongPassword = new RegExp("(?=.*[a-z])(?=.*[0-9])(?=.*[^a-z0-9])(?=.{8,})");        
    if (!strongPassword.test(newpass.trim())) {
        res.status(400).json({message:"Password must have 8 character include(alphabate,num and special character)"});
    }else{
      if(newpass != cnewpass){
        res.status(400).json("Passwords Is not match");
      }else{
        const hashpassword = await bcrypt.hash(newpass, 10);        
        user.password = hashpassword;
        console.log(user.password);
        const update = await user.save();

        console.log(update, "-------");
        res.render("U-login.ejs");
      }
    }
  }
}

//get dahsboard
const dash = async(req,res)=>{  
res.render('U-dashboard.ejs');
}

module.exports = {
  signupGet,
  loginGet,
  signupPost,
  verify,
  loginPost,
  dash,
  resetPost,
  resetGet,
  forgotlink,
  Getforgot,
  forgot,
  forgotPost
};
