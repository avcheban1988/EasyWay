import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

export interface Product {
  id: string;
  name: string;
  caloriesPer100: number;
  proteinsPer100: number;
  fatsPer100: number;
  carbsPer100: number;
  packageGrams?: number; // вес упаковки/порции, например 140 для йогурта
  barcode?: string; // штрихкод
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
}

interface ProductStore {
  products: Product[];
  favoriteIds: string[];
  recipes: Recipe[];
  hydrated: boolean;
  load: () => Promise<void>;
  searchByBarcode: (barcode: string) => Product | undefined;
  addProduct: (p: Omit<Product, 'id'>) => void;
  toggleFavorite: (id: string) => void;
  addRecipe: (r: Omit<Recipe, 'id'>) => void;
  removeRecipe: (id: string) => void;
  searchProducts: (q: string) => Product[];
  getRecipeMacros: (recipeId: string) => { calories: number; proteins: number; fats: number; carbs: number; ingredients: { name: string; grams: number; kcal: number }[] } | null;
}

const DEFAULT_PRODUCTS: Product[] = [
  { id: '1', name: 'Йогурт греческий', caloriesPer100: 59, proteinsPer100: 10, fatsPer100: 0.5, carbsPer100: 3.5, packageGrams: 140 },
  { id: '2', name: 'Куриная грудка', caloriesPer100: 165, proteinsPer100: 31, fatsPer100: 3.6, carbsPer100: 0 },
  { id: '3', name: 'Рис белый', caloriesPer100: 130, proteinsPer100: 2.7, fatsPer100: 0.3, carbsPer100: 28 },
  { id: '4', name: 'Авокадо', caloriesPer100: 160, proteinsPer100: 2, fatsPer100: 15, carbsPer100: 9 },
  { id: '5', name: 'Яйцо куриное', caloriesPer100: 155, proteinsPer100: 13, fatsPer100: 11, carbsPer100: 1.1, packageGrams: 60 },
  { id: '6', name: 'Хлеб цельнозерновой', caloriesPer100: 247, proteinsPer100: 13, fatsPer100: 3.4, carbsPer100: 41 },
  { id: '7', name: 'Банан', caloriesPer100: 89, proteinsPer100: 1.1, fatsPer100: 0.3, carbsPer100: 23, packageGrams: 120 },
  { id: '8', name: 'Молоко 3.2%', caloriesPer100: 60, proteinsPer100: 3, fatsPer100: 3.2, carbsPer100: 4.8 },
  { id: '9', name: 'Овсянка', caloriesPer100: 68, proteinsPer100: 2.5, fatsPer100: 1.5, carbsPer100: 12 },
  { id: '10', name: 'Лосось слабосоленый', caloriesPer100: 200, proteinsPer100: 22, fatsPer100: 12, carbsPer100: 0 },
  { id: '11', name: 'Творог 5%', caloriesPer100: 145, proteinsPer100: 16, fatsPer100: 5, carbsPer100: 3, packageGrams: 200 },
  { id: '12', name: 'Огурец', caloriesPer100: 15, proteinsPer100: 0.7, fatsPer100: 0.1, carbsPer100: 3.6 },
  { id: '13', name: 'Творог обезжиренный', caloriesPer100: 90, proteinsPer100: 18, fatsPer100: 0.5, carbsPer100: 3.3, packageGrams: 200 },
  { id: '14', name: 'Макароны тв. сорта', caloriesPer100: 350, proteinsPer100: 12, fatsPer100: 1.5, carbsPer100: 72 },
  { id: '15', name: 'Гречка', caloriesPer100: 343, proteinsPer100: 13, fatsPer100: 3.4, carbsPer100: 72 },
  { id: '16', name: 'Масло оливковое', caloriesPer100: 884, proteinsPer100: 0, fatsPer100: 100, carbsPer100: 0 },
  { id: '17', name: 'Масло сливочное', caloriesPer100: 717, proteinsPer100: 0.9, fatsPer100: 81, carbsPer100: 0.1 },
];

