import connectDB from "./db/db.js";
import { app } from "./app.js";
import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { WebSocketServer, WebSocket } from 'ws';
import cors from 'cors'
import http from 'http'
import Message from "../Model/message.model.js";
import { GroupChat } from "../Model/groupChat.model.js";
dotenv.config();
connectDB();
import {Server} from "socket.io"


// const server = http.createServer(app);


const port = process.env.PORT || 10000;
 const host = '0.0.0.0';
const server =   app.listen(port, host, () => {
  console.log(`Server running on http://${host}:${port}`);
});
//  console.log("server",server)
const io = new Server(server, {
  cors:{
    origin: "*",
    methods: ["GET", "POST"],
    credentials:true
  }
  // cors: {
  //   origin: "https://learn-sphere-frontend.vercel.app", // Allow frontend domain
  //   // methods: ["GET", "POST"],
  //   credentials: true,
  // },
});
// app.use(express.static(path.join(__dirname, 'public')));


// Handle the root route
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// If you're serving a frontend, make sure to serve the index.html (React app, etc.)
// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });



// const wsServer = new WebSocketServer({ server });
// const userSockets = new Map(); // Map userId -> WebSocket connection

// wsServer.on("connection", function connection(ws) {
//   console.log("Connected to WebSocket");

//   userSockets.set('6707ad467f624c0eed660873', ws)

//   ws.on('message', async (data) => {
//     const messageString = data.toString();
//     const parsedData = JSON.parse(messageString); 
//     const { chatId, sender, content, isGroupChat, type, sdp, candidate, communityId } = parsedData;

//     // Handle WebRTC signaling for video calls
//     if (type === "video-offer" || type === "video-answer" || type === "new-ice-candidate") {
//       handleWebRTCSignaling(parsedData, ws);
//       return;
//     }

//     // Save the message to the database
//     const newMessage = new Message({ chatId, sender, content });
//     await newMessage.save();

//     // Broadcast message in group or direct chat
//     if (isGroupChat) {
//       const groupChat = await GroupChat.findById(chatId).populate('participants', 'name email _id');
//       if (!groupChat) {
//         console.error('Group chat not found');
//         return;
//       }

//       groupChat.participants.forEach(participant => {
//         const participantSocket = userSockets.get(participant._id.toString());
//         if (participantSocket && participantSocket.readyState === WebSocket.OPEN) {
//           participantSocket.send(JSON.stringify({ chatId, sender, content }));
//         }
//       });
//     } else {
//       wsServer.clients.forEach(client => {
//         if (client !== ws && client.readyState === WebSocket.OPEN) {
//           client.send(JSON.stringify({ chatId, sender, content }));
//         }
//       });
//     }
//   });

