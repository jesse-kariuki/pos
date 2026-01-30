"use client";

import { useState, useEffect, useCallback } from "react";
import { inventoryAPI, orderAPI, productAPI } from "@/lib/api-service"; 
// Import useRouter for redirection after logout
import { useRouter } from "next/navigation"; 

// --- Dashboard Section ---
function DashboardSection() {
  const [stats, setStats] = useState({
    todaySales: 0,
    monthSales: 0,
    orderCount: 0,
    avgOrderValue: 0,
    topProducts: [] as any[]
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const today = await orderAPI.getTodayTotal();
        const orders = await orderAPI.getAll();
        const monthly = await orderAPI.getMonthlyTotal(); 
        const topProd = await orderAPI.getTopSelling(); 

        const totalValue = orders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0);

        setStats({
          todaySales: today || 0,
          monthSales: monthly || 0,
          orderCount: orders.length,
          avgOrderValue: orders.length > 0 ? totalValue / orders.length : 0,
          topProducts: topProd || []
        });
      } catch (err) {
        console.error("Stats load failed", err);
      }
    };
    loadStats();
  }, []);

  return (
    <section>
      <h2 style={{ color: "#059669", fontWeight: 800, fontSize: 26, marginBottom: 24 }}>Business Overview</h2>
      
      {/* --- STATS GRID --- */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20, marginBottom: 32 }}>
        <StatCard title="Today's Sales" value={`Ksh ${stats.todaySales.toLocaleString()}`} color="#059669" />
        <StatCard title="This Month" value={`Ksh ${stats.monthSales.toLocaleString()}`} color="#2563eb" />
        <StatCard title="Transactions" value={stats.orderCount.toString()} color="#1e293b" />
        <StatCard title="Avg. Ticket" value={`Ksh ${stats.avgOrderValue.toFixed(0)}`} color="#7c3aed" />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24 }}>
        {/* --- TOP PRODUCTS TABLE --- */}
        <div style={{ background: "#fff", padding: 24, borderRadius: 16, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16, color: "#1e293b" }}>Top Selling Products</h3>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ textAlign: "left", color: "#64748b", fontSize: 13, borderBottom: "1px solid #f1f5f9" }}>
                <th style={{ padding: "10px 0" }}>Product</th>
                <th>Units Sold</th>
                <th>Revenue</th>
              </tr>
            </thead>
            <tbody>
              {stats.topProducts.map((p, i) => (
                <tr key={i} style={{ borderBottom: "1px solid #f8fafc" }}>
                  <td style={{ padding: "12px 0", fontWeight: 600, color: "#334155" }}>{p.name}</td>
                  <td>{p.quantitySold}</td>
                  <td style={{ fontWeight: 600, color: "#059669" }}>Ksh {p.revenue.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* --- QUICK TIPS / ALERTS ---
        <div style={{ background: "#f0fdf4", padding: 24, borderRadius: 16, border: "1px dashed #bbf7d0" }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 12, color: "#166534" }}>Performance Insights</h3>
          <p style={{ fontSize: 14, color: "#166534", lineHeight: 1.5 }}>
            Your sales are up <b>12%</b> compared to last month. 
            <br/><br/>
            💡 <b>Tip:</b> Your highest traffic is between 4 PM and 7 PM. Ensure stock is replenished by noon.
          </p>
        </div> */}
      </div>
    </section>
  );
}

// Reusable Stat Card Component
function StatCard({ title, value, color }: { title: string, value: string, color: string }) {
  return (
    <div style={{ background: "#fff", padding: 24, borderRadius: 16, boxShadow: "0 4px 12px rgba(0,0,0,0.05)", borderLeft: `6px solid ${color}` }}>
      <p style={{ color: "#64748b", fontSize: 13, fontWeight: 600, margin: 0 }}>{title}</p>
      <h3 style={{ fontSize: 24, color: "#1e293b", margin: "8px 0 0 0" }}>{value}</h3>
    </div>
  );
}

