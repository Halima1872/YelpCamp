//Requiring all the necessary things for our project 

//For development mode we will have env
if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const express = require('express')
const app=express()
const path = require('path')
const mongoose = require('mongoose');
const methodOverride = require('method-override')
const ejsMate = require('ejs-mate')
const ExpressError = require('./utils/ExpressError')

const campgroundRoutes = require('./routes/campgrounds')
const reviewRoutes = require('./routes/reviews')
const userRoutes = require('./routes/users')

const session = require('express-session')
const flash = require('connect-flash')

const passport = require('passport')
const LocalStrategy = require('passport-local')
const User = require('./models/user')
const mongoSanitize = require('express-mongo-sanitize');
//All the set up
mongoose.set('strictQuery', true);

app.set('view engine','ejs')
app.set('views',path.join(__dirname,'views'))
app.engine('ejs',ejsMate)
app.use(express.urlencoded({extended:true}))
app.use(methodOverride('_method'))
app.use(express.static(path.join(__dirname,'public'))) //Telling js to serve our public directory
app.use(mongoSanitize());

//Initially connecting the database
mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp')
.then(() => {
    console.log("Mongo Connection Established!")
}).catch((err) => {
    console.log("Mongo Failed to connect!")
    console.log(err)
});

const sessionConfig = {
    name: 'sessionID',
    secret : 'thisisasecret',
    resave: false,
    saveUninitialized: true,
    cookie : {
        httpOnly : true,
        //Localhost is not secure thus this option should use during deployment over a secure https network
        //secure : true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))
app.use(flash())

app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))
//add user to the session
passport.serializeUser(User.serializeUser())
//remove user from the session
passport.deserializeUser(User.deserializeUser())

app.use((req,res,next) =>{
    //if there is no user it will be undefined
    res.locals.currentUser = req.user
    res.locals.success = req.flash('success') //response local variable
    res.locals.error = req.flash('error')
    next()
})
app.use('/',userRoutes)
app.use('/campground', campgroundRoutes)
app.use('/campground/:id/reviews' , reviewRoutes)


app.get('/home',(req,res) => {
    res.render('home')
})

app.all('*', (req,res,next) =>{
    next(new ExpressError('Page Not Found',404))
})
//Error Handler
app.use((err,req,res,next) =>{
    const {statusCode = 500} =err
    if(!err.message) err.message="Something Went Wrong"
    res.status(statusCode).render('error',{err})
})


app.listen(3000,() => {
    console.log("Listening on port 3000")
})