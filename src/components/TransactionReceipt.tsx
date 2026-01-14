'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface TransactionReceiptProps {
    txHash: string;
    amountIn: string;
    amountOut: string;
    currencyIn: string;
    currencyOut: string;
    recipient: string;
    timestamp: Date;
    rate: number;
}

export function TransactionReceipt({
    txHash,
    amountIn,
    amountOut,
    currencyIn,
    currencyOut,
    recipient,
    timestamp,
    rate,
}: TransactionReceiptProps) {
    const [copied, setCopied] = useState(false);

    const arbiscanUrl = `https://sepolia.arbiscan.io/tx/${txHash}`;

    const shareText = `🌊 Just sent ${amountIn} ${currencyIn} → ${amountOut} ${currencyOut} via APACash on @arbitrum!\n\nRate: 1 USD = ${rate.toLocaleString()} ${currencyOut}\n\n${arbiscanUrl}`;

    const handleShare = async () => {
        if (navigator.share) {
            await navigator.share({
                title: 'APACash Payment Receipt',
                text: shareText,
                url: arbiscanUrl,
            });
        } else {
            handleCopy();
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(shareText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleTwitter = () => {
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
        window.open(twitterUrl, '_blank');
    };

    return (
        <div className="glass-card p-6 rounded-2xl max-w-md mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                    <span className="text-2xl">🌊</span>
                    <span className="text-white font-bold">APACash</span>
                </div>
                <span className="text-success text-sm font-medium">✓ Confirmed</span>
            </div>

            {/* Amount */}
            <div className="text-center mb-6">
                <p className="text-white/60 text-sm mb-1">You sent</p>
                <p className="text-3xl font-bold text-white">{amountIn} {currencyIn}</p>
                <div className="flex items-center justify-center gap-2 my-2">
                    <div className="w-8 h-px bg-white/20" />
                    <span className="text-coral">→</span>
                    <div className="w-8 h-px bg-white/20" />
                </div>
                <p className="text-2xl font-bold text-success">
                    {Number(amountOut).toLocaleString()} {currencyOut}
                </p>
                <p className="text-white/40 text-xs mt-1">
                    Rate: 1 USD = {rate.toLocaleString()} {currencyOut}
                </p>
            </div>

            {/* Details */}
            <div className="bg-white/5 rounded-xl p-4 mb-6 space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="text-white/60">To</span>
                    <span className="text-white font-mono text-xs">
                        {recipient.slice(0, 6)}...{recipient.slice(-4)}
                    </span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-white/60">Date</span>
                    <span className="text-white">
                        {timestamp.toLocaleDateString()} {timestamp.toLocaleTimeString()}
                    </span>
                </div>
                <div className="flex justify-between text-sm">
                    <span className="text-white/60">Network</span>
                    <span className="text-white">Arbitrum Sepolia</span>
                </div>
            </div>

            {/* QR Code */}
            <div className="flex justify-center mb-6">
                <div className="p-3 bg-white rounded-xl">
                    <QRCodeSVG value={arbiscanUrl} size={120} level="H" />
                </div>
            </div>

            {/* Share Buttons */}
            <div className="flex gap-3">
                <button
                    onClick={handleShare}
                    className="flex-1 py-3 bg-white/10 text-white font-medium rounded-xl hover:bg-white/20 transition-all flex items-center justify-center gap-2"
                >
                    <span>📤</span>
                    <span>{copied ? 'Copied!' : 'Share'}</span>
                </button>
                <button
                    onClick={handleTwitter}
                    className="flex-1 py-3 bg-[#1DA1F2]/20 text-[#1DA1F2] font-medium rounded-xl hover:bg-[#1DA1F2]/30 transition-all flex items-center justify-center gap-2"
                >
                    <span>𝕏</span>
                    <span>Tweet</span>
                </button>
            </div>

            {/* View on Explorer */}
            <a
                href={arbiscanUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block mt-4 text-center text-coral hover:text-coral-dark transition-colors text-sm"
            >
                View on Arbiscan →
            </a>
        </div>
    );
}
