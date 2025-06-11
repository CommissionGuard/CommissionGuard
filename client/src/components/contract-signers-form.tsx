import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, UserCheck, Clock } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface ContractSigner {
  id: number;
  contractId: number;
  signerName: string;
  signerEmail?: string;
  signerPhone?: string;
  signerRole: string;
  signedDate?: string;
  signatureStatus: "pending" | "signed" | "declined";
  isRequired: boolean;
}

interface ContractSignersFormProps {
  contractId: number;
  onSignersUpdate?: () => void;
}

const signerRoles = [
  { value: "primary_buyer", label: "Primary Buyer" },
  { value: "co_buyer", label: "Co-Buyer" },
  { value: "spouse", label: "Spouse" },
  { value: "business_partner", label: "Business Partner" },
  { value: "trustee", label: "Trustee" },
  { value: "legal_guardian", label: "Legal Guardian" },
  { value: "power_of_attorney", label: "Power of Attorney" },
  { value: "corporate_officer", label: "Corporate Officer" },
];

export default function ContractSignersForm({ contractId, onSignersUpdate }: ContractSignersFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [newSigner, setNewSigner] = useState({
    signerName: "",
    signerEmail: "",
    signerPhone: "",
    signerRole: "",
    isRequired: true,
  });

  const { data: signers = [], isLoading } = useQuery({
    queryKey: [`/api/contracts/${contractId}/signers`],
    enabled: !!contractId,
  });

  const addSignerMutation = useMutation({
    mutationFn: async (signerData: any) => {
      return apiRequest(`/api/contracts/${contractId}/signers`, "POST", signerData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/contracts/${contractId}/signers`] });
      queryClient.invalidateQueries({ queryKey: ["/api/contracts"] });
      setNewSigner({
        signerName: "",
        signerEmail: "",
        signerPhone: "",
        signerRole: "",
        isRequired: true,
      });
      onSignersUpdate?.();
      toast({
        title: "Success",
        description: "Signer added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add signer",
        variant: "destructive",
      });
    },
  });

  const markSignedMutation = useMutation({
    mutationFn: async (signerId: number) => {
      return apiRequest(`/api/contract-signers/${signerId}/sign`, "PATCH");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/contracts/${contractId}/signers`] });
      queryClient.invalidateQueries({ queryKey: ["/api/contracts"] });
      onSignersUpdate?.();
      toast({
        title: "Success",
        description: "Signer marked as signed",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update signer status",
        variant: "destructive",
      });
    },
  });

  const deleteSignerMutation = useMutation({
    mutationFn: async (signerId: number) => {
      return apiRequest(`/api/contract-signers/${signerId}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/contracts/${contractId}/signers`] });
      queryClient.invalidateQueries({ queryKey: ["/api/contracts"] });
      onSignersUpdate?.();
      toast({
        title: "Success",
        description: "Signer removed successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to remove signer",
        variant: "destructive",
      });
    },
  });

  const handleAddSigner = () => {
    if (!newSigner.signerName || !newSigner.signerRole) {
      toast({
        title: "Error",
        description: "Please fill in the signer name and role",
        variant: "destructive",
      });
      return;
    }

    addSignerMutation.mutate(newSigner);
  };

  const getStatusBadge = (status: string, signedDate?: string) => {
    switch (status) {
      case "signed":
        return (
          <Badge variant="default" className="bg-green-100 text-green-800">
            <UserCheck className="h-3 w-3 mr-1" />
            Signed {signedDate && `on ${new Date(signedDate).toLocaleDateString()}`}
          </Badge>
        );
      case "declined":
        return (
          <Badge variant="destructive">
            Declined
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };

  if (isLoading) {
    return <div>Loading signers...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-5 w-5" />
          Contract Signers ({signers.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Existing Signers */}
        {signers.length > 0 && (
          <div className="space-y-3">
            {signers.map((signer: ContractSigner) => (
              <div key={signer.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="font-medium">{signer.signerName}</div>
                  <div className="text-sm text-gray-600">
                    {signerRoles.find(role => role.value === signer.signerRole)?.label || signer.signerRole}
                  </div>
                  {signer.signerEmail && (
                    <div className="text-sm text-gray-500">{signer.signerEmail}</div>
                  )}
                  {signer.signerPhone && (
                    <div className="text-sm text-gray-500">{signer.signerPhone}</div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge(signer.signatureStatus, signer.signedDate)}
                  {signer.signatureStatus === "pending" && (
                    <Button
                      size="sm"
                      onClick={() => markSignedMutation.mutate(signer.id)}
                      disabled={markSignedMutation.isPending}
                    >
                      Mark Signed
                    </Button>
                  )}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => deleteSignerMutation.mutate(signer.id)}
                    disabled={deleteSignerMutation.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add New Signer */}
        <div className="border-t pt-4">
          <h4 className="font-medium mb-3">Add New Signer</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="signerName">Full Name *</Label>
              <Input
                id="signerName"
                value={newSigner.signerName}
                onChange={(e) => setNewSigner({ ...newSigner, signerName: e.target.value })}
                placeholder="Enter full name"
              />
            </div>
            <div>
              <Label htmlFor="signerRole">Role *</Label>
              <Select
                value={newSigner.signerRole}
                onValueChange={(value) => setNewSigner({ ...newSigner, signerRole: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {signerRoles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="signerEmail">Email</Label>
              <Input
                id="signerEmail"
                type="email"
                value={newSigner.signerEmail}
                onChange={(e) => setNewSigner({ ...newSigner, signerEmail: e.target.value })}
                placeholder="Enter email address"
              />
            </div>
            <div>
              <Label htmlFor="signerPhone">Phone</Label>
              <Input
                id="signerPhone"
                value={newSigner.signerPhone}
                onChange={(e) => setNewSigner({ ...newSigner, signerPhone: e.target.value })}
                placeholder="Enter phone number"
              />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button
              onClick={handleAddSigner}
              disabled={addSignerMutation.isPending || !newSigner.signerName || !newSigner.signerRole}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Signer
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}