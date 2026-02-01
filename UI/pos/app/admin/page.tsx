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
  FaTimes
} from "react-icons/fa";

// --- Dashboard Section ---
function DashboardSection() {
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
        const recentOrders = orders.slice(0, 5); // Get last 5 orders

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

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-96 bg-gray-200 rounded-xl"></div>
          <div className="h-96 bg-gray-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Dashboard Overview</h2>
          <p className="text-gray-600 mt-2">Welcome back! Here's what's happening with your store today.</p>
        </div>
        <div className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Today's Sales" 
          value={`Ksh ${stats.todaySales.toLocaleString()}`} 
          icon={<FaDollarSign className="text-emerald-600" />}
          trend="up"
          color="emerald"
        />
        <StatCard 
          title="Monthly Sales" 
          value={`Ksh ${stats.monthSales.toLocaleString()}`} 
          icon={<FaChartBar className="text-blue-600" />}
          trend="up"
          color="blue"
        />
        <StatCard 
          title="Total Transactions" 
          value={stats.orderCount.toString()} 
          icon={<FaShoppingCart className="text-purple-600" />}
          trend="up"
          color="purple"
        />
        <StatCard 
          title="Avg. Order Value" 
          value={`Ksh ${stats.avgOrderValue.toFixed(0)}`} 
          icon={<FaChartLine className="text-amber-600" />}
          trend="down"
          color="amber"
        />
      </div>

      {/* Charts and Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Top Selling Products</h3>
              <span className="text-sm text-emerald-600 font-medium">This Month</span>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {stats.topProducts.slice(0, 5).map((product, index) => (
              <div key={index} className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-50 text-emerald-700 font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{product.name}</h4>
                    <p className="text-sm text-gray-500">{product.quantitySold} units sold</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-gray-900">Ksh {product.revenue.toLocaleString()}</p>
                  <p className="text-xs text-emerald-600 font-medium">Revenue</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Recent Transactions</h3>
              <span className="text-sm text-blue-600 font-medium">Last 5 Orders</span>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {stats.recentOrders.map((order) => (
              <div key={order.id} className="p-4 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${order.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                    <span className="font-medium text-gray-900">#{order.id}</span>
                  </div>
                  <span className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{order.paymentMethod}</span>
                  <span className="font-semibold text-gray-900">Ksh {order.totalAmount?.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// Reusable Stat Card Component
function StatCard({ title, value, icon, trend, trendValue, color }: any) {
  const colorClasses = {
    emerald: "from-emerald-500 to-teal-500",
    blue: "from-blue-500 to-cyan-500",
    purple: "from-purple-500 to-violet-500",
    amber: "from-amber-500 to-orange-500"
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 relative overflow-hidden group hover:shadow-xl transition-shadow duration-300">
      {/* Gradient Background Effect */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses[color as keyof typeof colorClasses]} opacity-5 group-hover:opacity-10 transition-opacity duration-300`}></div>
      
      {/* Content */}
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-xl bg-white shadow-sm border border-gray-100">
            {icon}
          </div>
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
            trend === 'up' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
          }`}>
            {trend === 'up' ? <FaArrowUp className="w-3 h-3" /> : <FaArrowDown className="w-3 h-3" />}
            <span>{trendValue}</span>
          </div>
        </div>
        
        <div>
          <p className="text-gray-600 text-sm font-medium mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900">{value}</h3>
        </div>
      </div>
    </div>
  );
}

// --- Orders Section ---
function OrdersSection() {
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

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-48"></div>
        <div className="h-96 bg-gray-200 rounded-2xl"></div>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Transaction History</h2>
          <p className="text-gray-600 mt-2">View and manage all customer transactions</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search orders..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="all">All Status</option>
            <option value="COMPLETED">Completed</option>
            <option value="PENDING">Pending</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Order ID</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Date & Time</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Payment Method</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Items</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Total Amount</th>
                <th className="text-left py-4 px-6 text-sm font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-4 px-6">
                    <div className="font-semibold text-gray-900">#{order.id}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-gray-900">{new Date(order.createdAt).toLocaleDateString()}</div>
                    <div className="text-sm text-gray-500">{new Date(order.createdAt).toLocaleTimeString()}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700">
                      {order.paymentMethod}
                    </div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="text-gray-900 font-medium">{order.orderItems?.length || 0} items</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className="font-bold text-gray-900">Ksh {order.totalAmount?.toFixed(2)}</div>
                  </td>
                  <td className="py-4 px-6">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                      order.status === "COMPLETED" 
                        ? "bg-emerald-50 text-emerald-700" 
                        : "bg-amber-50 text-amber-700"
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
          <div className="text-center py-12">
            <div className="text-gray-400 text-4xl mb-4">📄</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No orders found</h3>
            <p className="text-gray-600">Try adjusting your search or filter criteria</p>
          </div>
        )}
      </div>
    </section>
  );
}

