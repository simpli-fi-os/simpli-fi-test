/**
 * SIMPLI-FI "AIRLOCK" SERVICE v2.0
 * Runtime: Node.js 18+
 * Host: Google Cloud Run
 * Goal: <100ms Redirect Latency
 *
 * CORE DIRECTIVE:
 * 1. Accept Request (GET /:shortId)
 * 2. Log Data (Fire and Forget)
 * 3. Redirect User (<100ms)
 */

const express = require('express');
const { Firestore } = require('@google-cloud/firestore');

const app = express();
const firestore = new Firestore();

// Cache hot links in memory for ultra-fast redirection
const memoryCache = new Map();

// Configuration
const PORT = process.env.PORT || 8080;
const BASE_URL = process.env.BASE_URL || 'https://id.simpli-fi-os.com';

app.get('/:shortId', async (req, res) => {
    const start = Date.now();
    const shortId = req.params.shortId;
    const userAgent = req.get('user-agent') || 'unknown';
    const ip = req.ip;
    const referer = req.get('referer') || 'direct';

    try {
        // 1. RESOLVE DESTINATION (Fastest Path)
        let destinationUrl = `${BASE_URL}/404`;
        let ownerId = 'unknown';

        // Check Memory Cache first
        if (memoryCache.has(shortId)) {
            const cached = memoryCache.get(shortId);
            destinationUrl = cached.url;
            ownerId = cached.owner;
        } else {
            // Fetch from Firestore (optimized "public_cards" collection)
            const doc = await firestore.collection('public_cards').doc(shortId).get();

            if (doc.exists) {
                const data = doc.data();
                destinationUrl = data.destination_url || `${BASE_URL}/${shortId}`;
                ownerId = data.owner_id;

                // Cache it for 5 minutes to reduce DB reads
                memoryCache.set(shortId, { url: destinationUrl, owner: ownerId });
                setTimeout(() => memoryCache.delete(shortId), 300000);
            } else {
                // If not found in public_cards, assume it's a User Profile ID
                destinationUrl = `${BASE_URL}/${shortId}`;
                ownerId = shortId;
            }
        }

        // 2. EXECUTE REDIRECT (The 100ms Mandate)
        res.set('X-Airlock-Latency', `${Date.now() - start}ms`);
        res.redirect(302, destinationUrl);

        // 3. ASYNC LOGGING (Fire and Forget — do NOT await)
        logInteraction(shortId, ownerId, userAgent, ip, referer);

    } catch (error) {
        console.error('[Airlock] Critical Error:', error);
        res.redirect(302, BASE_URL);
    }
});

/**
 * Logs the interaction to Firestore without blocking the response.
 */
async function logInteraction(shortId, ownerId, userAgent, ip, referer) {
    try {
        const timestamp = new Date();

        await firestore.collection('events').add({
            type: 'scan',
            resource_id: shortId,
            owner_id: ownerId,
            timestamp: timestamp,
            visitor_data: {
                ip: ip,       // Note: PII considerations for GDPR later
                user_agent: userAgent,
                referer: referer
            }
        });

        // Increment scan counter on the user doc
        if (ownerId && ownerId !== 'unknown') {
            const userRef = firestore.collection('users').doc(ownerId);
            await userRef.update({
                scan_count: Firestore.FieldValue.increment(1),
                last_active: timestamp
            });
        }
    } catch (e) {
        console.warn('[Airlock] Logging failed (Non-critical):', e.message);
    }
}

// Health Check for Cloud Run
app.get('/health', (req, res) => {
    res.status(200).send('Airlock Systems Operational');
});

app.listen(PORT, () => {
    console.log(`[Airlock] Service listening on port ${PORT}`);
});
