import { LocationProvider, Router, useLocation } from '@reach/router';
import React from 'react';
import { useAnalytics } from './hooks';
import Home from './scenes/Home';
import Match from './scenes/Match';

export default function App(): React.ReactElement {
    return (
        <LocationProvider>
            <RoutedApp />
        </LocationProvider>
    );
}

function RoutedApp(): React.ReactElement {
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
