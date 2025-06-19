import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Trophy, 
  Award, 
  Star, 
  Target, 
  TrendingUp,
  UserCheck,
  BookOpen,
  UserPlus,
  Users,
  Network,
  FileText,
  Handshake,
  Shield,
  Calendar,
  Bell,
  Home,
  MapPin,
  ShieldCheck,
  Crown,
  Lock,
  CheckCircle
} from "lucide-react";

const iconMap = {
  Trophy,
  Award,
  Star,
  Target,
  TrendingUp,
  UserCheck,
  BookOpen,
  UserPlus,
  Users,
  Network,
  FileText,
  Handshake,
  Shield,
  Calendar,
  Bell,
  Home,
  MapPin,
  ShieldCheck,
  Crown,
  Lock,
  CheckCircle
};

interface Achievement {
  id: number;
  name: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  points: string;
  isActive: boolean;
  createdAt: string;
}

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
  achievements: Achievement[];
  totalAchievements: number;
  completionPercentage: number;
  level: number;
  totalPoints: number;
  nextLevelPoints: number;
}

const tierColors = {
  bronze: 'from-amber-600 to-amber-800',
  silver: 'from-gray-400 to-gray-600',
  gold: 'from-yellow-400 to-yellow-600',
  platinum: 'from-purple-400 to-purple-600'
};

const tierTextColors = {
  bronze: 'text-amber-700',
  silver: 'text-gray-700',
  gold: 'text-yellow-700',
  platinum: 'text-purple-700'
};

function AchievementCard({ achievement, isUnlocked = false }: { achievement: Achievement; isUnlocked?: boolean }) {
  const IconComponent = iconMap[achievement.icon as keyof typeof iconMap] || Trophy;
  
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`relative overflow-hidden rounded-lg border p-4 ${
        isUnlocked 
          ? 'bg-white border-green-200 shadow-sm' 
          : 'bg-gray-50 border-gray-200 opacity-75'
      }`}
    >
      <div className="flex items-start space-x-3">
        <div className={`p-2 rounded-full bg-gradient-to-br ${tierColors[achievement.tier]} shadow-sm`}>
          <IconComponent 
            className={`h-5 w-5 ${isUnlocked ? 'text-white' : 'text-gray-400'}`} 
          />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className={`font-semibold text-sm ${isUnlocked ? 'text-gray-900' : 'text-gray-500'}`}>
              {achievement.title}
            </h3>
            {isUnlocked && (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
          </div>
          
          <p className={`text-xs mt-1 ${isUnlocked ? 'text-gray-600' : 'text-gray-400'}`}>
            {achievement.description}
          </p>
          
          <div className="flex items-center justify-between mt-2">
            <Badge 
              variant="outline" 
              className={`text-xs ${tierTextColors[achievement.tier]} border-current`}
            >
              {achievement.tier.charAt(0).toUpperCase() + achievement.tier.slice(1)}
            </Badge>
            
            <span className={`text-xs font-medium ${isUnlocked ? 'text-green-600' : 'text-gray-400'}`}>
              +{achievement.points} pts
            </span>
          </div>
        </div>
      </div>
      
      {!isUnlocked && (
        <div className="absolute inset-0 bg-gray-100 bg-opacity-50 flex items-center justify-center">
          <Lock className="h-6 w-6 text-gray-400" />
        </div>
      )}
    </motion.div>
  );
}

