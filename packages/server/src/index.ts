import { monitor } from '@colyseus/monitor';
import { Constants } from '@tosios/common';
import { Server } from 'colyseus';
import * as cors from 'cors';
import * as express from 'express';
import { createServer } from 'http';

import { join } from 'path';
import { DMRoom } from './rooms/DMRoom';

const PORT = Number(process.env.PORT || Constants.WS_PORT);

const app = express();
app.use(cors());
app.use(express.json());

// Game server
const server = new Server({
  server: createServer(app),
  express: app,
});

// Game Rooms
server.define(Constants.ROOM_NAME, DMRoom);

// Routes on port 80
app.use(express.static(join(__dirname, 'public')));
app.use('/colyseus', monitor(server));
app.get('*', (req: any, res: any) => {
  res.sendFile(join(__dirname, 'public', 'index.html'));
});

server.onShutdown(() => {
  console.log(`Shutting down...`);
});

server.listen(PORT);
console.log(`Listening on ws://localhost:${PORT}`);


