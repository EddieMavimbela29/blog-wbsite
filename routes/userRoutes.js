const express = require('express');
const router = express.Router();
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const User = require('../models/user');
const Post = require('../models/post');

//HOMEPAGE
router.get('/', (req, res) => {
    res.send('welcome homie')
})

//noinspection JSCheckFunctionSignatures
router.get('/register', (req, res) => {
    res.render('default/register')
});

// Defining Local Strategy
passport.use(new LocalStrategy({
    usernameField: 'email',
    passReqToCallback: true
}, (req, email, password, done) => {
    User.findOne({ email: email }).then(user => {
        if (!user) {
            return done(null, false, req.flash('error-message', 'User not found with this email.'));
        }

        bcrypt.compare(password, user.password, (err, passwordMatched) => {
            if (err) {
                return err;
            }

            if (!passwordMatched) {
                return done(null, false, req.flash('error-message', 'Invalid Username or Password'));
            }

            return done(null, user, req.flash('success-message', 'Login Successful'));
        });

    });
}));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
        done(err, user);
    });
});


router.post('/register', (req, res) => {

    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;
    const passwordConfirm = req.body.passwordConfirm;
    let errors = [];

    if (!firstName) {
        errors.push({ message: 'First name is mandatory' });
    }
    if (!lastName) {
        errors.push({ message: 'Last name is mandatory' });
    }
    if (!email) {
        errors.push({ message: 'Email field is mandatory' });
    }
    if (!password || !passwordConfirm) {
        errors.push({ message: 'Password field is mandatory' });
    }
    if (password !== passwordConfirm) {
        errors.push({ message: 'Passwords do not match' });
    }

    if (errors.length > 0) {
        res.render('default/register', {
            errors: errors,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            email: req.body.email
        });
    } else {
        User.findOne({ email: req.body.email }).then(user => {
            if (user) {

                res.redirect('/login');
            } else {
                const newUser = new User(req.body);

                bcrypt.genSalt(10, (err, salt) => {
                    bcrypt.hash(newUser.password, salt, (err, hash) => {
                        newUser.password = hash;
                        newUser.save().then(user => {

                            res.redirect('/login');
                        });
                    });
                });
            }
        });
    }
});

router.get('/login', function(req, res) {
    res.render('default/login');
});

router.post('/login', passport.authenticate("local", {
    successRedirect: "/posts",
    failureRedirect: "/login"
}), function(req, res) {});

//USER - ROUTES
router.get('/users/:id', (req, res) => {
    User.findById(req.params.id, function(err, foundUser) {
        if (err) {
            req.flash("error", "User can't be accessed");
            res.redirect('/')
            console.log(err);
        }
        Post.find().where('author.id').equals(foundUser._id).exec(function(err, post) {
            if (err) {
                req.flash("error", "User can't be accessed");
                res.redirect('/')
                console.log(err);
            } else {
                res.render('dashboard', { user: foundUser, post: post });
            }
        })
    })
})

router.get('/logout', (req, res) => {
    req.logOut();
    req.flash('success', 'Logout was successful');
    res.redirect('/');
});

module.exports = router;