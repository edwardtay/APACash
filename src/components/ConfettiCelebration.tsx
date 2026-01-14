'use client';

import { useEffect, useState } from 'react';
import Confetti from 'react-confetti';

interface ConfettiCelebrationProps {
    show: boolean;
    onComplete?: () => void;
}

export function ConfettiCelebration({ show, onComplete }: ConfettiCelebrationProps) {
    const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            setWindowSize({ width: window.innerWidth, height: window.innerHeight });

            const handleResize = () => {
                setWindowSize({ width: window.innerWidth, height: window.innerHeight });
            };

            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
        }
    }, []);

    useEffect(() => {
        if (show) {
            setIsComplete(false);
            const timer = setTimeout(() => {
                setIsComplete(true);
                onComplete?.();
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [show, onComplete]);

    if (!show || isComplete) return null;

    return (
        <Confetti
            width={windowSize.width}
            height={windowSize.height}
            recycle={false}
            numberOfPieces={500}
            gravity={0.3}
            colors={['#FF6B35', '#00D094', '#FFD700', '#FF69B4', '#00BFFF']}
        />
    );
}
