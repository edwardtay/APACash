'use client';

import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';

interface QRCodeGeneratorProps {
    merchantAddress?: string;
}

export function QRCodeGenerator({ merchantAddress }: QRCodeGeneratorProps) {
    const [address, setAddress] = useState(merchantAddress || '');
    const [amount, setAmount] = useState('');
    const [currency, setCurrency] = useState('IDR');
    const [showQR, setShowQR] = useState(false);

    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const paymentUrl = `${baseUrl}/pay?to=${address}&amount=${amount}&currency=${currency}`;

    const handleGenerate = () => {
        if (address && amount) {
            setShowQR(true);
        }
    };

    return (
        <div className="glass-card p-6 rounded-2xl">
            <h3 className="text-xl font-bold text-white mb-4">Generate Payment QR</h3>

            <div className="space-y-4">
                <div>
                    <label className="block text-white/60 text-sm mb-2">Merchant Address</label>
                    <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="0x..."
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-coral focus:outline-none transition-colors"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-white/60 text-sm mb-2">Amount (USDC)</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="10"
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-coral focus:outline-none transition-colors"
                        />
                    </div>
                    <div>
                        <label className="block text-white/60 text-sm mb-2">Settle Currency</label>
                        <select
                            value={currency}
                            onChange={(e) => setCurrency(e.target.value)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-coral focus:outline-none transition-colors"
                        >
                            <option value="IDR">🇮🇩 IDR</option>
                            <option value="PHP">🇵🇭 PHP</option>
                            <option value="THB">🇹🇭 THB</option>
                            <option value="MYR">🇲🇾 MYR</option>
                            <option value="VND">🇻🇳 VND</option>
                            <option value="SGD">🇸🇬 SGD</option>
                        </select>
                    </div>
                </div>

                <button
                    onClick={handleGenerate}
                    disabled={!address || !amount}
                    className="w-full py-3 bg-gradient-to-r from-coral to-coral-dark text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-coral/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Generate QR Code
                </button>

                {showQR && (
                    <div className="mt-6 flex flex-col items-center">
                        <div className="p-4 bg-white rounded-2xl">
                            <QRCodeSVG
                                value={paymentUrl}
                                size={200}
                                level="H"
                                includeMargin
                                fgColor="#1A1A2E"
                            />
                        </div>
                        <p className="mt-4 text-white/60 text-sm text-center break-all max-w-xs">
                            {paymentUrl}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
