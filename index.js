const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cookieParser = require('cookie-parser');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });
const PORT = 8080;

app.use(cookieParser());
app.use(express.json());

wss.on('connection', (ws,req) => {
  console.log(`A client has connected. (total clients ${wss.clients.size})`);
  
  ws.dynamic_name = getDynamicName(req);
  wss.clients.add(ws);

  ws.on('message', (message) => {
    message = JSON.parse(message);
    let toMod = message.toMod;
    let toOneClient = message.toOneClient;
    let client = ws;
    message.from = client.dynamic_name;
    message = JSON.stringify(message);

    if(!toMod){
        if(!toOneClient){
            wss.clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
            });
        }else{
            wss.clients.forEach((client) => {
                if (toOneClient == client.dynamic_name && client.readyState === WebSocket.OPEN) {
                    client.send(message);
                }
            });
        }
    }else{
            wss.clients.forEach((client) => {
                if (client.dynamic_name == "MODGODCOMMANDER" && client.readyState === WebSocket.OPEN) {
                    client.send(message);
                }
            });
    }

  });

  ws.on('close', (client) => {
    console.log('A client has disconnected.');
    updateDatabaseOnDisconnect(client.dynamic_name);
  });
});

// get the DynamicName from client function
function getDynamicName(client) {
    const cookieHeader = client.headers.cookie;
    if (cookieHeader) {
        const cookiesArray = cookieHeader.split(';');
        for (const cookie of cookiesArray) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'dynamic_name') {
                return value;
            }
        }
    }
    return null;
}
// asynchronous function to disconnect client on database
async function updateDatabaseOnDisconnect(dynamic_name){
    return 1;
}

// activate server
server.listen(PORT, () => {
    console.log(`${server.address().address}:${server.address().port}`);
});