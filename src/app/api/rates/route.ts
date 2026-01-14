import { NextRequest, NextResponse } from 'next/server';

// Multiple FX rate sources for reliability
const FX_SOURCES = {
    primary: 'https://open.er-api.com/v6/latest/USD',
    fallback: 'https://api.frankfurter.app/latest?from=USD',
};

interface RateResult {
    rate: number;
    source: string;
    timestamp: number;
}

async function fetchFromPrimary(currency: string): Promise<RateResult | null> {
    try {
        const response = await fetch(FX_SOURCES.primary, {
            next: { revalidate: 300 } // Cache 5 min
        });
        if (!response.ok) return null;

        const data = await response.json();
        const rate = data.rates?.[currency];
        if (!rate) return null;

        return {
            rate,
            source: 'open.er-api.com',
            timestamp: Date.now(),
        };
    } catch {
        return null;
    }
}

async function fetchFromFallback(currency: string): Promise<RateResult | null> {
    try {
        const response = await fetch(`${FX_SOURCES.fallback}&to=${currency}`, {
            next: { revalidate: 300 }
        });
        if (!response.ok) return null;

        const data = await response.json();
        const rate = data.rates?.[currency];
        if (!rate) return null;

        return {
            rate,
            source: 'frankfurter.app (ECB)',
            timestamp: Date.now(),
        };
    } catch {
        return null;
    }
}

export async function GET(request: NextRequest) {
    const currency = request.nextUrl.searchParams.get('currency') || 'IDR';

    // Try primary source first
    let result = await fetchFromPrimary(currency);

    // Fallback if primary fails
    if (!result) {
        result = await fetchFromFallback(currency);
    }

    if (!result) {
        return NextResponse.json(
            { success: false, error: `Failed to fetch rate for ${currency}` },
            { status: 503 }
        );
    }

    return NextResponse.json({
        success: true,
        data: {
            currency,
            ...result,
        },
    });
}
