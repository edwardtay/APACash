// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract APACashRouter {
    address public owner;
    address public dealer;
    mapping(address => uint256) public nonces;

    bytes32 public constant DOMAIN_TYPEHASH = keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)");
    bytes32 public constant QUOTE_TYPEHASH = keccak256("Quote(address tokenIn,address tokenOut,uint256 amountIn,uint256 amountOut,address payer,address recipient,uint256 nonce,uint256 deadline)");
    bytes32 public DOMAIN_SEPARATOR;

    event Swap(address indexed payer, address indexed recipient, address tokenIn, address tokenOut, uint256 amountIn, uint256 amountOut);

    constructor(address _dealer) {
        owner = msg.sender;
        dealer = _dealer;
        DOMAIN_SEPARATOR = keccak256(abi.encode(
            DOMAIN_TYPEHASH,
            keccak256("APACash"), 
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
            msg.sender, recipient, nonces[msg.sender], deadline
        ));
        bytes32 digest = keccak256(abi.encodePacked("\\x19\\x01", DOMAIN_SEPARATOR, structHash));
        
        // Manual ecrecover to avoid OpenZeppelin dependencies in script
        address signer = ecrecover(digest, uint8(bytes1(signature[64])), bytes32(signature[0:32]), bytes32(signature[32:64]));
        require(signer == dealer, "Invalid signature");

        nonces[msg.sender]++;
        
        // Atomic swap logic
        require(IERC20(tokenIn).transferFrom(msg.sender, owner, amountIn), "Transfer in failed");
        require(IERC20(tokenOut).transfer(recipient, amountOut), "Transfer out failed");
        
        emit Swap(msg.sender, recipient, tokenIn, tokenOut, amountIn, amountOut);
    }

    function fundRouter(address token, uint256 amount) external {
        require(msg.sender == owner, "Not owner");
        IERC20(token).transferFrom(msg.sender, address(this), amount);
    }
}
