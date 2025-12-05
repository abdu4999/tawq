import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  generateErrorReference, 
  handleApiError, 
  showSuccessNotification,
  showWarningNotification,
  showInfoNotification 
} from './error-handler';
import { errorStorage } from './error-storage';

// Mock dependencies if needed
vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({
    toast: vi.fn()
  }),
  toast: vi.fn()
}));

describe('Error System', () => {
  beforeEach(async () => {
    await errorStorage.clearAllErrors();
    vi.clearAllMocks();
  });

  it('should generate valid error references', () => {
    const ref1 = generateErrorReference();
    const ref2 = generateErrorReference();
    const pattern = /^ERR-\d{8}-[A-Z0-9]{6}$/;
    
    expect(pattern.test(ref1)).toBe(true);
    expect(pattern.test(ref2)).toBe(true);
    expect(ref1).not.toBe(ref2);
  });

  it('should handle API errors and save them', async () => {
    const testError = new Error('Test API Error');
    const errorRef = await handleApiError(testError, {
      message: 'Test error',
      context: 'Test - API Call',
      severity: 'medium',
      userFriendlyMessage: 'هذا خطأ اختباري',
      payload: { test: true },
    });
    
    expect(errorRef).toMatch(/^ERR-\d{8}-[A-Z0-9]{6}$/);
    
    // handleApiError returns the error_code, not the internal ID.
    // We need to find the error by code.
    const allErrors = await errorStorage.getAllErrors();
    const savedError = allErrors.find(e => e.error_code === errorRef);

    expect(savedError).toBeDefined();
    expect(savedError?.context).toBe('Test - API Call');
    expect(savedError?.severity).toBe('medium');
  });

  it('should show notifications without error', () => {
    // These functions call toast(), which is mocked.
    // We just want to ensure they don't throw.
    expect(() => showSuccessNotification('Success', 'Message')).not.toThrow();
    expect(() => showWarningNotification('Warning', 'Message')).not.toThrow();
    expect(() => showInfoNotification('Info', 'Message')).not.toThrow();
  });

  it('should manage error storage correctly', async () => {
    // Add errors
    const ref1 = await errorStorage.logError({
      error_code: 'ERR-TEST-001',
      error_message: 'Test error 1',
      error_details: 'Details 1',
      context: 'Test Context 1',
      severity: 'high',
      resolved: false,
    });
    
    const ref2 = await errorStorage.logError({
      error_code: 'ERR-TEST-002',
      error_message: 'Test error 2',
      error_details: 'Details 2',
      context: 'Test Context 2',
      severity: 'low',
      resolved: false,
    });
    
    const allErrors = await errorStorage.getAllErrors();
    expect(allErrors.length).toBe(2);
    
    const searchResults = await errorStorage.searchErrors('Test error 1');
    expect(searchResults.length).toBe(1);
    expect(searchResults[0].error_code).toBe('ERR-TEST-001');
    
    const resolved = await errorStorage.markAsResolved(ref1, 'test-user', 'Fixed');
    expect(resolved).toBe(true);
    
    const updatedError = await errorStorage.getErrorById(ref1);
    expect(updatedError?.resolved).toBe(true);
  });

  it('should filter errors correctly', async () => {
    await errorStorage.logError({
      error_code: 'ERR-FILTER-001',
      error_message: 'Critical error',
      error_details: 'Details',
      context: 'Test',
      severity: 'critical',
      resolved: false,
    });
    
    await errorStorage.logError({
      error_code: 'ERR-FILTER-002',
      error_message: 'Low error',
      error_details: 'Details',
      context: 'Test',
      severity: 'low',
      resolved: true,
    });
    
    const allErrors = await errorStorage.getAllErrors();
    const unresolved = allErrors.filter(e => !e.resolved);
    const critical = allErrors.filter(e => e.severity === 'critical');
    
    expect(unresolved.length).toBe(1);
    expect(critical.length).toBe(1);
  });
});