// --- Orders Section ---
function OrdersSection() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <p>Loading Transactions...</p>;

  return (
    <section>
      <h2 style={{ color: "#059669", fontWeight: 800, fontSize: 26, marginBottom: 24 }}>Transaction History</h2>
      <div style={{ background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", color: "#64748b", borderBottom: "2px solid #f1f5f9" }}>
              <th style={{ padding: 12 }}>Order ID</th>
              <th style={{ padding: 12 }}>Date</th>
              <th style={{ padding: 12 }}>Method</th>
              <th style={{ padding: 12 }}>Items</th>
              <th style={{ padding: 12 }}>Total</th>
              <th style={{ padding: 12 }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: 12, fontWeight: 700 }}>#{order.id}</td>
                <td style={{ padding: 12 }}>{new Date(order.createdAt).toLocaleDateString()}</td>
                <td style={{ padding: 12 }}>{order.paymentMethod}</td>
                <td style={{ padding: 12 }}>{order.orderItems?.length || 0}</td>
                <td style={{ padding: 12, fontWeight: 600 }}>Ksh {order.totalAmount?.toFixed(2)}</td>
                <td style={{ padding: 12 }}>
                  <span style={{ 
                    padding: "4px 8px", borderRadius: 6, fontSize: 11, fontWeight: 800,
                    background: order.status === "COMPLETED" ? "#dcfce7" : "#fef9c3",
                    color: order.status === "COMPLETED" ? "#166534" : "#854d0e"
                  }}>
                    {order.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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

  const filtered = items.filter(item =>
    item.product?.name?.toLowerCase().includes(search.toLowerCase()) ||
    item.product?.code?.toLowerCase().includes(search.toLowerCase())
  );

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
        quantity: parseInt(formData.stock)
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
        quantity: parseInt(updatedData.stock)
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

  if (loading) return <p style={{ color: "#059669", padding: 20 }}>Syncing with Store Database...</p>;

  return (
    <section>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <h2 style={{ color: "#059669", fontWeight: 800, fontSize: 26 }}>Inventory</h2>
        <button 
          onClick={() => setShowAdd(true)} 
          style={{ background: "#059669", color: "#fff", border: "none", borderRadius: 8, padding: "10px 20px", fontWeight: 700, cursor: "pointer" }}
        >
          + Add New Product
        </button>
      </div>

      <div style={{ background: "#fff", borderRadius: 16, boxShadow: "0 4px 12px rgba(0,0,0,0.05)", padding: 24 }}>
        <input
          type="text"
          placeholder="Search by name or code..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: "100%", padding: 12, borderRadius: 8, border: "1px solid #e2e8f0", marginBottom: 20 }}
        />
        
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ textAlign: "left", color: "#64748b", borderBottom: "2px solid #f1f5f9" }}>
              <th style={{ padding: 12 }}>Code</th>
              <th style={{ padding: 12 }}>Product Name</th>
              <th style={{ padding: 12 }}>Price</th>
              <th style={{ padding: 12 }}>In Stock</th>
              <th style={{ padding: 12 }}>Status</th>
              <th style={{ padding: 12 }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(item => (
              <tr key={item.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                <td style={{ padding: 12, color: "#64748b", fontSize: 13 }}>{item.product?.code}</td>
                <td style={{ padding: 12, fontWeight: 600 }}>{item.product?.name}</td>
                <td style={{ padding: 12 }}>Ksh {item.product?.sellingPrice?.toFixed(2)}</td>
                <td style={{ padding: 12 }}>{item.quantity}</td>
                <td style={{ padding: 12 }}>
                  <span style={{ 
                    padding: "4px 8px", borderRadius: 6, fontSize: 12, fontWeight: 700,
                    background: item.quantity < 10 ? "#fee2e2" : "#dcfce7",
                    color: item.quantity < 10 ? "#991b1b" : "#166534"
                  }}>
                    {item.quantity < 10 ? "Low Stock" : "In Stock"}
                  </span>
                </td>
                <td style={{ padding: 12 }}>
                  <button 
                    onClick={() => setShowEdit({
                      inventoryId: item.id,
                      productId: item.product?.id,
                      name: item.product?.name,
                      code: item.product?.code,
                      price: item.product?.sellingPrice,
                      stock: item.quantity
                    })} 
                    style={{ color: "#059669", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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
  const router = useRouter();

  const handleLogout = () => {
    // Clear token or auth data from storage
    localStorage.removeItem("token"); 
    // Redirect to login page
    router.push("/login"); 
  };

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f8fafc" }}>
      {/* Sidebar */}
      <aside style={{ 
        width: 260, 
        background: "#fff", 
        borderRight: "1px solid #e2e8f0", 
        padding: 30, 
        display: "flex", 
        flexDirection: "column",
        justifyContent: "space-between" 
      }}>
        <div>
          <div style={{ color: "#059669", fontSize: 22, fontWeight: 900, marginBottom: 40 }}>RETAIL POS</div>
          {["Dashboard", "Inventory", "Orders"].map(tab => (
            <div 
              key={tab}
              onClick={() => setActiveTab(tab)}
              style={{ 
                padding: "12px 16px", cursor: "pointer", borderRadius: 8, marginBottom: 8,
                background: activeTab === tab ? "#f0fdf4" : "transparent",
                color: activeTab === tab ? "#059669" : "#64748b",
                fontWeight: activeTab === tab ? 700 : 500
              }}
            >
              {tab}
            </div>
          ))}
        </div>

        {/* Logout Button */}
        <button 
          onClick={handleLogout}
          style={{
            marginTop: "auto",
            padding: "12px 16px",
            background: "#fee2e2",
            color: "#991b1b",
            border: "none",
            borderRadius: 8,
            fontWeight: 700,
            cursor: "pointer",
            textAlign: "left"
          }}
        >
          Logout
        </button>
      </aside>

      <main style={{ flex: 1, padding: 40 }}>
        {activeTab === "Dashboard" && <DashboardSection />}
        {activeTab === "Inventory" && <InventorySection />}
        {activeTab === "Orders" && <OrdersSection />}
      </main>
    </div>
  );
}

// --- Modal Component ---
function ProductModal({ onClose, onSave, product, title }: any) {
  const [form, setForm] = useState(product || { name: "", price: "", stock: "", code: "", type:"FIXED" });

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 50 }}>
      <div style={{ background: "#fff", padding: 32, borderRadius: 16, width: 400, boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
        <h3 style={{ marginBottom: 20, fontSize: 20, fontWeight: 700 }}>{title}</h3>
        
        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>Selling Method</label>
        <select 
          style={{ width: "100%", padding: 10, marginBottom: 16, border: "1px solid #e2e8f0", borderRadius: 8, background: "#fff" }}
          value={form.type}
          onChange={e => setForm({...form, type: e.target.value})}
        >
          <option value="FIXED">Fixed Price (Per Piece/Pack)</option>
          <option value="WEIGHED">Weighed (Per KG/Scale Item)</option>
        </select>

        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>Item Code / SKU</label>
        <input 
          placeholder="e.g. BEV-001"
          style={{ width: "100%", padding: 10, marginBottom: 16, border: "1px solid #e2e8f0", borderRadius: 8 }} 
          value={form.code} 
          onChange={e => setForm({...form, code: e.target.value})} 
        />

        <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>Product Name</label>
        <input 
          style={{ width: "100%", padding: 10, marginBottom: 16, border: "1px solid #e2e8f0", borderRadius: 8 }} 
          value={form.name} 
          onChange={e => setForm({...form, name: e.target.value})} 
        />
        
        <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>Price (Ksh)</label>
            <input 
              type="number" 
              style={{ width: "100%", padding: 10, border: "1px solid #e2e8f0", borderRadius: 8 }} 
              value={form.price} 
              onChange={e => setForm({...form, price: e.target.value})} 
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#64748b", marginBottom: 4 }}>Stock Qty</label>
            <input 
              type="number" 
              style={{ width: "100%", padding: 10, border: "1px solid #e2e8f0", borderRadius: 8 }} 
              value={form.stock} 
              onChange={e => setForm({...form, stock: e.target.value})} 
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: 12, marginTop: 10 }}>
          <button 
            onClick={() => onSave(form)} 
            disabled={!form.code || !form.name}
            style={{ 
              flex: 1, background: (!form.code || !form.name) ? "#94a3b8" : "#059669", 
              color: "#fff", border: "none", padding: 12, borderRadius: 8, cursor: "pointer", fontWeight: 700 
            }}
          >
            Save Changes
          </button>
          <button 
            onClick={onClose} 
            style={{ flex: 1, background: "#f1f5f9", color: "#64748b", border: "none", padding: 12, borderRadius: 8, cursor: "pointer" }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}