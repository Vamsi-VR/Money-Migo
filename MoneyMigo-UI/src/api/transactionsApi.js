// services/api.js

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// ============================================
// ERROR HANDLING
// ============================================

class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// ============================================
// CORE API REQUEST FUNCTION
// ============================================

const apiRequest = async (url, options = {}) => {
  try {
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(`${API_BASE_URL}${url}`, config);
    
    let data;
    try {
      data = await response.json();
    } catch (e) {
      data = null;
    }

    if (!response.ok) {
      throw new ApiError(
        data?.error || data?.message || `HTTP error! status: ${response.status}`,
        response.status,
        data
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Network error occurred', 0, error.message);
  }
};

// ============================================
// HELPER FUNCTIONS
// ============================================

const buildQueryString = (params) => {
  const queryParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, value);
    }
  });

  return queryParams.toString();
};

// ============================================
// TRANSACTION API FUNCTIONS
// ============================================

// Get all transactions
const getTransactions = async (params = {}) => {
  const queryString = buildQueryString(params);
  const url = `/transactions${queryString ? `?${queryString}` : ''}`;
  return apiRequest(url);
};

// Get a single transaction
const getTransaction = async (id, userId) => {
  return apiRequest(`/transactions/${id}?user_id=${userId}`);
};

// Create a new transaction
const createTransaction = async (transactionData) => {
  return apiRequest('/transactions', {
    method: 'POST',
    body: JSON.stringify(transactionData),
  });
};

// Update a transaction
const updateTransaction = async (id, transactionData) => {
  return apiRequest(`/transactions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(transactionData),
  });
};

// Delete a transaction
const deleteTransaction = async (id, userId) => {
  return apiRequest(`/transactions/${id}?user_id=${userId}`, {
    method: 'DELETE',
  });
};

// Get transaction statistics
const getTransactionStats = async (params = {}) => {
  const queryString = buildQueryString(params);
  const url = `/transactions/stats/summary${queryString ? `?${queryString}` : ''}`;
  return apiRequest(url);
};

// ============================================
// CATEGORY API FUNCTIONS
// ============================================

// Get all categories
const getCategories = async (type = null) => {
  const url = `/categories${type ? `?type=${type}` : ''}`;
  return apiRequest(url);
};

// Get categories grouped by type
const getGroupedCategories = async () => {
  return apiRequest('/categories/grouped');
};

// Create a new category
const createCategory = async (categoryData) => {
  return apiRequest('/categories', {
    method: 'POST',
    body: JSON.stringify(categoryData),
  });
};

// ============================================
// EXPORTS
// ============================================

// Export transaction API methods as an object
export const transactionApi = {
  getTransactions,
  getTransaction,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getTransactionStats,
};

// Export category API methods as an object
export const categoryApi = {
  getCategories,
  getGroupedCategories,
  createCategory,
};

// Export error class
export { ApiError };