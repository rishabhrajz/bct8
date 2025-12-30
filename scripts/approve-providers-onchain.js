const { ethers } = require('ethers');
const fs = require('fs');

async function approveProvidersOnChain() {
    try {
        // Connect to Hardhat with backend signer
        const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
        const privateKey = '0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80'; // Hardhat account #0
        const signer = new ethers.Wallet(privateKey, provider);

        // Load contracts
        const deployed = JSON.parse(fs.readFileSync('./deployments/deployed.json', 'utf8'));

        const registryAbi = [
            'function approveProvider(address provider) external',
            'function isProviderApproved(address provider) view returns (bool)'
        ];

        const registry = new ethers.Contract(
            deployed.contracts.IdentityRegistry,
            registryAbi,
            signer
        );

        const providers = [
            { name: 'City Hospital', address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' },
            { name: 'Rishabh', address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906' }
        ];

        console.log('\n🔐 Approving Providers On-Chain:\n');
        console.log('IdentityRegistry:', deployed.contracts.IdentityRegistry);
        console.log('Approver (Insurer):', signer.address);
        console.log('---------------------------------------------------\n');

        for (const prov of providers) {
            console.log(`Provider: ${prov.name} (${prov.address})`);

            // Check current status
            const isApprovedBefore = await registry.isProviderApproved(prov.address);
            console.log(`  Before: ${isApprovedBefore ? '✅ Approved' : '❌ Not Approved'}`);

            if (!isApprovedBefore) {
                // Approve on-chain
                console.log(`  Approving on blockchain...`);
                const tx = await registry.approveProvider(prov.address);
                console.log(`  TX Hash: ${tx.hash}`);

                const receipt = await tx.wait();
                console.log(`  ✅ Confirmed in block ${receipt.blockNumber}`);

                // Verify
                const isApprovedAfter = await registry.isProviderApproved(prov.address);
                console.log(`  After: ${isApprovedAfter ? '✅ Approved' : '❌ Not Approved'}`);
            } else {
                console.log(`  Already approved!`);
            }

            console.log('');
        }

        console.log('✅ All providers approved on-chain!\n');

    } catch (error) {
        console.error('❌ Error:', error.message);
        process.exit(1);
    }
}

approveProvidersOnChain();
