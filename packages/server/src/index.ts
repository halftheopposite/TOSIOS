import { Constants } from '@tosios/common';
import { Server } from 'colyseus';
import * as express from 'express';
import { createServer } from 'http';
import { join } from 'path';
import { DMRoom } from './rooms/DMRoom';

const PORT = Number(process.env.PORT || Constants.WS_PORT);

const app = express();

// Game client
app.use(express.static(join(__dirname, 'public')));
app.get('*', (req: any, res: any) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

// Game server
const server = new Server({
  server: createServer(app),
});

server.register(Constants.ROOM_NAME, DMRoom);
server.onShutdown(() => {
  console.log(`Shutting down...`);
});

server.listen(PORT);
console.log(`Listening on port: ${PORT}`);
