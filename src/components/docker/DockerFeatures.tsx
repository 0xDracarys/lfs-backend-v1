
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Disc, Database } from "lucide-react";

const DockerFeatures: React.FC = () => {
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Disc className="w-5 h-5" />
            <CardTitle>ISO Generation Features</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-baseline gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
              <span><strong>Multiple Bootloaders:</strong> Support for both GRUB and ISOLINUX</span>
            </li>
            <li className="flex items-baseline gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
              <span><strong>Non-bootable Option:</strong> Create data-only ISOs when needed</span>
            </li>
            <li className="flex items-baseline gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
              <span><strong>Custom Volume Labels:</strong> Set your own ISO volume identifier</span>
            </li>
            <li className="flex items-baseline gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
              <span><strong>Seamless Integration:</strong> ISO generation triggered automatically after successful builds</span>
            </li>
          </ul>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5" />
            <CardTitle>Docker Benefits</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            <li className="flex items-baseline gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
              <span><strong>Isolation:</strong> Build processes run in isolated containers</span>
            </li>
            <li className="flex items-baseline gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
              <span><strong>Reproducibility:</strong> Consistent environment for builds</span>
            </li>
            <li className="flex items-baseline gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
              <span><strong>Tool Availability:</strong> All necessary tools pre-installed</span>
            </li>
            <li className="flex items-baseline gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
              <span><strong>Clean Environment:</strong> No host system contamination</span>
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default DockerFeatures;
