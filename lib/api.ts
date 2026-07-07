const API_BASE = 'http://172.20.10.3:3001/api';

class ApiClient {
  private token: string | null = null;

  setToken(t: string | null) {
    this.token = t;
  }

  getToken() {
    return this.token;
  }

  private headers(): Record<string, string> {
    const h: Record<string, string> = { 'Content-Type': 'application/json' };
    if (this.token) h['Authorization'] = `Bearer ${this.token}`;
    return h;
  }

  private async request<T>(method: string, path: string, body?: any): Promise<T> {
    let res: Response;
    try {
      res = await fetch(`${API_BASE}${path}`, {
        method,
        headers: this.headers(),
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch (e: any) {
      throw new Error(`Network error: ${e?.message || 'fetch failed'}`);
    }
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(err.error || `HTTP ${res.status}`);
    }
    return res.json();
  }

  // Auth
  login = (email: string, password: string) =>
    this.request<{ token: string; user: any }>('POST', '/auth/login', { email, password });

  register = (email: string, password: string, name?: string) =>
    this.request<{ token: string; user: any }>('POST', '/auth/register', { email, password, name });

  getProfile = () => this.request<any>('GET', '/auth/profile');

  updateProfile = (data: any) => this.request<any>('PUT', '/auth/profile', data);

  // Products
  getProducts = () => this.request<any[]>('GET', '/products');

  searchProducts = (q: string) => this.request<any[]>( 'GET', `/products/search?q=${encodeURIComponent(q)}`);

  searchByBarcode = (code: string) => this.request<any | null>('GET', `/products/barcode/${encodeURIComponent(code)}`);

  addProduct = (data: any) => this.request<any>('POST', '/products', data);

  deleteProduct = (id: string) => this.request<any>('DELETE', `/products/${id}`);

  toggleFavorite = (id: string) => this.request<{ favorite: boolean }>('POST', `/products/${id}/favorite`);

  // Food entries
  getFoodEntries = (date: string) => this.request<any[]>('GET', `/food?date=${date}`);

  addFoodEntry = (data: any) => this.request<any>('POST', '/food', data);

  deleteFoodEntry = (id: string) => this.request<any>('DELETE', `/food/${id}`);

  // Recipes
  getRecipes = () => this.request<any[]>('GET', '/recipes');

  addRecipe = (data: any) => this.request<any>('POST', '/recipes', data);

  deleteRecipe = (id: string) => this.request<any>('DELETE', `/recipes/${id}`);

  // Weight
  getWeightEntries = () => this.request<any[]>('GET', '/weight');

  addWeightEntry = (weight: number, date?: string) =>
    this.request<any>('POST', '/weight', { weight, date });
}

export const api = new ApiClient();
