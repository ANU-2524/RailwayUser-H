const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

function randomData() {
  return JSON.stringify({
    temperature: (20 + Math.random() * 10).toFixed(2),
    vibration: Math.random().toFixed(3),
    speed: (60 + Math.random() * 40).toFixed(2),
    timestamp: new Date().toISOString()
  });
}

wss.on('connection', ws => {
  const interval = setInterval(() => ws.send(randomData()), 1000);
  ws.on('close', () => clearInterval(interval));
});
console.log('WebSocket server running on ws://localhost:8080');
