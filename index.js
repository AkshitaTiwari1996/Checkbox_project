import http from 'node:http';
import express from 'express';
import fs from 'node:fs/promises';
import path from 'node:path';
import {Server} from 'socket.io';

async function main(){
    const PORT = process.env.PORT ?? 8000;
    const app = express();
    const server = http.createServer(app); // express becomes the handler function
    const io = new Server(server);
    io.attach(server);

    io.on('connection', (socket) => {
        console.log(`Socket connected:`, { id: socket.id });
    
    socket.on('client:checkbox:change', (data) => {
        console.log(`[Socket:${socket.id}]:client:checkbox:change`, data);

    });

    });


    
    const publicPath = path.resolve('./public');

    app.get(['/', '/index.html'], async (req, res, next) => {
        try {
            const html = await fs.readFile(path.join(publicPath, 'index.html'), 'utf8');
            const injected = html.replace('</head>', '    <link rel="stylesheet" href="/style.css">\n</head>');
            res.type('html').send(injected);
        } catch (error) {
            next(error);
        }
    });

    app.use(express.static(publicPath));
    // express does not allow access to files by default; this serves public assets
    
    app.get('/health', (req,res) => res.json({healthy: true}));
    server.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`)
    });

}

main();