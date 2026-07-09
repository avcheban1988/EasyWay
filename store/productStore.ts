import { api } from '@/lib/api';
import { create } from 'zustand';
import { DEFAULT_PRODUCTS } from './products_list';

export interface Product {
  id: string;
  name: string;
  caloriesPer100: number;
  proteinsPer100: number;
  fatsPer100: number;
  carbsPer100: number;
  packageGrams?: number;
  barcode?: string;
  isFavorite?: boolean;
  isDefault?: boolean;
}

export interface RecipeIngredient {
  productId: string;
  productName: string;
  grams: number;
}

export interface Recipe {
  id: string;
  name: string;
  ingredients: RecipeIngredient[];
  steps: string[];
  isUserRecipe: boolean;
  category?: 'breakfast' | 'lunch' | 'dinner' | 'high_carb' | 'high_protein' | 'high_fat';
  macros?: { calories: number; proteins: number; fats: number; carbs: number };
}

interface ProductStore {
  products: Product[];
  favoriteIds: string[];
  recipes: Recipe[];
  hydrated: boolean;
  load: () => Promise<void>;
  searchByBarcode: (barcode: string) => Product | undefined;
  addProduct: (p: Omit<Product, 'id'>) => Promise<void>;
  removeProduct: (id: string) => void;
  toggleFavorite: (id: string) => void;
  addRecipe: (r: Omit<Recipe, 'id'>) => void;
  removeRecipe: (id: string) => void;
  searchProducts: (q: string) => Product[];
  getRecipeMacros: (recipeId: string) => { calories: number; proteins: number; fats: number; carbs: number; ingredients: { name: string; grams: number; kcal: number }[] } | null;
}

export const useProductStore = create<ProductStore>((set, get) => ({
  products: DEFAULT_PRODUCTS,
  favoriteIds: [],
  recipes: [],
  hydrated: false,

  load: async () => {
    if (get().hydrated) return;
    try {
      const [products, recipes] = await Promise.all([
        api.getProducts().catch(() => DEFAULT_PRODUCTS.map(p => ({ ...p, isDefault: true }))),
        api.getRecipes().catch(() => [] as any[]),
      ]);
      set({
        products: products || DEFAULT_PRODUCTS.map(p => ({ ...p, isDefault: true })),
        favoriteIds: (products || []).filter((p: any) => p.isFavorite).map((p: any) => p.id),
        recipes: (recipes || []).map((r: any) => ({
          id: r.id,
          name: r.name,
          ingredients: r.ingredients || [],
          steps: r.steps || [],
          isUserRecipe: r.isUserRecipe,
          category: r.category,
          macros: r.macros,
        })),
        hydrated: true,
      });
    } catch {
      // Offline fallback — уже есть DEFAULT_PRODUCTS
      set({ hydrated: true });
    }
  },

  searchByBarcode: (barcode) => {
    return get().products.find((p) => p.barcode === barcode);
  },

  searchProducts: (q) => {
    const query = q.toLowerCase().trim();
    if (!query) return [];
    return get().products.filter((p) => p.name.toLowerCase().includes(query));
  },

  addProduct: async (p) => {
    try {
      const created = await api.addProduct(p);
      set((s) => ({
        products: [...s.products, { ...created, isFavorite: false }],
      }));
    } catch {
      // fallback — сохраняем локально
      const local = { ...p, id: `tmp-${Date.now()}`, isFavorite: false };
      set((s) => ({ products: [...s.products, local] }));
    }
  },

  removeProduct: (id) => {
    api.deleteProduct(id).catch(() => {});
    set((s) => ({ products: s.products.filter((p) => p.id !== id) }));
  },

  toggleFavorite: async (id) => {
    const wasFav = get().favoriteIds.includes(id);
    // Оптимистичное обновление
    set((s) => ({
      favoriteIds: wasFav ? s.favoriteIds.filter((f) => f !== id) : [...s.favoriteIds, id],
    }));
    try {
      await api.toggleFavorite(id);
    } catch {
      // Откат
      set((s) => ({
        favoriteIds: wasFav ? [...s.favoriteIds, id] : s.favoriteIds.filter((f) => f !== id),
      }));
    }
  },

  addRecipe: async (r) => {
    try {
      const created = await api.addRecipe(r);
      const newRecipe: Recipe = {
        id: created.id,
        name: r.name,
        ingredients: r.ingredients,
        steps: r.steps || [],
        isUserRecipe: true,
        category: r.category,
      };
      set((s) => ({ recipes: [...s.recipes, newRecipe] }));
    } catch {
      const localId = `r-tmp-${Date.now()}`;
      const newRecipe: Recipe = { ...r, id: localId, isUserRecipe: true };
      set((s) => ({ recipes: [...s.recipes, newRecipe] }));
    }
  },

  removeRecipe: (id) => {
    api.deleteRecipe(id).catch(() => {});
    set((s) => ({ recipes: s.recipes.filter((r) => r.id !== id) }));
  },

  getRecipeMacros: (recipeId) => {
    const recipe = get().recipes.find((r) => r.id === recipeId);
    if (!recipe) return null;

    // Если с бэка пришли макросы — используем их
    if (recipe.macros) {
      return {
        ...recipe.macros,
        ingredients: recipe.ingredients.map((ing) => {
          const product = get().products.find((p) => p.id === ing.productId);
          const kcal = product ? Math.round(product.caloriesPer100 * ing.grams / 100) : 0;
          return { name: ing.productName, grams: ing.grams, kcal };
        }),
      };
    }

    // Иначе рассчитываем локально
    let calories = 0, proteins = 0, fats = 0, carbs = 0;
    const ingredients = recipe.ingredients.map((ing) => {
      const product = get().products.find((p) => p.id === ing.productId);
      if (!product) return { name: ing.productName, grams: ing.grams, kcal: 0 };
      const mult = ing.grams / 100;
      calories += product.caloriesPer100 * mult;
      proteins += product.proteinsPer100 * mult;
      fats += product.fatsPer100 * mult;
      carbs += product.carbsPer100 * mult;
      return { name: product.name, grams: ing.grams, kcal: Math.round(product.caloriesPer100 * mult) };
    });
    return {
      calories: Math.round(calories),
      proteins: Math.round(proteins * 10) / 10,
      fats: Math.round(fats * 10) / 10,
      carbs: Math.round(carbs * 10) / 10,
      ingredients,
    };
  },
}));
