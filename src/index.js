import connectDB from "./db/db.js";
import { app } from "./app.js";
import dotenv from 'dotenv';
import path from 'path';
import { WebSocketServer, WebSocket } from 'ws';
import Message from "../Model/message.model.js";
import { GroupChat } from "../Model/groupChat.model.js";
dotenv.config();
connectDB();

const port = process.env.PORT || 10000;
 const host = '0.0.0.0';
 const server = app.listen(port, host, () => {
  
  console.log(`Server running on http://${host}:${port}`);
});

app.use(express.static(path.join(__dirname, 'public')));


// Handle the root route
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// If you're serving a frontend, make sure to serve the index.html (React app, etc.)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});



const wsServer = new WebSocketServer({ server });
const userSockets = new Map(); // Map userId -> WebSocket connection

wsServer.on("connection", function connection(ws) {
  console.log("Connected to WebSocket");

  userSockets.set('6707ad467f624c0eed660873', ws)

  ws.on('message', async (data) => {
    const messageString = data.toString();
    const parsedData = JSON.parse(messageString); 
    const { chatId, sender, content, isGroupChat, type, sdp, candidate, communityId } = parsedData;

    // Handle WebRTC signaling for video calls
    if (type === "video-offer" || type === "video-answer" || type === "new-ice-candidate") {
      handleWebRTCSignaling(parsedData, ws);
      return;
    }

    // Save the message to the database
    const newMessage = new Message({ chatId, sender, content });
    await newMessage.save();

    // Broadcast message in group or direct chat
    if (isGroupChat) {
      const groupChat = await GroupChat.findById(chatId).populate('participants', 'name email _id');
      if (!groupChat) {
        console.error('Group chat not found');
        return;
      }

      groupChat.participants.forEach(participant => {
        const participantSocket = userSockets.get(participant._id.toString());
        if (participantSocket && participantSocket.readyState === WebSocket.OPEN) {
          participantSocket.send(JSON.stringify({ chatId, sender, content }));
        }
      });
    } else {
      wsServer.clients.forEach(client => {
        if (client !== ws && client.readyState === WebSocket.OPEN) {
          client.send(JSON.stringify({ chatId, sender, content }));
        }
      });
    }
  });

  ws.on("error", (err) => {
    console.error("Socket error:", err);
  });
});

// Handle WebRTC signaling for video calls
async function handleWebRTCSignaling(data, ws) {
  const { communityId, sender, type, sdp, candidate } = data;

  console.log("handleWebRTCSignaling data",data)
  // Find the group chat by communityId
  const groupChat = await GroupChat.findById(communityId).populate('participants', 'name email _id');

  console.log("handleWebRTCSignaling groupchat",groupChat)
  if (!groupChat) {
    console.error('Group chat not found');
    return;
  }

  // Broadcast WebRTC signaling (SDP or ICE candidates) to all participants except the sender
  if (type === "video-offer" || type === "video-answer") {
    groupChat.participants.forEach(participant => {
      // if (participant._id.toString() !== sender) {  // Don't send back to the sender
        console.log("in to if")
        const participantSocket = '6707ad467f624c0eed660873'
        //  userSockets.get(participant._id.toString());

        console.log("participantSocket",participantSocket)
        if (participantSocket && participantSocket.readyState === WebSocket.OPEN) {
          participantSocket.send(JSON.stringify({ type, sdp, sender, chatId: communityId }));
        }
      // }
    });
  } else if (type === "new-ice-candidate") {
    groupChat.participants.forEach(participant => {
      // if (participant._id.toString() !== sender) {
        const participantSocket = '6707ad467f624c0eed660873'
        // userSockets.get(participant._id.toString());
        console.log("participantSocket",participantSocket)
        if (participantSocket && participantSocket.readyState === WebSocket.OPEN) {
          console.log("into if")
          participantSocket.send(JSON.stringify({ type, candidate, sender, chatId: communityId,sdp }));
        }
      // }
    });
  }
}

// Add user to the userSockets map when they connect
function addUserToSocket(userId, ws) {
  userSockets.set(userId, ws);
}

// Remove user from the userSockets map when they disconnect
function removeUserFromSocket(userId) {
  userSockets.delete(userId);
}





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
