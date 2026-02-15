// API Client for Antigravity Backend

const rawApiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
const API_BASE_URL = rawApiBaseUrl.replace(/\/+$/, '').replace(/\/api$/, '');

// Types
export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  isNewUser?: boolean;
}

export interface Workflow {
  id: string;
  user_id: string;
  name: string;
  type: 'estimate' | 'audit' | 'optimize';
  status: 'pending' | 'running' | 'completed' | 'failed';
  scope: string;
  config: Record<string, unknown>;
  started_at: string | null;
  completed_at: string | null;
  error: string | null;
  created_at: string;
  updated_at: string;
}

export interface Report {
  id: string;
  workflow_id: string | null;
  user_id: string;
  title: string;
  type: 'audit' | 'estimate' | 'optimization';
  total_emissions: number;
  unit: string;
  data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ReportStats {
  totalEmissions: number;
  reportCount: number;
  pendingWorkflows: number;
  weeklyChange: {
    thisWeek: number;
    lastWeek: number;
    percentChange: number;
  };
}

export interface ChatResponse {
  message: string;
  session_id: string;
  metadata?: {
    source?: string;
    emissions?: number;
    unit?: string;
    factor?: unknown;
  };
}

export interface EmissionsResponse {
  co2e: number;
  co2e_unit: string;
  emission_factor: Record<string, unknown>;
  input: Record<string, unknown>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Token management
let authToken: string | null = null;

export function setAuthToken(token: string | null): void {
  authToken = token;
  if (token) {
    localStorage.setItem('antigravity_token', token);
  } else {
    localStorage.removeItem('antigravity_token');
  }
}

export function getAuthToken(): string | null {
  if (!authToken) {
    authToken = localStorage.getItem('antigravity_token');
  }
  return authToken;
}

export function clearAuth(): void {
  authToken = null;
  localStorage.removeItem('antigravity_token');
  localStorage.removeItem('antigravity_user');
}

// Base fetch wrapper
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getAuthToken();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  try {
    const controller = new AbortController();
    const timeoutMs = 15000;
    const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);
    let response: Response;

    try {
      response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
        signal: controller.signal,
      });
    } finally {
      window.clearTimeout(timeoutId);
    }

    const data = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: data.error || `HTTP error ${response.status}`,
      };
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);

    if (error instanceof DOMException && error.name === 'AbortError') {
      return {
        success: false,
        error: 'Request timed out. Please try again.',
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
    };
  }
}

// Auth API
export const authApi = {
  async register(name: string, email: string): Promise<ApiResponse<AuthResponse>> {
    const response = await apiFetch<AuthResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email }),
    });
    
    if (response.success && response.data) {
      setAuthToken(response.data.token);
      localStorage.setItem('antigravity_user', JSON.stringify(response.data.user));
    }
    
    return response;
  },

  async login(email: string): Promise<ApiResponse<AuthResponse>> {
    const response = await apiFetch<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
    
    if (response.success && response.data) {
      setAuthToken(response.data.token);
      localStorage.setItem('antigravity_user', JSON.stringify(response.data.user));
    }
    
    return response;
  },

  async getMe(): Promise<ApiResponse<{ user: User }>> {
    return apiFetch<{ user: User }>('/api/auth/me');
  },

  logout(): void {
    clearAuth();
  },
};

