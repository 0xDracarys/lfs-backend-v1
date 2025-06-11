
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
    <div className="bg-card text-card-foreground p-4 rounded-lg mb-4"> {/* Apply card styling */}
      <Tabs defaultValue="logs">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold flex items-center text-foreground"> {/* Ensure heading text uses foreground */}
            <Terminal className="mr-1 h-5 w-5 text-accent-primary" /> {/* Themed icon */}
            Output Monitor
          </h2>
          
          {/* TabsList and TabsTrigger should inherit styling from shadcn/ui theme */}
          <TabsList>
            <TabsTrigger value="logs">Build Logs</TabsTrigger>
            <TabsTrigger value="script">Script Output</TabsTrigger>
          </TabsList>
        </div>
        
        {/* Apply terminal screen styling to the content area where logs are displayed */}
        <TabsContent value="logs" className="bg-black text-terminal-text font-mono p-4 rounded-md overflow-auto">
          <LogViewer logs={logs} maxHeight="400px" />
        </TabsContent>
        
        <TabsContent value="script" className="bg-black text-terminal-text font-mono p-4 rounded-md overflow-auto">
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
