
import React, { useRef, useEffect } from "react";

interface LogViewerProps {
  logs: string[];
  title?: string;
  maxHeight?: string;
  autoScroll?: boolean;
}

const LogViewer: React.FC<LogViewerProps> = ({ 
  logs, 
  title = "Build Log", 
  maxHeight = "400px",
  autoScroll = true
}) => {
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when logs update
  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden">
      <div className="bg-gray-100 border-b px-4 py-2 flex justify-between items-center">
        <h3 className="font-semibold text-sm">{title}</h3>
        <div className="flex space-x-2">
          <button className="text-xs bg-gray-200 px-2 py-1 rounded hover:bg-gray-300">
            Copy
          </button>
          <button className="text-xs bg-gray-200 px-2 py-1 rounded hover:bg-gray-300">
            Clear
          </button>
        </div>
      </div>
      <div 
        ref={logContainerRef}
        className="bg-black text-green-400 font-mono text-sm p-4 overflow-y-auto whitespace-pre"
        style={{ maxHeight }}
      >
        {logs.length > 0 ? (
          logs.map((log, index) => (
            <div key={index} className="leading-relaxed">
              {log}
            </div>
          ))
        ) : (
          <div className="italic text-gray-500">No logs available</div>
        )}
      </div>
    </div>
  );
};

export default LogViewer;
