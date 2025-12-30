const { ethers } = require('ethers');
const fs = require('fs');

async function checkClaimStatus() {
    try {
        const provider = new ethers.JsonRpcProvider('http://127.0.0.1:8545');
        const deployed = JSON.parse(fs.readFileSync('./deployments/deployed.json', 'utf8'));

        const claimAbi = [
            'function claims(uint256) view returns (uint256 id, uint256 policyId, address patient, address provider, address providerWallet, uint256 amount, string medicalReportCid, string patientDid, string providerVcCid, uint8 status, uint256 payoutAmount, string rejectionReason)'
        ];

        const claimContract = new ethers.Contract(
            deployed.contracts.ClaimContract,
            claimAbi,
            provider
        );

        console.log('\n🔍 Checking Claim #1 Status:\n');
        console.log('ClaimContract:', deployed.contracts.ClaimContract);
        console.log('---------------------------------------------------\n');

        const claim = await claimContract.claims(1);

        const statusNames = ['Pending', 'UnderReview', 'Approved', 'Rejected', 'Paid'];

        console.log('Claim ID:', claim.id.toString());
        console.log('Policy ID:', claim.policyId.toString());
        console.log('Patient:', claim.patient);
        console.log('Provider:', claim.provider);
        console.log('Amount:', ethers.formatEther(claim.amount), 'ETH');
        console.log('Status (enum):', claim.status);
        console.log('Status (name):', statusNames[claim.status] || 'Unknown');
        console.log('Payout Amount:', ethers.formatEther(claim.payoutAmount), 'ETH');
        console.log('\n');

    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

checkClaimStatus();