function ProgressOverview({ userProgress }: { userProgress: UserProgress }) {
  const currentLevelProgress = ((userProgress.totalPoints % 100) / 100) * 100;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Your Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Level and XP */}
        <div className="text-center space-y-2">
          <div className="text-3xl font-bold text-blue-600">
            Level {userProgress.level}
          </div>
          <div className="text-sm text-gray-600">
            {userProgress.totalPoints} total points
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span>Level {userProgress.level}</span>
              <span>Level {userProgress.level + 1}</span>
            </div>
            <Progress value={currentLevelProgress} className="h-3" />
            <div className="text-xs text-gray-600 text-center">
              {100 - (userProgress.totalPoints % 100)} points to next level
            </div>
          </div>
        </div>
        
        {/* Achievement Completion */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Achievements</span>
            <span>{userProgress.achievements.length}/{userProgress.totalAchievements}</span>
          </div>
          <Progress value={userProgress.completionPercentage} className="h-2" />
          <div className="text-xs text-gray-600 text-center">
            {userProgress.completionPercentage}% complete
          </div>
        </div>
        
        {/* Key Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-lg font-semibold text-green-600">
              {userProgress.stats.clientsAdded}
            </div>
            <div className="text-xs text-gray-600">Clients Added</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-blue-600">
              {userProgress.stats.contractsUploaded}
            </div>
            <div className="text-xs text-gray-600">Contracts</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-purple-600">
              {userProgress.stats.consecutiveLoginDays}
            </div>
            <div className="text-xs text-gray-600">Day Streak</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-orange-600">
              ${parseInt(userProgress.stats.commissionProtected).toLocaleString()}
            </div>
            <div className="text-xs text-gray-600">Protected</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function AchievementBadges() {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  const { data: userProgress, isLoading } = useQuery<UserProgress>({
    queryKey: ["/api/achievements/progress"],
  });

  const { data: achievementCategories } = useQuery<Record<string, Achievement[]>>({
    queryKey: ["/api/achievements/categories"],
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-64 bg-gray-100 rounded-lg animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (!userProgress || !achievementCategories) {
    return <div>Unable to load achievements</div>;
  }

  const unlockedAchievementIds = new Set(userProgress.achievements.map(a => a.id));
  
  const filteredAchievements = selectedCategory === "all" 
    ? Object.values(achievementCategories).flat()
    : achievementCategories[selectedCategory] || [];

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <ProgressOverview userProgress={userProgress} />
      
      {/* Achievement Browser */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-purple-500" />
            Achievement Collection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="onboarding">Start</TabsTrigger>
              <TabsTrigger value="clients">Clients</TabsTrigger>
              <TabsTrigger value="contracts">Contracts</TabsTrigger>
              <TabsTrigger value="milestones">Goals</TabsTrigger>
              <TabsTrigger value="engagement">Daily</TabsTrigger>
            </TabsList>
            
            <div className="mt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                  {filteredAchievements.map((achievement) => (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <AchievementCard 
                        achievement={achievement}
                        isUnlocked={unlockedAchievementIds.has(achievement.id)}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Recent Achievements */}
      {userProgress.achievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Recent Achievements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {userProgress.achievements.slice(-3).reverse().map((achievement) => (
                <div key={achievement.id} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <div className={`p-2 rounded-full bg-gradient-to-br ${tierColors[achievement.tier]}`}>
                    {iconMap[achievement.icon as keyof typeof iconMap] && 
                      React.createElement(iconMap[achievement.icon as keyof typeof iconMap], {
                        className: "h-4 w-4 text-white"
                      })
                    }
                  </div>
                  <div className="flex-1">
                    <div className="font-medium text-sm">{achievement.title}</div>
                    <div className="text-xs text-gray-600">{achievement.description}</div>
                  </div>
                  <div className="text-sm font-medium text-green-600">
                    +{achievement.points} pts
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function AchievementNotification({ achievement, onClose }: { 
  achievement: Achievement; 
  onClose: () => void;
}) {
  const IconComponent = iconMap[achievement.icon as keyof typeof iconMap] || Trophy;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 50 }}
      className="fixed bottom-4 right-4 z-50"
    >
      <Card className="w-80 bg-gradient-to-r from-green-500 to-emerald-600 border-green-400 text-white shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-full bg-gradient-to-br ${tierColors[achievement.tier]} shadow-md`}>
              <IconComponent className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <div className="font-bold text-sm">Achievement Unlocked!</div>
              <div className="font-semibold">{achievement.title}</div>
              <div className="text-sm opacity-90">{achievement.description}</div>
              <div className="text-sm font-medium mt-1">+{achievement.points} points earned</div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose} className="text-white hover:bg-white/20">
              ×
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}