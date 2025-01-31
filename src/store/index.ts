import { create } from "zustand";
import { Product, Sale } from "../types";
import { apiService } from "../services/api";

interface StoreState {
  products: Product[];
  sales: Sale[];
  loading: boolean;
  error: string | null;

  // Fetch operations
  fetchProducts: () => Promise<void>;
  fetchSales: () => Promise<void>;

  // Product operations
  addProduct: (product: Product) => Promise<void>;
  updateProduct: (product: Product) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

  // Sale operations
  addSale: (sale: Sale) => Promise<void>;
  findSaleById: (id: string) => Sale | undefined;

  // Error handling
  clearError: () => void;
}

export const useStore = create<StoreState>((set, get) => ({
  products: [],
  sales: [],
  loading: false,
  error: null,

  fetchProducts: async () => {
    try {
      set({ loading: true, error: null });
      const products = await apiService.getProducts();
      set({ products, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  fetchSales: async () => {
    try {
      set({ loading: true, error: null });
      const sales = await apiService.getSales();
      set({ sales, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
    }
  },

  addProduct: async (product: Product) => {
    try {
      set({ loading: true, error: null });
      await apiService.createProduct(product);
      const products = await apiService.getProducts();
      set({ products, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  updateProduct: async (product: Product) => {
    try {
      set({ loading: true, error: null });
      await apiService.updateProduct(product);
      const products = await apiService.getProducts();
      set({ products, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  deleteProduct: async (id: string) => {
    try {
      set({ loading: true, error: null });
      await apiService.deleteProduct(id);
      const products = await apiService.getProducts();
      set({ products, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  addSale: async (sale: Sale) => {
    try {
      set({ loading: true, error: null });
      await apiService.createSale(sale);
      const [products, sales] = await Promise.all([
        apiService.getProducts(),
        apiService.getSales(),
      ]);
      set({ products, sales, loading: false });
    } catch (error) {
      set({ error: error.message, loading: false });
      throw error;
    }
  },

  findSaleById: (id: string) => {
    const state = get();
    return state.sales.find((sale) => sale.id === id);
  },

  clearError: () => set({ error: null }),
}));
