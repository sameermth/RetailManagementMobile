import React, { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { ActionButton, ActionSheet, BackButton, GlassCard, Pill, SearchableSelect, SectionHeader } from "../../components/Ui";
import { Customer, StoreCustomerTerms, StoreSupplierTerms, Supplier, SupplierCatalog } from "../../data/entities";
import { useAppData } from "../../store/AppDataContext";
import { theme } from "../../theme/theme";
import { formatCurrency } from "../../utils/formatters";

type PartyView = "customers" | "suppliers" | "new";
type PartyMode = "customer" | "supplier";

const blankPartyForm = {
  code: "",
  name: "",
  type: "RETAIL",
  legalName: "",
  tradeName: "",
  phone: "",
  email: "",
  gstin: "",
  billingAddress: "",
  shippingAddress: "",
  state: "",
  stateCode: "",
  contactPersonName: "",
  contactPersonPhone: "",
  contactPersonEmail: "",
  creditLimit: "",
  paymentTerms: "",
  notes: "",
  status: "ACTIVE",
};

const PARTY_TYPE_OPTIONS = [
  { id: "RETAIL", label: "Retail" },
  { id: "WHOLESALE", label: "Wholesale" },
  { id: "DISTRIBUTOR", label: "Distributor" },
  { id: "CORPORATE", label: "Corporate" },
  { id: "BUSINESS", label: "Business" },
];

const PARTY_STATUS_OPTIONS = [
  { id: "ACTIVE", label: "Active" },
  { id: "INACTIVE", label: "Inactive" },
  { id: "BLOCKED", label: "Blocked" },
];

const STATE_CODE_OPTIONS = [
  ["01", "Jammu and Kashmir"],
  ["02", "Himachal Pradesh"],
  ["03", "Punjab"],
  ["04", "Chandigarh"],
  ["05", "Uttarakhand"],
  ["06", "Haryana"],
  ["07", "Delhi"],
  ["08", "Rajasthan"],
  ["09", "Uttar Pradesh"],
  ["10", "Bihar"],
  ["11", "Sikkim"],
  ["12", "Arunachal Pradesh"],
  ["13", "Nagaland"],
  ["14", "Manipur"],
  ["15", "Mizoram"],
  ["16", "Tripura"],
  ["17", "Meghalaya"],
  ["18", "Assam"],
  ["19", "West Bengal"],
  ["20", "Jharkhand"],
  ["21", "Odisha"],
  ["22", "Chhattisgarh"],
  ["23", "Madhya Pradesh"],
  ["24", "Gujarat"],
  ["26", "Dadra and Nagar Haveli and Daman and Diu"],
  ["27", "Maharashtra"],
  ["29", "Karnataka"],
  ["30", "Goa"],
  ["31", "Lakshadweep"],
  ["32", "Kerala"],
  ["33", "Tamil Nadu"],
  ["34", "Puducherry"],
  ["35", "Andaman and Nicobar Islands"],
  ["36", "Telangana"],
  ["37", "Andhra Pradesh"],
  ["38", "Ladakh"],
].map(([id, name]) => ({ id, label: `${id} - ${name}` }));

export function CustomersScreen({
  onDirtyChange,
}: {
  onDirtyChange?: (dirty: boolean) => void;
}) {
  const {
    createCustomer,
    createSupplier,
    data,
    error,
    loadCustomerTerms,
    loadSupplierCatalog,
    loadSupplierTerms,
    saveCustomerTerms,
    saveSupplierTerms,
    updateCustomer,
    updateSupplier,
  } = useAppData();
  const [viewHistory, setViewHistory] = useState<PartyView[]>(["customers"]);
  const [partyMode, setPartyMode] = useState<PartyMode>("customer");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [form, setForm] = useState(blankPartyForm);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [customerTerms, setCustomerTerms] = useState<StoreCustomerTerms | null>(null);
  const [supplierTerms, setSupplierTerms] = useState<StoreSupplierTerms | null>(null);
  const [supplierCatalog, setSupplierCatalog] = useState<SupplierCatalog | null>(null);
  const [saving, setSaving] = useState(false);
  const activeView = viewHistory[viewHistory.length - 1] ?? "customers";

  const customers = data.customers.filter((customer) =>
    `${customer.fullName} ${customer.customerCode} ${customer.phone ?? ""}`.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const suppliers = data.suppliers.filter((supplier) =>
    `${supplier.name} ${supplier.supplierCode} ${supplier.phone ?? ""}`.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const selectedCustomer = data.customers.find((entry) => entry.id === selectedId) ?? null;
  const selectedSupplier = data.suppliers.find((entry) => entry.id === selectedId) ?? null;

  useEffect(() => {
    if (activeView === "customers" && selectedCustomer) {
      setForm({
        code: selectedCustomer.customerCode,
        name: selectedCustomer.fullName,
        type: selectedCustomer.customerType || "RETAIL",
        legalName: selectedCustomer.legalName || "",
        tradeName: selectedCustomer.tradeName || "",
        phone: selectedCustomer.phone || "",
        email: selectedCustomer.email || "",
        gstin: selectedCustomer.gstin || "",
        billingAddress: selectedCustomer.billingAddress || "",
        shippingAddress: selectedCustomer.shippingAddress || "",
        state: selectedCustomer.state || "",
        stateCode: selectedCustomer.stateCode || "",
        contactPersonName: selectedCustomer.contactPersonName || "",
        contactPersonPhone: selectedCustomer.contactPersonPhone || "",
        contactPersonEmail: selectedCustomer.contactPersonEmail || "",
        creditLimit: selectedCustomer.creditLimit ? String(selectedCustomer.creditLimit) : "",
        paymentTerms: "",
        notes: selectedCustomer.notes || "",
        status: selectedCustomer.status || "ACTIVE",
      });
      loadCustomerTerms(selectedCustomer.id).then(setCustomerTerms);
    }
  }, [activeView, loadCustomerTerms, selectedCustomer]);

  useEffect(() => {
    if (activeView === "suppliers" && selectedSupplier) {
      setForm({
        code: selectedSupplier.supplierCode,
        name: selectedSupplier.name,
        type: "BUSINESS",
        legalName: selectedSupplier.legalName || "",
        tradeName: selectedSupplier.tradeName || "",
        phone: selectedSupplier.phone || "",
        email: selectedSupplier.email || "",
        gstin: selectedSupplier.gstin || "",
        billingAddress: selectedSupplier.billingAddress || "",
        shippingAddress: selectedSupplier.shippingAddress || "",
        state: selectedSupplier.state || "",
        stateCode: selectedSupplier.stateCode || "",
        contactPersonName: selectedSupplier.contactPersonName || "",
        contactPersonPhone: selectedSupplier.contactPersonPhone || "",
        contactPersonEmail: selectedSupplier.contactPersonEmail || "",
        creditLimit: "",
        paymentTerms: selectedSupplier.paymentTerms || "",
        notes: selectedSupplier.notes || "",
        status: selectedSupplier.status || "ACTIVE",
      });
      loadSupplierTerms(selectedSupplier.id).then(setSupplierTerms);
      loadSupplierCatalog(selectedSupplier.id).then(setSupplierCatalog);
    }
  }, [activeView, loadSupplierCatalog, loadSupplierTerms, selectedSupplier]);

  const selectedParty = useMemo(() => {
    return activeView === "suppliers" ? selectedSupplier : selectedCustomer;
  }, [activeView, selectedCustomer, selectedSupplier]);
  const customerCount = data.customers.length;
  const supplierCount = data.suppliers.length;
  const quickActions = [
    {
      id: "new-customer",
      label: "New customer",
      icon: "person-add-outline" as const,
      description: "Create a new customer profile.",
      onPress: () => {
        setPartyMode("customer");
        navigateViewWithGuard("new");
      },
    },
    {
      id: "new-supplier",
      label: "New supplier",
      icon: "person-add-outline" as const,
      description: "Create a new supplier record.",
      onPress: () => {
        setPartyMode("supplier");
        navigateViewWithGuard("new");
      },
    },
    {
      id: "view-customers",
      label: "View customers",
      icon: "people-outline" as const,
      description: "Open customer master records.",
      onPress: () => navigateViewWithGuard("customers"),
    },
    {
      id: "view-suppliers",
      label: "View suppliers",
      icon: "business-outline" as const,
      description: "Open supplier master records.",
      onPress: () => navigateViewWithGuard("suppliers"),
    },
  ];
  const isFormDirty =
    activeView === "new" &&
    Object.entries(form).some(([key, value]) => {
      const baseline = blankPartyForm[key as keyof typeof blankPartyForm];
      return value !== baseline;
    });

  function navigateView(view: PartyView) {
    setSelectedId(null);
    setCustomerTerms(null);
    setSupplierTerms(null);
    setSupplierCatalog(null);
    setViewHistory((current) => (current[current.length - 1] === view ? current : [...current, view]));
  }

  function confirmDiscard(onConfirm: () => void) {
    Alert.alert("Discard changes?", `You have unsaved ${partyMode === "customer" ? "customer" : "supplier"} form changes on this screen.`, [
      { text: "Keep editing", style: "cancel" },
      { text: "Discard", style: "destructive", onPress: onConfirm },
    ]);
  }

  function navigateViewWithGuard(view: PartyView) {
    if (view === activeView) {
      return;
    }
    if (isFormDirty) {
      confirmDiscard(() => {
        setForm(blankPartyForm);
        navigateView(view);
      });
      return;
    }
    navigateView(view);
  }

  React.useEffect(() => {
    onDirtyChange?.(isFormDirty);
    return () => onDirtyChange?.(false);
  }, [isFormDirty, onDirtyChange]);

  function goBack() {
    if (selectedId != null) {
      setSelectedId(null);
      return;
    }
    if (isFormDirty) {
      confirmDiscard(() => {
        setForm(blankPartyForm);
        setViewHistory((current) => (current.length > 1 ? current.slice(0, -1) : current));
      });
      return;
    }
    setViewHistory((current) => (current.length > 1 ? current.slice(0, -1) : current));
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (partyMode === "customer") {
        await createCustomer({
          customerCode: form.code,
          fullName: form.name,
          customerType: form.type,
          legalName: form.legalName || null,
          tradeName: form.tradeName || null,
          phone: form.phone || null,
          email: form.email || null,
          gstin: form.gstin || null,
          billingAddress: form.billingAddress || null,
          shippingAddress: form.shippingAddress || null,
          state: form.state || null,
          stateCode: form.stateCode || null,
          contactPersonName: form.contactPersonName || null,
          contactPersonPhone: form.contactPersonPhone || null,
          contactPersonEmail: form.contactPersonEmail || null,
          creditLimit: form.creditLimit ? Number(form.creditLimit) : null,
          isPlatformLinked: false,
          notes: form.notes || null,
          status: form.status,
        });
        navigateView("customers");
      } else {
        await createSupplier({
          supplierCode: form.code,
          name: form.name,
          legalName: form.legalName || null,
          tradeName: form.tradeName || null,
          phone: form.phone || null,
          email: form.email || null,
          gstin: form.gstin || null,
          billingAddress: form.billingAddress || null,
          shippingAddress: form.shippingAddress || null,
          state: form.state || null,
          stateCode: form.stateCode || null,
          contactPersonName: form.contactPersonName || null,
          contactPersonPhone: form.contactPersonPhone || null,
          contactPersonEmail: form.contactPersonEmail || null,
          paymentTerms: form.paymentTerms || null,
          isPlatformLinked: false,
          notes: form.notes || null,
          status: form.status,
        });
        navigateView("suppliers");
      }
      setForm(blankPartyForm);
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate() {
    if (!selectedParty) {
      return;
    }
    setSaving(true);
    try {
      if ("customerCode" in selectedParty) {
        await updateCustomer(selectedParty.id, {
          customerCode: form.code,
          fullName: form.name,
          customerType: form.type,
          legalName: form.legalName || null,
          tradeName: form.tradeName || null,
          phone: form.phone || null,
          email: form.email || null,
          gstin: form.gstin || null,
          billingAddress: form.billingAddress || null,
          shippingAddress: form.shippingAddress || null,
          state: form.state || null,
          stateCode: form.stateCode || null,
          contactPersonName: form.contactPersonName || null,
          contactPersonPhone: form.contactPersonPhone || null,
          contactPersonEmail: form.contactPersonEmail || null,
          creditLimit: form.creditLimit ? Number(form.creditLimit) : null,
          isPlatformLinked: false,
          notes: form.notes || null,
          status: form.status,
        });
        if (customerTerms) {
          await saveCustomerTerms(selectedParty.id, customerTerms);
        }
      } else {
        await updateSupplier(selectedParty.id, {
          supplierCode: form.code,
          name: form.name,
          legalName: form.legalName || null,
          tradeName: form.tradeName || null,
          phone: form.phone || null,
          email: form.email || null,
          gstin: form.gstin || null,
          billingAddress: form.billingAddress || null,
          shippingAddress: form.shippingAddress || null,
          state: form.state || null,
          stateCode: form.stateCode || null,
          contactPersonName: form.contactPersonName || null,
          contactPersonPhone: form.contactPersonPhone || null,
          contactPersonEmail: form.contactPersonEmail || null,
          paymentTerms: form.paymentTerms || null,
          isPlatformLinked: false,
          notes: form.notes || null,
          status: form.status,
        });
        if (supplierTerms) {
          await saveSupplierTerms(selectedParty.id, supplierTerms);
        }
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.wrap}>
      <View>
        <Text style={styles.heading}>Parties</Text>
        <Text style={styles.subheading}>Customers and suppliers now follow the dedicated phase 1 party contracts, including terms and supplier catalogs.</Text>
      </View>

      <View style={styles.sheetTriggerRow}>
        <ActionButton label="Quick actions" icon="flash-outline" inverted onPress={() => setShowQuickActions(true)} />
      </View>

      <ActionSheet label="Party quick actions" visible={showQuickActions} onClose={() => setShowQuickActions(false)} actions={quickActions} />

      <View style={styles.summaryRow}>
        <Pill label={`${customerCount} customers`} tone="blue" />
        <Pill label={`${supplierCount} suppliers`} tone="green" />
      </View>

      <View style={styles.actionRow}>
        <ActionButton label="New customer" icon="person-add" inverted onPress={() => { setPartyMode("customer"); navigateViewWithGuard("new"); }} />
        <ActionButton label="New supplier" icon="person-add" inverted onPress={() => { setPartyMode("supplier"); navigateViewWithGuard("new"); }} />
        <ActionButton
          label={activeView === "customers" ? "View suppliers" : "View customers"}
          icon="swap-horizontal"
          inverted
          onPress={() => navigateViewWithGuard(activeView === "customers" ? "suppliers" : "customers")}
        />
      </View>

      {selectedId != null || viewHistory.length > 1 ? <BackButton label={selectedId != null ? "Back to list" : "Back"} onPress={goBack} /> : null}

      <View style={styles.segmentRow}>
        {(["customers", "suppliers", "new"] as const).map((view) => {
          const active = activeView === view;
          return (
            <Pressable key={view} onPress={() => navigateViewWithGuard(view)} style={[styles.segment, active && styles.segmentActive]}>
              <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{view === "new" ? "New Party" : view[0].toUpperCase() + view.slice(1)}</Text>
            </Pressable>
          );
        })}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {activeView === "customers" || activeView === "suppliers" ? (
        <>
          <SectionHeader title={activeView === "customers" ? "Customer masters" : "Supplier masters"} action={`${activeView === "customers" ? data.customers.length : data.suppliers.length} records`} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search by code, name, phone, or email"
            placeholderTextColor={theme.colors.textMuted}
            style={styles.input}
          />
          <View style={styles.cardStack}>
            {(activeView === "customers" ? customers : suppliers).map((party) => (
              <Pressable key={party.id} onPress={() => setSelectedId(party.id)}>
                <GlassCard style={styles.partyCard}>
                  <View style={styles.rowBetween}>
                    <View style={styles.flex}>
                      <Text style={styles.partyName}>{"customerCode" in party ? party.fullName : party.name}</Text>
                      <Text style={styles.partyMeta}>
                        {"customerCode" in party ? party.customerCode : party.supplierCode} • {party.phone || "No phone"} • {party.stateCode || "NA"}
                      </Text>
                    </View>
                    <Pill label={party.status || "ACTIVE"} tone={party.status === "ACTIVE" ? "green" : "orange"} />
                  </View>
                  <Text style={styles.balanceText}>
                    GST {party.gstin || "Not set"} • {party.email || "No email"}
                  </Text>
                </GlassCard>
              </Pressable>
            ))}
          </View>
          {selectedParty ? (
            <GlassCard style={styles.detailCard}>
              <Text style={styles.detailTitle}>{"customerCode" in selectedParty ? selectedParty.fullName : selectedParty.name}</Text>
              <Text style={styles.detailLine}>Code: {"customerCode" in selectedParty ? selectedParty.customerCode : selectedParty.supplierCode}</Text>
              <Text style={styles.detailLine}>Legal name: {selectedParty.legalName || "Not set"}</Text>
              <Text style={styles.detailLine}>Trade name: {selectedParty.tradeName || "Not set"}</Text>
              <Text style={styles.detailLine}>Phone: {selectedParty.phone || "Not set"}</Text>
              <Text style={styles.detailLine}>Email: {selectedParty.email || "Not set"}</Text>
              <Text style={styles.detailLine}>GSTIN: {selectedParty.gstin || "Not set"}</Text>
              <Text style={styles.detailLine}>Billing: {selectedParty.billingAddress || "Not set"}</Text>
              <Text style={styles.detailLine}>Shipping: {selectedParty.shippingAddress || "Not set"}</Text>
              {"customerCode" in selectedParty ? (
                <>
                  <Text style={styles.detailLine}>Credit limit: {formatCurrency(selectedParty.creditLimit ?? 0)}</Text>
                  <Text style={styles.detailLine}>Price tier: {customerTerms?.priceTier || "Not set"}</Text>
                  <Text style={styles.detailLine}>Credit days: {customerTerms?.creditDays ?? 0}</Text>
                </>
              ) : (
                <>
                  <Text style={styles.detailLine}>Payment terms: {selectedParty.paymentTerms || "Not set"}</Text>
                  <Text style={styles.detailLine}>Preferred products: {supplierCatalog?.products.length ?? 0}</Text>
                  <Text style={styles.detailLine}>Contract remarks: {supplierTerms?.remarks || "None"}</Text>
                </>
              )}
              <ActionButton label="Update current party" icon="create" onPress={handleUpdate} />
            </GlassCard>
          ) : null}
        </>
      ) : (
        <GlassCard style={styles.formCard}>
          <Text style={styles.formTitle}>New party</Text>
          <View style={styles.choiceRow}>
            {(["customer", "supplier"] as PartyMode[]).map((mode) => {
              const active = mode === partyMode;
              return (
                <Pressable key={mode} onPress={() => setPartyMode(mode)} style={[styles.choiceChip, active && styles.choiceChipActive]}>
                  <Text style={[styles.choiceText, active && styles.choiceTextActive]}>{mode === "customer" ? "Customer" : "Supplier"}</Text>
                </Pressable>
              );
            })}
          </View>
          {[
            ["Code", "code", "default"],
            [partyMode === "customer" ? "Full name" : "Supplier name", "name", "default"],
            ["Legal name", "legalName", "default"],
            ["Trade name", "tradeName", "default"],
            ["Phone", "phone", "phone-pad"],
            ["Email", "email", "email-address"],
            ["GSTIN", "gstin", "default"],
            ["Billing address", "billingAddress", "default"],
            ["Shipping address", "shippingAddress", "default"],
            ["State", "state", "default"],
            ["Contact person", "contactPersonName", "default"],
            ["Contact phone", "contactPersonPhone", "phone-pad"],
            ["Contact email", "contactPersonEmail", "email-address"],
            [partyMode === "customer" ? "Credit limit" : "Payment terms", partyMode === "customer" ? "creditLimit" : "paymentTerms", partyMode === "customer" ? "numeric" : "default"],
            ["Notes", "notes", "default"],
          ].map(([label, key, keyboardType]) => (
            <TextInput
              key={key}
              value={form[key as keyof typeof form]}
              onChangeText={(value) => setForm((current) => ({ ...current, [key]: value }))}
              placeholder={label}
              placeholderTextColor={theme.colors.textMuted}
              style={styles.input}
              keyboardType={keyboardType as "default"}
            />
          ))}
          <SearchableSelect
            label={partyMode === "customer" ? "Customer type" : "Business type"}
            placeholder="Select party type"
            selectedLabel={PARTY_TYPE_OPTIONS.find((option) => option.id === form.type)?.label}
            options={PARTY_TYPE_OPTIONS}
            onSelect={(id) => setForm((current) => ({ ...current, type: id }))}
          />
          <SearchableSelect
            label="State code"
            placeholder="Select state code"
            selectedLabel={STATE_CODE_OPTIONS.find((option) => option.id === form.stateCode)?.label}
            options={STATE_CODE_OPTIONS}
            onSelect={(id) => setForm((current) => ({ ...current, stateCode: id }))}
          />
          <SearchableSelect
            label="Status"
            placeholder="Select status"
            selectedLabel={PARTY_STATUS_OPTIONS.find((option) => option.id === form.status)?.label}
            options={PARTY_STATUS_OPTIONS}
            onSelect={(id) => setForm((current) => ({ ...current, status: id }))}
          />
          <ActionButton label={saving ? "Saving..." : `Create ${partyMode}`} icon="person-add" onPress={saving ? undefined : handleSave} />
        </GlassCard>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 20 },
  heading: { color: theme.colors.textPrimary, fontSize: 24, fontWeight: "800" },
  subheading: { color: theme.colors.textSecondary, fontSize: 14, lineHeight: 20, fontWeight: "600", marginTop: 6 },
  sheetTriggerRow: { marginBottom: theme.spacing.sm },
  actionRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: theme.spacing.sm },
  segmentRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  segment: { backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.radius.pill, paddingHorizontal: 14, paddingVertical: 10 },
  segmentActive: { backgroundColor: theme.colors.accent },
  summaryRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: theme.spacing.sm },
  segmentText: { color: theme.colors.textSecondary, fontSize: 13, fontWeight: "700" },
  segmentTextActive: { color: "#FFFFFF" },
  input: { minHeight: 54, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.border, paddingHorizontal: 16, color: theme.colors.textPrimary, fontSize: 14, fontWeight: "600", backgroundColor: theme.colors.surfaceMuted },
  cardStack: { gap: 12 },
  partyCard: { gap: 12 },
  detailCard: { gap: 10 },
  formCard: { gap: 12 },
  rowBetween: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", gap: 12 },
  flex: { flex: 1 },
  partyName: { color: theme.colors.textPrimary, fontSize: 16, fontWeight: "800" },
  partyMeta: { color: theme.colors.textSecondary, fontSize: 13, fontWeight: "600", marginTop: 4 },
  balanceText: { color: theme.colors.textSecondary, fontSize: 14, lineHeight: 20, fontWeight: "600" },
  detailTitle: { color: theme.colors.textPrimary, fontSize: 20, fontWeight: "800" },
  detailLine: { color: theme.colors.textSecondary, fontSize: 14, fontWeight: "600", lineHeight: 20 },
  formTitle: { color: theme.colors.textPrimary, fontSize: 18, fontWeight: "800" },
  choiceRow: { flexDirection: "row", gap: 8 },
  choiceChip: { backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.radius.pill, paddingHorizontal: 12, paddingVertical: 9 },
  choiceChipActive: { backgroundColor: theme.colors.surfaceStrong },
  choiceText: { color: theme.colors.textSecondary, fontSize: 12, fontWeight: "700" },
  choiceTextActive: { color: "#FFFFFF" },
  errorText: { color: "#B42318", fontSize: 13, fontWeight: "700", lineHeight: 18 },
});
