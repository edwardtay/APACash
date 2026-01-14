'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { WalletButton } from '@/components/WalletButton';
import { CONTRACTS, CURRENCIES, EXPLORER, CurrencyCode } from '@/lib/chains';
import { ERC20_ABI, ROUTER_ABI } from '@/lib/contracts';
import { useSuccessEffects } from '@/lib/useSuccessEffects';
import type { QuoteResponse, TransactionStatus } from '@/lib/types';

function PaymentContent() {
    const searchParams = useSearchParams();
    const { address, isConnected } = useAccount();
    const { triggerSuccess } = useSuccessEffects();

    // URL params
    const toAddress = searchParams.get('to') || '';
    const urlAmount = searchParams.get('amount') || '';
    const urlCurrency = (searchParams.get('currency') || 'IDR') as CurrencyCode;

    // Form state
    const [recipient, setRecipient] = useState(toAddress);
    const [amount, setAmount] = useState(urlAmount);
    const [currency, setCurrency] = useState<CurrencyCode>(urlCurrency);

    // Quote state
    const [quote, setQuote] = useState<QuoteResponse['data'] | null>(null);
    const [quoteLoading, setQuoteLoading] = useState(false);
    const [error, setError] = useState('');

    // Transaction state
    const [txStatus, setTxStatus] = useState<TransactionStatus>('idle');

    // Read USDC balance
    const { data: usdcBalance } = useReadContract({
        address: CONTRACTS.USDC as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: address ? [address] : undefined,
    });

    // Read USDC allowance
    const { data: allowance } = useReadContract({
        address: CONTRACTS.USDC as `0x${string}`,
        abi: ERC20_ABI,
        functionName: 'allowance',
        args: address ? [address, CONTRACTS.ROUTER as `0x${string}`] : undefined,
    });

    // Read user nonce
    const { data: nonce } = useReadContract({
        address: CONTRACTS.ROUTER as `0x${string}`,
        abi: ROUTER_ABI,
        functionName: 'getNonce',
        args: address ? [address] : undefined,
    });

    // Contract writes
    const { writeContract: approve, data: approveHash, error: approveError } = useWriteContract();
    const { writeContract: swap, data: swapHash, error: swapError } = useWriteContract();

    // Transaction receipts
    const { isSuccess: approveSuccess, isLoading: approveLoading } = useWaitForTransactionReceipt({ hash: approveHash });
    const { isSuccess: swapSuccess, isLoading: swapLoading } = useWaitForTransactionReceipt({ hash: swapHash });

    // Fetch quote
    const fetchQuote = useCallback(async () => {
        if (!amount || !recipient || !address) return;
        if (!recipient.startsWith('0x') || recipient.length !== 42) {
            setError('Invalid recipient address');
            return;
        }

        setQuoteLoading(true);
        setError('');

        try {
            const amountIn = parseUnits(amount, 6).toString();
            const params = new URLSearchParams({
                tokenIn: CONTRACTS.USDC,
                tokenOut: CONTRACTS.IDRX, // In prod this would map to actual currency token
                amountIn,
                recipient,
                payer: address,
                nonce: (nonce || 0).toString(),
                currency,
            });

            const response = await fetch(`/api/quote?${params}`);
            const data = await response.json();

            if (data.success) {
                setQuote(data.data);
            } else {
                setError(data.error || 'Failed to get quote');
            }
        } catch {
            setError('Network error. Please try again.');
        } finally {
            setQuoteLoading(false);
        }
    }, [amount, recipient, address, nonce, currency]);

    // Handle approve
    const handleApprove = () => {
        if (!quote) return;
        setTxStatus('approving');
        setError('');
        approve({
            address: CONTRACTS.USDC as `0x${string}`,
            abi: ERC20_ABI,
            functionName: 'approve',
            args: [CONTRACTS.ROUTER as `0x${string}`, BigInt(quote.quote.amountIn)],
        });
    };

    // Handle swap
    const handleSwap = () => {
        if (!quote) return;
        setTxStatus('swapping');
        setError('');
        swap({
            address: CONTRACTS.ROUTER as `0x${string}`,
            abi: ROUTER_ABI,
            functionName: 'swapWithSignature',
            args: [
                quote.quote.tokenIn as `0x${string}`,
                quote.quote.tokenOut as `0x${string}`,
                BigInt(quote.quote.amountIn),
                BigInt(quote.quote.amountOut),
                quote.quote.recipient as `0x${string}`,
                BigInt(quote.quote.deadline),
                quote.signature as `0x${string}`,
            ],
        });
    };

    // Handle errors
    useEffect(() => {
        if (approveError) {
            setError('Approval failed. Please try again.');
            setTxStatus('idle');
        }
        if (swapError) {
            setError('Transaction failed. Please try again.');
            setTxStatus('idle');
        }
    }, [approveError, swapError]);

    // Watch transaction states
    useEffect(() => {
        if (approveSuccess && txStatus === 'approving') {
            setTxStatus('idle');
        }
    }, [approveSuccess, txStatus]);

    useEffect(() => {
        if (swapSuccess && txStatus === 'swapping') {
            setTxStatus('success');
            triggerSuccess();
        }
    }, [swapSuccess, txStatus, triggerSuccess]);

    // Format amounts
    const formattedBalance = usdcBalance ? formatUnits(usdcBalance as bigint, 6) : '0';
    const currencyDecimals = CURRENCIES[currency]?.decimals ?? 2;
    const formattedAmountOut = quote ? Number(quote.quote.amountOut) / Math.pow(10, 2) : 0;

    const needsApproval = quote && allowance !== undefined &&
        BigInt(allowance.toString()) < BigInt(quote.quote.amountIn);

    return (
        <main className="min-h-screen flex flex-col bg-bg">
            {/* Header */}
            <header className="fixed top-0 left-0 right-0 z-50 glass border-b-0">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold">
                            A
                        </div>
                        <span className="font-bold text-xl tracking-tight text-text">APACash</span>
                    </Link>
                    <WalletButton />
                </div>
            </header>

            {/* Content */}
            <section className="flex-grow flex items-center justify-center p-6 pt-32 pb-20">
                <div className="w-full max-w-md relative">

                    {/* Decorative blur behind */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-primary/20 blur-[100px] rounded-full -z-10" />

                    {/* Success State */}
                    {txStatus === 'success' && swapHash ? (
                        <div className="card p-8 text-center fade-in bg-surface/80 backdrop-blur-xl border-border shadow-2xl">
                            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-success/20 flex items-center justify-center border border-success/30 text-success shadow-[0_0_20px_rgba(0,208,148,0.2)]">
                                <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>

                            <h2 className="text-2xl font-bold text-text mb-2">Payment Sent</h2>

                            <div className="py-4 my-2">
                                <p className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-success to-emerald-400">
                                    {formattedAmountOut.toLocaleString(undefined, { maximumFractionDigits: currencyDecimals })} <span className="text-lg text-success">{currency}</span>
                                </p>
                                <p className="text-sm text-muted mt-2">
                                    to <span className="font-mono text-text/80 bg-white/5 px-2 py-0.5 rounded">{recipient.slice(0, 6)}...{recipient.slice(-4)}</span>
                                </p>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <Link href="/" className="btn btn-secondary flex-1">Home</Link>
                                <a
                                    href={EXPLORER.tx(swapHash)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-primary flex-1"
                                >
                                    View Receipt
                                </a>
                            </div>
                        </div>
                    ) : (

                        // Payment Form
                        <div className="card p-0 overflow-hidden bg-surface/80 backdrop-blur-xl border-border shadow-2xl transition-all duration-300">
                            {/* Header inside card */}
                            <div className="p-6 border-b border-border bg-surface-light/30">
                                <h1 className="text-lg font-semibold text-text tracking-tight">New Transfer</h1>
                                {isConnected && (
                                    <div className="flex items-center justify-between mt-2 text-xs">
                                        <span className="text-muted">Available Balance</span>
                                        <span className="font-mono text-text">{Number(formattedBalance).toFixed(2)} USDC</span>
                                    </div>
                                )}
                            </div>

                            <div className="p-6 space-y-6">

                                {/* Inputs */}
                                <div className="space-y-4">
                                    <div>
                                        <label className="label">Recipient Address</label>
                                        <input
                                            type="text"
                                            value={recipient}
                                            onChange={(e) => setRecipient(e.target.value)}
                                            placeholder="0x..."
                                            className="input font-mono text-sm"
                                        />
                                    </div>

                                    <div className="grid grid-cols-[1.5fr,1fr] gap-4">
                                        <div>
                                            <label className="label">Amount (USDC)</label>
                                            <input
                                                type="number"
                                                value={amount}
                                                onChange={(e) => setAmount(e.target.value)}
                                                placeholder="0.00"
                                                className="input text-lg font-medium"
                                                min="0"
                                                step="0.01"
                                            />
                                        </div>
                                        <div>
                                            <label className="label">Receive In</label>
                                            <select
                                                value={currency}
                                                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                                                className="input h-[46px] text-base"
                                            >
                                                {Object.entries(CURRENCIES).map(([code, { flag }]) => (
                                                    <option key={code} value={code}>{flag} {code}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Quote details */}
                                {quote && (
                                    <div className="bg-surface-light/50 rounded-lg p-4 border border-border fade-in">
                                        <div className="flex justify-between items-center mb-3 pb-3 border-b border-white/5">
                                            <span className="text-sm text-muted">Exchange Rate</span>
                                            <span className="text-sm font-medium text-text">
                                                1 USD ≈ {quote.rate.rate.toLocaleString()} {currency}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-muted">You Pay</span>
                                            <span className="text-sm font-bold text-text">{amount} USDC</span>
                                        </div>
                                        <div className="flex justify-between items-center mt-1">
                                            <span className="text-sm text-muted">They Get</span>
                                            <span className="text-lg font-bold text-success">
                                                {formattedAmountOut.toLocaleString(undefined, { maximumFractionDigits: currencyDecimals })} {currency}
                                            </span>
                                        </div>
                                    </div>
                                )}

                                {/* Error */}
                                {error && (
                                    <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center fade-in">
                                        {error}
                                    </div>
                                )}

                                {/* Actions */}
                                {!isConnected ? (
                                    <div className="text-center pt-2">
                                        <p className="text-xs text-muted mb-3">Connect wallet to start payment</p>
                                        {/* Wallet button handles connection */}
                                    </div>
                                ) : !quote ? (
                                    <button
                                        onClick={fetchQuote}
                                        disabled={!amount || !recipient || quoteLoading}
                                        className="btn btn-primary w-full h-12 text-base shadow-lg shadow-primary/10 hover:shadow-primary/20"
                                    >
                                        {quoteLoading ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <span className="spinner" /> Calculating...
                                            </div>
                                        ) : (
                                            'Review Quote'
                                        )}
                                    </button>
                                ) : needsApproval ? (
                                    <button
                                        onClick={handleApprove}
                                        disabled={approveLoading || txStatus === 'approving'}
                                        className="btn btn-secondary w-full h-12 text-base"
                                    >
                                        {(approveLoading || txStatus === 'approving') ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <span className="spinner" /> Approving...
                                            </div>
                                        ) : (
                                            'Approve USDC Access'
                                        )}
                                    </button>
                                ) : (
                                    <button
                                        onClick={handleSwap}
                                        disabled={swapLoading || txStatus === 'swapping'}
                                        className="btn btn-primary w-full h-12 text-base shadow-lg shadow-primary/20 hover:shadow-primary/40"
                                    >
                                        {(swapLoading || txStatus === 'swapping') ? (
                                            <div className="flex items-center justify-center gap-2">
                                                <span className="spinner" /> Sending...
                                            </div>
                                        ) : (
                                            'Confirm Payment'
                                        )}
                                    </button>
                                )}

                                {quote && (
                                    <button
                                        onClick={() => setQuote(null)}
                                        className="w-full text-center text-xs text-muted hover:text-text transition-colors"
                                    >
                                        Cancel
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </main>
    );
}

export default function PayPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-bg">
                <div className="spinner" />
            </div>
        }>
            <PaymentContent />
        </Suspense>
    );
}
