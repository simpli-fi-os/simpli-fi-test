/**
 * SIMPLI-FI AIRLOCK v2.0
 * Goal: <100ms Redirect Latency
 */
const express = require('express');
const { Firestore } = require('@google-cloud/firestore');
const app = express();

// Warm Start Optimization: Init DB outside handler
const firestore = new Firestore();
const publicCards = firestore.collection('public_cards');

app.get('/:id', async (req, res) => {
    const start = Date.now();
    const id = req.params.id;

    try {
        // 1. FAST LOOKUP
        // TODO (Post-$5k MRR): Replace with Redis cache
        const doc = await publicCards.doc(id).get();

        if (!doc.exists) {
            return res.status(404).send('Card not found');
        }

        const data = doc.data();
        const dest = data.redirect_url || `https://id.simpli-fi-os.com/card/${id}`;

        // 2. ASYNC LOGGING (Fire & Forget)
        // We do not await this. Latency is king.
        logScan(id, req);

        // 3. THE REDIRECT
        res.set('X-Airlock-Latency', `${Date.now() - start}ms`);
        res.redirect(302, dest);

    } catch (e) {
        console.error(e);
        res.redirect('https://simpli-fi-os.com/error');
    }
});

function logScan(id, req) {
    // Pushes to Pub/Sub or Firestore async
    firestore.collection('events').add({
        type: 'scan',
        card_id: id,
        ip: req.ip, // Needs hashing for GDPR
        ua: req.get('User-Agent'),
        ts: Firestore.FieldValue.serverTimestamp()
    }).catch(console.error);
}

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Airlock active on port ${PORT}`));