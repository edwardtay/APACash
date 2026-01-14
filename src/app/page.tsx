'use client';

import Link from 'next/link';
import Image from 'next/image';
import { WalletButton } from '@/components/WalletButton';
import { CURRENCIES, CURRENCY_REGIONS } from '@/lib/chains';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col">
      {/* Header - Transparent & Minimal */}
      <header className="fixed top-0 left-0 right-0 z-50 glass border-b-0">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <Image src="/logo_white.png" alt="APACash" width={140} height={40} className="h-10 w-auto object-contain" priority />
          </Link>
          <WalletButton />
        </div>
      </header>

      {/* Hero - Impactful & Concise */}
      <section className="pt-40 pb-20 px-6 flex-grow flex flex-col justify-center text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-surface-light/50 backdrop-blur rounded-full text-[10px] tracking-widest uppercase text-muted font-medium border border-border">
            <span className="w-1.5 h-1.5 bg-success rounded-full shadow-[0_0_8px_rgba(0,208,148,0.5)]" />
            Live on Arbitrum Sepolia
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-text leading-[0.95] tracking-tighter">
            Global Crypto.<br />
            <span className="gradient-text">Local Cash.</span>
          </h1>

          <p className="text-muted text-lg md:text-xl max-w-lg mx-auto leading-relaxed font-light">
            Instantly swap USDC to 17 APAC currencies.
            <br className="hidden md:block" /> No banks. No waiting. Just cash.
          </p>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/pay" className="btn btn-primary px-8 py-3 text-base shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all">
              Start Payment
            </Link>
          </div>
        </div>
      </section>

      {/* Stats - Compact & Clean */}
      <section className="py-8 border-y border-border bg-surface/30 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: 'Currencies', value: '17', sub: 'Across APAC' },
            { label: 'Settlement', value: '<1s', sub: 'Atomic Swap' },
            { label: 'Network', value: 'L2', sub: 'Arbitrum' },
            { label: 'Cost', value: '$0.01', sub: 'Gas Fee' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="text-2xl font-bold text-text tracking-tight">{stat.value}</div>
              <div className="text-[10px] uppercase tracking-widest text-muted font-medium mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Currencies - Visual Grid */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row items-end justify-between mb-10 gap-4">
            <h2 className="text-2xl font-bold tracking-tight">APAC Coverage</h2>
            <p className="text-sm text-muted">Direct settlement to 4 key regions</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(CURRENCY_REGIONS).map(([region, codes]) => (
              <div key={region} className="card p-5 hover:bg-surface-light/50 transition-colors group">
                <h3 className="text-xs font-semibold text-muted uppercase tracking-widest mb-4 group-hover:text-primary transition-colors">{region}</h3>
                <div className="flex flex-wrap gap-2">
                  {codes.map((code) => {
                    const curr = CURRENCIES[code as keyof typeof CURRENCIES];
                    return (
                      <div key={code} className="flex items-center gap-2 bg-surface border border-border px-2.5 py-1.5 rounded-md">
                        <span className="text-sm shadow-sm">{curr.flag}</span>
                        <span className="text-xs font-medium text-text">{code}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features - Minimal Icons */}
      <section className="py-24 px-6 bg-surface/30">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl font-bold tracking-tight mb-12">Engineered for Speed</h2>

          <div className="grid md:grid-cols-3 gap-8 text-left">
            <div className="space-y-3 p-4 rounded-xl hover:bg-white/5 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-surface border border-border flex items-center justify-center text-xl shadow-sm">⚡</div>
              <h3 className="font-semibold text-text">Instant Settlement</h3>
              <p className="text-sm text-muted leading-relaxed">Atomic swaps mean funds arrive in seconds, not days. Powered by Arbitrum.</p>
            </div>
            <div className="space-y-3 p-4 rounded-xl hover:bg-white/5 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-surface border border-border flex items-center justify-center text-xl shadow-sm">🔐</div>
              <h3 className="font-semibold text-text">Non-Custodial</h3>
              <p className="text-sm text-muted leading-relaxed">We never hold your funds. You maintain full control until the moment of swap.</p>
            </div>
            <div className="space-y-3 p-4 rounded-xl hover:bg-white/5 transition-colors">
              <div className="w-10 h-10 rounded-lg bg-surface border border-border flex items-center justify-center text-xl shadow-sm">🌏</div>
              <h3 className="font-semibold text-text">Real-Time Rates</h3>
              <p className="text-sm text-muted leading-relaxed">Direct FX rates from multiple high-liquidity sources. No hidden markups.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Minimal */}
      <footer className="py-8 px-6 border-t border-border mt-auto">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-muted">
            <span className="font-semibold text-text">APACash</span>
            <span>•</span>
            <span className="opacity-70">Arbitrum APAC Hackathon 2026</span>
          </div>

          <div className="flex items-center gap-6">
            <span className="text-[10px] text-muted/50 px-3 py-1 border border-border rounded-full">
              Testnet Only
            </span>
            <a
              href="https://github.com/edwardtay/arbitrum-apac"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted hover:text-primary transition-colors"
            >
              GitHub
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
