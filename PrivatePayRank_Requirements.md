# PrivatePayRank - 加密收入统计榜 dApp 需求文档

## 项目概述

**项目名称**：PrivatePayRank  
**项目类型**：基于 FHEVM 的隐私保护收入统计 dApp  
**目标网络**：Sepolia 测试网（主）+ 本地 Hardhat 节点（开发）  
**开发时间**：2025年10月

### 核心价值
用户可以加密上传自己的月收入数据，系统在链上进行完全加密的聚合计算，生成收入分布统计、平均水平等匿名结果，全程保护个人隐私。

### 技术特点
- ✅ 使用 FHEVM 的 `euint32` 存储加密收入数据
- ✅ 链上完全加密计算（加法、比较、计数）
- ✅ 仅授权用户可解密自己的提交数据
- ✅ 聚合结果公开，但无法反推个人收入
- ✅ 支持本地 Mock 模式和真实 Relayer 模式

---

## 功能模块

### 1. 欢迎页（Welcome Page）
**路由**：`/`  
**功能**：
- 展示 dApp 名称、Logo 和简介
- 突出隐私保护特性说明
- "Get Started" 按钮跳转到主应用页面
- 显示当前参与统计的总人数（链上读取）

**UI 要素**：
- Hero Section：大标题 + Slogan
- Feature Cards：3个特性卡片（Privacy / Encrypted / On-chain）
- CTA 按钮：进入应用

---

### 2. 导航栏（Navigation Bar）
**位置**：全局顶部  
**功能**：
- Logo + dApp 名称（点击返回首页）
- 导航链接：
  - Home
  - Submit Income
  - Statistics
  - My Profile
- 钱包连接按钮（右侧）

**交互**：
- 未连接钱包时显示 "Connect Wallet"
- 已连接时显示地址缩写（`0x1234...5678`）+ 断开选项
- 支持响应式：移动端折叠为汉堡菜单

---

### 3. 钱包连接（Wallet Connection）
**标准**：EIP-6963 + 自动重连  
**持久化**：
- `wallet.connected`（布尔值）
- `wallet.lastConnectorId`（provider UUID）
- `wallet.lastAccounts`（地址数组）
- `wallet.lastChainId`（链ID）

**功能**：
1. **首次连接**：
   - 扫描 EIP-6963 providers（MetaMask / Coinbase Wallet 等）
   - 用户选择钱包后调用 `eth_requestAccounts`
   - 成功后持久化连接状态

2. **刷新自动重连**：
   - 检测 `wallet.connected === true`
   - 按 `lastConnectorId` 匹配 provider
   - 静默调用 `eth_accounts`（不弹窗）
   - 恢复 signer 和地址

3. **事件监听**：
   - `accountsChanged`：更新账户，清理旧账户的解密签名
   - `chainChanged`：更新链ID，提示切换网络
   - `disconnect`：清理持久化状态

4. **链切换**：
   - 检测当前链是否为 Sepolia（11155111）或本地（31337）
   - 不匹配时提示用户切换
   - 提供一键切换按钮（`wallet_switchEthereumChain`）

---

### 4. 加密数据提交（Encrypted Income Submission）
**路由**：`/submit`  
**合约方法**：`submitIncome(inEuint32 calldata encryptedIncome)`

**UI 流程**：
1. **收入区间选择**（单选）：
   - 0 - 3,000 USD/month
   - 3,001 - 5,000 USD/month
   - 5,001 - 8,000 USD/month
   - 8,001 - 12,000 USD/month
   - 12,001 - 20,000 USD/month
   - 20,001+ USD/month

2. **匿名标签**（可选输入）：
   - 用户可填写职业类型（如 "Software Engineer"）
   - 不与地址绑定，仅用于分类展示

3. **提交按钮**：
   - 点击后前端加密收入区间的中位数值（如 3001-5000 → 4000）
   - 调用 FHEVM SDK 的 `instance.encrypt32(4000)`
   - 发送交易到合约
   - 显示加载状态 + 交易哈希

4. **反馈**：
   - 成功：显示 "Income submitted successfully!"
   - 失败：显示错误信息（如 "Already submitted" / "Transaction failed"）

