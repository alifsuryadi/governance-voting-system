# 🏛️ DAO Governance System Frontend

A modern, responsive frontend for decentralized autonomous organization (DAO) governance built on the Stacks blockchain. This application provides a complete interface for proposal creation, voting, and governance token management.

![DAO Governance](https://img.shields.io/badge/Blockchain-Stacks-orange)
![Framework](https://img.shields.io/badge/Framework-Next.js%2015-black)
![Language](https://img.shields.io/badge/Language-TypeScript-blue)
![Styling](https://img.shields.io/badge/Styling-TailwindCSS-cyan)

## ✨ Features

### 🎯 Core Functionality

- **📊 Dashboard**: Real-time governance statistics and metrics
- **📝 Proposals**: Browse, filter, and search governance proposals
- **🗳️ Voting System**: Token-weighted voting with real-time results
- **➕ Create Proposals**: Submit new governance proposals with validation
- **💰 Token Management**: View balance and transfer SPT tokens
- **📱 Responsive Design**: Mobile-first design for all devices

### 🔗 Blockchain Integration

- **Wallet Connection**: Seamless Stacks wallet integration
- **Smart Contract Interaction**: Direct interaction with governance contracts
- **Real-time Updates**: Live proposal status and voting results
- **Transaction Handling**: User-friendly transaction flow

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** installed
- **Stacks Wallet** (Hiro Wallet, Xverse, etc.)
- **Deployed governance contracts** on Stacks testnet/mainnet

### 1. Clone & Install

```bash
# Clone the repository
git clone https://github.com/alifsuryadi/governance-voting-system
cd governance-voting-system/dao-governance-frontend

# Install dependencies
npm install
```

### 2. Environment Configuration

Create `.env.local` file in the root directory:

```bash
# Contract Addresses (UPDATE WITH YOUR DEPLOYED CONTRACTS)
NEXT_PUBLIC_GOVERNANCE_TOKEN_CONTRACT=ST6CNKYDESYCXQ1AQT2DWH56NFS76RB9SHHF6H3H.governance-token-v2
NEXT_PUBLIC_DAO_GOVERNANCE_CONTRACT=ST6CNKYDESYCXQ1AQT2DWH56NFS76RB9SHHF6H3H.dao-governance-v2

# Network Configuration
NEXT_PUBLIC_NETWORK=testnet

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Deploy Smart Contracts (If Not Done)

**Important**: You must deploy the governance contracts before running the frontend.

```bash
# Navigate to contracts directory
cd ../governance-dao

# Generate deployment plan
clarinet deployment generate --testnet

# Deploy to testnet
clarinet deployment apply --testnet

# Copy the deployed contract addresses to .env.local
```

### 4. Run Development Server

```bash
npm run dev
```

🎉 Open [http://localhost:3000](http://localhost:3000) to view the application!

## 📁 Project Structure

```
dao-governance-frontend/
├── 📱 app/                     # Next.js App Router
│   ├── 🏠 page.tsx            # Homepage with dashboard
│   ├── 📋 proposals/          # Proposals listing & details
│   │   ├── page.tsx           # All proposals page
│   │   └── [id]/              # Individual proposal
│   │       └── page.tsx       # Proposal detail page
│   ├── ➕ create-proposal/    # Create new proposal
│   │   └── page.tsx           # Proposal creation form
│   ├── 🏛️ governance/        # Governance info & management
│   │   └── page.tsx           # Governance parameters & token transfers
│   ├── 🎨 globals.css         # Global styles
│   └── 📐 layout.tsx          # Root layout
├── 🧩 components/             # Reusable UI components
│   ├── 🧭 navbar.tsx         # Navigation component
│   ├── 📄 proposal-card.tsx  # Proposal display card
│   ├── 🗳️ voting-interface.tsx # Voting UI component
│   └── 📊 stats-dashboard.tsx # Statistics dashboard
├── 🎣 hooks/                  # Custom React hooks
│   └── 🔗 use-stacks.ts      # Stacks blockchain integration
├── 📚 lib/                    # Utility libraries
│   ├── 📋 contract-utils.ts   # Smart contract interactions
│   └── 💰 stx-utils.ts       # STX/address formatting utilities
├── ⚙️ .env.local              # Environment variables
├── 🎨 tailwind.config.ts      # TailwindCSS configuration
├── 📦 package.json            # Dependencies & scripts
└── 📖 README.md               # This file
```

## 🔧 Technology Stack

### Frontend

- **⚛️ React 19** - Modern React with latest features
- **▲ Next.js 15** - Full-stack React framework with App Router
- **📘 TypeScript** - Type-safe development
- **🎨 TailwindCSS** - Utility-first CSS framework
- **📊 Recharts** - Data visualization library

### Blockchain

- **🔗 Stacks Connect** - Wallet integration library
- **🔧 Stacks.js** - Stacks blockchain interaction
- **📝 Clarity** - Smart contract language (backend)

### Development Tools

- **📦 NPM** - Package management
- **🔥 ESLint** - Code linting
- **🎯 PostCSS** - CSS processing

## 🎮 Usage Guide

### 1. Connect Your Wallet

1. Click "Connect Wallet" in the navigation bar
2. Choose your preferred Stacks wallet (Hiro, Xverse, etc.)
3. Authorize the connection
4. Your address and token balance will be displayed

### 2. Browse Proposals

1. Navigate to "Proposals" page
2. Use filters to find specific proposals:
   - **All**: Show all proposals
   - **Active**: Currently votable proposals
   - **Succeeded**: Proposals that passed
   - **Defeated**: Proposals that failed
   - **Executed**: Implemented proposals
3. Use search to find proposals by title or description

### 3. Vote on Proposals

1. Click on any active proposal
2. Review the proposal details carefully
3. Check your voting power (based on SPT token balance)
4. Select "Vote FOR" or "Vote AGAINST"
5. Confirm the transaction in your wallet
6. Wait for transaction confirmation

### 4. Create a Proposal

1. Navigate to "Create Proposal" page
2. Ensure you meet the requirements:
   - Minimum SPT token balance for proposal threshold
   - Sufficient SPT for proposal deposit
3. Fill in the proposal details:
   - **Title**: Clear, concise proposal title (max 100 characters)
   - **Description**: Detailed explanation (max 500 characters)
   - **Contract Execution** (optional): Specify smart contract to execute if proposal passes
4. Review and submit
5. Confirm the transaction and deposit

### 5. Manage Tokens

1. Go to "Governance" page
2. View your SPT token balance and voting power
3. Transfer tokens to other addresses if needed
4. Learn about governance parameters and how the system works

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Debugging
npm run dev -- --turbo  # Start with Turbo mode (faster)
```

### Environment Variables

| Variable                                | Description                     | Example                  |
| --------------------------------------- | ------------------------------- | ------------------------ |
| `NEXT_PUBLIC_GOVERNANCE_TOKEN_CONTRACT` | SPT token contract address      | `ST1234...token-v2`      |
| `NEXT_PUBLIC_DAO_GOVERNANCE_CONTRACT`   | DAO governance contract address | `ST1234...governance-v2` |
| `NEXT_PUBLIC_NETWORK`                   | Stacks network                  | `testnet` or `mainnet`   |
| `NEXT_PUBLIC_APP_URL`                   | Application URL                 | `http://localhost:3000`  |

## 🚨 Troubleshooting

### Common Issues

#### 🔴 "Contract Connection Issue" Warning

**Cause**: Cannot connect to smart contracts  
**Solutions**:

1. Verify contract addresses in `.env.local`
2. Ensure contracts are deployed on correct network
3. Check network configuration (testnet vs mainnet)
4. Confirm contracts are accessible via Stacks API

#### 🔴 "Cannot read properties of undefined"

**Cause**: Contract function returns unexpected data structure  
**Solutions**:

1. Verify contract deployment and initialization
2. Check if governance info is properly set in contract
3. Ensure contract functions are public and callable

#### 🔴 Wallet Connection Fails

**Cause**: Wallet integration issues  
**Solutions**:

1. Clear browser cache and cookies
2. Try different wallet provider
3. Ensure wallet is on correct network
4. Check wallet extension is installed and enabled

#### 🔴 Transactions Fail

**Cause**: Various transaction-related issues  
**Solutions**:

1. Ensure sufficient STX for gas fees
2. Verify function parameters are correct
3. Check if user meets requirements (token balance, etc.)
4. Try again after a few minutes

#### 🔴 TailwindCSS Classes Not Working

**Cause**: Build or configuration issues  
**Solutions**:

1. Restart development server: `npm run dev`
2. Clear Next.js cache: `rm -rf .next`
3. Reinstall dependencies: `rm -rf node_modules && npm install`

### Debug Mode

Enable detailed logging by adding to `.env.local`:

```bash
# Enable debug mode
NEXT_PUBLIC_DEBUG=true
```

This will show additional console logs for contract interactions and state changes.

## 🚀 Deployment

### Vercel (Recommended)

1. **Prepare for Deployment**

   ```bash
   # Build locally to test
   npm run build
   npm run start
   ```

2. **Deploy to Vercel**

   ```bash
   # Install Vercel CLI
   npm i -g vercel

   # Deploy
   vercel
   ```

3. **Configure Environment Variables**
   - Go to Vercel Dashboard → Project → Settings → Environment Variables
   - Add all variables from `.env.local`
   - Redeploy after adding variables

### Alternative Hosting

#### Netlify

```bash
# Build command
npm run build

# Publish directory
out
```

#### Self-Hosting

```bash
# Build for production
npm run build

# Start production server
npm run start

# Or export static files
npm run build && npm run export
```

## 📊 Smart Contract Integration

### Governance Token Contract Functions

- `get-name`: Get token name (SPT)
- `get-symbol`: Get token symbol
- `get-decimals`: Get decimal places (6)
- `get-total-supply`: Get total token supply
- `get-balance`: Check user token balance
- `transfer`: Transfer tokens between addresses

### DAO Governance Contract Functions

- `get-governance-info`: Retrieve governance parameters
- `get-next-proposal-id`: Get next available proposal ID
- `get-proposal`: Fetch proposal details
- `get-proposal-results`: Get voting results
- `create-proposal`: Submit new proposal
- `vote`: Cast vote on proposal
- `execute-proposal`: Execute approved proposal
- `can-vote`: Check if user can vote
- `has-voted`: Check if user already voted

### Governance Parameters

- **Proposal Threshold**: Minimum SPT tokens required to create proposal
- **Quorum Threshold**: Minimum votes required for proposal validity
- **Voting Period**: Duration of voting in blocks (~10 days)
- **Execution Delay**: Time before execution after approval (~1 day)
- **Proposal Deposit**: SPT tokens required as deposit

## 🎨 Design System

### Color Palette

- **Primary**: Blue shades for main actions and branding
- **Success**: Green for positive actions and completed states
- **Warning**: Yellow/Orange for cautions and pending states
- **Danger**: Red for negative actions and errors
- **Gray**: Neutral colors for text and backgrounds

### Typography

- **Headings**: Bold, clear hierarchy
- **Body**: Readable, accessible font sizes
- **Code**: Monospace for addresses and technical data

### Responsive Breakpoints

- **Mobile**: 375px+ (single column, touch-friendly)
- **Tablet**: 768px+ (two columns, optimized spacing)
- **Desktop**: 1024px+ (full layout with sidebars)

## 🧪 Testing

### Manual Testing Checklist

#### 🔹 Wallet Integration

- [ ] Connect wallet successfully
- [ ] Display correct address and balance
- [ ] Handle wallet disconnection
- [ ] Switch between different wallets

#### 🔹 Proposal Management

- [ ] Load proposals list
- [ ] Filter proposals by status
- [ ] Search proposals by text
- [ ] View individual proposal details
- [ ] Display voting results correctly

#### 🔹 Voting System

- [ ] Show voting interface for active proposals
- [ ] Cast FOR vote successfully
- [ ] Cast AGAINST vote successfully
- [ ] Prevent double voting
- [ ] Display user's vote history

#### 🔹 Proposal Creation

- [ ] Validate form inputs
- [ ] Check governance requirements
- [ ] Submit proposal successfully
- [ ] Handle insufficient balance gracefully

#### 🔹 Responsive Design

- [ ] Mobile layout works correctly
- [ ] Tablet layout is optimized
- [ ] Desktop layout uses full space
- [ ] Navigation is accessible on all sizes

### Automated Testing

Future implementation could include:

- Unit tests with Jest
- Integration tests with React Testing Library
- E2E tests with Playwright
- Contract interaction tests

## 📚 Learning Resources

### Stacks Blockchain

- [Stacks Documentation](https://docs.stacks.co) - Official Stacks docs
- [Clarity Language Reference](https://docs.stacks.co/clarity) - Smart contract language
- [Stacks.js Documentation](https://stacks.js.org) - JavaScript SDK

### Frontend Development

- [Next.js Documentation](https://nextjs.org/docs) - React framework
- [TailwindCSS Documentation](https://tailwindcss.com/docs) - CSS framework
- [TypeScript Handbook](https://www.typescriptlang.org/docs) - Type safety

### DAO Governance

- [DAO Best Practices](https://ethereum.org/en/dao/) - General DAO concepts
- [Governance Token Design](https://blog.tally.xyz/governance-token-design-patterns) - Token economics
- [Voting Mechanisms](https://vitalik.ca/general/2021/08/16/voting3.html) - Voting theory

## 🤝 Contributing

We welcome contributions! Here's how to get started:

### 1. Fork & Clone

```bash
git clone <your-fork-url>
cd dao-governance-frontend
```

### 2. Create Feature Branch

```bash
git checkout -b feature/your-feature-name
```

### 3. Make Changes

- Follow existing code style and patterns
- Add TypeScript types for new functionality
- Update documentation as needed
- Test your changes thoroughly

### 4. Submit Pull Request

- Ensure all tests pass
- Provide clear description of changes
- Link any related issues

### Development Guidelines

- Use TypeScript for all new code
- Follow existing component patterns
- Add proper error handling
- Include loading states for async operations
- Ensure responsive design
- Add comments for complex logic

## 📄 License

MIT License

```
Copyright (c) 2024 DAO Governance System

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

## 🙏 Acknowledgments

- **Stacks Foundation** - For the blockchain infrastructure
- **Hiro Systems** - For development tools and SDKs
- **TailwindCSS Team** - For the excellent CSS framework
- **Next.js Team** - For the React framework
- **Open Source Community** - For countless contributions and inspirations

## 📞 Support

### Getting Help

- 📖 **Documentation**: Check this README and code comments
- 🐛 **Issues**: Open an issue on GitHub
- 💬 **Community**: Join Stacks Discord for general help
- 📧 **Contact**: Reach out to the development team

### Useful Links

- [Stacks Discord](https://discord.gg/stacks) - Community support
- [Stacks Forum](https://forum.stacks.org) - Technical discussions
- [GitHub Issues](https://github.com/alifsuryadi/governance-voting-system/issues) - Bug reports
- [Stacks Explorer](https://explorer.hiro.so) - Blockchain explorer

---

Built with ❤️ for the decentralized future

**Happy Governing! 🏛️✨**
