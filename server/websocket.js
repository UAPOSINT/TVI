const WebSocket = require('ws');
const { verifyJWT } = require('./auth');

const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', (ws, req) => {
    try {
        const user = verifyJWT(req.cookies.accessToken);
        ws.user = user;
        
        ws.on('message', async (data) => {
            const message = JSON.parse(data);
            
            // Validate user has write access
            if (message.type === 'EDIT' && user.classification_level < 2) {
                return ws.send(JSON.stringify({
                    error: 'Requires Level 2+ classification'
                }));
            }

            // Broadcast changes to collaborators
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN && 
                    client.articleId === message.articleId) {
                    client.send(JSON.stringify({
                        ...message,
                        userId: user.id,
                        timestamp: Date.now()
                    }));
                }
            });
            
            // Operational Transform for conflict resolution
            await handleOTUpdates(message, user);
        });
    } catch (error) {
        ws.close(1008, 'Authentication failed');
    }
});

// Integrate with HTTP server
server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, ws => {
        wss.emit('connection', ws, request);
    });
}); 