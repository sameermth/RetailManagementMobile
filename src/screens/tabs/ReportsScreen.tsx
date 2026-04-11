import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { ActionButton, ActionSheet, GlassCard, GradientCard, Pill, SearchableSelect, SectionHeader } from "../../components/Ui";
import { useAppData } from "../../store/AppDataContext";
import { theme } from "../../theme/theme";
import { formatCompactCurrency, formatCurrency } from "../../utils/formatters";

type ReportView = "business" | "gst" | "finance" | "approvals" | "workflow";

type ApprovalQueueSummary = {
  totalPending?: number;
  pendingByEntityType?: { entityType: string; pendingCount: number }[];
};

type ApprovalRule = {
  id: number;
  entityType?: string;
  approvalType?: string;
  minAmount?: number;
  maxAmount?: number;
  active?: boolean;
};

type ApprovalRequest = {
  id: number;
  entityType?: string;
  entityNumber?: string;
  approvalType?: string;
  status?: string;
  requestedAt?: string;
};

type WorkflowReview = {
  totalTriggers?: number;
  criticalCount?: number;
  warningCount?: number;
  triggers?: { triggerType?: string; title?: string; message?: string; amount?: number }[];
};

type CashBankSummary = {
  totalInflow?: number;
  totalOutflow?: number;
  netMovement?: number;
  accounts?: { accountId: number; accountName?: string; netMovement?: number }[];
};

type OutstandingSummary = {
  totalOutstanding?: number;
  documents?: { documentId: number; documentNumber?: string; outstandingAmount?: number; dueDate?: string }[];
};

type NotificationStats = {
  totalSent?: number;
  pending?: number;
  failed?: number;
  delivered?: number;
  read?: number;
};

type ReportSchedule = {
  id: number;
  scheduleName?: string;
  reportType?: string;
  nextRunDate?: string;
  isActive?: boolean;
};

