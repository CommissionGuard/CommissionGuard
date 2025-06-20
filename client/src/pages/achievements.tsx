import { AchievementBadges } from "@/components/achievement-badges";
import { AchievementDemo } from "@/components/achievement-demo";
import Navbar from "@/components/navbar";
import { useAuth } from "@/hooks/useAuth";

export default function Achievements() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading achievements...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect via useAuth
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
      <Navbar />
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Achievements & Progress</h1>
          <p className="text-gray-600 mt-2">Track your milestones and unlock badges as you build your real estate business.</p>
        </div>
        
        <div className="space-y-6">
          <AchievementDemo />
          <AchievementBadges />
        </div>
      </div>
    </div>
  );
}