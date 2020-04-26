import { Router } from '@reach/router';
import React from 'react';

import Game from './scenes/Game';
import Home from './scenes/Home';

export default function App(): React.ReactElement {
  return (
    <Router>
      <Home
        default={true}
        path="/"
      />
      <Game
        path="/:roomId"
      />
    </Router>
  );
}
