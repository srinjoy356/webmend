const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const apiRoutes = require('./api/routes');
const socket = require('./socket');

const app = express();
const server = http.createServer(app);
const io = socket.init(server);

app.use(cors());
app.use(express.json());

app.use('/api', apiRoutes);

io.on('connection', (clientSocket) => {
  console.log('Client connected:', clientSocket.id);
  clientSocket.on('disconnect', () => {
    console.log('Client disconnected:', clientSocket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
