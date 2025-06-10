import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LFSBuildConfig, getBuildConfigurations } from '@/lib/supabase/configs';
import { LFSBuildRecord } from '@/lib/supabase/types';
import { getAllUserBuilds } from '@/lib/supabase/builds';
// Removed: import MainNavigation from '@/components/MainNavigation';
import { ExternalLink, Eye } from 'lucide-react'; // Icons
import type { Session } from '@supabase/supabase-js'; // Import Session type

interface EnrichedBuildRecord extends LFSBuildRecord {
  configName?: string;
}

interface BuildHistoryPageProps {
  session?: Session | null; // Add session prop
}

const BuildHistoryPage: React.FC<BuildHistoryPageProps> = ({ session }) => { // Destructure session
  const { toast } = useToast();
  const [builds, setBuilds] = useState<EnrichedBuildRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [userBuilds, configurations] = await Promise.all([
          getAllUserBuilds(),
          getBuildConfigurations(),
        ]);

        const configMap = new Map(configurations.map(c => [c.id, c.name]));

        const enrichedBuilds = userBuilds.map(build => ({
          ...build,
          configName: build.config_id ? configMap.get(build.config_id) : 'N/A (Default)',
        }));

        setBuilds(enrichedBuilds);
      } catch (error) {
        console.error("Error fetching build history or configurations:", error);
        toast({
          title: "Error",
          description: "Failed to load build history.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        {/* <MainNavigation /> Removed */}
        <div className="container mx-auto py-8 text-center pt-8 md:pt-12">Loading build history...</div> {/* Added padding top */}
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* <MainNavigation /> Removed */}
      <div className="container mx-auto py-8 pt-8 md:pt-12"> {/* Added padding top */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Build History</h1>
          {/* Add any controls like refresh if needed */}
        </div>

        {builds.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-500">No build history found.</p>
              <p className="mt-2 text-center">Start a new build from the LFS Builder or Configurations page.</p>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Build ID</TableHead>
                    <TableHead>Configuration</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Progress</TableHead>
                    <TableHead>Started At</TableHead>
                    <TableHead>Completed At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {builds.map((build) => (
                    <TableRow key={build.id}>
                      <TableCell className="font-medium truncate" style={{maxWidth: '100px'}} title={build.id}>
                        {build.id?.substring(0, 8)}...
                      </TableCell>
                      <TableCell>{build.configName}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          build.status === 'completed' ? 'bg-green-100 text-green-700' :
                          build.status === 'failed' ? 'bg-red-100 text-red-700' :
                          build.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {build.status}
                        </span>
                      </TableCell>
                      <TableCell>{build.progress_percentage}%</TableCell>
                      <TableCell>{new Date(build.started_at!).toLocaleString()}</TableCell>
                      <TableCell>
                        {build.completed_at ? new Date(build.completed_at).toLocaleString() : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {/* Placeholder for future build details page */}
                        <Button variant="outline" size="sm" asChild disabled>
                          {/* <Link to={`/history/${build.id}`}> */}
                            <Eye className="mr-1 h-4 w-4" /> View Details
                          {/* </Link> */}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default BuildHistoryPage;
