# Simpli-FI OS | Deployment Manual V2.3
Mission: Stop handing out dead links. Start tracking the journey.

1. Ecosystem Architecture

The platform consists of 6 core frontend applications served via Firebase Hosting, supported by a serverless backend.

| File | Role | Audience | URL Path |
| index.html | Landing Page | Public Traffic | / |
| intake_form.html | Onboarding Engine | New Signups | /claim |
| card.html | Digital Identity | End Users (Card View) | /{userId} |
| ops_center.html | Ops Center (God Mode) | Hunter/Founders | /ops |
| admin_dashboard.html | Client Admin | Enterprise Clients | /admin |
| resource_catalog.html | Resource Library | Team Members | /catalog |

2. Database Schema (Firestore)

Structure your Cloud Firestore as follows to support the "Smart Redirect" and "Gamification" logic.

users (Collection)

Stores individual profiles and stats.

{
  "doc_id": "sarah_jenkins_123",
  "full_name": "Sarah Jenkins",
  "tier": "pro", // free, pro, founder
  "role": "member", // admin (Founder/Client Manager) or member
  "org_id": "acme_corp", // Links to Organization
  "stats": {
    "scans": 42,
    "shares": 15
  }
}



organizations (Collection)

Stores enterprise branding and configuration.

{
  "doc_id": "acme_corp",
  "name": "Acme Corp",
  "branding": {
    "primary": "#1e293b",
    "accent": "#fbbf24",
    "logo_url": "..."
  }
}



resources (Collection)

The central library of assets.

{
  "doc_id": "pricing_guide_2025",
  "org_id": "acme_corp",
  "title": "2025 Pricing Guide",
  "type": "pdf", // pdf, link, video
  "url": "[https://firebasestorage.googleapis.com/](https://firebasestorage.googleapis.com/)...", 
  "microsite_enabled": false // For Intelligence Suite upsell
}



events (Collection)

The raw log for analytics (Heatmaps).

{
  "type": "scan", // scan, download, view
  "resource_id": "pricing_guide_2025",
  "referrer_id": "sarah_jenkins_123",
  "timestamp": "2025-10-12T14:30:00Z",
  "meta": {
    "ip": "192.168.1.1",
    "user_agent": "Mozilla/5.0..."
  }
}



3. The "Smart Redirect" Engine (Cloud Functions)

This is the "Airlock" logic. It must be deployed to Firebase Cloud Functions.

Endpoint: https://link.simpli-fi-os.com/r/{resourceId}

Logic Flow:

Intercept Request: Function receives resourceId (path param) and ref (query param = userId).

Log Event: Write a new document to events collection with the timestamp and referrer_id.

Increment Stats: Atomically increment stats.scans on the users/{referrer_id} document.

Fetch Target: Look up resources/{resourceId} to get the actual url.

301 Redirect: Immediately redirect the user to the url.

Sample Code (functions/index.js):

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

exports.smartRedirect = functions.https.onRequest(async (req, res) => {
    const resourceId = req.path.split('/')[1]; // Extract ID
    const referrerId = req.query.ref; // Agent ID

    if (!resourceId) return res.status(400).send('Missing Resource ID');

    try {
        // 1. Fetch Target URL
        const doc = await db.collection('resources').doc(resourceId).get();
        if (!doc.exists) return res.status(404).send('Resource Not Found');
        const targetUrl = doc.data().url;

        // 2. Log Analytics (Fire & Forget - don't await if speed is critical)
        if (referrerId) {
            db.collection('events').add({
                type: 'scan',
                resource_id: resourceId,
                referrer_id: referrerId,
                timestamp: admin.firestore.FieldValue.serverTimestamp(),
                meta: { ip: req.ip, ua: req.get('User-Agent') }
            });
            
            // 3. Gamification Increment
            db.collection('users').doc(referrerId).update({
                "stats.scans": admin.firestore.FieldValue.increment(1)
            });
        }

        // 4. Execute Redirect
        res.redirect(301, targetUrl);

    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});



4. Deployment Instructions

Prerequisites

Node.js & npm installed.

Firebase CLI installed (npm install -g firebase-tools).

Step 1: Initialization

mkdir simpli-fi-os
cd simpli-fi-os
firebase login
firebase init
# Select: Firestore, Functions, Hosting, Storage



Step 2: Enable Storage

Go to Firebase Console -> Storage.

Click Get Started.

Start in Production Mode.

Set location (e.g., us-central1).

Step 3: Configuration (firebase.json)

Configure rewrite rules to handle the clean URLs.

{
  "hosting": {
    "public": "public",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "/r/**",
        "function": "smartRedirect" 
      },
      {
        "source": "/ops",
        "destination": "/ops_center.html"
      },
      {
        "source": "/admin",
        "destination": "/admin_dashboard.html"
      },
      {
        "source": "/claim",
        "destination": "/intake_form.html"
      },
      {
        "source": "/catalog",
        "destination": "/resource_catalog.html"
      },
      {
        "source": "/**", 
        "destination": "/card.html" 
      }
    ]
  }
}



Note: The wildcard /** rewrite sends all unknown traffic (like simpli-fi.com/hunter_lott) to card.html, which then reads the URL to render the correct profile.

Step 4: Go Live

firebase deploy



5. Security Rules

firestore.rules (Database)

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Public Profiles (Read-only)
    match /users/{userId} {
      allow read: if true;
      allow write: if false; // Only via Admin SDK or Cloud Functions
    }

    // Enterprise Resources (Read-only public for redirect)
    match /resources/{resourceId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }

    // Analytics (Write-only for public, Read for Admins)
    match /events/{eventId} {
      allow create: if true; // The Airlock creates these
      allow read: if request.auth != null; 
    }
  }
}



storage.rules (File Uploads - Cost Controlled)

rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Only allow uploads to your own organization's folder
    match /organizations/{orgId}/resources/{allPaths=**} {
      allow read: if true; // Public can download
      allow write: if request.auth != null 
                   && request.resource.size < 10 * 1024 * 1024 // 10MB Max File Size
                   && request.resource.contentType.matches('application/pdf|image/.*|text/.*'); // Restrict types
    }
  }
}


