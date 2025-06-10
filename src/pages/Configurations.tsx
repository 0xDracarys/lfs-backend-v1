
import React, { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { HardDrive, Plus, Settings, Trash2, Play } from 'lucide-react'; // Added Play icon
import {
  LFSBuildConfig,
  getBuildConfigurations,
  saveBuildConfiguration,
  deleteBuildConfiguration // Import the new delete function
} from '@/lib/supabase/configs'; // Adjusted import path
import { useNavigate } from 'react-router-dom'; // Import useNavigate

const Configurations: React.FC = () => {
  const { toast } = useToast();
  const navigate = useNavigate(); // Initialize useNavigate
  const [configs, setConfigs] = useState<LFSBuildConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newConfig, setNewConfig] = useState<Omit<LFSBuildConfig, 'id' | 'created_at' | 'user_id'>>({
    name: '',
    target_disk: '/dev/sdb',
    sources_path: '/path/to/sources',
    scripts_path: '/path/to/scripts'
  });
  const [dialogOpen, setDialogOpen] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null); // For delete confirmation

  useEffect(() => {
    // Define and call loadConfigurations within useEffect or ensure it's stable
    const loadConfs = async () => {
      setIsLoading(true);
      const configsData = await getBuildConfigurations();
      setConfigs(configsData);
      setIsLoading(false);
    };
    loadConfs();
  }, []);

  // Renamed local loadConfigurations to avoid confusion if we import one with same name
  const refreshConfigurations = async () => {
    setIsLoading(true);
    const configsData = await getBuildConfigurations();
    setConfigs(configs);
    setIsLoading(false);
  };

  const handleCreateConfig = async () => {
    if (!newConfig.name) {
      toast({
        title: "Error",
        description: "Configuration name is required",
        variant: "destructive"
      });
      return;
    }

    try {
      const savedConfig = await saveBuildConfiguration(newConfig);
      if (savedConfig) {
        toast({
          title: "Success",
          description: "Configuration saved successfully"
        });
        setDialogOpen(false);
        await refreshConfigurations(); // Use refreshed name
        resetNewConfigForm();
      } else {
        throw new Error("Failed to save configuration");
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to save configuration",
        variant: "destructive"
      });
    }
  };

  const resetNewConfigForm = () => {
    setNewConfig({
      name: '',
      target_disk: '/dev/sdb',
      sources_path: '/path/to/sources',
      scripts_path: '/path/to/scripts'
    });
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">LFS Build Configurations</h1>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center">
              <Plus className="mr-2 h-4 w-4" /> New Configuration
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Build Configuration</DialogTitle>
              <DialogDescription>
                Define the settings for your LFS build.
              </DialogDescription>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  value={newConfig.name}
                  onChange={(e) => setNewConfig({...newConfig, name: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="target_disk" className="text-right">
                  Target Disk
                </Label>
                <Input
                  id="target_disk"
                  value={newConfig.target_disk}
                  onChange={(e) => setNewConfig({...newConfig, target_disk: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="sources_path" className="text-right">
                  Sources Path
                </Label>
                <Input
                  id="sources_path"
                  value={newConfig.sources_path}
                  onChange={(e) => setNewConfig({...newConfig, sources_path: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="scripts_path" className="text-right">
                  Scripts Path
                </Label>
                <Input
                  id="scripts_path"
                  value={newConfig.scripts_path}
                  onChange={(e) => setNewConfig({...newConfig, scripts_path: e.target.value})}
                  className="col-span-3"
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleCreateConfig}>Save Configuration</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      {isLoading ? (
        <div className="text-center py-8">Loading configurations...</div>
      ) : configs.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No configurations found.</p>
          <p className="mt-2">Create a new configuration to start building LFS.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {configs.map((config) => (
            <Card key={config.id} className="flex flex-col">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <HardDrive className="mr-2 h-5 w-5 text-blue-500" />
                    <CardTitle>{config.name}</CardTitle>
                  </div>
                  <Button variant="ghost" size="icon">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
                <CardDescription>Created: {new Date(config.created_at as string).toLocaleString()}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <span className="font-medium">Target Disk:</span> {config.target_disk}
                  </div>
                  <div>
                    <span className="font-medium">Sources Path:</span> {config.sources_path}
                  </div>
                  <div>
                    <span className="font-medium">Scripts Path:</span> {config.scripts_path}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between mt-auto">
                {/* Corrected Structure: Direct buttons in CardFooter */}
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center"
                  onClick={() => setShowDeleteConfirm(config.id!)} // Open delete confirmation
                >
                  <Trash2 className="mr-1 h-4 w-4 text-red-500" />
                  Delete
                </Button>
                <Button
                  size="sm"
                  className="flex items-center"
                  onClick={() => navigate('/', { state: { configId: config.id } })} // Pass configId in navigation state
                >
                  <Play className="mr-1 h-4 w-4" />
                  Start Build
                </Button>
              </CardFooter>
            </Card>
          ))}
          </div>
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={!!showDeleteConfirm} onOpenChange={() => setShowDeleteConfirm(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you sure?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete the build configuration.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDeleteConfirm(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={async () => {
                  if (showDeleteConfirm) {
                    const success = await deleteBuildConfiguration(showDeleteConfirm);
                    if (success) {
                      toast({ title: "Success", description: "Configuration deleted." });
                      await refreshConfigurations();
                    } else {
                      // Toast for failure is handled within deleteBuildConfiguration or its utils
                    }
                    setShowDeleteConfirm(null);
                  }
                }}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  };
          ))}
        </div>
      )}
    </div>
  );
};

export default Configurations;
