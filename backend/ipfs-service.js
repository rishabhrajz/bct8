/**
 * IPFS Service Loader
 * Dynamically loads either the real Pinata IPFS service or the mock service
 * based on the USE_MOCK_IPFS environment variable
 */

const USE_MOCK_IPFS = process.env.USE_MOCK_IPFS === 'true' || !process.env.PINATA_JWT || process.env.PINATA_JWT === 'your_pinata_jwt_here';

let ipfsService;

if (USE_MOCK_IPFS) {
    console.log('🔧 Using Mock IPFS service (for development)');
    ipfsService = await import('./ipfs-mock.js');
} else {
    console.log('🌐 Using Pinata IPFS service (production)');
    ipfsService = await import('./ipfs-pinata.js');
}

export const { pinFile, pinJSON, fetchFromIPFS } = ipfsService;
