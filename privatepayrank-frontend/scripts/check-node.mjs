import { ethers } from "ethers";

async function checkIfHardhatNodeIsRunning() {
  const provider = new ethers.JsonRpcProvider("http://localhost:8545");

  try {
    const blockNumber = await provider.getBlockNumber();
    console.log(`✅ Hardhat node is running. Current block number: ${blockNumber}`);
    
    // Check if it's actually a Hardhat node
    try {
      const clientVersion = await provider.send("web3_clientVersion", []);
      if (clientVersion && clientVersion.toLowerCase().includes("hardhat")) {
        console.log(`✅ Confirmed Hardhat node: ${clientVersion}`);
      }
    } catch (e) {
      console.warn("⚠️  Warning: Could not verify if this is a Hardhat node");
    }
  } catch (error) {
    console.error("\n");
    console.error("===============================================================================");
    console.error(" 💥 ❌ Local Hardhat Node is not running!");
    console.error("");
    console.error("   To start Hardhat Node:");
    console.error("   ----------------------");
    console.error("   ✅ 1. Open a new terminal window");
    console.error("   ✅ 2. cd fhevm-hardhat-template");
    console.error("   ✅ 3. Run: npx hardhat node");
    console.error("");
    console.error("   Then deploy the contracts:");
    console.error("   --------------------------");
    console.error("   ✅ 4. Open another terminal window");
    console.error("   ✅ 5. cd fhevm-hardhat-template");
    console.error("   ✅ 6. Run: npx hardhat deploy --network localhost");
    console.error("===============================================================================");
    console.error("\n");
    process.exit(1);
  }
}

checkIfHardhatNodeIsRunning();





