const {Server} = require("socket.io");

const io = new Server(3001);

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
