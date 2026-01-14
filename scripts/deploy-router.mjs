import { createWalletClient, createPublicClient, http, formatEther, parseAbi } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { arbitrumSepolia } from 'viem/chains';
import solc from 'solc';

const PRIVATE_KEY = process.env.PRIVATE_KEY || '';
const USDC_ADDRESS = '0xcff09905f8f18b35f5a1ba6d2822d62b3d8c48be';
const IDRX_ADDRESS = '0xf98a4a0482d534c004cdb9a3358fd71347c4395b';

function compile(contractName, source) {
    const input = {
        language: 'Solidity',
        sources: { [`${contractName}.sol`]: { content: source } },
        settings: {
            outputSelection: { '*': { '*': ['abi', 'evm.bytecode'] } },
            optimizer: { enabled: true, runs: 200 },
        },
    };
    const output = JSON.parse(solc.compile(JSON.stringify(input)));
    if (output.errors?.some(e => e.severity === 'error')) {
        console.error('Errors:', output.errors);
        throw new Error('Compilation failed');
    }
    const contract = output.contracts[`${contractName}.sol`][contractName];
    return { abi: contract.abi, bytecode: `0x${contract.evm.bytecode.object}` };
}

async function main() {
    if (!PRIVATE_KEY) { console.error('PRIVATE_KEY not set'); process.exit(1); }

    const account = privateKeyToAccount(`0x${PRIVATE_KEY}`);
    console.log('Deploying ArbiSEARouter with:', account.address);

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

    // Simplified ArbiSEARouter (no OpenZeppelin, minimal for demo)
    const routerSource = `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract ArbiSEARouter {
    address public owner;
    address public dealer;
    mapping(address => uint256) public nonces;

    bytes32 public constant DOMAIN_TYPEHASH = keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)");
    bytes32 public constant QUOTE_TYPEHASH = keccak256("Quote(address tokenIn,address tokenOut,uint256 amountIn,uint256 amountOut,address recipient,address payer,uint256 nonce,uint256 deadline)");
    bytes32 public DOMAIN_SEPARATOR;

    event Swap(address indexed payer, address indexed recipient, address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOut);

    constructor(address _dealer) {
        owner = msg.sender;
        dealer = _dealer;
        DOMAIN_SEPARATOR = keccak256(abi.encode(
            DOMAIN_TYPEHASH,
            keccak256("ArbiSEA"),
            keccak256("1"),
            block.chainid,
            address(this)
        ));
    }

    function getNonce(address user) public view returns (uint256) {
        return nonces[user];
    }

    function swapWithSignature(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOut,
        address recipient,
        uint256 deadline,
        bytes calldata signature
    ) external {
        require(block.timestamp <= deadline, "Expired");
        
        bytes32 structHash = keccak256(abi.encode(
            QUOTE_TYPEHASH,
            tokenIn, tokenOut, amountIn, amountOut,
            recipient, msg.sender, nonces[msg.sender], deadline
        ));
        bytes32 digest = keccak256(abi.encodePacked("\\x19\\x01", DOMAIN_SEPARATOR, structHash));
        
        address signer = ecrecover(digest, uint8(bytes1(signature[64])), bytes32(signature[0:32]), bytes32(signature[32:64]));
        require(signer == dealer, "Invalid signature");

        nonces[msg.sender]++;
        
        require(IERC20(tokenIn).transferFrom(msg.sender, owner, amountIn), "Transfer in failed");
        require(IERC20(tokenOut).transfer(recipient, amountOut), "Transfer out failed");
        
        emit Swap(msg.sender, recipient, tokenIn, tokenOut, amountIn, amountOut);
    }

    function fundRouter(address token, uint256 amount) external {
        require(msg.sender == owner, "Not owner");
        IERC20(token).transferFrom(msg.sender, address(this), amount);
    }

    function withdrawToken(address token, uint256 amount) external {
        require(msg.sender == owner, "Not owner");
        IERC20(token).transfer(owner, amount);
    }
}`;

    console.log('Deploying ArbiSEARouter...');
    const routerCompiled = compile('ArbiSEARouter', routerSource);

    const routerHash = await walletClient.deployContract({
        abi: routerCompiled.abi,
        bytecode: routerCompiled.bytecode,
        args: [account.address], // dealer = deployer
    });
    console.log('Tx:', routerHash);

    const routerReceipt = await publicClient.waitForTransactionReceipt({ hash: routerHash });
    console.log('ArbiSEARouter:', routerReceipt.contractAddress);

    // Fund router with IDRX
    console.log('\nFunding router with IDRX...');

    // First mint some IDRX via faucet
    const mockAbi = parseAbi([
        'function faucet(uint256 amount) external',
        'function approve(address spender, uint256 amount) external returns (bool)',
        'function balanceOf(address) view returns (uint256)',
    ]);

    const faucetAmount = 10000000000n * 100n; // 10B IDRX (2 decimals)
    await walletClient.writeContract({
        address: IDRX_ADDRESS,
        abi: mockAbi,
        functionName: 'faucet',
        args: [faucetAmount],
    });
    console.log('Minted 10B IDRX');

    await walletClient.writeContract({
        address: IDRX_ADDRESS,
        abi: mockAbi,
        functionName: 'approve',
        args: [routerReceipt.contractAddress, faucetAmount],
    });
    console.log('Approved router');

    const fundAbi = parseAbi(['function fundRouter(address token, uint256 amount) external']);
    await walletClient.writeContract({
        address: routerReceipt.contractAddress,
        abi: fundAbi,
        functionName: 'fundRouter',
        args: [IDRX_ADDRESS, faucetAmount],
    });
    console.log('Funded router');

    console.log('\n=== Complete ===');
    console.log('NEXT_PUBLIC_ROUTER_ADDRESS=' + routerReceipt.contractAddress);
}

main().catch(console.error);
