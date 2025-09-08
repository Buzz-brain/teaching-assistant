import { Platform } from "react-native";
import { account } from "./appwrite-config";

export async function universalLogin(email: string, password: string) {
  if (Platform.OS === "web") {
    // Use proxy for web
    const response = await fetch("/api/appwrite/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) throw new Error("Login failed");
    return await response.json();
  } else {
    // Use Appwrite SDK for native
  return await account.createEmailPasswordSession(email, password);
  }
}
