// ============================================
// Serial Port Manager
// ============================================

const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const EventEmitter = require('events');

class SerialManager extends EventEmitter {
  constructor(config) {
    super();
    this.config = config;
    this.port = null;
    this.parser = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      console.log(`[Serial] Opening port: ${this.config.port} @ ${this.config.baudRate} baud`);
      
      this.port = new SerialPort({
        path: this.config.port,
        baudRate: this.config.baudRate,
        autoOpen: false
      });

      this.parser = this.port.pipe(new ReadlineParser({
        delimiter: this.config.delimiter
      }));

      this.setupEventHandlers();
      await this.openPort();
    } catch (error) {
      console.error('[Serial] Connection failed:', error.message);
      this.emit('error', error);
    }
  }

  openPort() {
    return new Promise((resolve, reject) => {
      this.port.open((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  setupEventHandlers() {
    this.port.on('open', () => {
      this.isConnected = true;
      console.log('[Serial] ✅ Connected to Arduino!');
      this.emit('connected');
    });

    this.port.on('close', () => {
      this.isConnected = false;
      console.log('[Serial] ❌ Disconnected');
      this.emit('disconnected');
    });

    this.port.on('error', (err) => {
      console.error('[Serial] Error:', err.message);
      this.emit('error', err);
    });

    this.parser.on('data', (line) => {
      this.handleIncomingData(line);
    });
  }

  handleIncomingData(line) {
    try {
      line = line.trim();
      if (line.length === 0) return;
      
      const data = JSON.parse(line);
      this.emit('data', data);
      
      if (this.config.debug) {
        console.log('[Serial] 📡', JSON.stringify(data));
      }
    } catch (error) {
      console.error('[Serial] JSON parse error:', line);
    }
  }

  // NEW: Send command to Arduino
  sendCommand(command) {
    if (!this.port || !this.port.isOpen) {
      console.error('[Serial] Cannot send - port not open');
      return false;
    }
    
    try {
      this.port.write(command + '\n', (err) => {
        if (err) {
          console.error('[Serial] Write error:', err.message);
          return;
        }
        console.log(`[Serial] ✅ Sent: ${command}`);
      });
      return true;
    } catch (error) {
      console.error('[Serial] Send failed:', error.message);
      return false;
    }
  }

  async close() {
    if (this.port && this.port.isOpen) {
      return new Promise((resolve) => {
        this.port.close(() => {
          console.log('[Serial] Port closed');
          resolve();
        });
      });
    }
  }

  static async listPorts() {
    const ports = await SerialPort.list();
    console.log('\n📌 Available COM Ports:');
    
    if (ports.length === 0) {
      console.log('   ❌ No ports found. Is Arduino connected?');
    } else {
      ports.forEach((port, i) => {
        console.log(`   ${i + 1}. ${port.path}${port.manufacturer ? ' - ' + port.manufacturer : ''}`);
      });
    }
    
    return ports;
  }
}

module.exports = SerialManager;
