import express from 'express';
import cors from 'cors';
import "dotenv/config";
import http from 'http';
import { connectDB } from './lib/db.js';
import userRouter from './routes/userRoutes.js';
import messageRouter from './routes/messageRouts.js';
import { Server } from 'socket.io';


//create express app and http server

const app = express();
const server = http.createServer(app);

//initialize socket.io server
export const io = new Server(server, {
    cors: {origin: "*"}
})

//store online users
export const userSocketMap ={}; // {userId: socketId }

//Socket.io Conection handler
io.on("connection",(socket)=>{
    const userId = socket.handshake.query.userId;
    console.log("User Connected", userId);

    if(userId) userSocketMap[userId]= socket.id;

    //Emit online users to all connected client
    io.emit("getOnlineUsers",Object.keys(userSocketMap));

    socket.on("disconnect",()=>{
        console.log("User disconnected", userId);
        delete userSocketMap[userId];
        io.emit("getOnlineUsers",Object.keys(userSocketMap))
    })
})
//middlewares
app.use(express.json({ limit: '4mb' }));
app.use(cors());

//route setup
app.use('/api/status', (req, res)=>res.send('Server is live...'));
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter)


//Connect to DB
await connectDB();

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
