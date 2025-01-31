import React, { useState } from "react";
import { FileDown } from "lucide-react";
import { apiService } from "../services/api";
import { GSTReportParams } from "../types";

const GSTReport: React.FC = () => {
  const [timeRange, setTimeRange] = useState<number>(1);
  const [downloading, setDownloading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleDownload = async (): Promise<void> => {
    try {
      setDownloading(true);
      setError("");

      const params: GSTReportParams = { months: timeRange };
      const blob = await apiService.downloadGSTReport(params);

      if (blob.size === 0) {
        throw new Error("No data available for the selected period");
      }

      // Create download link
      const url: string = window.URL.createObjectURL(blob);
      const a: HTMLAnchorElement = document.createElement("a");
      a.href = url;
      a.download = `GST_Report_${timeRange}months.xlsx`;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Download error:", err);
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setDownloading(false);
    }
  };

  const handleTimeRangeChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ): void => {
    setTimeRange(Number(e.target.value));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">GST Report</h1>

      <div className="bg-white p-6 rounded-lg shadow">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Select Time Period
            </label>
            <select
              value={timeRange}
              onChange={handleTimeRangeChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
              disabled={downloading}
            >
              <option value={1}>Last Month</option>
              <option value={3}>Last 3 Months</option>
              <option value={6}>Last 6 Months</option>
              <option value={12}>Last 12 Months</option>
            </select>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 p-3 rounded">
              {error}
            </div>
          )}

          <button
            onClick={handleDownload}
            disabled={downloading}
            className={`flex items-center justify-center w-full px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              downloading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <FileDown className="w-4 h-4 mr-2" />
            {downloading ? "Downloading..." : "Download GST Report"}
          </button>

          <div className="mt-4 text-sm text-gray-500">
            <h3 className="font-medium mb-2">Report Contents:</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>Product-wise sales details</li>
              <li>Base price and GST calculations</li>
              <li>Monthly aggregated data</li>
              <li>Category-wise breakdown</li>
              <li>GST rates and amounts</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GSTReport;
