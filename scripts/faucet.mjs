import { createWalletClient, createPublicClient, http, parseAbi, parseUnits } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { arbitrumSepolia } from 'viem/chains';

const PRIVATE_KEY = process.env.PRIVATE_KEY || '';
const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS || '0xcff09905f8f18b35f5a1ba6d2822d62b3d8c48be';
const IDRX_ADDRESS = process.env.NEXT_PUBLIC_IDRX_ADDRESS || '0xf98a4a0482d534c004cdb9a3358fd71347c4395b';

async function main() {
    if (!PRIVATE_KEY) { console.error('PRIVATE_KEY not set'); process.exit(1); }

    const account = privateKeyToAccount(`0x${PRIVATE_KEY}`);
    console.log('Minting tokens for:', account.address);

    const publicClient = createPublicClient({
        chain: arbitrumSepolia,
        transport: http('https://sepolia-rollup.arbitrum.io/rpc'),
    });

    const walletClient = createWalletClient({
        account,
        chain: arbitrumSepolia,
        transport: http('https://sepolia-rollup.arbitrum.io/rpc'),
    });

    const abi = parseAbi(['function faucet(uint256 amount) external']);

    // Mint 10,000 USDC (6 decimals)
    console.log('Minting 10,000 USDC...');
    const usdcAmount = parseUnits('10000', 6);
    const usdcHash = await walletClient.writeContract({
        address: USDC_ADDRESS,
        abi,
        functionName: 'faucet',
        args: [usdcAmount],
    });
    console.log('USDC Tx:', usdcHash);
    await publicClient.waitForTransactionReceipt({ hash: usdcHash });
    console.log('Done.');

    // Mint 10,000,000 IDRX (2 decimals)
    console.log('\nMinting 10,000,000 IDRX...');
    const idrxAmount = parseUnits('10000000', 2);
    const idrxHash = await walletClient.writeContract({
        address: IDRX_ADDRESS,
        abi,
        functionName: 'faucet',
        args: [idrxAmount],
    });
    console.log('IDRX Tx:', idrxHash);
    await publicClient.waitForTransactionReceipt({ hash: idrxHash });
    console.log('Done.');
}

main().catch(console.error);