**合约逻辑**：
```solidity
mapping(address => euint32) public userIncomes;
mapping(address => bool) public hasSubmitted;
euint32[] public allIncomes;
uint256 public totalSubmissions;

function submitIncome(inEuint32 calldata encryptedIncome) public {
    require(!hasSubmitted[msg.sender], "Already submitted");
    
    euint32 income = FHE.asEuint32(encryptedIncome);
    FHE.allowThis(income);
    FHE.allow(income, msg.sender); // 用户可解密自己的数据
    
    userIncomes[msg.sender] = income;
    allIncomes.push(income);
    hasSubmitted[msg.sender] = true;
    totalSubmissions++;
    
    emit IncomeSubmitted(msg.sender, block.timestamp);
}
```

---

### 5. 聚合分布计算（Aggregated Statistics）
**路由**：`/statistics`  
**合约方法**：
- `getTotalSubmissions() → uint256`
- `getAverageIncome() → uint256`（解密后的平均值）
- `getDistribution() → uint256[6]`（6个区间的人数分布）

**UI 展示**：
1. **总览卡片**：
   - 总参与人数
   - 平均收入（USD/month）
   - 最后更新时间

2. **分布图表**：
   - 横向柱状图（Bar Chart）
   - X轴：收入区间
   - Y轴：人数或百分比
   - 使用 Chart.js 或 Recharts

3. **匿名标签云**（可选）：
   - 显示用户提交的职业标签
   - 字体大小根据提交人数缩放

**合约逻辑**：
```solidity
// 计算平均值（需解密所有数据后链下计算，或使用 FHE.decrypt 批量解密）
function calculateAverage() public onlyOwner {
    require(totalSubmissions > 0, "No submissions");
    
    euint32 sum = FHE.asEuint32(0);
    for (uint i = 0; i < allIncomes.length; i++) {
        sum = FHE.add(sum, allIncomes[i]);
    }
    
    // 解密总和并除以人数
    uint256 decryptedSum = FHE.decrypt(sum);
    averageIncome = decryptedSum / totalSubmissions;
    
    emit AverageCalculated(averageIncome, block.timestamp);
}

// 计算分布（需逐个比较每个收入与区间边界）
function calculateDistribution() public onlyOwner {
    uint256[6] memory dist;
    
    for (uint i = 0; i < allIncomes.length; i++) {
        euint32 income = allIncomes[i];
        
        // 判断属于哪个区间（使用 FHE.lt / FHE.lte）
        ebool isRange0 = FHE.lte(income, FHE.asEuint32(3000));
        ebool isRange1 = FHE.and(
            FHE.gt(income, FHE.asEuint32(3000)),
            FHE.lte(income, FHE.asEuint32(5000))
        );
        // ... 类似逻辑判断其他区间
        
        // 解密判断结果并累加（或使用 FHE.select 聚合）
        if (FHE.decrypt(isRange0)) dist[0]++;
        if (FHE.decrypt(isRange1)) dist[1]++;
        // ...
    }
    
    distribution = dist;
    emit DistributionCalculated(dist, block.timestamp);
}
```

**注意**：
- 批量解密操作需要合约 owner 权限
- 前端定期调用 `calculateAverage` 和 `calculateDistribution`（或使用定时任务/自动化脚本）
- 解密操作会暴露加密值，但聚合后的统计数据不会泄露个人信息

---

### 6. 匿名结果展示（Anonymous Results Display）
**路由**：`/statistics`（与聚合计算合并）

**展示内容**：
1. **全局统计**：
   - 参与人数
   - 平均收入
   - 中位数收入（可选）

2. **可视化图表**：
   - 柱状图：收入区间分布
   - 饼图：百分比分布
   - 折线图：历史趋势（如果记录时间序列）

3. **排行榜（匿名）**：
   - 不显示具体地址
   - 仅显示收入区间和匿名标签
   - 按提交时间或随机顺序排列

**隐私保护**：
- ❌ 禁止显示任何地址和个人收入
- ✅ 仅显示聚合数据和分布
- ✅ 最小参与人数限制（如至少5人才显示统计）

---

### 7. 个人信息（My Profile）
**路由**：`/profile`  
**功能**：
- 显示当前连接的钱包地址
- 显示用户是否已提交收入
- 如已提交，解密并显示自己的收入数据

**合约方法**：
- `hasSubmitted(address user) → bool`
- `getUserIncome() → bytes`（返回加密句柄）

**前端解密流程**：
1. 调用 `getUserIncome()` 获取加密句柄
2. 用户签名授权（`fhevm.reencrypt`）
3. 调用 Relayer SDK 解密
4. 显示明文收入区间

