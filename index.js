const express = require('express');
const app = express();
const config = require('./config.js');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const sha256 = require('sha256');
const mongoose = require('mongoose');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cookieParser());

app.set('view engine', 'ejs');
app.set('views', 'www');

let mongo_user = require('./mongo_user.js');

//checker

let checkAuth = async (req, res, next) => {
    if (req.cookies.user_id || req.cookies.user_email) {
        let user = await mongo_user.findOne({ _id: req.cookies.user_id, email: req.cookies.user_email });
        if (user) {
            next();
        } else {
            //clear cookies
            res.clearCookie('user_id');
            res.clearCookie('user_email');
            res.redirect('/login');
        }
    } else {
        res.redirect('/login?error=You must be logged in to view this page');
    }
};

//routes
app.get('/', (req, res) => {
    res.send('Home Page');
});

app.get('/login', (req, res) => {
    res.render('page.ejs');
});

app.post('/login', async (req, res) => {
    let {
        email,
        password
    } = req.body;
    if (!email || !password) return res.status(400).send('Missing email or password');
    password = sha256(password + config.salt);
    let user = await mongo_user.findOne({ email: email, password: password });
    if (user) {
        res.cookie('user_id', user._id);
        res.cookie('user_email', user.email);
        res.redirect('/dashboard');
    } else {
        res.redirect('/login?error=true&message=Invalid%20email%20or%20password');
    }
});

app.post('/signup', async (req, res) => {
    let {
        username,
        email,
        password
    } = req.body;
    if (!username || !email || !password) return res.status(400).send('Missing username, email or password');
    password = sha256(password + config.salt);
    let user = await mongo_user.findOne({ email: email });
    if (user) {
        res.redirect('/login?error=true&message=Email%20already%20exists');
    } else {
        let newUser = new mongo_user({
            username: username,
            email: email,
            password: password
        });
        await newUser.save().then(() => {
            res.cookie('user_id', newUser._id);
            res.cookie('user_email', newUser.email);
            res.redirect('/dashboard?message=Account%20created');
        });
    }
});

app.get('/dashboard', checkAuth, async (req, res) => {
    let user = await mongo_user.findOne({ _id: req.cookies.user_id, email: req.cookies.user_email });
    res.send(`Welcome ${user.username}`);
});

//Listen port
app.listen(config.port, () => {
    console.log('Listening on port ' + config.port);
});