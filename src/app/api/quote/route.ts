import { NextRequest, NextResponse } from 'next/server';
import { createWalletClient, http, keccak256, encodePacked, concat, toHex, numberToHex, pad } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { arbitrumSepolia } from 'viem/chains';

const DEALER_PRIVATE_KEY = process.env.DEALER_PRIVATE_KEY;
const ROUTER_ADDRESS = process.env.NEXT_PUBLIC_ROUTER_ADDRESS || '0x0000000000000000000000000000000000000000';

// EIP-712 Domain
const DOMAIN = {
    name: 'APACash',
    version: '1',
    chainId: 421614, // Arbitrum Sepolia
    verifyingContract: ROUTER_ADDRESS as `0x${string}`,
};

// EIP-712 Types - must match contract QUOTE_TYPEHASH exactly
const QUOTE_TYPE = {
    Quote: [
        { name: 'tokenIn', type: 'address' },
        { name: 'tokenOut', type: 'address' },
        { name: 'amountIn', type: 'uint256' },
        { name: 'amountOut', type: 'uint256' },
        { name: 'payer', type: 'address' },
        { name: 'recipient', type: 'address' },
        { name: 'nonce', type: 'uint256' },
        { name: 'deadline', type: 'uint256' },
    ],
};

interface RateResponse {
    rate: number;
    source: string;
    timestamp: number;
}

async function fetchRate(currency: string): Promise<RateResponse | null> {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_VERCEL_URL ? 'https://' + process.env.NEXT_PUBLIC_VERCEL_URL : 'http://localhost:3003'}/api/rates?currency=${currency}`,
            { cache: 'no-store' }
        );

        // Fallback to direct API if local fails
        if (!response.ok) {
            const directResponse = await fetch(`https://open.er-api.com/v6/latest/USD`);
            if (!directResponse.ok) return null;
            const data = await directResponse.json();
            return {
                rate: data.rates?.[currency] || 0,
                source: 'open.er-api.com',
                timestamp: Date.now(),
            };
        }

        const data = await response.json();
        return data.success ? data.data : null;
    } catch {
        // Fallback on error
        try {
            const directResponse = await fetch(`https://open.er-api.com/v6/latest/USD`);
            const data = await directResponse.json();
            return {
                rate: data.rates?.[currency] || 0,
                source: 'open.er-api.com (fallback)',
                timestamp: Date.now(),
            };
        } catch {
            return null;
        }
    }
}

export async function GET(request: NextRequest) {
    const params = request.nextUrl.searchParams;

    const tokenIn = params.get('tokenIn');
    const tokenOut = params.get('tokenOut');
    const amountIn = params.get('amountIn');
    const recipient = params.get('recipient');
    const payer = params.get('payer');
    const nonce = params.get('nonce');
    const currency = params.get('currency') || 'IDR';

    // Validate required params
    if (!tokenIn || !tokenOut || !amountIn || !recipient || !payer) {
        return NextResponse.json(
            { success: false, error: 'Missing required parameters' },
            { status: 400 }
        );
    }

    // Fetch FX rate
    const rateData = await fetchRate(currency);
    if (!rateData || rateData.rate === 0) {
        return NextResponse.json(
            { success: false, error: `Could not fetch rate for ${currency}` },
            { status: 503 }
        );
    }

    // Calculate output amount
    // USDC has 6 decimals, output token has 2 decimals
    const amountInBigInt = BigInt(amountIn);
    const amountInUsd = Number(amountInBigInt) / 1e6;
    const amountOutLocal = amountInUsd * rateData.rate;
    const amountOutBigInt = BigInt(Math.floor(amountOutLocal * 100)); // 2 decimals

    // Set deadline to 10 minutes from now
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 600);

    // Build quote
    const quote = {
        tokenIn,
        tokenOut,
        amountIn: amountIn,
        amountOut: amountOutBigInt.toString(),
        recipient,
        payer,
        nonce: nonce || '0',
        deadline: deadline.toString(),
    };

    // Sign quote if dealer key is configured
    let signature = '0x' + '00'.repeat(65); // Placeholder signature
    let signatureDebug = 'no_key';

    if (DEALER_PRIVATE_KEY) {
        // Clean the key: remove quotes, whitespace, and ensure 0x prefix
        let cleanKey = DEALER_PRIVATE_KEY.trim().replace(/['"]/g, '');
        if (!cleanKey.startsWith('0x')) {
            cleanKey = `0x${cleanKey}`;
        }
        try {
            const account = privateKeyToAccount(cleanKey as `0x${string}`);
            signatureDebug = `signing_with_${account.address.slice(0, 10)}`;
            const account = privateKeyToAccount(key as `0x${string}`);
            signatureDebug = `signing_with_${account.address.slice(0, 10)}`;

            signature = await account.signTypedData({
                domain: DOMAIN,
                types: QUOTE_TYPE,
                primaryType: 'Quote',
                message: {
                    tokenIn: tokenIn as `0x${string}`,
                    tokenOut: tokenOut as `0x${string}`,
                    amountIn: BigInt(amountIn),
                    amountOut: amountOutBigInt,
                    payer: payer as `0x${string}`,
                    recipient: recipient as `0x${string}`,
                    nonce: BigInt(nonce || '0'),
                    deadline: deadline,
                },
            });
            signatureDebug = `signed_by_${account.address.slice(0, 10)}`;
        } catch (err) {
            console.error('Signing error:', err);
            signatureDebug = `error: ${err instanceof Error ? err.message : 'unknown'}`;
        }
    }

    // Estimate gas (approximate for display)
    const estimatedGas = {
        approve: '50000',
        swap: '150000',
        total: '200000',
        estimatedCostUsd: '0.02', // Very rough estimate
    };

    return NextResponse.json({
        success: true,
        data: {
            quote,
            signature,
            signatureDebug,
            rate: rateData,
            gas: estimatedGas,
            expiresAt: new Date(Number(deadline) * 1000).toISOString(),
        },
    });
}
