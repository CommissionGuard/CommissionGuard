import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import Navbar from "@/components/navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Scale, 
  Laptop, 
  Home, 
  Phone, 
  Mail, 
  Clock, 
  MapPin,
  ExternalLink,
  MessageSquare,
  FileText,
  Users,
  Calendar,
  AlertCircle,
  CheckCircle
} from "lucide-react";

export default function Support() {
  const { user } = useAuth();
  const [selectedTicket, setSelectedTicket] = useState<string | null>(null);

  const supportTeams = {
    legal: {
      title: "Legal Support",
      icon: <Scale className="h-6 w-6" />,
      description: "Contract disputes, commission protection, and legal guidance",
      color: "bg-blue-600",
      contact: {
        phone: "(555) 123-LEGAL",
        email: "legal@commissionguard.com",
        hours: "Monday - Friday, 9 AM - 6 PM EST"
      },
      services: [
        "Contract Review & Analysis",
        "Commission Dispute Resolution",
        "Legal Document Preparation",
        "Compliance Guidance",
        "Breach Investigation Support",
        "Court Documentation Assistance"
      ],
      urgencyLevels: ["Emergency", "High", "Medium", "Low"],
      responseTime: "4-24 hours",
      partner: undefined
    },
    it: {
      title: "IT Support",
      icon: <Laptop className="h-6 w-6" />,
      description: "Technical issues, platform support, and system troubleshooting",
      color: "bg-green-600",
      contact: {
        phone: "(555) 123-TECH",
        email: "support@commissionguard.com",
        hours: "24/7 Technical Support"
      },
      services: [
        "Platform Navigation Help",
        "Account Access Issues",
        "Data Synchronization Problems",
        "API Integration Support",
        "Mobile App Troubleshooting",
        "Performance Optimization"
      ],
      urgencyLevels: ["Critical", "High", "Medium", "Low"],
      responseTime: "1-4 hours",
      partner: undefined
    },
    realestate: {
      title: "Real Estate Support",
      icon: <Home className="h-6 w-6" />,
      description: "Industry expertise and consultation through Frontline Realty",
      color: "bg-purple-600",
      contact: {
        phone: "(555) FRONTLINE",
        email: "support@frontlinerealty.com",
        hours: "Monday - Saturday, 8 AM - 8 PM EST"
      },
      services: [
        "Market Analysis Consultation",
        "Contract Strategy Guidance",
        "Client Relationship Management",
        "Commission Structure Optimization",
        "Industry Best Practices",
        "Referral Network Access"
      ],
      urgencyLevels: ["Urgent", "Important", "Standard", "General"],
      responseTime: "2-8 hours",
      partner: "Frontline Realty"
    }
  };

  const recentTickets = [
    {
      id: "LEGAL-2024-001",
      type: "legal",
      title: "Commission dispute - Property at 123 Oak Street",
      status: "In Progress",
      priority: "High",
      created: "2024-06-14",
      lastUpdate: "2024-06-15"
    },
    {
      id: "IT-2024-042",
      type: "it",
      title: "Unable to sync contract data",
      status: "Resolved",
      priority: "Medium",
      created: "2024-06-13",
      lastUpdate: "2024-06-14"
    },
    {
      id: "RE-2024-018",
      type: "realestate",
      title: "Market analysis consultation request",
      status: "Scheduled",
      priority: "Standard",
      created: "2024-06-12",
      lastUpdate: "2024-06-13"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "resolved": return "text-green-600 bg-green-100";
      case "in progress": return "text-blue-600 bg-blue-100";
      case "scheduled": return "text-purple-600 bg-purple-100";
      case "pending": return "text-yellow-600 bg-yellow-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "critical":
      case "emergency":
      case "urgent": return "text-red-600 bg-red-100";
      case "high":
      case "important": return "text-orange-600 bg-orange-100";
      case "medium":
      case "standard": return "text-blue-600 bg-blue-100";
      case "low":
      case "general": return "text-gray-600 bg-gray-100";
      default: return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Support Center</h1>
          <p className="text-gray-600 mt-1">Get help from our specialized support teams</p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="legal">Legal Support</TabsTrigger>
            <TabsTrigger value="it">IT Support</TabsTrigger>
            <TabsTrigger value="realestate">Real Estate</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Support Teams Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(supportTeams).map(([key, team]) => (
                <Card key={key} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${team.color} text-white`}>
                        {team.icon}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{team.title}</CardTitle>
                        {team.partner && (
                          <Badge variant="outline" className="mt-1">
                            Powered by {team.partner}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-gray-600">{team.description}</p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span>Response: {team.responseTime}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{team.contact.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Mail className="h-4 w-4 text-gray-400" />
                        <span>{team.contact.email}</span>
                      </div>
                    </div>

                    <Button 
                      className="w-full"
                      onClick={() => {
                        const tabTrigger = document.querySelector(`[value="${key}"]`) as HTMLButtonElement;
                        if (tabTrigger && typeof tabTrigger.click === 'function') {
                          tabTrigger.click();
                        }
                      }}
                    >
                      Contact {team.title}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Recent Support Tickets */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5" />
                  <span>Recent Support Tickets</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {recentTickets.length > 0 ? (
                  <div className="space-y-4">
                    {recentTickets.map((ticket) => (
                      <div key={ticket.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center space-x-4">
                          <div className={`p-2 rounded-lg ${supportTeams[ticket.type as keyof typeof supportTeams].color} text-white`}>
                            {supportTeams[ticket.type as keyof typeof supportTeams].icon}
                          </div>
                          <div>
                            <h4 className="font-medium">{ticket.title}</h4>
                            <p className="text-sm text-gray-500">Ticket #{ticket.id}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-3">
                          <Badge className={getPriorityColor(ticket.priority)}>
                            {ticket.priority}
                          </Badge>
                          <Badge className={getStatusColor(ticket.status)}>
                            {ticket.status}
                          </Badge>
                          <span className="text-sm text-gray-500">{ticket.lastUpdate}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-gray-500">No recent support tickets</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Legal Support Tab */}
          <TabsContent value="legal" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Scale className="h-5 w-5" />
                  <span>Legal Support Services</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Available Services</h3>
                    <ul className="space-y-2">
                      {supportTeams.legal.services.map((service, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">{service}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Contact Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Phone className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium">{supportTeams.legal.contact.phone}</p>
                          <p className="text-sm text-gray-500">Direct Legal Hotline</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Mail className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium">{supportTeams.legal.contact.email}</p>
                          <p className="text-sm text-gray-500">Email Support</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Clock className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium">{supportTeams.legal.contact.hours}</p>
                          <p className="text-sm text-gray-500">Business Hours</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex space-x-4">
                  <Button className="flex items-center space-x-2">
                    <MessageSquare className="h-4 w-4" />
                    <span>Start Live Chat</span>
                  </Button>
                  <Button variant="outline" className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>Schedule Consultation</span>
                  </Button>
                  <Button variant="outline" className="flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span>Submit Case</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* IT Support Tab */}
          <TabsContent value="it" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Laptop className="h-5 w-5" />
                  <span>IT Support Services</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Technical Services</h3>
                    <ul className="space-y-2">
                      {supportTeams.it.services.map((service, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">{service}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Support Channels</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Phone className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium">{supportTeams.it.contact.phone}</p>
                          <p className="text-sm text-gray-500">24/7 Technical Hotline</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Mail className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium">{supportTeams.it.contact.email}</p>
                          <p className="text-sm text-gray-500">Technical Support Email</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Clock className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="font-medium">{supportTeams.it.contact.hours}</p>
                          <p className="text-sm text-gray-500">Always Available</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">Quick Self-Help</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Try our knowledge base for instant solutions to common issues before contacting support.
                      </p>
                      <Button variant="link" className="text-blue-600 p-0 h-auto mt-2">
                        Browse Knowledge Base →
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-4">
                  <Button className="flex items-center space-x-2">
                    <MessageSquare className="h-4 w-4" />
                    <span>Live Chat Support</span>
                  </Button>
                  <Button variant="outline" className="flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span>Submit Ticket</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Real Estate Support Tab */}
          <TabsContent value="realestate" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Home className="h-5 w-5" />
                  <span>Real Estate Support by Frontline Realty</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <div className="flex items-start space-x-3">
                    <div className="p-2 bg-purple-600 rounded-lg text-white">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <h4 className="font-medium text-purple-900">Powered by Frontline Realty</h4>
                      <p className="text-sm text-purple-700 mt-1">
                        Get expert real estate guidance from our sister company with over 15 years of industry experience.
                      </p>
                      <Button variant="link" className="text-purple-600 p-0 h-auto mt-2 flex items-center space-x-1">
                        <ExternalLink className="h-3 w-3" />
                        <span>Visit Frontline Realty</span>
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Consultation Services</h3>
                    <ul className="space-y-2">
                      {supportTeams.realestate.services.map((service, index) => (
                        <li key={index} className="flex items-center space-x-2">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span className="text-sm">{service}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold text-lg">Connect with Experts</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Phone className="h-5 w-5 text-purple-600" />
                        <div>
                          <p className="font-medium">{supportTeams.realestate.contact.phone}</p>
                          <p className="text-sm text-gray-500">Direct Line to Frontline Realty</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Mail className="h-5 w-5 text-purple-600" />
                        <div>
                          <p className="font-medium">{supportTeams.realestate.contact.email}</p>
                          <p className="text-sm text-gray-500">Real Estate Consultation</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <Clock className="h-5 w-5 text-purple-600" />
                        <div>
                          <p className="font-medium">{supportTeams.realestate.contact.hours}</p>
                          <p className="text-sm text-gray-500">Extended Business Hours</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div className="flex space-x-4">
                  <Button className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>Schedule Consultation</span>
                  </Button>
                  <Button variant="outline" className="flex items-center space-x-2">
                    <MessageSquare className="h-4 w-4" />
                    <span>Connect with Expert</span>
                  </Button>
                  <Button variant="outline" className="flex items-center space-x-2">
                    <ExternalLink className="h-4 w-4" />
                    <span>Visit Frontline Realty</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}