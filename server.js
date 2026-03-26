const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
});

app.use(cors());
app.use(express.json());

// --- ESTO ES LO QUE FALTA: SERVIR EL ARCHIVO ---
// Indica a Express que use la carpeta actual para archivos estáticos
app.use(express.static(__dirname));

// Ruta principal para cargar el SO
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// --- LÓGICA DEL CHAT ---
io.on('connection', (socket) => {
    socket.on('chat_message', (data) => {
        io.emit('chat_message', data);
    });
});

// --- PUERTO PARA RENDER ---
const PORT = process.env.PORT || 10000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor WebOS activo en puerto ${PORT}`);
});
