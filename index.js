const express = require("express");
const app = express();
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");
require('./routes/socket.js')
dotenv.config()

app.use(express.json());
app.use(helmet());
app.use(morgan("common"));


const userRout = require('./routes/users');
const Login = require('./routes/login');
const Matches = require('./routes/matches');

const Industry = require('./routes/industry');

const Sendmail = require('./routes/sendemail');
const chat = require('./routes/chat.js');

app.use('/api/Users', userRout)
app.use('/api/Login', Login)
app.use('/api/Matches', Matches)
app.use('/api/industry', Industry)
app.use('/api/Sendmail', Sendmail)
app.use('/api/chat', chat)

app.listen(5001, () => {
    console.log("application is running");
    

});

