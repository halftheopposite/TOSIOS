import ReactGA from 'react-ga';

const GA_TRACKING_ID = process.env.REACT_APP_GA_TRACKING_ID;
const DEBUG = process.env.NODE_ENV !== 'production';

type EventCategory = 'User' | 'Game' | 'Room';
type EventAction = 'Create' | 'Rename' | 'Share' | 'Join' | 'Players' | 'Mode' | 'Map';

interface EventArgs {
    category: EventCategory;
    action: EventAction;
    label?: string;
    value?: number;
}

export function useAnalytics(): {
    init: () => void;
    page: (path: string) => void;
    track: (args: EventArgs) => void;
} {
    /**
     * Initialize analytics.
     */
    const init = () => {
        if (!GA_TRACKING_ID) {
            return;
        }

        ReactGA.initialize(GA_TRACKING_ID, { debug: DEBUG });
    };

    /**
     * Track a page.
     */
    const page = (path: string) => {
        if (!GA_TRACKING_ID) {
            return;
        }

        ReactGA.pageview(path);
    };

    /**
     * Track an event.
     */
    const track = (args: EventArgs) => {
        if (!GA_TRACKING_ID) {
            return;
        }

        ReactGA.event(args);
    };

    return {
        init,
        page,
        track,
    };
}
