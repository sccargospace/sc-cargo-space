import { createContext, useContext, useState, useEffect, ReactNode } from "react";

/**
 * Color mapping for different container sizes (SCU).
 */
export interface ContainerColorsProps {
  1: string;
  2: string;
  4: string;
  8: string;
  16: string;
  24: string;
  32: string;
}

/**
 * Application settings configuration.
 */
export interface SettingsProps {
  /** Whether to show container labels in 3D view */
  showContainerLabels: boolean;
  /** Whether to show vehicle labels in 3D view */
  showVehicleLabels: boolean;
  /** Whether to show the grid */
  showGrid: boolean;
  /** Whether to show the grid base plane */
  showGridBase: boolean;
  /** Whether to show performance statistics */
  showPerfStats: boolean;
  /** Whether to automatically expand vehicle tree items */
  autoExpandVehicle: boolean;
  /** Color mapping for different container sizes */
  containerColors: ContainerColorsProps;
  /** Whether to use special color for unsecured containers */
  useUnsecureContainerColor: boolean;
  /** Color for unsecured containers */
  unsecure_container_color: string;
  /** Whether to use dark theme mode */
  isDarkMode: boolean;
}

/**
 * Settings context type definition
 */
export interface SettingsContextType {
  settings: SettingsProps;
  updateSettings: (newSettings: Partial<SettingsProps>) => void;
  resetSettings: () => void;
}

/**
 * Local storage key for settings persistence
 */
const SETTINGS_STORAGE_KEY = "sc-cargo-space-settings_v4";

/**
 * Default settings configuration
 */
const defaultSettings: SettingsProps = {
  showContainerLabels: true,
  showVehicleLabels: true,
  showGrid: true,
  showGridBase: true,
  showPerfStats: false,
  autoExpandVehicle: true,
  containerColors: {
    1: "#b9bdbd",
    2: "#a88898",
    4: "#9584a3",
    8: "#a18481",
    16: "#84a59d",
    24: "#b0ae97",
    32: "#a9bbcc"
  },
  useUnsecureContainerColor: true,
  unsecure_container_color: "#ff5252",
  isDarkMode: false
};

/**
 * Settings context
 */
const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

/**
 * Load settings from localStorage with backward compatibility
 */
const loadSettingsFromStorage = (): SettingsProps => {
  try {
    const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (savedSettings) {
      const parsed = JSON.parse(savedSettings);

      // Ensure isDarkMode exists for backward compatibility
      if (parsed.isDarkMode === undefined) {
        parsed.isDarkMode = false;
      }

      // Merge with defaults to ensure all properties exist
      return { ...defaultSettings, ...parsed };
    }
  } catch (error) {
    console.warn("Failed to load settings from localStorage:", error);
  }

  return defaultSettings;
};

/**
 * Save settings to localStorage
 */
const saveSettingsToStorage = (settings: SettingsProps): void => {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.warn("Failed to save settings to localStorage:", error);
  }
};

/**
 * Settings provider component props
 */
interface SettingsProviderProps {
  children: ReactNode;
}

/**
 * Settings provider component that manages settings state and persistence
 */
export const SettingsProvider = ({ children }: SettingsProviderProps) => {
  const [settings, setSettings] = useState<SettingsProps>(defaultSettings);

  // Load settings from localStorage on mount
  useEffect(() => {
    const loadedSettings = loadSettingsFromStorage();
    setSettings(loadedSettings);
  }, []);

  /**
   * Update settings and persist to localStorage
   */
  const updateSettings = (newSettings: Partial<SettingsProps>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    saveSettingsToStorage(updatedSettings);
  };

  /**
   * Reset settings to defaults and clear localStorage
   */
  const resetSettings = () => {
    setSettings(defaultSettings);
    saveSettingsToStorage(defaultSettings);
  };

  const contextValue: SettingsContextType = {
    settings,
    updateSettings,
    resetSettings,
  };

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
};

/**
 * Hook to use settings context
 * @returns Settings context with current settings and update functions
 */
export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
};
