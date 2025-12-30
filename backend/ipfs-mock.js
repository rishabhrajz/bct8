import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Mock IPFS storage directory
const MOCK_IPFS_DIR = path.join(__dirname, 'mock-ipfs-storage');

/**
 * Initialize mock IPFS storage directory
 */
async function initMockStorage() {
    try {
        await fs.mkdir(MOCK_IPFS_DIR, { recursive: true });
        console.log(`✅ Mock IPFS storage initialized at: ${MOCK_IPFS_DIR}`);
    } catch (error) {
        console.error('Error initializing mock IPFS storage:', error);
    }
}

/**
 * Generate a mock CID (Content Identifier)
 * @param {Buffer|string} content - The content to generate CID for
 * @returns {string} - Mock CID
 */
function generateMockCID(content) {
    const hash = crypto.createHash('sha256').update(content).digest('hex');
    // Format similar to IPFS CIDv1
    return `bafybei${hash.substring(0, 52)}`;
}

/**
 * Pin a file to mock IPFS
 * @param {Buffer} fileBuffer - The file buffer
 * @param {string} filename - The filename
 * @returns {Promise<{cid: string, gatewayUrl: string}>}
 */
export async function pinFile(fileBuffer, filename) {
    try {
        // Generate mock CID
        const cid = generateMockCID(fileBuffer);
        
        // Store file locally
        const filePath = path.join(MOCK_IPFS_DIR, cid);
        await fs.writeFile(filePath, fileBuffer);
        
        // Store metadata
        const metadataPath = path.join(MOCK_IPFS_DIR, `${cid}.meta.json`);
        await fs.writeFile(metadataPath, JSON.stringify({
            filename,
            uploadedBy: 'projecty-backend',
            timestamp: new Date().toISOString(),
            size: fileBuffer.length
        }, null, 2));
        
        const gatewayUrl = `http://localhost:4000/ipfs/${cid}`;
        
        console.log(`✅ [MOCK] File pinned to IPFS: ${cid} (${filename})`);
        
        return { cid, gatewayUrl };
    } catch (error) {
        console.error('Error pinning file to mock IPFS:', error);
        throw error;
    }
}

/**
 * Pin JSON object to mock IPFS
 * @param {object} jsonObject - The JSON object to pin
 * @returns {Promise<{cid: string, gatewayUrl: string}>}
 */
export async function pinJSON(jsonObject) {
    try {
        const jsonString = JSON.stringify(jsonObject, null, 2);
        const cid = generateMockCID(jsonString);
        
        // Store JSON file locally
        const filePath = path.join(MOCK_IPFS_DIR, `${cid}.json`);
        await fs.writeFile(filePath, jsonString);
        
        const gatewayUrl = `http://localhost:4000/ipfs/${cid}`;
        
        console.log(`✅ [MOCK] JSON pinned to IPFS: ${cid}`);
        
        return { cid, gatewayUrl };
    } catch (error) {
        console.error('Error pinning JSON to mock IPFS:', error);
        throw error;
    }
}

/**
 * Fetch content from mock IPFS
 * @param {string} cid - The IPFS CID
 * @returns {Promise<any>}
 */
export async function fetchFromIPFS(cid) {
    try {
        // Try JSON first
        const jsonPath = path.join(MOCK_IPFS_DIR, `${cid}.json`);
        try {
            const content = await fs.readFile(jsonPath, 'utf-8');
            return JSON.parse(content);
        } catch {
            // Not a JSON file, try regular file
            const filePath = path.join(MOCK_IPFS_DIR, cid);
            const content = await fs.readFile(filePath);
            return content;
        }
    } catch (error) {
        console.error('Error fetching from mock IPFS:', error.message);
        throw error;
    }
}

/**
 * Get file from mock IPFS storage (for serving via HTTP)
 * @param {string} cid - The IPFS CID
 * @returns {Promise<{buffer: Buffer, metadata: object}>}
 */
export async function getFile(cid) {
    try {
        // Try JSON first
        const jsonPath = path.join(MOCK_IPFS_DIR, `${cid}.json`);
        try {
            const buffer = await fs.readFile(jsonPath);
            const metaPath = path.join(MOCK_IPFS_DIR, `${cid}.meta.json`);
            let metadata = {};
            try {
                metadata = JSON.parse(await fs.readFile(metaPath, 'utf-8'));
            } catch {}
            return { buffer, metadata };
        } catch {
            // Not a JSON file, try regular file
            const filePath = path.join(MOCK_IPFS_DIR, cid);
            const buffer = await fs.readFile(filePath);
            
            const metaPath = path.join(MOCK_IPFS_DIR, `${cid}.meta.json`);
            let metadata = {};
            try {
                metadata = JSON.parse(await fs.readFile(metaPath, 'utf-8'));
            } catch {}
            
            return { buffer, metadata };
        }
    } catch (error) {
        throw new Error(`File not found: ${cid}`);
    }
}

// Initialize storage on module load
await initMockStorage();

console.log('✅ Mock IPFS service initialized (for development)');
