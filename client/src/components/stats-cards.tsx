import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Clock, AlertTriangle, DollarSign } from "lucide-react";

export default function StatsCards() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="pt-6">
              <div className="h-20 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
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
      {cards.map((card) => (
        <Card key={card.title} className="bg-white rounded-xl shadow-sm border border-gray-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">{card.title}</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">{card.value}</p>
              </div>
              <div className={`${card.bgColor} rounded-full p-3`}>
                <card.icon className={`${card.color} h-6 w-6`} />
              </div>
            </div>
            <div className="flex items-center mt-4 text-sm">
              <span className={`${card.changeColor} font-medium`}>{card.change}</span>
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
