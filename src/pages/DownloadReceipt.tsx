import React, { useState } from "react";
import { useStore } from "../store";

const DownloadReceipt = () => {
  const sales = useStore((state) => state.sales);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredSales, setFilteredSales] = useState(sales);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    setFilteredSales(
      sales.filter((sale) => sale.id.toLowerCase().includes(term))
    );
  };

  const generateReceiptHTML = (sale: any) => {
    const {
      items,
      subtotal,
      gstTotal,
      total,
      date,
      customerName,
      customerGstin,
    } = sale;
    return `
      <html>
        <head>
          <title>Receipt</title>
          <style>
            body { font-family: monospace; margin: 20px; }
            .header { text-align: center; margin-bottom: 20px; }
            .item { margin: 5px 0; }
            .totals { margin-top: 20px; border-top: 1px solid #000; }
          </style>
        </head>
        <body>
          <div class="header">
            <h2>RETAIL STORE</h2>
            <p>Tax Invoice</p>
            <p>Date: ${new Date(date).toLocaleString()}</p>
            ${customerName ? `<p>Customer: ${customerName}</p>` : ""}
            ${customerGstin ? `<p>GSTIN: ${customerGstin}</p>` : ""}
          </div>
          <div class="items">
            ${items
              .map(
                (item: any) => `
              <div class="item">
                ${item.name} x ${item.quantity}
                Rate: ₹${item.price}
                Amount: ₹${item.price * item.quantity}
                GST: ₹${item.gstAmount * item.quantity}
              </div>`
              )
              .join("")}
          </div>
          <div class="totals">
            <p>Subtotal: ₹${subtotal}</p>
            <p>GST: ₹${gstTotal}</p>
            <p>Total: ₹${total}</p>
          </div>
        </body>
      </html>
    `;
  };

  // Download receipt as an HTML file
  const downloadReceipt = (sale: any) => {
    const receiptHTML = generateReceiptHTML(sale);
    const blob = new Blob([receiptHTML], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Receipt_${sale.id}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Download Receipts</h1>
      <div className="mb-4">
        <input
          type="text"
          value={searchTerm}
          onChange={handleSearch}
          placeholder="Search by Receipt ID"
          className="w-full p-3 border rounded-lg"
        />
      </div>
      <div className="space-y-4">
        {filteredSales.map((sale: any) => (
          <div
            key={sale.id}
            className="p-4 bg-white shadow rounded-lg flex justify-between items-center"
          >
            <div>
              <p className="font-semibold">Receipt ID: {sale.id}</p>
              <p className="text-gray-500">
                Date: {new Date(sale.date).toLocaleString()}
              </p>
              <p className="text-gray-500">Total: ₹{sale.total.toFixed(2)}</p>
            </div>
            <button
              onClick={() => downloadReceipt(sale)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg"
            >
              Download
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DownloadReceipt;
