import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { GlassCard, Pill, SectionHeader } from "../../components/Ui";
import { useAppData } from "../../store/AppDataContext";
import { theme } from "../../theme/theme";

export function DocumentsScreen() {
  const { data, session } = useAppData();

  const buckets = [
    { label: "Sales docs", count: data.invoices.length + data.receipts.length, tone: "blue" as const, hint: "Invoices and receipt records" },
    { label: "Purchase docs", count: data.purchaseOrders.length + data.purchaseReceipts.length, tone: "green" as const, hint: "Orders, receipts, and payment records" },
    { label: "Inventory docs", count: data.products.length, tone: "orange" as const, hint: "Product and stock record context" },
    { label: "Reports", count: data.topProducts.length + (data.recentActivities?.length ?? 0), tone: "blue" as const, hint: "Analytics and audit-ready summaries" },
  ];

  return (
    <View style={styles.wrap}>
      <View>
        <Text style={styles.heading}>Documents</Text>
        <Text style={styles.subheading}>
          Centralized document workspace aligned with the web app document center for {session?.organizationName ?? "your workspace"}.
        </Text>
      </View>

      <SectionHeader title="Document Buckets" action="Synced context" />
      <View style={styles.grid}>
        {buckets.map((bucket) => (
          <GlassCard key={bucket.label} style={styles.card}>
            <View style={styles.row}>
              <Text style={styles.cardTitle}>{bucket.label}</Text>
              <Pill label={`${bucket.count}`} tone={bucket.tone} />
            </View>
            <Text style={styles.cardHint}>{bucket.hint}</Text>
          </GlassCard>
        ))}
      </View>

      <GlassCard>
        <Text style={styles.noteTitle}>Flow Note</Text>
        <Text style={styles.noteBody}>
          Mobile now exposes a dedicated documents area like the web app. As backend file endpoints are expanded, this screen is ready to host file upload, tagging, and retrieval actions.
        </Text>
      </GlassCard>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 16 },
  heading: { color: theme.colors.textPrimary, fontSize: 24, fontWeight: "800" },
  subheading: { color: theme.colors.textSecondary, fontSize: 14, fontWeight: "600", lineHeight: 20, marginTop: 4 },
  grid: { gap: 12 },
  card: { gap: 10 },
  row: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", gap: 10 },
  cardTitle: { color: theme.colors.textPrimary, fontSize: 16, fontWeight: "800" },
  cardHint: { color: theme.colors.textSecondary, fontSize: 13, fontWeight: "600", lineHeight: 18 },
  noteTitle: { color: theme.colors.textPrimary, fontSize: 15, fontWeight: "800", marginBottom: 6 },
  noteBody: { color: theme.colors.textSecondary, fontSize: 13, fontWeight: "600", lineHeight: 18 },
});
