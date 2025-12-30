const { ethers } = require('ethers');
const fs = require('fs');

async function checkProviderOnChain() {
    try {
        // Connect to local Hardhat
        const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');

        // Load deployed contract addresses
        const deployed = JSON.parse(fs.readFileSync('./deployments/deployed.json', 'utf8'));

        // IdentityRegistry ABI (just the functions we need)
        const registryAbi = [
            'function isProviderApproved(address provider) view returns (bool)',
            'function approvedProviders(address provider) view returns (bool)'
        ];

        const registry = new ethers.Contract(
            deployed.contracts.IdentityRegistry,
            registryAbi,
            provider
        );

        // Provider addresses from the API response
        const providers = [
            { name: 'City Hospital', address: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' },
            { name: 'Rishabh', address: '0x90F79bf6EB2c4f870365E785982E1f101E93b906' }
        ];

        console.log('\n🔍 Checking Provider Approval Status on Blockchain:\n');
        console.log('IdentityRegistry:', deployed.contracts.IdentityRegistry);
        console.log('---------------------------------------------------\n');

        for (const prov of providers) {
            try {
                const isApproved = await registry.isProviderApproved(prov.address);
                console.log(`Provider: ${prov.name}`);
                console.log(`Address: ${prov.address}`);
                console.log(`On-Chain Status: ${isApproved ? '✅ APPROVED' : '❌ NOT APPROVED'}`);
                console.log('');
            } catch (error) {
                console.log(`Provider: ${prov.name}`);
                console.log(`Address: ${prov.address}`);
                console.log(`Error: ${error.message}`);
                console.log('');
            }
        }

    } catch (error) {
        console.error('Error checking providers:', error.message);
        process.exit(1);
    }
}

checkProviderOnChain();
