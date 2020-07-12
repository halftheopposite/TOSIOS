import Home from './scenes/Home';
import Match from './scenes/Match';
import React from 'react';
import { Router } from '@reach/router';

export default function App(): React.ReactElement {
    return (
        <Router>
            <Home default path="/" />
            <Match path="/:roomId" />
        </Router>
    );
}
