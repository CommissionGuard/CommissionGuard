import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Clock, AlertTriangle, DollarSign } from "lucide-react";
import { 
  ContractLoadingAnimation, 
  MoneyLoadingAnimation, 
  PropertyCardSkeleton 
} from "@/components/ui/loading-animations";

export default function StatsCards() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });
  const [location, setLocation] = useLocation();

  const handleCardClick = (cardTitle: string) => {
    switch (cardTitle) {
      case "Active Contracts":
        setLocation("/contracts");
        break;
      case "Expiring Soon":
        setLocation("/contracts?filter=expiring");
        break;
      case "Potential Breaches":
        setLocation("/alerts");
        break;
      case "Protected Commission":
        setLocation("/commission-tracker");
        break;
      default:
        break;
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="card-hover">
          <CardContent className="pt-6">
            <ContractLoadingAnimation size={40} message="Loading contracts..." />
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="pt-6">
            <ContractLoadingAnimation size={40} message="Checking expirations..." />
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="pt-6">
            <PropertyCardSkeleton />
          </CardContent>
        </Card>
        <Card className="card-hover">
          <CardContent className="pt-6">
            <MoneyLoadingAnimation size={40} message="Calculating commission..." />
          </CardContent>
        </Card>
      </div>
    );
  }

  const cards = [
    {
      title: "Active Contracts",
      value: stats?.activeContracts || 0,
      icon: FileText,
      color: "text-primary",
      bgColor: "bg-blue-100",
      change: "+12%",
      changeText: "from last month",
      changeColor: "text-success",
    },
    {
      title: "Expiring Soon",
      value: stats?.expiringSoon || 0,
      icon: Clock,
      color: "text-warning",
      bgColor: "bg-orange-100",
      change: "Next expires in",
      changeText: "5 days",
      changeColor: "text-warning",
    },
    {
      title: "Potential Breaches",
      value: stats?.potentialBreaches || 0,
      icon: AlertTriangle,
      color: "text-accent",
      bgColor: "bg-red-100",
      change: stats?.potentialBreaches > 0 ? "Requires attention" : "All clear",
      changeText: "",
      changeColor: stats?.potentialBreaches > 0 ? "text-accent" : "text-success",
    },
    {
      title: "Protected Commission",
      value: `$${(stats?.protectedCommission || 0).toLocaleString()}`,
      icon: DollarSign,
      color: "text-success",
      bgColor: "bg-green-100",
      change: "+$8,200",
      changeText: "this month",
      changeColor: "text-success",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <Card 
          key={card.title} 
          className="card-hover btn-real-estate bg-white rounded-xl shadow-sm border border-gray-200 group cursor-pointer relative overflow-hidden"
          style={{ animationDelay: `${index * 100}ms` }}
          onClick={() => handleCardClick(card.title)}
        >
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{card.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1 transition-all duration-300 group-hover:scale-105">{card.value}</p>
              </div>
              <div className={`${card.bgColor} rounded-full p-3 relative overflow-hidden group-hover:scale-110 transition-transform duration-300`}>
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <card.icon className={`${card.color} h-6 w-6 relative z-10`} />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <div className="flex items-center space-x-1">
                <div className={`w-2 h-2 rounded-full ${card.changeColor === 'text-success' ? 'bg-green-400' : card.changeColor === 'text-warning' ? 'bg-yellow-400' : 'bg-red-400'} animate-pulse`}></div>
                <span className={`${card.changeColor} font-medium`}>{card.change}</span>
              </div>
              {card.changeText && (
                <span className="text-gray-600 ml-1">{card.changeText}</span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
