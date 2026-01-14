import { createWalletClient, createPublicClient, http, formatEther, encodeDeployData } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { arbitrumSepolia } from 'viem/chains';
import solc from 'solc';
import { readFileSync } from 'fs';
import path from 'path';

const PRIVATE_KEY = process.env.PRIVATE_KEY || '';

// Compile contract
function compile(contractName, source) {
    const input = {
        language: 'Solidity',
        sources: {
            [`${contractName}.sol`]: { content: source },
        },
        settings: {
            outputSelection: { '*': { '*': ['abi', 'evm.bytecode'] } },
            optimizer: { enabled: true, runs: 200 },
        },
    };

    const output = JSON.parse(solc.compile(JSON.stringify(input)));

    if (output.errors?.some(e => e.severity === 'error')) {
        console.error('Compilation errors:', output.errors);
        throw new Error('Compilation failed');
    }

    const contract = output.contracts[`${contractName}.sol`][contractName];
    return {
        abi: contract.abi,
        bytecode: `0x${contract.evm.bytecode.object}`,
    };
}

async function main() {
    if (!PRIVATE_KEY) {
        console.error('PRIVATE_KEY not set');
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

    const balance = await publicClient.getBalance({ address: account.address });
    console.log('Balance:', formatEther(balance), 'ETH\n');

    // Simple MockUSDC source (no imports for easy compilation)
    const mockUSDCSource = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract MockUSDC {
    string public name = "Mock USDC";
    string public symbol = "USDC";
    uint8 public decimals = 6;
    uint256 public totalSupply;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(address indexed owner, address indexed spender, uint256 value);

    function faucet(uint256 amount) external {
        totalSupply += amount;
        balanceOf[msg.sender] += amount;
        emit Transfer(address(0), msg.sender, amount);
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        require(balanceOf[msg.sender] >= amount, "Insufficient");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        require(allowance[from][msg.sender] >= amount, "Not allowed");
        require(balanceOf[from] >= amount, "Insufficient");
        allowance[from][msg.sender] -= amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        emit Transfer(from, to, amount);
        return true;
    }
}`;

    const mockIDRXSource = mockUSDCSource
        .replace('Mock USDC', 'Mock IDRX')
        .replace('USDC', 'IDRX')
        .replace('MockUSDC', 'MockIDRX')
        .replace('decimals = 6', 'decimals = 2');

    // Deploy MockUSDC
    console.log('1. Deploying MockUSDC...');
    const usdcCompiled = compile('MockUSDC', mockUSDCSource);
    const usdcHash = await walletClient.deployContract({
        abi: usdcCompiled.abi,
        bytecode: usdcCompiled.bytecode,
    });
    console.log('   Tx:', usdcHash);
    const usdcReceipt = await publicClient.waitForTransactionReceipt({ hash: usdcHash });
    console.log('   MockUSDC:', usdcReceipt.contractAddress);

    // Deploy MockIDRX
    console.log('\n2. Deploying MockIDRX...');
    const idrxCompiled = compile('MockIDRX', mockIDRXSource);
    const idrxHash = await walletClient.deployContract({
        abi: idrxCompiled.abi,
        bytecode: idrxCompiled.bytecode,
    });
    console.log('   Tx:', idrxHash);
    const idrxReceipt = await publicClient.waitForTransactionReceipt({ hash: idrxHash });
    console.log('   MockIDRX:', idrxReceipt.contractAddress);

    console.log('\n=== Deployment Complete ===');
    console.log('NEXT_PUBLIC_USDC_ADDRESS=' + usdcReceipt.contractAddress);
    console.log('NEXT_PUBLIC_IDRX_ADDRESS=' + idrxReceipt.contractAddress);
    console.log('\nNote: ArbiSEARouter requires OpenZeppelin imports.');
    console.log('Deploy it via Remix IDE at https://remix.ethereum.org');
}

main().catch(console.error);
