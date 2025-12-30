# ProjectY - Complete Demo Guide

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Quick Start (Local Development)](#quick-start-local-development)
4. [Production Deployment](#production-deployment)
5. [Demo Script (Step-by-Step)](#demo-script-step-by-step)
6. [End-to-End Testing](#end-to-end-testing)
7. [Troubleshooting](#troubleshooting)

---

## Project Overview

**ProjectY** is a full-stack decentralized insurance platform that demonstrates:
- **Blockchain Integration**: Smart contracts for policy and claim management on Ethereum
- **DID/VC Technology**: Self-sovereign identity using Veramo framework
- **Event-Driven Architecture**: Real-time synchronization between blockchain and database
- **Automated Reconciliation**: Ensures data consistency between on-chain and off-chain state
- **Admin Dashboard**: Manual review interface for critical mismatches

### Key Features

✅ **Policy Management**
- Issue insurance policies with ETH payment
- Automatic on-chain recording
- Tiered coverage system (Basic, Standard, Premium)

✅ **Claim Processing**
- Submit claims with medical reports (stored on IPFS)
- Safe transaction patterns with timeout handling
- Approve/reject workflow with automatic payment

✅ **Data Synchronization**
- Event listener monitors blockchain events
- Automatic database updates from on-chain state
- Prevents duplicate records with unique constraints

✅ **Reconciliation System**
- Periodic comparison of DB vs blockchain state
- Auto-fix for safe mismatches (status updates)
- Manual review for critical changes (amounts, beneficiaries)

✅ **Admin Tools**
- Reconciliation dashboard
- Mismatch detection and resolution
- Complete audit trail

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Interface                           │
│                      (React + Vite Frontend)                     │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 │ HTTP/REST API
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Backend API Server                         │
│                     (Node.js + Express)                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Controllers │  │   Services   │  │  Middleware  │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
└────────┬──────────────────┬─────────────────┬───────────────────┘
         │                  │                 │
         │                  │                 │
         ▼                  ▼                 ▼
┌────────────────┐  ┌──────────────┐  ┌──────────────────┐
│   Database     │  │  Blockchain  │  │  IPFS/Pinata     │
│   (SQLite)     │  │  (Hardhat)   │  │  (File Storage)  │
│                │  │              │  │                  │
│ • Policies     │  │ • Policy SC  │  │ • Medical        │
│ • Claims       │  │ • Claim SC   │  │   Reports        │
│ • Providers    │  │ • Registry   │  │ • KYC Docs       │
│ • Audit Logs   │  │              │  │                  │
└────────────────┘  └──────────────┘  └──────────────────┘
         ▲                  │
         │                  │
         │     ┌────────────┴────────────┐
         │     │                         │
         │     ▼                         ▼
         │  ┌──────────────┐      ┌──────────────┐
         └──│Event Listener│      │  Reconciler  │
            │ (Poll: 5s)   │      │ (Poll: 60s)  │
            └──────────────┘      └──────────────┘
                  │                      │
                  └──────────┬───────────┘
                             │
                     Ensures DB ↔ Chain Parity
```

### Component Responsibilities

**Frontend (React)**
- User interface for policy purchase, claim submission
- Provider onboarding with KYC
- Insurer dashboard for claim approval
- Admin reconciliation dashboard

**Backend API**
- RESTful endpoints for CRUD operations
- Transaction management with safe patterns
- Authentication and authorization (Veramo DIDs)
- File upload handling (Pinata IPFS)

**Smart Contracts**
- `IdentityRegistry`: Provider approval management
- `PolicyContract`: Policy creation and status tracking
- `ClaimContract`: Claim submission and payment

**Event Listener**
- Monitors blockchain events (PolicyIssued, ClaimSubmitted, ClaimPaid, etc.)
- Syncs on-chain state to database
- Runs every 5 seconds by default

**Reconciler**
- Compares database records with blockchain state
- Auto-fixes safe mismatches (e.g., status corrections)
- Creates suggestions for manual review (e.g., amount changes)
- Runs every 60 seconds by default

---

## Quick Start (Local Development)

### Prerequisites

**Required Software:**
- Node.js 18+ LTS
- npm or yarn
- Git
- SQLite (included with Node.js)

**Optional:**
- Docker & Docker Compose (for containerized setup)
- Metamask browser extension (for testing wallet interactions)

### Environment Setup

1. **Clone the repository**
```bash
git clone https://github.com/rishabhrajz/bct5.git
cd bct5
```

2. **Install root dependencies**
```bash
npm install
```

3. **Install backend dependencies**
```bash
cd backend
npm install
cd ..
```

4. **Install frontend dependencies**
```bash
cd frontend
npm install
cd ..
```

5. **Configure environment variables**

Create `backend/.env`:
```bash
# Node Environment
NODE_ENV=development

# Server
PORT=4000

# Database
DATABASE_URL="file:./data/projecty.db"

# Blockchain
BLOCKCHAIN_RPC_URL=http://127.0.0.1:8545
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

# IPFS (Pinata)
PINATA_JWT=your_pinata_jwt_token_here

# Event Listener
EVENT_POLL_INTERVAL_MS=5000

# Reconciler (optional - will use defaults)
RECONCILER_AUTO_FIX=true
RECONCILE_INTERVAL_MS=60000
```

**Get Pinata JWT:**
1. Sign up at https://pinata.cloud/
2. Go to API Keys
3. Create new key with pinning permissions
4. Copy the JWT token

### Running the System (Option 1: Manual)

**Terminal 1: Start Hardhat Node**
```bash
npx hardhat node --hostname 0.0.0.0 --port 8545
```

**Terminal 2: Deploy Contracts**
```bash
# Wait for Hardhat to be ready (shows "Started HTTP and WebSocket JSON-RPC server")
npx hardhat run contracts/scripts/deploy.js --network localhost
```

Expected output:
```
✅ IdentityRegistry deployed to: 0x5FbDB...
✅ PolicyContract deployed to: 0xe7f17...
✅ ClaimContract deployed to: 0x9fE46...
```

**Terminal 3: Setup Database**
```bash
cd backend

# Run migrations
npx prisma migrate deploy

# OR reset database (clears all data)
NODE_ENV=development npx prisma migrate reset --force
```

**Terminal 4: Start Backend**
```bash
cd backend
npm run dev
```

Expected output:
```
✅ Server listening on port 4000
✅ Event listener started (poll interval: 5000ms)
✅ Reconciler started (interval: 60000ms)
```

**Terminal 5: Start Frontend**
```bash
cd frontend
npm run dev
```

Expected output:
```
  ➜  Local:   http://localhost:5173/
```

**Access the Application:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:4000
- Hardhat RPC: http://localhost:8545

### Running the System (Option 2: Docker Compose)

**Start all services:**
```bash
docker-compose up --build
```

This starts:
- Hardhat node on port 8545
- Backend on port 4000
- Frontend on port 3000

**Access the Application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- Hardhat RPC: http://localhost:8545

**Stop services:**
```bash
docker-compose down
```

**Reset everything:**
```bash
docker-compose down -v
```

---

## Production Deployment

### Building Docker Images

**Backend:**
```bash
cd backend
docker build -t projecty-backend:latest .
```

**Frontend:**
```bash
cd frontend
docker build -t projecty-frontend:latest .
```

### Production Environment Variables

Create `backend/.env.production`:
```bash
NODE_ENV=production
PORT=4000
DATABASE_URL="postgresql://user:password@localhost:5432/projecty"
BLOCKCHAIN_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
PRIVATE_KEY=0x...  # NEVER commit this!
PINATA_JWT=your_jwt_token
EVENT_POLL_INTERVAL_MS=10000
RECONCILER_AUTO_FIX=false  # Manual review in production
RECONCILE_INTERVAL_MS=300000  # 5 minutes
```

### Running in Production

**Using docker-compose:**
```bash
# Build and start
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose ps

# View logs
docker-compose logs -f backend
docker-compose logs -f frontend
```

### Health Checks

**System Health:**
```bash
curl http://localhost:4000/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-11-30T12:00:00.000Z",
  "uptime": 3600,
  "eventListener": {
    "isRunning": true,
    "lastProcessedBlock": 150
  },
  "reconciler": {
    "isRunning": false,
    "lastRun": "2025-11-30T11:55:00.000Z",
    "interval": 60000
  }
}
```

**Readiness Check:**
```bash
curl http://localhost:4000/health/readiness
```

Expected response:
```json
{
  "ready": true,
  "checks": {
    "database": true,
    "blockchain": true,
    "eventListener": true,
    "migrations": true
  }
}
```

**Metrics:**
```bash
curl http://localhost:4000/metrics
```

---

## Demo Script (Step-by-Step)

### Preparation

1. **Reset the environment** (for clean demo):
```bash
# Stop everything
lsof -ti:8545 | xargs kill -9
lsof -ti:4000 | xargs kill -9

# Start fresh
npx hardhat node --hostname 0.0.0.0 --port 8545 &
sleep 3
npx hardhat run contracts/scripts/deploy.js --network localhost
cd backend && NODE_ENV=development npx prisma migrate reset --force && npm run dev &
cd ../frontend && npm run dev &
```

2. **Open browser windows:**
- Window 1: Frontend (http://localhost:5173)
- Window 2: Backend logs (terminal)
- Window 3: Blockchain explorer (optional)

### Demo Flow

#### Part 1: Provider Onboarding (2 minutes)

**What to say:**
> "Let me show you how healthcare providers join the platform. The system uses decentralized identity (DID) and verifiable credentials for KYC."

**Steps:**
1. Navigate to "Provider" page (http://localhost:5173/provider)
2. Fill in details:
   - Name: "Dr. Smith's Clinic"
   - Wallet: `0x70997970C51812dc3A010C7d01b50e0d17dc79C8` (Hardhat account #1)
   - Upload license (any file)
3. Click "Submit KYC"

**Expected outcome:**
- ✅ "Provider registered successfully"
- ✅ DID created and stored
- ✅ License file uploaded to IPFS
- ✅ Provider appears in database

**Show in terminal:**
```bash
# In backend terminal, you should see:
✅ DID created for provider
✅ Verifiable credential issued
✅ File uploaded to IPFS: Qm...
```

#### Part 2: Policy Purchase (3 minutes)

**What to say:**
> "Now let's purchase an insurance policy. This creates a transaction on the blockchain and automatically syncs to our database via the event listener."

**Steps:**
1. Navigate to "Issue Policy" page
2. Fill in policy details:
   - Beneficiary Address: `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC` (Hardhat account #2)
   - Coverage Amount: `1` ETH
   - Tier: "Standard" (1)
   - Premium: `0.02` ETH (auto-calculated)
   - Upload KYC document
3. Click "Request Policy"

**Expected outcome:**
- ✅ Transaction submitted to blockchain
- ✅ TX hash shown: `0x...`
- ✅ Policy auto-approved (immediate in demo, approved in production)
- ✅ Event listener picks up PolicyIssued event
- ✅ Policy record created in database with `source: 'onchain'`

**Show in terminal:**
```bash
# Backend logs:
[Event Listener] PolicyIssued event detected
[Event Listener] Policy #1 synced from blockchain
[Event Listener] Status: ACTIVE, Beneficiary: 0x3C44...
```

**Show in database:**
```bash
cd backend
sqlite3 data/projecty.db "SELECT id, status, source, onchainTxHash FROM Policy;"
```

Output:
```
1|ACTIVE|onchain|0x...
```

#### Part 3: Claim Submission (3 minutes)

**What to say:**
> "When a patient needs to file a claim, they submit medical documentation. The system uses IPFS for secure, decentralized storage."

**Steps:**
1. Navigate to "Submit Claim" page
2. Fill in claim details:
   - Policy ID: `1` (from previous step)
   - Patient Address: `0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC`
   - Claim Amount: `0.5` ETH
   - Upload medical report
3. Click "Submit Claim"

**Expected outcome:**
- ✅ Medical report uploaded to IPFS: `Qm...`
- ✅ Blockchain transaction submitted
- ✅ Claim created with status `Submitted`
- ✅ Event listener syncs claim to database

**Show in terminal:**
```bash
# Backend logs:
✅ Medical report uploaded: QmTestMedical...
[TX] Claim submitted to blockchain: 0x...
[Event Listener] ClaimSubmitted event detected
[Event Listener] Claim #1 synced: Status=Submitted
```

#### Part 4: Claim Review & Approval (4 minutes)

**What to say:**
> "Insurance providers review claims in the Insurer Dashboard. The system supports approve/reject with automatic payment on approval."

**Steps:**
1. Navigate to "Insurer Dashboard"
2. Find the claim in "Pending Claims" table
3. Click "Review" button
4. In the review modal:
   - View claim details
   - Download medical report from IPFS link
   - Check coverage vs requested amount
5. Click "Approve & Pay"

**Expected outcome:**
- ✅ Backend validates claim against policy
- ✅ Blockchain transaction: approval + payment
- ✅ Claim status → `Paid`
- ✅ ETH transferred to beneficiary
- ✅ Event listener syncs status update

**Show in terminal:**
```bash
# Backend logs:
[Safe Claim Service] Claim #1 approved
[TX] Payment transaction: 0x...
[TX] Waiting for confirmation...
[TX] ✅ Transaction confirmed in block 15
[Event Listener] ClaimPaid event detected
[Event Listener] Claim #1 status updated: Paid
```

**Verify payment on blockchain:**
```bash
# In Hardhat terminal, you'll see the transaction
eth_sendTransaction
  from: 0xf39Fd...  # Insurer wallet
  to: 0x3C44Cd...    # Beneficiary
  value: 0.5 ETH
```

#### Part 5: Reconciliation Demo (5 minutes)

**What to say:**
> "Our reconciliation system ensures the database always matches blockchain state. Let me demonstrate by creating an intentional mismatch."

**Steps:**

1. **Create a mismatch** (manually tamper with database):
```bash
cd backend
sqlite3 data/projecty.db "UPDATE Policy SET status='PENDING' WHERE id=1;"
```

2. **Show the mismatch**:
```bash
# Check DB
sqlite3 data/projecty.db "SELECT id, status FROM Policy WHERE id=1;"
# Output: 1|PENDING

# Check blockchain
npx hardhat console --network localhost
> const Policy = await ethers.getContractAt("PolicyContract", "0xe7f17...");
> await Policy.policies(1);
# Shows: status: 1 (ACTIVE)
```

3. **Trigger reconciliation**:
```bash
curl -X POST http://localhost:4000/api/reconcile/run
```

4. **Wait 5 seconds**, then check results:
```bash
# Check DB again
sqlite3 data/projecty.db "SELECT id, status FROM Policy WHERE id=1;"
# Output: 1|ACTIVE  (Fixed!)

# Check audit log
sqlite3 data/projecty.db "SELECT action, fieldName, oldValue, newValue FROM ReconciliationAudit ORDER BY timestamp DESC LIMIT 1;"
# Output: auto_fix|status|"PENDING"|"ACTIVE"
```

**Expected outcome:**
- ✅ Reconciler detected mismatch
- ✅ Automatically fixed status (safe change)
- ✅ Audit entry created
- ✅ Database now matches blockchain

**Show reconciler status:**
```bash
curl http://localhost:4000/api/reconcile/status | jq
```

Output:
```json
{
  "isRunning": false,
  "lastRun": "2025-11-30T12:10:00.000Z",
  "stats": {
    "totalReconciled": 1,
    "autoFixed": 1,
    "pendingSuggestions": 0
  }
}
```

#### Part 6: Admin Dashboard (3 minutes)

**What to say:**
> "For critical mismatches like amount changes, the system creates suggestions for manual admin review instead of auto-fixing."

**Steps:**

1. Navigate to "Admin Reconciliation" page (http://localhost:5173/admin/reconcile)

2. **Dashboard Overview** shows:
   - Total Reconciled: 1
   - Auto-Fixed: 1
   - Pending Suggestions: 0
   - Last Run: <timestamp>

3. **Create a critical mismatch** (in terminal):
```bash
# This would normally trigger a suggestion, not auto-fix
sqlite3 data/projecty.db "UPDATE Claim SET claimAmount='900000000000000000' WHERE id=1;"
```

4. **Trigger reconcile**:
```bash
curl -X POST http://localhost:4000/api/reconcile/run
```

5. **Refresh Admin Dashboard**

**Expected outcome:**
- ✅ Mismatch appears in table
- ✅ Severity: "Critical"
- ✅ Suggested Action: "Manual Review Required"
- ✅ Can view details in drawer
- ✅ Can apply fix or ignore

**Show in UI:**
- Click on mismatch row
- Detail drawer opens
- Shows DB value vs chain value side-by-side
- "Apply Fix" button available
- Audit history at bottom

---

## End-to-End Testing

### Running the E2E Test Suite

The project includes comprehensive end-to-end tests that verify the entire system.

**Run tests:**
```bash
# Ensure environment is running
node scripts/test-event-listener.js
node scripts/test-safe-claims.js
```

**Expected output:**
```
🧪 Testing Event Listener Integration

Step 1: Connecting to blockchain...
✅ Connected as: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266

Step 2: Loading deployed contracts...
✅ PolicyContract: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512

Step 3: Submitting policy transaction...
✅ Policy TX mined in block 5

Step 4: Waiting for event listener to update DB...
✅ DB updated! Policy found
✅ Event Listener Integration Test PASSED!
```

### Verifying DB ↔ Chain Parity

**Manual verification:**

```bash
# 1. Count policies in database
sqlite3 backend/data/projecty.db "SELECT COUNT(*) FROM Policy;"

# 2. Count policies on blockchain
npx hardhat console --network localhost
> const Policy = await ethers.getContractAt("PolicyContract", "DEPLOYED_ADDRESS");
> const policyCount = await Policy.policyCount();
> console.log(policyCount.toString());

# Results should match!
```

**Automated parity check:**
```bash
curl http://localhost:4000/api/reconcile/run
curl http://localhost:4000/api/reconcile/status | jq '.stats'
```

If `totalReconciled` > 0 and `pendingSuggestions` = 0, parity is maintained.

---

## Troubleshooting

### Common Issues

#### 1. Hardhat Readiness Check Fails

**Symptom:**
```json
{
  "ready": false,
  "checks": {
    "blockchain": false
  }
}
```

**Causes:**
- Hardhat node not started
- Wrong RPC URL in `.env`
- Blockchain taking time to initialize

**Solutions:**
```bash
# Check if Hardhat is running
curl http://localhost:8545 -X POST -H "Content-Type: application/json" \
  --data '{"jsonrpc":"2.0","method":"eth_blockNumber","params":[],"id":1}'

# Should return: {"jsonrpc":"2.0","id":1,"result":"0x..."}

# Restart Hardhat if needed
lsof -ti:8545 | xargs kill -9
npx hardhat node --hostname 0.0.0.0 --port 8545 &

# Wait 10 seconds, then check readiness again
sleep 10
curl http://localhost:4000/health/readiness
```

#### 2. Docker Port Conflicts

**Symptom:**
```
Error: bind: address already in use
```

**Solution:**
```bash
# Find process using port
lsof -ti:8545  # Hardhat
lsof -ti:4000  # Backend
lsof -ti:3000  # Frontend (docker)
lsof -ti:5173  # Frontend (vite)

# Kill process
kill -9 <PID>

# OR kill all
lsof -ti:8545,4000,3000,5173 | xargs kill -9

# Restart docker-compose
docker-compose down
docker-compose up --build
```

#### 3. Database Migration Issues

**Symptom:**
```
Error: Table 'Policy' does not exist
```

**Solution:**
```bash
cd backend

# Check migration status
npx prisma migrate status

# Apply pending migrations
npx prisma migrate deploy

# OR reset completely (CAUTION: deletes all data)
NODE_ENV=development npx prisma migrate reset --force

# Regenerate Prisma client
npx prisma generate
```

#### 4. Event Listener Not Starting

**Symptom:**
Backend logs don't show "Event listener started"

**Causes:**
- Missing environment variables
- Blockchain not accessible
- Code error in event-listener.js

**Solutions:**
```bash
# Check backend logs for errors
cd backend
npm run dev

# Look for error stack traces

# Verify environment variables
cat .env | grep -E "RPC_URL|POLL_INTERVAL"

# Test blockchain connection
node -e "const ethers = require('ethers'); \
  new ethers.JsonRpcProvider('http://127.0.0.1:8545') \
  .getNetwork().then(n=>console.log('Connected:',n.chainId))"
```

#### 5. Reconciler Not Running

**Symptom:**
```json
{
  "isRunning": false,
  "lastRun": null
}
```

**Causes:**
- Auto-start disabled in production
- Environment variable misconfiguration
- Backend not fully initialized

**Solutions:**
```bash
# Manually trigger reconciler
curl -X POST http://localhost:4000/api/reconcile/run

# Check if it ran
curl http://localhost:4000/api/reconcile/status

# Verify interval is set
echo $RECONCILE_INTERVAL_MS  # Should be > 0

# Check backend logs
# Should see: "Reconciler started with interval: 60000ms"
```

#### 6. Frontend Can't Connect to Backend

**Symptom:**
Frontend shows "Network Error" or "Failed to fetch"

**Solutions:**
```bash
# Check backend is running
curl http://localhost:4000/health

# Check CORS configuration in backend/server.js
# Should allow localhost:5173 (Vite) or localhost:3000 (Docker)

# Restart backend with correct CORS
cd backend
# Edit server.js if needed
npm run dev
```

#### 7. Missing Environment Variables

**Symptom:**
```
Error: PINATA_JWT is not defined
```

**Solution:**
```bash
# Check .env file exists
ls -la backend/.env

# Verify required variables
cat backend/.env | grep -E "PINATA_JWT|PRIVATE_KEY|RPC_URL"

# Copy from example if missing
cp backend/.env.example backend/.env

# Edit with your values
nano backend/.env
```

#### 8. Smart Contract Not Found

**Symptom:**
```
Error: Contract not deployed at address
```

**Solutions:**
```bash
# Redeploy contracts
npx hardhat run contracts/scripts/deploy.js --network localhost

# Verify deployed.json was created
cat deployments/deployed.json

# Check it was copied to frontend
cat frontend/public/deployments/deployed.json

# If missing, copy manually
mkdir -p frontend/public/deployments
cp deployments/deployed.json frontend/public/deployments/
```

---

## Demo Script Summary

### Quick Demo Checklist

- [ ] **Prep**: Reset environment, start all services
- [ ] **Part 1**: Provider onboarding (2 min)
  - Upload KYC, get DID, verify IPFS upload
- [ ] **Part 2**: Policy purchase (3 min)
  - Submit TX, show auto-approval, verify event sync
- [ ] **Part 3**: Claim submission (3 min)
  - Upload medical report, submit claim, verify IPFS
- [ ] **Part 4**: Claim approval (4 min)
  - Review claim, approve & pay, verify payment
- [ ] **Part 5**: Reconciliation (5 min)
  - Create mismatch, trigger reconcile, show auto-fix
- [ ] **Part 6**: Admin dashboard (3 min)
  - Show mismatch table, detail drawer, audit log

**Total Demo Time**: 20 minutes

### Key Points to Emphasize

1. **Decentralization**: Data stored on blockchain + IPFS
2. **Automation**: Event listener & reconciler work continuously
3. **Safety**: Safe TX patterns prevent data loss
4. **Transparency**: Complete audit trail of all changes
5. **Consistency**: Reconciler ensures DB ↔ chain parity

---

## Additional Resources

**Documentation:**
- README.md - Project overview and quick start
- ARCHITECTURE.md - Detailed system design
- DEV_RESET.md - Development environment reset guide

**Test Scripts:**
- `scripts/test-event-listener.js` - Event sync verification
- `scripts/test-safe-claims.js` - Safe transaction patterns

**Smart Contracts:**
- `contracts/IdentityRegistry.sol` - Provider management
- `contracts/PolicyContract.sol` - Policy lifecycle
- `contracts/ClaimContract.sol` - Claim processing

---

**Last Updated**: 2025-11-30  
**Version**: 1.0.0  
**Phases Complete**: A, B, C, D
