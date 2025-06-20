import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Play, CheckCircle, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function AchievementDemo() {
  const [isRunning, setIsRunning] = useState(false);
  const [demoResults, setDemoResults] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const runDemo = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/achievements/demo", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) throw new Error("Demo failed");
      return response.json();
    },
    onSuccess: (data) => {
      setDemoResults(data);
      queryClient.invalidateQueries({ queryKey: ["/api/achievements/progress"] });
      toast({
        title: "Achievement Demo Complete!",
        description: `Unlocked ${data.newAchievements?.length || 0} new achievements`,
      });
    },
    onError: (error) => {
      toast({
        title: "Demo Failed",
        description: "There was an error running the achievement demo",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsRunning(false);
    }
  });

  const handleRunDemo = () => {
    setIsRunning(true);
    setDemoResults(null);
    runDemo.mutate();
  };

  return (
    <Card className="border-2 border-dashed border-blue-300 bg-blue-50/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Achievement System Demo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-600">
          Click the button below to simulate user activities and see how achievements are unlocked in real-time.
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-white p-2 rounded border">
            <strong>Simulates:</strong>
            <ul className="mt-1 space-y-1">
              <li>• 3 clients added</li>
              <li>• 2 contracts uploaded</li>
              <li>• 5 showings scheduled</li>
            </ul>
          </div>
          <div className="bg-white p-2 rounded border">
            <strong>Also tracks:</strong>
            <ul className="mt-1 space-y-1">
              <li>• $15K commission protected</li>
              <li>• 2 alerts actioned</li>
              <li>• Login streak updated</li>
            </ul>
          </div>
        </div>

        <Button 
          onClick={handleRunDemo}
          disabled={isRunning}
          className="w-full"
          size="lg"
        >
          {isRunning ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Running Demo...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Run Achievement Demo
            </>
          )}
        </Button>

        {demoResults && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="font-medium">Demo completed successfully!</span>
            </div>

            {demoResults.newAchievements && demoResults.newAchievements.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-700">
                  New Achievements Unlocked:
                </div>
                <div className="space-y-2">
                  {demoResults.newAchievements.map((achievement: any, index: number) => (
                    <motion.div
                      key={achievement.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center space-x-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200"
                    >
                      <div className="p-2 rounded-full bg-yellow-500">
                        <Star className="h-4 w-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-yellow-800">
                          {achievement.title}
                        </div>
                        <div className="text-sm text-yellow-700">
                          {achievement.description}
                        </div>
                        <Badge variant="secondary" className="mt-1">
                          +{achievement.points} points
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {demoResults.progress && (
              <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                <div className="text-center">
                  <div className="text-lg font-bold text-blue-600">
                    Level {demoResults.progress.level}
                  </div>
                  <div className="text-xs text-gray-600">Current Level</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-purple-600">
                    {demoResults.progress.totalPoints}
                  </div>
                  <div className="text-xs text-gray-600">Total Points</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold text-green-600">
                    {demoResults.progress.achievements?.length || 0}
                  </div>
                  <div className="text-xs text-gray-600">Achievements</div>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}