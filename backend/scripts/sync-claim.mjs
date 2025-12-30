import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function syncClaimStatus() {
    try {
        console.log('Syncing claim #1 status to UnderReview...');

        const updated = await prisma.claim.update({
            where: { id: 1 },
            data: {
                status: 'UnderReview',
                reviewedAt: new Date()
            }
        });

        console.log('✅ Claim status updated!');
        console.log('Status:', updated.status);
        console.log('Reviewed at:', updated.reviewedAt);

        await prisma.$disconnect();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

syncClaimStatus();
