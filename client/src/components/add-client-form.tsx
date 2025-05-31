import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { PlusCircle, CloudUpload } from "lucide-react";

const clientFormSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().min(10, "Valid phone number is required"),
  representationType: z.enum(["buyer", "seller"]),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
});

type ClientFormData = z.infer<typeof clientFormSchema>;

export default function AddClientForm() {
  const [contractFile, setContractFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ClientFormData>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      representationType: undefined,
      startDate: "",
      endDate: "",
    },
  });

  const createClientMutation = useMutation({
    mutationFn: async (data: ClientFormData) => {
      return await apiRequest("POST", "/api/clients", data);
    },
    onSuccess: async (response, variables) => {
      const client = await response.json();
      
      // If there's a contract file, create the contract
      if (contractFile) {
        const formData = new FormData();
        formData.append("clientId", client.id.toString());
        formData.append("representationType", variables.representationType);
        formData.append("startDate", variables.startDate);
        formData.append("endDate", variables.endDate);
        formData.append("contractFile", contractFile);

        try {
          await fetch("/api/contracts", {
            method: "POST",
            body: formData,
            credentials: "include",
          });
        } catch (error) {
          console.error("Error creating contract:", error);
          toast({
            title: "Warning",
            description: "Client created but contract upload failed",
            variant: "destructive",
          });
          return;
        }
      }

      // Success
      queryClient.invalidateQueries({ queryKey: ["/api/clients"] });
      queryClient.invalidateQueries({ queryKey: ["/api/contracts"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/stats"] });
      
      toast({
        title: "Success",
        description: contractFile 
          ? "Client and contract added successfully"
          : "Client added successfully",
      });
      
      form.reset();
      setContractFile(null);
      setIsSubmitting(false);
    },
    onError: (error) => {
      setIsSubmitting(false);
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
        description: "Failed to add client. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: ClientFormData) => {
    setIsSubmitting(true);
    createClientMutation.mutate(data);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast({
          title: "Invalid File",
          description: "Only PDF files are allowed",
          variant: "destructive",
        });
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "File Too Large",
          description: "File must be smaller than 10MB",
          variant: "destructive",
        });
        return;
      }
      setContractFile(file);
    }
  };

  return (
    <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
          <PlusCircle className="text-primary mr-2" />
          Add New Client
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
              Full Legal Name
            </Label>
            <Input
              id="fullName"
              placeholder="Enter client's full legal name"
              {...form.register("fullName")}
              className="w-full"
            />
            {form.formState.errors.fullName && (
              <p className="text-sm text-red-600 mt-1">{form.formState.errors.fullName.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="client@email.com"
              {...form.register("email")}
              className="w-full"
            />
            {form.formState.errors.email && (
              <p className="text-sm text-red-600 mt-1">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div>
            <Label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="(555) 123-4567"
              {...form.register("phone")}
              className="w-full"
            />
            {form.formState.errors.phone && (
              <p className="text-sm text-red-600 mt-1">{form.formState.errors.phone.message}</p>
            )}
          </div>

          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-1">
              Representation Type
            </Label>
            <Select onValueChange={(value) => form.setValue("representationType", value as "buyer" | "seller")}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="buyer">Buyer Representation</SelectItem>
                <SelectItem value="seller">Seller Representation</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.representationType && (
              <p className="text-sm text-red-600 mt-1">{form.formState.errors.representationType.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                Start Date
              </Label>
              <Input
                id="startDate"
                type="date"
                {...form.register("startDate")}
                className="w-full"
              />
              {form.formState.errors.startDate && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.startDate.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                End Date
              </Label>
              <Input
                id="endDate"
                type="date"
                {...form.register("endDate")}
                className="w-full"
              />
              {form.formState.errors.endDate && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.endDate.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-1">
              Upload Contract (PDF)
            </Label>
            <div 
              className={`border-2 border-dashed rounded-lg p-4 text-center hover:border-primary transition-colors cursor-pointer ${
                contractFile ? "border-success bg-green-50" : "border-gray-300"
              }`}
              onClick={() => document.querySelector('input[type="file"]')?.click()}
            >
              {contractFile ? (
                <>
                  <div className="text-2xl text-red-500 mb-2">📄</div>
                  <p className="text-sm text-gray-600">{contractFile.name}</p>
                  <p className="text-xs text-gray-500">{(contractFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </>
              ) : (
                <>
                  <CloudUpload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Drop PDF here or click to upload</p>
                </>
              )}
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-primary text-white hover:bg-blue-700"
          >
            {isSubmitting ? "Adding..." : "Add Client & Contract"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
