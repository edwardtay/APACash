require("@nomicfoundation/hardhat-verify");

module.exports = {
    solidity: {
        version: "0.8.20",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200,
            },
            evmVersion: "shanghai"
        },
    },
    networks: {
        arbitrumSepolia: {
            url: "https://arbitrum-sepolia.drpc.org",
            chainId: 421614,
        },
    },
    sourcify: {
        enabled: false
    },
    etherscan: {
        apiKey: {
            arbitrumSepolia: "IUBF12M6UD1XK9XNCB5RF3YZMASZ6I3MYB",
        },
        customChains: [
            {
                network: "arbitrumSepolia",
                chainId: 421614,
                urls: {
                    apiURL: "https://api-sepolia.arbiscan.io/api",
                    browserURL: "https://sepolia.arbiscan.io/",
                },
            },
        ],
    },
    paths: {
        sources: "./contracts", // Point to where I put the verified file
    }
};
