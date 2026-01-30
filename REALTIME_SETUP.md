Realtime setup (Pusher + Laravel Echo)

Install frontend dependencies:

```bash
cd frontend
npm install pusher-js laravel-echo
```

Vite env variables (create `.env` or `.env.local` in `frontend`):

```
VITE_PUSHER_KEY=your_pusher_key
VITE_PUSHER_CLUSTER=your_cluster  # optional
VITE_PUSHER_HOST=your_ws_host     # optional, e.g. localhost
```

Backend (`backend/.env`):

```
BROADCAST_DRIVER=pusher
PUSHER_APP_ID=your_id
PUSHER_APP_KEY=your_key
PUSHER_APP_SECRET=your_secret
PUSHER_APP_CLUSTER=your_cluster
```

Notes:
- The frontend uses dynamic imports with `/* @vite-ignore */` so the app won't fail to start if `pusher-js`/`laravel-echo` are not yet installed.
- After installing deps and setting env vars, run frontend dev or build, and ensure Laravel broadcasting is configured (if using local websockets you can run `laravel-websockets` or a compatible server).

Commands to rebuild/run:

```bash
# frontend
npm run dev
# or
npm run build

# backend
cd backend
php artisan config:clear
php artisan cache:clear
php artisan serve
```
php artisan reverb:star
php artisan queue:work
php artisan optimize:clear