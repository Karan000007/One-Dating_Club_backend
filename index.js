const express = require("express");
const app = express();
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");



app.use(express.json());
app.use(helmet());
app.use(morgan("common"));


const userRout = require('./routes/users');
const Login = require('./routes/login');

app.use('/api/Users', userRout)
app.use('/api/Login', Login)

app.listen(8080, () => {
    console.log("application is running");
});