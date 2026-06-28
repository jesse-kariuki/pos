// API Service utility for centralized API calls
// This provides a clean interface to your Spring Boot backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Custom error class for API responses
export class ApiError extends Error {
  constructor(
    public message: string,
    public status?: string,
    public statusCode?: number,
    public fieldErrors?: Record<string, string>
  ) {
    super(message);
    this.name = 'ApiError';
    // Ensure the error is properly constructed
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

// Helper function to get auth token
export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
};

// Helper function to get auth headers
export const getAuthHeaders = (): HeadersInit => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

// Auth API
export const authAPI = {
  login: async (username: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: username, password }),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }
    
    const result = await response.json();
    
    // Store token - check for both jwt and token fields
    const token = result.data?.jwt;
    if (token) {
      localStorage.setItem('token', token);
    }
    
    // Store user info if available
    if (result.user) {
      localStorage.setItem('user', JSON.stringify(result.user));
    }
    
    return result;
  },

  signup: async (userData: { username: string; password: string; email?: string }) => {
    const response = await fetch(`${API_BASE_URL}api/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Signup failed');
    }
    
    return response.json();
  },
};

// User API
export const userAPI = {
  getProfile: async () => {
    const response = await fetch(`${API_BASE_URL}/api/user/profile`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }
    
    return response.json();
  },

  getUserById: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/api/user/${id}`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch user');
    }
    
    return response.json();
  },
};

