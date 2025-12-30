const { ethers } = require('ethers');

async function checkBalances() {
    try {
        const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');

        const addresses = {
            'Patient': '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC',
            'Provider (City Hospital)': '0x70997970C51812dc3A010C7d01b50e0d17dc79c8',
            'Provider Wallet': '0x90F79bf6EB2c4f870365E785982E1f101E93b906',
            'Insurer (Backend)': '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266'
        };

        console.log('\n💰 Account Balances After Claim Payment:\n');
        console.log('---------------------------------------------------\n');

        for (const [name, address] of Object.entries(addresses)) {
            const balance = await provider.getBalance(address);
            console.log(`${name}:`);
            console.log(`  Address: ${address}`);
            console.log(`  Balance: ${ethers.formatEther(balance)} ETH\n`);
        }

    } catch (error) {
        console.error('Error:', error.message);
    }
}

checkBalances();
