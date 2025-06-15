import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Shield, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import ProfileSettingsModal from "./profile-settings-modal";

export default function Navbar() {
  const { user } = useAuth();
  const [location, setLocation] = useLocation();
  const [showProfileSettings, setShowProfileSettings] = useState(false);
  
  const { data: unreadCount } = useQuery({
    queryKey: ["/api/alerts/unread/count"],
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const userInitials = user ? 
    `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || 
    user.email?.[0]?.toUpperCase() || 'U' : 'U';

  const navItems = [
    { path: "/", label: "Dashboard" },
    { path: "/clients", label: "Clients" },
    { path: "/contracts", label: "Contracts" },
    { path: "/showing-tracker", label: "Showing Tracker" },
    { path: "/prospecting", label: "Prospecting" },
    { path: "/deal-pipeline", label: "Deal Pipeline" },
    { path: "/property-analyzer", label: "Market Analyzer" },
    { path: "/alerts", label: "Alerts" },
    { path: "/live-map", label: "Interactive Map" },
    { path: "/api-integrations", label: "API Integrations" },
    { path: "/reports", label: "Reports" },
    { path: "/business-overview", label: "Overview" },
  ];

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div 
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => setLocation("/")}
            >
              <Shield className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-gray-900">Commission Guard</span>
            </div>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            {navItems.map((item) => (
              <button
                key={item.path}
                onClick={() => setLocation(item.path)}
                className={`font-medium pb-1 transition-colors ${
                  location === item.path
                    ? "text-primary border-b-2 border-primary"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
          
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-gray-600 hover:text-gray-900">
              <Bell className="h-5 w-5" />
              {(unreadCount as any)?.count > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {(unreadCount as any).count > 9 ? '9+' : (unreadCount as any).count}
                </span>
              )}
            </button>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2 p-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage 
                      src={user?.profileImageUrl || undefined} 
                      alt={`${user?.firstName} ${user?.lastName}`} 
                    />
                    <AvatarFallback>{userInitials}</AvatarFallback>
                  </Avatar>
                  <span className="text-gray-700 font-medium hidden sm:block">
                    {user?.firstName && user?.lastName 
                      ? `${user.firstName} ${user.lastName}`
                      : user?.email || 'User'
                    }
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setShowProfileSettings(true)}>
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setLocation("/subscription")}>
                  Subscription
                </DropdownMenuItem>
                <DropdownMenuItem>Support</DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => window.location.href = "/api/logout"}
                  className="text-red-600"
                >
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
      
      <ProfileSettingsModal 
        open={showProfileSettings} 
        onOpenChange={setShowProfileSettings} 
      />
    </nav>
  );
}
