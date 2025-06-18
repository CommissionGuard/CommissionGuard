import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Shield, 
  Bell, 
  Users, 
  FileText, 
  Calendar, 
  DollarSign, 
  AlertTriangle, 
  Search, 
  BarChart3,
  FileSpreadsheet,
  ShieldAlert,
  ChevronDown,
  UserPlus,
  Plus,
  Brain
} from "lucide-react";
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
    { path: "/", label: "Dashboard", icon: BarChart3, shortLabel: "Home", description: "View your commission protection overview" },
    { path: "/clients", label: "Clients", icon: Users, shortLabel: "Clients", description: "Manage your client relationships" },
    { path: "/contracts", label: "Contracts", icon: FileText, shortLabel: "Contracts", description: "Track your exclusive agreements" },
    { path: "/showing-tracker", label: "Showing Tracker", icon: Calendar, shortLabel: "Showings", description: "Schedule and track property showings" },
    { path: "/commission-tracker", label: "Commission Protection", icon: DollarSign, shortLabel: "Protection", description: "Monitor your protected commissions" },
    { path: "/alerts", label: "Alerts", icon: AlertTriangle, shortLabel: "Alerts", description: "Stay informed about potential issues" },
    { path: "/public-records", label: "Public Records Monitor", icon: Search, shortLabel: "Records", description: "Watch for unauthorized transactions" },
    { path: "/commission-intelligence", label: "Commission Intelligence", icon: Brain, shortLabel: "AI Intel", description: "AI-powered contract analysis and risk assessment" },
    { path: "/reports", label: "Reports", icon: FileSpreadsheet, shortLabel: "Reports", description: "Generate commission protection reports" },
    ...(user?.role === 'admin' ? [{ path: "/breach-management", label: "Breach Management", icon: ShieldAlert, shortLabel: "Breach", description: "Manage commission breach cases" }] : []),
  ];

  return (
    <>
      <motion.div 
        className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {/* Top brand bar */}
        <motion.div 
          className="bg-gradient-to-r from-primary to-primary/90 text-white relative overflow-hidden"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            animate={{ x: [-100, 400] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 5 }}
          />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex items-center justify-between h-12">
              <motion.div 
                className="flex items-center space-x-2 cursor-pointer"
                onClick={() => setLocation("/")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <motion.img 
                  src={logoIcon} 
                  alt="Commission Guard" 
                  className="h-6 w-6" 
                  animate={{ rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 5 }}
                />
                <span className="text-sm font-bold">Commission GUARD</span>
              </motion.div>
              
              <div className="flex items-center space-x-3">
                <motion.button 
                  className="relative p-1.5 text-white/80 hover:text-white transition-colors"
                  onClick={() => setLocation("/alerts")}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <motion.div
                    animate={{ rotate: (unreadCount as any)?.count > 0 ? [0, 15, -15, 0] : 0 }}
                    transition={{ duration: 0.5, repeat: (unreadCount as any)?.count > 0 ? Infinity : 0, repeatDelay: 2 }}
                  >
                    <Bell className="h-4 w-4" />
                  </motion.div>
                  <AnimatePresence>
                    {(unreadCount as any)?.count > 0 && (
                      <motion.span 
                        className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center text-xs"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      >
                        {(unreadCount as any).count > 9 ? '9+' : (unreadCount as any).count}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
                
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
        </motion.div>

        {/* Navigation tabs */}
        <motion.nav 
          className="bg-white"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
        >
          <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6">
            <div className="flex justify-between items-center overflow-x-auto scrollbar-hide">
              {navItems.map((item, index) => {
                const IconComponent = item.icon;
                
                // Special handling for Clients tab with dropdown
                if (item.path === "/clients") {
                  return (
                    <motion.div
                      key={item.path}
                      className="flex-shrink-0"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.3 }}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <motion.button
                            className={`whitespace-nowrap py-3 px-1 sm:px-2 border-b-2 font-medium text-xs transition-colors flex flex-col sm:flex-row items-center gap-1 ${
                              location === item.path
                                ? "border-purple-600 text-purple-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            title={item.label}
                          >
                            <div className="flex items-center gap-1">
                              <IconComponent className="h-4 w-4 flex-shrink-0" />
                              <ChevronDown className="h-3 w-3" />
                            </div>
                            <span className="hidden lg:inline">{item.label}</span>
                            <span className="lg:hidden">{item.shortLabel}</span>
                          </motion.button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="center" className="w-48">
                          <DropdownMenuItem onClick={() => setLocation("/clients")} className="flex items-center gap-2">
                            <Users className="h-4 w-4" />
                            All Clients
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setLocation("/clients?action=add")} className="flex items-center gap-2">
                            <UserPlus className="h-4 w-4" />
                            Add New Client
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </motion.div>
                  );
                }

                // Special handling for Contracts tab with dropdown
                if (item.path === "/contracts") {
                  return (
                    <motion.div
                      key={item.path}
                      className="flex-shrink-0"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.3 }}
                    >
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <motion.button
                            className={`whitespace-nowrap py-3 px-1 sm:px-2 border-b-2 font-medium text-xs transition-colors flex flex-col sm:flex-row items-center gap-1 ${
                              location === item.path
                                ? "border-blue-600 text-blue-600"
                                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            title={item.label}
                          >
                            <div className="flex items-center gap-1">
                              <IconComponent className="h-4 w-4 flex-shrink-0" />
                              <ChevronDown className="h-3 w-3" />
                            </div>
                            <span className="hidden lg:inline">{item.label}</span>
                            <span className="lg:hidden">{item.shortLabel}</span>
                          </motion.button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="center" className="w-48">
                          <DropdownMenuItem onClick={() => setLocation("/contracts?tab=contracts")} className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            All Contracts
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setLocation("/contracts?action=add")} className="flex items-center gap-2">
                            <Plus className="h-4 w-4" />
                            Add New Contract
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setLocation("/contracts?tab=reminders")} className="flex items-center gap-2">
                            <Bell className="h-4 w-4" />
                            Contract Reminders
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </motion.div>
                  );
                }
                
                // Special handling for Commission Protection tab
                if (item.path === "/commission-tracker") {
                  return (
                    <motion.button
                      key={item.path}
                      onClick={() => setLocation(item.path)}
                      className={`whitespace-nowrap py-3 px-1 sm:px-2 border-b-2 font-medium text-xs transition-colors flex-shrink-0 flex flex-col sm:flex-row items-center gap-1 ${
                        location === item.path
                          ? "border-green-600 text-green-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.3 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      title={item.label}
                    >
                      <IconComponent className="h-4 w-4 flex-shrink-0" />
                      <span className="hidden lg:inline">{item.label}</span>
                      <span className="lg:hidden">{item.shortLabel}</span>
                    </motion.button>
                  );
                }
                
                // Special handling for Alerts tab
                if (item.path === "/alerts") {
                  return (
                    <motion.button
                      key={item.path}
                      onClick={() => setLocation(item.path)}
                      className={`whitespace-nowrap py-3 px-1 sm:px-2 border-b-2 font-medium text-xs transition-colors flex-shrink-0 flex flex-col sm:flex-row items-center gap-1 ${
                        location === item.path
                          ? "border-red-600 text-red-600"
                          : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                      }`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1, duration: 0.3 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      title={item.label}
                    >
                      <IconComponent className="h-4 w-4 flex-shrink-0" />
                      <span className="hidden lg:inline">{item.label}</span>
                      <span className="lg:hidden">{item.shortLabel}</span>
                    </motion.button>
                  );
                }
                
                // Regular navigation items
                return (
                  <motion.button
                    key={item.path}
                    onClick={() => setLocation(item.path)}
                    className={`whitespace-nowrap py-3 px-1 sm:px-2 border-b-2 font-medium text-xs transition-colors flex-shrink-0 flex flex-col sm:flex-row items-center gap-1 ${
                      location === item.path
                        ? "border-primary text-primary"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.3 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    title={item.label}
                  >
                    <IconComponent className="h-4 w-4 flex-shrink-0" />
                    <span className="hidden lg:inline">{item.label}</span>
                    <span className="lg:hidden">{item.shortLabel}</span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </motion.nav>
      </motion.div>
      
      <ProfileSettingsModal 
        open={showProfileSettings} 
        onOpenChange={setShowProfileSettings} 
      />
    </>
  );
}