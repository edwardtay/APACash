// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/**
 * @title MockIDRX
 * @dev Mock Indonesian Rupiah stablecoin for testing on Arbitrum Sepolia
 */
contract MockIDRX is ERC20 {
    constructor() ERC20("Indonesian Rupiah Token", "IDRX") {
        _mint(msg.sender, 100000000000 * 10**2); // 100B IDRX to deployer (2 decimals like IDR)
    }

    function decimals() public pure override returns (uint8) {
        return 2; // IDR has minimal decimal places
    }

    /**
     * @dev Faucet function for testnet - anyone can mint
     */
    function faucet(address to, uint256 amount) external {
        _mint(to, amount);
    }
}
