"use client";

import { useState, useEffect, useCallback } from "react";
import { inventoryAPI, orderAPI, productAPI } from "@/lib/api-service";
import { useRouter } from "next/navigation";
import { 
  FaChartLine, 
  FaBox, 
  FaReceipt, 
  FaSearch, 
  FaEdit, 
  FaTrash, 
  FaPlus, 
  FaArrowUp, 
  FaArrowDown,
  FaDollarSign,
  FaShoppingCart,
  FaChartBar,
  FaClock,
  FaSignOutAlt,
  FaUserCircle,
  FaBars,
  FaTimes,
  FaSpinner,
  FaMoon,
  FaSun,
  FaChevronLeft,
  FaChevronRight
} from "react-icons/fa";

// --- Dashboard Section (Mobile Optimized) ---
function DashboardSection({ isDarkMode }: { isDarkMode: boolean }) {
  const [stats, setStats] = useState({
    todaySales: 0,
    monthSales: 0,
    orderCount: 0,
    avgOrderValue: 0,
    topProducts: [] as any[],
    recentOrders: [] as any[]
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStats = async () => {
      try {
        const today = await orderAPI.getTodayTotal();
        const orders = await orderAPI.getAll();
        const monthly = await orderAPI.getMonthlyTotal(); 
        const topProd = await orderAPI.getTopSelling();
        const recentOrders = orders.slice(0, 5);

        const totalValue = orders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);

        setStats({
          todaySales: today || 0,
          monthSales: monthly || 0,
          orderCount: orders.length,
          avgOrderValue: orders.length > 0 ? totalValue / orders.length : 0,
          topProducts: topProd || [],
          recentOrders: recentOrders
        });
      } catch (err) {
        console.error("Stats load failed", err);
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, []);

  const themeClasses = {
    background: isDarkMode ? "bg-gray-900" : "bg-gray-50",
    text: {
      primary: isDarkMode ? "text-gray-100" : "text-gray-900",
      secondary: isDarkMode ? "text-gray-400" : "text-gray-600",
      muted: isDarkMode ? "text-gray-500" : "text-gray-500"
    },
    card: isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100",
    hover: isDarkMode ? "hover:bg-gray-750" : "hover:bg-gray-50"
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <FaSpinner className="h-12 w-12 text-emerald-500 animate-spin mx-auto mb-4" />
          <h3 className={`text-lg font-semibold ${themeClasses.text.primary}`}>Loading Dashboard...</h3>
          <p className={themeClasses.text.muted}>Fetching your store statistics</p>
        </div>
      </div>
    );
  }

  return (
    <section className="h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-2xl md:text-3xl font-bold ${themeClasses.text.primary}`}>Dashboard</h2>
          <div className={`text-sm ${themeClasses.text.muted} hidden md:block`}>
            {new Date().toLocaleDateString()}
          </div>
        </div>
        <p className={`${themeClasses.text.secondary} text-sm md:text-base`}>
          Welcome back! Here's what's happening with your store today.
        </p>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto space-y-6 pb-4">
        {/* Stats Grid - Mobile: 2 columns, Desktop: 4 columns */}
        <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard 
            title="Today" 
            value={`Ksh ${stats.todaySales.toLocaleString()}`} 
            icon={<FaDollarSign className="text-emerald-600" />}
            trend="up"
            color="emerald"
            isDarkMode={isDarkMode}
            compact={true}
          />
          <StatCard 
            title="Monthly" 
            value={`Ksh ${stats.monthSales.toLocaleString()}`} 
            icon={<FaChartBar className="text-blue-600" />}
            trend="up"
            color="blue"
            isDarkMode={isDarkMode}
            compact={true}
          />
          <StatCard 
            title="Transactions" 
            value={stats.orderCount.toString()} 
            icon={<FaShoppingCart className="text-purple-600" />}
            trend="up"
            color="purple"
            isDarkMode={isDarkMode}
            compact={true}
          />
          <StatCard 
            title="Avg. Order" 
            value={`Ksh ${stats.avgOrderValue.toFixed(0)}`} 
            icon={<FaChartLine className="text-amber-600" />}
            trend="down"
            color="amber"
            isDarkMode={isDarkMode}
            compact={true}
          />
        </div>

        {/* Charts and Tables - Mobile: stack, Desktop: side-by-side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products - Mobile Optimized */}
          <div className={`${themeClasses.card} rounded-xl md:rounded-2xl shadow-lg overflow-hidden flex flex-col`}>
            <div className={`p-4 md:p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'} flex-shrink-0`}>
              <div className="flex items-center justify-between">
                <h3 className={`text-base md:text-lg font-semibold ${themeClasses.text.primary}`}>Top Products</h3>
                <span className="text-xs md:text-sm text-emerald-600 font-medium">This Month</span>
              </div>
            </div>
            <div className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-100'} flex-1 overflow-y-auto max-h-[300px] md:max-h-none`}>
              {stats.topProducts.slice(0, 5).map((product, index) => (
                <div key={index} className={`p-3 md:p-4 ${themeClasses.hover} transition-colors`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 md:w-8 md:h-8 flex items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 font-bold text-xs md:text-sm">
                        {index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h4 className={`font-medium ${themeClasses.text.primary} text-sm md:text-base truncate`}>{product.name}</h4>
                        <p className={`text-xs ${themeClasses.text.muted}`}>{product.quantitySold} units sold</p>
                      </div>
                    </div>
                    <div className="text-right ml-2">
                      <p className={`font-semibold ${themeClasses.text.primary} text-sm md:text-base`}>Ksh {product.revenue.toLocaleString()}</p>
                      <p className="text-xs text-emerald-600 font-medium">Revenue</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Orders - Mobile Optimized */}
          <div className={`${themeClasses.card} rounded-xl md:rounded-2xl shadow-lg overflow-hidden flex flex-col`}>
            <div className={`p-4 md:p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'} flex-shrink-0`}>
              <div className="flex items-center justify-between">
                <h3 className={`text-base md:text-lg font-semibold ${themeClasses.text.primary}`}>Recent Transactions</h3>
                <span className="text-xs md:text-sm text-blue-600 font-medium">Last 5</span>
              </div>
            </div>
            <div className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-100'} flex-1 overflow-y-auto max-h-[300px] md:max-h-none`}>
              {stats.recentOrders.map((order) => (
                <div key={order.id} className={`p-3 md:p-4 ${themeClasses.hover} transition-colors`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 md:w-3 md:h-3 rounded-full ${order.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                      <span className={`font-medium ${themeClasses.text.primary} text-sm md:text-base`}>#{order.id}</span>
                    </div>
                    <span className={`text-xs ${themeClasses.text.muted}`}>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs md:text-sm">
                    <span className={themeClasses.text.secondary}>{order.paymentMethod}</span>
                    <span className={`font-semibold ${themeClasses.text.primary}`}>Ksh {order.totalAmount?.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// Reusable Stat Card Component - Mobile Optimized
function StatCard({ title, value, icon, trend, color, isDarkMode, compact = false }: any) {
  const colorClasses = {
    emerald: "from-emerald-500 to-teal-500",
    blue: "from-blue-500 to-cyan-500",
    purple: "from-purple-500 to-violet-500",
    amber: "from-amber-500 to-orange-500"
  };

  const themeClasses = {
    background: isDarkMode ? "bg-gray-800" : "bg-white",
    border: isDarkMode ? "border-gray-700" : "border-gray-100",
    text: {
      primary: isDarkMode ? "text-gray-100" : "text-gray-900",
      secondary: isDarkMode ? "text-gray-400" : "text-gray-600",
      muted: isDarkMode ? "text-gray-500" : "text-gray-500"
    },
    iconBg: isDarkMode ? "bg-gray-700" : "bg-white"
  };

  return (
    <div className={`${themeClasses.background} ${themeClasses.border} rounded-xl md:rounded-2xl shadow-lg p-3 md:p-4 lg:p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300`}>
      {/* Gradient Background Effect */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>
      
      {/* Content */}
      <div className="relative">
        <div className="flex items-center justify-between mb-2 md:mb-3 lg:mb-4">
          <div className={`p-2 md:p-3 rounded-lg md:rounded-xl ${themeClasses.iconBg} shadow-sm ${themeClasses.border}`}>
            <span className="text-sm md:text-base lg:text-lg">{icon}</span>
          </div>
          <div className={`flex items-center space-x-1 px-1.5 py-0.5 md:px-2 md:py-1 rounded-full text-xs font-medium ${
            trend === 'up' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
          }`}>
            {trend === 'up' ? <FaArrowUp className="w-2 h-2 md:w-3 md:h-3" /> : <FaArrowDown className="w-2 h-2 md:w-3 md:h-3" />}
          </div>
        </div>
        
        <div>
          <p className={`${themeClasses.text.secondary} text-xs md:text-sm font-medium mb-1`}>{title}</p>
          <h3 className={`text-lg md:text-xl lg:text-2xl font-bold ${themeClasses.text.primary} truncate`}>
            {compact ? value : value}
          </h3>
        </div>
      </div>
    </div>
  );
}

// --- Orders Section (Mobile Optimized) ---
function OrdersSection({ isDarkMode }: { isDarkMode: boolean }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await orderAPI.getAll();
        setOrders(data);
      } catch (err) {
        console.error("Order fetch failed", err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id?.toString().includes(searchTerm) ||
      order.paymentMethod?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const themeClasses = {
    background: isDarkMode ? "bg-gray-800" : "bg-white",
    border: isDarkMode ? "border-gray-700" : "border-gray-100",
    text: {
      primary: isDarkMode ? "text-gray-100" : "text-gray-900",
      secondary: isDarkMode ? "text-gray-400" : "text-gray-600",
      muted: isDarkMode ? "text-gray-500" : "text-gray-500"
    },
    input: isDarkMode 
      ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:ring-emerald-500 focus:border-emerald-500" 
      : "border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-emerald-500 focus:border-emerald-500",
    headerBg: isDarkMode ? "bg-gray-750" : "bg-gray-50",
    hover: isDarkMode ? "hover:bg-gray-750" : "hover:bg-gray-50"
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <FaSpinner className="h-12 w-12 text-emerald-500 animate-spin mx-auto mb-4" />
          <h3 className={`text-lg font-semibold ${themeClasses.text.primary}`}>Loading Transactions...</h3>
          <p className={themeClasses.text.muted}>Fetching your order history</p>
        </div>
      </div>
    );
  }

  return (
    <section className="h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-2xl md:text-3xl font-bold ${themeClasses.text.primary}`}>Transactions</h2>
        </div>
        <p className={`${themeClasses.text.secondary} text-sm md:text-base mb-4`}>
          View and manage all customer transactions
        </p>
        
        {/* Mobile Search and Filter */}
        <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-4">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            </div>
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 md:py-2 rounded-lg focus:ring-2 ${themeClasses.input} text-sm md:text-base`}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`rounded-lg px-3 py-2.5 md:py-2 focus:ring-2 ${themeClasses.input} text-sm md:text-base`}
          >
            <option value="all">All Status</option>
            <option value="COMPLETED">Completed</option>
            <option value="PENDING">Pending</option>
          </select>
        </div>
      </div>

      {/* Mobile Card View / Desktop Table View */}
      <div className="md:hidden">
        {/* Mobile Card View */}
        <div className={`${themeClasses.background} rounded-xl shadow-lg overflow-hidden flex-1 flex flex-col`}>
          <div className={`p-4 ${themeClasses.headerBg} flex items-center justify-between`}>
            <span className={`text-sm font-semibold ${themeClasses.text.secondary}`}>
              {filteredOrders.length} transactions
            </span>
          </div>
          <div className="overflow-y-auto max-h-[calc(100vh-300px)]">
            {filteredOrders.map((order) => (
              <div key={order.id} className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'} ${themeClasses.hover}`}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <div className={`w-2 h-2 rounded-full ${order.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                      <span className={`font-semibold ${themeClasses.text.primary}`}>#{order.id}</span>
                    </div>
                    <p className={`text-xs ${themeClasses.text.muted}`}>
                      {new Date(order.createdAt).toLocaleDateString()} • {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    </p>
                  </div>
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    order.status === "COMPLETED" 
                      ? (isDarkMode ? "bg-emerald-900/30 text-emerald-300" : "bg-emerald-50 text-emerald-700")
                      : (isDarkMode ? "bg-amber-900/30 text-amber-300" : "bg-amber-50 text-amber-700")
                  }`}>
                    {order.status}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <p className={`text-xs ${themeClasses.text.secondary} mb-1`}>Payment</p>
                    <p className={`font-medium ${themeClasses.text.primary} text-sm`}>{order.paymentMethod}</p>
                  </div>
                  <div>
                    <p className={`text-xs ${themeClasses.text.secondary} mb-1`}>Items</p>
                    <p className={`font-medium ${themeClasses.text.primary} text-sm`}>{order.orderItems?.length || 0}</p>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-700/30">
                  <div className="flex justify-between items-center">
                    <span className={`text-xs ${themeClasses.text.secondary}`}>Total Amount</span>
                    <span className={`font-bold ${themeClasses.text.primary}`}>Ksh {order.totalAmount?.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {filteredOrders.length === 0 && (
            <div className="text-center py-12">
              <div className={`text-4xl mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>📄</div>
              <h3 className={`text-lg font-medium ${themeClasses.text.primary} mb-2`}>No orders found</h3>
              <p className={themeClasses.text.secondary}>Try adjusting your search or filter</p>
            </div>
          )}
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block">
        <div className={`${themeClasses.background} ${themeClasses.border} rounded-2xl shadow-lg overflow-hidden flex-1 flex flex-col`}>
          <div className="overflow-x-auto flex-1">
            <table className="w-full">
              <thead className={`${themeClasses.headerBg} sticky top-0 z-10`}>
                <tr>
                  <th className={`text-left py-4 px-6 text-sm font-semibold ${themeClasses.text.secondary}`}>Order ID</th>
                  <th className={`text-left py-4 px-6 text-sm font-semibold ${themeClasses.text.secondary}`}>Date & Time</th>
                  <th className={`text-left py-4 px-6 text-sm font-semibold ${themeClasses.text.secondary}`}>Payment Method</th>
                  <th className={`text-left py-4 px-6 text-sm font-semibold ${themeClasses.text.secondary}`}>Items</th>
                  <th className={`text-left py-4 px-6 text-sm font-semibold ${themeClasses.text.secondary}`}>Total Amount</th>
                  <th className={`text-left py-4 px-6 text-sm font-semibold ${themeClasses.text.secondary}`}>Status</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-100'}`}>
                {filteredOrders.map((order) => (
                  <tr key={order.id} className={themeClasses.hover}>
                    <td className="py-4 px-6">
                      <div className={`font-semibold ${themeClasses.text.primary}`}>#{order.id}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className={themeClasses.text.primary}>{new Date(order.createdAt).toLocaleDateString()}</div>
                      <div className={`text-sm ${themeClasses.text.muted}`}>{new Date(order.createdAt).toLocaleTimeString()}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        isDarkMode 
                          ? 'bg-blue-900/30 text-blue-300' 
                          : 'bg-blue-50 text-blue-700'
                      }`}>
                        {order.paymentMethod}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className={`font-medium ${themeClasses.text.primary}`}>{order.orderItems?.length || 0} items</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className={`font-bold ${themeClasses.text.primary}`}>Ksh {order.totalAmount?.toFixed(2)}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        order.status === "COMPLETED" 
                          ? (isDarkMode ? "bg-emerald-900/30 text-emerald-300" : "bg-emerald-50 text-emerald-700")
                          : (isDarkMode ? "bg-amber-900/30 text-amber-300" : "bg-amber-50 text-amber-700")
                      }`}>
                        {order.status}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {filteredOrders.length === 0 && (
            <div className="text-center py-12 flex-1 flex items-center justify-center">
              <div>
                <div className={`text-4xl mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>📄</div>
                <h3 className={`text-lg font-medium ${themeClasses.text.primary} mb-2`}>No orders found</h3>
                <p className={themeClasses.text.secondary}>Try adjusting your search or filter criteria</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// --- Inventory Section (Mobile Optimized) ---
function InventorySection({ isDarkMode }: { isDarkMode: boolean }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState<any>(null);
  const [filter, setFilter] = useState("all");

  const loadInventory = useCallback(async () => {
    try {
      setLoading(true);
      const data = await inventoryAPI.getAll();
      setItems(data);
    } catch (err) {
      console.error("Failed to load inventory:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInventory();
  }, [loadInventory]);

  const filtered = items.filter(item => {
    const matchesSearch = 
      item.product?.name?.toLowerCase().includes(search.toLowerCase()) ||
      item.product?.code?.toLowerCase().includes(search.toLowerCase());
    
    const matchesFilter = 
      filter === "all" ||
      (filter === "low" && item.quantity < 10) ||
      (filter === "weighed" && item.product?.type === "WEIGHED") ||
      (filter === "fixed" && item.product?.type === "FIXED");
    
    return matchesSearch && matchesFilter;
  });

  async function handleAdd(formData: any) {
    let cleanCode = formData.code;
    if (formData.type === 'WEIGHED' && cleanCode.length === 13 && cleanCode.startsWith('20')) {
      cleanCode = cleanCode.substring(2, 7);  
    }
    try {
      const productData = {
        name: formData.name,
        code: cleanCode,
        type: formData.type, 
        sellingPrice: parseFloat(formData.price), 
        pricePerKg: formData.type === 'WEIGHED' ? parseFloat(formData.price) : null,
      };

      const product = await productAPI.create(productData);
      await inventoryAPI.create({
        productId: product.id,
        quantity: parseFloat(formData.stock)
      });
      loadInventory();
      setShowAdd(false);
    } catch (err: any) {
      alert(`Save failed: ${err.message}`);
    }
  }

  async function handleEdit(updatedData: any) {
    try {
      await inventoryAPI.update(updatedData.inventoryId, {
        quantity: parseFloat(updatedData.stock)
      });
      await productAPI.update(updatedData.productId, {
        name: updatedData.name,
        code: updatedData.code, 
        sellingPrice: parseFloat(updatedData.price)
      });
      loadInventory();
      setShowEdit(null);
    } catch (err: any) {
      alert(`Update failed: ${err.message}`);
    }
  }

  const themeClasses = {
    background: isDarkMode ? "bg-gray-800" : "bg-white",
    border: isDarkMode ? "border-gray-700" : "border-gray-100",
    text: {
      primary: isDarkMode ? "text-gray-100" : "text-gray-900",
      secondary: isDarkMode ? "text-gray-400" : "text-gray-600",
      muted: isDarkMode ? "text-gray-500" : "text-gray-500"
    },
    input: isDarkMode 
      ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:ring-emerald-500 focus:border-emerald-500" 
      : "border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-emerald-500 focus:border-emerald-500",
    hover: isDarkMode ? "hover:bg-gray-750" : "hover:bg-gray-50",
    card: isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <FaSpinner className="h-12 w-12 text-emerald-500 animate-spin mx-auto mb-4" />
          <h3 className={`text-lg font-semibold ${themeClasses.text.primary}`}>Loading Inventory...</h3>
          <p className={themeClasses.text.muted}>Fetching your product catalog</p>
        </div>
      </div>
    );
  }

  return (
    <section className="h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className={`text-2xl md:text-3xl font-bold ${themeClasses.text.primary}`}>Inventory</h2>
          <button 
            onClick={() => setShowAdd(true)} 
            className="inline-flex items-center justify-center px-4 py-2.5 md:px-5 md:py-3 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-semibold rounded-xl hover:from-emerald-700 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 shadow-lg hover:shadow-xl text-sm md:text-base"
          >
            <FaPlus className="mr-2" />
            <span className="hidden md:inline">Add New Product</span>
            <span className="md:hidden">Add</span>
          </button>
        </div>
        <p className={`${themeClasses.text.secondary} text-sm md:text-base mb-4`}>
          Track and manage your product stock levels
        </p>

        {/* Mobile Search and Filter */}
        <div className="space-y-3 md:space-y-0">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            </div>
            <input
              type="text"
              placeholder="Search by name or code..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={`w-full pl-10 pr-4 py-2.5 md:py-3 rounded-xl focus:ring-2 ${themeClasses.input} text-sm md:text-base`}
            />
          </div>
          <div className="flex items-center gap-3">
            <select
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className={`flex-1 rounded-xl px-3 py-2.5 md:py-3 focus:ring-2 ${themeClasses.input} text-sm md:text-base`}
            >
              <option value="all">All Items</option>
              <option value="low">Low Stock (&lt; 10)</option>
              <option value="weighed">Weighed Items</option>
              <option value="fixed">Fixed Price Items</option>
            </select>
            <div className={`text-sm ${themeClasses.text.secondary} hidden md:flex items-center whitespace-nowrap`}>
              <span className={`font-semibold ${themeClasses.text.primary} ml-2`}>{filtered.length}</span>
              <span className="ml-1">products</span>
            </div>
          </div>
        </div>
      </div>

      {/* Inventory Grid/Cards */}
      <div className={`${themeClasses.background} p-4 md:p-6 rounded-xl md:rounded-2xl shadow-lg ${themeClasses.border} flex-1 overflow-y-auto`}>
        {filtered.length === 0 ? (
          <div className="text-center py-12 h-full flex items-center justify-center">
            <div>
              <div className={`text-4xl mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>📦</div>
              <h3 className={`text-lg font-medium ${themeClasses.text.primary} mb-2`}>No products found</h3>
              <p className={themeClasses.text.secondary}>Try adjusting your search or add a new product</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filtered.map(item => (
              <div key={item.id} className={`${themeClasses.card} rounded-xl md:rounded-2xl p-4 md:p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                        item.product?.type === 'WEIGHED' 
                          ? (isDarkMode ? 'bg-blue-900/30 text-blue-300' : 'bg-blue-50 text-blue-700')
                          : (isDarkMode ? 'bg-purple-900/30 text-purple-300' : 'bg-purple-50 text-purple-700')
                      }`}>
                        {item.product?.type === 'WEIGHED' ? 'WEIGHED' : 'FIXED'}
                      </span>
                      <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                        item.quantity < 10 
                          ? (isDarkMode ? 'bg-red-900/30 text-red-300' : 'bg-red-50 text-red-700')
                          : (isDarkMode ? 'bg-emerald-900/30 text-emerald-300' : 'bg-emerald-50 text-emerald-700')
                      }`}>
                        {item.quantity < 10 ? 'LOW STOCK' : 'IN STOCK'}
                      </span>
                    </div>
                    <h3 className={`font-bold ${themeClasses.text.primary} text-base md:text-lg truncate`}>{item.product?.name}</h3>
                    <p className={`${themeClasses.text.muted} text-xs md:text-sm`}>SKU: {item.product?.code}</p>
                  </div>
                  <button 
                    onClick={() => setShowEdit({
                      inventoryId: item.id,
                      productId: item.product?.id,
                      name: item.product?.name,
                      code: item.product?.code,
                      type: item.product?.type,
                      price: item.product?.sellingPrice,
                      stock: item.quantity
                    })}
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors ml-2"
                    title="Edit product"
                  >
                    <FaEdit className={isDarkMode ? "text-gray-400 hover:text-emerald-400" : "text-gray-400 hover:text-emerald-600"} />
                  </button>
                </div>

                <div className="space-y-3 md:space-y-4">
                  <div className="flex justify-between items-center">
                    <span className={`${themeClasses.text.secondary} text-sm`}>Price</span>
                    <span className={`font-bold ${themeClasses.text.primary} text-base md:text-lg`}>
                       {item.product?.sellingPrice?.toFixed(2)}
                      {item.product?.type === 'WEIGHED' && <span className={`text-xs ${themeClasses.text.muted} ml-1`}>/kg</span>}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`${themeClasses.text.secondary} text-sm`}>Stock</span>
                    <span className={`font-bold ${themeClasses.text.primary} text-base md:text-lg`}>
                      {item.product?.type === 'WEIGHED' 
                        ? `${item.quantity.toFixed(3)} kg` 
                        : `${Math.round(item.quantity)} pcs`
                      }
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAdd && (
        <ProductModal 
          onClose={() => setShowAdd(false)} 
          onSave={handleAdd} 
          title="Add Product" 
          isDarkMode={isDarkMode}
        />
      )}
      {showEdit && (
        <ProductModal 
          onClose={() => setShowEdit(null)} 
          onSave={handleEdit} 
          product={showEdit} 
          title="Edit Product" 
          isDarkMode={isDarkMode}
        />
      )}
    </section>
  );
}

// --- Main Layout (Mobile Optimized) ---
export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const handleThemeToggle = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const handleTabChange = (tabId: string) => {
    if (tabId !== activeTab) {
      setIsTransitioning(true);
      setActiveTab(tabId);
      setTimeout(() => setIsTransitioning(false), 100);
    }
  };

  const menuItems = [
    { id: "Dashboard", icon: <FaChartLine />, label: "Dashboard" },
    { id: "Inventory", icon: <FaBox />, label: "Inventory" },
    { id: "Orders", icon: <FaReceipt />, label: "Transactions" },
  ];

  const themeClasses = {
    background: isDarkMode ? "bg-gray-900" : "bg-gray-50",
    text: {
      primary: isDarkMode ? "text-gray-100" : "text-gray-900",
      secondary: isDarkMode ? "text-gray-400" : "text-gray-600",
      muted: isDarkMode ? "text-gray-500" : "text-gray-500"
    },
    border: isDarkMode ? "border-gray-800" : "border-gray-200",
    sidebar: isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200",
    header: isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"
  };

  return (
    <div className={`min-h-screen fixed inset-0 overflow-hidden ${themeClasses.background}`}>
      {/* Mobile Header */}
      <div className={`lg:hidden ${themeClasses.header} border-b px-4 py-3 flex items-center justify-between z-40`}>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)} 
            className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'} transition-colors`}
          >
            {sidebarOpen ? <FaTimes className={themeClasses.text.primary} /> : <FaBars className={themeClasses.text.primary} />}
          </button>
          <div>
            <h1 className={`text-lg font-bold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>RETAIL POS</h1>
            <p className={`text-xs ${themeClasses.text.muted}`}>{activeTab}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={handleThemeToggle}
            className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-800 text-yellow-300' : 'hover:bg-gray-100 text-gray-600'}`}
            title={isDarkMode ? "Light mode" : "Dark mode"}
          >
            {isDarkMode ? <FaSun size={18} /> : <FaMoon size={18} />}
          </button>
          <div className="relative">
            <FaUserCircle className={`text-xl ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
          </div>
        </div>
      </div>

      <div className="flex h-full pt-[57px] lg:pt-0">
        {/* Sidebar - Mobile Drawer */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-40 w-64 ${themeClasses.sidebar} border-r transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:flex lg:flex-col
          h-full pt-16 lg:pt-0
        `}>
          <div className={`p-6 border-b ${themeClasses.border} hidden lg:block`}>
            <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>RETAIL POS</h1>
            <p className={`text-sm ${themeClasses.text.secondary} mt-1`}>Administrator Panel</p>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto">
            <nav className="space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    handleTabChange(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200
                    ${activeTab === item.id 
                      ? (isDarkMode 
                        ? 'bg-emerald-900/30 text-emerald-300 font-semibold border border-emerald-800' 
                        : 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 font-semibold border border-emerald-100'
                      )
                      : `${themeClasses.text.secondary} ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'}`
                    }
                  `}
                >
                  <span className={`text-lg ${activeTab === item.id 
                    ? (isDarkMode ? 'text-emerald-400' : 'text-emerald-600') 
                    : (isDarkMode ? 'text-gray-400' : 'text-gray-400')
                  }`}>
                    {item.icon}
                  </span>
                  <span className="text-sm md:text-base">{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
          
          <div className={`p-4 border-t ${themeClasses.border}`}>
            <div className="mb-4 px-4 py-3 hidden lg:block">
              <button
                onClick={handleThemeToggle}
                className={`p-3 rounded-xl ${isDarkMode ? 'hover:bg-gray-800 text-yellow-300' : 'hover:bg-gray-100 text-gray-600'} transition-colors`}
                title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {isDarkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
              </button>
            </div>
            <div className={`flex items-center space-x-3 mb-4 px-4 py-3 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-xl`}>
              <FaUserCircle className={`text-2xl md:text-3xl ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <div>
                <p className={`font-medium ${themeClasses.text.primary} text-sm md:text-base`}>Admin User</p>
                <p className={`text-xs ${themeClasses.text.muted}`}>Administrator</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className={`w-full flex items-center justify-center space-x-2 px-4 py-3 ${
                isDarkMode 
                  ? 'text-red-400 bg-red-900/20 hover:bg-red-900/30' 
                  : 'text-red-600 bg-red-50 hover:bg-red-100'
              } rounded-xl font-medium transition-colors duration-200 text-sm md:text-base`}
            >
              <FaSignOutAlt />
              <span>Logout</span>
            </button>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-3 md:p-4 lg:p-6 overflow-hidden flex flex-col">
          <div className={`flex-1 overflow-hidden transition-opacity duration-200 ${
            isTransitioning ? 'opacity-50' : 'opacity-100'
          }`}>
            {activeTab === "Dashboard" && <DashboardSection isDarkMode={isDarkMode} />}
            {activeTab === "Inventory" && <InventorySection isDarkMode={isDarkMode} />}
            {activeTab === "Orders" && <OrdersSection isDarkMode={isDarkMode} />}
          </div>
          
          {/* Mobile Bottom Navigation (Only on mobile) */}
                    {/* Mobile Bottom Navigation - Enhanced Visibility */}
                    <div className="lg:hidden mt-4">
            <div className={`${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-2xl border ${themeClasses.border}`}>
              <div className="flex items-center justify-around p-2">
                {menuItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleTabChange(item.id)}
                    className={`
                      relative flex flex-col items-center justify-center p-3 rounded-xl transition-all duration-200 flex-1 mx-1
                      ${activeTab === item.id 
                        ? (isDarkMode 
                          ? 'bg-emerald-900 text-emerald-300' 
                          : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white'
                        )
                        : `${themeClasses.text.secondary} ${isDarkMode ? 'hover:bg-gray-750' : 'hover:bg-gray-50'}`
                      }
                    `}
                  >
                    {/* Active Indicator Dot */}
                    {activeTab === item.id && (
                      <div className={`absolute -top-1 w-2 h-2 rounded-full ${isDarkMode ? 'bg-emerald-400' : 'bg-white'}`}></div>
                    )}
                    
                    <span className={`text-xl mb-1 ${activeTab === item.id 
                      ? (isDarkMode ? 'text-emerald-300' : 'text-white') 
                      : (isDarkMode ? 'text-gray-400' : 'text-gray-600')
                    }`}>
                      {item.icon}
                    </span>
                    <span className={`text-xs font-semibold ${activeTab === item.id 
                      ? (isDarkMode ? 'text-emerald-300' : 'text-white') 
                      : (isDarkMode ? 'text-gray-400' : 'text-gray-600')
                    }`}>
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
          {/* Transition Overlay */}
          {isTransitioning && (
            <div className={`absolute inset-0 ${isDarkMode ? 'bg-gray-900' : 'bg-white'} bg-opacity-80 flex items-center justify-center z-10`}>
              <div className="text-center">
                <FaSpinner className="h-8 w-8 text-emerald-500 animate-spin mx-auto mb-2" />
                <p className={themeClasses.text.secondary}>Loading...</p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// --- Modal Component (Mobile Optimized) ---
function ProductModal({ onClose, onSave, product, title, isDarkMode }: any) {
  const [form, setForm] = useState(product || { 
    name: "", 
    price: "", 
    stock: "", 
    code: "", 
    type: "FIXED" 
  });
  const [loading, setLoading] = useState(false);

  const isWeighed = form.type === "WEIGHED";

  const themeClasses = {
    background: isDarkMode ? "bg-gray-800" : "bg-white",
    border: isDarkMode ? "border-gray-700" : "border-gray-200",
    text: {
      primary: isDarkMode ? "text-gray-100" : "text-gray-900",
      secondary: isDarkMode ? "text-gray-400" : "text-gray-600",
      muted: isDarkMode ? "text-gray-500" : "text-gray-500"
    },
    input: isDarkMode 
      ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400 focus:ring-emerald-500 focus:border-emerald-500" 
      : "border-gray-300 text-gray-900 placeholder-gray-500 focus:ring-emerald-500 focus:border-emerald-500",
    button: isDarkMode 
      ? "bg-gray-700 border-gray-600 text-gray-100 hover:bg-gray-600" 
      : "border-gray-300 text-gray-700 hover:bg-gray-50"
  };

  const handleSubmit = async () => {
    if (!form.code || !form.name || !form.price || !form.stock) {
      alert("Please fill all required fields");
      return;
    }
    setLoading(true);
    try {
      await onSave(form);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 md:p-4 z-50">
      <div className={`${themeClasses.background} rounded-xl md:rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto ${themeClasses.border}`}>
        {/* Modal Header */}
        <div className={`p-4 md:p-6 border-b ${themeClasses.border} sticky top-0 ${themeClasses.background}`}>
          <div className="flex items-center justify-between">
            <h3 className={`text-lg md:text-xl font-bold ${themeClasses.text.primary}`}>{title}</h3>
            <button 
              onClick={onClose} 
              className={`${themeClasses.text.secondary} hover:${themeClasses.text.primary} transition-colors p-1`}
            >
              <FaTimes size={20} />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 md:p-6 space-y-4">
          {/* Product Type */}
          <div>
            <label className={`block text-sm font-medium ${themeClasses.text.secondary} mb-2`}>
              Selling Method
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setForm({...form, type: "FIXED"})}
                className={`p-3 md:p-4 rounded-xl border text-center transition-all text-sm md:text-base ${
                  !isWeighed 
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-semibold' 
                    : `${themeClasses.border} ${themeClasses.text.secondary} ${isDarkMode ? 'hover:border-gray-500' : 'hover:border-gray-400'}`
                }`}
              >
                Fixed Price
              </button>
              <button
                type="button"
                onClick={() => setForm({...form, type: "WEIGHED"})}
                className={`p-3 md:p-4 rounded-xl border text-center transition-all text-sm md:text-base ${
                  isWeighed 
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-semibold' 
                    : `${themeClasses.border} ${themeClasses.text.secondary} ${isDarkMode ? 'hover:border-gray-500' : 'hover:border-gray-400'}`
                }`}
              >
                Weighed
              </button>
            </div>
          </div>

          {/* SKU */}
          <div>
            <label className={`block text-sm font-medium ${themeClasses.text.secondary} mb-2`}>
              SKU / Product Code
            </label>
            <input
              type="text"
              placeholder="e.g., BEV-001"
              value={form.code}
              onChange={e => setForm({...form, code: e.target.value})}
              className={`w-full px-3 py-2.5 md:px-4 md:py-3 rounded-xl focus:ring-2 ${themeClasses.input} text-sm md:text-base`}
            />
          </div>

          {/* Product Name */}
          <div>
            <label className={`block text-sm font-medium ${themeClasses.text.secondary} mb-2`}>
              Product Name
            </label>
            <input
              type="text"
              placeholder="Enter product name"
              value={form.name}
              onChange={e => setForm({...form, name: e.target.value})}
              className={`w-full px-3 py-2.5 md:px-4 md:py-3 rounded-xl focus:ring-2 ${themeClasses.input} text-sm md:text-base`}
            />
          </div>

          {/* Price and Stock */}
          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <div>
              <label className={`block text-sm font-medium ${themeClasses.text.secondary} mb-2`}>
                Price {isWeighed && "(per kg)"}
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={form.price}
                  onChange={e => setForm({...form, price: e.target.value})}
                  className={`w-full pl-12 pr-3 py-2.5 md:pl-12 md:pr-4 md:py-3 rounded-xl focus:ring-2 ${themeClasses.input} text-sm md:text-base`}
                />
              </div>
            </div>
            <div>
              <label className={`block text-sm font-medium ${themeClasses.text.secondary} mb-2`}>
                Stock {isWeighed && "(kg)"}
              </label>
              <input
                type="number"
                step={isWeighed ? "0.001" : "1"}
                placeholder={isWeighed ? "0.000" : "0"}
                value={form.stock}
                onChange={e => setForm({...form, stock: e.target.value})}
                className={`w-full px-3 py-2.5 md:px-4 md:py-3 rounded-xl focus:ring-2 ${themeClasses.input} text-sm md:text-base`}
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className={`p-4 md:p-6 border-t ${themeClasses.border} sticky bottom-0 ${themeClasses.background}`}>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleSubmit}
              disabled={loading || !form.code || !form.name}
              className={`
                flex-1 px-4 py-3 md:px-6 md:py-3 rounded-xl font-semibold transition-all duration-200 text-sm md:text-base
                ${loading || !form.code || !form.name
                  ? (isDarkMode 
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  )
                  : 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white hover:from-emerald-700 hover:to-teal-600'
                }
              `}
            >
              {loading ? (
                <div className="flex items-center justify-center space-x-2">
                  <FaSpinner className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </div>
              ) : 'Save Product'}
            </button>
            <button
              onClick={onClose}
              className={`flex-1 px-4 py-3 md:px-6 md:py-3 rounded-xl font-semibold transition-colors duration-200 text-sm md:text-base ${themeClasses.button}`}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}