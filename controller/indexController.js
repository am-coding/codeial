const User = require('../models/user');
const Message = require('../models/message');
const validator = require('express-validator');
var passport = require('passport');
var bcrypt = require('bcrypt');
const { check, validationResult } = require('express-validator');
const { forwardAuthenticated } = require('../config/auth');


//validate fields
const validateAndSanitize = [
    validator.body('firstname','firstname cannot be empty and cannot have special characters')
    .trim()
    .isLength({min:1})
    .isAlphanumeric(),
    validator.body('lastname','lastname cannot be empty and cannot have special characters')
    .trim()
    .isLength({min:1})
    .isAlphanumeric(),
    validator.body('username','username cannot be empty and cannot have special characters')
    .trim()
    .isLength({min:1})
    .isAlphanumeric(),
    validator.body('password','firstname cannot be empty and cannot have special characters')
    .trim()
    .isLength({min:1})
    .isAlphanumeric(),
    validator.body('confirm_password', 'Passwords do not match, try again')
		.not()
		.isEmpty()
		.exists()
		.custom((value, { req }) => value === req.body.password),
    validator.sanitizeBody(
		['userName', 'firstName', 'lastName', 'password', 'confirm_password']
	).escape()
]
//home page
exports.index = function(req,res,next)
{
    res.render('index');
};
//sign up get
exports.signUp_get = (req,res)=>
{
    
    res.render('signUp');
};
//sign up post
exports.signUp_post =
[
    validateAndSanitize,
    
   
    (req,res,next)=>
    {
        const {firstname, lastname, username, password} = req.body;
        console.log(req.body.password);
        console.log(req.body.confirm_password);
        const formErrors = [];
        const errors = validator.validationResult(req);
        /*if(!errors.isEmpty())
        {
            console.log(`errors: ${JSON.stringify(errors)}`);
            res.render('signUp',{errors: errors});
        }*/
        if (!errors.isEmpty()) 
        {
            res.render('signup', {
              title: 'Sign Up',
              
              errors: errors.array()
            })
            return
          }
        else
        {
            User.findOne({username: username})
        .then(user =>
            {
                if(user)
                {
                    console.log('username already exsits');
                    res.render('signUp',{user:user});
                }
                else{
                    bcrypt.genSalt(10, (err,salt)=>
                    {
                        if(err)
                        {
                            console.log(err);
                            throw err;
                        }
                        bcrypt.hash(password,salt,(err,hashedPassword)=>
                        {
                            if(err)
                            {
                                console.log(err);
                                throw err;
                            }
                            const newUser = new User(
                                {
                                    firstname: firstname,
                                    lastname: lastname,
                                    username: username,
                                    password: hashedPassword
                                }
                            )
                            newUser.save(err=>
                                {
                                    if(err)
                                    {
                                        console.log(err);
                                        throw err;
                                    }
                                    console.log("sign up successfully!! login to view all messages");
                                    res.redirect('/login');
                                });

                        })

                    })
                }
            })
    }
}
]

//login get
exports.login_get = (req,res)=>
{
    //console.log(user._id);
    if(req.sessionId)
    {
        return res.render("you are already logged in!!!")
    }
    res.render('login',{user: req.user});
}
//login post 


exports.login_post = (req,res,next)=>
{
    console.log("inside login post");
    passport.authenticate('local',{
        successRedirect:'/messages',
        failureRedirect:'/login',
        failureFlash: true
    })(req,res,next);
}
//create message get request
exports.create_message_get = (req,res)=>
{
    console.log(req.user);
   if(!req.user)
    {
        res.redirect('login',{message: "you need to login to view all the messages"});
    }
    res.render('create-message');
}
//validate resulta before message post
const validateAndSanitizeMessages = [
    validator.body('title','title cannot be empty')
    .trim()
    .isLength({min:1}),
    validator.body('message','messgae cannot be empty')
    .trim()
    .isLength({min:1}),
    validator.sanitizeBody(
		['title', 'message']
	).escape()
]
//create message post request
exports.create_message_post = (req,res,next)=>
{
    validateAndSanitizeMessages,
        console.log(req.user);
    const message = new Message(
        {
            msg_title: req.body.title,
            msg: req.body.message,
            //user: req.user.id
        }
    ).save(err=>
        {
            if(err)
            {
                return next(err);
            }
            res.redirect('/messages');
        });
        

};
//display all messages
exports.get_messages = (req,res,next)=>
{
    Message.find({})
    .exec((err,messages)=>
    {
        if(err)
        {
            return next(err);
        }
        res.render('all_messages',{messages:messages});
    });
};