import { arbitrumSepolia } from 'wagmi/chains';

export const SUPPORTED_CHAINS = [arbitrumSepolia] as const;

// Deployed contract addresses on Arbitrum Sepolia
export const CONTRACTS = {
    USDC: process.env.NEXT_PUBLIC_USDC_ADDRESS || '0xcff09905f8f18b35f5a1ba6d2822d62b3d8c48be',
    IDRX: process.env.NEXT_PUBLIC_IDRX_ADDRESS || '0xf98a4a0482d534c004cdb9a3358fd71347c4395b',
    ROUTER: process.env.NEXT_PUBLIC_ROUTER_ADDRESS || '0x93fc90a3fb7d8c15bbaf50bfcc612b26ca8e68c8',
} as const;

// Full APAC currency configurations
export const CURRENCIES = {
    // Southeast Asia
    IDR: { name: 'Indonesian Rupiah', symbol: 'IDR', flag: '🇮🇩', decimals: 0, region: 'SEA' },
    PHP: { name: 'Philippine Peso', symbol: 'PHP', flag: '🇵🇭', decimals: 2, region: 'SEA' },
    THB: { name: 'Thai Baht', symbol: 'THB', flag: '🇹🇭', decimals: 2, region: 'SEA' },
    MYR: { name: 'Malaysian Ringgit', symbol: 'MYR', flag: '🇲🇾', decimals: 2, region: 'SEA' },
    VND: { name: 'Vietnamese Dong', symbol: 'VND', flag: '🇻🇳', decimals: 0, region: 'SEA' },
    SGD: { name: 'Singapore Dollar', symbol: 'SGD', flag: '🇸🇬', decimals: 2, region: 'SEA' },
    // East Asia
    JPY: { name: 'Japanese Yen', symbol: 'JPY', flag: '🇯🇵', decimals: 0, region: 'East Asia' },
    KRW: { name: 'South Korean Won', symbol: 'KRW', flag: '🇰🇷', decimals: 0, region: 'East Asia' },
    TWD: { name: 'Taiwan Dollar', symbol: 'TWD', flag: '🇹🇼', decimals: 2, region: 'East Asia' },
    HKD: { name: 'Hong Kong Dollar', symbol: 'HKD', flag: '🇭🇰', decimals: 2, region: 'East Asia' },
    CNY: { name: 'Chinese Yuan', symbol: 'CNY', flag: '🇨🇳', decimals: 2, region: 'East Asia' },
    // South Asia
    INR: { name: 'Indian Rupee', symbol: 'INR', flag: '🇮🇳', decimals: 2, region: 'South Asia' },
    PKR: { name: 'Pakistani Rupee', symbol: 'PKR', flag: '🇵🇰', decimals: 2, region: 'South Asia' },
    BDT: { name: 'Bangladeshi Taka', symbol: 'BDT', flag: '🇧🇩', decimals: 2, region: 'South Asia' },
    LKR: { name: 'Sri Lankan Rupee', symbol: 'LKR', flag: '🇱🇰', decimals: 2, region: 'South Asia' },
    // Oceania
    AUD: { name: 'Australian Dollar', symbol: 'AUD', flag: '🇦🇺', decimals: 2, region: 'Oceania' },
    NZD: { name: 'New Zealand Dollar', symbol: 'NZD', flag: '🇳🇿', decimals: 2, region: 'Oceania' },
} as const;

export type CurrencyCode = keyof typeof CURRENCIES;

export const CURRENCY_REGIONS = {
    'SEA': ['IDR', 'PHP', 'THB', 'MYR', 'VND', 'SGD'],
    'East Asia': ['JPY', 'KRW', 'TWD', 'HKD', 'CNY'],
    'South Asia': ['INR', 'PKR', 'BDT', 'LKR'],
    'Oceania': ['AUD', 'NZD'],
} as const;

export const EXPLORER = {
    tx: (hash: string) => `https://sepolia.arbiscan.io/tx/${hash}`,
    address: (addr: string) => `https://sepolia.arbiscan.io/address/${addr}`,
    token: (addr: string) => `https://sepolia.arbiscan.io/token/${addr}`,
};
