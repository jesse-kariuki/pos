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
  FaSun
} from "react-icons/fa";

// Theme context for dark mode
const ThemeContext = {
  isDarkMode: false,
  toggle: () => {},
};

// --- Dashboard Section ---
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
      {/* Header - Fixed */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className={`text-3xl font-bold ${themeClasses.text.primary}`}>Dashboard Overview</h2>
          <p className={`${themeClasses.text.secondary} mt-2`}>Welcome back! Here's what's happening with your store today.</p>
        </div>
        <div className={`text-sm ${themeClasses.text.muted}`}>
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto space-y-8 pb-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            title="Today's Sales" 
            value={`Ksh ${stats.todaySales.toLocaleString()}`} 
            icon={<FaDollarSign className="text-emerald-600" />}
            trend="up"
            color="emerald"
            isDarkMode={isDarkMode}
          />
          <StatCard 
            title="Monthly Sales" 
            value={`Ksh ${stats.monthSales.toLocaleString()}`} 
            icon={<FaChartBar className="text-blue-600" />}
            trend="up"
            color="blue"
            isDarkMode={isDarkMode}
          />
          <StatCard 
            title="Total Transactions" 
            value={stats.orderCount.toString()} 
            icon={<FaShoppingCart className="text-purple-600" />}
            trend="up"
            color="purple"
            isDarkMode={isDarkMode}
          />
          <StatCard 
            title="Avg. Order Value" 
            value={`Ksh ${stats.avgOrderValue.toFixed(0)}`} 
            icon={<FaChartLine className="text-amber-600" />}
            trend="down"
            color="amber"
            isDarkMode={isDarkMode}
          />
        </div>

        {/* Charts and Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Products */}
          <div className={`${themeClasses.card} rounded-2xl shadow-lg overflow-hidden flex flex-col`}>
            <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'} flex-shrink-0`}>
              <div className="flex items-center justify-between">
                <h3 className={`text-lg font-semibold ${themeClasses.text.primary}`}>Top Selling Products</h3>
                <span className="text-sm text-emerald-600 font-medium">This Month</span>
              </div>
            </div>
            <div className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-100'} flex-1 overflow-y-auto`}>
              {stats.topProducts.slice(0, 5).map((product, index) => (
                <div key={index} className={`p-4 ${themeClasses.hover} transition-colors`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 font-bold">
                        {index + 1}
                      </div>
                      <div>
                        <h4 className={`font-medium ${themeClasses.text.primary}`}>{product.name}</h4>
                        <p className={`text-sm ${themeClasses.text.muted}`}>{product.quantitySold} units sold</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${themeClasses.text.primary}`}>Ksh {product.revenue.toLocaleString()}</p>
                      <p className="text-xs text-emerald-600 font-medium">Revenue</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Orders */}
          <div className={`${themeClasses.card} rounded-2xl shadow-lg overflow-hidden flex flex-col`}>
            <div className={`p-6 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-100'} flex-shrink-0`}>
              <div className="flex items-center justify-between">
                <h3 className={`text-lg font-semibold ${themeClasses.text.primary}`}>Recent Transactions</h3>
                <span className="text-sm text-blue-600 font-medium">Last 5 Orders</span>
              </div>
            </div>
            <div className={`divide-y ${isDarkMode ? 'divide-gray-700' : 'divide-gray-100'} flex-1 overflow-y-auto`}>
              {stats.recentOrders.map((order) => (
                <div key={order.id} className={`p-4 ${themeClasses.hover} transition-colors`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${order.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                      <span className={`font-medium ${themeClasses.text.primary}`}>#{order.id}</span>
                    </div>
                    <span className={`text-sm ${themeClasses.text.muted}`}>{new Date(order.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
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

// Reusable Stat Card Component
function StatCard({ title, value, icon, trend, color, isDarkMode }: any) {
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
    <div className={`${themeClasses.background} ${themeClasses.border} rounded-2xl shadow-lg p-6 relative overflow-hidden group hover:shadow-xl transition-all duration-300`}>
      {/* Gradient Background Effect */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>
      
      {/* Content */}
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl ${themeClasses.iconBg} shadow-sm ${themeClasses.border}`}>
            {icon}
          </div>
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
            trend === 'up' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
          }`}>
            {trend === 'up' ? <FaArrowUp className="w-3 h-3" /> : <FaArrowDown className="w-3 h-3" />}
          </div>
        </div>
        
        <div>
          <p className={`${themeClasses.text.secondary} text-sm font-medium mb-1`}>{title}</p>
          <h3 className={`text-2xl font-bold ${themeClasses.text.primary}`}>{value}</h3>
        </div>
      </div>
    </div>
  );
}

// --- Orders Section ---
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
      {/* Header - Fixed */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className={`text-3xl font-bold ${themeClasses.text.primary}`}>Transaction History</h2>
          <p className={`${themeClasses.text.secondary} mt-2`}>View and manage all customer transactions</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`pl-10 pr-4 py-2 rounded-lg focus:ring-2 ${themeClasses.input}`}
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={`rounded-lg px-4 py-2 focus:ring-2 ${themeClasses.input}`}
          >
            <option value="all">All Status</option>
            <option value="COMPLETED">Completed</option>
            <option value="PENDING">Pending</option>
          </select>
        </div>
      </div>

      {/* Scrollable Table Container */}
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
    </section>
  );
}

// --- Inventory Section ---
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className={`text-3xl font-bold ${themeClasses.text.primary}`}>Inventory Management</h2>
          <p className={`${themeClasses.text.secondary} mt-2`}>Track and manage your product stock levels</p>
        </div>
        <button 
          onClick={() => setShowAdd(true)} 
          className="inline-flex items-center justify-center px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-semibold rounded-xl hover:from-emerald-700 hover:to-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <FaPlus className="mr-2" />
          Add New Product
        </button>
      </div>

      {/* Filters and Search */}
      <div className={`${themeClasses.background} p-6 rounded-2xl shadow-lg ${themeClasses.border} mb-6`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name or code..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 rounded-xl focus:ring-2 ${themeClasses.input}`}
            />
          </div>
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className={`rounded-xl px-4 py-3 focus:ring-2 ${themeClasses.input}`}
          >
            <option value="all">All Items</option>
            <option value="low">Low Stock (&lt; 10)</option>
            <option value="weighed">Weighed Items</option>
            <option value="fixed">Fixed Price Items</option>
          </select>
          <div className={`text-sm ${themeClasses.text.secondary} flex items-center`}>
            <span className={`font-semibold ${themeClasses.text.primary}`}>{filtered.length}</span>
            <span className="ml-2">products found</span>
          </div>
        </div>
      </div>

      {/* Scrollable Inventory Grid */}
      <div className={`${themeClasses.background} p-6 rounded-2xl shadow-lg ${themeClasses.border} flex-1 overflow-y-auto`}>
        {filtered.length === 0 ? (
          <div className="text-center py-12 h-full flex items-center justify-center">
            <div>
              <div className={`text-4xl mb-4 ${isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}>📦</div>
              <h3 className={`text-lg font-medium ${themeClasses.text.primary} mb-2`}>No products found</h3>
              <p className={themeClasses.text.secondary}>Try adjusting your search or add a new product</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(item => (
              <div key={item.id} className={`${themeClasses.card} rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}>
                <div className="flex justify-between items-start mb-4">
                  <div>
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
                    <h3 className={`font-bold ${themeClasses.text.primary} text-lg truncate`}>{item.product?.name}</h3>
                    <p className={`${themeClasses.text.muted} text-sm`}>SKU: {item.product?.code}</p>
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
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    title="Edit product"
                  >
                    <FaEdit className={isDarkMode ? "text-gray-400 hover:text-emerald-400" : "text-gray-400 hover:text-emerald-600"} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className={themeClasses.text.secondary}>Price</span>
                    <span className={`font-bold ${themeClasses.text.primary}`}>
                      Ksh {item.product?.sellingPrice?.toFixed(2)}
                      {item.product?.type === 'WEIGHED' && <span className={`text-sm ${themeClasses.text.muted} ml-1`}>/kg</span>}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={themeClasses.text.secondary}>Stock Level</span>
                    <span className={`font-bold ${themeClasses.text.primary}`}>
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

// --- Main Layout ---
export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check for saved theme preference
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
          <h1 className={`text-xl font-bold ${isDarkMode ? 'text-emerald-400' : 'text-emerald-600'}`}>RETAIL POS</h1>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleThemeToggle}
            className={`p-2 rounded-lg ${isDarkMode ? 'hover:bg-gray-800 text-yellow-300' : 'hover:bg-gray-100 text-gray-600'}`}
            title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDarkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
          </button>
          <FaUserCircle className={`text-2xl ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
        </div>
      </div>

      <div className="flex h-full pt-[57px] lg:pt-0">
        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-40 w-64 ${themeClasses.sidebar} border-r transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:flex lg:flex-col
          h-full
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
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
          
          <div className={`p-4 border-t ${themeClasses.border}`}>
            <div className="flex items-center space-x-3 mb-4 px-4 py-3">
              <button
                onClick={handleThemeToggle}
                className={`p-3 rounded-xl ${isDarkMode ? 'hover:bg-gray-800 text-yellow-300' : 'hover:bg-gray-100 text-gray-600'} transition-colors`}
                title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
              >
                {isDarkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
              </button>
            </div>
            <div className={`flex items-center space-x-3 mb-4 px-4 py-3 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-50'} rounded-xl`}>
              <FaUserCircle className={`text-3xl ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`} />
              <div>
                <p className={`font-medium ${themeClasses.text.primary}`}>Admin User</p>
                <p className={`text-sm ${themeClasses.text.muted}`}>Administrator</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className={`w-full flex items-center justify-center space-x-2 px-4 py-3 ${
                isDarkMode 
                  ? 'text-red-400 bg-red-900/20 hover:bg-red-900/30' 
                  : 'text-red-600 bg-red-50 hover:bg-red-100'
              } rounded-xl font-medium transition-colors duration-200`}
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

        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-hidden flex flex-col">
          <div className={`flex-1 overflow-hidden transition-opacity duration-200 ${
            isTransitioning ? 'opacity-50' : 'opacity-100'
          }`}>
            {activeTab === "Dashboard" && <DashboardSection isDarkMode={isDarkMode} />}
            {activeTab === "Inventory" && <InventorySection isDarkMode={isDarkMode} />}
            {activeTab === "Orders" && <OrdersSection isDarkMode={isDarkMode} />}
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

// --- Modal Component ---
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`${themeClasses.background} rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto ${themeClasses.border}`}>
        {/* Modal Header */}
        <div className={`p-6 border-b ${themeClasses.border}`}>
          <div className="flex items-center justify-between">
            <h3 className={`text-xl font-bold ${themeClasses.text.primary}`}>{title}</h3>
            <button 
              onClick={onClose} 
              className={`${themeClasses.text.secondary} hover:${themeClasses.text.primary} transition-colors`}
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {/* Product Type */}
          <div>
            <label className={`block text-sm font-medium ${themeClasses.text.secondary} mb-2`}>
              Selling Method
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setForm({...form, type: "FIXED"})}
                className={`p-4 rounded-xl border text-center transition-all ${
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
                className={`p-4 rounded-xl border text-center transition-all ${
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
              className={`w-full px-4 py-3 rounded-xl focus:ring-2 ${themeClasses.input}`}
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
              className={`w-full px-4 py-3 rounded-xl focus:ring-2 ${themeClasses.input}`}
            />
          </div>

          {/* Price and Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium ${themeClasses.text.secondary} mb-2`}>
                Price {isWeighed && "(per kg)"}
              </label>
              <div className="relative">
                <span className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${themeClasses.text.muted}`}>Ksh</span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={form.price}
                  onChange={e => setForm({...form, price: e.target.value})}
                  className={`w-full pl-12 pr-4 py-3 rounded-xl focus:ring-2 ${themeClasses.input}`}
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
                className={`w-full px-4 py-3 rounded-xl focus:ring-2 ${themeClasses.input}`}
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className={`p-6 border-t ${themeClasses.border}`}>
          <div className="flex space-x-3">
            <button
              onClick={handleSubmit}
              disabled={loading || !form.code || !form.name}
              className={`
                flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-200
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
              className={`flex-1 px-6 py-3 rounded-xl font-semibold transition-colors duration-200 ${themeClasses.button}`}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}