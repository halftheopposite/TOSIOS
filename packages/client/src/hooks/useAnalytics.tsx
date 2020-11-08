import React from 'react';

type EventCategory = 'User' | 'Game' | 'Room';
type EventAction = 'Create' | 'Rename' | 'Share' | 'Join';

interface EventArgs {
    category: EventCategory;
    action: EventAction;
    label?: string;
    value?: number;
}

export function useAnalytics(): {
    track: (args: EventArgs) => void;
} {
    /**
     * Track an event.
     */
    const track = (args: EventArgs) => {
        const { category, action, label, value } = args;

        if (!window.ga) {
            return;
        }

        window.ga('send', {
            hitType: 'event',
            eventCategory: category,
            eventAction: action,
            eventLabel: label,
            eventValue: value,
        });
    };

    return {
        track,
    };
}
