import React, { useState, useRef } from "react";
import { useStore } from "../store";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Sale, SaleItem } from "../types";

const Billing = () => {
  const { products, addSale } = useStore();
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerGstin, setCustomerGstin] = useState("");
  const [barcodeInput, setBarcodeInput] = useState("");
  const scannerRef = useRef<any>(null);

  const barcodeBuffer = useRef<string>("");

  React.useEffect(() => {
    // Initialize barcode scanner (HTML5 QR Code Scanner)
    scannerRef.current = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );

    scannerRef.current.render(onScanSuccess, onScanFailure);

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear();
      }
    };
  }, []);

  React.useEffect(() => {
    // Listen for keydown events for external barcode scanner input
    const handleKeyDown = (event: KeyboardEvent) => {
      const char = event.key;
      if (char === "Enter") {
        // Barcode complete (assuming scanners use Enter key as terminator)
        handleBarcodeSubmit(barcodeBuffer.current.trim());
        barcodeBuffer.current = ""; // Clear buffer
      } else {
        barcodeBuffer.current += char; // Append character to buffer
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const onScanSuccess = (decodedText: string) => {
    handleBarcodeSubmit(decodedText);
  };

  const onScanFailure = (error: any) => {
    console.error(error);
  };

  const handleBarcodeSubmit = (barcode: string) => {
    const product = products.find((p) => p.barcode === barcode);
    if (product) {
      const existingItem = cart.find((item) => item.productId === product.id);
      if (existingItem) {
        setCart(
          cart.map((item) =>
            item.productId === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item
          )
        );
      } else {
        setCart([
          ...cart,
          {
            productId: product.id,
            quantity: 1,
            price: product.price,
            gstAmount: (product.price * product.gstRate) / 100,
          },
        ]);
      }
      setBarcodeInput("");
    } else {
      alert("Product not found!");
    }
  };

  const handleManualBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleBarcodeSubmit(barcodeInput);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    if (term.length > 1) {
      const results = products.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.barcode.toLowerCase().includes(term)
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  };

  const handleSearchSelect = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      handleBarcodeSubmit(product.barcode);
    }
  };

  const calculateTotals = () => {
    const subtotal = cart.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );
    const gstTotal = cart.reduce(
      (acc, item) => acc + item.gstAmount * item.quantity,
      0
    );
    return {
      subtotal,
      gstTotal,
      total: subtotal + gstTotal,
    };
  };

  const handleCheckout = () => {
    const { subtotal, gstTotal, total } = calculateTotals();
    const sale: Sale = {
      id: Date.now().toString(),
      items: cart,
      subtotal,
      gstTotal,
      total,
      date: new Date().toISOString(),
      customerName,
      customerPhone,
      customerGstin,
    };
    addSale(sale);
    // Generate and print receipt
    printReceipt(sale);
    // Clear cart and customer info
    setCart([]);
    setCustomerName("");
    setCustomerPhone("");
    setCustomerGstin("");
  };

  const printReceipt = (sale: Sale) => {
    const receiptWindow = window.open("", "_blank");
    if (receiptWindow) {
      receiptWindow.document.write(`
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
              <p>Date: ${new Date(sale.date).toLocaleString()}</p>
              ${
                sale.customerName ? `<p>Customer: ${sale.customerName}</p>` : ""
              }
              ${sale.customerGstin ? `<p>GSTIN: ${sale.customerGstin}</p>` : ""}
            </div>
            <div class="items">
              ${sale.items
                .map(
                  (item) => `
                <div class="item">
                  ${products.find((p) => p.id === item.productId)?.name} x ${
                    item.quantity
                  }
                  Rate: ₹${item.price}
                  Amount: ₹${item.price * item.quantity}
                  GST: ₹${item.gstAmount * item.quantity}
                </div>
              `
                )
                .join("")}
            </div>
            <div class="totals">
              <p>Subtotal: ₹${sale.subtotal}</p>
              <p>GST: ₹${sale.gstTotal}</p>
              <p>Total: ₹${sale.total}</p>
            </div>
          </body>
        </html>
      `);
      receiptWindow.document.close();
      receiptWindow.print();
    }
  };
  const { subtotal, gstTotal, total } = calculateTotals();

  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Search Product</h2>
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search by name or barcode"
            className="w-full mb-2 rounded-md border-gray-300"
          />
          {searchResults.length > 0 && (
            <div className="bg-gray-100 rounded-md shadow max-h-40 overflow-y-auto">
              {searchResults.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleSearchSelect(product.id)}
                  className="cursor-pointer p-2 hover:bg-gray-200"
                >
                  {product.name} - ₹{product.price}
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Barcode Scanner</h2>
          <div id="reader" className="mb-4"></div>
          <form onSubmit={handleManualBarcodeSubmit} className="flex space-x-2">
            <input
              type="text"
              value={barcodeInput}
              onChange={(e) => setBarcodeInput(e.target.value)}
              placeholder="Enter barcode manually or use scanner"
              className="flex-1 rounded-md border-gray-300"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md"
            >
              Add
            </button>
          </form>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Cart Items</h2>
          <div className="space-y-4">
            {cart.map((item) => {
              const product = products.find((p) => p.id === item.productId);
              if (!product) {
                return (
                  <div
                    key={item.productId}
                    className="text-red-500 text-sm italic"
                  >
                    Product details unavailable.
                  </div>
                );
              }
              return (
                <div
                  key={item.productId}
                  className="flex justify-between items-center border-b pb-2"
                >
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-500">
                      ₹{item.price} x {item.quantity}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">
                      ₹{(item.price * item.quantity).toFixed(2)}
                    </p>
                    <p className="text-sm text-gray-500">
                      GST: ₹{(item.gstAmount * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>GST:</span>
              <span>₹{gstTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold mt-2">
              <span>Total:</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Customer Details</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Customer Name
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Customer Phone
              </label>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Customer GSTIN (if applicable)
              </label>
              <input
                type="text"
                value={customerGstin}
                onChange={(e) => setCustomerGstin(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Checkout</h2>
          <div className="space-y-4">
            <button
              onClick={handleCheckout}
              className="w-full px-4 py-2 bg-green-600 text-white font-semibold rounded-md"
              disabled={cart.length === 0}
            >
              Checkout and Print Receipt
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Billing;
