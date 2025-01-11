import bs58 from 'bs58';
import * as dotenv from 'dotenv';

dotenv.config();

function verifyPrivateKey(key: string) {
    try {
        // Try to decode the base58 string
        const decoded = bs58.decode(key);
        console.log('Private key is valid base58');
        console.log('Decoded length:', decoded.length);
        return true;
    } catch (error: any) {
        console.error('Invalid private key format:', error.message);
        return false;
    }
}

// Verify the private key from .env
const privateKey = process.env.SOLANA_PRIVATE_KEY;
if (!privateKey) {
    console.error('No private key found in .env');
} else {
    console.log('Private key length:', privateKey.length);
    verifyPrivateKey(privateKey);
} 