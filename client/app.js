
        class Dashboard {
            constructor() {
                this.socket = null;
                this.ledState = false;
                this.init();
            }

            init() {
                this.connectWebSocket();
                this.setupLEDControl();
                this.fetchStats();
                setInterval(() => this.fetchStats(), 5000);
            }

            connectWebSocket() {
                this.socket = io();
                
                this.socket.on('connect', () => {
                    console.log('Connected to server');
                    this.updateConnectionStatus(true);
                });

                this.socket.on('disconnect', () => {
                    console.log('Disconnected');
                    this.updateConnectionStatus(false);
                });

                this.socket.on('arduino:status', (data) => {
                    this.updateConnectionStatus(data.connected);
                });

                this.socket.on('sensor:update', (data) => {
                    this.updateUI(data);
                });
            }

            updateConnectionStatus(connected) {
                const dot = document.getElementById('statusDot');
                const text = document.getElementById('statusText');
                
                if (connected) {
                    dot.classList.add('connected');
                    text.textContent = 'Connected';
                } else {
                    dot.classList.remove('connected');
                    text.textContent = 'Disconnected';
                }
            }

            updateUI(data) {
                // Room Status
                const roomStatus = document.getElementById('roomStatus');
                const roomIcon = document.getElementById('roomIcon');
                const roomTitle = document.getElementById('roomTitle');
                const roomSubtitle = document.getElementById('roomSubtitle');

                if (data.occupied === 1) {
                    roomStatus.classList.add('occupied');
                    roomIcon.textContent = '🔴';
                    roomTitle.textContent = 'ROOM OCCUPIED';
                    roomSubtitle.textContent = 'Professor Present';
                } else {
                    roomStatus.classList.remove('occupied');
                    roomIcon.textContent = '🟢';
                    roomTitle.textContent = 'ROOM EMPTY';
                    roomSubtitle.textContent = data.motion === 1 ? 'Motion Detected' : 'No Activity';
                }

                // Sensors
                document.getElementById('distance').textContent = 
                    data.distance === 999 ? '--' : data.distance;
                
                document.getElementById('motion').textContent = 
                    data.motion === 1 ? 'DETECTED' : 'NONE';
                
                document.getElementById('lights').textContent = 
                    data.lights === 1 ? 'ON' : 'OFF';

                // Last Update
                const now = new Date();
                document.getElementById('lastUpdate').textContent = 
                    now.toLocaleTimeString('en-US', { hour12: false });
            }

            setupLEDControl() {
                const toggle = document.getElementById('ledToggle');
                const status = document.getElementById('ledStatus');

                toggle.addEventListener('click', async () => {
                    this.ledState = !this.ledState;
                    
                    try {
                        const endpoint = this.ledState ? '/api/led/on' : '/api/led/off';
                        const response = await fetch(endpoint, { method: 'POST' });
                        const result = await response.json();

                        if (result.success) {
                            toggle.classList.toggle('active', this.ledState);
                            status.textContent = this.ledState ? 'LED is ON' : 'LED is OFF';
                        } else {
                            console.error('Failed to control LED:', result.error);
                            this.ledState = !this.ledState; // Revert
                        }
                    } catch (error) {
                        console.error('LED control error:', error);
                        this.ledState = !this.ledState; // Revert
                    }
                });
            }

            async fetchStats() {
                try {
                    const response = await fetch('/api/stats');
                    const result = await response.json();

                    if (result.success) {
                        document.getElementById('totalReadings').textContent = 
                            result.data.totalReadings || 0;

                        const uptime = result.data.uptime || 0;
                        const hours = Math.floor(uptime / 3600);
                        const minutes = Math.floor((uptime % 3600) / 60);
                        const seconds = uptime % 60;

                        let uptimeStr = '';
                        if (hours > 0) uptimeStr += `${hours}h `;
                        if (minutes > 0) uptimeStr += `${minutes}m `;
                        uptimeStr += `${seconds}s`;

                        document.getElementById('uptime').textContent = uptimeStr;
                    }
                } catch (error) {
                    console.error('Failed to fetch stats:', error);
                }
            }
        }

        // Start
        const dashboard = new Dashboard();
    