"use client";

import { useState, useEffect, useRef } from "react";
import { FaSearch, FaShoppingCart, FaTrash, FaPlus, FaReceipt, FaPhone, FaMoneyBillWave, FaCashRegister, FaKey, FaUserCircle, FaBarcode, FaTimes, FaEllipsisH } from "react-icons/fa";
import { inventoryAPI, scanAPI, orderAPI, productAPI, type Product, type CartItemDto } from "@/lib/api-service";

interface CartItem extends Product {
  qty: number;
}

export default function CashierDashboard() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [barcode, setBarcode] = useState('');
  const [activeInput, setActiveInput] = useState<'barcode' | 'phone' | 'cash'>('barcode');
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'cash'>('mpesa');
  const [phone, setPhone] = useState('');
  const [cashGiven, setCashGiven] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showProducts, setShowProducts] = useState(false);
  const [showPaymentSection, setShowPaymentSection] = useState(true);
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleGlobalClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';
      
      if (!isInput) {
        barcodeInputRef.current?.focus();
      }
    };

    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);
  
  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      setError('No authentication token found. Please login again.');
      return;
    }
    
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      setLoading(true);
      setError('');
      const inventoryData = await inventoryAPI.getAll();
      const productList = inventoryData.map((item: any) => item.product);
      setProducts(productList);
    } catch (err: any) {
      console.error('Error loading inventory:', err);
      setError(err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (keyword: string) => {
    setSearchTerm(keyword);
    
    if (!keyword.trim()) {
      loadInventory();
      setShowProducts(false);
      return;
    }

    try {
      setError('');
      const results = await productAPI.search(keyword);
      setProducts(results);
      setShowProducts(true);
    } catch (err: any) {
      console.error('Search error:', err);
      setError(err.message || 'Search failed');
    }
  };

  const handleScan = async (scannedBarcode: string) => {
    if (!scannedBarcode.trim()) return;
  
    try {
      setError('');
      const cartItem: CartItemDto = await scanAPI.scan(scannedBarcode);
      
      const newWeighedItem: CartItem = {
        id: cartItem.productId,
        name: cartItem.productName,
        sellingPrice: cartItem.unitPrice,
        qty: cartItem.quantity,
        code: cartItem.productSku,
        markedPrice: cartItem.unitPrice,
        createdAt: '',
        type: 'WEIGHED'
      };
  
      setCart((prev) => [...prev, newWeighedItem]);
      
      setBarcode('');
      setSuccess(`Added ${cartItem.productName} (${cartItem.quantity}kg)`);
      setTimeout(() => setSuccess(''), 2000);
    } catch (err: any) {
      setError(err.message || 'Scan failed');
      setTimeout(() => setError(''), 3000);
    }
  };

  const total = cart.reduce((sum, item) => sum + (item.sellingPrice * item.qty), 0);

  function handleDialPadInput(value: string) {
    if (activeInput === 'barcode') {
      if (value === 'clear') {
        setBarcode('');
      } else if (value === 'enter') {
        handleScan(barcode);
      } else {
        setBarcode((prev) => prev + value);
      }
    } else if (activeInput === 'phone') {
      if (value === 'clear') {
        setPhone('');
      } else if (value === 'enter') {
        // Validate phone
      } else {
        setPhone((prev) => prev + value);
      }
    } else if (activeInput === 'cash') {
      if (value === 'clear') {
        setCashGiven('');
      } else if (value === 'enter') {
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
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      } else {
        return [...prev, { ...product, qty: 1 }];
      }
    });
    setSuccess(`Added ${product.name} to cart`);
    setTimeout(() => setSuccess(''), 2000);
  }

  function changeQty(id: number, change: number) {
    setCart((prev) => {
      return prev.map((item) => {
        if (item.id === id) {
          const newQty = item.qty + change;
          if (newQty <= 0) return null;
          return { ...item, qty: newQty };
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  }

  function removeFromCart(id: number) {
    setCart((prev) => prev.filter(item => item.id !== id));
  }

  const printReceipt = () => {
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      setError("Pop-up blocked! Please allow pop-ups to print receipts.");
      return;
    }
  
    const receiptDate = new Date().toLocaleString();
  
    const itemRows = cart.map(item => `
      <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
        <span style="flex: 2;">${item.name.substring(0, 18)}${item.name.length > 18 ? '..' : ''}</span>
        <span style="flex: 1; text-align: right;">${item.qty}${item.type === 'WEIGHED' ? 'kg' : ''}</span>
        <span style="flex: 1; text-align: right;">${(item.sellingPrice * item.qty).toFixed(2)}</span>
      </div>
    `).join('');
  
    printWindow.document.write(`
      <html>
        <head>
          <title>Receipt</title>
          <style>
            @page { size: 80mm auto; margin: 0; }
            body { 
              font-family: 'Courier New', Courier, monospace; 
              width: 72mm;
              padding: 4mm; 
              font-size: 12px; 
              color: #000;
            }
            .divider { border-top: 1px dashed #000; margin: 5px 0; }
            .center { text-align: center; }
            .bold { font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="center bold" style="font-size: 16px;">ESIT GROCERIES</div>
          <div class="center">Nairobi, Kenya</div>
          <div class="center">${receiptDate}</div>
          <div class="divider"></div>
          <div style="display: flex; justify-content: space-between;" class="bold">
            <span style="flex: 2;">ITEM</span>
            <span style="flex: 1; text-align: right;">QTY</span>
            <span style="flex: 1; text-align: right;">TOTAL</span>
          </div>
          <div class="divider"></div>
          ${itemRows}
          <div class="divider"></div>
          <div style="display: flex; justify-content: space-between;" class="bold">
            <span>GRAND TOTAL</span>
            <span>Ksh ${total.toFixed(2)}</span>
          </div>
          <div class="divider"></div>
          <div class="center">THANK YOU FOR YOUR PATRONAGE</div>
        </body>
      </html>
    `);
  
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const completePayment = async () => {
    if (cart.length === 0) {
      setError('Cart is empty!');
      setTimeout(() => setError(''), 3000);
      return;
    }

    try {
      setError('');
      setLoading(true);
      
      const orderRequest = {
        orderItems: cart.map(item => ({
          productId: item.id,
          quantity: item.qty,
        })),
        paymentMethod: paymentMethod.toUpperCase(),
        phoneNumber: paymentMethod === 'mpesa' ? phone || "254700000000" : undefined,
        amountPaid: paymentMethod === 'cash' ? Number(cashGiven) || total : total,
      };

      const order = await orderAPI.create(orderRequest);
      
      setSuccess(`Payment completed! Order #${order.id}`);
      
      printReceipt();
      
      // Clear cart and reset
      setCart([]);
      setPhone('');
      setCashGiven('');
      setBarcode('');
      setSearchTerm('');
      setShowProducts(false);
      
      await loadInventory();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      console.error('Payment error:', err);
      
      if (err.message.includes('403') || err.message.includes('Forbidden')) {
        setError('Authentication failed. Please login again.');
        setTimeout(() => {
          window.location.href = '/login';
        }, 3000);
      } else {
        setError(err.message || 'Payment failed');
      }
      
      setTimeout(() => setError(''), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-hidden">
      {/* Header */}
      <header className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-900 border-b border-emerald-700/50 shadow-lg">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Logo and Title */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <FaCashRegister className="text-2xl text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">POS</span>
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-wide">ESIT GROCERIES</h1>
                <p className="text-emerald-200 text-sm">Point of Sale System</p>
              </div>
            </div>

            {/* Center: Search */}
            <div className="flex-1 max-w-xl mx-8">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="h-5 w-5 text-emerald-300" />
                </div>
                <input
                  ref={barcodeInputRef}
                  type="text"
                  placeholder="Search products by name, code, or scan barcode..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-emerald-900/50 border-2 border-emerald-600/30 rounded-xl text-white placeholder-emerald-300 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
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

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row h-[calc(100vh-80px)]">
        {/* Left Panel - Products & Cart */}
        <div className="flex-1 flex flex-col lg:flex-row p-4 lg:p-6 space-y-4 lg:space-y-0 lg:space-x-6">
          {/* Products Panel */}
          <div className="lg:w-2/3 flex flex-col">
            {/* Products Search Results */}
            {showProducts && searchTerm && (
              <div className="mb-4 bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 shadow-xl overflow-hidden">
                <div className="p-4 border-b border-gray-700/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-emerald-900/50 rounded-lg">
                        <FaSearch className="h-5 w-5 text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white">Search Results</h3>
                        <p className="text-sm text-gray-400">{products.length} products found</p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        setShowProducts(false);
                        setSearchTerm('');
                        loadInventory();
                      }}
                      className="p-2 hover:bg-gray-700/50 rounded-lg transition-colors"
                    >
                      <FaTimes className="h-5 w-5 text-gray-400" />
                    </button>
                  </div>
                </div>
                <div className="p-4 max-h-96 overflow-y-auto">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {products.map(product => (
                      <div
                        key={product.id}
                        onClick={() => addToCart(product)}
                        className="group relative bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700/50 rounded-xl p-4 cursor-pointer transition-all duration-300 hover:border-emerald-500/50 hover:shadow-2xl hover:-translate-y-1"
                      >
                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <FaPlus className="h-4 w-4 text-emerald-400" />
                        </div>
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-emerald-900 to-emerald-800 rounded-lg flex items-center justify-center">
                            <span className="text-2xl">📦</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-white text-sm truncate">{product.name}</h4>
                            <p className="text-xs text-gray-400 mt-1 truncate">{product.code}</p>
                            <div className="mt-2 flex items-center justify-between">
                              <span className="text-emerald-400 font-bold">Ksh {product.sellingPrice.toFixed(2)}</span>
                              <span className={`text-xs px-2 py-1 rounded-full ${product.type === 'WEIGHED' ? 'bg-blue-900/30 text-blue-400' : 'bg-purple-900/30 text-purple-400'}`}>
                                {product.type === 'WEIGHED' ? 'Weighed' : 'Fixed'}
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

            {/* Cart Items */}
            <div className="flex-1 bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 shadow-2xl overflow-hidden flex flex-col">
              <div className="p-6 border-b border-gray-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-gradient-to-br from-emerald-900 to-emerald-800 rounded-xl">
                      <FaShoppingCart className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Shopping Cart</h2>
                      <p className="text-sm text-gray-400">Manage items and quantities</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-emerald-400">Ksh {total.toFixed(2)}</div>
                    <div className="text-sm text-gray-400">{cart.length} items</div>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
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
                      <div className="w-24 h-24 bg-gradient-to-br from-gray-800 to-gray-900 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-gray-700">
                        <FaShoppingCart className="h-12 w-12 text-gray-600" />
                      </div>
                      <h3 className="text-xl font-semibold text-gray-300 mb-2">Your cart is empty</h3>
                      <p className="text-gray-500">Scan or search products to add items</p>
                    </div>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-700/50">
                    {cart.map(item => (
                      <div key={item.id} className="p-4 hover:bg-gray-800/30 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <div className="relative">
                              <div className="w-12 h-12 bg-gradient-to-br from-emerald-900/50 to-emerald-800/50 rounded-lg flex items-center justify-center">
                                <span className="text-xl">📦</span>
                              </div>
                              {item.type === 'WEIGHED' && (
                                <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                                  <span className="text-xs font-bold text-white">W</span>
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-white truncate">{item.name}</h4>
                              <p className="text-sm text-gray-400 truncate">{item.code}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-6">
                            {/* Quantity Controls */}
                            <div className="flex items-center space-x-3">
                              {item.type !== 'WEIGHED' && (
                                <button
                                  onClick={() => changeQty(item.id, -1)}
                                  className="w-8 h-8 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors"
                                >
                                  <span className="text-white font-bold">-</span>
                                </button>
                              )}
                              
                              <div className="text-center min-w-16">
                                <div className="text-lg font-bold text-white">{item.qty}</div>
                                <div className="text-xs text-gray-400">
                                  {item.type === 'WEIGHED' ? 'kg' : 'pcs'}
                                </div>
                              </div>
                              
                              {item.type !== 'WEIGHED' && (
                                <button
                                  onClick={() => changeQty(item.id, 1)}
                                  className="w-8 h-8 flex items-center justify-center bg-emerald-700 hover:bg-emerald-600 rounded-lg transition-colors"
                                >
                                  <span className="text-white font-bold">+</span>
                                </button>
                              )}
                            </div>
                            
                            {/* Price and Total */}
                            <div className="text-right">
                              <div className="text-sm text-gray-400">Ksh {item.sellingPrice.toFixed(2)}</div>
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
            </div>
          </div>

          {/* Right Panel - Payment */}
          <div className={`lg:w-1/3 transition-all duration-300 ${showPaymentSection ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700/50 shadow-2xl h-full overflow-hidden">
              {/* Payment Header */}
              <div className="p-6 border-b border-gray-700/50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-gradient-to-br from-emerald-900 to-emerald-800 rounded-xl">
                      <FaReceipt className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Payment</h2>
                      <p className="text-sm text-gray-400">Complete transaction</p>
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

              {/* Payment Content */}
              <div className="p-6 space-y-6">
                {/* Barcode Scanner */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-2 flex items-center space-x-2">
                    <FaBarcode className="h-4 w-4 text-emerald-400" />
                    <span>Barcode Scanner</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={barcode}
                      onChange={e => setBarcode(e.target.value)}
                      onFocus={() => setActiveInput('barcode')}
                      onKeyPress={(e) => e.key === 'Enter' && handleScan(barcode)}
                      placeholder="Scan or enter barcode"
                      className="w-full pl-4 pr-12 py-3 bg-gray-900/50 border-2 border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
                    />
                    <button
                      onClick={() => handleScan(barcode)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 bg-emerald-700 hover:bg-emerald-600 rounded-lg transition-colors"
                    >
                      <FaSearch className="h-4 w-4 text-white" />
                    </button>
                  </div>
                </div>

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">Payment Method</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setPaymentMethod('mpesa')}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                        paymentMethod === 'mpesa'
                          ? 'border-emerald-500 bg-emerald-900/30'
                          : 'border-gray-700/50 bg-gray-800/50 hover:border-emerald-500/50'
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <div className={`p-3 rounded-lg ${paymentMethod === 'mpesa' ? 'bg-emerald-800' : 'bg-gray-700'}`}>
                          <FaPhone className="h-6 w-6 text-white" />
                        </div>
                        <span className="font-semibold text-white">M-Pesa</span>
                        <span className="text-xs text-gray-400">Mobile Money</span>
                      </div>
                    </button>
                    <button
                      onClick={() => setPaymentMethod('cash')}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                        paymentMethod === 'cash'
                          ? 'border-emerald-500 bg-emerald-900/30'
                          : 'border-gray-700/50 bg-gray-800/50 hover:border-emerald-500/50'
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <div className={`p-3 rounded-lg ${paymentMethod === 'cash' ? 'bg-emerald-800' : 'bg-gray-700'}`}>
                          <FaMoneyBillWave className="h-6 w-6 text-white" />
                        </div>
                        <span className="font-semibold text-white">Cash</span>
                        <span className="text-xs text-gray-400">Physical Payment</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Payment Input */}
                <div>
                  {paymentMethod === 'mpesa' ? (
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Phone Number (Optional)</label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        onFocus={() => setActiveInput('phone')}
                        placeholder="07XXXXXXXX"
                        className="w-full px-4 py-3 bg-gray-900/50 border-2 border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Amount Received</label>
                      <input
                        type="number"
                        value={cashGiven}
                        onChange={e => setCashGiven(e.target.value)}
                        onFocus={() => setActiveInput('cash')}
                        placeholder="Enter amount"
                        className="w-full px-4 py-3 bg-gray-900/50 border-2 border-gray-700/50 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/30"
                      />
                      {cashGiven && Number(cashGiven) > 0 && (
                        <div className="mt-3 p-3 bg-gradient-to-r from-emerald-900/30 to-emerald-800/30 rounded-xl border border-emerald-700/50">
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="text-sm text-emerald-300">Change Due</div>
                              <div className="text-xs text-gray-400">Amount to return</div>
                            </div>
                            <div className="text-2xl font-bold text-emerald-400">
                              Ksh {Math.max(0, (Number(cashGiven) - total)).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Dial Pad */}
                <div>
                  <label className="block text-sm font-semibold text-gray-300 mb-3">Quick Input</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
                      <button
                        key={n}
                        onClick={() => handleDialPadInput(n.toString())}
                        className="aspect-square flex items-center justify-center bg-gray-800/50 hover:bg-emerald-900/30 border border-gray-700/50 hover:border-emerald-500/50 rounded-xl text-xl font-bold text-white transition-all duration-200 hover:scale-105"
                      >
                        {n}
                      </button>
                    ))}
                    <button
                      onClick={() => handleDialPadInput('clear')}
                      className="aspect-square flex items-center justify-center bg-red-900/30 hover:bg-red-800/30 border border-red-700/50 hover:border-red-500/50 rounded-xl text-sm font-semibold text-red-300 transition-all duration-200"
                    >
                      Clear
                    </button>
                    <button
                      onClick={() => handleDialPadInput('0')}
                      className="aspect-square flex items-center justify-center bg-gray-800/50 hover:bg-emerald-900/30 border border-gray-700/50 hover:border-emerald-500/50 rounded-xl text-xl font-bold text-white transition-all duration-200 hover:scale-105"
                    >
                      0
                    </button>
                    <button
                      onClick={() => handleDialPadInput('enter')}
                      className="aspect-square flex items-center justify-center bg-gradient-to-br from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 border border-emerald-500/50 rounded-xl text-sm font-semibold text-white transition-all duration-200 hover:scale-105"
                    >
                      Enter
                    </button>
                  </div>
                </div>

                {/* Complete Payment Button */}
                <button
                  onClick={completePayment}
                  disabled={loading || cart.length === 0}
                  className={`w-full py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] ${
                    loading || cart.length === 0
                      ? 'bg-gray-700 cursor-not-allowed text-gray-500'
                      : 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-emerald-600 hover:from-emerald-700 hover:via-emerald-600 hover:to-emerald-700 text-white shadow-xl hover:shadow-2xl'
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

                {/* Mobile Toggle Button */}
                <button
                  onClick={() => setShowPaymentSection(!showPaymentSection)}
                  className="lg:hidden w-full py-3 bg-gray-800/50 hover:bg-gray-700/50 rounded-xl border border-gray-700/50 text-gray-400 font-semibold transition-colors"
                >
                  {showPaymentSection ? 'Hide Payment' : 'Show Payment'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div className="bg-gradient-to-r from-red-900/90 to-red-800/90 backdrop-blur-sm border border-red-700/50 rounded-xl p-4 shadow-2xl">
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
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div className="bg-gradient-to-r from-emerald-900/90 to-emerald-800/90 backdrop-blur-sm border border-emerald-700/50 rounded-xl p-4 shadow-2xl">
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
          className="lg:hidden fixed bottom-4 right-4 z-40 p-4 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-full shadow-2xl"
        >
          <FaEllipsisH className="h-6 w-6 text-white" />
        </button>
      )}
    </div>
  );
}