**UI 元素**：
- 钱包地址（全地址 + 复制按钮）
- 提交状态：已提交 / 未提交
- 我的收入区间：`5,001 - 8,000 USD/month`（解密后）
- 提交时间：`2025-10-24 14:30:00`
- 操作按钮：
  - "Update Income"（重新提交）
  - "Delete Submission"（可选，需合约支持）

---

## 技术架构

### 智能合约（Solidity）
**文件位置**：`fhevm-hardhat-template/contracts/PrivatePayRank.sol`

**核心功能**：
- 用户提交加密收入（`submitIncome`）
- 查询个人数据（`getUserIncome`）
- 计算聚合统计（`calculateAverage` / `calculateDistribution`）
- 访问控制（`FHE.allow` / `FHE.allowThis`）

**数据结构**：
```solidity
// 用户收入映射
mapping(address => euint32) public userIncomes;

// 提交状态
mapping(address => bool) public hasSubmitted;

// 所有收入数据（用于聚合计算）
euint32[] public allIncomes;

// 聚合结果
uint256 public totalSubmissions;
uint256 public averageIncome;
uint256[6] public distribution; // 6个区间的人数

// 提交时间（可选）
mapping(address => uint256) public submissionTimestamp;
```

**事件**：
```solidity
event IncomeSubmitted(address indexed user, uint256 timestamp);
event AverageCalculated(uint256 averageIncome, uint256 timestamp);
event DistributionCalculated(uint256[6] distribution, uint256 timestamp);
```

---

### 前端（Next.js + TypeScript）
**目录名称**：`privatepayrank-frontend`  
**框架版本**：
- Next.js 14+ (App Router)
- React 18+
- TypeScript 5+
- Tailwind CSS 3+

**关键依赖**：
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "ethers": "^6.0.0",
    "@zama-fhe/relayer-sdk": "latest",
    "wagmi": "^2.0.0",
    "viem": "^2.0.0",
    "recharts": "^2.0.0"
  },
  "devDependencies": {
    "@fhevm/mock-utils": "latest",
    "typescript": "^5.0.0",
    "tailwindcss": "^3.0.0"
  }
}
```

**目录结构**：
```
privatepayrank-frontend/
├── app/
│   ├── layout.tsx          # 全局布局 + Providers
│   ├── page.tsx            # 欢迎页
│   ├── submit/
│   │   └── page.tsx        # 提交收入页
│   ├── statistics/
│   │   └── page.tsx        # 统计页
│   ├── profile/
│   │   └── page.tsx        # 个人页
│   └── globals.css
├── components/
│   ├── Navbar.tsx          # 导航栏
│   ├── WalletButton.tsx    # 钱包按钮
│   ├── IncomeSubmitForm.tsx
│   ├── StatisticsChart.tsx
│   ├── ProfileCard.tsx
│   └── ui/                 # 基础组件
├── hooks/
│   ├── useWallet.tsx       # 钱包管理
│   ├── usePrivatePayRank.tsx  # 合约交互
│   └── useFHEVM.tsx        # FHEVM 实例
├── fhevm/
│   ├── fhevm.ts            # FHEVM 实例管理
│   ├── loader.ts           # Relayer SDK 动态加载
│   └── constants.ts        # 网络配置
├── abi/
│   ├── PrivatePayRankABI.ts
│   └── PrivatePayRankAddresses.ts
├── scripts/
│   ├── genabi.mjs          # 生成 ABI
│   └── check-node.mjs      # 检测 Hardhat 节点
├── design-tokens.ts        # 设计系统
├── package.json
├── tsconfig.json
├── tailwind.config.ts
└── next.config.ts
```

---

## 设计系统（去同质化）

### Seed 计算
```
项目名：PrivatePayRank
网络：sepolia
年月：202510
合约：PrivatePayRank.sol

