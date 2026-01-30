export const env = {
    PUSHER_KEY: import.meta.env.VITE_PUSHER_KEY || (window as any).VITE_PUSHER_KEY,
    PUSHER_CLUSTER: import.meta.env.VITE_PUSHER_CLUSTER || (window as any).VITE_PUSHER_CLUSTER,
};
