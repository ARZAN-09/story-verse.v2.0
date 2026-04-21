# StoryVerse - Webnovel & Manhwa Platform

A scalable platform for multi-format storytelling including webnovels, manhwa, characters, and media. Features a secure admin management portal powered by Firebase. The UI features a clean, responsive, and beautifully themed warm "manuscript" layout.

## Features
- **Webnovel & Manhwa Support**: Native text reader and vertical scroll manhwa viewer.
- **Character 3D Integration**: Profile pages supporting SketchFab iframe embeds.
- **Responsive Architecture**: Fully adapted UI for mobile viewing, tablet, and PC.
- **Admin Dashboard**: Effortlessly create, view, and update novels, chapters, comics, and media content.

## Prerequisites
- Node.js (v18+)
- A Firebase instance with Firestore + Auth configured.

## Local Testing & Development
To run this application locally on your machine for editing and testing:
1. Clone this repository or extract the project folder.
2. Open a terminal in the root directory of the application.
3. Run `npm install` to install dependencies.
4. If you have updated Firebase variables, verify the `firebase-applet-config.json` is attached correctly or replace it with your Firebase config code.
5. Run `npm run dev` to start the local VITE development server.
6. Local site will be hosted up at `http://localhost:3000`.

## 🚀 Pushing to GitHub

To store your code and track versions, push the project to a GitHub repository:

1. **Initialize Git local repository** (Skip if already initialized):
   Open your terminal in the project root and run:
   ```bash
   git init
   git add .
   git commit -m "Initial commit for StoryVerse"
   ```

2. **Create a new repository on GitHub**:
   - Go to [GitHub.com](https://github.com/) and create a new, empty repository (do not initialize with a README or .gitignore, as you already have them).

3. **Link and push your code**:
   Copy the repository URL (e.g., `https://github.com/yourusername/storyverse.git`) and run the following in your terminal:
   ```bash
   git branch -M main
   git remote add origin https://github.com/yourusername/storyverse.git
   git push -u origin main
   ```

## 🌐 Production Hosting (Vercel)

Vercel is the recommended hosting platform for Vite/React applications. There are two ways to deploy:

### Method 1: Connecting via GitHub (Recommended)
This approach sets up Continuous Integration (CI), meaning your site will automatically update whenever you `git push` to GitHub.

1. Go to [Vercel.com](https://vercel.com/) and log in with your GitHub account.
2. Click **Add New... > Project**.
3. Locate your newly pushed `storyverse` repository and click **Import**.
4. **Configure Project**:
   - **Framework Preset**: Vercel should auto-detect **Vite**.
   - **Root Directory**: Leave as `./`
5. Click **Deploy**. Vercel will build your application and provide a live sharing URL within minutes!

### Method 2: Deploying via Vercel CLI (Terminal)
If you prefer deploying directly from your terminal without using GitHub:

1. Install the Vercel CLI globally:
   ```bash
   npm install -g vercel
   ```
2. Log in to Vercel via CLI:
   ```bash
   vercel login
   ```
3. Deploy the project:
   ```bash
   vercel
   ```
   *(Follow the terminal prompts. Accept the default settings, and make sure it detects `Vite`.)*
4. Deploy to Production (once you're happy with the preview):
   ```bash
   vercel --prod
   ```
