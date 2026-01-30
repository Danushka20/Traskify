import React, { createContext, useContext, useEffect, useState } from 'react';
import getEcho from '../realtime/echo';

interface RealtimeContextType {
    echo: any | null;
}

const RealtimeContext = createContext<RealtimeContextType>({ echo: null });

export const RealtimeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [echo, setEcho] = useState<any | null>(null);

    useEffect(() => {
        let active = true;
        getEcho().then(instance => {
            if (active) setEcho(instance);
        });
        return () => { active = false; };
    }, []);

    return (
        <RealtimeContext.Provider value={{ echo }}>
            {children}
        </RealtimeContext.Provider>
    );
};

export const useRealtime = () => useContext(RealtimeContext);

/**
 * Custom hook to listen to a specific channel and event with high efficiency.
 * Automatically handles subscription and cleanup.
 */
export function useEchoListener(channel: string, event: string, callback: (data: any) => void, deps: any[] = []) {
    const { echo } = useRealtime();

    useEffect(() => {
        if (!echo) return;

        const echoChannel = echo.channel(channel);
        echoChannel.listen(event.startsWith('.') ? event : `.${event}`, callback);

        return () => {
            try {
                echoChannel.stopListening(event.startsWith('.') ? event : `.${event}`);
            } catch (e) {
                // Ignore cleanup errors
            }
        };
    }, [echo, channel, event, ...deps]);
}
