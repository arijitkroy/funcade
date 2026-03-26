# Funcade: Real-Time Multiplayer Web Arcade

**Funcade** is a high-performance, real-time multiplayer arcade built with Next.js, React, Tailwind CSS, and Firebase. The platform currently hosts three premium, fully synchronized games: **UNO No Mercy**, **Tic-Tac-Toe Advanced**, and **Cyber Checkers**. The application features an ultra-responsive user interface, robust turn management, and deep Firestore synchronization for a seamless competitive experience across the globe.

## Hosted Games

### UNO No Mercy
- **Comprehensive Deck:** A complete 168-card deck including specialized "Discard All", "Skip Everyone", and "Wild Color Roulette" cards.
- **Mercy and Stacking Rules:** Implements advanced mechanics such as stacking draw penalties and automatic elimination for players reaching the 25-card mercy threshold.
- **Turn Inactivity Mechanism:** Features a 15-second turn timer with automated server-side skipping for inactive players to maintain game momentum.
- **Match Resumption Flow:** Utilizes session persistence, allowing players to instantly resume interrupted matches or return to their lobby after a page refresh.

### Tic-Tac-Toe Advanced
- **Dynamic Board Scaling:** Create custom matches with adaptable board sizes (e.g., 3x3 to 5x5) and adjustable win conditions (e.g., connect 4 to win).
- **Cinematic Start Sequences:** Features a synchronized, 3D CSS slot-machine-style dice roll overlay powered by cryptographic RNG to randomly determine the starting player.
- **Visual Strikethroughs:** Victory states instantly calculate winning matrix coordinates and render a blazing-hot SVG line across the winning sequence.
- **Infinite Rematches & Score Tracking:** Persistent `[X] VS [Y]` scoring is tallied in real-time across consecutive rematches without disbanding the lobby.

### Cyber Checkers
- **Dynamic Network Layouts:** Configure the board shape before the match begins. Options include the Classic Star (121 cells), Compact Star, Hexagon Duel, Diamond Clash, and Neon Corridor.
- **Advanced Pathfinding Engine:** A high-performance DFS/BFS recursive logic engine written in standard JS evaluates complex jump-chaining paths dynamically per turn.
- **Axial Coordinate Grid Mapping:** Pure mathematical rendering maps `(q, r, s)` axial coordinates seamlessly to a responsive HTML/CSS isometric view.
- **Auto-Mirror Perspective:** Fully automated 180-degree board rotation styling ensures that both Player 1 and Player 2 view their own starting pieces positioned safely at the bottom of the HUD.

## Platform Features

- **Real-Time Synchronization:** Deep state synchronization using ISO timestamps, connection handshakes, and Firebase listeners to ensure all participants view the exact same state concurrently.
- **Fault-Tolerant Transactions:** Secure server-side API routes manage critical logic—including room creation, RNG, matrix validation, and scoring—through atomic Firestore database transactions.
- **Global Points and Leaderboards:** Google-authenticated accounts accrue points across the platform, tracked via a global real-time leaderboard.
- **PWA Capabilities:** Fully installable as a Progressive Web App on mobile and desktop platforms with offline asset caching.
- **Premium Interface Design:** A modern glassmorphic aesthetic utilizing neon accents, custom SVG overlays, dynamic route loading, and structured match connection sequences.

## Technology Stack

- **Frontend:** Next.js 15 (Pages and App Router), Tailwind CSS v4, React Icons.
- **Backend and Database:** Firebase Firestore for real-time state management and transactional updates.
- **Authentication:** Firebase Authentication with support for Google and Anonymous providers.
- **Infrastructure:** Node.js API Routes utilizing the Firebase Admin SDK.

## Setup and Installation

### 1. Prerequisites
- Node.js (v20 or higher recommended)
- Firebase Project with Firestore and Google Authentication enabled.

### 2. Environment Variables
Configure a `.env.local` file in the root directory. The application handles client-side and server-side configurations.

```env
# Client-Side Configuration
FIREBASE_API_KEY=your_api_key
FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
FIREBASE_MESSAGING_SENDER_ID=your_sender_id
FIREBASE_APP_ID=your_app_id

# Server-Side Configuration (Admin SDK)
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### 3. Firestore Rules
Deploy the following security rules to facilitate user profile management and room coordination:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Platform-wide scalable rooms configuration
    match /rooms/{roomId} { allow read, write: if request.auth != null; }
    match /games/{roomId} { allow read, write: if request.auth != null; }
    match /users/{userId} {
      allow write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null;
    }
  }
}
```

### 4. Local Development
Execute the following commands to install dependencies and initiate the development server:
```bash
npm install
npm run dev
```

## Architecture and Execution Flow
- **State Management:** The application minimizes local state, utilizing the Firestore `rooms` and `games` collections as the single source of truth for all multiplayer interactions.
- **Processing Locks:** A client-side `isProcessing` flag prevents duplicate actions while atomic backend logic resolves transaction race conditions natively.
- **Security Protocols:** All point distribution, dice roll randomization, and game matrix validation logic execute server-side within the `/api/*` endpoints to ensure system integrity.

## License
MIT