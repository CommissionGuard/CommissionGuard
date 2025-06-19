import { db } from './db';
import { 
  achievements, 
  userAchievements, 
  userStats,
  clients,
  contracts,
  showings,
  alerts
} from '../shared/schema';
import { eq, sql, and, gte, lte } from 'drizzle-orm';

export interface AchievementDefinition {
  name: string;
  title: string;
  description: string;
  icon: string;
  category: 'onboarding' | 'clients' | 'contracts' | 'milestones' | 'engagement';
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  points: number;
  criteria: {
    type: 'count' | 'streak' | 'milestone' | 'percentage';
    metric: string;
    target: number;
    timeframe?: string;
  };
}

export const defaultAchievements: AchievementDefinition[] = [
  // Onboarding
  {
    name: 'welcome_aboard',
    title: 'Welcome Aboard!',
    description: 'Complete your account setup and profile',
    icon: 'UserCheck',
    category: 'onboarding',
    tier: 'bronze',
    points: 25,
    criteria: { type: 'milestone', metric: 'profile_completed', target: 1 }
  },
  {
    name: 'first_steps',
    title: 'First Steps',
    description: 'Complete the onboarding tour',
    icon: 'BookOpen',
    category: 'onboarding',
    tier: 'bronze',
    points: 15,
    criteria: { type: 'milestone', metric: 'onboarding_completed', target: 1 }
  },

  // Client Management
  {
    name: 'first_client',
    title: 'First Client',
    description: 'Add your first client to the system',
    icon: 'UserPlus',
    category: 'clients',
    tier: 'bronze',
    points: 20,
    criteria: { type: 'count', metric: 'clients_added', target: 1 }
  },
  {
    name: 'client_collector',
    title: 'Client Collector',
    description: 'Add 5 clients to your portfolio',
    icon: 'Users',
    category: 'clients',
    tier: 'silver',
    points: 50,
    criteria: { type: 'count', metric: 'clients_added', target: 5 }
  },
  {
    name: 'networking_pro',
    title: 'Networking Pro',
    description: 'Manage 25 active clients',
    icon: 'Network',
    category: 'clients',
    tier: 'gold',
    points: 100,
    criteria: { type: 'count', metric: 'clients_added', target: 25 }
  },

  // Contract Management
  {
    name: 'contract_guardian',
    title: 'Contract Guardian',
    description: 'Upload your first exclusive representation agreement',
    icon: 'FileText',
    category: 'contracts',
    tier: 'bronze',
    points: 30,
    criteria: { type: 'count', metric: 'contracts_uploaded', target: 1 }
  },
  {
    name: 'deal_maker',
    title: 'Deal Maker',
    description: 'Upload 10 contracts and protect your commissions',
    icon: 'Handshake',
    category: 'contracts',
    tier: 'silver',
    points: 75,
    criteria: { type: 'count', metric: 'contracts_uploaded', target: 10 }
  },
  {
    name: 'commission_protector',
    title: 'Commission Protector',
    description: 'Protect over $100,000 in commissions',
    icon: 'Shield',
    category: 'contracts',
    tier: 'gold',
    points: 150,
    criteria: { type: 'count', metric: 'commission_protected', target: 100000 }
  },

  // Engagement
  {
    name: 'daily_devotee',
    title: 'Daily Devotee',
    description: 'Log in for 7 consecutive days',
    icon: 'Calendar',
    category: 'engagement',
    tier: 'bronze',
    points: 40,
    criteria: { type: 'streak', metric: 'consecutive_login_days', target: 7 }
  },
  {
    name: 'consistency_king',
    title: 'Consistency King',
    description: 'Maintain a 30-day login streak',
    icon: 'Trophy',
    category: 'engagement',
    tier: 'silver',
    points: 100,
    criteria: { type: 'streak', metric: 'consecutive_login_days', target: 30 }
  },
  {
    name: 'alert_action_hero',
    title: 'Alert Action Hero',
    description: 'Act on 50 alerts to protect your business',
    icon: 'Bell',
    category: 'engagement',
    tier: 'gold',
    points: 80,
    criteria: { type: 'count', metric: 'alerts_actioned', target: 50 }
  },

  // Milestones
  {
    name: 'first_showing',
    title: 'First Showing',
    description: 'Schedule your first property showing',
    icon: 'Home',
    category: 'milestones',
    tier: 'bronze',
    points: 25,
    criteria: { type: 'count', metric: 'showings_scheduled', target: 1 }
  },
  {
    name: 'showing_specialist',
    title: 'Showing Specialist',
    description: 'Complete 50 property showings',
    icon: 'MapPin',
    category: 'milestones',
    tier: 'silver',
    points: 90,
    criteria: { type: 'count', metric: 'showings_scheduled', target: 50 }
  },
  {
    name: 'breach_buster',
    title: 'Breach Buster',
    description: 'Successfully resolve 5 potential breaches',
    icon: 'ShieldCheck',
    category: 'milestones',
    tier: 'gold',
    points: 120,
    criteria: { type: 'count', metric: 'breaches_resolved', target: 5 }
  },
  {
    name: 'elite_agent',
    title: 'Elite Agent',
    description: 'Reach level 10 and earn 1000 points',
    icon: 'Crown',
    category: 'milestones',
    tier: 'platinum',
    points: 200,
    criteria: { type: 'count', metric: 'total_points', target: 1000 }
  }
];

