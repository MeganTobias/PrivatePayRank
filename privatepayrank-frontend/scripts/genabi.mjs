import * as fs from "fs";
import * as path from "path";

const CONTRACT_NAME = "PrivatePayRank";

// Path to fhevm-hardhat-template
const rel = "../fhevm-hardhat-template";

// Output directory for generated ABI files
const outdir = path.resolve("./abi");

if (!fs.existsSync(outdir)) {
  fs.mkdirSync(outdir);
}

const dir = path.resolve(rel);
const dirname = path.basename(dir);

const line =
  "\n===================================================================\n";

if (!fs.existsSync(dir)) {
  console.error(
    `${line}Unable to locate ${rel}. Expecting <root>/${dirname}${line}`
  );
  process.exit(1);
}

if (!fs.existsSync(outdir)) {
  console.error(`${line}Unable to locate ${outdir}.${line}`);
  process.exit(1);
}

const deploymentsDir = path.join(dir, "deployments");

function readDeployment(chainName, chainId, contractName, optional) {
  const chainDeploymentDir = path.join(deploymentsDir, chainName);

  if (!fs.existsSync(chainDeploymentDir)) {
    if (optional) {
      console.warn(
        `Warning: Unable to locate '${chainDeploymentDir}' directory.\nTo deploy: cd ${dirname} && npx hardhat deploy --network ${chainName}`
      );
      return undefined;
    }
    console.error(
      `${line}Unable to locate '${chainDeploymentDir}' directory.\n\n1. Goto '${dirname}' directory\n2. Run 'npx hardhat deploy --network ${chainName}'.${line}`
    );
    process.exit(1);
  }

  const contractPath = path.join(chainDeploymentDir, `${contractName}.json`);
  if (!fs.existsSync(contractPath)) {
    if (optional) {
      console.warn(`Warning: ${contractName}.json not found in ${chainName} deployments`);
      return undefined;
    }
    console.error(`${line}Contract ${contractName}.json not found in ${chainDeploymentDir}${line}`);
    process.exit(1);
  }

  const jsonString = fs.readFileSync(contractPath, "utf-8");
  const obj = JSON.parse(jsonString);
  obj.chainId = chainId;

  return obj;
}

// Read localhost deployment (required for ABI)
const deployLocalhost = readDeployment("localhost", 31337, CONTRACT_NAME, true);

// Read Sepolia deployment (optional)
let deploySepolia = readDeployment("sepolia", 11155111, CONTRACT_NAME, true);

// Use localhost ABI if available, otherwise try Sepolia
let abi = null;
if (deployLocalhost) {
  abi = deployLocalhost.abi;
} else if (deploySepolia) {
  abi = deploySepolia.abi;
} else {
  console.error(
    `${line}No deployments found for ${CONTRACT_NAME}.\nPlease deploy to localhost or sepolia first.${line}`
  );
  process.exit(1);
}

// Create fallback deployments if missing
if (!deployLocalhost) {
  console.warn(`Warning: localhost deployment not found, using zero address`);
}

if (!deploySepolia) {
  console.warn(`Warning: sepolia deployment not found, using zero address`);
  deploySepolia = { abi: abi, address: "0x0000000000000000000000000000000000000000" };
}

// Verify ABI consistency if both deployments exist
if (deployLocalhost && deploySepolia) {
  if (
    JSON.stringify(deployLocalhost.abi) !== JSON.stringify(deploySepolia.abi)
  ) {
    console.error(
      `${line}Deployments on localhost and Sepolia have different ABIs. Consider re-deploying contracts on both networks.${line}`
    );
    process.exit(1);
  }
}

// Generate TypeScript ABI file
const tsCode = `
/*
  This file is auto-generated.
  Command: 'npm run genabi'
*/
export const ${CONTRACT_NAME}ABI = ${JSON.stringify({ abi: abi }, null, 2)} as const;
`;

// Generate TypeScript addresses file
const tsAddresses = `
/*
  This file is auto-generated.
  Command: 'npm run genabi'
*/
export const ${CONTRACT_NAME}Addresses = { 
  "11155111": { address: "${deploySepolia?.address || '0x0000000000000000000000000000000000000000'}", chainId: 11155111, chainName: "sepolia" },
  "31337": { address: "${deployLocalhost?.address || '0x0000000000000000000000000000000000000000'}", chainId: 31337, chainName: "hardhat" },
};
`;

console.log(`✅ Generated ${path.join(outdir, `${CONTRACT_NAME}ABI.ts`)}`);
console.log(`✅ Generated ${path.join(outdir, `${CONTRACT_NAME}Addresses.ts`)}`);
console.log("\nAddresses:");
console.log(tsAddresses);

fs.writeFileSync(path.join(outdir, `${CONTRACT_NAME}ABI.ts`), tsCode, "utf-8");
fs.writeFileSync(
  path.join(outdir, `${CONTRACT_NAME}Addresses.ts`),
  tsAddresses,
  "utf-8"
);