const DEFAULT_RECIPES: Recipe[] = [
  { id: 'r1', name: 'Овсяноблин', isUserRecipe: false, category: 'breakfast', steps: [], ingredients: [
    { productId: '9', productName: 'Овсянка', grams: 30 }, { productId: '5', productName: 'Яйцо куриное', grams: 60 }
  ]},
  { id: 'r2', name: 'Курица с рисом и овощами', isUserRecipe: false, category: 'lunch', steps: [], ingredients: [
    { productId: '2', productName: 'Куриная грудка', grams: 150 }, { productId: '3', productName: 'Рис белый', grams: 100 }, { productId: '12', productName: 'Огурец', grams: 50 }
  ]},
  { id: 'r3', name: 'Смузи банановый', isUserRecipe: false, category: 'breakfast', steps: [], ingredients: [
    { productId: '7', productName: 'Банан', grams: 120 }, { productId: '8', productName: 'Молоко 3.2%', grams: 200 }
  ]},
  { id: 'r4', name: 'Творожная запеканка', isUserRecipe: false, category: 'breakfast', steps: [], ingredients: [
    { productId: '11', productName: 'Творог 5%', grams: 200 }, { productId: '5', productName: 'Яйцо куриное', grams: 60 }
  ]},
  { id: 'r5', name: 'Лосось с авокадо', isUserRecipe: false, category: 'dinner', steps: [], ingredients: [
    { productId: '10', productName: 'Лосось слабосоленый', grams: 100 }, { productId: '4', productName: 'Авокадо', grams: 80 }
  ]},
  { id: 'r6', name: 'Протеиновый завтрак', isUserRecipe: false, category: 'high_protein', steps: [], ingredients: [
    { productId: '11', productName: 'Творог 5%', grams: 200 }, { productId: '5', productName: 'Яйцо куриное', grams: 120 }
  ]},
  { id: 'r7', name: 'Энергетический рис', isUserRecipe: false, category: 'high_carb', steps: [], ingredients: [
    { productId: '3', productName: 'Рис белый', grams: 200 }, { productId: '7', productName: 'Банан', grams: 120 }
  ]},
  { id: 'r8', name: 'Авокадо-тост', isUserRecipe: false, category: 'high_fat', steps: [], ingredients: [
    { productId: '6', productName: 'Хлеб цельнозерновой', grams: 50 }, { productId: '4', productName: 'Авокадо', grams: 100 }
  ]},
];

export const useProductStore = create<ProductStore>((set, get) => ({
  products: DEFAULT_PRODUCTS,
  favoriteIds: [],
  recipes: DEFAULT_RECIPES,
  hydrated: false,

  load: async () => {
    try {
      if (get().hydrated) return;
      const json = await AsyncStorage.getItem('productStore');
      if (json) {
        const parsed = JSON.parse(json);
        set({ products: parsed.products ?? DEFAULT_PRODUCTS, favoriteIds: parsed.favoriteIds ?? [], recipes: parsed.recipes ?? [], hydrated: true });
      } else {
        set({ hydrated: true });
      }
    } catch { set({ hydrated: true }); }
  },

  addProduct: (p) => {
    const newP: Product = { ...p, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}` };
    set((s) => ({ products: [...s.products, newP] }));
    AsyncStorage.setItem('productStore', JSON.stringify(get()));
  },

  removeProduct: (id) => {
    set((s) => ({ products: s.products.filter((p) => p.id !== id) }));
    AsyncStorage.setItem('productStore', JSON.stringify(get()));
  },

  toggleFavorite: (id) => {
    set((s) => {
      const favs = s.favoriteIds.includes(id) ? s.favoriteIds.filter((f) => f !== id) : [...s.favoriteIds, id];
      return { favoriteIds: favs };
    });
    AsyncStorage.setItem('productStore', JSON.stringify(get()));
  },

  addRecipe: (r) => {
    const newR: Recipe = { ...r, id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, steps: r.steps ?? [] };
    set((s) => ({ recipes: [...s.recipes, newR] }));
    AsyncStorage.setItem('productStore', JSON.stringify(get()));
  },

  removeRecipe: (id) => {
    set((s) => ({ recipes: s.recipes.filter((r) => r.id !== id) }));
    AsyncStorage.setItem('productStore', JSON.stringify(get()));
  },

  searchByBarcode: (barcode) => {
    return get().products.find((p) => p.barcode === barcode);
  },

  searchProducts: (q) => {
    const query = q.toLowerCase().trim();
    if (!query) return [];
    return get().products.filter((p) => p.name.toLowerCase().includes(query));
  },

  getRecipeMacros: (recipeId) => {
    const recipe = get().recipes.find((r) => r.id === recipeId);
    if (!recipe) return null;
    const products = get().products;
    let calories = 0, proteins = 0, fats = 0, carbs = 0;
    const ingredients: { name: string; grams: number; kcal: number }[] = [];
    for (const ing of recipe.ingredients) {
      const p = products.find((pr) => pr.id === ing.productId);
      if (p) {
        const mult = ing.grams / 100;
        const kcal = Math.round(p.caloriesPer100 * mult);
        calories += kcal;
        proteins += p.proteinsPer100 * mult;
        fats += p.fatsPer100 * mult;
        carbs += p.carbsPer100 * mult;
        ingredients.push({ name: p.name, grams: ing.grams, kcal });
      }
    }
    return {
      calories: Math.round(calories),
      proteins: Math.round(proteins * 10) / 10,
      fats: Math.round(fats * 10) / 10,
      carbs: Math.round(carbs * 10) / 10,
      ingredients,
    };
  },
}));
