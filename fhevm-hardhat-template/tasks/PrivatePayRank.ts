import { task } from "hardhat/config";
import type { TaskArguments } from "hardhat/types";

task("privatepayrank:submit", "Submit encrypted income to PrivatePayRank")
  .addParam("income", "Income value (midpoint of range)")
  .addOptionalParam("label", "Optional anonymous label", "")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;
    const { income, label } = taskArguments;
    
    // Initialize FHEVM CLI API
    await fhevm.initializeCLIApi();
    
    const deployment = await deployments.get("PrivatePayRank");
    const contract = await ethers.getContractAt("PrivatePayRank", deployment.address);
    
    const [signer] = await ethers.getSigners();
    
    // Create encrypted input using fhevm plugin
    const encrypted = await fhevm
      .createEncryptedInput(deployment.address, signer.address)
      .add32(parseInt(income))
      .encrypt();
    
    console.log(`Submitting income: ${income} USD/month`);
    console.log(`Label: ${label || "(none)"}`);
    
    const tx = await contract
      .connect(signer)
      .submitIncome(encrypted.handles[0], encrypted.inputProof, label);
    
    await tx.wait();
    
    console.log("✅ Income submitted successfully!");
    console.log(`Transaction hash: ${tx.hash}`);
  });

task("privatepayrank:update", "Update encrypted income")
  .addParam("income", "New income value")
  .addOptionalParam("label", "Updated label", "")
  .setAction(async function (taskArguments: TaskArguments, hre) {
    const { ethers, deployments, fhevm } = hre;
    const { income, label } = taskArguments;
    
    // Initialize FHEVM CLI API
    await fhevm.initializeCLIApi();
    
    const deployment = await deployments.get("PrivatePayRank");
    const contract = await ethers.getContractAt("PrivatePayRank", deployment.address);
    
    const [signer] = await ethers.getSigners();
    
    // Create encrypted input using fhevm plugin
    const encrypted = await fhevm
      .createEncryptedInput(deployment.address, signer.address)
      .add32(parseInt(income))
      .encrypt();
    
    console.log(`Updating income to: ${income} USD/month`);
    
    const tx = await contract
      .connect(signer)
      .updateIncome(encrypted.handles[0], encrypted.inputProof, label);
    
    await tx.wait();
    
    console.log("✅ Income updated successfully!");
    console.log(`Transaction hash: ${tx.hash}`);
  });

task("privatepayrank:calculate-average", "Calculate average income (owner only)")
  .setAction(async function (taskArguments: TaskArguments, { ethers, deployments }) {
    const deployment = await deployments.get("PrivatePayRank");
    const contract = await ethers.getContractAt("PrivatePayRank", deployment.address);
    
    const [signer] = await ethers.getSigners();
    
    console.log("Calculating average income...");
    
    const tx = await contract.connect(signer).calculateAverage();
    await tx.wait();
    
    const average = await contract.getAverageIncome();
    
    console.log("✅ Average calculated successfully!");
    console.log(`Average income: ${average} USD/month`);
    console.log(`Transaction hash: ${tx.hash}`);
  });

task("privatepayrank:calculate-distribution", "Calculate income distribution (owner only)")
  .setAction(async function (taskArguments: TaskArguments, { ethers, deployments }) {
    const deployment = await deployments.get("PrivatePayRank");
    const contract = await ethers.getContractAt("PrivatePayRank", deployment.address);
    
    const [signer] = await ethers.getSigners();
    
    console.log("Calculating income distribution...");
    
    const tx = await contract.connect(signer).calculateDistribution();
    await tx.wait();
    
    const dist = await contract.getDistribution();
    
    console.log("✅ Distribution calculated successfully!");
    console.log("\nIncome Distribution:");
    console.log(`  Range 0 (0-3,000):       ${dist[0]} submissions`);
    console.log(`  Range 1 (3,001-5,000):   ${dist[1]} submissions`);
    console.log(`  Range 2 (5,001-8,000):   ${dist[2]} submissions`);
    console.log(`  Range 3 (8,001-12,000):  ${dist[3]} submissions`);
    console.log(`  Range 4 (12,001-20,000): ${dist[4]} submissions`);
    console.log(`  Range 5 (20,001+):       ${dist[5]} submissions`);
    console.log(`\nTransaction hash: ${tx.hash}`);
  });

task("privatepayrank:stats", "View current statistics")
  .setAction(async function (taskArguments: TaskArguments, { ethers, deployments }) {
    const deployment = await deployments.get("PrivatePayRank");
    const contract = await ethers.getContractAt("PrivatePayRank", deployment.address);
    
    const total = await contract.getTotalSubmissions();
    const average = await contract.getAverageIncome();
    const dist = await contract.getDistribution();
    
    console.log("\n📊 PrivatePayRank Statistics");
    console.log("================================");
    console.log(`Total Submissions: ${total}`);
    console.log(`Average Income: ${average} USD/month`);
    console.log("\nIncome Distribution:");
    console.log(`  Range 0 (0-3,000):       ${dist[0]} (${Number(total) > 0 ? ((Number(dist[0]) / Number(total)) * 100).toFixed(1) : 0}%)`);
    console.log(`  Range 1 (3,001-5,000):   ${dist[1]} (${Number(total) > 0 ? ((Number(dist[1]) / Number(total)) * 100).toFixed(1) : 0}%)`);
    console.log(`  Range 2 (5,001-8,000):   ${dist[2]} (${Number(total) > 0 ? ((Number(dist[2]) / Number(total)) * 100).toFixed(1) : 0}%)`);
    console.log(`  Range 3 (8,001-12,000):  ${dist[3]} (${Number(total) > 0 ? ((Number(dist[3]) / Number(total)) * 100).toFixed(1) : 0}%)`);
    console.log(`  Range 4 (12,001-20,000): ${dist[4]} (${Number(total) > 0 ? ((Number(dist[4]) / Number(total)) * 100).toFixed(1) : 0}%)`);
    console.log(`  Range 5 (20,001+):       ${dist[5]} (${Number(total) > 0 ? ((Number(dist[5]) / Number(total)) * 100).toFixed(1) : 0}%)`);
    console.log("================================\n");
  });

task("privatepayrank:set-sample-stats", "Set sample statistics for demo")
  .setAction(async function (taskArguments: TaskArguments, { ethers, deployments }) {
    const deployment = await deployments.get("PrivatePayRank");
    const contract = await ethers.getContractAt("PrivatePayRank", deployment.address);
    const [signer] = await ethers.getSigners();
    
    console.log("Setting sample statistics...");
    
    // Set realistic average
    console.log("Setting average to $4,500...");
    const avgTx = await contract.connect(signer).setAverage(4500);
    await avgTx.wait();
    
    // Set realistic distribution 
    const distribution = [3, 12, 18, 22, 15, 6]; // Sample distribution
    console.log("Setting distribution:", distribution);
    const distTx = await contract.connect(signer).setDistribution(distribution);
    await distTx.wait();
    
    console.log("✅ Sample statistics have been set!");
    console.log("✅ Average: $4,500");
    console.log("✅ Distribution:", distribution.join(", "));
  });





