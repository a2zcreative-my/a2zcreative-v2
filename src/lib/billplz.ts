// Billplz configuration - Server-side only
// These values are never exposed to the client

const BILLPLZ_SANDBOX = process.env.BILLPLZ_SANDBOX === 'true';

export const billplzConfig = {
    // API endpoints
    baseUrl: BILLPLZ_SANDBOX
        ? 'https://billplz-staging.herokuapp.com/api/v3'
        : 'https://www.billplz.com/api/v3',

    // Credentials (server-side only)
    apiKey: process.env.BILLPLZ_API_KEY!,
    collectionId: process.env.BILLPLZ_COLLECTION_ID!,
    xSignature: process.env.BILLPLZ_X_SIGNATURE!,

    // Mode
    isSandbox: BILLPLZ_SANDBOX,
};

// Validate that required env vars are present
export function validateBillplzConfig(): boolean {
    const required = ['BILLPLZ_API_KEY', 'BILLPLZ_COLLECTION_ID', 'BILLPLZ_X_SIGNATURE'];
    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
        console.error(`Missing Billplz env vars: ${missing.join(', ')}`);
        return false;
    }
    return true;
}
