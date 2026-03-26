const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const cors = require('cors');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" } // Permitir conexiones de cualquier lado
});

app.use(cors());
app.use(express.static(path.join(__dirname, 'public'))); // Aquí irá tu index.html
app.use(express.json());

// --- BASE DE DATOS VOLÁTIL (Para empezar sin MongoDB) ---
let users = {}; 

// --- RUTAS DE USUARIO ---
app.post('/api/register', (req, res) => {
    const { username, password } = req.body;
    if (users[username]) return res.status(400).send("Usuario ya existe");
    users[username] = { password, wallpaper: 'default.jpg' };
    res.status(200).send("Registrado");
});

// --- LÓGICA DEL CHAT (Socket.io) ---
io.on('connection', (socket) => {
    console.log('Un usuario se conectó');

    socket.on('chat_message', (data) => {
        // Reenviar el mensaje a TODOS los conectados en tiempo real
        io.emit('chat_message', data);
    });

    socket.on('disconnect', () => {
        console.log('Usuario desconectado');
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`WebOS corriendo en puerto ${PORT}`);
});
