import Constants from 'expo-constants';
import { Platform } from 'react-native';

function getApiBase(): string {
  // 1) Если указан production URL в app.json -> используем его
  const configuredUrl = Constants.expoConfig?.extra?.apiUrl as string | undefined;
  if (configuredUrl && typeof configuredUrl === 'string' && configuredUrl.trim()) {
    return configuredUrl.replace(/\/+$/, '') + '/api';
  }

  // 2) Локальный режим — автоопределение хоста
  if (Platform.OS === 'web') {
    return 'http://localhost:3001/api';
  }

  const debuggerHost = Constants.manifest?.debuggerHost || Constants.expoConfig?.extra?.debuggerHost;
  if (debuggerHost && typeof debuggerHost === 'string') {
    return `http://${debuggerHost.split(':')[0]}:3001/api`;
  }

  return 'http://172.20.10.3:3001/api';
}

const API_BASE = getApiBase();

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
      const url = `${API_BASE}${path}`;
      console.log(`[API] ${method} ${url}`);
      res = await fetch(url, {
        method,
        headers: this.headers(),
        body: body ? JSON.stringify(body) : undefined,
      });
    } catch (e: any) {
      const networkError = `Network error: ${e?.message || 'fetch failed'}`;
      console.error(`[API] ${networkError}`);
      throw new Error(networkError);
    }

    if (!res.ok) {
      let errorData: any;
      try {
        errorData = await res.json();
      } catch {
        errorData = { error: `HTTP ${res.status}` };
      }
      const errorMsg = errorData.error || errorData.message || `HTTP ${res.status}`;
      console.error(`[API] Error ${res.status}:`, errorMsg);
      throw new Error(errorMsg);
    }

    try {
      const data = await res.json();
      console.log(`[API] Response OK:`, data);
      return data;
    } catch (e: any) {
      console.error(`[API] Failed to parse response:`, e?.message);
      throw new Error('Invalid response format');
    }
  }

  // Auth
  login = (email: string, password: string) =>
    this.request<{ token: string; user: any }>('POST', '/auth/login', { email, password });

  register = (email: string, password: string, name?: string) =>
    this.request<{ token: string; user: any }>('POST', '/auth/register', { email, password, name });

  phoneAuth = (phone: string) =>
    this.request<{ token: string; user: any }>('POST', '/auth/phone', { phone });

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

  getFoodEntriesRange = (start: string, end: string) => this.request<any[]>('GET', `/food/range?start=${start}&end=${end}`);

  addFoodEntry = (data: any) => this.request<any>('POST', '/food', data);

  deleteFoodEntry = (id: string) => this.request<any>('DELETE', `/food/${id}`);

  getRecentProducts = () => this.request<{ name: string; grams: number }[]>('GET', '/food/recent-products');

  // Recipes
  getRecipes = () => this.request<any[]>('GET', '/recipes');

  addRecipe = (data: any) => this.request<any>('POST', '/recipes', data);

  deleteRecipe = (id: string) => this.request<any>('DELETE', `/recipes/${id}`);

  // Weight
  getWeightEntries = () => this.request<any[]>('GET', '/weight');

  addWeightEntry = (weight: number, date?: string) =>
    this.request<any>('POST', '/weight', { weight, date });

  // Water
  getWaterIntake = () => this.request<{ ml: number; id?: string }>('GET', '/water');

  addWaterIntake = (ml: number) => this.request<{ ml: number; date: string }>('POST', '/water', { ml });

  // Vision (DeepSeek)
  analyzePhoto = (image: string) =>
    this.request<{ name: string; caloriesPer100: number; proteinsPer100: number; fatsPer100: number; carbsPer100: number }>('POST', '/vision/analyze-photo', { image });

  analyzeText = (text: string) =>
    this.request<{ name: string; caloriesPer100: number; proteinsPer100: number; fatsPer100: number; carbsPer100: number }>('POST', '/vision/analyze-text', { text });
}

export const api = new ApiClient();