// Product API
export const productAPI = {
  create: async (productData: any) => {
    const response = await fetch(`${API_BASE_URL}/api/products/create`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(productData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create product');
    }
    
    return response.json();
  },

  update: async (id: number, productData: any) => {
    const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(productData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update product');
    }
    
    return response.json();
  },

 delete: async (id: number) => {
  const response = await fetch(`${API_BASE_URL}/api/products/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to delete product');
  const text = await response.text();
  return text ? JSON.parse(text) : {};
},

  uploadImage: async (productId: number, imageFile: File) => {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/api/products/${productId}/image`, {
      method: 'POST',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      body: formData,
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload image');
    }
    
    return response.json();
  },

  search: async (keyword: string) => {
    const response = await fetch(
      `${API_BASE_URL}/api/products/search?keyword=${encodeURIComponent(keyword)}`,
      {
        headers: getAuthHeaders(),
      }
    );
    
    if (!response.ok) {
      throw new Error('Search failed');
    }
    
    return response.json();
  },
};

// Inventory API
export const inventoryAPI = {
  create: async (inventoryData: any) => {
    const response = await fetch(`${API_BASE_URL}/api/inventory/create`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(inventoryData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to create inventory');
    }
    
    return response.json();
  },

  getById: async (id: number) => {
    const response = await fetch(`${API_BASE_URL}/api/inventory/id/${id}`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch inventory');
    }
    
    return response.json();
  },

  getBySku: async (sku: string) => {
    const response = await fetch(`${API_BASE_URL}/api/inventory/sku/${sku}`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch inventory by SKU');
    }
    
    return response.json();
  },

  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/api/inventory/all`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch inventory');
    }
    
    return response.json();
  },

  update: async (id: number, inventoryData: any) => {
    const response = await fetch(`${API_BASE_URL}/api/inventory/${id}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(inventoryData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to update inventory');
    }
    
    return response.json();
  },

  delete: async (id: number) => {
  const response = await fetch(`${API_BASE_URL}/api/inventory/${id}`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
  });
  if (!response.ok) throw new Error('Failed to delete inventory');
  const text = await response.text();
  return text ? JSON.parse(text) : {};
},
};

// Order API
export const orderAPI = {
  create: async (orderData: {
  orderItems: Array<{ productId: number; quantity: number }>;
  paymentMethod: string;
  saleDateTime?: string;
  phoneNumber?: string;
  amountPaid?: number;
}) => {
  const response = await fetch(`${API_BASE_URL}/api/orders`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(orderData),
  });

  if (!response.ok) {
    // Parse JSON separately, never inside a try that wraps our throw
    let errorData: { message?: string; status?: string; fieldErrors?: Record<string, string> } = {};
    
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      errorData = await response.json();
    }

    console.log('[DEBUG] Order error response:', { 
      httpStatus: response.status, 
      apiStatus: errorData.status, 
      message: errorData.message 
    });

    // Throw OUTSIDE any try/catch so it propagates cleanly
    throw new ApiError(
      errorData.message || `Request failed (${response.status})`,
      errorData.status,        // e.g. "INSUFFICIENT_STOCK"
      response.status,         // e.g. 409
      errorData.fieldErrors
    );
  }

  return response.json();
},

  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/api/orders`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }
    
    return response.json();
  },

  getByDateRange: async (startDate: string, endDate: string) => {
    const response = await fetch(
      `${API_BASE_URL}/api/orders/by-date?start=${startDate}&end=${endDate}`,
      {
        headers: getAuthHeaders(),
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch orders by date');
    }
    
    return response.json();
  },

  getTodayTotal: async () => {
    const response = await fetch(`${API_BASE_URL}/api/orders/today/total`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch today\'s total');
    }
    
    return response.json();
  },

  getByStatus: async (status: string) => {
    const response = await fetch(`${API_BASE_URL}/api/orders/status/${status}`, {
      headers: getAuthHeaders(),
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch orders by status');
    }
    
    return response.json();
  },
  getMonthlyTotal: async () => {
    const response = await fetch(`${API_BASE_URL}/api/orders/monthly/total`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch monthly total");
    const data = await response.text();
    return data ? parseFloat(data) : 0;
  },
  getTopSelling: async () => {
    const response = await fetch(`${API_BASE_URL}/api/orders/reports/top-selling`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error("Failed to fetch top selling products");
    return response.json();
  },
};

// Scan API
export const scanAPI = {
  scan: async (barcode: string) => {
    const response = await fetch(
      `${API_BASE_URL}/api/scan?barcode=${encodeURIComponent(barcode)}`,
      {
        method: 'POST',
        headers: getAuthHeaders(),
      }
    );
    
    if (!response.ok) {
      throw new Error('Product not found');
    }
    
    return response.json();
  },
};

// TypeScript interfaces for type safety
export interface User {
  id: number;
  username: string;
  email?: string;
  role: string;
}

export interface Product {
  id: number;
  name: string;
  code: string;
  description?: string;
  markedPrice: number;
  sellingPrice: number;
  image?: string;
  createdAt: string;
  updatedAt?: string;
  type: string;
}

export interface InventoryItem {
  id: number;
  product: Product;
  quantity: number;
//   reorderLevel: number;
//   lastRestocked: string;
}

export interface OrderItem {
  productId: number;
  quantity: number;
}

export interface Order {
  id: number;
  totalAmount: number;
  createdAt: string;
  paymentMethod: string;
  status: string;
  orderItems: OrderItem[];
}

export interface CartItemDto {
  productId: number;
  productName: string;
  total: number;
  quantity: number;
  productSku: string;
  unitPrice: number;
}

// ============================================================
// ADD THESE TO YOUR EXISTING api-service.ts FILE
// ============================================================

// Purchase API
export const purchaseAPI = {
  create: async (purchaseData: {
    productId: number;
    quantityBought: number;
    unit: string;
    totalCost: number;
    notes?: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/api/purchases`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(purchaseData),
    });
    if (!response.ok) throw new Error('Failed to create purchase');
    return response.json();
  },

  getAll: async () => {
    const response = await fetch(`${API_BASE_URL}/api/purchases`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch purchases');
    return response.json();
  },

  getByMonth: async (year: number, month: number) => {
    const response = await fetch(
      `${API_BASE_URL}/api/purchases/monthly?year=${year}&month=${month}`,
      { headers: getAuthHeaders() }
    );
    if (!response.ok) throw new Error('Failed to fetch monthly purchases');
    return response.json();
  },
};

// Report API
export const reportAPI = {
  getMonthlyReport: async (year: number, month: number) => {
    const response = await fetch(
      `${API_BASE_URL}/api/reports/monthly?year=${year}&month=${month}`,
      { headers: getAuthHeaders() }
    );
    if (!response.ok) throw new Error('Failed to fetch monthly report');
    return response.json();
  },

  getAllTimeProfit: async () => {
    const response = await fetch(`${API_BASE_URL}/api/reports/profit`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) throw new Error('Failed to fetch profit report');
    return response.json();
  },
};



export interface PurchaseResponse {
  id: number;
  productId: number;
  productName: string;
  productCode: string;
  quantityBought: number;
  unit: string;
  totalCost: number;
  costPerUnit: number;
  notes?: string;
  createdAt: string;
}

export interface ProductProfitDto {
  productId: number;
  productName: string;
  productCode: string;
  totalCost: number;
  totalRevenue: number;
  profit: number;
  marginPercent: number;
  totalBought: number;
  buyingUnit: string;
  totalSold: number;
  sellingUnit: string;
  isLossMaking: boolean;
}

export interface MonthlyReportDto {
  month: string;
  totalRevenue: number;
  totalCost: number;
  netProfit: number;
  overallMargin: number;
  productBreakdown: ProductProfitDto[];
  topPerformers: ProductProfitDto[];
  lossMakers: ProductProfitDto[];
}