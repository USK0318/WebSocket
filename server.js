const express = require('express');
const bodyParser = require('body-parser');
const WebSocket = require('ws');
const cors = require('cors');
const path = require('path');

const app = express();
const port = 8080;
const wss = new WebSocket.Server({ noServer: true });

let data = [];

app.use(bodyParser.json());
app.use(cors());  // Enable CORS for all routes

// Serve static files (form.html and table.html) if needed
app.use(express.static(path.join(__dirname, 'public')));

// GET API to retrieve the data
app.get('/api/datag', (req, res) => {
  res.json(data);
});

// POST API to add data
app.post('/api/data', (req, res) => {
  const newData = req.body;
  data.push(newData);
  // Broadcast the new data to all connected WebSocket clients
  wss.clients.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(newData));
    }
  });
  res.status(201).json(newData);
});

const server = app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

server.on('upgrade', (request, socket, head) => {
  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit('connection', ws, request);
  });
});

wss.on('connection', (ws) => {
  console.log('New WebSocket client connected');

  ws.on('message', (message) => {
    console.log(`Received message: ${message}`);
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });

  ws.on('error', (error) => {
    console.error(`WebSocket error: ${error}`);
  });
  
});
