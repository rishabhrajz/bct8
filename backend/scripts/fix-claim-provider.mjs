import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixClaimProviderData() {
    try {
        console.log('Fixing claim #1 provider data...');

        // Get provider from policy
        const claim = await prisma.claim.findUnique({
            where: { id: 1 },
            include: {
                policy: {
                    include: {
                        provider: true
                    }
                }
            }
        });

        if (!claim) {
            throw new Error('Claim not found');
        }

        const provider = claim.policy.provider;

        console.log('Provider found:', provider.name);
        console.log('Provider address:', provider.providerAddress);

        const updated = await prisma.claim.update({
            where: { id: 1 },
            data: {
                providerAddress: provider.providerAddress,
                providerWallet: provider.providerAddress, // Same as address for demo
                status: 'UnderReview'
            }
        });

        console.log('✅ Claim updated successfully!');
        console.log('Provider Address:', updated.providerAddress);
        console.log('Provider Wallet:', updated.providerWallet);
        console.log('Status:', updated.status);

        await prisma.$disconnect();
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

fixClaimProviderData();
