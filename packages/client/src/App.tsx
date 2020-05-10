import Game from './scenes/Game';
import Home from './scenes/Home';
import React from 'react';
import { Router } from '@reach/router';

export default function App(): React.ReactElement {
    return (
        <Router>
            <Home default path="/" />
            <Game path="/:roomId" />
        </Router>
    );
}
