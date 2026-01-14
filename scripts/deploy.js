const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying contracts with:", deployer.address);
    console.log("Account balance:", (await hre.ethers.provider.getBalance(deployer.address)).toString());

    // Deploy MockUSDC
    console.log("\n1. Deploying MockUSDC...");
    const MockUSDC = await hre.ethers.getContractFactory("MockUSDC");
    const usdc = await MockUSDC.deploy();
    await usdc.waitForDeployment();
    const usdcAddress = await usdc.getAddress();
    console.log("MockUSDC deployed to:", usdcAddress);

    // Deploy MockIDRX
    console.log("\n2. Deploying MockIDRX...");
    const MockIDRX = await hre.ethers.getContractFactory("MockIDRX");
    const idrx = await MockIDRX.deploy();
    await idrx.waitForDeployment();
    const idrxAddress = await idrx.getAddress();
    console.log("MockIDRX deployed to:", idrxAddress);

    // Deploy ArbiSEARouter with deployer as dealer
    console.log("\n3. Deploying ArbiSEARouter...");
    const ArbiSEARouter = await hre.ethers.getContractFactory("ArbiSEARouter");
    const router = await ArbiSEARouter.deploy(deployer.address);
    await router.waitForDeployment();
    const routerAddress = await router.getAddress();
    console.log("ArbiSEARouter deployed to:", routerAddress);

    // Fund router with IDRX for swaps
    console.log("\n4. Funding router with IDRX...");
    const fundAmount = hre.ethers.parseUnits("10000000000", 2); // 10B IDRX
    await idrx.approve(routerAddress, fundAmount);
    await router.fundRouter(idrxAddress, fundAmount);
    console.log("Router funded with 10B IDRX");

    console.log("\n=== Deployment Complete ===");
    console.log({
        MockUSDC: usdcAddress,
        MockIDRX: idrxAddress,
        ArbiSEARouter: routerAddress,
        Dealer: deployer.address
    });

    console.log("\n=== Update your .env.local with these addresses ===");
    console.log(`NEXT_PUBLIC_USDC_ADDRESS=${usdcAddress}`);
    console.log(`NEXT_PUBLIC_IDRX_ADDRESS=${idrxAddress}`);
    console.log(`NEXT_PUBLIC_ROUTER_ADDRESS=${routerAddress}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
