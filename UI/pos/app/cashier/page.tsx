"use client";

import {
  inventoryAPI,
  orderAPI,
  purchaseAPI,
  productAPI,
  scanAPI,
  type CartItemDto,
  type Product,
} from "@/lib/api-service";
import ManualSalesEntry from "@/app/ManualSalesEntry";
import CashierStockEntry from "@/app/CashierStockEntry";
import { useEffect, useRef, useState } from "react";
import {
  DEFAULT_THERMAL_PRINTER_SETTINGS,
  type ReceiptPayload,
  type ThermalPrinterSettings,
  buildBrowserReceiptHtml,
  buildThermalReceiptText,
  loadThermalPrinterSettings,
  sendRawPrintJob,
} from "@/lib/thermal-print";
import {
  FaBarcode,
  FaCashRegister,
  FaEllipsisH,
  FaMoneyBillWave,
  FaPhone,
  FaPlus,
  FaReceipt,
  FaStore,
  FaShoppingCart,
  FaTimes,
  FaTrash,
  FaUserCircle,
} from "react-icons/fa";

interface CartItem extends Product {
  qty: number;
}

export default function CashierDashboard() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [barcode, setBarcode] = useState("");
  const [activeInput, setActiveInput] = useState<"barcode" | "phone" | "cash">(
    "barcode",
  );
  const [paymentMethod, setPaymentMethod] = useState<"mpesa" | "cash">("mpesa");
  const [phone, setPhone] = useState("");
  const [cashGiven, setCashGiven] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showProducts, setShowProducts] = useState(false);
  const [showPaymentSection, setShowPaymentSection] = useState(true);
  const [quickStats, setQuickStats] = useState({
    monthPurchaseSpend: 0,
  });
  const [printerSettings] = useState<ThermalPrinterSettings>(() =>
    loadThermalPrinterSettings() || DEFAULT_THERMAL_PRINTER_SETTINGS,
  );
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const scannerSectionRef = useRef<HTMLDivElement>(null);
  const manualSalesRef = useRef<HTMLDivElement>(null);
  const stockEntryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInput =
        target.tagName === "INPUT" || target.tagName === "TEXTAREA";

      if (!isInput) {
        barcodeInputRef.current?.focus();
      }
    };

    window.addEventListener("click", handleGlobalClick);
    return () => window.removeEventListener("click", handleGlobalClick);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      setError("No authentication token found. Please login again.");
      return;
    }

    loadInventory();
    loadQuickStats();
  }, []);

  const loadInventory = async () => {
    try {
      setLoading(true);
      setError("");
      const inventoryData = await inventoryAPI.getAll();
      const productList = inventoryData.map((item: any) => item.product);
      setProducts(productList);
    } catch (err: any) {
      console.error("Error loading inventory:", err);
      setError(err.message || "Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const loadQuickStats = async () => {
    try {
      const now = new Date();
      const monthPurchases = await purchaseAPI.getByMonth(
        now.getFullYear(),
        now.getMonth() + 1,
      );
      const spend = monthPurchases.reduce(
        (sum: number, purchase: any) => sum + (Number(purchase.totalCost) || 0),
        0,
      );
      setQuickStats({ monthPurchaseSpend: spend });
    } catch {
      setQuickStats({ monthPurchaseSpend: 0 });
    }
  };

  const jumpToSection = (target: "scanner" | "manual" | "stock") => {
    setShowPaymentSection(true);
    const map = {
      scanner: scannerSectionRef,
      manual: manualSalesRef,
      stock: stockEntryRef,
    };
    map[target].current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSearch = async (keyword: string) => {
    setSearchTerm(keyword);

    if (!keyword.trim()) {
      loadInventory();
      setShowProducts(false);
      return;
    }

    try {
      setError("");
      const results = await productAPI.search(keyword);
      setProducts(results);
      setShowProducts(true);
    } catch (err: any) {
      console.error("Search error:", err);
      setError(err.message || "Search failed");
    }
  };

  const handleScan = async (scannedBarcode: string) => {
    if (!scannedBarcode.trim()) return;

    try {
      setError("");
      const cartItem: CartItemDto = await scanAPI.scan(scannedBarcode);

      const newWeighedItem: CartItem = {
        id: cartItem.productId,
        name: cartItem.productName,
        sellingPrice: cartItem.unitPrice,
        qty: cartItem.quantity,
        code: cartItem.productSku,
        markedPrice: cartItem.unitPrice,
        createdAt: "",
        type: "WEIGHED",
      };

      setCart((prev) => [...prev, newWeighedItem]);

      setBarcode("");
      setSuccess(`Added ${cartItem.productName} (${cartItem.quantity}kg)`);
      setTimeout(() => setSuccess(""), 2000);
    } catch (err: any) {
      setError(err.message || "Scan failed");
      setTimeout(() => setError(""), 3000);
    }
  };

  const total = cart.reduce(
    (sum, item) => sum + item.sellingPrice * item.qty,
    0,
  );

  function handleDialPadInput(value: string) {
    if (activeInput === "barcode") {
      if (value === "clear") {
        setBarcode("");
      } else if (value === "enter") {
        handleScan(barcode);
      } else {
        setBarcode((prev) => prev + value);
      }
    } else if (activeInput === "phone") {
      if (value === "clear") {
        setPhone("");
      } else if (value === "enter") {
        // Validate phone
      } else {
        setPhone((prev) => prev + value);
      }
    } else if (activeInput === "cash") {
      if (value === "clear") {
        setCashGiven("");
      } else if (value === "enter") {
        // Process
      } else {
        setCashGiven((prev) => prev + value);
      }
    }
  }

  function addToCart(product: Product) {
    setCart((prev) => {
      const found = prev.find((item) => item.id === product.id);
      if (found) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item,
        );
      } else {
        return [...prev, { ...product, qty: 1 }];
      }
    });
    setSuccess(`Added ${product.name} to cart`);
    setTimeout(() => setSuccess(""), 2000);
  }

  function changeQty(id: number, change: number) {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.id === id) {
            const step = item.type === "WEIGHED" ? 0.001 : 0.5; // or 1 if you want half-units
            const newQty = Math.round((item.qty + change) * 1000) / 1000;
            if (newQty <= 0) return null;
            return { ...item, qty: newQty };
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  }

  function removeFromCart(id: number) {
    setCart((prev) => prev.filter((item) => item.id !== id));
  }

  const getCashierName = () => {
    try {
      const rawUser = localStorage.getItem("user");
      if (!rawUser) return "Cashier";
      const parsed = JSON.parse(rawUser);
      return parsed?.name?.split(" ")[0] || "Cashier";
    } catch {
      return "Cashier";
    }
  };

  const buildReceiptPayload = (orderId: string | number): ReceiptPayload => {
    const receiptDate = new Date();
    const amountReceived =
      paymentMethod === "cash" ? Number(cashGiven) || total : total;
    const changeAmount = Math.max(0, amountReceived - total);

    return {
      storeName: "ESIT GROCERIES",
      tagline: "Fresh from the Farm",
      address: "Nairobi, Kenya",
      createdAt: receiptDate.toLocaleString(),
      receiptNumber: String(orderId),
      paymentMethod,
      phone: paymentMethod === "mpesa" && phone ? phone : undefined,
      cashierName: getCashierName(),
      items: cart.map((item) => ({
        name: item.name,
        qty: item.qty,
        unitPrice: item.sellingPrice,
        lineTotal: item.sellingPrice * item.qty,
        unitLabel: item.type === "WEIGHED" ? "kg" : "",
      })),
      subtotal: total,
      amountPaid: amountReceived,
      changeAmount,
      total,
    };
  };

  const printReceiptBrowser = (payload: ReceiptPayload) => {
    const printWindow = window.open("", "_blank");

    if (!printWindow) {
      setError("Pop-up blocked! Please allow pop-ups to print receipts.");
      return;
    }

    printWindow.document.write(buildBrowserReceiptHtml(payload));

    printWindow.document.close();
  };

  const printReceipt = async (payload: ReceiptPayload) => {
    if (printerSettings.mode === "browser") {
      printReceiptBrowser(payload);
      return;
    }

    try {
      const rawReceipt = buildThermalReceiptText(payload, printerSettings.paperWidth);
      await sendRawPrintJob(rawReceipt, printerSettings);
    } catch (err: any) {
      if (printerSettings.fallbackToBrowser) {
        printReceiptBrowser(payload);
        setError(
          `Thermal print failed (${err?.message || "unknown error"}). Used browser fallback.`,
        );
        setTimeout(() => setError(""), 5000);
        return;
      }

      setError(
        `Thermal print failed: ${err?.message || "Unable to send print job."}`,
      );
      setTimeout(() => setError(""), 5000);
    }
  };


  const completePayment = async () => {
    if (cart.length === 0) {
      setError("Cart is empty!");
      setTimeout(() => setError(""), 3000);
      return;
    }

    try {
      setError("");
      setLoading(true);

      const orderRequest = {
        orderItems: cart.map((item) => ({
          productId: item.id,
          quantity: item.qty,
        })),
        paymentMethod: paymentMethod.toUpperCase(),
        phoneNumber:
          paymentMethod === "mpesa" ? phone || "254700000000" : undefined,
        amountPaid:
          paymentMethod === "cash" ? Number(cashGiven) || total : total,
      };

      const order = await orderAPI.create(orderRequest);
      const receiptPayload = buildReceiptPayload(order.id);

      setSuccess(`Payment completed! Order #${order.id}`);

      await printReceipt(receiptPayload);

      // Clear cart and reset
      setCart([]);
      setPhone("");
      setCashGiven("");
      setBarcode("");
      setSearchTerm("");
      setShowProducts(false);

      await loadInventory();

      setTimeout(() => setSuccess(""), 3000);
    } catch (err: any) {
      console.log("[DEBUG] Caught error:", {
        name: err.name,
        status: err.status,
        statusCode: err.statusCode,
        message: err.message,
      });

      if (err.status === "INSUFFICIENT_STOCK") {
        setError(`Not enough stock — ${err.message}`);
      } else if (err.statusCode === 401 || err.statusCode === 403) {
        setError("Authentication failed. Please login again.");
        setTimeout(() => {
          window.location.href = "/login";
        }, 3000);
      } else if (err.status === "VALIDATION_FAILED") {
        setError("Invalid input: " + err.message);
      } else if (err.status === "INVALID_OPERATION") {
        setError(err.message || "Cannot perform this operation.");
      } else {
        setError(err.message || "Payment failed. Please try again.");
      }

      setTimeout(() => setError(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-gray-900 fixed inset-0 overflow-hidden">
      {/* Header - Fixed Height */}
      <header className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-900 border-b border-emerald-700/50 shadow-xl h-20 flex items-center">
        <div className="px-6 py-4 w-full">
          <div className="flex items-center justify-between">
            {/* Left: Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl flex items-center justify-center shadow-lg">
                  <FaCashRegister className="text-2xl text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">POS</span>
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-wide">
                  ESIT GROCERIES
                </h1>
                <p className="text-emerald-200 text-sm">Point of Sale System</p>
              </div>
            </div>

            {/* Center: Search - Improved */}
            <div className="flex-1 max-w-xl mx-8">
              <div className="relative">
                <input
                  ref={barcodeInputRef}
                  type="text"
                  placeholder="Search products by name, code, or scan barcode..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-emerald-900/70 border-2 border-emerald-600/40 rounded-xl text-white placeholder-emerald-300 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/40 shadow-lg"
                />
              </div>
            </div>

            {/* Right: User & Actions */}
            <div className="flex items-center space-x-4">
              <div className="text-right hidden md:block">
                <p className="text-sm text-emerald-200">Cashier Session</p>
                <p className="font-semibold text-white">Active</p>
              </div>
              <div className="h-10 w-px bg-emerald-700/50"></div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <FaUserCircle className="h-5 w-5" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content - Fills Remaining Height */}
      <div className="h-[calc(100vh-80px)] flex flex-col">
        <div className="px-4 lg:px-6 py-3 bg-gradient-to-r from-gray-900 via-emerald-950/30 to-cyan-950/20 border-b border-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              onClick={() => jumpToSection("scanner")}
              className="text-left rounded-xl border border-emerald-800/50 bg-emerald-950/25 px-4 py-3 hover:border-emerald-600 transition-colors"
            >
              <p className="text-xs text-emerald-200/80">Section</p>
              <p className="text-sm font-semibold text-white mt-1">Barcode & Checkout</p>
            </button>
            <button
              onClick={() => jumpToSection("manual")}
              className="text-left rounded-xl border border-amber-800/50 bg-amber-950/20 px-4 py-3 hover:border-amber-600 transition-colors"
            >
              <p className="text-xs text-amber-200/80">Section</p>
              <p className="text-sm font-semibold text-white mt-1">Manual Offline Sale</p>
            </button>
            <button
              onClick={() => jumpToSection("stock")}
              className="text-left rounded-xl border border-cyan-800/50 bg-cyan-950/20 px-4 py-3 hover:border-cyan-600 transition-colors"
            >
              <p className="text-xs text-cyan-200/80">Section</p>
              <p className="text-sm font-semibold text-white mt-1">New Stock Intake</p>
            </button>
          </div>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row">
        {/* Left Panel - Products & Cart */}
        <div className="flex-1 flex flex-col lg:flex-row p-4 lg:p-6 space-y-4 lg:space-y-0 lg:space-x-6">
          {/* Products Panel */}
          <div className="lg:w-2/3 flex flex-col">
            {/* Products Search Results */}
            {showProducts && searchTerm && (
              <div className="mb-4 bg-gray-800 rounded-2xl border border-gray-700 shadow-xl overflow-hidden">
                <div className="p-4 border-b border-gray-700 bg-gray-900/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-emerald-900/70 rounded-lg"></div>
                      <div>
                        <h3 className="font-bold text-white">Search Results</h3>
                        <p className="text-sm text-gray-400">
                          {products.length} products found
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setShowProducts(false);
                        setSearchTerm("");
                        loadInventory();
                      }}
                      className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
                    >
                      <FaTimes className="h-5 w-5 text-gray-400" />
                    </button>
                  </div>
                </div>
                <div className="p-4 max-h-96 overflow-y-auto bg-gray-900/30">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {products.map((product) => (
                      <div
                        key={product.id}
                        onClick={() => addToCart(product)}
                        className="group relative bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-xl p-4 cursor-pointer transition-all duration-300 hover:border-emerald-500 hover:shadow-2xl hover:-translate-y-1"
                      >
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <FaPlus className="h-4 w-4 text-emerald-400" />
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-emerald-900 to-emerald-800 rounded-lg flex items-center justify-center shadow-md">
                            <span className="text-2xl">📦</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-white text-sm truncate">
                              {product.name}
                            </h4>
                            <p className="text-xs text-gray-400 mt-1 truncate">
                              {product.code}
                            </p>
                            <div className="mt-2 flex items-center justify-between">
                              <span className="text-emerald-400 font-bold">
                                Ksh {product.sellingPrice.toFixed(2)}
                              </span>
                              <span
                                className={`text-xs px-2 py-1 rounded-full ${product.type === "WEIGHED" ? "bg-blue-900/50 text-blue-300" : "bg-purple-900/50 text-purple-300"}`}
                              >
                                {product.type === "WEIGHED"
                                  ? "Weighed"
                                  : "Fixed"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Cart Items - Enhanced */}
            <div className="flex-1 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 shadow-2xl overflow-hidden flex flex-col">
              <div className="p-6 border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-gradient-to-br from-emerald-900 to-emerald-800 rounded-xl shadow-md">
                      <FaShoppingCart className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">
                        Shopping Cart
                      </h2>
                      <p className="text-sm text-gray-400">
                        Manage items and quantities
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-emerald-400">
                      Ksh {total.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-400">
                      {cart.length} items
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto bg-gray-900/30">
                {loading && cart.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
                      <p className="mt-4 text-gray-400">Loading products...</p>
                    </div>
                  </div>
                ) : cart.length === 0 ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-24 h-24 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-gray-700 shadow-lg">
                        <FaShoppingCart className="h-12 w-12 text-gray-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-300 mb-2">
                        Your cart is empty
                      </h3>
                      <p className="text-gray-500">
                        Scan or search products to add items
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-700/70">
                    {cart.map((item) => (
                      <div
                        key={item.id}
                        className="p-4 hover:bg-gray-800/40 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="relative">
                              <div className="w-12 h-12 bg-gradient-to-br from-emerald-900/60 to-emerald-800/60 rounded-lg flex items-center justify-center shadow-md">
                                <span className="text-xl">📦</span>
                              </div>
                              {item.type === "WEIGHED" && (
                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center shadow-md">
                                  <span className="text-xs font-bold text-white">
                                    W
                                  </span>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-white truncate">
                                {item.name}
                              </h4>
                              <p className="text-sm text-gray-400 truncate">
                                {item.code}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center space-x-6">
                            {/* Quantity Controls */}
                            <div className="flex items-center space-x-3">
                              <button
                                onClick={() => changeQty(item.id, -0.25)}
                                className="w-8 h-8 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors shadow-sm"
                              >
                                <span className="text-white font-bold">-</span>
                              </button>

                              <div className="text-center min-w-16">
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0.01"
                                  value={item.qty}
                                  onChange={(e) => {
                                    const val = parseFloat(e.target.value);
                                    if (!isNaN(val) && val > 0) {
                                      setCart((prev) =>
                                        prev.map((c) =>
                                          c.id === item.id
                                            ? { ...c, qty: val }
                                            : c,
                                        ),
                                      );
                                    }
                                  }}
                                  className="w-16 text-center bg-gray-700 text-white rounded-lg py-1 text-lg font-bold border border-gray-600 focus:border-emerald-500 focus:outline-none"
                                />
                                <div className="text-xs text-gray-400">
                                  {item.type === "WEIGHED" ? "kg" : "pcs"}
                                </div>
                              </div>

                              <button
                                onClick={() => changeQty(item.id, 0.25)}
                                className="w-8 h-8 flex items-center justify-center bg-emerald-700 hover:bg-emerald-600 rounded-lg transition-colors shadow-sm"
                              >
                                <span className="text-white font-bold">+</span>
                              </button>
                            </div>

                            {/* Price and Total */}
                            <div className="text-right">
                              <div className="text-sm text-gray-400">
                                Ksh {item.sellingPrice.toFixed(2)}
                              </div>
                              <div className="text-lg font-bold text-emerald-400">
                                Ksh {(item.sellingPrice * item.qty).toFixed(2)}
                              </div>
                            </div>

                            {/* Remove Button */}
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="p-2 hover:bg-red-900/30 rounded-lg transition-colors group"
                            >
                              <FaTrash className="h-4 w-4 text-gray-400 group-hover:text-red-400" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Total Bar - Enhanced */}
              {cart.length > 0 && (
                <div className="bg-gradient-to-r from-emerald-900 to-emerald-800 border-t border-emerald-700/50 p-6">
                  <div className="flex justify-between items-center">
                    <div className="text-white">
                      <div className="text-sm text-emerald-200 font-medium mb-1">
                        TOTAL AMOUNT
                      </div>
                      <div className="text-3xl font-bold">
                        Ksh {total.toFixed(2)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-emerald-200 mb-1">
                        READY TO CHECKOUT
                      </div>
                      <div className="text-white font-medium">
                        {cart.length} items in cart
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Payment - Enhanced */}
          <div
            className={`lg:w-1/3 transition-all duration-300 ${showPaymentSection ? "block" : "hidden lg:block"}`}
          >
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 shadow-2xl h-full flex flex-col overflow-hidden">
              {/* Payment Header */}
              <div className="p-6 border-b border-gray-700 bg-gradient-to-r from-gray-800 to-gray-900 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-gradient-to-br from-emerald-900 to-emerald-800 rounded-xl shadow-md">
                      <FaReceipt className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Payment</h2>
                      <p className="text-sm text-gray-400">
                        Complete transaction
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowPaymentSection(!showPaymentSection)}
                    className="lg:hidden p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
                  >
                    <FaTimes className="h-5 w-5 text-gray-400" />
                  </button>
                </div>
              </div>

              {/* Payment Content - SCROLLABLE */}
              <div className="p-6 space-y-6 overflow-y-auto flex-1">
                <div className="rounded-xl border border-emerald-700/40 bg-gradient-to-r from-emerald-900/40 to-slate-900/60 p-3">
                  <p className="text-xs text-emerald-200/80">Quick Access</p>
                  <div className="mt-2 grid grid-cols-3 gap-2">
                    <button
                      onClick={() => jumpToSection("scanner")}
                      className="rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 p-2 text-[11px] text-white"
                    >
                      Scan
                    </button>
                    <button
                      onClick={() => jumpToSection("manual")}
                      className="rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 p-2 text-[11px] text-white"
                    >
                      Manual Sale
                    </button>
                    <button
                      onClick={() => jumpToSection("stock")}
                      className="rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 p-2 text-[11px] text-white"
                    >
                      New Stock
                    </button>
                  </div>
                </div>

                {/* Barcode Scanner - Enhanced */}
                <div ref={scannerSectionRef}>
                  <label className="block text-sm font-semibold text-gray-300 mb-2 flex items-center space-x-2">
                    <FaBarcode className="h-4 w-4 text-emerald-400" />
                    <span>Barcode Scanner</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={barcode}
                      onChange={(e) => setBarcode(e.target.value)}
                      onFocus={() => setActiveInput("barcode")}
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleScan(barcode)
                      }
                      placeholder="Scan or enter barcode"
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-900/70 border-2 border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/40 shadow-inner"
                    />
                    <button
                      onClick={() => handleScan(barcode)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-emerald-700 hover:bg-emerald-600 rounded-lg transition-colors shadow-md"
                    ></button>
                  </div>
                </div>

                {/* Payment Method - Enhanced */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">
                    Payment Method
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setPaymentMethod("mpesa")}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 shadow-md ${
                        paymentMethod === "mpesa"
                          ? "border-emerald-500 bg-emerald-900/40 shadow-emerald-900/30"
                          : "border-gray-700 bg-gray-800/50 hover:border-emerald-500/50 hover:bg-emerald-900/20"
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <div
                          className={`p-3 rounded-lg shadow-md ${paymentMethod === "mpesa" ? "bg-emerald-800" : "bg-gray-700"}`}
                        >
                          <FaPhone className="h-6 w-6 text-white" />
                        </div>
                        <span className="font-semibold text-white">M-Pesa</span>
                        <span className="text-xs text-gray-400">
                          Mobile Money
                        </span>
                      </div>
                    </button>
                    <button
                      onClick={() => setPaymentMethod("cash")}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 shadow-md ${
                        paymentMethod === "cash"
                          ? "border-emerald-500 bg-emerald-900/40 shadow-emerald-900/30"
                          : "border-gray-700 bg-gray-800/50 hover:border-emerald-500/50 hover:bg-emerald-900/20"
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <div
                          className={`p-3 rounded-lg shadow-md ${paymentMethod === "cash" ? "bg-emerald-800" : "bg-gray-700"}`}
                        >
                          <FaMoneyBillWave className="h-6 w-6 text-white" />
                        </div>
                        <span className="font-semibold text-white">Cash</span>
                        <span className="text-xs text-gray-400">
                          Physical Payment
                        </span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Payment Input - Enhanced */}
                <div>
                  {paymentMethod === "mpesa" ? (
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Phone Number (Optional)
                      </label>
                      <div className="relative">
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          onFocus={() => setActiveInput("phone")}
                          placeholder="07XXXXXXXX"
                          className="w-full pl-12 pr-4 py-3.5 bg-gray-900/70 border-2 border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/40 shadow-inner"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Amount Received
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={cashGiven}
                          onChange={(e) => setCashGiven(e.target.value)}
                          onFocus={() => setActiveInput("cash")}
                          placeholder="Enter amount"
                          className="w-full pl-12 pr-4 py-3.5 bg-gray-900/70 border-2 border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/40 shadow-inner"
                        />
                      </div>
                      {cashGiven && Number(cashGiven) > 0 && (
                        <div className="mt-3 p-4 bg-gradient-to-r from-emerald-900/40 to-emerald-800/40 rounded-xl border border-emerald-700/50 shadow-md">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="text-sm text-emerald-300 font-semibold">
                                Change Due
                              </div>
                              <div className="text-xs text-emerald-200">
                                Amount to return
                              </div>
                            </div>
                            <div className="text-2xl font-bold text-emerald-400">
                              Ksh{" "}
                              {Math.max(0, Number(cashGiven) - total).toFixed(
                                2,
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Dial Pad - Enhanced */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">
                    Quick Input
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                      <button
                        key={n}
                        onClick={() => handleDialPadInput(n.toString())}
                        className="aspect-square flex items-center justify-center bg-gray-800/70 hover:bg-emerald-900/40 border border-gray-700 hover:border-emerald-500/50 rounded-xl text-xl font-bold text-white transition-all duration-200 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
                      >
                        {n}
                      </button>
                    ))}
                    <button
                      onClick={() => handleDialPadInput("clear")}
                      className="aspect-square flex items-center justify-center bg-red-900/40 hover:bg-red-800/40 border border-red-700/50 hover:border-red-500/50 rounded-xl text-sm font-semibold text-red-300 transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      Clear
                    </button>
                    <button
                      onClick={() => handleDialPadInput("0")}
                      className="aspect-square flex items-center justify-center bg-gray-800/70 hover:bg-emerald-900/40 border border-gray-700 hover:border-emerald-500/50 rounded-xl text-xl font-bold text-white transition-all duration-200 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
                    >
                      0
                    </button>
                    <button
                      onClick={() => handleDialPadInput("enter")}
                      className="aspect-square flex items-center justify-center bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 border border-emerald-500/50 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                    >
                      Enter
                    </button>
                  </div>
                </div>

                <div ref={manualSalesRef}>
                  <ManualSalesEntry
                    isDarkMode={true}
                    compact={true}
                    onSaved={async () => {
                      await loadInventory();
                      await loadQuickStats();
                      setSuccess("Manual sale recorded and synced.");
                      setTimeout(() => setSuccess(""), 3000);
                    }}
                  />
                </div>

                <div ref={stockEntryRef}>
                  <CashierStockEntry
                    onSaved={async () => {
                      await loadInventory();
                      await loadQuickStats();
                      setSuccess("New stock saved and synced with Admin purchases/reports.");
                      setTimeout(() => setSuccess(""), 3500);
                    }}
                  />
                  <div className="mt-2 rounded-lg border border-cyan-800/40 bg-cyan-950/20 px-3 py-2 text-xs text-cyan-200/85 flex items-center justify-between">
                    <span className="inline-flex items-center gap-1">
                      <FaStore className="text-cyan-300" />
                      Cashier month stock spend
                    </span>
                    <span className="font-semibold text-cyan-100">
                      Ksh {quickStats.monthPurchaseSpend.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Complete Payment Button - Enhanced */}
                <div className="pt-4">
                  <button
                    onClick={completePayment}
                    disabled={loading || cart.length === 0}
                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-xl hover:shadow-2xl ${
                      loading || cart.length === 0
                        ? "bg-gray-700 cursor-not-allowed text-gray-500 shadow-inner"
                        : "bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 hover:from-emerald-700 hover:via-emerald-600 hover:to-emerald-700 text-white"
                    }`}
                  >
                    {loading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Processing Payment...</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center space-x-2">
                        <FaReceipt className="h-5 w-5" />
                        <span>Complete Payment</span>
                      </div>
                    )}
                  </button>
                </div>

                {/* Mobile Toggle Button */}
                <button
                  onClick={() => setShowPaymentSection(!showPaymentSection)}
                  className="lg:hidden w-full py-3 bg-gray-800/70 hover:bg-gray-700/70 rounded-xl border border-gray-700 text-gray-400 font-semibold transition-colors shadow-md"
                >
                  {showPaymentSection ? "Hide Payment" : "Show Payment"}
                </button>
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Notifications - Fixed Position */}
      {error && (
        <div className="fixed top-24 right-4 z-50 animate-slide-in-right">
          <div className="bg-gradient-to-r from-red-900 to-red-800 border border-red-700/50 rounded-xl p-4 shadow-2xl max-w-sm">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-800/50 rounded-lg">
                <FaTimes className="h-5 w-5 text-red-300" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white">Error</p>
                <p className="text-sm text-red-200">{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="fixed top-24 right-4 z-50 animate-slide-in-right">
          <div className="bg-gradient-to-r from-emerald-900 to-emerald-800 border border-emerald-700/50 rounded-xl p-4 shadow-2xl max-w-sm">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-emerald-800/50 rounded-lg">
                <FaReceipt className="h-5 w-5 text-emerald-300" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-white">Success</p>
                <p className="text-sm text-emerald-200">{success}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Payment Toggle */}
      {!showPaymentSection && (
        <button
          onClick={() => setShowPaymentSection(true)}
          className="lg:hidden fixed bottom-4 right-4 z-40 p-4 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300"
        >
          <FaEllipsisH className="h-6 w-6 text-white" />
        </button>
      )}
    </div>
  );
}
