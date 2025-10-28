# PrivatePayRank

PrivatePayRank is a privacy-preserving income statistics platform powered by FHEVM (Fully Homomorphic Encryption Virtual Machine). Users can submit their encrypted monthly income data on-chain while maintaining complete privacy. The system performs statistical computations directly on encrypted data, calculating average income and distribution without ever decrypting individual submissions.

## 🚀 Features

- **Privacy-First**: Income data is encrypted using FHEVM technology and never exposed in plaintext
- **On-Chain Statistics**: Aggregate statistics computed directly on encrypted data
- **Dual Mode Support**: Local Mock testing and Sepolia testnet deployment
- **Modern UI**: Responsive Next.js frontend with glassmorphism design
- **Wallet Integration**: EIP-6963 compliant wallet connection with auto-reconnection
- **Real-Time Analytics**: Live calculation of income distribution and averages

## 🏗️ Architecture

### Smart Contracts (`fhevm-hardhat-template/`)
- **PrivatePayRank.sol**: Main contract handling encrypted income submissions
- **FHEVM Integration**: Uses `euint32` for encrypted integers and `FHE.allow` for access control
- **Owner-Only Statistics**: Statistical calculations restricted to contract owner
- **Event Logging**: Comprehensive event system for data tracking

### Frontend (`privatepayrank-frontend/`)
- **Next.js 14**: Modern React framework with App Router
- **TypeScript**: Full type safety throughout the application
- **Tailwind CSS**: Utility-first styling with custom design tokens
- **FHEVM SDK**: Dual support for Mock utils and Relayer SDK
- **Ethers.js**: Ethereum blockchain interaction

## 🛠️ Tech Stack

- **Blockchain**: Ethereum (Sepolia testnet)
- **Encryption**: FHEVM (Fully Homomorphic Encryption)
- **Smart Contracts**: Solidity 0.8.27
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Development**: Hardhat, @fhevm/hardhat-plugin
- **Testing**: Chai, @fhevm/mock-utils

## 📦 Installation

### Prerequisites
- Node.js 18+
- npm or yarn
- MetaMask or compatible wallet

### Clone and Install
```bash
git clone https://github.com/MeganTobias/PrivatePayRank.git
cd PrivatePayRank

# Install contract dependencies
cd fhevm-hardhat-template
npm install

# Install frontend dependencies
cd ../privatepayrank-frontend
npm install
```

## 🚀 Quick Start

### Local Development (Mock Mode)

1. **Start Hardhat Node**:
```bash
cd fhevm-hardhat-template
npx hardhat node
```

2. **Deploy Contracts**:
```bash
npx hardhat deploy --network localhost
```

3. **Start Frontend**:
```bash
cd ../privatepayrank-frontend
npm run dev:mock
```

4. **Access Application**: Open http://localhost:3000

### Sepolia Testnet

1. **Set Environment Variables**:
```bash
cd fhevm-hardhat-template
npx hardhat vars set MNEMONIC "your twelve word mnemonic phrase"
npx hardhat vars set INFURA_API_KEY "your_infura_api_key"
```

2. **Deploy to Sepolia**:
```bash
npx hardhat deploy --network sepolia
```

3. **Start Frontend (Testnet Mode)**:
```bash
cd ../privatepayrank-frontend
npm run dev
```

## 📋 Usage

### Submit Income Data
1. Connect your wallet to the application
2. Navigate to "Submit Income" page
3. Select your income range and add optional label
4. Sign the transaction to submit encrypted data

### Decrypt Personal Data
1. Go to "Your Profile" page
2. Click "Decrypt My Income"
3. Sign the FHEVM decryption signature
4. View your decrypted income data

### View Statistics (Owner Only)
1. Navigate to "Statistics" page
2. Click "Calculate Statistics" (requires contract owner account)
3. View aggregated income distribution and averages

## 🎯 Deployed Contracts

### Sepolia Testnet
- **PrivatePayRank**: [`0x1A6363D7829dd87c8d6D0c0408ee60fD7f57eBE8`](https://sepolia.etherscan.io/address/0x1A6363D7829dd87c8d6D0c0408ee60fD7f57eBE8)

## 🧪 Testing

### Contract Tests
```bash
cd fhevm-hardhat-template
npx hardhat test
```

### Frontend Build
```bash
cd privatepayrank-frontend
npm run build
```

## 📁 Project Structure

```
PrivatePayRank/
├── fhevm-hardhat-template/          # Smart contract development
│   ├── contracts/                   # Solidity contracts
│   ├── deploy/                     # Deployment scripts
│   ├── test/                       # Contract tests
│   ├── tasks/                      # Hardhat CLI tasks
│   └── hardhat.config.ts          # Hardhat configuration
├── privatepayrank-frontend/         # Next.js frontend
│   ├── app/                        # App Router pages
│   ├── components/                 # React components
│   ├── hooks/                      # Custom React hooks
│   ├── fhevm/                      # FHEVM integration
│   ├── abi/                        # Generated ABI files
│   └── design-tokens.ts            # Design system
└── README.md
```

## 🔒 Privacy & Security

- **End-to-End Encryption**: All income data encrypted with FHEVM
- **Zero-Knowledge Statistics**: Aggregate calculations without data exposure
- **Access Control**: User-specific decryption permissions
- **Audit Trail**: Complete on-chain event logging
- **Wallet Security**: EIP-6963 standard compliance

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Zama](https://www.zama.ai/) for FHEVM technology
- [Hardhat](https://hardhat.org/) for development framework
- [Next.js](https://nextjs.org/) for the frontend framework
- [Ethers.js](https://ethers.org/) for blockchain interaction

## 📞 Support

For questions and support, please open an issue on GitHub or contact the development team.

---

**Built with ❤️ using FHEVM technology for privacy-preserving blockchain applications.**
