// appwrite-config.ts
import { Account, Client, Databases, ID, Permission, Role } from "appwrite";

const client = new Client()
  .setEndpoint(
    process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT ||
      "https://fra.cloud.appwrite.io/v1"
  )
  .setProject(
    process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || "68bf3a54003265a13968"
  );

export const account = new Account(client);
export const databases = new Databases(client);
export const appwriteClient = client;

// Database and Collection IDs
export const DATABASE_ID = "68bf445f00120547df2f";
export const QUIZ_COLLECTION_ID = "688fc0ed003716ec278c";
export const SCHEDULES_COLLECTION_ID = "6890c611001277753138"; // Replace with actual ID from Appwrite Console

// Add this line to detect web environment
export const isWeb = typeof window !== 'undefined' && !window.navigator?.product?.includes('ReactNative');

// Export ID, Permission, and Role for use in other files
export { ID, Permission, Role };
