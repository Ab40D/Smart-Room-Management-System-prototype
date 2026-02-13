// ============================================
// Configuration Settings
// ============================================

module.exports = {
  // Serial Port Configuration
  serial: {
    // ⚠️ IMPORTANT: Change this to YOUR Arduino port!
    // Windows: Check Device Manager → Ports (COM & LPT)
    // Typical values: 'COM3', 'COM4', 'COM5'
    port: 'COM10',
    
    baudRate: 9600,
    autoOpen: false,
    delimiter: '\n'
  },

  // Web Server Configuration
  server: {
    port: 3000,
    host: 'localhost'
  },

  // Debug mode
  debug: true
};
