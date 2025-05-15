
import React from "react";
import { Terminal } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LogViewer from "./LogViewer";

interface OutputMonitorProps {
  logs: string[];
  scriptOutput: string[];
}

const OutputMonitor: React.FC<OutputMonitorProps> = ({
  logs,
  scriptOutput
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow mb-4">
      <Tabs defaultValue="logs">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold flex items-center">
            <Terminal className="mr-1 h-5 w-5 text-blue-500" />
            Output Monitor
          </h2>
          
          <TabsList>
            <TabsTrigger value="logs">Build Logs</TabsTrigger>
            <TabsTrigger value="script">Script Output</TabsTrigger>
          </TabsList>
        </div>
        
        <TabsContent value="logs">
          <LogViewer logs={logs} maxHeight="400px" />
        </TabsContent>
        
        <TabsContent value="script">
          <LogViewer 
            logs={scriptOutput}
            title="Script Output" 
            maxHeight="400px" 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OutputMonitor;
