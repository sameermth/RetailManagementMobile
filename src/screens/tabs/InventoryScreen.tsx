import React, { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { ActionButton, GlassCard, Pill, SearchableSelect, SectionHeader } from "../../components/Ui";
import { StoreProduct } from "../../data/entities";
import { useAppData } from "../../store/AppDataContext";
import { theme } from "../../theme/theme";
import { formatCurrency } from "../../utils/formatters";

type InventoryView = "catalog" | "tracking" | "balances" | "operations" | "movements";

type InventoryBalance = {
  id: number;
  warehouseId: number;
  productId: number;
  onHandBaseQuantity?: number;
  reservedBaseQuantity?: number;
  availableBaseQuantity?: number;
  avgCost?: number;
};

type SerialNumber = {
  id: number;
  serialNumber: string;
  status?: string;
  currentWarehouseId?: number;
  warrantyEndDate?: string;
};

type InventoryBatch = {
  id: number;
  batchNumber: string;
  expiryOn?: string;
  status?: string;
};

type InventoryReservation = {
  id: number;
  productId: number;
  sourceDocumentType?: string;
  sourceDocumentId?: number;
  reservedBaseQuantity?: number;
  status?: string;
  expiresAt?: string;
};

type StockMovement = {
  id: number;
  warehouseId: number;
  productId: number;
  movementType?: string;
  referenceNumber?: string;
  direction?: string;
  baseQuantity?: number;
  totalCost?: number;
  movementAt?: string;
};

type ProductScanResponse = {
  matchedBy?: string;
  storeProduct?: {
    id: number;
    sku?: string;
    name?: string;
    inventoryTrackingMode?: string;
  };
  serial?: {
    serialNumber?: string;
    status?: string;
  };
  batch?: {
    batchNumber?: string;
    status?: string;
  };
  stock?: {
    onHandBaseQuantity?: number;
    reservedBaseQuantity?: number;
    availableBaseQuantity?: number;
  };
};

const blankForm = {
  productId: "",
  categoryId: "",
  brandId: "",
  baseUomId: "",
  taxGroupId: "",
  sku: "",
  name: "",
  description: "",
  inventoryTrackingMode: "NONE",
  minStockBaseQty: "",
  reorderLevelBaseQty: "",
  defaultSalePrice: "",
};

export function InventoryScreen() {
  const { apiGet, apiPost, createProduct, data, error, refreshing, session } = useAppData();
  const [activeView, setActiveView] = useState<InventoryView>("catalog");
  const [query, setQuery] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);
  const [form, setForm] = useState(blankForm);
  const [saving, setSaving] = useState(false);
  const [scanQuery, setScanQuery] = useState("");
  const [scanResult, setScanResult] = useState<ProductScanResponse | null>(null);
  const [balances, setBalances] = useState<InventoryBalance[]>([]);
  const [serials, setSerials] = useState<SerialNumber[]>([]);
  const [batches, setBatches] = useState<InventoryBatch[]>([]);
  const [reservations, setReservations] = useState<InventoryReservation[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [operationMsg, setOperationMsg] = useState("");
  const [adjustment, setAdjustment] = useState({ productId: "", uomId: "", quantityDelta: "", baseQuantityDelta: "", unitCost: "", reason: "" });
  const [transfer, setTransfer] = useState({ fromWarehouseId: String(session?.warehouseId ?? ""), toWarehouseId: "", productId: "", uomId: "", quantity: "1", baseQuantity: "1" });

  const selectedProduct = data.products.find((item) => item.id === selectedProductId) ?? null;
  const productOptions = data.products.map((product) => ({
    id: String(product.id),
    label: product.name,
    meta: `${product.sku}${product.inventoryTrackingMode ? ` • ${product.inventoryTrackingMode}` : ""}`,
  }));
  const catalogOptions = data.productCatalog.map((product) => ({
    id: String(product.id),
    label: product.name,
    meta: `${product.brandName || "No brand"}${product.categoryName ? ` • ${product.categoryName}` : ""}`,
  }));
  const filteredItems = useMemo(() => {
    const term = query.trim().toLowerCase();
    return data.products.filter((item) => `${item.name} ${item.sku} ${item.inventoryTrackingMode ?? ""}`.toLowerCase().includes(term));
  }, [data.products, query]);

  useEffect(() => {
    if (activeView === "balances" && session?.organizationId && session?.warehouseId) {
      apiGet<InventoryBalance[]>(`/api/erp/inventory-balances/warehouse/${session.warehouseId}`, {
        query: { organizationId: session.organizationId },
      }).then(setBalances).catch(() => setBalances([]));
      apiGet<InventoryReservation[]>("/api/erp/inventory-reservations", {
        query: { organizationId: session.organizationId },
      }).then(setReservations).catch(() => setReservations([]));
    }
  }, [activeView, apiGet, session?.organizationId, session?.warehouseId]);

  useEffect(() => {
    if (activeView === "tracking" && selectedProductId && session?.organizationId) {
      apiGet<SerialNumber[]>(`/api/erp/inventory-tracking/serials/product/${selectedProductId}`, {
        query: { organizationId: session.organizationId },
      }).then(setSerials).catch(() => setSerials([]));
      apiGet<InventoryBatch[]>(`/api/erp/inventory-tracking/batches/product/${selectedProductId}`, {
        query: { organizationId: session.organizationId },
      }).then(setBatches).catch(() => setBatches([]));
    }
  }, [activeView, apiGet, selectedProductId, session?.organizationId]);

  useEffect(() => {
    if (activeView === "movements" && selectedProductId && session?.organizationId) {
      apiGet<StockMovement[]>(`/api/erp/stock-movements/product/${selectedProductId}`, {
        query: { organizationId: session.organizationId },
      }).then(setMovements).catch(() => setMovements([]));
    }
  }, [activeView, apiGet, selectedProductId, session?.organizationId]);

  async function handleSave() {
    setSaving(true);
    try {
      await createProduct({
        productId: form.productId ? Number(form.productId) : null,
        categoryId: Number(form.categoryId),
        brandId: Number(form.brandId),
        baseUomId: Number(form.baseUomId),
        taxGroupId: Number(form.taxGroupId),
        sku: form.sku,
        name: form.name,
        description: form.description || null,
        inventoryTrackingMode: form.inventoryTrackingMode,
        serialTrackingEnabled: form.inventoryTrackingMode === "SERIAL",
        batchTrackingEnabled: form.inventoryTrackingMode === "BATCH",
        expiryTrackingEnabled: false,
        fractionalQuantityAllowed: false,
        minStockBaseQty: form.minStockBaseQty ? Number(form.minStockBaseQty) : null,
        reorderLevelBaseQty: form.reorderLevelBaseQty ? Number(form.reorderLevelBaseQty) : null,
        defaultSalePrice: form.defaultSalePrice ? Number(form.defaultSalePrice) : null,
        isServiceItem: false,
        isActive: true,
      });
      setForm(blankForm);
    } finally {
      setSaving(false);
    }
  }

  async function handleScan() {
    if (!session?.organizationId || !scanQuery.trim()) return;
    try {
      const result = await apiGet<ProductScanResponse>("/api/erp/products/scan", {
        query: { organizationId: session.organizationId, warehouseId: session.warehouseId ?? undefined, query: scanQuery.trim() },
      });
      setScanResult(result);
    } catch {
      setScanResult(null);
    }
  }

  async function handleAdjustment() {
    if (!session?.organizationId || !session?.branchId || !session?.warehouseId) return;
    await apiPost("/api/erp/inventory-operations/adjustments/manual", {
      organizationId: session.organizationId,
      branchId: session.branchId,
      warehouseId: session.warehouseId,
      productId: Number(adjustment.productId),
      uomId: Number(adjustment.uomId),
      quantityDelta: Number(adjustment.quantityDelta),
      baseQuantityDelta: Number(adjustment.baseQuantityDelta),
      unitCost: adjustment.unitCost ? Number(adjustment.unitCost) : null,
      reason: adjustment.reason,
    });
    setOperationMsg("Manual stock adjustment posted.");
  }

  async function handleTransfer() {
    if (!session?.organizationId || !session?.branchId) return;
    await apiPost("/api/erp/inventory-operations/transfers", {
      organizationId: session.organizationId,
      branchId: session.branchId,
      fromWarehouseId: Number(transfer.fromWarehouseId),
      toWarehouseId: Number(transfer.toWarehouseId),
      lines: [
        {
          productId: Number(transfer.productId),
          uomId: Number(transfer.uomId),
          quantity: Number(transfer.quantity),
          baseQuantity: Number(transfer.baseQuantity),
        },
      ],
    });
    setOperationMsg("Stock transfer created.");
  }

  return (
    <View style={styles.wrap}>
      <View>
        <Text style={styles.heading}>Inventory</Text>
        <Text style={styles.subheading}>Catalog, scan, tracking, balances, reservations, stock movements, and manual inventory operations are now part of the mobile app.</Text>
      </View>

      <View style={styles.segmentRow}>
        {(["catalog", "tracking", "balances", "operations", "movements"] as const).map((view) => {
          const active = activeView === view;
          return (
            <Pressable key={view} onPress={() => setActiveView(view)} style={[styles.segment, active && styles.segmentActive]}>
              <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{view[0].toUpperCase() + view.slice(1)}</Text>
            </Pressable>
          );
        })}
      </View>

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      {activeView === "catalog" ? (
        <>
          <SectionHeader title="Store catalog" action={`${data.products.length} products`} />
          <TextInput value={query} onChangeText={setQuery} placeholder="Search by name, SKU, or tracking mode" placeholderTextColor={theme.colors.textMuted} style={styles.input} />
          <View style={styles.cardStack}>
            {filteredItems.map((product) => (
              <Pressable key={product.id} onPress={() => setSelectedProductId(product.id)}>
                <GlassCard style={styles.productCard}>
                  <View style={styles.rowBetween}>
                    <View style={styles.flex}>
                      <Text style={styles.productName}>{product.name}</Text>
                      <Text style={styles.productMeta}>{product.sku} • Product #{product.productId ?? product.id} • UOM {product.baseUomId ?? "-"}</Text>
                    </View>
                    <Pill label={product.inventoryTrackingMode || "NONE"} tone="blue" />
                  </View>
                  <View style={styles.rowBetween}>
                    <Text style={styles.detailLine}>Reorder {product.reorderLevelBaseQty ?? 0}</Text>
                    <Text style={styles.priceText}>{formatCurrency(product.defaultSalePrice ?? 0)}</Text>
                  </View>
                </GlassCard>
              </Pressable>
            ))}
          </View>
          {selectedProduct ? <ProductDetailCard product={selectedProduct} /> : null}
          <SectionHeader title="Create store product" action={`Org ${session?.organizationId ?? "-"}`} />
          <GlassCard style={styles.formCard}>
            <SearchableSelect
              label="Find shared catalog product"
              placeholder="Search catalog products"
              selectedLabel={data.productCatalog.find((product) => String(product.id) === form.productId)?.name}
              options={catalogOptions}
              onSelect={(id) => {
                const product = data.productCatalog.find((entry) => String(entry.id) === id);
                setForm((current) => ({
                  ...current,
                  productId: id,
                  name: product?.name || current.name,
                  description: product?.description || current.description,
                  inventoryTrackingMode: product?.inventoryTrackingMode || current.inventoryTrackingMode,
                  baseUomId: product?.baseUomId ? String(product.baseUomId) : current.baseUomId,
                }));
              }}
            />
            <View style={styles.quickPickWrap}>
              {data.productCatalog.slice(0, 6).map((product) => (
                <Pressable
                  key={product.id}
                  onPress={() => setForm((current) => ({
                    ...current,
                    productId: String(product.id),
                    name: product.name,
                    description: product.description || "",
                    inventoryTrackingMode: product.inventoryTrackingMode || "NONE",
                    baseUomId: product.baseUomId ? String(product.baseUomId) : current.baseUomId,
                  }))}
                  style={styles.quickPick}
                >
                  <Text style={styles.quickPickText} numberOfLines={1}>{product.name}</Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.choiceRow}>
              {["NONE", "SERIAL", "BATCH"].map((mode) => {
                const active = form.inventoryTrackingMode === mode;
                return (
                  <Pressable key={mode} onPress={() => setForm((current) => ({ ...current, inventoryTrackingMode: mode }))} style={[styles.choiceChip, active && styles.choiceChipActive]}>
                    <Text style={[styles.choiceText, active && styles.choiceTextActive]}>{mode}</Text>
                  </Pressable>
                );
              })}
            </View>
            {[
              ["Linked product id", "productId", "numeric"],
              ["Category id", "categoryId", "numeric"],
              ["Brand id", "brandId", "numeric"],
              ["Base UOM id", "baseUomId", "numeric"],
              ["Tax group id", "taxGroupId", "numeric"],
              ["SKU", "sku", "default"],
              ["Product name", "name", "default"],
              ["Description", "description", "default"],
              ["Min stock qty", "minStockBaseQty", "numeric"],
              ["Reorder level qty", "reorderLevelBaseQty", "numeric"],
              ["Default sale price", "defaultSalePrice", "numeric"],
            ].map(([label, key, keyboardType]) => (
              <TextInput key={key} value={form[key as keyof typeof form]} onChangeText={(value) => setForm((current) => ({ ...current, [key]: value }))} placeholder={label} placeholderTextColor={theme.colors.textMuted} style={styles.input} keyboardType={keyboardType === "numeric" ? "numeric" : "default"} />
            ))}
            <ActionButton label={saving ? "Saving..." : "Create product"} icon="cube" onPress={saving ? undefined : handleSave} />
          </GlassCard>
        </>
      ) : null}

      {activeView === "tracking" ? (
        <>
          <SectionHeader title="Product tracking" action="Serials + batches" />
          <SearchableSelect
            label="Find store product"
            placeholder="Search store products"
            selectedLabel={selectedProduct?.name}
            options={productOptions}
            onSelect={(id) => setSelectedProductId(Number(id))}
          />
          <TextInput value={selectedProductId ? String(selectedProductId) : ""} onChangeText={(value) => setSelectedProductId(value ? Number(value) : null)} placeholder="Store product id for tracking lookups" placeholderTextColor={theme.colors.textMuted} style={styles.input} keyboardType="numeric" />
          <GlassCard style={styles.formCard}>
            <TextInput value={scanQuery} onChangeText={setScanQuery} placeholder="Scan query, SKU, batch, or serial" placeholderTextColor={theme.colors.textMuted} style={styles.input} />
            <ActionButton label="Resolve scan" icon="scan" onPress={handleScan} />
            {scanResult ? (
              <>
                <Text style={styles.detailLine}>Matched by: {scanResult.matchedBy || "Unknown"}</Text>
                <Text style={styles.detailLine}>Store product: {scanResult.storeProduct?.name || "-"}</Text>
                <Text style={styles.detailLine}>Serial: {scanResult.serial?.serialNumber || "-"}</Text>
                <Text style={styles.detailLine}>Batch: {scanResult.batch?.batchNumber || "-"}</Text>
                <Text style={styles.detailLine}>Available: {scanResult.stock?.availableBaseQuantity ?? 0}</Text>
              </>
            ) : null}
          </GlassCard>
          <SectionHeader title="Serial numbers" action={`${serials.length} records`} />
          <View style={styles.cardStack}>
            {serials.map((serial) => (
              <GlassCard key={serial.id} style={styles.productCard}>
                <Text style={styles.productName}>{serial.serialNumber}</Text>
                <Text style={styles.productMeta}>{serial.status || "Unknown"} • Warehouse {serial.currentWarehouseId ?? "-"}</Text>
              </GlassCard>
            ))}
          </View>
          <SectionHeader title="Batches" action={`${batches.length} records`} />
          <View style={styles.cardStack}>
            {batches.map((batch) => (
              <GlassCard key={batch.id} style={styles.productCard}>
                <Text style={styles.productName}>{batch.batchNumber}</Text>
                <Text style={styles.productMeta}>{batch.status || "Unknown"} • Expiry {batch.expiryOn || "-"}</Text>
              </GlassCard>
            ))}
          </View>
        </>
      ) : null}

      {activeView === "balances" ? (
        <>
          <SectionHeader title="Warehouse balances" action={`Warehouse ${session?.warehouseId ?? "-"}`} />
          <SearchableSelect
            label="Highlight a product"
            placeholder="Search store products"
            selectedLabel={selectedProduct?.name}
            options={productOptions}
            onSelect={(id) => setSelectedProductId(Number(id))}
          />
          <View style={styles.cardStack}>
            {balances
              .filter((balance) => (selectedProductId ? balance.productId === selectedProductId : true))
              .map((balance) => (
              <GlassCard key={balance.id} style={styles.productCard}>
                <Text style={styles.productName}>Product {balance.productId}</Text>
                <Text style={styles.productMeta}>On hand {balance.onHandBaseQuantity ?? 0} • Reserved {balance.reservedBaseQuantity ?? 0}</Text>
                <Text style={styles.detailLine}>Available {balance.availableBaseQuantity ?? 0} • Avg cost {formatCurrency(balance.avgCost ?? 0)}</Text>
              </GlassCard>
            ))}
          </View>
          <SectionHeader title="Reservations" action={`${reservations.length} active`} />
          <View style={styles.cardStack}>
            {reservations.map((reservation) => (
              <GlassCard key={reservation.id} style={styles.productCard}>
                <Text style={styles.productName}>{reservation.sourceDocumentType || "Reservation"} #{reservation.sourceDocumentId ?? reservation.id}</Text>
                <Text style={styles.productMeta}>Product {reservation.productId} • Qty {reservation.reservedBaseQuantity ?? 0}</Text>
                <Text style={styles.detailLine}>{reservation.status || "ACTIVE"} • Expires {reservation.expiresAt || "-"}</Text>
              </GlassCard>
            ))}
          </View>
        </>
      ) : null}

      {activeView === "operations" ? (
        <>
          <SectionHeader title="Manual adjustment" action="Inventory ops" />
          <GlassCard style={styles.formCard}>
            <SearchableSelect
              label="Find product for adjustment"
              placeholder="Search store products"
              selectedLabel={data.products.find((product) => String(product.id) === adjustment.productId)?.name}
              options={productOptions}
              onSelect={(id) => {
                const product = data.products.find((entry) => String(entry.id) === id);
                setAdjustment((current) => ({
                  ...current,
                  productId: id,
                  uomId: product?.baseUomId ? String(product.baseUomId) : current.uomId,
                }));
              }}
            />
            <View style={styles.quickPickWrap}>
              {data.products.slice(0, 6).map((product) => (
                <Pressable
                  key={`adj-${product.id}`}
                  onPress={() => setAdjustment((current) => ({
                    ...current,
                    productId: String(product.id),
                    uomId: product.baseUomId ? String(product.baseUomId) : current.uomId,
                  }))}
                  style={styles.quickPick}
                >
                  <Text style={styles.quickPickText} numberOfLines={1}>{product.name}</Text>
                </Pressable>
              ))}
            </View>
            {[
              ["Product id", "productId"],
              ["UOM id", "uomId"],
              ["Quantity delta", "quantityDelta"],
              ["Base quantity delta", "baseQuantityDelta"],
              ["Unit cost", "unitCost"],
              ["Reason", "reason"],
            ].map(([label, key]) => (
              <TextInput key={key} value={adjustment[key as keyof typeof adjustment]} onChangeText={(value) => setAdjustment((current) => ({ ...current, [key]: value }))} placeholder={label} placeholderTextColor={theme.colors.textMuted} style={styles.input} />
            ))}
            <ActionButton label="Post adjustment" icon="build" onPress={handleAdjustment} />
          </GlassCard>
          <SectionHeader title="Stock transfer" action="Between warehouses" />
          <GlassCard style={styles.formCard}>
            <SearchableSelect
              label="Find product for transfer"
              placeholder="Search store products"
              selectedLabel={data.products.find((product) => String(product.id) === transfer.productId)?.name}
              options={productOptions}
              onSelect={(id) => {
                const product = data.products.find((entry) => String(entry.id) === id);
                setTransfer((current) => ({
                  ...current,
                  productId: id,
                  uomId: product?.baseUomId ? String(product.baseUomId) : current.uomId,
                }));
              }}
            />
            <View style={styles.quickPickWrap}>
              {data.products.slice(0, 6).map((product) => (
                <Pressable
                  key={`tr-${product.id}`}
                  onPress={() => setTransfer((current) => ({
                    ...current,
                    productId: String(product.id),
                    uomId: product.baseUomId ? String(product.baseUomId) : current.uomId,
                  }))}
                  style={styles.quickPick}
                >
                  <Text style={styles.quickPickText} numberOfLines={1}>{product.name}</Text>
                </Pressable>
              ))}
            </View>
            {[
              ["From warehouse", "fromWarehouseId"],
              ["To warehouse", "toWarehouseId"],
              ["Product id", "productId"],
              ["UOM id", "uomId"],
              ["Quantity", "quantity"],
              ["Base quantity", "baseQuantity"],
            ].map(([label, key]) => (
              <TextInput key={key} value={transfer[key as keyof typeof transfer]} onChangeText={(value) => setTransfer((current) => ({ ...current, [key]: value }))} placeholder={label} placeholderTextColor={theme.colors.textMuted} style={styles.input} />
            ))}
            <ActionButton label="Create transfer" icon="swap-horizontal" onPress={handleTransfer} />
            {operationMsg ? <Text style={styles.helperText}>{operationMsg}</Text> : null}
          </GlassCard>
        </>
      ) : null}

      {activeView === "movements" ? (
        <>
          <SectionHeader title="Stock movements" action="By product" />
          <SearchableSelect
            label="Find product movement history"
            placeholder="Search store products"
            selectedLabel={selectedProduct?.name}
            options={productOptions}
            onSelect={(id) => setSelectedProductId(Number(id))}
          />
          <TextInput value={selectedProductId ? String(selectedProductId) : ""} onChangeText={(value) => setSelectedProductId(value ? Number(value) : null)} placeholder="Store product id for movement history" placeholderTextColor={theme.colors.textMuted} style={styles.input} keyboardType="numeric" />
          <View style={styles.cardStack}>
            {movements.map((movement) => (
              <GlassCard key={movement.id} style={styles.productCard}>
                <Text style={styles.productName}>{movement.referenceNumber || movement.movementType || "Movement"}</Text>
                <Text style={styles.productMeta}>{movement.direction || "NA"} • Warehouse {movement.warehouseId}</Text>
                <Text style={styles.detailLine}>Qty {movement.baseQuantity ?? 0} • Cost {formatCurrency(movement.totalCost ?? 0)} • {movement.movementAt || "-"}</Text>
              </GlassCard>
            ))}
          </View>
          {refreshing ? <Text style={styles.helperText}>Refreshing inventory modules from backend...</Text> : null}
        </>
      ) : null}
    </View>
  );
}

function ProductDetailCard({ product }: { product: StoreProduct }) {
  return (
    <GlassCard style={styles.detailCard}>
      <Text style={styles.formTitle}>{product.name}</Text>
      <Text style={styles.detailLine}>SKU: {product.sku}</Text>
      <Text style={styles.detailLine}>Tracking mode: {product.inventoryTrackingMode || "NONE"}</Text>
      <Text style={styles.detailLine}>Linked master product: {product.productId ?? "Not linked"}</Text>
      <Text style={styles.detailLine}>Category id: {product.categoryId ?? "-"}</Text>
      <Text style={styles.detailLine}>Brand id: {product.brandId ?? "-"}</Text>
      <Text style={styles.detailLine}>Tax group id: {product.taxGroupId ?? "-"}</Text>
      <Text style={styles.detailLine}>UOM id: {product.baseUomId ?? "-"}</Text>
      <Text style={styles.detailLine}>Default sale price: {formatCurrency(product.defaultSalePrice ?? 0)}</Text>
      <Text style={styles.detailLine}>Minimum stock qty: {product.minStockBaseQty ?? 0}</Text>
      <Text style={styles.detailLine}>Reorder level qty: {product.reorderLevelBaseQty ?? 0}</Text>
      <Text style={styles.detailLine}>Description: {product.description || "No description"}</Text>
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 20 },
  heading: { color: theme.colors.textPrimary, fontSize: 24, fontWeight: "800" },
  subheading: { color: theme.colors.textSecondary, fontSize: 14, lineHeight: 20, fontWeight: "600", marginTop: 6 },
  segmentRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  segment: { backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.radius.pill, paddingHorizontal: 14, paddingVertical: 10 },
  segmentActive: { backgroundColor: theme.colors.accent },
  segmentText: { color: theme.colors.textSecondary, fontSize: 13, fontWeight: "700" },
  segmentTextActive: { color: "#FFFFFF" },
  input: { minHeight: 54, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.border, paddingHorizontal: 16, color: theme.colors.textPrimary, fontSize: 14, fontWeight: "600", backgroundColor: theme.colors.surfaceMuted },
  cardStack: { gap: 12 },
  productCard: { gap: 12 },
  rowBetween: { alignItems: "center", flexDirection: "row", justifyContent: "space-between", gap: 12 },
  flex: { flex: 1 },
  productName: { color: theme.colors.textPrimary, fontSize: 16, fontWeight: "800" },
  productMeta: { color: theme.colors.textSecondary, fontSize: 13, fontWeight: "600", marginTop: 4 },
  detailLine: { color: theme.colors.textSecondary, fontSize: 14, fontWeight: "600", lineHeight: 20 },
  priceText: { color: theme.colors.textPrimary, fontSize: 18, fontWeight: "800" },
  detailCard: { gap: 8 },
  formCard: { gap: 12 },
  formTitle: { color: theme.colors.textPrimary, fontSize: 18, fontWeight: "800" },
  helperText: { color: theme.colors.textMuted, fontSize: 13, fontWeight: "600", lineHeight: 18 },
  errorText: { color: "#B42318", fontSize: 13, fontWeight: "700", lineHeight: 18 },
  quickPickWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  quickPick: { backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.radius.pill, paddingHorizontal: 12, paddingVertical: 8 },
  quickPickText: { color: theme.colors.textSecondary, fontSize: 12, fontWeight: "700", maxWidth: 120 },
  choiceRow: { flexDirection: "row", gap: 8, flexWrap: "wrap" },
  choiceChip: { backgroundColor: theme.colors.surfaceMuted, borderRadius: theme.radius.pill, paddingHorizontal: 12, paddingVertical: 9 },
  choiceChipActive: { backgroundColor: theme.colors.surfaceStrong },
  choiceText: { color: theme.colors.textSecondary, fontSize: 12, fontWeight: "700" },
  choiceTextActive: { color: "#FFFFFF" },
});
