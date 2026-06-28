"use client";

import { useEffect, useMemo, useState } from "react";
import { inventoryAPI, orderAPI } from "@/lib/api-service";
import { FaPlus, FaTrash, FaSpinner } from "react-icons/fa";

type ManualLine = {
  productId: string;
  quantity: string;
};

function nowLocalInputValue() {
  const date = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function toLocalDateTimeString(input: string) {
  if (!input) return undefined;
  return input.length === 16 ? `${input}:00` : input;
}

export default function ManualSalesEntry({
  isDarkMode,
  onSaved,
  compact = false,
}: {
  isDarkMode: boolean;
  onSaved?: () => Promise<void> | void;
  compact?: boolean;
}) {
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [saving, setSaving] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [saleDateTime, setSaleDateTime] = useState(nowLocalInputValue());
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "MPESA">("CASH");
  const [lines, setLines] = useState<ManualLine[]>([{ productId: "", quantity: "1" }]);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

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
        setError(err.message || "Failed to load products");
      } finally {
        setLoadingProducts(false);
      }
    };

    loadProducts();
  }, []);

  const theme = {
    card: isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200",
    input: isDarkMode
      ? "bg-gray-900 border-gray-700 text-gray-100"
      : "bg-white border-gray-300 text-gray-900",
    text: {
      primary: isDarkMode ? "text-gray-100" : "text-gray-900",
      secondary: isDarkMode ? "text-gray-400" : "text-gray-600",
      muted: isDarkMode ? "text-gray-500" : "text-gray-500",
    },
  };

  const uniqueSelected = useMemo(() => {
    return new Set(lines.map((l) => l.productId).filter(Boolean));
  }, [lines]);

  const updateLine = (index: number, patch: Partial<ManualLine>) => {
    setLines((prev) => prev.map((line, i) => (i === index ? { ...line, ...patch } : line)));
  };

  const addLine = () => setLines((prev) => [...prev, { productId: "", quantity: "1" }]);

  const removeLine = (index: number) => {
    setLines((prev) => (prev.length > 1 ? prev.filter((_, i) => i !== index) : prev));
  };

  const submit = async () => {
    setError("");
    setMessage("");

    const orderItems = lines
      .filter((l) => l.productId && Number(l.quantity) > 0)
      .map((l) => ({
        productId: Number(l.productId),
        quantity: Number(l.quantity),
      }));

    if (!saleDateTime) {
      setError("Please select the sales date and time.");
      return;
    }

    if (orderItems.length === 0) {
      setError("Add at least one valid product and quantity.");
      return;
    }

    if (orderItems.length !== uniqueSelected.size) {
      setError("Duplicate products are not allowed in the same manual sale entry.");
      return;
    }

    try {
      setSaving(true);
      const order = await orderAPI.create({
        orderItems,
        paymentMethod,
        saleDateTime: toLocalDateTimeString(saleDateTime),
      });

      setMessage(`Manual sale recorded as Order #${order.id}`);
      setLines([{ productId: "", quantity: "1" }]);
      if (onSaved) await onSaved();
    } catch (err: any) {
      setError(err.message || "Failed to record manual sale.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`${theme.card} border rounded-xl ${compact ? "p-3" : "p-4 md:p-5"} space-y-3`}>
      <div className="flex items-center justify-between gap-3">
        <h3 className={`font-semibold ${theme.text.primary} ${compact ? "text-sm" : "text-base md:text-lg"}`}>
          Record Offline/Missed Sale
        </h3>
      </div>

      <p className={`${theme.text.secondary} text-xs md:text-sm`}>
        Add a backdated sale so totals, transactions, and trend charts stay accurate.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className={`block mb-1 text-xs ${theme.text.muted}`}>Sale Date & Time</label>
          <input
            type="datetime-local"
            value={saleDateTime}
            onChange={(e) => setSaleDateTime(e.target.value)}
            className={`w-full rounded-lg border px-3 py-2 text-sm ${theme.input}`}
          />
        </div>

        <div>
          <label className={`block mb-1 text-xs ${theme.text.muted}`}>Payment Method</label>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as "CASH" | "MPESA")}
            className={`w-full rounded-lg border px-3 py-2 text-sm ${theme.input}`}
          >
            <option value="CASH">Cash</option>
            <option value="MPESA">M-Pesa</option>
          </select>
        </div>
      </div>

      <div className="space-y-2">
        {lines.map((line, index) => (
          <div key={index} className="grid grid-cols-12 gap-2 items-center">
            <div className="col-span-8">
              <select
                value={line.productId}
                onChange={(e) => updateLine(index, { productId: e.target.value })}
                disabled={loadingProducts}
                className={`w-full rounded-lg border px-3 py-2 text-sm ${theme.input}`}
              >
                <option value="">Select product</option>
                {products.map((product: any) => (
                  <option key={product.id} value={product.id}>
                    {product.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-3">
              <input
                type="number"
                min="0.001"
                step="0.001"
                value={line.quantity}
                onChange={(e) => updateLine(index, { quantity: e.target.value })}
                className={`w-full rounded-lg border px-3 py-2 text-sm ${theme.input}`}
                placeholder="Qty"
              />
            </div>

            <div className="col-span-1 flex justify-end">
              <button
                onClick={() => removeLine(index)}
                className="p-2 rounded-md text-red-400 hover:bg-red-500/10"
                title="Remove line"
              >
                <FaTrash size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-2">
        <button
          onClick={addLine}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium border border-emerald-500 text-emerald-500 hover:bg-emerald-500/10"
        >
          <FaPlus size={10} />
          Add Product
        </button>

        <button
          onClick={submit}
          disabled={saving || loadingProducts}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold ${
            saving || loadingProducts
              ? "bg-gray-500 cursor-not-allowed text-white"
              : "bg-emerald-600 hover:bg-emerald-700 text-white"
          }`}
        >
          {saving ? <FaSpinner className="animate-spin" /> : null}
          Save Manual Sale
        </button>
      </div>

      {error ? <p className="text-xs text-red-500">{error}</p> : null}
      {message ? <p className="text-xs text-emerald-500">{message}</p> : null}
    </div>
  );
}
