const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

class ApiError extends Error {
  constructor(message, status, data = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

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

export const transactionApi = {
  // Get all transactions
  getTransactions: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });

    const queryString = queryParams.toString();
    const url = `/transactions${queryString ? `?${queryString}` : ''}`;
    
    return apiRequest(url);
  },

  // Get a single transaction
  getTransaction: async (id, userId) => {
    return apiRequest(`/transactions/${id}?user_id=${userId}`);
  },

  // Create a new transaction
  createTransaction: async (transactionData) => {
    return apiRequest('/transactions', {
      method: 'POST',
      body: JSON.stringify(transactionData),
    });
  },

  // Update a transaction
  updateTransaction: async (id, transactionData) => {
    return apiRequest(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(transactionData),
    });
  },

  // Delete a transaction
  deleteTransaction: async (id, userId) => {
    return apiRequest(`/transactions/${id}?user_id=${userId}`, {
      method: 'DELETE',
    });
  },

  // Get transaction statistics
  getTransactionStats: async (params = {}) => {
    const queryParams = new URLSearchParams();
    
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        queryParams.append(key, value);
      }
    });

    const queryString = queryParams.toString();
    const url = `/transactions/stats/summary${queryString ? `?${queryString}` : ''}`;
    
    return apiRequest(url);
  },
};

export const categoryApi = {
  // Get all categories
  getCategories: async (type = null) => {
    const url = `/categories${type ? `?type=${type}` : ''}`;
    return apiRequest(url);
  },

  // Get categories grouped by type
  getGroupedCategories: async () => {
    return apiRequest('/categories/grouped');
  },

  // Create a new category
  createCategory: async (categoryData) => {
    return apiRequest('/categories', {
      method: 'POST',
      body: JSON.stringify(categoryData),
    });
  },
};

export { ApiError };