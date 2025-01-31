import React from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Receipt,
  BarChart2,
  Download,
  FileDown,
  User,
} from "lucide-react";
import BackupStatus from "./BackupStatus";

const navigation = [
  { name: "Profile", href: "/profile", icon: User },
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Products", href: "/products", icon: Package },
  { name: "Billing", href: "/billing", icon: Receipt },
  { name: "Analytics", href: "/analytics", icon: BarChart2 },
  { name: "Download Receipts", href: "/download-receipts", icon: Download },
  { name: "GST Report", href: "/gst-report", icon: FileDown },
];

const Layout: React.FC = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-64 bg-white shadow-lg">
          <div className="flex h-16 items-center justify-center">
            <h1 className="text-xl font-bold text-gray-900">Retail CRM</h1>
          </div>
          <nav className="mt-5 px-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname.startsWith(item.href);

              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`${
                    isActive
                      ? "bg-gray-200 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  } group flex items-center px-2 py-2 text-base font-medium rounded-md`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className="mr-4 h-6 w-6" />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          <BackupStatus />
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-auto">
          <main className="p-6">
            <Outlet /> {/* This replaces children */}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;
