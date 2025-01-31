import React, { useState, useEffect } from "react";
import { Cloud, CloudOff } from "lucide-react";

interface BackupStatus {
  isOnline: boolean;
  lastBackupTime: string | null;
}

const BackupStatus: React.FC = () => {
  const [status, setStatus] = useState<BackupStatus>({
    isOnline: false,
    lastBackupTime: null,
  });

  const checkStatus = async () => {
    try {
      console.log("Checking status");
      const response = await fetch("http://localhost:3001/api/backup/status");
      const data = await response.json();
      setStatus(data);
      console.log("data", data);
    } catch (error) {
      console.error("Failed to fetch backup status:", error);
    }
  };

  useEffect(() => {
    checkStatus();
    const interval = setInterval(checkStatus, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4 border-t">
      <div className="flex items-center space-x-2 text-sm">
        {status.isOnline ? (
          <>
            <Cloud className="w-4 h-4 text-green-500" />
            <span className="text-green-600">Online - Auto Backup Active</span>
          </>
        ) : (
          <>
            <CloudOff className="w-4 h-4 text-gray-500" />
            <span className="text-gray-600">Offline - Using Local Storage</span>
          </>
        )}
      </div>
      {status.lastBackupTime && (
        <div className="mt-1 text-xs text-gray-500">
          Last backup: {new Date(status.lastBackupTime).toLocaleString()}
        </div>
      )}
    </div>
  );
};

export default BackupStatus;
