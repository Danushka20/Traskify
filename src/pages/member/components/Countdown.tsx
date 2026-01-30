import { useState, useEffect } from 'react';
import { Timer as TimerIcon } from 'lucide-react';

export default function Countdown({ end }: { end: string }) {
    const [timeLeft, setTimeLeft] = useState('');
    const [isLate, setIsLate] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const target = new Date(end).getTime();
            const diff = target - now;
            
            if (diff <= 0) {
                setTimeLeft('LATE');
                setIsLate(true);
                clearInterval(interval);
            } else {
                const hours = Math.floor(diff / (1000 * 60 * 60));
                const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((diff % (1000 * 60)) / 1000);
                setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
                setIsLate(false);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, [end]);

    return (
        <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-indigo-700">
            <TimerIcon size={14} className={isLate ? 'text-rose-500 animate-pulse' : 'text-indigo-500'} />
            <span className={isLate ? 'text-rose-600' : ''}>{timeLeft}</span>
        </div>
    );
}
