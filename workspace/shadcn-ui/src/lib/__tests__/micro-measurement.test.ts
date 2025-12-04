import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { microMeasurement } from '../micro-measurement';

describe('MicroMeasurementEngine', () => {
  const mockEmployeeId = 'emp-123';
  const mockEmployeeName = 'John Doe';

  beforeEach(() => {
    vi.useFakeTimers();
    microMeasurement.clearAllData();
    // Mock localStorage
    vi.spyOn(Storage.prototype, 'setItem');
    vi.spyOn(Storage.prototype, 'getItem');
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('Session Management', () => {
    it('should start a session correctly', () => {
      const sessionId = microMeasurement.startSession(mockEmployeeId, mockEmployeeName);
      
      expect(sessionId).toBeDefined();
      expect(sessionId).toContain('session_');
      expect(localStorage.setItem).toHaveBeenCalledWith('currentMicroSession', expect.any(String));
    });

    it('should end a session correctly', () => {
      microMeasurement.startSession(mockEmployeeId, mockEmployeeName);
      microMeasurement.endSession();

      expect(localStorage.removeItem).toHaveBeenCalledWith('currentMicroSession');
      // Should save the session to history
      expect(localStorage.setItem).toHaveBeenCalledWith('microSessions', expect.any(String));
    });
  });

  describe('Event Recording', () => {
    it('should record an event when session is active', () => {
      microMeasurement.startSession(mockEmployeeId, mockEmployeeName);
      
      microMeasurement.recordEvent({
        eventType: 'click',
        screenName: 'Dashboard',
        elementId: 'btn-save'
      });

      // We can't access private events array directly, but we can check side effects
      // or use public methods that rely on events.
      // For unit testing, we might want to inspect the internal state if possible, 
      // or check if it triggers batch sending.
      
      // Let's check if it's in the stored events after a batch send
      vi.advanceTimersByTime(6000); // Trigger batch interval
      
      expect(localStorage.setItem).toHaveBeenCalledWith('microEvents', expect.stringContaining('btn-save'));
    });

    it('should not record event if no session is active', () => {
      microMeasurement.recordEvent({
        eventType: 'click',
        screenName: 'Dashboard'
      });

      vi.advanceTimersByTime(6000);
      expect(localStorage.setItem).not.toHaveBeenCalledWith('microEvents', expect.any(String));
    });
  });

  describe('Screen Tracking', () => {
    it('should track screen duration correctly', () => {
      microMeasurement.startSession(mockEmployeeId, mockEmployeeName);
      
      microMeasurement.enterScreen('Home');
      vi.advanceTimersByTime(5000); // Stay for 5 seconds
      microMeasurement.leaveScreen('Home');

      // Force batch send
      vi.advanceTimersByTime(6000);

      // Check if duration was recorded in the event
      expect(localStorage.setItem).toHaveBeenCalledWith('microEvents', expect.stringContaining('"duration":5000'));
    });
  });

  describe('Metrics Calculation', () => {
    it('should calculate behavior metrics', () => {
      microMeasurement.startSession(mockEmployeeId, mockEmployeeName);
      
      // Simulate some activity
      microMeasurement.recordEvent({ eventType: 'click', screenName: 'Home' });
      microMeasurement.recordEvent({ eventType: 'click', screenName: 'Home' });
      microMeasurement.recordEvent({ eventType: 'click', screenName: 'Settings' });
      
      // Simulate focus/blur for focus score
      microMeasurement.onFocus('Home');
      vi.advanceTimersByTime(10000); // 10s focus
      microMeasurement.onBlur('Home'); // 10s duration recorded

      // Simulate session duration of 1 minute
      vi.setSystemTime(new Date(Date.now() + 60000));

      const metrics = microMeasurement.calculateBehaviorMetrics(mockEmployeeId);

      expect(metrics).toBeDefined();
      expect(metrics?.employeeId).toBe(mockEmployeeId);
      expect(metrics?.clicksPerMinute).toBeGreaterThan(0);
      expect(metrics?.focusScore).toBeGreaterThan(0);
    });
  });
});