// Workflows API
export const workflowsApi = {
  async list(params?: { status?: string; type?: string; limit?: number; offset?: number }): Promise<ApiResponse<{ workflows: Workflow[]; pagination: { total: number; limit: number; offset: number } }>> {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.set('status', params.status);
    if (params?.type) searchParams.set('type', params.type);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());
    
    const query = searchParams.toString();
    return apiFetch(`/api/workflows${query ? `?${query}` : ''}`);
  },

  async get(id: string): Promise<ApiResponse<{ workflow: Workflow }>> {
    return apiFetch(`/api/workflows/${id}`);
  },

  async create(data: { name: string; type: 'estimate' | 'audit' | 'optimize'; scope: string; config?: Record<string, unknown> }): Promise<ApiResponse<{ workflow: Workflow }>> {
    return apiFetch('/api/workflows', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateStatus(id: string, status: 'pending' | 'running' | 'completed' | 'failed', error?: string): Promise<ApiResponse<{ workflow: Workflow }>> {
    return apiFetch(`/api/workflows/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, error }),
    });
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    return apiFetch(`/api/workflows/${id}`, {
      method: 'DELETE',
    });
  },
};

// Reports API
export const reportsApi = {
  async list(params?: { type?: string; limit?: number; offset?: number }): Promise<ApiResponse<{ reports: Report[]; pagination: { total: number; limit: number; offset: number } }>> {
    const searchParams = new URLSearchParams();
    if (params?.type) searchParams.set('type', params.type);
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.offset) searchParams.set('offset', params.offset.toString());
    
    const query = searchParams.toString();
    return apiFetch(`/api/reports${query ? `?${query}` : ''}`);
  },

  async get(id: string): Promise<ApiResponse<{ report: Report }>> {
    return apiFetch(`/api/reports/${id}`);
  },

  async getStats(): Promise<ApiResponse<ReportStats>> {
    return apiFetch('/api/reports/stats');
  },

  async create(data: { workflow_id?: string; title: string; type: 'audit' | 'estimate' | 'optimization'; total_emissions: number; unit?: string; data?: Record<string, unknown> }): Promise<ApiResponse<{ report: Report }>> {
    return apiFetch('/api/reports', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async emailReport(id: string): Promise<ApiResponse<void>> {
    return apiFetch(`/api/reports/${id}/email`, {
      method: 'POST',
    });
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    return apiFetch(`/api/reports/${id}`, {
      method: 'DELETE',
    });
  },
};

// Chat API
export const chatApi = {
  async send(message: string, sessionId?: string): Promise<ApiResponse<ChatResponse>> {
    return apiFetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message, session_id: sessionId }),
    });
  },

  async listSessions(): Promise<ApiResponse<{ sessions: Array<{ id: string; created_at: string; first_message: string }> }>> {
    return apiFetch('/api/chat/sessions');
  },

  async getSession(id: string): Promise<ApiResponse<{ session: { id: string; messages: Array<{ role: string; content: string; timestamp: string }> } }>> {
    return apiFetch(`/api/chat/sessions/${id}`);
  },
};

// Emissions API
export const emissionsApi = {
  async estimateElectricity(params: { energy: number; energyUnit?: string; region?: string }): Promise<ApiResponse<EmissionsResponse>> {
    return apiFetch('/api/emissions/electricity', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  async estimateFlight(params: { distance: number; distanceUnit?: string; flightClass?: 'economy' | 'business' | 'first' }): Promise<ApiResponse<EmissionsResponse>> {
    return apiFetch('/api/emissions/flight', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  async estimateCloud(params: { provider: 'aws' | 'azure' | 'gcp'; region: string; energyKwh: number }): Promise<ApiResponse<EmissionsResponse>> {
    return apiFetch('/api/emissions/cloud', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  },

  async search(params: { query?: string; category?: string; region?: string }): Promise<ApiResponse<unknown>> {
    const searchParams = new URLSearchParams();
    if (params.query) searchParams.set('query', params.query);
    if (params.category) searchParams.set('category', params.category);
    if (params.region) searchParams.set('region', params.region);
    
    return apiFetch(`/api/emissions/search?${searchParams.toString()}`);
  },
};

// Check if user is authenticated
export function isAuthenticated(): boolean {
  return !!getAuthToken();
}

// Get stored user
export function getStoredUser(): User | null {
  const userData = localStorage.getItem('antigravity_user');
  if (userData) {
    try {
      return JSON.parse(userData);
    } catch {
      return null;
    }
  }
  return null;
}

export default {
  auth: authApi,
  workflows: workflowsApi,
  reports: reportsApi,
  chat: chatApi,
  emissions: emissionsApi,
  isAuthenticated,
  getStoredUser,
  clearAuth,
};