seed = sha256("PrivatePayRanksepolia202510PrivatePayRank.sol")
```

### 设计选型（根据 seed 确定）
将基于 seed 从以下维度选择：

1. **设计体系**：Material / Fluent / Neumorphism / Glassmorphism / Minimal
2. **主题色谱**：8组配色（A-H）
3. **排版系统**：Serif / Sans-Serif / Monospace
4. **布局模式**：Sidebar / Masonry / Tabs / Grid / Wizard
5. **组件风格**：圆角 + 阴影 + 边框
6. **动效时长**：100ms / 200ms / 300ms

### 响应式设计
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### 无障碍（WCAG AA）
- 对比度：≥ 4.5:1（正常文本）
- 焦点指示：2px solid accent
- 键盘导航：Tab 顺序符合逻辑

---

## 开发流程

### 阶段 1：合约开发
1. ✅ 创建 `PrivatePayRank.sol`
2. ✅ 实现 `submitIncome` 函数
3. ✅ 实现聚合计算函数
4. ✅ 编写单元测试（`test/PrivatePayRank.test.ts`）
5. ✅ 本地部署测试（`npx hardhat node` + `deploy --network localhost`）

### 阶段 2：前端搭建
1. ✅ 创建 `privatepayrank-frontend` 目录
2. ✅ 配置 Next.js + TypeScript + Tailwind
3. ✅ 生成 design-tokens.ts
4. ✅ 创建基础组件（Navbar / WalletButton）
5. ✅ 实现 FHEVM 集成逻辑

### 阶段 3：功能实现
1. ✅ 钱包连接 + 自动重连
2. ✅ 加密提交流程
3. ✅ 统计页面 + 图表
4. ✅ 个人页面 + 解密
5. ✅ 端到端测试

### 阶段 4：测试网部署
1. ✅ 配置 `.env`（Sepolia 私钥 + Infura API）
2. ✅ 部署到 Sepolia（`npx hardhat deploy --network sepolia`）
3. ✅ 更新前端合约地址
4. ✅ 真实 Relayer 测试

---

## 环境配置

### 合约部署（`.env`）
```bash
# fhevm-hardhat-template/.env
SEPOLIA_PRIVATE_KEY=0x...
INFURA_API_KEY=...
# 或
ALCHEMY_API_KEY=...
```

### 前端配置（`.env.local`）
```bash
# privatepayrank-frontend/.env.local
NEXT_PUBLIC_NETWORK=sepolia
NEXT_PUBLIC_CHAIN_ID=11155111
```

---

## 运行命令

### 本地开发
```bash
# 终端 1：启动 Hardhat 节点
cd fhevm-hardhat-template
npx hardhat node

# 终端 2：部署合约
npx hardhat deploy --network localhost

# 终端 3：启动前端（Mock 模式）
cd privatepayrank-frontend
npm run dev:mock
```

### 测试网部署
```bash
# 部署到 Sepolia
cd fhevm-hardhat-template
npx hardhat deploy --network sepolia

# 启动前端（Relayer 模式）
cd privatepayrank-frontend
npm run dev
```

---

## 验收标准（DoD）

### 合约部分
- ✅ `npx hardhat compile` 成功
- ✅ `npx hardhat test` 全部通过（至少5个测试）
- ✅ 本地部署成功
- ✅ 使用 FHEVM 原生 API（euint32 / FHE.add / FHE.allow）

### 前端部分
- ✅ `npm run build` 成功
- ✅ 钱包刷新后自动重连
- ✅ 提交→加密→上链→解密闭环打通
- ✅ 统计图表正常显示
- ✅ UI 全英文，无中文字符

### 功能验收
- ✅ 用户可提交加密收入
- ✅ 统计页显示聚合结果
- ✅ 个人页可解密自己的数据
- ✅ 防止重复提交
- ✅ 不泄露个人隐私

---

## 安全与隐私

### 合约安全
- ✅ 防止重复提交（`hasSubmitted` 检查）
- ✅ 访问控制（只有用户和合约可解密用户数据）
- ✅ Owner 权限管理（仅 owner 可触发聚合计算）

### 前端安全
- ✅ 私钥不存储在本地
- ✅ 签名操作由钱包完成
- ✅ 不信任前端输入（合约验证）

### 隐私保护
- ✅ 个人收入完全加密存储
- ✅ 仅聚合结果公开
- ✅ 无法从聚合数据反推个人信息
- ✅ 用户可控制自己数据的解密

---

## 未来扩展

### 可选功能
- [ ] 按时间统计历史趋势
- [ ] 按职业/地区分类统计
- [ ] 用户可更新/删除自己的提交
- [ ] 激励机制（提交后获得 NFT 或 Token）
- [ ] 社交分享（匿名）

### 性能优化
- [ ] 批量解密优化（减少 gas 成本）
- [ ] 前端缓存统计结果
- [ ] 使用 The Graph 索引链上数据

---

## 参考资料

- [FHEVM 0.8 Reference](../Fhevm0.8_Reference.md)
- [参考前端实现](../frontend/)
- [Zama FHEVM 文档](https://docs.zama.ai/fhevm)
- [EIP-6963: Multi Injected Provider Discovery](https://eips.ethereum.org/EIPS/eip-6963)

---

**文档版本**：v1.0  
**创建日期**：2025-10-24  
**最后更新**：2025-10-24





