import { Platform } from "react-native";

export const theme = {
  colors: {
    background: "#F8FAFC",
    surface: "#FFFFFF",
    surfaceMuted: "#F3F4F6",
    surfaceStrong: "#111827",
    accent: "#030213",
    accentSoft: "#F3F3F5",
    accentStrong: "#030213",
    success: "#0FA968",
    warning: "#F59E0B",
    danger: "#D4183D",
    textPrimary: "#030213",
    textSecondary: "#717182",
    textMuted: "#9CA3AF",
    border: "rgba(15,23,42,0.1)",
    chipBlue: "#E9EBEF",
    chipGreen: "#DCFCE7",
    chipOrange: "#FEF3C7",
  },
  spacing: {
    xs: 6,
    sm: 10,
    md: 16,
    lg: 20,
    xl: 28,
    xxl: 36,
  },
  radius: {
    sm: 10,
    md: 16,
    lg: 20,
    pill: 999,
  },
  typography: {
    display: {
      fontSize: 28,
      lineHeight: 34,
      fontWeight: "800" as const,
      fontFamily: Platform.select({
        ios: "Avenir Next",
        android: "sans-serif-medium",
        default: "System",
      }),
    },
    title: {
      fontSize: 22,
      lineHeight: 28,
      fontWeight: "700" as const,
    },
    section: {
      fontSize: 17,
      lineHeight: 22,
      fontWeight: "700" as const,
    },
    body: {
      fontSize: 15,
      lineHeight: 21,
      fontWeight: "500" as const,
    },
    caption: {
      fontSize: 13,
      lineHeight: 18,
      fontWeight: "500" as const,
    },
  },
  shadow: {
    card: {
      shadowColor: "#0F172A",
      shadowOpacity: 0.05,
      shadowRadius: 14,
      shadowOffset: { width: 0, height: 8 },
      elevation: 3,
    },
  },
};
