'use client';

import { useEffect, useState } from 'react';
import { CURRENCIES, CurrencyCode } from '@/lib/chains';

interface Rate {
    currency: CurrencyCode;
    rate: number;
}

export function LiveRateTicker() {
    const [rates, setRates] = useState<Rate[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchRates = async () => {
            try {
                // Fetch top 6 currencies for ticker
                const topCurrencies: CurrencyCode[] = ['JPY', 'KRW', 'INR', 'IDR', 'AUD', 'SGD'];
                const ratesData: Rate[] = [];

                for (const currency of topCurrencies) {
                    const response = await fetch(`/api/rates?currency=${currency}`);
                    const data = await response.json();
                    if (data.success) {
                        ratesData.push({
                            currency,
                            rate: data.data.rate,
                        });
                    }
                }

                setRates(ratesData);
                setLoading(false);
            } catch (error) {
                console.error('Failed to fetch rates:', error);
                setLoading(false);
            }
        };

        fetchRates();
        const interval = setInterval(fetchRates, 60000); // Refresh every 60s

        return () => clearInterval(interval);
    }, []);

    if (loading || rates.length === 0) {
        return null; // Don't show ticker if loading or no rates
    }

    return (
        <div className="overflow-hidden bg-surface/50 py-2 border-b border-white/5">
            <div className="animate-ticker flex gap-12 whitespace-nowrap">
                {[...rates, ...rates].map((rate, index) => {
                    const curr = CURRENCIES[rate.currency];
                    return (
                        <div
                            key={`${rate.currency}-${index}`}
                            className="flex items-center gap-1.5 text-xs"
                        >
                            <span>{curr.flag}</span>
                            <span className="text-muted">1 USD =</span>
                            <span className="text-text font-medium tabular-nums">
                                {rate.rate.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                            </span>
                            <span className="text-muted">{rate.currency}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
