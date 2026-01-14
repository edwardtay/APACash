const { ethers } = require("ethers");
const fs = require("fs");
const path = require("path");

async function main() {
    const rpcUrl = "https://sepolia-rollup.arbitrum.io/rpc";
    const privateKey = process.env.DEALER_PRIVATE_KEY;
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const wallet = new ethers.Wallet(privateKey, provider);

    console.log("Deployer:", wallet.address);

    // Read bytecode
    const bytecodePath = path.join(__dirname, "../bytecode.txt");
    let bytecode = fs.readFileSync(bytecodePath, "utf8").trim();
    if (!bytecode.startsWith("0x")) bytecode = "0x" + bytecode;

    // Constructor Args
    // Dealer address: 0x909dAFb395eB281b92B317552E12133098D62881
    // Pad to 32 bytes
    const dealerAddress = "0x909dAFb395eB281b92B317552E12133098D62881";
    const abiCoder = new ethers.AbiCoder();
    const args = abiCoder.encode(["address"], [dealerAddress]);

    // Combine
    const deployData = bytecode + args.slice(2); // remove 0x from args

    console.log("Deploying...");
    const tx = await wallet.sendTransaction({
        data: deployData,
        gasLimit: 3000000
    });

    console.log("Tx Hash:", tx.hash);
    const receipt = await tx.wait();
    console.log("Contract Address:", receipt.contractAddress);
}

main().catch(console.error);
