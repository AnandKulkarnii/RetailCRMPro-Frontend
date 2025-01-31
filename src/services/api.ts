import axios from "axios";
import { Product, Sale, GSTReportParams } from "../types";

const API_URL =
  import.meta.env.REACT_APP_API_URL || "http://localhost:3001/api";

// Create an axios instance with default config
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const apiService = {
  // Product APIs
  async getProducts(): Promise<Product[]> {
    try {
      const response = await axiosInstance.get<Product[]>("/products");
      return response.data;
    } catch (error) {
      throw new Error("Failed to fetch products");
    }
  },

  async createProduct(product: Product): Promise<Product> {
    try {
      const response = await axiosInstance.post<Product>("/products", product);
      return response.data;
    } catch (error) {
      throw new Error("Failed to create product");
    }
  },

  async updateProduct(product: Product): Promise<Product> {
    try {
      const response = await axiosInstance.put<Product>(
        `/products/${product.id}`,
        product
      );
      return response.data;
    } catch (error) {
      throw new Error("Failed to update product");
    }
  },

  async deleteProduct(id: string): Promise<void> {
    try {
      await axiosInstance.delete(`/products/${id}`);
    } catch (error) {
      throw new Error("Failed to delete product");
    }
  },

  // Sale APIs
  async getSales(): Promise<Sale[]> {
    try {
      const response = await axiosInstance.get<Sale[]>("/sales");
      return response.data;
    } catch (error) {
      throw new Error("Failed to fetch sales");
    }
  },

  async createSale(sale: Sale): Promise<Sale> {
    try {
      const response = await axiosInstance.post<Sale>("/sales", sale);
      return response.data;
    } catch (error) {
      throw new Error("Failed to create sale");
    }
  },

  // GST Report API
  async downloadGSTReport({ months }: GSTReportParams): Promise<Blob> {
    try {
      const response = await axiosInstance.get(`/gst/download`, {
        params: { months },
        responseType: "blob",
        headers: {
          Accept:
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      });

      if (response.status !== 200) {
        throw new Error("Failed to download report");
      }

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data instanceof Blob) {
        const text = await error.response.data.text();
        throw new Error(`Failed to download report: ${text}`);
      }
      throw new Error("Failed to download GST report");
    }
  },
};
