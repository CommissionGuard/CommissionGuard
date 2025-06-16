import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Shield, Bell } from "lucide-react";
import logoIcon from "@/assets/commission-guard-icon.svg";
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
    { path: "/commission-tracker", label: "Commission Protection" },
    { path: "/alerts", label: "Alerts" },
    { path: "/public-records", label: "Public Records Monitor" },
    { path: "/property-analyzer", label: "Market Analyzer" },
    { path: "/reports", label: "Reports" },
  ];

  return (
    <>
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        {/* Top brand bar */}
        <div className="bg-gradient-to-r from-primary to-primary/90 text-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-12">
              <div 
                className="flex items-center space-x-2 cursor-pointer"
                onClick={() => setLocation("/")}
              >
                <img src={logoIcon} alt="Commission Guard" className="h-6 w-6" />
                <span className="text-sm font-bold">Commission GUARD</span>
              </div>
              
              <div className="flex items-center space-x-3">
                <button 
                  className="relative p-1.5 text-white/80 hover:text-white transition-colors"
                  onClick={() => setLocation("/alerts")}
                >
                  <Bell className="h-4 w-4" />
                  {(unreadCount as any)?.count > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center text-xs">
                      {(unreadCount as any).count > 9 ? '9+' : (unreadCount as any).count}
                    </span>
                  )}
                </button>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="flex items-center space-x-2 p-1 text-white hover:bg-white/10">
                      <Avatar className="h-6 w-6">
                        <AvatarImage 
                          src={user?.profileImageUrl || undefined} 
                          alt={`${user?.firstName} ${user?.lastName}`} 
                        />
                        <AvatarFallback className="text-xs bg-white/20 text-white border-0">{userInitials}</AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-medium hidden sm:block">
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
                    <DropdownMenuItem onClick={() => setLocation("/support")}>
                      Support
                    </DropdownMenuItem>
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
        </div>

        {/* Navigation tabs */}
        <nav className="bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex space-x-8 overflow-x-auto scrollbar-hide">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => setLocation(item.path)}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    location === item.path
                      ? "border-primary text-primary"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </nav>
      </div>
      
      <ProfileSettingsModal 
        open={showProfileSettings} 
        onOpenChange={setShowProfileSettings} 
      />
    </>
  );
}