// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ArbiSEARouter
 * @dev Cross-border stablecoin swap router with EIP-712 signed quotes
 * 
 * Flow:
 * 1. API generates quote with FX rate and signs it with dealer wallet
 * 2. Payer approves tokenIn (USDC) to this contract
 * 3. Payer calls swapWithSignature with the signed quote
 * 4. Contract verifies signature, deadline, nonce
 * 5. Atomically: pull USDC from payer, push local token to recipient
 */
contract APACashRouter is EIP712, Ownable {
    using SafeERC20 for IERC20;
    using ECDSA for bytes32;

    // EIP-712 type hash for Quote struct
    // IMPORTANT: Field order must match abi.encode order in swapWithSignature
    bytes32 public constant QUOTE_TYPEHASH = keccak256(
        "Quote(address tokenIn,address tokenOut,uint256 amountIn,uint256 amountOut,address payer,address recipient,uint256 nonce,uint256 deadline)"
    );

    // Dealer wallet address that signs quotes
    address public dealer;

    // Nonce tracking per payer to prevent replay attacks
    mapping(address => uint256) public nonces;

    // Events
    event Swap(
        address indexed payer,
        address indexed recipient,
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOut,
        uint256 nonce
    );
    event DealerUpdated(address indexed oldDealer, address indexed newDealer);

    constructor(address _dealer) EIP712("APACash", "1") Ownable(msg.sender) {
        dealer = _dealer;
    }

    /**
     * @dev Update the dealer wallet address
     */
    function setDealer(address _dealer) external onlyOwner {
        emit DealerUpdated(dealer, _dealer);
        dealer = _dealer;
    }

    /**
     * @dev Get the current nonce for a payer
     */
    function getNonce(address payer) external view returns (uint256) {
        return nonces[payer];
    }

    /**
     * @dev Execute a swap with a signed quote from the dealer
     * @param tokenIn Input token address (e.g., USDC)
     * @param tokenOut Output token address (e.g., IDRX)
     * @param amountIn Amount of input token
     * @param amountOut Amount of output token
     * @param recipient Recipient of output tokens
     * @param deadline Quote expiration timestamp
     * @param signature EIP-712 signature from dealer
     */
    function swapWithSignature(
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOut,
        address recipient,
        uint256 deadline,
        bytes calldata signature
    ) external {
        // Check deadline
        require(block.timestamp <= deadline, "Quote expired");

        // Get and increment nonce
        uint256 nonce = nonces[msg.sender]++;

        // Build and hash the quote struct
        bytes32 structHash = keccak256(abi.encode(
            QUOTE_TYPEHASH,
            tokenIn,
            tokenOut,
            amountIn,
            amountOut,
            msg.sender,
            recipient,
            nonce,
            deadline
        ));

        // Recover signer and verify it's the dealer
        bytes32 digest = _hashTypedDataV4(structHash);
        address signer = ECDSA.recover(digest, signature);
        require(signer == dealer, "Invalid signature");

        // Execute atomic swap
        // 1. Pull input tokens from payer
        IERC20(tokenIn).safeTransferFrom(msg.sender, address(this), amountIn);
        
        // 2. Push output tokens to recipient
        IERC20(tokenOut).safeTransfer(recipient, amountOut);

        emit Swap(msg.sender, recipient, tokenIn, tokenOut, amountIn, amountOut, nonce);
    }

    /**
     * @dev Fund the router with output tokens (called by owner/LP)
     */
    function fundRouter(address token, uint256 amount) external {
        IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
    }

    /**
     * @dev Withdraw tokens from the router (owner only) 
     */
    function withdrawTokens(address token, uint256 amount, address to) external onlyOwner {
        IERC20(token).safeTransfer(to, amount);
    }

    /**
     * @dev Get the EIP-712 domain separator
     */
    function DOMAIN_SEPARATOR() external view returns (bytes32) {
        return _domainSeparatorV4();
    }
}
