const express = require("express");
const app = express();
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");

dotenv.config()

app.use(express.json());
app.use(helmet());
app.use(morgan("common"));


const userRout = require('./routes/users');
const Login = require('./routes/login');
const Matches = require('./routes/matches');




app.use('/api/Users', userRout)
app.use('/api/Login', Login)
app.use('/api/Matches', Matches)


app.listen(5001, () => {
    console.log("application is running");
});