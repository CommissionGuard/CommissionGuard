import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/navbar";
import AnimatedBackground from "@/components/animated-background";
import { 
  FileText, 
  Phone, 
  Mail, 
  Building, 
  Clock, 
  DollarSign, 
  CheckCircle,
  AlertTriangle,
  Copy,
  ExternalLink
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function CountySetupGuide() {
  const { toast } = useToast();
  const [emailTemplate, setEmailTemplate] = useState(`Subject: API Access Request for Real Estate Commission Protection System

Dear County Clerk,

I am a licensed real estate professional requesting API access to your property records database for commission protection purposes.

Business Information:
- Business Name: [Your Business Name]
- Real Estate License: [Your License Number]
- Contact: [Your Name, Phone, Email]

Purpose:
I need to monitor property deed recordings to detect when clients purchase properties during exclusive representation periods using different agents, which constitutes a breach of contract and commission loss.

Technical Requirements:
- Daily monitoring of deed recordings
- Search by buyer/seller names
- Include agent information in results
- Estimated 50-100 API calls per day

Please provide information about:
- API documentation and endpoints
- Authentication requirements
- Rate limits and pricing
- Application process and timeline

Thank you for your assistance.

Best regards,
[Your Name]
[Your Title]
[Your Contact Information]`);

  const copyEmailTemplate = () => {
    navigator.clipboard.writeText(emailTemplate);
    toast({
      title: "Email Template Copied",
      description: "Template copied to clipboard - customize with your information",
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
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl shadow-lg">
              <Building className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                County API Setup Guide
              </h1>
              <p className="text-gray-600 mt-1">Get access to Nassau & Suffolk County public records</p>
            </div>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="nassau">Nassau County</TabsTrigger>
            <TabsTrigger value="suffolk">Suffolk County</TabsTrigger>
            <TabsTrigger value="application">Application</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Benefits */}
            <Card>
              <CardHeader>
                <CardTitle>Why County API Access is Essential</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="bg-green-100 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                      <AlertTriangle className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Automatic Breach Detection</h3>
                    <p className="text-sm text-gray-600">
                      Instantly detect when clients purchase properties using different agents during exclusive contracts
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="bg-blue-100 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                      <DollarSign className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Protect Commission</h3>
                    <p className="text-sm text-gray-600">
                      Calculate exact lost commission amounts with deed recording evidence for legal action
                    </p>
                  </div>
                  
                  <div className="text-center">
                    <div className="bg-purple-100 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                      <Clock className="h-6 w-6 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Real-Time Monitoring</h3>
                    <p className="text-sm text-gray-600">
                      Daily scans of county records provide immediate alerts when breaches occur
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building className="h-5 w-5 mr-2 text-blue-600" />
                    Nassau County Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">API Access</span>
                      <Badge variant="outline" className="text-red-600 border-red-600">
                        Not Configured
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p><strong>Contact:</strong> clerk@nassaucountyny.gov</p>
                      <p><strong>Phone:</strong> (516) 571-2660</p>
                      <p><strong>Processing Time:</strong> 2-3 weeks</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Building className="h-5 w-5 mr-2 text-green-600" />
                    Suffolk County Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">API Access</span>
                      <Badge variant="outline" className="text-red-600 border-red-600">
                        Not Configured
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      <p><strong>Contact:</strong> clerk@suffolkcountyny.gov</p>
                      <p><strong>Phone:</strong> (631) 853-4070</p>
                      <p><strong>Processing Time:</strong> 1-2 weeks</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="nassau" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Nassau County Clerk's Office</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Contact Information</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4" />
                        <span>clerk@nassaucountyny.gov</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4" />
                        <span>(516) 571-2660</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Building className="h-4 w-4" />
                        <span>240 Old Country Road, Mineola, NY 11501</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">API Details</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p><strong>Endpoint:</strong> https://api.nassaucountyny.gov/records/search</p>
                      <p><strong>Authentication:</strong> Bearer Token</p>
                      <p><strong>Rate Limit:</strong> 1000 requests/day</p>
                      <p><strong>Cost:</strong> $50-100/month</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-3">Required Documents</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Real estate license copy</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Business registration documents</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Completed API application form</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Technical requirements document</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="suffolk" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Suffolk County Clerk's Office</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Contact Information</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4" />
                        <span>clerk@suffolkcountyny.gov</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4" />
                        <span>(631) 853-4070</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Building className="h-4 w-4" />
                        <span>310 Center Drive, Riverhead, NY 11901</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">API Details</h4>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p><strong>Endpoint:</strong> https://records.suffolkcountyny.gov/api/v1/search</p>
                      <p><strong>Authentication:</strong> X-API-Key header</p>
                      <p><strong>Rate Limit:</strong> 500 requests/day</p>
                      <p><strong>Cost:</strong> $75-125/month</p>
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 mb-3">Required Documents</h4>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Real estate license copy</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Business registration documents</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Completed API application form</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span>Technical requirements document</span>
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="application" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Email Template for County Clerks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-template">Copy this email template and customize with your information:</Label>
                  <Textarea
                    id="email-template"
                    value={emailTemplate}
                    onChange={(e) => setEmailTemplate(e.target.value)}
                    className="min-h-[400px] font-mono text-sm"
                  />
                </div>
                
                <div className="flex space-x-2">
                  <Button onClick={copyEmailTemplate} className="flex-1">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Email Template
                  </Button>
                  <Button variant="outline" asChild>
                    <a href="mailto:clerk@nassaucountyny.gov" className="flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      Email Nassau County
                    </a>
                  </Button>
                  <Button variant="outline" asChild>
                    <a href="mailto:clerk@suffolkcountyny.gov" className="flex items-center">
                      <Mail className="h-4 w-4 mr-2" />
                      Email Suffolk County
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Next Steps */}
            <Card>
              <CardHeader>
                <CardTitle>Application Process Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="bg-blue-100 p-2 rounded-full">
                      <Mail className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Step 1: Send Initial Email</h4>
                      <p className="text-sm text-gray-600">Use the template above to contact both county clerks</p>
                      <span className="text-xs text-gray-500">Timeline: Same day</span>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="bg-yellow-100 p-2 rounded-full">
                      <FileText className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Step 2: Complete Applications</h4>
                      <p className="text-sm text-gray-600">Fill out forms and submit required documents</p>
                      <span className="text-xs text-gray-500">Timeline: 3-5 days</span>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="bg-green-100 p-2 rounded-full">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">Step 3: Receive API Keys</h4>
                      <p className="text-sm text-gray-600">Get credentials and configure the monitoring system</p>
                      <span className="text-xs text-gray-500">Timeline: 1-3 weeks</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">Important Note</h4>
                      <p className="text-sm text-blue-700">
                        Once you receive the API keys, simply add them to your environment variables. The monitoring system is already configured and will automatically start scanning county records for commission breaches.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}