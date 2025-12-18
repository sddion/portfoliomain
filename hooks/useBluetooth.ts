import { useState, useCallback } from "react";

// Type definitions for Web Bluetooth API
interface BluetoothRequestDeviceFilter {
  services?: BluetoothServiceUUID[];
  name?: string;
  namePrefix?: string;
}

interface RequestDeviceOptions {
  filters?: BluetoothRequestDeviceFilter[];
  optionalServices?: BluetoothServiceUUID[];
  acceptAllDevices?: boolean;
}

type BluetoothServiceUUID = string | number;

export interface BluetoothDeviceInfo {
  id: string;
  name: string;
  connected: boolean;
}

export function useBluetooth() {
  const [device, setDevice] = useState<BluetoothDeviceInfo | null>(null);
  const [supported, setSupported] = useState(() => {
    return typeof navigator !== "undefined" && "bluetooth" in navigator;
  });
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const requestDevice = useCallback(async (options?: RequestDeviceOptions) => {
    if (!supported) {
      setError("Web Bluetooth API is not supported in this browser");
      return null;
    }

    setConnecting(true);
    setError(null);

    try {
      // Default options: accept all devices with optional services
      const defaultOptions: RequestDeviceOptions = {
        acceptAllDevices: true,
        optionalServices: ["battery_service", "device_information"],
      };

      const bluetoothDevice = await (navigator as any).bluetooth.requestDevice(
        options || defaultOptions
      );

      // Listen for disconnection
      bluetoothDevice.addEventListener("gattserverdisconnected", () => {
        setDevice((prev) =>
          prev ? { ...prev, connected: false } : null
        );
      });

      // Connect to GATT server
      const server = await bluetoothDevice.gatt?.connect();

      const deviceInfo: BluetoothDeviceInfo = {
        id: bluetoothDevice.id,
        name: bluetoothDevice.name || "Unknown Device",
        connected: !!server?.connected,
      };

      setDevice(deviceInfo);
      setConnecting(false);

      return bluetoothDevice;
    } catch (err) {
      console.error("Bluetooth error:", err);
      setError(err instanceof Error ? err.message : "Failed to connect to device");
      setConnecting(false);
      return null;
    }
  }, [supported]);

  const disconnect = useCallback(async () => {
    setDevice(null);
    setError(null);
  }, []);

  return {
    supported,
    device,
    connecting,
    error,
    requestDevice,
    disconnect,
  };
}
