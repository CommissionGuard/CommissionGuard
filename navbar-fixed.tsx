import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { 
  BarChart3, 
  Users, 
  FileText, 
  Calendar, 
  DollarSign, 
  AlertTriangle, 
  Folder,
  Search,
  Brain,
  Settings,
  User,
  LogOut,
  Menu,
  X,
  Bell,
  ChevronDown,
  HelpCircle,
  CreditCard,
  Shield
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import logoIcon from "@assets/generated-icon.png";
import { useQuery } from "@tanstack/react-query";

export function Navbar() {
  const [location, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated } = useAuth();

  // Get user initials for avatar
  const userInitials = user ? 
    `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() || 
    user.email?.[0]?.toUpperCase() || 'U' : 'U';

  const navItems = [
    { path: "/dashboard", label: "Dashboard", icon: BarChart3, shortLabel: "Home", description: "View your commission protection overview" },
    { path: "/clients", label: "Clients", icon: Users, shortLabel: "Clients", description: "Manage your client relationships" },
    { path: "/contracts", label: "Contracts", icon: FileText, shortLabel: "Contracts", description: "Track your exclusive agreements" },
    { path: "/showing-tracker", label: "Showing Tracker", icon: Calendar, shortLabel: "Showings", description: "Schedule and track property showings" },
    { path: "/commission-tracker", label: "Commission Protection", icon: DollarSign, shortLabel: "Protection", description: "Monitor your protected commissions" },
    { path: "/alerts", label: "Alerts", icon: AlertTriangle, shortLabel: "Alerts", description: "View protection alerts and warnings" },
    { path: "/public-records-monitor", label: "Public Records", icon: Search, shortLabel: "Records", description: "Monitor public property records" },
    { path: "/commission-intelligence", label: "Commission Intelligence", icon: Brain, shortLabel: "Intelligence", description: "AI-powered commission insights" },
    { path: "/reports", label: "Reports", icon: Folder, shortLabel: "Reports", description: "Generate commission protection reports" }
  ];

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["/api/alerts/unread/count"],
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  if (!isAuthenticated) {
    return null;
  }

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return location === "/" || location === "/dashboard";
    }
    return location === path;
  };

  return (
    <>
      <motion.nav 
        className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 shadow-lg sticky top-0 z-50 border-b border-blue-500/20"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div 
          className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIgZmlsbD0iIzAwMCIgZmlsbC1vcGFjaXR5PSIwLjEiLz4KPC9nPgo8L3N2Zz4=')] opacity-20"
        />
        <div 
          className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4KPGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIgZmlsbD0iIzAwMCIgZmlsbC1vcGFjaXR5PSIwLjEiLz4KPC9nPgo8L3N2Zz4=')] opacity-20"
        />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex items-center justify-between h-16">
            <motion.div 
              className="flex items-center space-x-2 cursor-pointer"
              onClick={() => setLocation("/dashboard")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.img 
                src={logoIcon} 
                alt="Commission Guard" 
                className="h-6 w-6" 
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.3 }}
              />
              <span className="text-white text-lg font-semibold hidden sm:block">
                Commission Guard
              </span>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                
                return (
                  <motion.div
                    key={item.path}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Link href={item.path}>
                      <Button
                        variant={active ? "secondary" : "ghost"}
                        size="sm"
                        className={`
                          h-10 px-3 text-xs font-medium transition-all duration-200 relative
                          ${active 
                            ? 'bg-white/10 text-white shadow-lg backdrop-blur-sm border border-white/20' 
                            : 'text-blue-100 hover:text-white hover:bg-white/5'
                          }
                        `}
                      >
                        <Icon className="h-4 w-4 mr-1.5" />
                        <span className="hidden xl:inline">{item.label}</span>
                        <span className="xl:hidden">{item.shortLabel}</span>
                        {item.path === "/alerts" && unreadCount > 0 && (
                          <Badge 
                            variant="destructive" 
                            className="ml-1.5 h-4 px-1 text-xs bg-red-500 hover:bg-red-600"
                          >
                            {unreadCount}
                          </Badge>
                        )}
                        {active && (
                          <motion.div
                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-white"
                            layoutId="activeTab"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.2 }}
                          />
                        )}
                      </Button>
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            {/* Desktop User Menu */}
            <div className="hidden lg:flex items-center space-x-3">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="h-10 px-3 text-blue-100 hover:text-white hover:bg-white/5 border border-blue-400/30"
                  >
                    <Avatar className="h-6 w-6 mr-2">
                      <AvatarImage src={user?.profileImageUrl || undefined} />
                      <AvatarFallback className="text-xs bg-blue-500 text-white">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium hidden xl:inline">
                      {user?.firstName || 'User'}
                    </span>
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/subscription" className="flex items-center">
                      <CreditCard className="mr-2 h-4 w-4" />
                      <span>Subscription</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/support" className="flex items-center">
                      <HelpCircle className="mr-2 h-4 w-4" />
                      <span>Support</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <a href="/api/logout" className="flex items-center">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </a>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-blue-100 hover:text-white hover:bg-white/5"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden bg-blue-800 border-t border-blue-600"
            >
              <div className="px-4 py-3 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.path);
                  
                  return (
                    <Link key={item.path} href={item.path}>
                      <Button
                        variant={active ? "secondary" : "ghost"}
                        className={`
                          w-full justify-start h-11 text-sm font-medium
                          ${active 
                            ? 'bg-white/10 text-white' 
                            : 'text-blue-100 hover:text-white hover:bg-white/5'
                          }
                        `}
                      >
                        <Icon className="h-4 w-4 mr-3" />
                        {item.label}
                        {item.path === "/alerts" && unreadCount > 0 && (
                          <Badge variant="destructive" className="ml-auto">
                            {unreadCount}
                          </Badge>
                        )}
                      </Button>
                    </Link>
                  );
                })}
                
                <div className="pt-3 mt-3 border-t border-blue-600">
                  <div className="flex items-center px-3 py-2 text-blue-100">
                    <Avatar className="h-8 w-8 mr-3">
                      <AvatarImage src={user?.profileImageUrl || undefined} />
                      <AvatarFallback className="bg-blue-500 text-white">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-white">
                        {user?.firstName} {user?.lastName}
                      </p>
                      <p className="text-xs text-blue-200">
                        {user?.email}
                      </p>
                    </div>
                  </div>
                  
                  <Link href="/subscription">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-blue-100 hover:text-white hover:bg-white/5"
                    >
                      <CreditCard className="h-4 w-4 mr-3" />
                      Subscription
                    </Button>
                  </Link>
                  
                  <Link href="/support">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-blue-100 hover:text-white hover:bg-white/5"
                    >
                      <HelpCircle className="h-4 w-4 mr-3" />
                      Support
                    </Button>
                  </Link>
                  
                  <a href="/api/logout">
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-blue-100 hover:text-white hover:bg-white/5"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Log out
                    </Button>
                  </a>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
}