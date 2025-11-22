export interface PointsRecord {
  id: string;
  userId: string;
  points: number;
  type: 'performance' | 'creativity' | 'team' | 'bonus';
  description: string;
  taskId?: string;
  projectId?: string;
  createdAt: string;
}

export interface Challenge {
  id: string;
  title: string;
  description: string;
  type: 'individual' | 'team';
  target: number;
  rewardPoints: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'completed' | 'upcoming';
  participants: string[];
  createdAt: string;
}

export interface LeaderboardEntry {
  userId: string;
  userName: string;
  totalPoints: number;
  performancePoints: number;
  creativityPoints: number;
  teamPoints: number;
  completedTasks: number;
  rank: number;
}

export class GamificationStorage {
  private static readonly POINTS_KEY = 'charity_points';
  private static readonly CHALLENGES_KEY = 'charity_challenges';

  static getPointsRecords(): PointsRecord[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(this.POINTS_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  static getChallenges(): Challenge[] {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(this.CHALLENGES_KEY);
    return stored ? JSON.parse(stored) : [];
  }

  static savePointsRecords(records: PointsRecord[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.POINTS_KEY, JSON.stringify(records));
  }

  static saveChallenges(challenges: Challenge[]): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(this.CHALLENGES_KEY, JSON.stringify(challenges));
  }

  static addPoints(userId: string, points: number, type: PointsRecord['type'], description: string, taskId?: string, projectId?: string): PointsRecord {
    const records = this.getPointsRecords();
    const newRecord: PointsRecord = {
      id: `points_${Date.now()}`,
      userId,
      points,
      type,
      description,
      taskId,
      projectId,
      createdAt: new Date().toISOString()
    };
    records.push(newRecord);
    this.savePointsRecords(records);
    return newRecord;
  }

  static getUserPoints(userId: string): number {
    const records = this.getPointsRecords();
    return records
      .filter(record => record.userId === userId)
      .reduce((total, record) => total + record.points, 0);
  }

  static getUserPointsByType(userId: string): { [key in PointsRecord['type']]: number } {
    const records = this.getPointsRecords();
    const pointsByType = {
      performance: 0,
      creativity: 0,
      team: 0,
      bonus: 0
    };

    records
      .filter(record => record.userId === userId)
      .forEach(record => {
        pointsByType[record.type] += record.points;
      });

    return pointsByType;
  }

  static getLeaderboard(): LeaderboardEntry[] {
    const records = this.getPointsRecords();
    const userPoints: { [userId: string]: LeaderboardEntry } = {};

    // Mock user data - in real app, get from user storage
    const mockUsers = {
      '1': { name: 'المدير العام' },
      '2': { name: 'المحاسب أحمد' },
      '3': { name: 'المشرف محمد' },
      '4': { name: 'الموظف خالد' }
    };

    // Calculate points for each user
    records.forEach(record => {
      if (!userPoints[record.userId]) {
        userPoints[record.userId] = {
          userId: record.userId,
          userName: mockUsers[record.userId as keyof typeof mockUsers]?.name || 'مستخدم',
          totalPoints: 0,
          performancePoints: 0,
          creativityPoints: 0,
          teamPoints: 0,
          completedTasks: 0,
          rank: 0
        };
      }

      userPoints[record.userId].totalPoints += record.points;
      
      switch (record.type) {
        case 'performance':
          userPoints[record.userId].performancePoints += record.points;
          break;
        case 'creativity':
          userPoints[record.userId].creativityPoints += record.points;
          break;
        case 'team':
          userPoints[record.userId].teamPoints += record.points;
          break;
      }

      // Count completed tasks (simplified)
      if (record.taskId && record.type === 'performance') {
        userPoints[record.userId].completedTasks++;
      }
    });

    // Convert to array and sort by total points
    const leaderboard = Object.values(userPoints)
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .map((entry, index) => ({
        ...entry,
        rank: index + 1
      }));

    return leaderboard;
  }

  static createChallenge(challenge: Omit<Challenge, 'id' | 'createdAt'>): Challenge {
    const challenges = this.getChallenges();
    const newChallenge: Challenge = {
      ...challenge,
      id: `challenge_${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    challenges.push(newChallenge);
    this.saveChallenges(challenges);
    return newChallenge;
  }

  static joinChallenge(challengeId: string, userId: string): boolean {
    const challenges = this.getChallenges();
    const challenge = challenges.find(c => c.id === challengeId);
    
    if (!challenge || challenge.status !== 'active') {
      return false;
    }

    if (!challenge.participants.includes(userId)) {
      challenge.participants.push(userId);
      this.saveChallenges(challenges);
    }

    return true;
  }

  static getActiveChallenges(): Challenge[] {
    const challenges = this.getChallenges();
    return challenges.filter(challenge => challenge.status === 'active');
  }

  static getUserChallenges(userId: string): Challenge[] {
    const challenges = this.getChallenges();
    return challenges.filter(challenge => 
      challenge.participants.includes(userId)
    );
  }

  // Initialize with sample data
  static initializeSampleData(): void {
    const existingPoints = this.getPointsRecords();
    if (existingPoints.length === 0) {
      const samplePoints: PointsRecord[] = [
        {
          id: 'points_1',
          userId: '4',
          points: 100,
          type: 'performance',
          description: 'إكمال مهمة متابعة كفالات الأيتام',
          taskId: 'task_3',
          projectId: 'project_2',
          createdAt: '2024-02-28'
        },
        {
          id: 'points_2',
          userId: '4',
          points: 50,
          type: 'creativity',
          description: 'اقتراح فكرة حملة جديدة',
          createdAt: '2024-03-01'
        },
        {
          id: 'points_3',
          userId: '4',
          points: 75,
          type: 'team',
          description: 'المساعدة في تدريب موظف جديد',
          createdAt: '2024-03-02'
        },
        {
          id: 'points_4',
          userId: '3',
          points: 80,
          type: 'performance',
          description: 'إدارة فريق ناجحة',
          createdAt: '2024-03-01'
        }
      ];
      this.savePointsRecords(samplePoints);
    }

    const existingChallenges = this.getChallenges();
    if (existingChallenges.length === 0) {
      const sampleChallenges: Challenge[] = [
        {
          id: 'challenge_1',
          title: 'تحدي التواصل مع 100 متبرع',
          description: 'التواصل مع 100 متبرع محتمل خلال الأسبوع',
          type: 'individual',
          target: 100,
          rewardPoints: 200,
          startDate: '2024-03-04',
          endDate: '2024-03-10',
          status: 'active',
          participants: ['4'],
          createdAt: '2024-03-04'
        },
        {
          id: 'challenge_2',
          title: 'تحدي الفريق المبدع',
          description: 'اقتراح 10 أفكار إبداعية جديدة للحملات',
          type: 'team',
          target: 10,
          rewardPoints: 500,
          startDate: '2024-03-04',
          endDate: '2024-03-17',
          status: 'active',
          participants: ['3', '4'],
          createdAt: '2024-03-04'
        }
      ];
      this.saveChallenges(sampleChallenges);
    }
  }
}