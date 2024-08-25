import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { Container, TextField, Typography, Button, List, ListItem, ListItemText } from '@mui/material';


const App = () => {
  const [message, setMessage] = useState("");
  const [room, setRoom] = useState("");
  const [socketId, setSocketId] = useState("");
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const newSocket = io("http://localhost:3000");
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("connected", newSocket.id);
      setSocketId(newSocket.id);
    });

    newSocket.on("receive_message", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    newSocket.on("disconnect", () => {
      console.log("disconnected");
    });

    return () => {
      newSocket.off("connect");
      newSocket.off("receive_message");
      newSocket.off("disconnect");
      newSocket.disconnect();
    };
  }, []);

  const handleJoinRoom = () => {
    if (room) {
      socket.emit("join_room", room);
    }
  };

  const handleLeaveRoom = () => {
    if (room) {
      socket.emit("leave_room", room);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (room && message) {
      socket.emit("message", { room, message, sender: socketId });
      setMessage("");
    }
  };

  return (
    <Container maxWidth="sm">
      <Typography variant="h6" component="div" gutterBottom>
        {socketId}
      </Typography>

      <form onSubmit={handleSubmit}>
        <TextField 
          value={message} 
          onChange={(e) => setMessage(e.target.value)} 
          id="outlined-basic" 
          label="Message" 
          variant="outlined" 
          fullWidth 
          margin="normal"
        />

        <TextField 
          value={room} 
          onChange={(e) => setRoom(e.target.value)} 
          id="outlined-basic" 
          label="Room" 
          variant="outlined" 
          fullWidth 
          margin="normal"
        />
        <Button onClick={handleJoinRoom} variant="contained" color="primary">
          Join Room
        </Button>
        <Button onClick={handleLeaveRoom} variant="contained" color="secondary" style={{ marginLeft: '10px' }}>
          Leave Room
        </Button>
        <Button type="submit" variant="contained" color="primary" style={{ marginLeft: '10px' }}>
          Send
        </Button>
      </form>

      <List>
        {messages.map((msg, index) => (
          <ListItem key={index}>
            <ListItemText primary={`${msg.sender}: ${msg.message}`} />
          </ListItem>
        ))}
      </List>
    </Container>
  );
};

export default App;
