const express = require("express");
const app = express();
const https = require('https');
const http = require('http');
const dotenv = require("dotenv");
const helmet = require("helmet");
const morgan = require("morgan");

dotenv.config()

app.use(express.json());
app.use(helmet());
app.use(morgan("common"));

// var server = https.createServer({
//     key: fs.readFileSync("/etc/letsencrypt/live/onepercentdating.club/privkey.pem"),
//     cert: fs.readFileSync("/etc/letsencrypt/live/onepercentdating.club/fullchain.pem"),
//     requestCert: false,
//     rejectUnauthorized: false
// }, app);


var server = http.createServer({}, app);

const io = require("socket.io")(server);
io.on("connection", (socket) => {
    console.log("User Connected", socket.id);
    
    socket.on("disconnect", () => {
        console.log("user disconnected");
    });
    
    socket.on("add_to_room", (roomId) => {
        console.log("User Added to room", roomId);
        socket.join(roomId);
    });
    
    socket.on("leave_room", (roomId) => {
        console.log("User Left to room", roomId);
        socket.leave(roomId);
    });
    
    socket.on("typing_status", ({ room_id, value }) => {
        console.log("Socket Event Received : typing_status", room_id, value);
        socket.to(room_id).emit("typing_status", value);
    });
});
exports.io = io

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

// app.listen(5001, () => {
//     console.log("application is running");
    
    
    // });

server.listen(5001)

    
