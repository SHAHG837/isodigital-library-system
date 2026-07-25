# Hostinger Node.js Deployment Guide

This repository contains the complete production build and source files for your application.

---

## 📁 Package Overview

1. **`production_build.zip`** (2.5 MB)
   Contains pre-compiled frontend static bundle assets and the bundled `dist/server.cjs` backend entry point ready for immediate deployment on Hostinger Node.js Web App / VPS.

2. **`project_source_code.zip`** (1.8 MB)
   Contains the complete React + TypeScript + Express source code for future development or manual builds.

---

## 🚀 Steps to Deploy on Hostinger (Node.js Web Application Manager)

1. **Upload Files to Hostinger**:
   - Log in to your **Hostinger hPanel**.
   - Navigate to **Websites** -> **Manage** -> **File Manager** (or Node.js App Manager).
   - Go to your domain root folder (e.g. `public_html` or application directory).
   - Upload `production_build.zip` and extract its contents into the root directory.

2. **Configure Node.js Settings on hPanel**:
   - Go to **Node.js Selector / Application Setup** in hPanel.
   - Set **Node.js Version**: `18.x` or `20.x` (or latest available).
   - Set **Application Root**: `/` (or directory where `dist` and `package.json` are placed).
   - Set **Application Startup File**: `dist/server.cjs`
   - Set **Environment**: `production`

3. **Install Dependencies**:
   - In Hostinger hPanel Node.js section, click **Run npm install** or run `npm install --production` via SSH terminal.

4. **Environment Variables**:
   - Set `PORT` (usually auto-configured by Hostinger, or set to `3000`/`8080`).
   - If using Gemini API features, add `GEMINI_API_KEY` under environment variables.

5. **Start Application**:
   - Click **Restart Application** or **Start Node.js App** in Hostinger hPanel.

---

## 💡 Exporting via AI Studio Settings Menu

You can also download the full project `.zip` at any time directly from the AI Studio interface:
- Click **Settings** (top right gear icon) -> **Export Project as ZIP** or **Push to GitHub**.
