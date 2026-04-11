import React, { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { ActionButton, ActionSheet, BackButton, GlassCard, Pill, SearchableSelect, SectionHeader } from "../../components/Ui";
import { SalesInvoice, SalesOrder, SalesQuote } from "../../data/entities";
import { useAppData } from "../../store/AppDataContext";
import { theme } from "../../theme/theme";
import { formatCurrency } from "../../utils/formatters";

type SalesView = "quotes" | "orders" | "invoices" | "receipts" | "returns" | "recurring" | "new";
type DraftType = "quote" | "order" | "invoice" | "receipt";

type SalesReturnSummary = {
  id: number;
  returnNumber?: string;
  returnDate?: string;
  customerId?: number;
  totalAmount?: number;
  status?: string;
};

type RecurringSalesInvoiceSummary = {
  id: number;
  templateNumber?: string;
  customerId?: number;
  frequency?: string;
  nextRunDate?: string;
  isActive?: boolean;
};

type UomOption = {
  id: number;
  code?: string;
  name?: string;
  isActive?: boolean;
};

type DraftLine = {
  productId: string;
  uomId: string;
  quantity: string;
  baseQuantity: string;
  unitPrice: string;
  taxRate: string;
  discountAmount: string;
};

const emptyLine: DraftLine = {
  productId: "",
  uomId: "",
  quantity: "1",
  baseQuantity: "1",
  unitPrice: "",
  taxRate: "",
  discountAmount: "",
};

const QUOTE_TYPE_OPTIONS = [
  { id: "ESTIMATE", label: "Estimate" },
  { id: "QUOTATION", label: "Quotation" },
];

const PAYMENT_METHOD_OPTIONS = [
  { id: "CASH", label: "Cash" },
  { id: "CARD", label: "Card" },
  { id: "UPI", label: "UPI" },
  { id: "BANK_TRANSFER", label: "Bank Transfer" },
  { id: "CHEQUE", label: "Cheque" },
];

export function PosScreen({
  onDirtyChange,
}: {
  onDirtyChange?: (dirty: boolean) => void;
}) {
  const {
    apiGet,
    convertOrderToInvoice,
    convertQuoteToInvoice,
    convertQuoteToOrder,
    createInvoice,
    createOrder,
    createQuote,
    createReceipt,
    data,
    error,
    loadInvoice,
    loadOrder,
    loadQuote,
    session,
  } = useAppData();
  const [viewHistory, setViewHistory] = useState<SalesView[]>(["quotes"]);
  const [draftType, setDraftType] = useState<DraftType>("quote");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [detail, setDetail] = useState<SalesQuote | SalesOrder | SalesInvoice | null>(null);
  const [saving, setSaving] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [quoteType, setQuoteType] = useState("ESTIMATE");
  const [documentDate, setDocumentDate] = useState(new Date().toISOString().slice(0, 10));
  const [validUntil, setValidUntil] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [placeOfSupplyStateCode, setPlaceOfSupplyStateCode] = useState("27");
  const [remarks, setRemarks] = useState("");
  const [receiptMethod, setReceiptMethod] = useState("UPI");
  const [receiptAmount, setReceiptAmount] = useState("");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [lines, setLines] = useState<DraftLine[]>([{ ...emptyLine }]);
  const [salesReturns, setSalesReturns] = useState<SalesReturnSummary[]>([]);
  const [recurringInvoices, setRecurringInvoices] = useState<RecurringSalesInvoiceSummary[]>([]);
  const [uoms, setUoms] = useState<UomOption[]>([]);
  const activeView = viewHistory[viewHistory.length - 1] ?? "quotes";

  const customerMap = useMemo(() => new Map(data.customers.map((entry) => [entry.id, entry.fullName])), [data.customers]);
  const productMap = useMemo(() => new Map(data.products.map((entry) => [entry.id, entry])), [data.products]);

  const quotes = data.quotes.filter((entry) =>
    `${entry.quoteNumber} ${customerMap.get(entry.customerId) ?? ""} ${entry.status ?? ""}`.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const orders = data.orders.filter((entry) =>
    `${entry.orderNumber} ${customerMap.get(entry.customerId) ?? ""} ${entry.status ?? ""}`.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const invoices = data.invoices.filter((entry) =>
    `${entry.invoiceNumber} ${customerMap.get(entry.customerId) ?? ""} ${entry.status ?? ""}`.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const receipts = data.receipts.filter((entry) =>
    `${entry.receiptNumber} ${customerMap.get(entry.customerId) ?? ""} ${entry.status ?? ""}`.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const filteredReturns = salesReturns.filter((entry) =>
    `${entry.returnNumber ?? ""} ${entry.status ?? ""}`.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const filteredRecurring = recurringInvoices.filter((entry) =>
    `${entry.templateNumber ?? ""} ${entry.frequency ?? ""} ${entry.nextRunDate ?? ""}`.toLowerCase().includes(query.trim().toLowerCase()),
  );
  const quoteDetail = detail && "quoteType" in detail ? detail : null;
  const currentDocumentCount =
    activeView === "quotes"
      ? quotes.length
      : activeView === "orders"
      ? orders.length
      : activeView === "invoices"
      ? invoices.length
      : activeView === "receipts"
      ? receipts.length
      : activeView === "returns"
      ? filteredReturns.length
      : activeView === "recurring"
      ? filteredRecurring.length
      : 0;

  const quickActions = [
    { id: "quotes", label: "View quotes", icon: "document-text-outline" as const, onPress: () => navigateViewWithGuard("quotes") },
    { id: "orders", label: "View orders", icon: "document-outline" as const, onPress: () => navigateViewWithGuard("orders") },
    { id: "invoices", label: "View invoices", icon: "receipt-outline" as const, onPress: () => navigateViewWithGuard("invoices") },
    { id: "receipts", label: "View receipts", icon: "cash-outline" as const, onPress: () => navigateViewWithGuard("receipts") },
    { id: "returns", label: "Sales returns", icon: "return-up-back-outline" as const, onPress: () => navigateViewWithGuard("returns") },
    { id: "recurring", label: "Recurring invoices", icon: "repeat-outline" as const, onPress: () => navigateViewWithGuard("recurring") },
    { id: "new-quote", label: "Create quote", icon: "add-circle-outline" as const, onPress: () => { setDraftType("quote"); navigateViewWithGuard("new"); } },
    { id: "new-order", label: "Create order", icon: "add-circle-outline" as const, onPress: () => { setDraftType("order"); navigateViewWithGuard("new"); } },
    { id: "new-invoice", label: "Create invoice", icon: "add-circle-outline" as const, onPress: () => { setDraftType("invoice"); navigateViewWithGuard("new"); } },
    { id: "new-receipt", label: "Create receipt", icon: "add-circle-outline" as const, onPress: () => { setDraftType("receipt"); navigateViewWithGuard("new"); } },
  ];

  function navigateView(view: SalesView) {
    setSelectedId(null);
    setDetail(null);
    setViewHistory((current) => (current[current.length - 1] === view ? current : [...current, view]));
  }

  function goBack() {
    if (detail || selectedId) {
      setDetail(null);
      setSelectedId(null);
      return;
    }
    if (isDraftDirty) {
      confirmDiscard(() => {
        resetDraft();
        setViewHistory((current) => (current.length > 1 ? current.slice(0, -1) : current));
      });
      return;
    }
    setViewHistory((current) => (current.length > 1 ? current.slice(0, -1) : current));
  }

  async function openDetail(id: number) {
    setSelectedId(id);
    if (activeView === "quotes") {
      setDetail(await loadQuote(id));
    }
    if (activeView === "orders") {
      setDetail(await loadOrder(id));
    }
    if (activeView === "invoices") {
      setDetail(await loadInvoice(id));
    }
  }

  async function handleCreate() {
    setSaving(true);
    try {
      if (draftType === "receipt") {
        await createReceipt({
          customerId: Number(customerId),
          receiptDate: documentDate,
          paymentMethod: receiptMethod,
          referenceNumber: referenceNumber || null,
          amount: Number(receiptAmount),
          remarks: remarks || null,
        });
      } else {
        const mappedLines = lines.map((line) => ({
          productId: Number(line.productId),
          uomId: Number(line.uomId),
          quantity: Number(line.quantity),
          baseQuantity: Number(line.baseQuantity),
          unitPrice: line.unitPrice ? Number(line.unitPrice) : null,
          taxRate: line.taxRate ? Number(line.taxRate) : null,
          discountAmount: line.discountAmount ? Number(line.discountAmount) : null,
        }));
        if (draftType === "quote") {
          await createQuote({
            customerId: Number(customerId),
            quoteType,
            quoteDate: documentDate,
            validUntil: validUntil || null,
            placeOfSupplyStateCode,
            remarks: remarks || null,
            lines: mappedLines,
          });
        }
        if (draftType === "order") {
          await createOrder({
            customerId: Number(customerId),
            orderDate: documentDate,
            placeOfSupplyStateCode,
            remarks: remarks || null,
            lines: mappedLines,
          });
        }
        if (draftType === "invoice") {
          await createInvoice({
            customerId: Number(customerId),
            invoiceDate: documentDate,
            dueDate: dueDate || null,
            placeOfSupplyStateCode,
            remarks: remarks || null,
            lines: mappedLines,
          });
        }
      }
      resetDraft();
      navigateView(draftType === "receipt" ? "receipts" : draftType === "invoice" ? "invoices" : draftType === "order" ? "orders" : "quotes");
    } finally {
      setSaving(false);
    }
  }

  function resetDraft() {
    setCustomerId("");
    setQuoteType("ESTIMATE");
    setDocumentDate(new Date().toISOString().slice(0, 10));
    setValidUntil("");
    setDueDate("");
    setPlaceOfSupplyStateCode("27");
    setRemarks("");
    setReceiptMethod("UPI");
    setReceiptAmount("");
    setReferenceNumber("");
    setLines([{ ...emptyLine }]);
  }

  async function handleConvert() {
    if (!selectedId) {
      return;
    }
    if (activeView === "quotes") {
      if (quoteDetail?.quoteType === "QUOTATION") {
        await convertQuoteToOrder(selectedId, "Converted from mobile workspace");
      } else {
        await convertQuoteToInvoice(selectedId, "Converted from mobile workspace");
      }
    }
    if (activeView === "orders") {
      await convertOrderToInvoice(selectedId, "Converted from mobile workspace");
    }
    setDetail(null);
  }

  const selectedCustomerName = customerMap.get(Number(customerId));
  const customerOptions = data.customers.map((customer) => ({
    id: String(customer.id),
    label: customer.fullName,
    meta: `${customer.customerCode}${customer.phone ? ` • ${customer.phone}` : ""}${customer.state ? ` • ${customer.state}` : ""}`,
  }));
  const uomNameById = new Map(uoms.map((uom) => [uom.id, uom.name || uom.code || `Unit ${uom.id}`]));
  const productOptions = data.products.map((product) => ({
    id: String(product.id),
    label: product.name,
    meta: `${product.sku}${product.baseUomId ? ` • ${uomNameById.get(product.baseUomId) || `Unit ${product.baseUomId}`}` : ""}${product.inventoryTrackingMode ? ` • ${product.inventoryTrackingMode}` : ""}`,
  }));
  const uomOptions = uoms.length
    ? uoms.map((uom) => ({
        id: String(uom.id),
        label: uom.name || uom.code || `Unit ${uom.id}`,
        meta: uom.code ? `Code ${uom.code}` : undefined,
      }))
    : Array.from(
        new Set(data.products.map((product) => product.baseUomId).filter((id): id is number => id != null)),
      ).map((id) => ({
        id: String(id),
        label: `Unit ${id}`,
      }));
  const isDraftDirty =
    activeView === "new" &&
    (
      customerId.trim().length > 0 ||
      validUntil.trim().length > 0 ||
      dueDate.trim().length > 0 ||
      remarks.trim().length > 0 ||
      receiptAmount.trim().length > 0 ||
      referenceNumber.trim().length > 0 ||
      lines.some((line) =>
        line.productId.trim().length > 0 ||
        line.uomId.trim().length > 0 ||
        line.quantity !== emptyLine.quantity ||
        line.baseQuantity !== emptyLine.baseQuantity ||
        line.unitPrice.trim().length > 0 ||
        line.taxRate.trim().length > 0 ||
        line.discountAmount.trim().length > 0,
      )
    );

  function confirmDiscard(onConfirm: () => void) {
    const draftLabel =
      draftType === "receipt"
        ? "customer receipt draft"
        : draftType === "invoice"
          ? "sales invoice draft"
          : draftType === "order"
            ? "sales order draft"
            : "sales quote draft";
    Alert.alert("Discard changes?", `You have unsaved ${draftLabel} changes on this screen.`, [
      { text: "Keep editing", style: "cancel" },
      { text: "Discard", style: "destructive", onPress: onConfirm },
    ]);
  }

  function navigateViewWithGuard(view: SalesView) {
    if (view === activeView) {
      return;
    }
    if (isDraftDirty) {
      confirmDiscard(() => {
        resetDraft();
        navigateView(view);
      });
      return;
    }
    navigateView(view);
  }

  React.useEffect(() => {
    onDirtyChange?.(isDraftDirty);
    return () => onDirtyChange?.(false);
  }, [isDraftDirty, onDirtyChange]);

  useEffect(() => {
    apiGet<UomOption[]>("/api/erp/catalog/uoms")
      .then(setUoms)
      .catch(() => setUoms([]));
  }, [apiGet]);

  useEffect(() => {
    if (!session?.organizationId) {
      return;
    }
    if (activeView === "returns") {
      apiGet<SalesReturnSummary[]>("/api/erp/returns/sales", {
        query: { organizationId: session.organizationId },
      }).then(setSalesReturns).catch(() => setSalesReturns([]));
    }
    if (activeView === "recurring") {
      apiGet<RecurringSalesInvoiceSummary[]>("/api/erp/sales/recurring-invoices", {
        query: { organizationId: session.organizationId },
      }).then(setRecurringInvoices).catch(() => setRecurringInvoices([]));
    }
  }, [activeView, apiGet, session?.organizationId]);

  return (
    <View style={styles.wrap}>
      <View>
        <Text style={styles.heading}>Sales Workspace</Text>
        <Text style={styles.subheading}>Quotes, orders, invoices, receipts, sales returns, recurring invoices, and conversion flows align with the web and backend sales flows.</Text>
      </View>

      <View style={styles.sheetTriggerRow}>
        <ActionButton label="Quick actions" icon="flash-outline" inverted onPress={() => setShowQuickActions(true)} />
      </View>

      <View style={styles.summaryRow}>
        <Pill label={activeView === "new" ? "Draft builder" : `${currentDocumentCount} documents`} tone="blue" />
        <Pill label={`${activeView[0].toUpperCase() + activeView.slice(1)} view`} tone="green" />
      </View>

      <ActionSheet
        label="Sales quick actions"
        visible={showQuickActions}
        onClose={() => setShowQuickActions(false)}
        actions={quickActions}
      />

      {detail || selectedId || viewHistory.length > 1 ? <BackButton label={detail ? "Back to list" : "Back"} onPress={goBack} /> : null}

      <View style={styles.segmentRow}>
        {(["quotes", "orders", "invoices", "receipts", "returns", "recurring", "new"] as const).map((view) => {
          const active = activeView === view;
          return (
            <Pressable key={view} onPress={() => navigateViewWithGuard(view)} style={[styles.segment, active && styles.segmentActive]}>
              <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                {view === "new" ? "New Doc" : view === "recurring" ? "Recurring" : view[0].toUpperCase() + view.slice(1)}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {activeView === "new" ? (
        <GlassCard style={styles.formCard}>
          <Text style={styles.formTitle}>Create sales document</Text>
          <View style={styles.choiceRow}>
            {(["quote", "order", "invoice", "receipt"] as DraftType[]).map((type) => {
              const active = draftType === type;
              return (
                <Pressable key={type} onPress={() => setDraftType(type)} style={[styles.choiceChip, active && styles.choiceChipActive]}>
                  <Text style={[styles.choiceText, active && styles.choiceTextActive]}>{type.toUpperCase()}</Text>
                </Pressable>
              );
            })}
          </View>
          <SearchableSelect
            label="Find customer"
            placeholder="Search customers"
            selectedLabel={selectedCustomerName}
            options={customerOptions}
            onSelect={setCustomerId}
          />
          <View style={styles.quickPickWrap}>
            {data.customers.slice(0, 6).map((customer) => {
              const active = customerId === String(customer.id);
              return (
                <Pressable key={customer.id} onPress={() => setCustomerId(String(customer.id))} style={[styles.quickPick, active && styles.quickPickActive]}>
                  <Text style={[styles.quickPickText, active && styles.quickPickTextActive]} numberOfLines={1}>{customer.fullName}</Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={styles.helperText}>Selected customer: {selectedCustomerName || "Pick a valid customer"}</Text>
          {draftType === "quote" ? (
            <SearchableSelect
              label="Quote type"
              placeholder="Select quote type"
              selectedLabel={QUOTE_TYPE_OPTIONS.find((option) => option.id === quoteType)?.label}
              options={QUOTE_TYPE_OPTIONS}
              onSelect={setQuoteType}
            />
          ) : null}
          <TextInput value={documentDate} onChangeText={setDocumentDate} placeholder="Document date (YYYY-MM-DD)" placeholderTextColor={theme.colors.textMuted} style={styles.input} />
          {draftType === "quote" ? (
            <TextInput value={validUntil} onChangeText={setValidUntil} placeholder="Valid until (YYYY-MM-DD)" placeholderTextColor={theme.colors.textMuted} style={styles.input} />
          ) : null}
          {draftType === "invoice" ? (
            <TextInput value={dueDate} onChangeText={setDueDate} placeholder="Due date (YYYY-MM-DD)" placeholderTextColor={theme.colors.textMuted} style={styles.input} />
          ) : null}
          <TextInput value={placeOfSupplyStateCode} onChangeText={setPlaceOfSupplyStateCode} placeholder="Place of supply state code" placeholderTextColor={theme.colors.textMuted} style={styles.input} />
          <TextInput value={remarks} onChangeText={setRemarks} placeholder="Remarks" placeholderTextColor={theme.colors.textMuted} style={styles.input} />

          {draftType === "receipt" ? (
            <>
              <SearchableSelect
                label="Payment method"
                placeholder="Select payment method"
                selectedLabel={PAYMENT_METHOD_OPTIONS.find((option) => option.id === receiptMethod)?.label}
                options={PAYMENT_METHOD_OPTIONS}
                onSelect={setReceiptMethod}
              />
              <TextInput value={receiptAmount} onChangeText={setReceiptAmount} placeholder="Amount" placeholderTextColor={theme.colors.textMuted} style={styles.input} keyboardType="numeric" />
              <TextInput value={referenceNumber} onChangeText={setReferenceNumber} placeholder="Reference number" placeholderTextColor={theme.colors.textMuted} style={styles.input} />
            </>
          ) : (
            <>
              <SectionHeader title="Document lines" action={`Selected warehouse ${session?.warehouseId ?? "not set"}`} />
              {lines.map((line, index) => (
                <GlassCard key={`line-${index}`} style={styles.lineCard}>
                  <Text style={styles.lineTitle}>Line {index + 1}</Text>
                  <SearchableSelect
                    label={`Find product for line ${index + 1}`}
                    placeholder="Search products"
                    selectedLabel={productMap.get(Number(line.productId))?.name}
                    options={productOptions}
                    onSelect={(id) => {
                      updateLine(index, "productId", id, setLines);
                      const product = productMap.get(Number(id));
                      if (product?.baseUomId) {
                        updateLine(index, "uomId", String(product.baseUomId), setLines);
                      }
                      if (product?.defaultSalePrice != null) {
                        updateLine(index, "unitPrice", String(product.defaultSalePrice), setLines);
                      }
                    }}
                  />
                  <View style={styles.quickPickWrap}>
                    {data.products.slice(0, 6).map((product) => {
                      const active = line.productId === String(product.id);
                      return (
                        <Pressable
                          key={`${index}-${product.id}`}
                          onPress={() => {
                            updateLine(index, "productId", String(product.id), setLines);
                            if (product.baseUomId) {
                              updateLine(index, "uomId", String(product.baseUomId), setLines);
                            }
                            if (product.defaultSalePrice != null) {
                              updateLine(index, "unitPrice", String(product.defaultSalePrice), setLines);
                            }
                          }}
                          style={[styles.quickPick, active && styles.quickPickActive]}
                        >
                          <Text style={[styles.quickPickText, active && styles.quickPickTextActive]} numberOfLines={1}>{product.name}</Text>
                        </Pressable>
                      );
                    })}
                  </View>
                  <SearchableSelect
                    label="Find unit"
                    placeholder="Search units"
                    selectedLabel={line.uomId ? uomNameById.get(Number(line.uomId)) || `Unit ${line.uomId}` : undefined}
                    options={uomOptions}
                    onSelect={(id) => updateLine(index, "uomId", id, setLines)}
                  />
                  <View style={styles.rowBetween}>
                    <TextInput value={line.quantity} onChangeText={(value) => updateLine(index, "quantity", value, setLines)} placeholder="Qty" placeholderTextColor={theme.colors.textMuted} style={[styles.input, styles.halfInput]} keyboardType="numeric" />
                    <TextInput value={line.baseQuantity} onChangeText={(value) => updateLine(index, "baseQuantity", value, setLines)} placeholder="Base qty" placeholderTextColor={theme.colors.textMuted} style={[styles.input, styles.halfInput]} keyboardType="numeric" />
                  </View>
                  <View style={styles.rowBetween}>
                    <TextInput value={line.unitPrice} onChangeText={(value) => updateLine(index, "unitPrice", value, setLines)} placeholder="Unit price" placeholderTextColor={theme.colors.textMuted} style={[styles.input, styles.halfInput]} keyboardType="numeric" />
                    <TextInput value={line.discountAmount} onChangeText={(value) => updateLine(index, "discountAmount", value, setLines)} placeholder="Discount" placeholderTextColor={theme.colors.textMuted} style={[styles.input, styles.halfInput]} keyboardType="numeric" />
                  </View>
                  {draftType === "invoice" ? (
                    <TextInput value={line.taxRate} onChangeText={(value) => updateLine(index, "taxRate", value, setLines)} placeholder="Tax rate" placeholderTextColor={theme.colors.textMuted} style={styles.input} keyboardType="numeric" />
                  ) : null}
                </GlassCard>
              ))}
              <ActionButton label="Add line" inverted icon="add" onPress={() => setLines((current) => [...current, { ...emptyLine }])} />
            </>
          )}
          <ActionButton label={saving ? "Saving..." : `Create ${draftType}`} icon="document-text" onPress={saving ? undefined : handleCreate} />
        </GlassCard>
      ) : (
        <>
          <SectionHeader
            title={
              activeView === "quotes"
                ? "Sales quotes"
                : activeView === "orders"
                ? "Sales orders"
                : activeView === "invoices"
                ? "Sales invoices"
                : activeView === "receipts"
                ? "Customer receipts"
                : activeView === "returns"
                ? "Sales returns"
                : "Recurring invoices"
            }
            action={`${currentDocumentCount} records`}
          />
          <TextInput value={query} onChangeText={setQuery} placeholder="Search by number, customer, or status" placeholderTextColor={theme.colors.textMuted} style={styles.input} />
          <View style={styles.cardStack}>
            {activeView === "quotes"
              ? quotes.map((entry) => (
                  <DocumentCard key={entry.id} title={entry.quoteNumber} subtitle={`${customerMap.get(entry.customerId) ?? "Customer"} • ${entry.quoteDate || "No date"}`} amount={entry.totalAmount ?? 0} status={entry.status || "DRAFT"} onPress={() => openDetail(entry.id)} />
                ))
              : null}
            {activeView === "orders"
              ? orders.map((entry) => (
                  <DocumentCard key={entry.id} title={entry.orderNumber} subtitle={`${customerMap.get(entry.customerId) ?? "Customer"} • ${entry.orderDate || "No date"}`} amount={entry.totalAmount ?? 0} status={entry.status || "OPEN"} onPress={() => openDetail(entry.id)} />
                ))
              : null}
            {activeView === "invoices"
              ? invoices.map((entry) => (
                  <DocumentCard key={entry.id} title={entry.invoiceNumber} subtitle={`${customerMap.get(entry.customerId) ?? "Customer"} • ${entry.invoiceDate || "No date"}`} amount={entry.totalAmount ?? 0} status={entry.status || "OPEN"} onPress={() => openDetail(entry.id)} extra={`Outstanding ${formatCurrency(entry.outstandingAmount ?? 0)}`} />
                ))
              : null}
            {activeView === "receipts"
              ? receipts.map((entry) => (
                  <DocumentCard key={entry.id} title={entry.receiptNumber} subtitle={`${customerMap.get(entry.customerId) ?? "Customer"} • ${entry.receiptDate || "No date"}`} amount={entry.amount ?? 0} status={entry.status || "POSTED"} />
                ))
              : null}
            {activeView === "returns"
              ? filteredReturns.map((entry) => (
                  <DocumentCard
                    key={entry.id}
                    title={entry.returnNumber || `Return ${entry.id}`}
                    subtitle={`${entry.customerId ? customerMap.get(entry.customerId) || "Unknown customer" : "Customer"} • ${entry.returnDate || "No date"}`}
                    amount={entry.totalAmount ?? 0}
                    status={entry.status || "OPEN"}
                  />
                ))
              : null}
            {activeView === "recurring"
              ? filteredRecurring.map((entry) => (
                  <DocumentCard
                    key={entry.id}
                    title={entry.templateNumber || `Template ${entry.id}`}
                    subtitle={`${entry.customerId ? customerMap.get(entry.customerId) || "Unknown customer" : "Customer"} • ${entry.frequency || "No frequency"}`}
                    amount={0}
                    status={entry.isActive ? "ACTIVE" : "INACTIVE"}
                    extra={entry.nextRunDate ? `Next run ${entry.nextRunDate}` : "No run scheduled"}
                  />
                ))
              : null}
          </View>
          {detail ? (
            <GlassCard style={styles.detailCard}>
              <Text style={styles.formTitle}>
                {"quoteNumber" in detail ? detail.quoteNumber : "orderNumber" in detail ? detail.orderNumber : detail.invoiceNumber}
              </Text>
              <Text style={styles.detailLine}>Customer: {customerMap.get(detail.customerId) || "Unknown customer"}</Text>
              <Text style={styles.detailLine}>Warehouse: {detail.warehouseId ? `Warehouse ${detail.warehouseId}` : "Not set"}</Text>
              <Text style={styles.detailLine}>Status: {detail.status || "OPEN"}</Text>
              <Text style={styles.detailLine}>Subtotal: {formatCurrency(detail.subtotal ?? 0)}</Text>
              <Text style={styles.detailLine}>Tax: {formatCurrency(detail.taxAmount ?? 0)}</Text>
              <Text style={styles.detailLine}>Total: {formatCurrency(detail.totalAmount ?? 0)}</Text>
              {"outstandingAmount" in detail ? <Text style={styles.detailLine}>Outstanding: {formatCurrency(detail.outstandingAmount ?? 0)}</Text> : null}
              {detail.lines.map((line, index) => (
                <Text key={`${detail.id}-${index}`} style={styles.detailLine}>
                  {productMap.get(line.productId)?.name || "Unknown product"} {productMap.get(line.productId)?.sku ? `(${productMap.get(line.productId)?.sku})` : ""} • {uomNameById.get(line.uomId) || `Unit ${line.uomId}`} • Qty {line.quantity} • {formatCurrency(line.lineAmount ?? line.unitPrice ?? 0)}
                </Text>
              ))}
              {activeView === "quotes" || activeView === "orders" ? (
                <ActionButton
                  label={activeView === "quotes" ? (quoteDetail?.quoteType === "QUOTATION" ? "Convert to order" : "Convert to invoice") : "Convert to invoice"}
                  icon="swap-horizontal"
                  onPress={handleConvert}
                />
              ) : null}
            </GlassCard>
          ) : null}
        </>
      )}
    </View>
  );
}

function DocumentCard({
  title,
  subtitle,
  amount,
  status,
  onPress,
  extra,
}: {
  title: string;
  subtitle: string;
  amount: number;
  status: string;
  onPress?: () => void;
  extra?: string;
}) {
  return (
    <Pressable onPress={onPress}>
      <GlassCard style={styles.docCard}>
        <View style={styles.rowBetween}>
          <View style={styles.flex}>
            <Text style={styles.docTitle}>{title}</Text>
            <Text style={styles.docMeta}>{subtitle}</Text>
          </View>
          <Pill label={status} tone={status.toUpperCase().includes("DRAFT") || status.toUpperCase().includes("OPEN") ? "orange" : "green"} />
        </View>
        <Text style={styles.docAmount}>{formatCurrency(amount)}</Text>
        {extra ? <Text style={styles.docMeta}>{extra}</Text> : null}
      </GlassCard>
    </Pressable>
  );
}

function updateLine(index: number, key: keyof DraftLine, value: string, setLines: React.Dispatch<React.SetStateAction<DraftLine[]>>) {
  setLines((current) => current.map((line, lineIndex) => (lineIndex === index ? { ...line, [key]: value } : line)));
}

const styles = StyleSheet.create({
  wrap: { gap: 20 },
  heading: { color: theme.colors.textPrimary, fontSize: 24, fontWeight: "800" },
  subheading: { color: theme.colors.textSecondary, fontSize: 14, lineHeight: 20, fontWeight: "600", marginTop: 6 },
  sheetTriggerRow: { marginBottom: theme.spacing.sm },
  summaryRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: theme.spacing.sm },
  segmentRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  segment: { backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.radius.pill, paddingHorizontal: 14, paddingVertical: 10 },
  segmentActive: { backgroundColor: theme.colors.accent },
  segmentText: { color: theme.colors.textSecondary, fontSize: 13, fontWeight: "700" },
  segmentTextActive: { color: "#FFFFFF" },
  input: { minHeight: 54, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.border, paddingHorizontal: 16, color: theme.colors.textPrimary, fontSize: 14, fontWeight: "600", backgroundColor: theme.colors.surfaceMuted },
  formCard: { gap: 12 },
  formTitle: { color: theme.colors.textPrimary, fontSize: 18, fontWeight: "800" },
  choiceRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  choiceChip: { backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.radius.pill, paddingHorizontal: 12, paddingVertical: 9 },
  choiceChipActive: { backgroundColor: theme.colors.surfaceStrong },
  choiceText: { color: theme.colors.textSecondary, fontSize: 12, fontWeight: "700" },
  choiceTextActive: { color: "#FFFFFF" },
  helperText: { color: theme.colors.textMuted, fontSize: 13, fontWeight: "600", lineHeight: 18 },
  cardStack: { gap: 12 },
  docCard: { gap: 10 },
  docTitle: { color: theme.colors.textPrimary, fontSize: 16, fontWeight: "800" },
  docMeta: { color: theme.colors.textSecondary, fontSize: 13, fontWeight: "600", marginTop: 4 },
  docAmount: { color: theme.colors.textPrimary, fontSize: 18, fontWeight: "800" },
  rowBetween: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", gap: 12 },
  flex: { flex: 1 },
  lineCard: { gap: 10 },
  lineTitle: { color: theme.colors.textPrimary, fontSize: 15, fontWeight: "800" },
  halfInput: { flex: 1 },
  detailCard: { gap: 8 },
  detailLine: { color: theme.colors.textSecondary, fontSize: 14, fontWeight: "600", lineHeight: 20 },
  errorText: { color: "#B42318", fontSize: 13, fontWeight: "700", lineHeight: 18 },
  quickPickWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  quickPick: { backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.radius.pill, paddingHorizontal: 12, paddingVertical: 8 },
  quickPickActive: { backgroundColor: theme.colors.surfaceStrong },
  quickPickText: { color: theme.colors.textSecondary, fontSize: 12, fontWeight: "700", maxWidth: 120 },
  quickPickTextActive: { color: "#FFFFFF" },
});
