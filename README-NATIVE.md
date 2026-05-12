# ZQ AI LOGIC - Multi-Platform Build Instructions

The application has been fully configured for **Web**, **Android**, and **Windows Desktop** environments exactly per the Sovereign Autonomous Cognitive Infrastructure Platform specifications.

## 1. Web Version
Since the app requires a custom Node.js Express server to handle cryptographic operations safely away from the browser, we use `tsx` to run the server which integrates Vite for the frontend.
- **Run in Preview:** The preview iframe you see automatically starts the web version.
- **Production Build:** Run `npm run build`, followed by `npm start` to serve the production build statically from the Express core.

## 2. Windows Desktop (Electron)
The architecture demands runtime environment containment, and building a standalone compiled Windows application allows for maximum isolation. Electron and `electron-builder` have been configured.

### Instructions to Build for Windows
1. Export the project by clicking the setting menu (top right) -> **Export to ZIP** or **GitHub**.
2. Extract locally / Clone the repository on a Windows machine.
3. Install dependencies: `npm install`
4. Run the Windows builder: 
   ```bash
   npm run build:windows
   ```
5. You will find the compiled `.exe` installer inside the newly created `dist/` or `out/` folder.

## 3. Android Version (Capacitor)
Healthcare logic and offline mesh require on-device presence. We have configured **Capacitor** to compile the trusted front-end interface natively for Android.

### Instructions to Build for Android
1. Export the project locally and open the terminal.
2. Ensure you have [Android Studio](https://developer.android.com/studio) installed.
3. Install project dependencies: `npm install`
4. Sync the web build with Android:
   ```bash
   npm run build:android
   ```
5. Open the project in Android Studio to build the `.apk`:
   ```bash
   npx cap open android
   ```
6. From Android Studio, generate the APK from `Build > Build Bundle(s) / APK(s) > Build APK(s)`.

*Note: In production Android/Desktop environments, the frontend must point to your Sovereign Express Server for backend AI APIs, as API keys should never be bundled within the client app.*
