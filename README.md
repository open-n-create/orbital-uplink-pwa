# Orbital Uplink PWA – High-Fidelity Satellite Service Portal

Client-only Progressive Web App simulating a commercial satellite uplink service.

## Features
- No backend / no authentication required
- DeviceOrientation-based antenna alignment engine (gyroscope / compass)
- Offline satellite IP registry (Starlink CGNAT + public gateway blocks)
- Installable PWA optimized for iOS Safari
- Pre-set demo user: Brandon · GEO Priority plan

## Flow
1. Open the app → dashboard shows active **GEO Priority** plan for Brandon.
2. Tap **Launch Alignment Console**.
3. Enable device sensors and physically orient the phone to match a hardcoded geostationary target vector.
4. On lock, a random authentic-looking satellite IP configuration is delivered from the local offline registry.

## File Structure
```
satellite-uplink-pwa/
├── index.html              # Dashboard
├── success.html            # Alignment console + IP delivery
├── js/
│   ├── alignment.js        # DeviceOrientation engine
│   └── satellite-ips.js    # Local IP registry
├── css/styles.css
├── manifest.json
├── service-worker.js
└── README.md
```

## Deploy
Push to GitHub and import into Vercel, or serve the folder over HTTPS.

## Important Notes
- This is a **simulation / educational demo**. No actual satellite connection is established.
- DeviceOrientation requires HTTPS (or localhost) and user permission on iOS.
- All IP data is static and local.
- Firebase and Stripe have been removed.

## License
MIT – for demonstration purposes only.
