Smart Room Management System – Arduino + Node.js

This project is a Smart Room Management System prototype that uses an Arduino Uno as the main controller and a web dashboard for real-time monitoring and control.

The system combines a PIR motion sensor and an ultrasonic sensor for accurate room occupancy detection. Status LEDs indicate whether the room is occupied (red) or free (green), while a web dashboard built with HTML, CSS, and JavaScript displays the current state and allows manual light control.

The Arduino sends sensor data to a Node.js server over USB serial. The server processes the data and updates the dashboard dynamically.

Hardware:

Arduino Uno

PIR motion sensor

Ultrasonic sensor

Status LEDs

Software:

Node.js server

Web dashboard (HTML/CSS/JavaScript)

Workflow:
Sensor → Arduino → Serial USB → Node.js Server → Web Dashboard → Room status & light control

Advantages:

Real-time room monitoring

Simple end-to-end IoT-style prototype

Clear path for scaling to multi-room and cloud-based solutions

Limitations (current prototype):

Single-room setup

Wired USB communication

No cloud integration yet

Future improvements:

ESP32-based wireless version

Multi-room management

Cloud backend and database for logging and analytics

Feel free to clone, explore, and adapt this project for your own smart room or smart building applications.
