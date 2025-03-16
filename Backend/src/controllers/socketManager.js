import { Server } from "socket.io";

// Track connections, messages, and user times
let connections = {};
let messages = {};
let timeOnline = {};

export const connectToSocket = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
            allowedHeaders: ["*"],
            credentials: true
        }
    });

    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);

        // Handle joining a call
        socket.on("join-call", (path) => {
            if (!connections[path]) connections[path] = [];
            connections[path].push(socket.id);
            timeOnline[socket.id] = new Date();

            // Notify others that a user joined
            connections[path].forEach(id => {
                io.to(id).emit("user-joined", socket.id, connections[path]);
            });

            // Send previous messages to the new user
            if (messages[path]) {
                messages[path].forEach(msg => {
                    io.to(socket.id).emit("chat-message", msg.data, msg.sender, msg["socket-id-sender"]);
                });
            }
        });

        // Handle signaling for WebRTC
        socket.on("signal", (toId, message) => {
            io.to(toId).emit("signal", socket.id, message);
        });

        // Handle chat messages
        socket.on("chat-message", (data, sender) => {
            const matchingRoom = Object.entries(connections).find(([room, users]) => users.includes(socket.id))?.[0];

            if (matchingRoom) {
                messages[matchingRoom] = messages[matchingRoom] || [];
                messages[matchingRoom].push({ sender, data, "socket-id-sender": socket.id });
                console.log("message", matchingRoom, ":", sender, data);

                connections[matchingRoom].forEach(id => {
                    io.to(id).emit("chat-message", data, sender, socket.id);
                });
            }
        });

        // Handle user disconnection
        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
            const diffTime = Math.abs(timeOnline[socket.id] - new Date());
            delete timeOnline[socket.id];

            for (const [room, users] of Object.entries(connections)) {
                const index = users.indexOf(socket.id);
                if (index !== -1) {
                    users.forEach(id => io.to(id).emit("user-left", socket.id));
                    users.splice(index, 1);
                    if (users.length === 0) delete connections[room];
                }
            }
        });
    });

    return io;
};

// export default connectToSocket;
