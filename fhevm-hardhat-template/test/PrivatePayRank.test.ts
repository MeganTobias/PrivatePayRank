import { expect } from "chai";
import { ethers, fhevm } from "hardhat";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { PrivatePayRank, PrivatePayRank__factory } from "../types";
import { FhevmType } from "@fhevm/hardhat-plugin";

type Signers = {
  deployer: HardhatEthersSigner;
  alice: HardhatEthersSigner;
  bob: HardhatEthersSigner;
  carol: HardhatEthersSigner;
};

async function deployFixture() {
  const factory = (await ethers.getContractFactory("PrivatePayRank")) as PrivatePayRank__factory;
  const contract = (await factory.deploy()) as PrivatePayRank;
  const contractAddress = await contract.getAddress();
  
  return { contract, contractAddress };
}

describe("PrivatePayRank", function () {
  let signers: Signers;
  let contractAddress: string;
  let contract: PrivatePayRank;

  before(async function () {
    const ethSigners: HardhatEthersSigner[] = await ethers.getSigners();
    signers = {
      deployer: ethSigners[0],
      alice: ethSigners[1],
      bob: ethSigners[2],
      carol: ethSigners[3]
    };
  });

  beforeEach(async function () {
    // Check whether tests are running against FHEVM mock environment
    if (!fhevm.isMock) {
      console.warn("This hardhat test suite can only run with FHEVM mock");
      this.skip();
    }
    
    ({ contract, contractAddress } = await deployFixture());
  });

  describe("Deployment", function () {
    it("should set the correct owner", async function () {
      expect(await contract.owner()).to.equal(signers.deployer.address);
    });

    it("should initialize with zero submissions", async function () {
      expect(await contract.getTotalSubmissions()).to.equal(0);
    });
  });

  describe("Income Submission", function () {
    it("should allow user to submit encrypted income", async function () {
      const income = 4000; // Range 1: 3,001-5,000
      
      const encryptedIncome = await fhevm
        .createEncryptedInput(contractAddress, signers.alice.address)
        .add32(income)
        .encrypt();

      const tx = await contract
        .connect(signers.alice)
        .submitIncome(
          encryptedIncome.handles[0],
          encryptedIncome.inputProof,
          "Software Engineer"
        );

      await expect(tx).to.emit(contract, "IncomeSubmitted");

      expect(await contract.hasSubmitted(signers.alice.address)).to.be.true;
      expect(await contract.getTotalSubmissions()).to.equal(1);
      expect(await contract.userLabels(signers.alice.address)).to.equal("Software Engineer");
    });

    it("should prevent double submission", async function () {
      const income = 4000;
      
      const enc1 = await fhevm
        .createEncryptedInput(contractAddress, signers.alice.address)
        .add32(income)
        .encrypt();

      await contract
        .connect(signers.alice)
        .submitIncome(enc1.handles[0], enc1.inputProof, "Engineer");

      // Try to submit again
      const enc2 = await fhevm
        .createEncryptedInput(contractAddress, signers.alice.address)
        .add32(6500)
        .encrypt();

      await expect(
        contract
          .connect(signers.alice)
          .submitIncome(enc2.handles[0], enc2.inputProof, "Engineer")
      ).to.be.revertedWithCustomError(contract, "AlreadySubmitted");
    });

    it("should allow multiple users to submit", async function () {
      // Alice submits
      const encAlice = await fhevm
        .createEncryptedInput(contractAddress, signers.alice.address)
        .add32(4000)
        .encrypt();
      await contract
        .connect(signers.alice)
        .submitIncome(encAlice.handles[0], encAlice.inputProof, "Engineer");

      // Bob submits
      const encBob = await fhevm
        .createEncryptedInput(contractAddress, signers.bob.address)
        .add32(10000)
        .encrypt();
      await contract
        .connect(signers.bob)
        .submitIncome(encBob.handles[0], encBob.inputProof, "Manager");

      // Carol submits
      const encCarol = await fhevm
        .createEncryptedInput(contractAddress, signers.carol.address)
        .add32(1500)
        .encrypt();
      await contract
        .connect(signers.carol)
        .submitIncome(encCarol.handles[0], encCarol.inputProof, "Intern");

      expect(await contract.getTotalSubmissions()).to.equal(3);
    });
  });

  describe("Income Update", function () {
    it("should allow user to update their income", async function () {
      // Initial submission
      const enc1 = await fhevm
        .createEncryptedInput(contractAddress, signers.alice.address)
        .add32(4000)
        .encrypt();
      await contract
        .connect(signers.alice)
        .submitIncome(enc1.handles[0], enc1.inputProof, "Engineer");

      // Update income
      const enc2 = await fhevm
        .createEncryptedInput(contractAddress, signers.alice.address)
        .add32(6500)
        .encrypt();
      const tx = await contract
        .connect(signers.alice)
        .updateIncome(enc2.handles[0], enc2.inputProof, "Senior Engineer");

      await expect(tx).to.emit(contract, "IncomeUpdated");

      expect(await contract.userLabels(signers.alice.address)).to.equal("Senior Engineer");
    });

    it("should revert update if not submitted before", async function () {
      const enc = await fhevm
        .createEncryptedInput(contractAddress, signers.bob.address)
        .add32(6500)
        .encrypt();

      await expect(
        contract
          .connect(signers.bob)
          .updateIncome(enc.handles[0], enc.inputProof, "Manager")
      ).to.be.revertedWithCustomError(contract, "NotSubmitted");
    });
  });

  describe("User Income Retrieval", function () {
    it("should allow user to get their own encrypted income", async function () {
      const income = 4000;
      
      const encryptedIncome = await fhevm
        .createEncryptedInput(contractAddress, signers.alice.address)
        .add32(income)
        .encrypt();

      await contract
        .connect(signers.alice)
        .submitIncome(
          encryptedIncome.handles[0],
          encryptedIncome.inputProof,
          "Engineer"
        );

      const encryptedHandle = await contract
        .connect(signers.alice)
        .getUserIncome();

      expect(encryptedHandle).to.not.equal(ethers.ZeroHash);
      
      // Decrypt and verify
      const decrypted = await fhevm.userDecryptEuint(
        FhevmType.euint32,
        encryptedHandle,
        contractAddress,
        signers.alice
      );
      expect(decrypted).to.equal(income);
    });

    it("should revert if user has not submitted", async function () {
      await expect(
        contract.connect(signers.bob).getUserIncome()
      ).to.be.revertedWithCustomError(contract, "NotSubmitted");
    });
  });

  describe("Average and Distribution Management", function () {
    beforeEach(async function () {
      // Submit multiple incomes
      const incomes = [
        { signer: signers.alice, value: 4000 },
        { signer: signers.bob, value: 10000 },
        { signer: signers.carol, value: 1500 },
      ];

      for (const { signer, value } of incomes) {
        const enc = await fhevm
          .createEncryptedInput(contractAddress, signer.address)
          .add32(value)
          .encrypt();

        await contract
          .connect(signer)
          .submitIncome(enc.handles[0], enc.inputProof, "");
      }
    });

    it("should allow owner to set average income", async function () {
      const averageValue = 5166; // (4000 + 10000 + 1500) / 3
      
      const tx = await contract
        .connect(signers.deployer)
        .setAverage(averageValue);

      await expect(tx).to.emit(contract, "AverageCalculated");

      const average = await contract.getAverageIncome();
      expect(average).to.equal(averageValue);
    });

    it("should allow owner to set distribution", async function () {
      const dist: [bigint, bigint, bigint, bigint, bigint, bigint] = [1n, 1n, 0n, 1n, 0n, 0n];
      
      const tx = await contract
        .connect(signers.deployer)
        .setDistribution(dist);

      await expect(tx).to.emit(contract, "DistributionCalculated");

      const result = await contract.getDistribution();
      expect(result[0]).to.equal(1);
      expect(result[1]).to.equal(1);
      expect(result[3]).to.equal(1);
    });

    it("should only allow owner to set average", async function () {
      await expect(
        contract.connect(signers.alice).setAverage(5000)
      ).to.be.revertedWithCustomError(contract, "Unauthorized");
    });

    it("should only allow owner to set distribution", async function () {
      const dist: [bigint, bigint, bigint, bigint, bigint, bigint] = [1n, 1n, 0n, 1n, 0n, 0n];
      
      await expect(
        contract.connect(signers.alice).setDistribution(dist)
      ).to.be.revertedWithCustomError(contract, "Unauthorized");
    });
  });

  describe("Ownership", function () {
    it("should transfer ownership", async function () {
      await contract
        .connect(signers.deployer)
        .transferOwnership(signers.alice.address);

      expect(await contract.owner()).to.equal(signers.alice.address);
    });

    it("should not allow non-owner to transfer ownership", async function () {
      await expect(
        contract
          .connect(signers.bob)
          .transferOwnership(signers.alice.address)
      ).to.be.revertedWithCustomError(contract, "Unauthorized");
    });

    it("should not allow transfer to zero address", async function () {
      await expect(
        contract
          .connect(signers.deployer)
          .transferOwnership(ethers.ZeroAddress)
      ).to.be.revertedWithCustomError(contract, "Unauthorized");
    });
  });
});
