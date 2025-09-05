Preview the static export locally

1. Build (already ran during export):

   npm run build

2. Serve the `dist` folder locally (recommended: `serve` package):

   npx serve dist

Deploy to Vercel

1. Create a Vercel project and link your GitHub repo.
2. In the Vercel dashboard set the
   - Framework Preset: Other
   - Build Command: npm run build
   - Output Directory: dist
3. Deploy. Vercel will run `npm run build` and publish the contents of `dist`.

Notes

- Make sure `EXPO_PUBLIC_APPWRITE_ENDPOINT` and `EXPO_PUBLIC_APPWRITE_PROJECT_ID` are set in Vercel Environment Variables.
- If you get build-time native module errors, ensure native-only packages are removed or conditionally imported.
