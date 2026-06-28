"use client";

import { useEffect, useState } from "react";
import { inventoryAPI, purchaseAPI } from "@/lib/api-service";
import { FaSpinner, FaWarehouse } from "react-icons/fa";

function nowLocalInputValue() {
  const date = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toLocalDateTimeString(input: string) {
  if (!input) return undefined;
  return input.length === 16 ? `${input}:00` : input;
}

export default function CashierStockEntry({
  onSaved,
}: {
  onSaved?: () => Promise<void> | void;
}) {
  const [products, setProducts] = useState<any[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [saving, setSaving] = useState(false);
  const [productId, setProductId] = useState("");
  const [stockDateTime, setStockDateTime] = useState(nowLocalInputValue());
  const [quantity, setQuantity] = useState("1");
  const [totalCost, setTotalCost] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const inventory = await inventoryAPI.getAll();
        const productList = inventory
          .map((item: any) => item.product)
          .filter(Boolean)
          .sort((a: any, b: any) => String(a.name).localeCompare(String(b.name)));
        setProducts(productList);
      } catch (err: any) {
        setError(err.message || "Failed to load products.");
      } finally {
        setLoadingProducts(false);
      }
    };

    loadProducts();
  }, []);

  const submitStock = async () => {
    setError("");
    setMessage("");

    const parsedProductId = Number(productId);
    const parsedQuantity = Number(quantity);
    const parsedTotalCost = Number(totalCost);

    if (!parsedProductId || !stockDateTime || parsedQuantity <= 0 || parsedTotalCost <= 0) {
      setError("Fill product, date, quantity and price spent with valid values.");
      return;
    }

    const selectedProduct = products.find((p: any) => Number(p.id) === parsedProductId);
    const unit = selectedProduct?.type === "WEIGHED" ? "kg" : "pieces";

    try {
      setSaving(true);
      await purchaseAPI.create({
        productId: parsedProductId,
        quantityBought: parsedQuantity,
        unit,
        totalCost: parsedTotalCost,
        purchaseDateTime: toLocalDateTimeString(stockDateTime),
      });

      setMessage("New stock recorded and synced successfully.");
      setProductId("");
      setQuantity("1");
      setTotalCost("");
      if (onSaved) await onSaved();
    } catch (err: any) {
      setError(err.message || "Failed to save stock entry.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="border border-cyan-700/50 rounded-xl p-4 bg-gradient-to-br from-slate-900/90 via-cyan-950/60 to-slate-900/90 space-y-3">
      <div className="flex items-center gap-2 text-cyan-300">
        <FaWarehouse />
        <h3 className="font-semibold text-sm md:text-base">Cashier Stock Intake</h3>
      </div>

      <p className="text-xs text-cyan-100/75">
        Restricted entry: product, stock date, quantity, and price spent only.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-cyan-200/70 mb-1">Product</label>
          <select
            value={productId}
            onChange={(e) => setProductId(e.target.value)}
            disabled={loadingProducts}
            className="w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-white"
          >
            <option value="">Select product</option>
            {products.map((product: any) => (
              <option key={product.id} value={product.id}>
                {product.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs text-cyan-200/70 mb-1">Stock Date & Time</label>
          <input
            type="datetime-local"
            value={stockDateTime}
            onChange={(e) => setStockDateTime(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-white"
          />
        </div>

        <div>
          <label className="block text-xs text-cyan-200/70 mb-1">Quantity</label>
          <input
            type="number"
            min="0.001"
            step="0.001"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-white"
          />
        </div>

        <div>
          <label className="block text-xs text-cyan-200/70 mb-1">Price Spent (Ksh)</label>
          <input
            type="number"
            min="0.01"
            step="0.01"
            value={totalCost}
            onChange={(e) => setTotalCost(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900/70 px-3 py-2 text-sm text-white"
          />
        </div>
      </div>

      <button
        onClick={submitStock}
        disabled={saving || loadingProducts}
        className={`w-full rounded-lg py-2 text-sm font-semibold ${
          saving || loadingProducts
            ? "bg-slate-600 text-slate-200 cursor-not-allowed"
            : "bg-cyan-600 hover:bg-cyan-700 text-white"
        }`}
      >
        {saving ? (
          <span className="inline-flex items-center gap-2">
            <FaSpinner className="animate-spin" /> Saving Stock...
          </span>
        ) : (
          "Save New Stock"
        )}
      </button>

      {error ? <p className="text-xs text-red-400">{error}</p> : null}
      {message ? <p className="text-xs text-emerald-400">{message}</p> : null}
    </section>
  );
}
