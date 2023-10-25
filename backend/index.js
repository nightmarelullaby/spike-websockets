import { createServer } from "http";
import { Server } from "socket.io";

const initializeServerAndSocketInstance = () => {
    const httpServer = createServer( (request, response) => {    
        response.write('{"body": "This is a server example!"}');
        response.end();
    
      });
    const io = new Server(httpServer, {   
        cors:{
            origin:"*",
    }});
    
    io.on("connection", (socket) => {
        console.log("new user!")
        socket.on('client:join-room', async (data) => {
            if(socket.handshake.auth.token !== "123") return
            let room = data.toString()
            socket.join(room)
        })
        socket.on('client:send-message',async (data) => {
            if(socket.handshake.auth.token !== "123") return
            let room 
            data.sender = false
            data.author = socket.id
            socket.rooms.forEach(item => {
                if(item !== socket.id) return room = item
            })
            return socket.broadcast.to(room.toString()).emit("server:incoming-message",data);
        })
        socket.on("disconnect", () => {
            console.log(socket.id, "disconnected");
        });
    });
    
    httpServer.listen(3001);
}
initializeServerAndSocketInstance()
