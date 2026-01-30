// Initialize Laravel Echo (Pusher) safely — dynamic imports to avoid runtime crash if deps missing

let Echo: any = null;
let echoInstance: any = null;

export default async function getEcho() {
    if (echoInstance) return echoInstance;

    try {
        // Use @vite-ignore to avoid Vite trying to pre-bundle these when they
        // are not installed. Install with `npm install pusher-js laravel-echo`.
        const Pusher = (await import(/* @vite-ignore */ 'pusher-js')).default;
        const EchoLib = (await import(/* @vite-ignore */ 'laravel-echo')).default;

        // Pusher setup
        const key = import.meta.env.VITE_PUSHER_KEY || (window as any).VITE_PUSHER_KEY;
        const cluster = import.meta.env.VITE_PUSHER_CLUSTER || (window as any).VITE_PUSHER_CLUSTER || 'mt1';
        
        // Check for custom host (self-hosted Reverb) vs Pusher.com
        const customHost = import.meta.env.VITE_PUSHER_HOST || (window as any).VITE_PUSHER_HOST;
        const useSelfHosted = customHost && customHost !== '';

        // Fallback to not initialize when key missing
        if (!key) {
            console.warn('Pusher key missing; realtime disabled');
            return null;
        }

        // IMPORTANT: Laravel Echo expects Pusher to be on the window object
        (window as any).Pusher = Pusher;

        let echoConfig: any;
        
        if (useSelfHosted) {
            // Self-hosted Reverb configuration
            const isSecure = window.location.protocol === 'https:' || import.meta.env.VITE_PUSHER_SCHEME === 'https';
            echoConfig = {
                broadcaster: 'pusher',
                key,
                cluster,
                wsHost: customHost,
                wsPort: import.meta.env.VITE_PUSHER_PORT || 8080,
                wssPort: import.meta.env.VITE_PUSHER_PORT || 8080,
                forceTLS: isSecure,
                enabledTransports: ['ws', 'wss'],
                disableStats: true,
            };
        } else {
            // Pusher.com hosted configuration
            echoConfig = {
                broadcaster: 'pusher',
                key,
                cluster,
                forceTLS: true,
                disableStats: true,
            };
        }

        Echo = new EchoLib(echoConfig);
        echoInstance = Echo;
        return echoInstance;
    } catch (err) {
        console.warn('Realtime libs not installed or failed to load', err);
        return null;
    }
}
