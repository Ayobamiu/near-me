import React, { createContext, useContext, useState, useEffect } from "react";
import bleService from "../services/bleService";

interface MockDevice {
  id: string;
  name: string;
  rssi: number;
}

interface BLEContextType {
  isScanning: boolean;
  nearbyDevices: MockDevice[];
  startScan: () => void;
  stopScan: () => void;
  hasPermission: boolean;
}

const BLEContext = createContext<BLEContextType | undefined>(undefined);

export const useBLE = () => {
  const context = useContext(BLEContext);
  if (context === undefined) {
    throw new Error("useBLE must be used within a BLEProvider");
  }
  return context;
};

export const BLEProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [nearbyDevices, setNearbyDevices] = useState<MockDevice[]>([]);
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    // Check permissions on mount
    checkPermissions();

    return () => {
      bleService.destroy();
    };
  }, []);

  const checkPermissions = async () => {
    const permission = await bleService.requestPermissions();
    setHasPermission(permission);
  };

  const startScan = async () => {
    if (isScanning) return;

    setIsScanning(true);
    setNearbyDevices([]);

    await bleService.startScan((device) => {
      setNearbyDevices((prev) => {
        // Avoid duplicates
        const exists = prev.find((d) => d.id === device.id);
        if (exists) return prev;
        return [...prev, device];
      });
    });
  };

  const stopScan = async () => {
    await bleService.stopScan();
    setIsScanning(false);
  };

  const value = {
    isScanning,
    nearbyDevices,
    startScan,
    stopScan,
    hasPermission,
  };

  return <BLEContext.Provider value={value}>{children}</BLEContext.Provider>;
};
