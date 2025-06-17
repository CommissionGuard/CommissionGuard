import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navbar from "@/components/navbar";
import AnimatedBackground from "@/components/animated-background";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { 
  FileText, 
  Upload,
  Download,
  Folder,
  Search,
  Filter,
  Calendar,
  User,
  Tag,
  Archive,
  Share,
  Lock,
  Eye,
  Edit,
  Trash2,
  Plus
} from "lucide-react";

export default function DocumentManager() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [uploadData, setUploadData] = useState({
    title: "",
    category: "contract",
    tags: "",
    description: ""
  });

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-32 w-32 border-4 border-gray-200"></div>
            <div className="animate-spin rounded-full h-32 w-32 border-4 border-primary border-t-transparent absolute top-0"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <FileText className="h-8 w-8 text-primary animate-pulse" />
            </div>
          </div>
          <p className="mt-6 text-gray-700 font-medium">Loading document manager...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const documents = [
    {
      id: 1,
      title: "Buyer Representation Agreement - Johnson",
      category: "contract",
      client: "Sarah Johnson",
      dateUploaded: "2024-01-20",
      size: "2.4 MB",
      type: "PDF",
      tags: ["buyer", "representation", "active"],
      isSecured: true,
      status: "Active"
    },
    {
      id: 2,
      title: "Property Disclosure - 123 Main St",
      category: "disclosure",
      client: "Mike Chen",
      dateUploaded: "2024-01-18",
      size: "1.8 MB",
      type: "PDF",
      tags: ["disclosure", "seller", "property"],
      isSecured: false,
      status: "Completed"
    },
    {
      id: 3,
      title: "Commission Agreement Template",
      category: "template",
      client: "N/A",
      dateUploaded: "2024-01-15",
      size: "0.8 MB",
      type: "DOCX",
      tags: ["template", "commission"],
      isSecured: false,
      status: "Template"
    },
    {
      id: 4,
      title: "Legal Opinion - Contract Breach Case",
      category: "legal",
      client: "David Wilson",
      dateUploaded: "2024-01-22",
      size: "3.2 MB",
      type: "PDF",
      tags: ["legal", "breach", "opinion"],
      isSecured: true,
      status: "Under Review"
    }
  ];

  const categories = [
    { value: "all", label: "All Documents" },
    { value: "contract", label: "Contracts" },
    { value: "disclosure", label: "Disclosures" },
    { value: "legal", label: "Legal Documents" },
    { value: "template", label: "Templates" },
    { value: "correspondence", label: "Correspondence" }
  ];

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === "all" || doc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleUpload = () => {
    toast({
      title: "Upload Started",
      description: "Document upload functionality would be implemented here with secure file handling.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 relative">
      <AnimatedBackground />
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-3 rounded-xl shadow-lg">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Document Management Center
              </h1>
              <p className="text-gray-600 mt-1">Organize, secure, and access all your real estate documents</p>
            </div>
          </div>
        </div>

        {/* Document Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="pt-6">
              <div className="text-center">
                <Folder className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">247</p>
                <p className="text-sm text-gray-600">Total Documents</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="pt-6">
              <div className="text-center">
                <Lock className="h-8 w-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">156</p>
                <p className="text-sm text-gray-600">Secured Files</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="pt-6">
              <div className="text-center">
                <Share className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">34</p>
                <p className="text-sm text-gray-600">Shared Documents</p>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300">
            <CardContent className="pt-6">
              <div className="text-center">
                <Archive className="h-8 w-8 text-orange-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">12.4 GB</p>
                <p className="text-sm text-gray-600">Storage Used</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="documents" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="documents">Document Library</TabsTrigger>
            <TabsTrigger value="upload">Upload Documents</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="security">Security & Compliance</TabsTrigger>
          </TabsList>

          <TabsContent value="documents" className="space-y-6">
            {/* Search and Filter */}
            <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        placeholder="Search documents, clients, or tags..."
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="md:w-64">
                    <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                      <SelectTrigger>
                        <Filter className="h-4 w-4 mr-2" />
                        <SelectValue placeholder="Filter by category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button
                    onClick={() => toast({
                      title: "New Folder",
                      description: "Folder creation will be available once document storage API is integrated.",
                    })}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Folder
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Document List */}
            <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  Documents ({filteredDocuments.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredDocuments.map((doc) => (
                    <div key={doc.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-300">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start space-x-4">
                          <div className="bg-blue-100 rounded-lg p-3">
                            <FileText className="h-6 w-6 text-blue-600" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h3 className="font-semibold text-gray-900">{doc.title}</h3>
                              {doc.isSecured && <Lock className="h-4 w-4 text-green-600" />}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-3">
                              <div className="flex items-center">
                                <User className="h-4 w-4 mr-1" />
                                {doc.client}
                              </div>
                              <div className="flex items-center">
                                <Calendar className="h-4 w-4 mr-1" />
                                {doc.dateUploaded}
                              </div>
                              <div>
                                Type: {doc.type} • {doc.size}
                              </div>
                              <div>
                                <Badge variant="outline" className="text-xs">
                                  {doc.status}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex flex-wrap gap-1 mb-3">
                              {doc.tags.map((tag, index) => (
                                <Badge key={index} variant="secondary" className="text-xs">
                                  <Tag className="h-3 w-3 mr-1" />
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => toast({
                              title: "Document Viewer",
                              description: "Document viewer will be available once document storage API is integrated.",
                            })}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => toast({
                              title: "Download Started",
                              description: "Document download will be available once document storage API is integrated.",
                            })}
                          >
                            <Download className="h-3 w-3 mr-1" />
                            Download
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => toast({
                              title: "Share Document",
                              description: "Document sharing will be available once document storage API is integrated.",
                            })}
                          >
                            <Share className="h-3 w-3 mr-1" />
                            Share
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => toast({
                              title: "Edit Document",
                              description: "Document editing will be available once document storage API is integrated.",
                            })}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="upload" className="space-y-6">
            <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
                  <Upload className="text-primary mr-2" />
                  Upload New Document
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Upload Area */}
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-primary transition-colors duration-300">
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Drop files here or click to upload</h3>
                  <p className="text-gray-600 mb-4">Supports PDF, DOC, DOCX, images up to 10MB</p>
                  <Button
                    onClick={() => toast({
                      title: "File Upload",
                      description: "File upload will be available once document storage API is integrated.",
                    })}
                  >
                    Choose Files
                  </Button>
                </div>

                {/* Document Details Form */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="docTitle">Document Title</Label>
                      <Input
                        id="docTitle"
                        placeholder="Enter document title"
                        value={uploadData.title}
                        onChange={(e) => setUploadData({...uploadData, title: e.target.value})}
                      />
                    </div>

                    <div>
                      <Label htmlFor="docCategory">Category</Label>
                      <Select value={uploadData.category} onValueChange={(value) => setUploadData({...uploadData, category: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="contract">Contract</SelectItem>
                          <SelectItem value="disclosure">Disclosure</SelectItem>
                          <SelectItem value="legal">Legal Document</SelectItem>
                          <SelectItem value="template">Template</SelectItem>
                          <SelectItem value="correspondence">Correspondence</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="docTags">Tags (comma separated)</Label>
                      <Input
                        id="docTags"
                        placeholder="e.g., buyer, representation, active"
                        value={uploadData.tags}
                        onChange={(e) => setUploadData({...uploadData, tags: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="docDescription">Description</Label>
                      <Textarea
                        id="docDescription"
                        placeholder="Brief description of the document"
                        rows={4}
                        value={uploadData.description}
                        onChange={(e) => setUploadData({...uploadData, description: e.target.value})}
                      />
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-2">Security Options</h4>
                      <div className="space-y-2 text-sm">
                        <label className="flex items-center">
                          <input type="checkbox" className="mr-2" defaultChecked />
                          Encrypt document
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" className="mr-2" />
                          Require password for access
                        </label>
                        <label className="flex items-center">
                          <input type="checkbox" className="mr-2" />
                          Enable audit trail
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <Button variant="outline">
                    Save as Draft
                  </Button>
                  <Button onClick={handleUpload} className="bg-gradient-to-r from-primary to-blue-600">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Document
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="templates" className="space-y-6">
            <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900">Document Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    { name: "Buyer Representation Agreement", description: "Standard buyer representation contract template", category: "Contract" },
                    { name: "Seller Listing Agreement", description: "Exclusive seller listing agreement template", category: "Contract" },
                    { name: "Property Disclosure Form", description: "Comprehensive property disclosure template", category: "Disclosure" },
                    { name: "Commission Agreement", description: "Commission structure agreement template", category: "Contract" },
                    { name: "Breach Notice Letter", description: "Template for contract breach notifications", category: "Legal" },
                    { name: "Client Intake Form", description: "Initial client information gathering form", category: "Form" }
                  ].map((template, index) => (
                    <Card key={index} className="border border-gray-200 hover:shadow-md transition-shadow duration-300">
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <div className="bg-purple-100 rounded-lg p-2">
                            <FileText className="h-5 w-5 text-purple-600" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
                            <p className="text-sm text-gray-600 mb-2">{template.description}</p>
                            <Badge variant="outline" className="text-xs mb-3">
                              {template.category}
                            </Badge>
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                <Eye className="h-3 w-3 mr-1" />
                                Preview
                              </Button>
                              <Button size="sm">
                                <Download className="h-3 w-3 mr-1" />
                                Use
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card className="bg-white rounded-xl shadow-sm border border-gray-200">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-gray-900 flex items-center">
                  <Lock className="text-green-600 mr-2" />
                  Security & Compliance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Security Features</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center">
                          <Lock className="h-5 w-5 text-green-600 mr-2" />
                          <span>End-to-end Encryption</span>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center">
                          <Eye className="h-5 w-5 text-green-600 mr-2" />
                          <span>Access Audit Trail</span>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                        <div className="flex items-center">
                          <Share className="h-5 w-5 text-green-600 mr-2" />
                          <span>Secure Document Sharing</span>
                        </div>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900">Compliance Standards</h3>
                    <div className="space-y-3">
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center mb-2">
                          <FileText className="h-5 w-5 text-blue-600 mr-2" />
                          <span className="font-medium">GDPR Compliance</span>
                        </div>
                        <p className="text-sm text-gray-600">Data protection and privacy regulations compliance</p>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center mb-2">
                          <Archive className="h-5 w-5 text-blue-600 mr-2" />
                          <span className="font-medium">Document Retention</span>
                        </div>
                        <p className="text-sm text-gray-600">Automated retention policies for legal requirements</p>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div className="flex items-center mb-2">
                          <Lock className="h-5 w-5 text-blue-600 mr-2" />
                          <span className="font-medium">SOC 2 Certified</span>
                        </div>
                        <p className="text-sm text-gray-600">Industry-standard security controls and practices</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>Enterprise Security:</strong> For enhanced security features including advanced encryption, 
                    multi-factor authentication, and custom retention policies, contact our enterprise team.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}