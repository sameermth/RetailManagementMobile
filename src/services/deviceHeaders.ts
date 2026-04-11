import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Application from "expo-application";
import * as Device from "expo-device";
import { Platform } from "react-native";

const FALLBACK_DEVICE_ID_KEY = "retail-management-device-id";

type DeviceHeaderContext = {
  userAgent: string;
  deviceId: string;
  deviceName: string;
};

let contextPromise: Promise<DeviceHeaderContext> | null = null;

function randomId() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const value = (Math.random() * 16) | 0;
    const output = char === "x" ? value : (value & 0x3) | 0x8;
    return output.toString(16);
  });
}

async function resolveDeviceId() {
  try {
    if (Platform.OS === "android") {
      const androidId = Application.getAndroidId();
      if (androidId) {
        return androidId;
      }
    }
    if (Platform.OS === "ios") {
      const vendorId = await Application.getIosIdForVendorAsync();
      if (vendorId) {
        return vendorId;
      }
    }
  } catch {}

  const existing = await AsyncStorage.getItem(FALLBACK_DEVICE_ID_KEY);
  if (existing) {
    return existing;
  }
  const generated = randomId();
  await AsyncStorage.setItem(FALLBACK_DEVICE_ID_KEY, generated);
  return generated;
}

async function loadContext(): Promise<DeviceHeaderContext> {
  const deviceId = await resolveDeviceId();
  const appVersion = Application.nativeApplicationVersion ?? "dev";
  const deviceName = Device.deviceName || Device.modelName || `${Platform.OS} device`;
  const userAgent = `RetailManagementMobile/${appVersion} (${Platform.OS}; ${deviceName})`;
  return {
    userAgent,
    deviceId,
    deviceName,
  };
}

export async function getDeviceHeaders() {
  if (!contextPromise) {
    contextPromise = loadContext();
  }
  const context = await contextPromise;
  return {
    "User-Agent": context.userAgent,
    "X-Device-Id": context.deviceId,
    "X-Device-Name": context.deviceName,
  };
}
