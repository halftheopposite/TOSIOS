import { Router } from '@reach/router';
import React, { Component } from 'react';

import Game from './scenes/Game';
import Home from './scenes/Home';

class App extends Component {

  render() {
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
}

export default App;
