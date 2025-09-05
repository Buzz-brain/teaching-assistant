import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { AppState } from "react-native";

interface RoleContextType {
  userRole: string;
  setUserRole: (role: string) => void;
  isLoading: boolean;
  refreshRole: () => Promise<void>;
}

const RoleContext = createContext<RoleContextType | undefined>(undefined);

interface RoleProviderProps {
  children: ReactNode;
}

export const RoleProvider: React.FC<RoleProviderProps> = ({ children }) => {
  const [userRole, setUserRole] = useState<string>("student");
  const [isLoading, setIsLoading] = useState(true);

  const refreshRole = async () => {
    try {
      const role = await AsyncStorage.getItem("userRole");
      const newRole = role || "student";

      setUserRole((prevRole) => {
        if (prevRole !== newRole) {
          console.log("Role changed:", prevRole, "->", newRole);
          return newRole;
        }
        return prevRole;
      });
    } catch (error) {
      console.error("Error getting user role:", error);
      setUserRole("student");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshRole();

    // Listen for app state changes
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === "active") {
        refreshRole();
      }
    };

    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange
    );

    return () => {
      subscription?.remove();
    };
  }, []);

  const contextValue: RoleContextType = {
    userRole,
    setUserRole: async (role: string) => {
      try {
        await AsyncStorage.setItem("userRole", role);
        setUserRole(role);
      } catch (error) {
        console.error("Error setting user role:", error);
      }
    },
    isLoading,
    refreshRole,
  };

  return (
    <RoleContext.Provider value={contextValue}>{children}</RoleContext.Provider>
  );
};

export const useRole = (): RoleContextType => {
  const context = useContext(RoleContext);
  if (!context) {
    throw new Error("useRole must be used within a RoleProvider");
  }
  return context;
};
