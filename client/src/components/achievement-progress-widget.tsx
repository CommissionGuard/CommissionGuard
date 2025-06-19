import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { Trophy, Award, Star, ArrowRight } from "lucide-react";

interface UserProgress {
  stats: {
    userId: string;
    totalPoints: string;
    level: string;
    experiencePoints: string;
    clientsAdded: string;
    contractsUploaded: string;
    showingsScheduled: string;
    breachesResolved: string;
    consecutiveLoginDays: string;
    longestStreak: string;
    commissionProtected: string;
    alertsActioned: string;
  };
  achievements: any[];
  totalAchievements: number;
  completionPercentage: number;
  level: number;
  totalPoints: number;
  nextLevelPoints: number;
}

export function AchievementProgressWidget() {
  const [, setLocation] = useLocation();
  
  const { data: userProgress, isLoading } = useQuery<UserProgress>({
    queryKey: ["/api/achievements/progress"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Your Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 animate-pulse">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-6 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!userProgress) {
    return null;
  }

  const currentLevelProgress = ((userProgress.totalPoints % 100) / 100) * 100;
  const recentAchievements = userProgress.achievements.slice(-3).reverse();

  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Your Progress
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setLocation("/achievements")}
            className="text-blue-600 hover:text-blue-700"
          >
            View All <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-6">
          {/* Level and XP */}
          <div className="text-center space-y-3">
            <div className="flex items-center justify-center gap-4">
              <Badge variant="outline" className="text-blue-600 border-blue-600">
                Level {userProgress.level}
              </Badge>
              <div className="text-2xl font-bold text-gray-900">
                {userProgress.totalPoints} points
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-gray-500">
                <span>Level {userProgress.level}</span>
                <span>Level {userProgress.level + 1}</span>
              </div>
              <Progress value={currentLevelProgress} className="h-2" />
              <div className="text-xs text-gray-600 text-center">
                {100 - (userProgress.totalPoints % 100)} points to next level
              </div>
            </div>
          </div>
          
          {/* Achievement Summary */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Award className="h-4 w-4 text-purple-500" />
                <span className="text-lg font-semibold text-purple-600">
                  {userProgress.achievements.length}
                </span>
              </div>
              <div className="text-xs text-gray-600">Achievements</div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 mb-1">
                <Star className="h-4 w-4 text-orange-500" />
                <span className="text-lg font-semibold text-orange-600">
                  {userProgress.completionPercentage}%
                </span>
              </div>
              <div className="text-xs text-gray-600">Complete</div>
            </div>
          </div>

          {/* Recent Achievements */}
          {recentAchievements.length > 0 && (
            <div className="space-y-3">
              <div className="text-sm font-medium text-gray-700 border-b pb-1">
                Recent Achievements
              </div>
              <div className="space-y-2">
                {recentAchievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center space-x-3 p-2 bg-green-50 rounded-lg border border-green-200"
                  >
                    <div className="p-1 rounded-full bg-green-500">
                      <Trophy className="h-3 w-3 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm text-green-800 truncate">
                        {achievement.title}
                      </div>
                      <div className="text-xs text-green-600">
                        +{achievement.points} points
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t">
            <div className="text-center bg-blue-50 rounded-lg p-2">
              <div className="text-lg font-semibold text-blue-600">
                {userProgress.stats.clientsAdded}
              </div>
              <div className="text-xs text-blue-700">Clients</div>
            </div>
            <div className="text-center bg-green-50 rounded-lg p-2">
              <div className="text-lg font-semibold text-green-600">
                {userProgress.stats.contractsUploaded}
              </div>
              <div className="text-xs text-green-700">Contracts</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}