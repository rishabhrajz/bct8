import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function syncPaidClaim() {
    try {
        console.log('Syncing claim #1 to Paid status...');

        const updated = await prisma.claim.update({
            where: { id: 1 },
            data: {
                status: 'Paid',
                payoutAmount: '500000000000000000', // 0.5 ETH in wei
                payoutTxHash: '0xa58a79af4e2fa9667755c69a911fa0a404d127c39ae47308696273bce6b4f01d',
                paidAt: new Date('2025-12-01T11:53:54.851Z'),
                onchainBlockNumber: 12
            }
        });

        console.log('✅ Claim synced to Paid status!');
        console.log('Status:', updated.status);
        console.log('Payout Amount:', parseInt(updated.payoutAmount) / 1e18, 'ETH');
        console.log('Paid At:', updated.paidAt);
        console.log('TX Hash:', updated.payoutTxHash);

        await prisma.$disconnect();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

syncPaidClaim();
