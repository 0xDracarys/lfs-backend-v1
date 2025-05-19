
import { IsoMetadata } from "@/lib/testing/iso-generator";
import { format } from "date-fns";
import { toast } from "sonner";
import { backendService } from "@/lib/testing/backend-service";

/**
 * Creates placeholder data for browser demo
 */
export const createPlaceholderData = (buildId: string): IsoMetadata[] => {
  return [
    {
      buildId,
      isoName: "lfs-base-11.3.iso",
      timestamp: new Date().toISOString(),
      configName: "Basic LFS",
      outputPath: `/tmp/iso/${buildId}/lfs-base-11.3.iso`,
      bootable: true,
      bootloader: "grub",
      label: "LFS_BASE"
    },
    {
      buildId,
      isoName: "lfs-extended-11.3.iso",
      timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      configName: "Extended LFS",
      outputPath: `/tmp/iso/${buildId}/lfs-extended-11.3.iso`,
      bootable: true,
      bootloader: "grub",
      label: "LFS_EXT"
    }
  ];
};

/**
 * Handle downloading an ISO file
 */
export const handleDownload = (iso: IsoMetadata) => {
  try {
    if (iso.jobId) {
      // If this ISO was created by the backend service
      backendService.downloadIso(iso.jobId, iso.isoName);
    } else {
      // In a real application with a backend, we would have a real download endpoint
      // For now, we'll simulate a download by creating a dummy file
      toast.info("Simulated Download", {
        description: `In a production environment, this would download ${iso.isoName}`
      });
      
      // Create a blob with some text content to simulate the ISO file
      const blob = new Blob([`This is a simulated ISO file: ${iso.isoName}\n
Build ID: ${iso.buildId}\n
Created: ${iso.timestamp}\n
Configuration: ${iso.configName}\n
This is just a simulation as we don't have a real server to generate actual ISO files.`], 
      { type: 'text/plain' });
      
      // Create a download link and trigger it
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = iso.isoName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    }
  } catch (error) {
    toast.error("Download failed", {
      description: `Error downloading ISO: ${error}`
    });
  }
};

/**
 * Format a date using the date-fns library
 */
export const formatDate = (dateString: string): string => {
  return format(new Date(dateString), "MMM d, yyyy HH:mm");
};
