import { Platform } from "react-native";
import { account } from "./appwrite-config";

export async function universalLogin(email: string, password: string) {
  if (Platform.OS === "web") {
    console.log("[universalLogin] Platform: web - using proxy server for login");
    // Use proxy for web
    const response = await fetch(
      "https://teaching-assistant-548j.onrender.com/auth/login",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      }
    );
    if (!response.ok) throw new Error("Login failed");
    return await response.json();
  } else {
    console.log(`[universalLogin] Platform: ${Platform.OS} - using Appwrite SDK for login`);
    // Use Appwrite SDK for native
    return await account.createEmailPasswordSession(email, password);
  }
}
