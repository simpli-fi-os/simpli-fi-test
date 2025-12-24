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


5. Security Protocols (MANDATORY)

These rules are critical to prevent data leaks and cost overruns. Copy these into your Firebase Console immediately.

A. Firestore Rules (firestore.rules)

Controls who can read/write data.

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // --- USER PROFILES ---
    // Publicly readable for QR scans.
    // Only writable by the owner (the user themselves) or an Admin.
    match /users/{userId} {
      allow read: if true;
      allow write: if request.auth != null && (request.auth.uid == userId || request.auth.token.role == 'admin');
    }

    // --- ORGANIZATIONS ---
    // Read-only for authenticated members.
    // Write-only for System Admins (You/Hunter).
    match /organizations/{orgId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && request.auth.token.role == 'sys_admin';
    }

    // --- RESOURCES (Catalog) ---
    // Publicly readable so the 'Smart Redirect' function can fetch the target URL.
    // Only writable by Organization Admins (e.g., Franchise Owners).
    match /resources/{resourceId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.role == 'admin';
    }

    // --- ANALYTICS EVENTS ---
    // Create-only for public (anonymous scans).
    // Read-only for Admins (Dashboard view).
    // NO delete/update allowed to preserve data integrity.
    match /events/{eventId} {
      allow create: if true;
      allow read: if request.auth != null && request.auth.token.role == 'admin';
      allow update, delete: if false;
    }
  }
}


B. Storage Rules (storage.rules)

Controls file uploads to prevent abuse and cost spikes.

rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    
    // --- ORGANIZATION RESOURCES ---
    // Path: /organizations/{orgId}/resources/{fileName}
    match /organizations/{orgId}/resources/{allPaths=**} {
      // Public Read: Essential for the 'Catalog' to display links/images.
      allow read: if true;
      
      // Restricted Write:
      // 1. Must be authenticated.
      // 2. File size must be under 10MB (Cost Control).
      // 3. File type must be standard doc/image (Security).
      allow write: if request.auth != null 
                   && request.resource.size < 10 * 1024 * 1024 
                   && request.resource.contentType.matches('application/pdf|image/.*|text/.*|application/msword|application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    }
    
    // --- USER AVATARS ---
    // Path: /users/{userId}/avatar.jpg
    match /users/{userId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.uid == userId
                   && request.resource.size < 5 * 1024 * 1024 // 5MB limit for avatars
                   && request.resource.contentType.matches('image/.*');
    }
  }
}


C. Content Security Policy (CSP)

Add this meta tag to the <head> of all HTML files (index.html, card.html, etc.) to prevent script injection attacks.

<meta http-equiv="Content-Security-Policy" content="default-src 'self' [https://cdn.tailwindcss.com](https://cdn.tailwindcss.com) [https://unpkg.com](https://unpkg.com) [https://www.gstatic.com](https://www.gstatic.com) [https://firebasestorage.googleapis.com](https://firebasestorage.googleapis.com) [https://api.qrserver.com](https://api.qrserver.com) [https://api.dicebear.com](https://api.dicebear.com); script-src 'self' 'unsafe-inline' [https://cdn.tailwindcss.com](https://cdn.tailwindcss.com) [https://unpkg.com](https://unpkg.com) [https://www.gstatic.com](https://www.gstatic.com) [https://cdn.jsdelivr.net](https://cdn.jsdelivr.net); style-src 'self' 'unsafe-inline' [https://fonts.googleapis.com](https://fonts.googleapis.com); font-src [https://fonts.gstatic.com](https://fonts.gstatic.com); img-src 'self' data: https:; connect-src 'self' [https://www.googleapis.com](https://www.googleapis.com) [https://firebasestorage.googleapis.com](https://firebasestorage.googleapis.com);">
