'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';

export function WalletButton() {
    return (
        <ConnectButton.Custom>
            {({
                account,
                chain,
                openAccountModal,
                openChainModal,
                openConnectModal,
                mounted,
            }) => {
                const ready = mounted;
                const connected = ready && account && chain;

                return (
                    <div
                        {...(!ready && {
                            'aria-hidden': true,
                            style: {
                                opacity: 0,
                                pointerEvents: 'none',
                                userSelect: 'none',
                            },
                        })}
                    >
                        {(() => {
                            if (!connected) {
                                return (
                                    <button
                                        onClick={openConnectModal}
                                        className="btn btn-primary text-xs px-4 py-2"
                                    >
                                        Connect
                                    </button>
                                );
                            }

                            if (chain.unsupported) {
                                return (
                                    <button
                                        onClick={openChainModal}
                                        className="btn text-xs px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/30 rounded-lg"
                                    >
                                        Wrong Network
                                    </button>
                                );
                            }

                            return (
                                <button
                                    onClick={openAccountModal}
                                    className="flex items-center gap-2 px-3 py-2 bg-surface rounded-lg border border-white/5 text-xs"
                                >
                                    <span className="w-2 h-2 bg-success rounded-full" />
                                    <span className="text-text font-medium">
                                        {account.displayName}
                                    </span>
                                </button>
                            );
                        })()}
                    </div>
                );
            }}
        </ConnectButton.Custom>
    );
}
