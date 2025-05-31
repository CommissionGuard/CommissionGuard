import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileUp, Plus } from "lucide-react";

export default function AddContractForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [clientId, setClientId] = useState("");
  const [representationType, setRepresentationType] = useState("buyer");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const { data: clients } = useQuery({
    queryKey: ["/api/clients"],
  });

  const createContractMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("POST", "/api/contracts", data);
    },
    onSuccess: () => {
      toast({
        title: "Contract Added",
        description: "Contract has been successfully created and is now being monitored.",
      });
      setClientId("");
      setRepresentationType("buyer");
      setStartDate("");
      setEndDate("");
      setSelectedFile(null);
      queryClient.invalidateQueries({ queryKey: ["/api/contracts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to create contract. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!clientId || !startDate || !endDate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    createContractMutation.mutate({
      clientId: parseInt(clientId),
      representationType,
      startDate,
      endDate,
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      toast({
        title: "File Selected",
        description: `${file.name} ready to upload`,
      });
    }
  };

  return (
    <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
      <CardHeader className="border-b border-gray-200">
        <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
          <Plus className="text-primary mr-2" />
          Add New Contract
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="clientId" className="block text-sm font-medium text-gray-700 mb-2">
                Client *
              </Label>
              <Select value={clientId} onValueChange={setClientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a client" />
                </SelectTrigger>
                <SelectContent>
                  {clients && clients.length > 0 ? (
                    clients.map((client: any) => (
                      <SelectItem key={client.id} value={client.id.toString()}>
                        {client.fullName}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="no-clients" disabled>
                      No clients available - add a client first
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="representationType" className="block text-sm font-medium text-gray-700 mb-2">
                Representation Type *
              </Label>
              <Select value={representationType} onValueChange={setRepresentationType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select representation type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="buyer">Buyer Representation</SelectItem>
                  <SelectItem value="seller">Seller Representation</SelectItem>
                  <SelectItem value="dual">Dual Agency</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-2">
                Start Date *
              </Label>
              <Input 
                type="date" 
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-2">
                End Date *
              </Label>
              <Input 
                type="date" 
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* File Upload */}
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-2">
              Contract Document (Optional)
            </Label>
            <div className="flex items-center space-x-4">
              <input
                type="file"
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={handleFileChange}
                className="hidden"
                id="contract-file"
              />
              <Label
                htmlFor="contract-file"
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <FileUp className="h-4 w-4 mr-2" />
                Choose File
              </Label>
              {selectedFile && (
                <span className="text-sm text-gray-600">
                  {selectedFile.name}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Supported formats: PDF, DOC, DOCX, JPG, PNG (max 10MB)
            </p>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={createContractMutation.isPending}
              className="bg-primary text-white hover:bg-blue-700 px-8"
            >
              {createContractMutation.isPending ? "Creating..." : "Create Contract"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}