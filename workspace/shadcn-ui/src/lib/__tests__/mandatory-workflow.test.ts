import { describe, it, expect } from 'vitest';
import { mandatoryWorkflow, ProjectStep, WorkflowTemplate } from '../mandatory-workflow';

describe('Mandatory Workflow Engine', () => {
  const mockTemplate: WorkflowTemplate = {
    id: 'test_template',
    name: 'Test Template',
    description: 'Test Description',
    category: 'general',
    estimatedTotalHours: 10,
    requiredRoles: [],
    steps: [
      {
        stepNumber: 1,
        title: 'Step 1',
        description: 'Desc 1',
        required: true,
        files: [],
        dependencies: [],
        estimatedHours: 2
      },
      {
        stepNumber: 2,
        title: 'Step 2',
        description: 'Desc 2',
        required: true,
        files: [],
        dependencies: [], // Will be set in test if needed, but here it's from template
        estimatedHours: 3
      }
    ]
  };

  describe('createProjectFromTemplate', () => {
    it('should create project steps from template', () => {
      const steps = mandatoryWorkflow.createProjectFromTemplate('proj1', 'test_template', [mockTemplate]);
      expect(steps).toHaveLength(2);
      expect(steps[0].projectId).toBe('proj1');
      expect(steps[0].status).toBe('pending');
      expect(steps[0].id).toContain('step_proj1_1');
    });

    it('should throw error if template not found', () => {
      expect(() => {
        mandatoryWorkflow.createProjectFromTemplate('proj1', 'invalid', [mockTemplate]);
      }).toThrow('Template not found');
    });
  });

  describe('calculateProgress', () => {
    it('should calculate progress correctly', () => {
      const steps: ProjectStep[] = [
        { ...mockTemplate.steps[0], id: '1', projectId: 'p1', status: 'completed', dependencies: [], files: [] } as any,
        { ...mockTemplate.steps[1], id: '2', projectId: 'p1', status: 'pending', dependencies: [], files: [] } as any
      ];

      const progress = mandatoryWorkflow.calculateProgress(steps);
      expect(progress.totalSteps).toBe(2);
      expect(progress.completedSteps).toBe(1);
      expect(progress.progressPercentage).toBe(50);
      expect(progress.nextStep?.id).toBe('2');
    });

    it('should detect blocked status due to overdue steps', () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      const steps: ProjectStep[] = [
        { 
          ...mockTemplate.steps[0], 
          id: '1', 
          projectId: 'p1', 
          status: 'pending', 
          deadline: pastDate,
          dependencies: [], 
          files: [] 
        } as any
      ];

      const progress = mandatoryWorkflow.calculateProgress(steps);
      expect(progress.isBlocked).toBe(true);
      expect(progress.blockedReason).toContain('متأخرة');
    });
  });

  describe('canStartStep', () => {
    it('should allow starting first step', () => {
      const steps: ProjectStep[] = [
        { ...mockTemplate.steps[0], id: '1', stepNumber: 1, status: 'pending', dependencies: [], files: [] } as any,
        { ...mockTemplate.steps[1], id: '2', stepNumber: 2, status: 'pending', dependencies: [], files: [] } as any
      ];

      const result = mandatoryWorkflow.canStartStep(steps[0], steps);
      expect(result.canStart).toBe(true);
    });

    it('should prevent starting step if dependencies not met', () => {
      const steps: ProjectStep[] = [
        { ...mockTemplate.steps[0], id: '1', stepNumber: 1, status: 'pending', dependencies: [], files: [] } as any,
        { ...mockTemplate.steps[1], id: '2', stepNumber: 2, status: 'pending', dependencies: ['1'], files: [] } as any
      ];

      const result = mandatoryWorkflow.canStartStep(steps[1], steps);
      expect(result.canStart).toBe(false);
      expect(result.reason).toContain('المعتمدة عليها');
    });

    it('should prevent starting step if previous required step not completed', () => {
      const steps: ProjectStep[] = [
        { ...mockTemplate.steps[0], id: '1', stepNumber: 1, required: true, status: 'pending', dependencies: [], files: [] } as any,
        { ...mockTemplate.steps[1], id: '2', stepNumber: 2, required: true, status: 'pending', dependencies: [], files: [] } as any
      ];

      // Trying to start step 2 while step 1 (required) is pending
      const result = mandatoryWorkflow.canStartStep(steps[1], steps);
      expect(result.canStart).toBe(false);
      expect(result.reason).toContain('الخطوات الإلزامية السابقة');
    });
  });

  describe('startStep', () => {
    it('should update status to in-progress', () => {
      const step: ProjectStep = { ...mockTemplate.steps[0], id: '1', status: 'pending', dependencies: [], files: [] } as any;
      const updated = mandatoryWorkflow.startStep(step, 'user1');
      expect(updated.status).toBe('in-progress');
      expect(updated.assignedTo).toBe('user1');
    });
  });

  describe('completeStep', () => {
    it('should update status to completed', () => {
      const step: ProjectStep = { ...mockTemplate.steps[0], id: '1', status: 'in-progress', dependencies: [], files: [] } as any;
      const updated = mandatoryWorkflow.completeStep(step, 'user1');
      expect(updated.status).toBe('completed');
      expect(updated.completedAt).toBeDefined();
      expect(updated.completedBy).toBe('user1');
    });
  });
});
