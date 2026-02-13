// ============================================
// Main Server - Node.js Gateway
// ============================================

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const cors = require('cors');
const SerialManager = require('./serialManager');
const DataStore = require('./dataStore');

// Configuration
const config = {
  serial: {
    port: 'COM10',  // 
    baudRate: 9600,
    autoOpen: false,
    delimiter: '\n',
    debug: true  // 
  },
  server: {
    port: 3000,
    host: 'localhost'
  }
};

// Initialize
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "*", methods: ["GET", "POST"] }
});

const dataStore = new DataStore();
const serialManager = new SerialManager(config.serial);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client')));

// Serial Event Handlers
serialManager.on('connected', () => {
  console.log('✅ Arduino connected!');
  io.emit('arduino:status', { connected: true });
});

serialManager.on('disconnected', () => {
  console.log('❌ Arduino disconnected!');
  io.emit('arduino:status', { connected: false });
});

serialManager.on('data', (data) => {
  dataStore.update(data);
  io.emit('sensor:update', data);
  console.log('📡 Sensor data:', data); // ← عشان تشوف الداتا
});

serialManager.on('error', (error) => {
  console.error('❌ Serial error:', error.message);
});

// REST API Endpoints
app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    data: dataStore.getCurrentState(),
    connected: serialManager.isConnected
  });
});

app.get('/api/history', (req, res) => {
  const count = parseInt(req.query.count) || 100;
  res.json({
    success: true,
    data: dataStore.getHistory(count)
  });
});

app.get('/api/stats', (req, res) => {
  res.json({
    success: true,
    data: dataStore.getStats(),
    connected: serialManager.isConnected
  });
});

app.get('/api/ports', async (req, res) => {
  const ports = await SerialManager.listPorts();
  res.json({
    success: true,
    ports: ports.map(p => ({
      path: p.path,
      manufacturer: p.manufacturer
    }))
  });
});

// LED Control Endpoints (NEW)
app.post('/api/led/on', (req, res) => {
  if (!serialManager.isConnected) {
    return res.status(503).json({
      success: false,
      error: 'Arduino not connected'
    });
  }
  
  console.log('🔵 Sending LED_ON command...');
  serialManager.sendCommand('LED_ON');
  res.json({
    success: true,
    message: 'LED ON command sent'
  });
});

app.post('/api/led/off', (req, res) => {
  if (!serialManager.isConnected) {
    return res.status(503).json({
      success: false,
      error: 'Arduino not connected'
    });
  }
  
  console.log('🔵 Sending LED_OFF command...');
  serialManager.sendCommand('LED_OFF');
  res.json({
    success: true,
    message: 'LED OFF command sent'
  });
});

// WebSocket Handlers
io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);
  
  socket.emit('sensor:update', dataStore.getCurrentState());
  socket.emit('arduino:status', { connected: serialManager.isConnected });
  
  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

// Start Server
async function start() {
  console.log('\n========================================');
  console.log(' Classroom Monitoring System - Server');
  console.log('========================================\n');
  
  await SerialManager.listPorts();
  console.log('');
  
  await serialManager.connect();
  
  server.listen(config.server.port, config.server.host, () => {
    console.log(`\n🌐 Server running at:`);
    console.log(`   http://${config.server.host}:${config.server.port}`);
    console.log('\n💡 Open this URL in your browser!');
    console.log('Press Ctrl+C to stop\n');
  });
}

// Graceful Shutdown
process.on('SIGINT', async () => {
  console.log('\n\n🛑 Shutting down...');
  await serialManager.close();
  server.close(() => {
    console.log('✅ Server stopped');
    process.exit(0);
  });
});

start();
