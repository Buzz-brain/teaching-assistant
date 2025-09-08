# Welcome to your Expo app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

## Deploy to Render (web)

These steps publish the web build (static) to Render as a Static Site. The project already includes a `build` script that runs `expo export:web` and a postbuild helper to create a `200.html` SPA fallback.

1. Push your repo to GitHub/GitLab/Bitbucket and link it to Render.

2. In Render, create a new "Static Site" service and set the following:
   - Build Command: npm ci && npm run build
   - Publish Directory: web
   - Branch: your repo branch (e.g., main)

3. Add environment variables in Render (Environment => Environment Variables):
   - EXPO_PUBLIC_APPWRITE_ENDPOINT — your Appwrite endpoint (e.g., https://nyc.cloud.appwrite.io/v1)
   - EXPO_PUBLIC_APPWRITE_PROJECT_ID — your Appwrite project id

4. (Optional) If you rely on any other runtime secrets (for server-only tasks), add them here.

5. Start the deploy. Render will run the build command, which exports a static web site into the `web/` folder and the `scripts/postbuild.js` script creates `web/200.html` for SPA routing.

6. Verify:
   - Visit the Render URL. Navigate to app routes (e.g., /quiz) — they should work thanks to `200.html` fallback.
   - If Appwrite integration is required, test login and DB interactions; make sure CORS and allowed origins are configured in your Appwrite console to include your Render URL.

Troubleshooting:
- If the build fails due to native modules, ensure `expo export:web` is supported for your Expo SDK version (this project targets Expo ~53). Consider building with `expo prebuild`/EAS for native, but for a static web build `expo export:web` should work.
- If Appwrite calls fail from the browser, configure Appwrite CORS and project settings.