export class AchievementService {
  
  async initializeAchievements() {
    // Insert default achievements if they don't exist
    for (const achievement of defaultAchievements) {
      const existing = await db.select()
        .from(achievements)
        .where(eq(achievements.name, achievement.name))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(achievements).values({
          name: achievement.name,
          title: achievement.title,
          description: achievement.description,
          icon: achievement.icon,
          category: achievement.category,
          tier: achievement.tier,
          points: achievement.points.toString(),
          criteria: achievement.criteria,
        });
      }
    }
  }

  async initializeUserStats(userId: string) {
    const existingStats = await db.select()
      .from(userStats)
      .where(eq(userStats.userId, userId))
      .limit(1);

    if (existingStats.length === 0) {
      await db.insert(userStats).values({
        userId,
        totalPoints: '0',
        level: '1',
        experiencePoints: '0',
        clientsAdded: '0',
        contractsUploaded: '0',
        showingsScheduled: '0',
        breachesResolved: '0',
        daysActive: '0',
        consecutiveLoginDays: '0',
        longestStreak: '0',
        commissionProtected: '0',
        alertsActioned: '0',
      });
    }
  }

  async updateUserStats(userId: string, updates: Partial<{
    clientsAdded: number;
    contractsUploaded: number;
    showingsScheduled: number;
    breachesResolved: number;
    commissionProtected: number;
    alertsActioned: number;
  }>) {
    await this.initializeUserStats(userId);

    const updateData: any = {};
    
    if (updates.clientsAdded !== undefined) {
      updateData.clientsAdded = sql`${userStats.clientsAdded}::int + ${updates.clientsAdded}`;
    }
    if (updates.contractsUploaded !== undefined) {
      updateData.contractsUploaded = sql`${userStats.contractsUploaded}::int + ${updates.contractsUploaded}`;
    }
    if (updates.showingsScheduled !== undefined) {
      updateData.showingsScheduled = sql`${userStats.showingsScheduled}::int + ${updates.showingsScheduled}`;
    }
    if (updates.breachesResolved !== undefined) {
      updateData.breachesResolved = sql`${userStats.breachesResolved}::int + ${updates.breachesResolved}`;
    }
    if (updates.commissionProtected !== undefined) {
      updateData.commissionProtected = sql`${userStats.commissionProtected}::int + ${updates.commissionProtected}`;
    }
    if (updates.alertsActioned !== undefined) {
      updateData.alertsActioned = sql`${userStats.alertsActioned}::int + ${updates.alertsActioned}`;
    }

    await db.update(userStats)
      .set(updateData)
      .where(eq(userStats.userId, userId));

    // Check for new achievements
    await this.checkAchievements(userId);
  }

  async updateLoginStreak(userId: string) {
    await this.initializeUserStats(userId);

    const stats = await db.select()
      .from(userStats)
      .where(eq(userStats.userId, userId))
      .limit(1);

    if (stats.length === 0) return;

    const userStat = stats[0];
    const today = new Date();
    const lastLogin = userStat.lastLoginDate;
    
    let newStreak = 1;
    
    if (lastLogin) {
      const lastLoginDate = new Date(lastLogin);
      const diffTime = today.getTime() - lastLoginDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        // Consecutive day
        newStreak = parseInt(userStat.consecutiveLoginDays.toString()) + 1;
      } else if (diffDays === 0) {
        // Same day, no change
        return;
      }
      // If more than 1 day gap, streak resets to 1
    }

    const longestStreak = Math.max(
      parseInt(userStat.longestStreak.toString()),
      newStreak
    );

    await db.update(userStats)
      .set({
        consecutiveLoginDays: newStreak.toString(),
        longestStreak: longestStreak.toString(),
        lastLoginDate: today.toISOString().split('T')[0],
        daysActive: sql`${userStats.daysActive}::int + 1`,
      })
      .where(eq(userStats.userId, userId));

    await this.checkAchievements(userId);
  }

  async checkAchievements(userId: string) {
    const stats = await db.select()
      .from(userStats)
      .where(eq(userStats.userId, userId))
      .limit(1);

    if (stats.length === 0) return [];

    const userStat = stats[0];
    const allAchievements = await db.select().from(achievements);
    const userUnlockedAchievements = await db.select()
      .from(userAchievements)
      .where(eq(userAchievements.userId, userId));

    const unlockedIds = new Set(userUnlockedAchievements.map(ua => ua.achievementId));
    const newAchievements = [];

    for (const achievement of allAchievements) {
      if (unlockedIds.has(achievement.id)) continue;

      const criteria = achievement.criteria as any;
      let isUnlocked = false;

      switch (criteria.metric) {
        case 'clients_added':
          isUnlocked = parseInt(userStat.clientsAdded.toString()) >= criteria.target;
          break;
        case 'contracts_uploaded':
          isUnlocked = parseInt(userStat.contractsUploaded.toString()) >= criteria.target;
          break;
        case 'showings_scheduled':
          isUnlocked = parseInt(userStat.showingsScheduled.toString()) >= criteria.target;
          break;
        case 'breaches_resolved':
          isUnlocked = parseInt(userStat.breachesResolved.toString()) >= criteria.target;
          break;
        case 'commission_protected':
          isUnlocked = parseInt(userStat.commissionProtected.toString()) >= criteria.target;
          break;
        case 'alerts_actioned':
          isUnlocked = parseInt(userStat.alertsActioned.toString()) >= criteria.target;
          break;
        case 'consecutive_login_days':
          isUnlocked = parseInt(userStat.consecutiveLoginDays.toString()) >= criteria.target;
          break;
        case 'total_points':
          isUnlocked = parseInt(userStat.totalPoints.toString()) >= criteria.target;
          break;
        case 'profile_completed':
        case 'onboarding_completed':
          // These would be checked elsewhere when those actions happen
          break;
      }

      if (isUnlocked) {
        await db.insert(userAchievements).values({
          userId,
          achievementId: achievement.id,
          isCompleted: true,
          notificationSent: false,
        });

        // Award points
        const points = parseInt(achievement.points.toString());
        await db.update(userStats)
          .set({
            totalPoints: sql`${userStats.totalPoints}::int + ${points}`,
            experiencePoints: sql`${userStats.experiencePoints}::int + ${points}`,
          })
          .where(eq(userStats.userId, userId));

        newAchievements.push(achievement);
      }
    }

    // Update user level based on total points
    await this.updateUserLevel(userId);

    return newAchievements;
  }

  async updateUserLevel(userId: string) {
    const stats = await db.select()
      .from(userStats)
      .where(eq(userStats.userId, userId))
      .limit(1);

    if (stats.length === 0) return;

    const userStat = stats[0];
    const totalPoints = parseInt(userStat.totalPoints.toString());
    
    // Level calculation: Every 100 points = 1 level
    const newLevel = Math.floor(totalPoints / 100) + 1;
    
    if (newLevel > parseInt(userStat.level.toString())) {
      await db.update(userStats)
        .set({ level: newLevel.toString() })
        .where(eq(userStats.userId, userId));
    }
  }

  async getUserAchievements(userId: string) {
    const userAchievementsWithDetails = await db.select({
      achievement: achievements,
      userAchievement: userAchievements,
    })
      .from(userAchievements)
      .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
      .where(eq(userAchievements.userId, userId));

    return userAchievementsWithDetails;
  }

  async getUserStats(userId: string) {
    await this.initializeUserStats(userId);
    
    const stats = await db.select()
      .from(userStats)
      .where(eq(userStats.userId, userId))
      .limit(1);

    return stats[0];
  }

  async getUserProgress(userId: string) {
    const [userAchievementsData, userStatsData, allAchievements] = await Promise.all([
      this.getUserAchievements(userId),
      this.getUserStats(userId),
      db.select().from(achievements)
    ]);

    const unlockedAchievements = userAchievementsData.map(ua => ua.achievement);
    const totalAchievements = allAchievements.length;
    const completionPercentage = Math.round((unlockedAchievements.length / totalAchievements) * 100);

    return {
      stats: userStatsData,
      achievements: unlockedAchievements,
      totalAchievements,
      completionPercentage,
      level: parseInt(userStatsData.level.toString()),
      totalPoints: parseInt(userStatsData.totalPoints.toString()),
      nextLevelPoints: (parseInt(userStatsData.level.toString()) * 100),
    };
  }

  async getAchievementCategories() {
    const allAchievements = await db.select().from(achievements);
    
    const categories = allAchievements.reduce((acc, achievement) => {
      if (!acc[achievement.category]) {
        acc[achievement.category] = [];
      }
      acc[achievement.category].push(achievement);
      return acc;
    }, {} as Record<string, typeof allAchievements>);

    return categories;
  }
}

export const achievementService = new AchievementService();