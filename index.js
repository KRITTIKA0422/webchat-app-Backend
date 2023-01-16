import express from "express";
import cors from "cors";
import { MongoClient } from "mongodb";
import dotenv from "dotenv";
import {userRoutes} from "./routes/userRoutes.js";
import { createServer } from 'http';
import { Server } from 'socket.io'; 
dotenv.config();
const app=express();
app.use(cors());
app.use(express.json());
const PORT=process.env.PORT || 4000
const MONGO_URL = process.env.MONGO_URL;
console.log(process.env.MONGO_URL);
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: 'https://quiet-sunflower-eca92c.netlify.app' } });
io.on('connection', (socket) => {
    console.log(`⚡: ${socket.id} user just connected!`);
     //Listens and sends the message to all the users on the server
    socket.on('message', (data) => {
        io.emit('messageResponse', data);
      });
  
    socket.on('disconnect', () => {
      console.log('🔥: A user disconnected');
    socket.disconnect();
    });
});

async function createConnection() {
    const client = new MongoClient(MONGO_URL);
    await client.connect();
    console.log("Mongo is connected");
    return client;
}
export const client = await createConnection();

app.use("/api/auth",userRoutes);
httpServer.listen(PORT,()=>{
    console.log(`App started in ${PORT}`);
})