//   ws.on("error", (err) => {
//     console.error("Socket error:", err);
//   });
// });
250311023590
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Listen for messages
  socket.on('sendMessage',async (message) => {
    console.log('Message received:', message);
     const messageString = message.toString();
    const parsedData = JSON.parse(messageString); 
    const { chatId, sender, content, isGroupChat, type, sdp, candidate, communityId } = parsedData;

    const newMessage = new Message({ chatId, sender, content });
    await newMessage.save();

    // Broadcast message in group or direct chat
    if (isGroupChat) {
      const groupChat = await GroupChat.findById(chatId).populate('participants', 'name email _id');
      if (!groupChat) {
        console.error('Group chat not found');
        return;
      }

      groupChat.participants.forEach((participant) => {
        const participantSocketId = userSockets.get(participant._id.toString());
        if (participantSocketId) {
          io.to(participantSocketId).emit("message", { chatId, sender, content });
        }
      });
      // groupChat.participants.forEach(participant => {
      //   const participantSocket = userSockets.get(participant._id.toString());
      //   if (participantSocket && participantSocket.readyState === WebSocket.OPEN) {
      //     participantSocket.send(JSON.stringify({ chatId, sender, content }));
      //   }
      // }
      // );
    } else {
      io.sockets.sockets.forEach(client => {
        if (client.id !== socket.id) { // Exclude the sender
          client.emit("message", { chatId, sender, content });
        }
        // if (client !== ws && client.readyState === WebSocket.OPEN) {
        //   client.send(JSON.stringify({ chatId, sender, content }));
        // }
      });
    }

    // Broadcast message to all clients
    io.emit('receiveMessage', message);
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const emailToSocketIdMap = new Map();
const socketidToEmailMap = new Map();

io.on("connection", (socket) => {
  console.log(`Socket Connected`, socket.id);
  socket.on("room:join", (data) => {
    console.log("room:join", data);
    const { email, room } = data;
    emailToSocketIdMap.set(email, socket.id);
    socketidToEmailMap.set(socket.id, email);
    io.to(room).emit("user:joined", { email, id: socket.id });
    socket.join(room);
    io.to(socket.id).emit("room:join", data);
  });

  socket.on("user:call", ({ to, offer }) => {
    io.to(to).emit("incomming:call", { from: socket.id, offer });
  });

  socket.on("call:accepted", ({ to, ans }) => {
    io.to(to).emit("call:accepted", { from: socket.id, ans });
  });

  socket.on("peer:nego:needed", ({ to, offer }) => {
    console.log("peer:nego:needed", offer);
    io.to(to).emit("peer:nego:needed", { from: socket.id, offer });
  });

  socket.on("peer:nego:done", ({ to, ans }) => {
    console.log("peer:nego:done", ans);
    io.to(to).emit("peer:nego:final", { from: socket.id, ans });
  });
});







// import connectDB from "./db/db.js";
// import { app } from "./app.js";
// import dotenv from 'dotenv';
// import { WebSocketServer, WebSocket } from 'ws';
// import Message from "../Model/message.model.js";
// import { GroupChat } from "../Model/groupChat.model.js";

// const port = 3001;
// dotenv.config();
// connectDB();

// const server = app.listen(port, () => {
//   console.log("server is running on port", port);
// });

// console.log("server", server);

// const wsServer = new WebSocketServer({
//   server: server
// });

// // Map to store connected user sockets
// const userSockets = new Map();

// wsServer.on("connection", function connection(ws) {
//   console.log("Connected to socket");

//   // Handle message events from the client (text chat logic)
//   ws.on('message', async (data) => {
//     const parsedData = JSON.parse(data);
//     const { chatId, sender, content, isGroupChat, type } = parsedData;

//     // Handle video call signaling messages
//     if (type === "video-offer" || type === "video-answer" || type === "new-ice-candidate") {
//       handleWebRTCSignaling(parsedData, ws);
//       return;
//     }

//     // Handle chat messages (existing logic)
//     if (type === "chat-message") {
//       // Step 2: Save the message to the database
//       const newMessage = new Message({ chatId, sender, content });
//       await newMessage.save();

//       if (isGroupChat) {
//         // Group Chat Logic
//         const groupChat = await GroupChat.findById(chatId).populate('participants', 'name email _id');
//         if (!groupChat) {
//           console.error('Group chat not found');
//           return;
//         }

//         // Step 3: Broadcast the message to all participants in the group
//         groupChat.participants.forEach(participant => {
//           const participantSocket = userSockets.get(participant._id.toString());
//           if (participantSocket && participantSocket.readyState === WebSocket.OPEN) {
//             participantSocket.send(JSON.stringify({ chatId, sender, content, type: "chat-message" }));
//           }
//         });
//       } else {
//         wsServer.clients.forEach(client => {
//           if (client !== ws && client.readyState === WebSocket.OPEN) {
//             client.send(JSON.stringify({ chatId, sender, content, type: "chat-message" }));
//           }
//         });
//       }
//     }
//   });

//   // Handle errors (optional but useful)
//   ws.on("error", (err) => {
//     console.error("Socket error:", err);
//   });
// });
