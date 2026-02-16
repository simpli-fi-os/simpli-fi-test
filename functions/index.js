/**
 * SIMPLI-FI BACKGROUND TASKS (Cloud Functions)
 * Note: Redirect logic has moved to 'airlock/index.js' (Cloud Run) for performance.
 * This file is ONLY for async triggers (Notion Sync, Email Alerts).
 */
const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { Client } = require('@notionhq/client');

admin.initializeApp();

// Initialize Notion Client securely
// Set keys via: firebase functions:config:set notion.key="..." notion.db_id="..."
const notionKey = functions.config().notion ? functions.config().notion.key : null;
const notionDbId = functions.config().notion ? functions.config().notion.db_id : null;

let notion;
if (notionKey) {
    notion = new Client({ auth: notionKey });
}

exports.syncToNotion = functions.firestore
    .document('users/{userId}')
    .onCreate(async (snap, context) => {
        if (!notion) {
            console.warn("Notion Sync Skipped: No API Key configured.");
            return null;
        }

        const userData = snap.data();
        const userId = context.params.userId;

        console.log(`Syncing User ${userId} to Notion...`);

        if (!userData.full_name) {
            console.warn(`Skipped ${userId}: Missing full_name`);
            return null;
        }

        // Safe Date Parsing
        let startDate = new Date().toISOString();
        if (userData.created_at && typeof userData.created_at.toDate === 'function') {
            startDate = userData.created_at.toDate().toISOString();
        }

        // Normalization
        const tierValue = (userData.tier || "ambassador").toLowerCase();

        try {
            await notion.pages.create({
                parent: { database_id: notionDbId },
                properties: {
                    "Name": { title: [{ text: { content: userData.full_name || "Unknown" } }] },
                    "Email": { email: userData.email || "" },
                    "Phone": { phone_number: userData.phone || "" },
                    "Status": { select: { name: "New Lead" } },
                    "Tier": { select: { name: tierValue } },
                    "Card URL": { url: `https://id.simpli-fi-os.com/${userId}` },
                    "Start Date": { date: { start: startDate } }
                }
            });
            console.log(`✅ Synced ${userId} successfully.`);
            return null;
        } catch (error) {
            console.error("❌ Notion Sync Failed:", error.message);
            // Don't throw error to avoid infinite retry loop on bad data
            return null;
        }
    });