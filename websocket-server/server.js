const WebSocket = require("ws");

const wss = new WebSocket.Server({ port: 3001 });

console.log("WebSocket server running on ws://localhost:3001");

wss.on("connection", (ws) => {
  ws.on("message", (message) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(message.toString());
      }
    });
  });
});