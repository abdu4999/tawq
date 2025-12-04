import { describe, it, expect } from 'vitest';
import { smartTaskDistribution, TaskToDistribute, EmployeeProfile } from '../smart-task-distribution';

describe('Smart Task Distribution Engine', () => {
  const mockTask: TaskToDistribute = {
    id: 't1',
    title: 'Task 1',
    description: 'Desc',
    category: 'dev',
    priority: 'medium',
    estimatedHours: 8,
    difficulty: 'medium',
    requiredSkills: ['React'],
    deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    tags: ['frontend']
  };

  const mockEmployee: EmployeeProfile = {
    id: 'e1',
    name: 'Emp 1',
    position: 'Dev',
    skills: [{ skill: 'React', level: 90, lastUsed: new Date(), certifications: [] }],
    currentWorkload: 20,
    availability: 100,
    performanceScore: 90,
    burnoutScore: 10,
    stressLevel: 10,
    recentSuccess: 5,
    recentFailures: 0,
    preferredTaskTypes: ['frontend'],
    workingHours: { start: 9, end: 17 },
    timezone: 'UTC'
  };

  describe('distributeTask', () => {
    it('should select the best employee', () => {
      const emp2: EmployeeProfile = {
        ...mockEmployee,
        id: 'e2',
        skills: [], // No skills
        performanceScore: 50
      };

      const result = smartTaskDistribution.distributeTask(mockTask, [mockEmployee, emp2]);
      expect(result.selectedEmployee.id).toBe('e1');
      expect(result.score).toBeGreaterThan(70);
    });

    it('should throw error if no qualified employee', () => {
      const unqualifiedEmp: EmployeeProfile = {
        ...mockEmployee,
        skills: [],
        performanceScore: 10,
        currentWorkload: 100
      };

      expect(() => {
        smartTaskDistribution.distributeTask(mockTask, [unqualifiedEmp]);
      }).toThrow('لا يوجد موظفين مؤهلين');
    });
  });

  describe('calculateRAGScore', () => {
    it('should calculate high score for perfect match', () => {
      const score = smartTaskDistribution.calculateRAGScore(mockEmployee, mockTask);
      expect(score.overall).toBeGreaterThan(80);
      expect(score.color).toBe('green');
    });

    it('should calculate low score for mismatch', () => {
      const mismatchEmp: EmployeeProfile = {
        ...mockEmployee,
        skills: [],
        currentWorkload: 90
      };
      const score = smartTaskDistribution.calculateRAGScore(mismatchEmp, mockTask);
      expect(score.overall).toBeLessThan(60);
    });
  });

  describe('distributeMultipleTasks', () => {
    it('should distribute tasks and update workload', () => {
      const tasks = [mockTask, { ...mockTask, id: 't2' }];
      const results = smartTaskDistribution.distributeMultipleTasks(tasks, [mockEmployee]);
      
      expect(results).toHaveLength(2);
      // First task goes to e1
      expect(results[0].selectedEmployee.id).toBe('e1');
      // Second task also goes to e1 (since he's the only one), but workload calculation inside distributeMultipleTasks handles copies
    });
  });
});
