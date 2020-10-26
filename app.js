const express = require('express');
const mongoose = require('mongoose');
const bodyParser  = require("body-parser");
const methodOverride = require('method-override');
const flash       = require("connect-flash");
const  passport    = require('passport');
const cloudinary = require('cloudinary').v2;
const expressValidator = require('express-validator');
const  app  = express();

//Routes
const postRoutes = require('./routes/postRoutes');
const commentRoutes = require('./routes/commentRoutes');
const userRoutes = require('./routes/userRoutes');
const AdminRoutes = require('./routes/adminRoutes');

// Connect to MongoDB
mongoose
    .connect(
      'mongodb://localhost:27017/blog',
      { useNewUrlParser: true,
       useUnifiedTopology: true }
    )
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.log(err));

app.use(bodyParser.urlencoded({extended: true}));    
app.use(express.static('public'));
app.set("view engine", "ejs");
app.use(methodOverride("newMethod"));
app.use(flash());

app.use(require('express-session')({
    secret: 'this is my 4th fullstack',
    resave: false,
    saveUninitialized: false
  }));
  
  // Passport Configuration
  app.use(passport.initialize());
  app.use(passport.session());
  
  app.use((req, res, next) => { 
      res.locals.error = req.flash("error");
      res.locals.success = req.flash("success");
      res.locals.currentUser = req.user;
      next();
   });
   //require moment
app.locals.moment = require('moment');
   
   app.use("/admin", AdminRoutes);
   app.use("/", userRoutes);
   app.use("/posts", postRoutes);
   app.use("/posts/:id/comments", commentRoutes);

 app.listen('150', () => {
  console.log('Connected to port 150')
 })