export function ReportsScreen({
  title = "Reports",
  subtitle = "Business analytics, GST reporting, approvals, and workflow visibility from the backend.",
}: {
  title?: string;
  subtitle?: string;
}) {
  const { apiGet, apiPost, data, session } = useAppData();
  const [activeView, setActiveView] = useState<ReportView>("business");
  const [approvalRules, setApprovalRules] = useState<ApprovalRule[]>([]);
  const [approvalRequests, setApprovalRequests] = useState<ApprovalRequest[]>([]);
  const [approvalSummary, setApprovalSummary] = useState<ApprovalQueueSummary | null>(null);
  const [workflowReview, setWorkflowReview] = useState<WorkflowReview | null>(null);
  const [notificationStats, setNotificationStats] = useState<NotificationStats | null>(null);
  const [reportSchedules, setReportSchedules] = useState<ReportSchedule[]>([]);
  const [cashBankSummary, setCashBankSummary] = useState<CashBankSummary | null>(null);
  const [outstandingSummary, setOutstandingSummary] = useState<OutstandingSummary | null>(null);
  const [financeDates, setFinanceDates] = useState({
    fromDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().slice(0, 10),
    toDate: new Date().toISOString().slice(0, 10),
  });
  const [workflowDate, setWorkflowDate] = useState(new Date().toISOString().slice(0, 10));
  const [approvalEval, setApprovalEval] = useState({ entityType: "SALES_INVOICE", entityId: "" });
  const [approvalEvalResult, setApprovalEvalResult] = useState<string>("");
  const [showQuickActions, setShowQuickActions] = useState(false);

  const quickActions = [
    { id: "business", label: "Business summary", icon: "business-outline" as const, description: "Review revenue, collections, and receipts.", onPress: () => setActiveView("business") },
    { id: "gst", label: "GST summary", icon: "document-text-outline" as const, description: "Open tax threshold and turnover analytics.", onPress: () => setActiveView("gst") },
    { id: "finance", label: "Finance summary", icon: "wallet-outline" as const, description: "View cash, bank and receivables data.", onPress: () => setActiveView("finance") },
    { id: "approvals", label: "Approval queue", icon: "checkmark-done-outline" as const, description: "See pending approvals and rule summaries.", onPress: () => setActiveView("approvals") },
    { id: "workflow", label: "Workflow review", icon: "pulse-outline" as const, description: "Inspect workflow triggers and notification health.", onPress: () => setActiveView("workflow") },
  ];
  const activeReport = quickActions.find((action) => action.id === activeView);

  useEffect(() => {
    if (!session?.organizationId) return;
    if (activeView === "approvals") {
      apiGet<ApprovalQueueSummary>("/api/erp/approvals/requests/summary", {
        query: { organizationId: session.organizationId },
      }).then(setApprovalSummary).catch(() => setApprovalSummary(null));
      apiGet<ApprovalRule[]>("/api/erp/approvals/rules", {
        query: { organizationId: session.organizationId },
      }).then(setApprovalRules).catch(() => setApprovalRules([]));
      apiGet<ApprovalRequest[]>("/api/erp/approvals/requests", {
        query: { organizationId: session.organizationId },
      }).then(setApprovalRequests).catch(() => setApprovalRequests([]));
    }
    if (activeView === "workflow") {
      apiGet<WorkflowReview>("/api/erp/workflow-triggers/review", {
        query: { organizationId: session.organizationId, asOfDate: workflowDate },
      }).then(setWorkflowReview).catch(() => setWorkflowReview(null));
      apiGet<NotificationStats>("/api/notifications/stats").then(setNotificationStats).catch(() => setNotificationStats(null));
      apiGet<ReportSchedule[]>("/api/report-schedules/active", { kind: "auth" }).then(setReportSchedules).catch(() => setReportSchedules([]));
    }
    if (activeView === "finance") {
      apiPost<CashBankSummary>("/api/erp/finance/cash-bank-summary", {
        fromDate: financeDates.fromDate,
        toDate: financeDates.toDate,
      }, {
        query: { organizationId: session.organizationId },
      }).then(setCashBankSummary).catch(() => setCashBankSummary(null));
      apiPost<OutstandingSummary>("/api/erp/finance/outstanding", {
        partyType: "CUSTOMER",
        asOfDate: financeDates.toDate,
      }, {
        query: { organizationId: session.organizationId },
      }).then(setOutstandingSummary).catch(() => setOutstandingSummary(null));
    }
  }, [activeView, apiGet, apiPost, financeDates.fromDate, financeDates.toDate, session?.organizationId, workflowDate]);

  const entityTypeOptions = [
    { id: "SALES_INVOICE", label: "Sales Invoice" },
    { id: "PURCHASE_ORDER", label: "Purchase Order" },
    { id: "PURCHASE_RECEIPT", label: "Purchase Receipt" },
    { id: "SALES_QUOTE", label: "Sales Quote" },
    { id: "SALES_ORDER", label: "Sales Order" },
  ];

  const entityIdOptions = useMemo(() => {
    switch (approvalEval.entityType) {
      case "SALES_INVOICE":
        return data.invoices.map((invoice) => ({
          id: String(invoice.id),
          label: invoice.invoiceNumber || `Invoice ${invoice.id}`,
          meta: `${data.customers.find((c) => c.id === invoice.customerId)?.fullName || `Customer ${invoice.customerId}`}`,
        }));
      case "PURCHASE_ORDER":
        return data.purchaseOrders.map((order) => ({
          id: String(order.id),
          label: order.poNumber || `PO ${order.id}`,
          meta: `${data.suppliers.find((s) => s.id === order.supplierId)?.name || `Supplier ${order.supplierId}`}`,
        }));
      case "PURCHASE_RECEIPT":
        return data.purchaseReceipts.map((receipt) => ({
          id: String(receipt.id),
          label: receipt.receiptNumber || `Receipt ${receipt.id}`,
          meta: `${data.suppliers.find((s) => s.id === receipt.supplierId)?.name || `Supplier ${receipt.supplierId}`}`,
        }));
      case "SALES_QUOTE":
        return data.quotes.map((quote) => ({
          id: String(quote.id),
          label: quote.quoteNumber || `Quote ${quote.id}`,
          meta: `${data.customers.find((c) => c.id === quote.customerId)?.fullName || `Customer ${quote.customerId}`}`,
        }));
      case "SALES_ORDER":
        return data.orders.map((order) => ({
          id: String(order.id),
          label: order.orderNumber || `Order ${order.id}`,
          meta: `${data.customers.find((c) => c.id === order.customerId)?.fullName || `Customer ${order.customerId}`}`,
        }));
      default:
        return [];
    }
  }, [approvalEval.entityType, data.invoices, data.purchaseOrders, data.purchaseReceipts, data.quotes, data.orders, data.customers, data.suppliers]);

  const businessHighlights = useMemo(
    () => [
      {
        title: "Monthly sales",
        value: formatCompactCurrency(data.dashboardSummary?.monthlySales?.totalAmount ?? 0),
        detail: `${data.dashboardSummary?.monthlySales?.totalTransactions ?? 0} transactions`,
      },
      {
        title: "Collections due",
        value: formatCompactCurrency(data.dueSummary?.totalDueAmount ?? 0),
        detail: `${data.dueSummary?.totalDueCustomers ?? 0} customers`,
      },
      {
        title: "Purchase receipts",
        value: formatCompactCurrency(data.purchaseReceipts.reduce((sum, entry) => sum + (entry.totalAmount ?? 0), 0)),
        detail: `${data.purchaseReceipts.length} receipts`,
      },
    ],
    [data.dashboardSummary, data.dueSummary, data.purchaseReceipts],
  );

  const gstCards = [
    {
      title: "GST threshold",
      value: formatCurrency(data.dashboardSummary?.gstStatus?.gstThresholdAmount ?? 0),
      detail: data.dashboardSummary?.gstStatus?.alertLevel || "No alert level",
    },
    {
      title: "Current turnover",
      value: formatCurrency(data.dashboardSummary?.gstStatus?.financialYearTurnover ?? 0),
      detail: data.dashboardSummary?.gstStatus?.thresholdReached ? "Threshold reached" : "Within threshold",
    },
    {
      title: "Due this week",
      value: formatCurrency(data.dueSummary?.dueThisWeek ?? 0),
      detail: `${data.dueSummary?.overdueCount ?? 0} overdue records`,
    },
  ];

  async function runApprovalEvaluation() {
    if (!session?.organizationId || !approvalEval.entityId) return;
    try {
      const result = await apiPost<{ approvalRequired?: boolean; approverRoleName?: string; pendingRequestExists?: boolean }>(
        "/api/erp/approvals/evaluate",
        {
          entityType: approvalEval.entityType,
          entityId: Number(approvalEval.entityId),
        },
        { query: { organizationId: session.organizationId } },
      );
      setApprovalEvalResult(
        `${result.approvalRequired ? "Approval required" : "No approval required"}${result.approverRoleName ? ` • ${result.approverRoleName}` : ""}${result.pendingRequestExists ? " • pending request exists" : ""}`,
      );
    } catch {
      setApprovalEvalResult("Unable to evaluate approval.");
    }
  }

  async function dispatchWorkflow() {
    if (!session?.organizationId) return;
    await apiPost("/api/erp/workflow-triggers/dispatch", undefined, {
      query: { organizationId: session.organizationId, asOfDate: workflowDate },
    });
  }

  return (
    <View style={styles.wrap}>
      <View>
        <Text style={styles.heading}>{title}</Text>
        <Text style={styles.subheading}>{subtitle}</Text>
      </View>

      <View style={styles.summaryRow}>
        <Pill label={activeReport?.label ?? "Reports"} tone="blue" />
        <Text style={styles.reportHint}>{activeReport?.description ?? "Open the report view for business, GST, finance, approvals or workflows."}</Text>
      </View>

      <View style={styles.sheetTriggerRow}>
        <ActionButton label="Quick actions" icon="flash-outline" inverted onPress={() => setShowQuickActions(true)} />
      </View>

      <ActionSheet
        label="Reports quick actions"
        visible={showQuickActions}
        onClose={() => setShowQuickActions(false)}
        actions={quickActions}
      />

      <View style={styles.segmentRow}>
        {(["business", "gst", "finance", "approvals", "workflow"] as ReportView[]).map((view) => {
          const active = view === activeView;
          return (
            <Pressable key={view} onPress={() => setActiveView(view)} style={[styles.segment, active && styles.segmentActive]}>
              <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{view[0].toUpperCase() + view.slice(1)}</Text>
            </Pressable>
          );
        })}
      </View>

      {activeView === "business" ? (
        <>
          <GradientCard colors={["#DDF4FF", "#F5FBFF"]} style={styles.banner}>
            <Text style={styles.bannerTitle}>Organization-wide business pulse.</Text>
            <Text style={styles.bannerText}>{session?.organizationName ?? "Active organization"} is using the same dashboard summary and top-product feeds as the backend reporting layer.</Text>
          </GradientCard>
          <SectionHeader title="Highlights" action="Live API" />
          <View style={styles.cardStack}>
            {businessHighlights.map((card) => (
              <GlassCard key={card.title} style={styles.reportCard}>
                <Text style={styles.reportTitle}>{card.title}</Text>
                <Text style={styles.reportValue}>{card.value}</Text>
                <Text style={styles.reportDetail}>{card.detail}</Text>
              </GlassCard>
            ))}
          </View>
        </>
      ) : null}

      {activeView === "gst" ? (
        <>
          <GradientCard colors={["#FFF5DD", "#FFFDF5"]} style={styles.banner}>
            <Text style={styles.bannerTitle}>GST and collections watchlist.</Text>
            <Text style={styles.bannerText}>This view is aligned to the backend tax threshold summary plus due-analysis endpoints.</Text>
          </GradientCard>
          <SectionHeader title="GST summary" action={data.dashboardSummary?.gstStatus?.message || "Threshold watch"} />
          <View style={styles.cardStack}>
            {gstCards.map((card) => (
              <GlassCard key={card.title} style={styles.reportCard}>
                <Text style={styles.reportTitle}>{card.title}</Text>
                <Text style={styles.reportValue}>{card.value}</Text>
                <Text style={styles.reportDetail}>{card.detail}</Text>
              </GlassCard>
            ))}
          </View>
        </>
      ) : null}

      {activeView === "finance" ? (
        <>
          <SectionHeader title="Finance summaries" action="Cash, bank, outstanding" />
          <GlassCard style={styles.formCard}>
            <TextInput value={financeDates.fromDate} onChangeText={(value) => setFinanceDates((current) => ({ ...current, fromDate: value }))} placeholder="From date" placeholderTextColor={theme.colors.textMuted} style={styles.input} />
            <TextInput value={financeDates.toDate} onChangeText={(value) => setFinanceDates((current) => ({ ...current, toDate: value }))} placeholder="To date" placeholderTextColor={theme.colors.textMuted} style={styles.input} />
          </GlassCard>
          <View style={styles.cardStack}>
            <GlassCard style={styles.reportCard}>
              <Text style={styles.reportTitle}>Cash and bank movement</Text>
              <Text style={styles.reportValue}>{formatCurrency(cashBankSummary?.netMovement ?? 0)}</Text>
              <Text style={styles.reportDetail}>Inflow {formatCurrency(cashBankSummary?.totalInflow ?? 0)} • Outflow {formatCurrency(cashBankSummary?.totalOutflow ?? 0)}</Text>
            </GlassCard>
            <GlassCard style={styles.reportCard}>
              <Text style={styles.reportTitle}>Outstanding summary</Text>
              <Text style={styles.reportValue}>{formatCurrency(outstandingSummary?.totalOutstanding ?? 0)}</Text>
              <Text style={styles.reportDetail}>{outstandingSummary?.documents?.length ?? 0} outstanding documents</Text>
            </GlassCard>
          </View>
        </>
      ) : null}

      {activeView === "approvals" ? (
        <>
          <SectionHeader title="Approval queue" action={`${approvalSummary?.totalPending ?? 0} pending`} />
          <View style={styles.cardStack}>
            {(approvalSummary?.pendingByEntityType ?? []).map((item) => (
              <GlassCard key={item.entityType} style={styles.reportCard}>
                <Text style={styles.reportTitle}>{item.entityType}</Text>
                <Text style={styles.reportValue}>{item.pendingCount}</Text>
              </GlassCard>
            ))}
          </View>
          <SectionHeader title="Approval rules" action={`${approvalRules.length} rules`} />
          <View style={styles.cardStack}>
            {approvalRules.slice(0, 6).map((rule) => (
              <GlassCard key={rule.id} style={styles.reportCard}>
                <Text style={styles.reportTitle}>{rule.entityType} • {rule.approvalType}</Text>
                <Text style={styles.reportDetail}>{formatCurrency(rule.minAmount ?? 0)} to {formatCurrency(rule.maxAmount ?? 0)}</Text>
              </GlassCard>
            ))}
          </View>
          <SectionHeader title="Evaluate approval" action={`${approvalRequests.length} requests`} />
          <GlassCard style={styles.formCard}>
            <SearchableSelect
              label="Entity type"
              placeholder="Select entity type"
              selectedLabel={entityTypeOptions.find((option) => option.id === approvalEval.entityType)?.label}
              options={entityTypeOptions}
              onSelect={(id) => setApprovalEval((current) => ({ ...current, entityType: id, entityId: "" }))}
            />
            <SearchableSelect
              label="Entity"
              placeholder="Select entity"
              selectedLabel={entityIdOptions.find((option) => option.id === approvalEval.entityId)?.label}
              options={entityIdOptions}
              onSelect={(id) => setApprovalEval((current) => ({ ...current, entityId: id }))}
            />
            <ActionButton label="Evaluate" icon="git-compare" onPress={runApprovalEvaluation} />
            {approvalEvalResult ? <Text style={styles.reportDetail}>{approvalEvalResult}</Text> : null}
          </GlassCard>
        </>
      ) : null}

      {activeView === "workflow" ? (
        <>
          <SectionHeader title="Workflow review" action={`${workflowReview?.totalTriggers ?? 0} triggers`} />
          <GlassCard style={styles.formCard}>
            <TextInput value={workflowDate} onChangeText={setWorkflowDate} placeholder="As of date" placeholderTextColor={theme.colors.textMuted} style={styles.input} />
            <ActionButton label="Dispatch notifications" icon="send" onPress={dispatchWorkflow} />
            <Text style={styles.reportDetail}>Critical {workflowReview?.criticalCount ?? 0} • Warning {workflowReview?.warningCount ?? 0}</Text>
          </GlassCard>
          <View style={styles.cardStack}>
            <GlassCard style={styles.reportCard}>
              <Text style={styles.reportTitle}>Notification stats</Text>
              <Text style={styles.reportValue}>{notificationStats?.totalSent ?? 0}</Text>
              <Text style={styles.reportDetail}>Delivered {notificationStats?.delivered ?? 0} • Pending {notificationStats?.pending ?? 0} • Failed {notificationStats?.failed ?? 0}</Text>
            </GlassCard>
          </View>
          <View style={styles.cardStack}>
            {(workflowReview?.triggers ?? []).slice(0, 8).map((trigger, index) => (
              <GlassCard key={`${trigger.triggerType}-${index}`} style={styles.reportCard}>
                <Text style={styles.reportTitle}>{trigger.title || trigger.triggerType || "Trigger"}</Text>
                <Text style={styles.reportDetail}>{trigger.message || "No details"}</Text>
                <Text style={styles.reportDetail}>{formatCurrency(trigger.amount ?? 0)}</Text>
              </GlassCard>
            ))}
          </View>
          <SectionHeader title="Report schedules" action={`${reportSchedules.length} active`} />
          <View style={styles.cardStack}>
            {reportSchedules.slice(0, 6).map((schedule) => (
              <GlassCard key={schedule.id} style={styles.reportCard}>
                <Text style={styles.reportTitle}>{schedule.scheduleName || `Schedule ${schedule.id}`}</Text>
                <Text style={styles.reportDetail}>{schedule.reportType || "Report"} • next {schedule.nextRunDate || "-"}</Text>
              </GlassCard>
            ))}
          </View>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 20 },
  heading: { color: theme.colors.textPrimary, fontSize: 24, fontWeight: "800" },
  subheading: { color: theme.colors.textSecondary, fontSize: 14, lineHeight: 20, fontWeight: "600", marginTop: 6 },
  sheetTriggerRow: { marginBottom: theme.spacing.sm },
  segmentRow: { flexDirection: "row", gap: 10, flexWrap: "wrap" },
  segment: { backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.radius.pill, paddingHorizontal: 14, paddingVertical: 10 },
  segmentActive: { backgroundColor: theme.colors.accent },
  summaryRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: theme.spacing.sm },
  reportHint: { color: theme.colors.textSecondary, fontSize: 13, fontWeight: "600", flex: 1, lineHeight: 18 },
  segmentText: { color: theme.colors.textSecondary, fontSize: 13, fontWeight: "700" },
  segmentTextActive: { color: "#FFFFFF" },
  banner: { gap: 10 },
  bannerTitle: { color: theme.colors.textPrimary, fontSize: 24, lineHeight: 28, fontWeight: "800" },
  bannerText: { color: theme.colors.textSecondary, fontSize: 14, lineHeight: 20, fontWeight: "600" },
  cardStack: { gap: 12 },
  formCard: { gap: 12 },
  reportCard: { gap: 8 },
  reportTitle: { color: theme.colors.textSecondary, fontSize: 13, fontWeight: "700" },
  reportValue: { color: theme.colors.textPrimary, fontSize: 26, fontWeight: "800" },
  reportDetail: { color: theme.colors.textSecondary, fontSize: 14, lineHeight: 20, fontWeight: "600" },
  input: { minHeight: 54, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.border, paddingHorizontal: 16, color: theme.colors.textPrimary, fontSize: 14, fontWeight: "600", backgroundColor: theme.colors.surfaceMuted },
});
