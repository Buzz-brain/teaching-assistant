// contexts/AuthContext.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";
import { account } from "../utils/appwrite-config";
import { universalLogin } from "../utils/universal-auth";

// Create a universal storage helper
const universalStorage = {
  setItem: async (key: string, value: string) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      // Web environment
      localStorage.setItem(key, value);
    } else {
      // Mobile environment
      await AsyncStorage.setItem(key, value);
    }
  },
  
  getItem: async (key: string): Promise<string | null> => {
    if (typeof window !== 'undefined' && window.localStorage) {
      // Web environment
      return localStorage.getItem(key);
    } else {
      // Mobile environment
      return await AsyncStorage.getItem(key);
    }
  },
  
  removeItem: async (key: string) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      // Web environment
      localStorage.removeItem(key);
    } else {
      // Mobile environment
      await AsyncStorage.removeItem(key);
    }
  },
  
  multiRemove: async (keys: string[]) => {
    if (typeof window !== 'undefined' && window.localStorage) {
      // Web environment
      keys.forEach(key => localStorage.removeItem(key));
    } else {
      // Mobile environment
      await AsyncStorage.multiRemove(keys);
    }
  }
};

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<any>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Add a cross-platform login method
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const session = await universalLogin(email, password);
      await AsyncStorage.setItem("userEmail", email);
      // Optionally fetch user info and store role/userId
      setIsAuthenticated(true);
      return session;
    } catch (error) {
      setIsAuthenticated(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const checkAuth = async () => {
    try {
      const email = await AsyncStorage.getItem("userEmail");
      if (email) {
        const user = await account.get();
        await universalStorage.setItem("userRole", user.prefs?.role || "student");
        await universalStorage.setItem("userId", user.$id);
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error("Auth check error:", error);
      await universalStorage.multiRemove(["userEmail", "userRole", "userId"]);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await account.deleteSession("current");
    } catch (error) {
      console.log("Logout error:", error);
    } finally {
      await universalStorage.multiRemove(["userEmail", "userRole", "userId"]);
      setIsAuthenticated(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, isLoading, login, logout, checkAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// // contexts/AuthContext.tsx
// import AsyncStorage from "@react-native-async-storage/async-storage";
// import React, { createContext, useContext, useEffect, useState } from "react";
// import { account } from "../utils/appwrite-config";

// // Create a universal storage helper
// const universalStorage = {
//   setItem: async (key: string, value: string) => {
//     if (typeof window !== 'undefined' && window.localStorage) {
//       // Web environment
//       localStorage.setItem(key, value);
//     } else {
//       // Mobile environment
//       await AsyncStorage.setItem(key, value);
//     }
//   },
  
//   getItem: async (key: string): Promise<string | null> => {
//     if (typeof window !== 'undefined' && window.localStorage) {
//       // Web environment
//       return localStorage.getItem(key);
//     } else {
//       // Mobile environment
//       return await AsyncStorage.getItem(key);
//     }
//   },
  
//   removeItem: async (key: string) => {
//     if (typeof window !== 'undefined' && window.localStorage) {
//       // Web environment
//       localStorage.removeItem(key);
//     } else {
//       // Mobile environment
//       await AsyncStorage.removeItem(key);
//     }
//   },
  
//   multiRemove: async (keys: string[]) => {
//     if (typeof window !== 'undefined' && window.localStorage) {
//       // Web environment
//       keys.forEach(key => localStorage.removeItem(key));
//     } else {
//       // Mobile environment
//       await AsyncStorage.multiRemove(keys);
//     }
//   }
// };

// const AuthContext = createContext();

// export const AuthProvider = ({ children }) => {
//   const [isAuthenticated, setIsAuthenticated] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);

//   // Add a cross-platform login method
//   const login = async (email, password) => {
//     setIsLoading(true);
//     try {
//       const session = await universalLogin(email, password);
//       await AsyncStorage.setItem("userEmail", email);
//       // Optionally fetch user info and store role/userId
//       setIsAuthenticated(true);
//       return session;
//     } catch (error) {
//       setIsAuthenticated(false);
//       throw error;
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const checkAuth = async () => {
//     try {
//       const email = await universalStorage.getItem("userEmail");
//       if (email) {
//         const user = await account.get();
//         await universalStorage.setItem("userRole", user.prefs?.role || "student");
//         await universalStorage.setItem("userId", user.$id);
//         setIsAuthenticated(true);
//       } else {
//         setIsAuthenticated(false);
//       }
//     } catch (error) {
//       console.error("Auth check error:", error);
//       await universalStorage.multiRemove(["userEmail", "userRole", "userId"]);
//       setIsAuthenticated(false);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const logout = async () => {
//     try {
//       await account.deleteSession("current");
//     } catch (error) {
//       console.log("Logout error:", error);
//     } finally {
//       await universalStorage.multiRemove(["userEmail", "userRole", "userId"]);
//       setIsAuthenticated(false);
//     }
//   };

//   useEffect(() => {
//     checkAuth();
//   }, []);

//   return (
//     <AuthContext.Provider
//       value={{ isAuthenticated, isLoading, login, logout, checkAuth }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => {
//   const context = useContext(AuthContext);
//   if (!context) {
//     throw new Error("useAuth must be used within an AuthProvider");
//   }
//   return context;
// };