// --- Inventory Section ---
function InventorySection() {
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

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 rounded w-48"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-40 bg-gray-200 rounded-xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900">Inventory Management</h2>
          <p className="text-gray-600 mt-2">Track and manage your product stock levels</p>
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
      <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name or code..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          <select
            value={filter}
            onChange={e => setFilter(e.target.value)}
            className="border border-gray-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="all">All Items</option>
            <option value="low">Low Stock (&lt; 10)</option>
            <option value="weighed">Weighed Items</option>
            <option value="fixed">Fixed Price Items</option>
          </select>
          <div className="text-sm text-gray-600 flex items-center">
            <span className="font-semibold">{filtered.length}</span>
            <span className="ml-2">products found</span>
          </div>
        </div>

        {/* Inventory Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-4xl mb-4">📦</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600">Try adjusting your search or add a new product</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(item => (
              <div key={item.id} className="bg-white border border-gray-200 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                        item.product?.type === 'WEIGHED' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'
                      }`}>
                        {item.product?.type === 'WEIGHED' ? 'WEIGHED' : 'FIXED'}
                      </span>
                      <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${
                        item.quantity < 10 ? 'bg-red-50 text-red-700' : 'bg-emerald-50 text-emerald-700'
                      }`}>
                        {item.quantity < 10 ? 'LOW STOCK' : 'IN STOCK'}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg truncate">{item.product?.name}</h3>
                    <p className="text-gray-500 text-sm">SKU: {item.product?.code}</p>
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
                    <FaEdit className="text-gray-400 hover:text-emerald-600" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Price</span>
                    <span className="font-bold text-gray-900">
                      Ksh {item.product?.sellingPrice?.toFixed(2)}
                      {item.product?.type === 'WEIGHED' && <span className="text-sm text-gray-500 ml-1">/kg</span>}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Stock Level</span>
                    <span className="font-bold text-gray-900">
                      {item.product?.type === 'WEIGHED' 
                        ? `${item.quantity.toFixed(3)} kg` 
                        : `${Math.round(item.quantity)} pcs`
                      }
                    </span>
                  </div>
                  
                  {/* Stock Level Indicator */}
                  <div className="pt-2">
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showAdd && <ProductModal onClose={() => setShowAdd(false)} onSave={handleAdd} title="Add Product" />}
      {showEdit && (
        <ProductModal 
          onClose={() => setShowEdit(null)} 
          onSave={handleEdit} 
          product={showEdit} 
          title="Edit Product" 
        />
      )}
    </section>
  );
}

// --- Main Layout ---
export default function AdminPage() {
  const [activeTab, setActiveTab] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const menuItems = [
    { id: "Dashboard", icon: <FaChartLine />, label: "Dashboard" },
    { id: "Inventory", icon: <FaBox />, label: "Inventory" },
    { id: "Orders", icon: <FaReceipt />, label: "Transactions" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 rounded-lg hover:bg-gray-100">
            {sidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
          <h1 className="text-xl font-bold text-emerald-600">RETAIL POS</h1>
        </div>
        <div className="flex items-center space-x-3">
          <FaUserCircle className="text-gray-400 text-2xl" />
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:flex lg:flex-col
        `}>
          <div className="p-6 border-b border-gray-200 hidden lg:block">
            <h1 className="text-2xl font-bold text-emerald-600">RETAIL POS</h1>
            <p className="text-sm text-gray-600 mt-1">Administrator Panel</p>
          </div>
          
          <div className="flex-1 p-4">
            <nav className="space-y-1">
              {menuItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`
                    w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200
                    ${activeTab === item.id 
                      ? 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 font-semibold border border-emerald-100' 
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                  `}
                >
                  <span className={`text-lg ${activeTab === item.id ? 'text-emerald-600' : 'text-gray-400'}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
          
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-3 mb-4 px-4 py-3 bg-gray-50 rounded-xl">
              <FaUserCircle className="text-3xl text-gray-400" />
              <div>
                <p className="font-medium text-gray-900">Admin User</p>
                <p className="text-sm text-gray-500">Administrator</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-red-600 bg-red-50 hover:bg-red-100 rounded-xl font-medium transition-colors duration-200"
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
        <main className="flex-1 p-4 lg:p-8">
          {activeTab === "Dashboard" && <DashboardSection />}
          {activeTab === "Inventory" && <InventorySection />}
          {activeTab === "Orders" && <OrdersSection />}
        </main>
      </div>
    </div>
  );
}

// --- Modal Component ---
function ProductModal({ onClose, onSave, product, title }: any) {
  const [form, setForm] = useState(product || { 
    name: "", 
    price: "", 
    stock: "", 
    code: "", 
    type: "FIXED" 
  });
  const [loading, setLoading] = useState(false);

  const isWeighed = form.type === "WEIGHED";

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
      <div className="bg-white rounded-2xl w-full max-w-md">
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {/* Product Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selling Method
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setForm({...form, type: "FIXED"})}
                className={`p-4 rounded-xl border text-center transition-all ${
                  !isWeighed 
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-700 font-semibold' 
                    : 'border-gray-300 text-gray-600 hover:border-gray-400'
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
                    : 'border-gray-300 text-gray-600 hover:border-gray-400'
                }`}
              >
                Weighed
              </button>
            </div>
          </div>

          {/* SKU */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              SKU / Product Code
            </label>
            <input
              type="text"
              placeholder="e.g., BEV-001"
              value={form.code}
              onChange={e => setForm({...form, code: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          {/* Product Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Name
            </label>
            <input
              type="text"
              placeholder="Enter product name"
              value={form.name}
              onChange={e => setForm({...form, name: e.target.value})}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>

          {/* Price and Stock */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Price {isWeighed && "(per kg)"}
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={form.price}
                  onChange={e => setForm({...form, price: e.target.value})}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stock {isWeighed && "(kg)"}
              </label>
              <input
                type="number"
                step={isWeighed ? "0.001" : "1"}
                placeholder={isWeighed ? "0.000" : "0"}
                value={form.stock}
                onChange={e => setForm({...form, stock: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-gray-200">
          <div className="flex space-x-3">
            <button
              onClick={handleSubmit}
              disabled={loading || !form.code || !form.name}
              className={`
                flex-1 px-6 py-3 rounded-xl font-semibold transition-all duration-200
                ${loading || !form.code || !form.name
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white hover:from-emerald-700 hover:to-teal-600'
                }
              `}
            >
              {loading ? 'Saving...' : 'Save Product'}
            </button>
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors duration-200"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}