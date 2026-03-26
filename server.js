const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const cors = require('cors');
const axios = require('axios');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { 
    cors: { origin: "*" } 
});

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// --- 🏔️ BASE DE DATOS VIRTUAL DE MOUNTAINOS ---
const ADMINS = ["Nicolas", "Aserzi", "nicolas", "aserzi"];
let globalApps = [
    { id: 'app-terminal', name: 'Terminal Kernel', icon: '💻' },
    { id: 'app-music', name: 'Mountain Music', icon: '🎵' }
];

// --- 🛠️ ENDPOINTS PARA ADMINISTRADORES ---

// Obtener lista de apps
app.get('/api/apps', (req, res) => {
    res.json(globalApps);
});

// Crear nueva app (Solo Nicolas o Aserzi)
app.post('/api/create-app', (req, res) => {
    const { user, appConfig } = req.body;
    
    if (!ADMINS.includes(user)) {
        return res.status(403).send("Error: No tienes permisos de Desarrollador en MountainOS.");
    }

    // Añadir a la lista global
    globalApps.push(appConfig);
    
    // Avisar a todos los usuarios conectados que hay una nueva app
    io.emit('new_app_notification', {
        title: "Nueva App disponible",
        message: `${user} ha publicado ${appConfig.name}`
    });

    res.status(200).send("App publicada con éxito");
});

// --- 🌐 PROXY PARA EL NAVEGADOR ---
app.get('/proxy', async (req, res) => {
    try {
        const url = req.query.url;
        if (!url) return res.status(400).send("URL requerida");
        
        const response = await axios.get(url, {
            timeout: 5000,
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });
        res.send(response.data);
    } catch (e) {
        res.status(500).send("MountainOS Proxy Error: No se puede acceder a esa web.");
    }
});

// --- 💬 CHAT REAL ---
io.on('connection', (socket) => {
    socket.on('chat_message', (data) => {
        // Reenviar a todos con la marca de tiempo del servidor
        io.emit('chat_message', {
            user: data.user,
            msg: data.msg,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
    });

    socket.on('disconnect', () => {
        console.log('Usuario desconectado de MountainOS');
    });
});

// Cargar el index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Puerto dinámico para Render
const PORT = process.env.PORT || 10000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`-----------------------------------`);
    console.log(`🏔️  MountainOS Kernel está Activo`);
    console.log(`🚀 Puerto: ${PORT}`);
    console.log(`-----------------------------------`);
});
