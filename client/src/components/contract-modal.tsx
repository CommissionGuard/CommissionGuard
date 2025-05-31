import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { FileText, Download, AlertTriangle, Upload } from "lucide-react";

interface ContractModalProps {
  contract: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function ContractModal({ contract, isOpen, onClose }: ContractModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);

  if (!contract) return null;

  const handleDownload = async () => {
    if (!contract.contractFileUrl) return;
    
    setIsDownloading(true);
    try {
      const response = await fetch(contract.contractFileUrl, {
        credentials: "include",
      });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.style.display = "none";
      a.href = url;
      a.download = contract.contractFileName || "contract.pdf";
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download failed:", error);
    } finally {
      setIsDownloading(false);
    }
  };

  const getRepresentationTypeColor = (type: string) => {
    return type === "buyer" 
      ? "bg-blue-100 text-primary" 
      : "bg-green-100 text-success";
  };

  // Mock recent activity data - in a real app this would come from the API
  const recentActivity = [
    {
      id: 1,
      icon: AlertTriangle,
      iconColor: "text-accent",
      text: "Potential breach detected - Property transaction found",
      timestamp: "2 hours ago",
    },
    {
      id: 2,
      icon: Upload,
      iconColor: "text-primary",
      text: "Contract uploaded to system",
      timestamp: new Date(contract.createdAt).toLocaleDateString(),
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-screen overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-gray-900">
            Contract Details
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-1">
                Client Name
              </Label>
              <p className="text-gray-900 font-medium">
                {contract.client?.fullName || "Unknown"}
              </p>
            </div>
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-1">
                Representation Type
              </Label>
              <Badge className={getRepresentationTypeColor(contract.representationType)}>
                {contract.representationType === "buyer" ? "Buyer Representation" : "Seller Representation"}
              </Badge>
            </div>
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </Label>
              <p className="text-gray-900">
                {new Date(contract.startDate).toLocaleDateString()}
              </p>
            </div>
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </Label>
              <p className="text-gray-900">
                {new Date(contract.endDate).toLocaleDateString()}
              </p>
            </div>
          </div>

          {contract.contractFileUrl && (
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-2">
                Contract Document
              </Label>
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-center space-x-3">
                  <FileText className="h-8 w-8 text-red-500" />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {contract.contractFileName || "contract.pdf"}
                    </p>
                    <p className="text-sm text-gray-600">
                      Uploaded {new Date(contract.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleDownload}
                  disabled={isDownloading}
                  variant="link"
                  className="mt-3 text-primary font-medium hover:underline text-sm p-0"
                >
                  <Download className="h-4 w-4 mr-1" />
                  {isDownloading ? "Downloading..." : "Download Document"}
                </Button>
              </div>
            </div>
          )}

          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              Recent Activity
            </Label>
            <div className="space-y-3">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-3 text-sm">
                  <activity.icon className={`${activity.iconColor} mt-0.5 h-4 w-4`} />
                  <div>
                    <p className="text-gray-900">{activity.text}</p>
                    <p className="text-gray-600">{activity.timestamp}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          {contract.alerts?.some((alert: any) => alert.type === "breach") && (
            <Button className="bg-accent text-white hover:bg-red-600">
              Contact Legal Support
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
