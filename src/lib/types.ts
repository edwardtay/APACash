export interface Quote {
    tokenIn: string;
    tokenOut: string;
    amountIn: string;
    amountOut: string;
    payer: string;
    recipient: string;
    nonce: number;
    deadline: number;
}

export interface SignedQuote {
    quote: Quote;
    signature: string;
    rate: {
        rate: number;
        source: string;
    };
    router: string;
}

export interface RateResponse {
    success: boolean;
    data: {
        rate: number;
        source: string;
        timestamp: number;
    };
}

export interface QuoteResponse {
    success: boolean;
    data: SignedQuote;
    error?: string;
}

export type TransactionStatus = 'idle' | 'approving' | 'swapping' | 'success' | 'error';
