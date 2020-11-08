import Home from './scenes/Home';
import Match from './scenes/Match';
import React from 'react';
import { Router } from '@reach/router';
import { useAnalytics } from './hooks';
import { useLocation } from '@reach/router';

export default function App(): React.ReactElement {
    const { pathname } = useLocation();
    const analytics = useAnalytics();

    /**
     * Initialize analytics.
     */
    React.useEffect(() => {
        analytics.init();
    }, [analytics]);

    /**
     * Listen to page changes.
     */
    React.useEffect(() => {
        analytics.page(pathname);
    }, [analytics, pathname]);

    return (
        <Router>
            <Home default path="/" />
            <Match path="/:roomId" />
        </Router>
    );
}
