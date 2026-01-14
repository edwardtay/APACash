import { createWalletClient, createPublicClient, http, parseEther, formatEther } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { arbitrumSepolia } from 'viem/chains';
import { readFileSync, writeFileSync } from 'fs';

// Contract bytecodes (compiled from Solidity)
// These are minimal mock implementations for demo purposes

const PRIVATE_KEY = process.env.PRIVATE_KEY || '';

async function main() {
    if (!PRIVATE_KEY) {
        console.error('PRIVATE_KEY not set in environment');
        process.exit(1);
    }

    const account = privateKeyToAccount(`0x${PRIVATE_KEY}`);
    console.log('Deploying with:', account.address);

    const publicClient = createPublicClient({
        chain: arbitrumSepolia,
        transport: http('https://sepolia-rollup.arbitrum.io/rpc'),
    });

    const walletClient = createWalletClient({
        account,
        chain: arbitrumSepolia,
        transport: http('https://sepolia-rollup.arbitrum.io/rpc'),
    });

    // Check balance
    const balance = await publicClient.getBalance({ address: account.address });
    console.log('Balance:', formatEther(balance), 'ETH');

    if (balance === 0n) {
        console.error('Account has no ETH. Get testnet ETH from https://www.alchemy.com/faucets/arbitrum-sepolia');
        process.exit(1);
    }

    console.log('\nNote: To fully deploy contracts, use Remix IDE:');
    console.log('1. Go to https://remix.ethereum.org');
    console.log('2. Paste contract code from contracts/ folder');
    console.log('3. Connect wallet with Arbitrum Sepolia');
    console.log('4. Deploy contracts and copy addresses');
    console.log('\nFor hackathon demo, the app works without deployed contracts');
    console.log('(quotes are signed but swap txs will fail until contracts deployed)');
}

main().catch(console.error);
