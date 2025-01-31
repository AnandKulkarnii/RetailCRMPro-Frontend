import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import GSTReport from "./components/GSTReport";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Billing from "./pages/Billing";
import Analytics from "./pages/Analytics";
import DownloadReceipt from "./pages/DownloadReceipt";
import { useStore } from "./store";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const { fetchProducts, fetchSales } = useStore();

  useEffect(() => {
    // Initialize data
    fetchProducts();
    fetchSales();
  }, [fetchProducts, fetchSales]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/" element={<Login />} />

        {/* Protected Routes Wrapped in Layout */}
        <Route path="/" element={<Layout />}>
          <Route
            path="dashboard"
            element={
              <ProtectedRoute
                element={<Dashboard />}
                allowedRoles={["RETAILER"]}
              />
            }
          />
          <Route
            path="profile"
            element={
              <ProtectedRoute
                element={<Profile />}
                allowedRoles={["RETAILER"]}
              />
            }
          />
          <Route
            path="products"
            element={
              <ProtectedRoute
                element={<Products />}
                allowedRoles={["RETAILER"]}
              />
            }
          />
          <Route
            path="billing"
            element={
              <ProtectedRoute
                element={<Billing />}
                allowedRoles={["RETAILER"]}
              />
            }
          />
          <Route
            path="analytics"
            element={
              <ProtectedRoute
                element={<Analytics />}
                allowedRoles={["RETAILER"]}
              />
            }
          />
          <Route
            path="download-receipts"
            element={
              <ProtectedRoute
                element={<DownloadReceipt />}
                allowedRoles={["RETAILER"]}
              />
            }
          />
          <Route
            path="gst-report"
            element={
              <ProtectedRoute
                element={<GSTReport />}
                allowedRoles={["RETAILER"]}
              />
            }
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
