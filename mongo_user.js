const mongoose = require('mongoose');
const config = require('./config.js');

mongoose.connect(config.mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true }, (err) => {
    if (err) {
        console.log(err);
    } else {
        console.log('Connected to MongoDB');
    }
});

const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: String,
    email: String,
    password: String,
});

const User = mongoose.model('User', userSchema);
module.exports = User;