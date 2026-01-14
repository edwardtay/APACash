'use client';

import { useCallback } from 'react';
import confetti from 'canvas-confetti';

export function useSuccessEffects() {
    const playSuccessSound = useCallback(() => {
        // Create a simple success chime using Web Audio API
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();

        // Create oscillator for chime
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
        oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
        oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5

        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    }, []);

    const fireConfetti = useCallback(() => {
        // Left side burst
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { x: 0.2, y: 0.6 },
            colors: ['#FF6B35', '#00D094', '#FFD700', '#FF69B4'],
        });

        // Right side burst
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { x: 0.8, y: 0.6 },
            colors: ['#FF6B35', '#00D094', '#FFD700', '#FF69B4'],
        });

        // Center burst after delay
        setTimeout(() => {
            confetti({
                particleCount: 150,
                spread: 100,
                origin: { x: 0.5, y: 0.5 },
                colors: ['#FF6B35', '#00D094', '#3B82F6', '#8B5CF6'],
            });
        }, 200);
    }, []);

    const triggerSuccess = useCallback(() => {
        playSuccessSound();
        fireConfetti();
    }, [playSuccessSound, fireConfetti]);

    return { triggerSuccess, playSuccessSound, fireConfetti };
}
