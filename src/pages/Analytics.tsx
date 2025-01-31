import React, { useState } from "react";
import { useStore } from "../store";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachMonthOfInterval,
  subMonths,
} from "date-fns";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const Analytics = () => {
  const { sales, products } = useStore();
  const [timeRange, setTimeRange] = useState(12);

  // Filter sales based on selected time range
  const filteredSales = sales.filter((sale) => {
    const saleDate = new Date(sale.date);
    const startDate = subMonths(new Date(), timeRange);
    return saleDate >= startDate;
  });

  // Get months for selected range
  const months = eachMonthOfInterval({
    start: subMonths(new Date(), timeRange - 1),
    end: new Date(),
  });

  // Calculate monthly sales data
  const monthlySales = months.map((month) => {
    const monthSales = filteredSales.filter((sale) => {
      const saleDate = new Date(sale.date);
      return saleDate >= startOfMonth(month) && saleDate <= endOfMonth(month);
    });

    return {
      month: format(month, "MMM yyyy"),
      sales: monthSales.length,
      revenue: monthSales.reduce((acc, sale) => acc + sale.total, 0),
    };
  });

  // Calculate total revenue, revenue without GST, and GST amount
  const totals = filteredSales.reduce(
    (acc, sale) => ({
      totalRevenue: acc.totalRevenue + sale.total,
      totalGST: acc.totalGST + sale.gstTotal,
      revenueWithoutGST: acc.revenueWithoutGST + sale.subtotal,
    }),
    {
      totalRevenue: 0,
      totalGST: 0,
      revenueWithoutGST: 0,
    }
  );

  // Calculate top products
  const productSales = products
    .map((product) => {
      const productItems = filteredSales.flatMap((sale) =>
        sale.items.filter((item) => item.productId === product.id)
      );

      return {
        productId: product.id,
        name: product.name,
        quantity: productItems.reduce((acc, item) => acc + item.quantity, 0),
        revenue: productItems.reduce(
          (acc, item) =>
            acc + item.price * item.quantity + item.gstAmount * item.quantity,
          0
        ),
      };
    })
    .sort((a, b) => b.revenue - a.revenue);

  const salesChartData = {
    labels: monthlySales.map((data) => data.month),
    datasets: [
      {
        label: "Revenue (₹)",
        data: monthlySales.map((data) => data.revenue),
        backgroundColor: "rgba(53, 162, 235, 0.5)",
      },
      {
        label: "Number of Sales",
        data: monthlySales.map((data) => data.sales),
        backgroundColor: "rgba(75, 192, 192, 0.5)",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Monthly Sales Analysis",
      },
    },
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>

        {/* Time Range Filter */}
        <select
          value={timeRange}
          onChange={(e) => setTimeRange(Number(e.target.value))}
          className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
        >
          <option value={1}>Last Month</option>
          <option value={3}>Last 3 Months</option>
          <option value={6}>Last 6 Months</option>
          <option value={12}>Last 12 Months</option>
        </select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Total Revenue</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            ₹{totals.totalRevenue.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">
            Revenue without GST
          </h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            ₹{totals.revenueWithoutGST.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Total GST</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            ₹{totals.totalGST.toLocaleString()}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Total Sales</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {filteredSales.length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">
            Average Sale Value
          </h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            ₹
            {filteredSales.length > 0
              ? (totals.totalRevenue / filteredSales.length).toFixed(2)
              : "0.00"}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Total Products</h3>
          <p className="mt-2 text-3xl font-bold text-gray-900">
            {products.length}
          </p>
        </div>
      </div>

      {/* Sales Chart */}
      <div className="bg-white p-6 rounded-lg shadow">
        <Bar options={chartOptions} data={salesChartData} />
      </div>

      {/* Top Products Table */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Top Products by Revenue
          </h3>
        </div>
        <div className="border-t border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Product
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Quantity Sold
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Revenue
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {productSales.slice(0, 10).map((product) => (
                <tr key={product.productId}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {product.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {product.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ₹{product.revenue.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
