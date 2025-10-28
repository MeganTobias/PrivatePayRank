# PrivatePayRank - Privacy-Preserving Income Statistics Platform

## Project Overview

**Project Name**: PrivatePayRank  
**Project Type**: Privacy-preserving income statistics dApp powered by FHEVM  
**Target Networks**: Sepolia Testnet (production) + Local Hardhat Node (development)  
**Development Time**: October 2025

## Core Value Proposition

PrivatePayRank enables users to submit their encrypted monthly income data on-chain while maintaining complete privacy. The platform performs statistical computations directly on encrypted data, calculating aggregate income distribution and averages without ever exposing individual submissions.

## Key Features

### 🔐 Privacy-First Architecture
- **End-to-End Encryption**: All income data encrypted using FHEVM technology
- **Zero-Knowledge Statistics**: Aggregate calculations without data exposure
- **User-Controlled Decryption**: Only users can decrypt their own data
- **On-Chain Privacy**: No plaintext data ever stored or transmitted

### 📊 Encrypted Analytics
- **Income Distribution**: Real-time calculation of income ranges
- **Average Computation**: Privacy-preserving average income calculation
- **Statistical Insights**: Aggregate data analysis without individual exposure
- **Owner-Only Operations**: Statistical calculations restricted to contract owner

### 🌐 Dual-Mode Support
- **Mock Mode**: Local testing with `@fhevm/mock-utils`
- **Real Mode**: Production deployment with Relayer SDK
- **Seamless Switching**: Automatic mode detection based on chain ID
- **Development Workflow**: Complete local development environment

## Technical Architecture

### Smart Contract Layer
- **Language**: Solidity 0.8.27
- **Encryption**: FHEVM native types (`euint32`, `euint8`)
- **Operations**: FHE arithmetic operations (`FHE.add`, `FHE.sub`, etc.)
- **Access Control**: `FHE.allow` and `FHE.allowThis` for permissions
- **Events**: Comprehensive logging for data tracking

### Frontend Layer
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript with full type safety
- **Styling**: Tailwind CSS with custom design tokens
- **Wallet Integration**: EIP-6963 compliant with auto-reconnection
- **FHEVM Integration**: Dual SDK support (Mock/Relayer)

### Development Environment
- **Build Tool**: Hardhat with FHEVM plugin
- **Testing**: Chai with mock FHEVM utilities
- **Deployment**: Hardhat Deploy for consistent deployments
- **CLI Tasks**: Custom Hardhat tasks for contract interaction

## User Journey

### 1. Connect Wallet
- EIP-6963 provider discovery
- Auto-reconnection on page refresh
- Multi-wallet support (MetaMask, etc.)
- Chain switching capabilities

### 2. Submit Income Data
- Select income range (6 predefined ranges)
- Add optional anonymous label
- Encrypt data using FHEVM
- Submit to smart contract

### 3. View Personal Data
- Decrypt own submitted income
- View submission history
- Update income information
- Privacy-preserving profile

### 4. Analyze Statistics
- View aggregated income distribution
- See privacy-preserving averages
- Real-time data updates
- Owner-triggered calculations

## Privacy & Security

### Encryption Model
- **Client-Side Encryption**: Data encrypted before transmission
- **Homomorphic Operations**: Computations on encrypted data
- **Access Control**: Fine-grained permission system
- **Signature-Based Decryption**: User-authorized data access

### Security Features
- **No Plaintext Storage**: All sensitive data encrypted
- **Owner-Only Statistics**: Restricted administrative functions
- **Event Auditing**: Complete on-chain audit trail
- **Wallet Security**: Industry-standard connection protocols

## Deployment Information

### Sepolia Testnet
- **Contract Address**: `0x1A6363D7829dd87c8d6D0c0408ee60fD7f57eBE8`
- **Network ID**: 11155111
- **Explorer**: [View on Etherscan](https://sepolia.etherscan.io/address/0x1A6363D7829dd87c8d6D0c0408ee60fD7f57eBE8)

### Local Development
- **Network**: Hardhat Node (Chain ID: 31337)
- **Mode**: Mock FHEVM for development
- **Features**: Hot reloading, instant feedback

## Development Workflow

### Prerequisites
- Node.js 18+
- MetaMask or compatible wallet
- Git for version control

### Local Setup
```bash
# Clone repository
git clone https://github.com/MeganTobias/PrivatePayRank.git
cd PrivatePayRank

# Install dependencies
cd fhevm-hardhat-template && npm install
cd ../privatepayrank-frontend && npm install

# Start development
cd ../fhevm-hardhat-template && npx hardhat node
npx hardhat deploy --network localhost
cd ../privatepayrank-frontend && npm run dev:mock
```

### Testing
```bash
# Contract tests
cd fhevm-hardhat-template
npx hardhat test

# Frontend build verification
cd ../privatepayrank-frontend
npm run build
```

## Innovation Highlights

### Technical Innovation
- **First-of-Kind**: Privacy-preserving income statistics on Ethereum
- **FHEVM Integration**: Cutting-edge homomorphic encryption
- **Dual-Mode Architecture**: Seamless development-to-production workflow
- **Type-Safe Frontend**: Complete TypeScript implementation

### UX Innovation
- **Zero-Knowledge UX**: Privacy without complexity
- **Auto-Reconnection**: Persistent wallet connections
- **Real-Time Updates**: Live statistical updates
- **Glassmorphism Design**: Modern, accessible interface

### Privacy Innovation
- **On-Chain Privacy**: No off-chain data processing
- **User-Controlled Decryption**: Individual data sovereignty
- **Aggregate-Only Statistics**: No individual data exposure
- **Cryptographic Verification**: All operations verifiable

## Future Roadmap

### Phase 1 (Current)
- ✅ Core functionality implementation
- ✅ Sepolia testnet deployment
- ✅ Basic statistical operations
- ✅ User interface completion

### Phase 2 (Planned)
- 🔄 Mainnet deployment
- 🔄 Advanced statistical operations
- 🔄 Multi-chain support
- 🔄 Mobile-responsive enhancements

### Phase 3 (Future)
- 📅 DAO governance integration
- 📅 Advanced privacy features
- 📅 API for third-party integration
- 📅 Enterprise deployment options

## Contributing

We welcome contributions from the community. Please see our [GitHub repository](https://github.com/MeganTobias/PrivatePayRank) for contribution guidelines and issue tracking.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ using FHEVM technology for the future of privacy-preserving blockchain applications.**
