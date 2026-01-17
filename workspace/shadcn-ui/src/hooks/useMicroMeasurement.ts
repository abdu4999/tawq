/**
 * React Hook for Micro Measurement Engine
 * يوفر واجهة سهلة لاستخدام نظام القياس الدقيق
 */

import { useEffect, useRef, useCallback, useState } from 'react';
import { microMeasurement } from '@/lib/micro-measurement';

interface UseMicroMeasurementOptions {
  screenName: string;
  employeeId: string;
  employeeName: string;
  enabled?: boolean;
}

const DEFAULT_OPTIONS: UseMicroMeasurementOptions = {
  screenName: 'default-screen',
  employeeId: 'employee-demo',
  employeeName: 'مستخدم تجريبي',
  enabled: true
};

export function useMicroMeasurement(options?: Partial<UseMicroMeasurementOptions>) {
  const mergedOptions = { ...DEFAULT_OPTIONS, ...options } as UseMicroMeasurementOptions;
  const { screenName, employeeId, employeeName, enabled } = mergedOptions;

  const sessionStarted = useRef(false);
  const screenEntered = useRef(false);
  const sessionStartTime = useRef<number | null>(null);
  const durationIntervalRef = useRef<number | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);

  const resetSessionState = () => {
    if (durationIntervalRef.current) {
      window.clearInterval(durationIntervalRef.current);
      durationIntervalRef.current = null;
    }
    sessionStartTime.current = null;
    setSessionDuration(0);
    setIsTracking(false);
  };

  // بدء الجلسة
  useEffect(() => {
    if (!enabled) return;

    if (!sessionStarted.current) {
      microMeasurement.startSession(employeeId, employeeName);
      sessionStarted.current = true;
      sessionStartTime.current = Date.now();
      setIsTracking(true);
      durationIntervalRef.current = window.setInterval(() => {
        if (sessionStartTime.current) {
          setSessionDuration(Math.floor((Date.now() - sessionStartTime.current) / 1000));
        }
      }, 1000);
    }

    return () => {
      if (sessionStarted.current) {
        microMeasurement.endSession();
        sessionStarted.current = false;
      }
      resetSessionState();
    };
  }, [employeeId, employeeName, enabled]);

  // تتبع دخول ومغادرة الشاشة
  useEffect(() => {
    if (!enabled) return;

    microMeasurement.enterScreen(screenName);
    screenEntered.current = true;

    return () => {
      if (screenEntered.current) {
        microMeasurement.leaveScreen(screenName);
        screenEntered.current = false;
      }
    };
  }, [screenName, enabled]);

  // تتبع التركيز
  useEffect(() => {
    if (!enabled) return;

    const handleFocus = () => microMeasurement.onFocus(screenName);
    const handleBlur = () => microMeasurement.onBlur(screenName);

    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, [screenName, enabled]);

  // تتبع النقرات
  useEffect(() => {
    if (!enabled) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      microMeasurement.recordEvent({
        eventType: 'click',
        screenName,
        elementId: target.id || undefined,
        elementType: target.tagName?.toLowerCase(),
        elementText: target.textContent?.slice(0, 50) || undefined,
        metadata: {
          x: e.clientX,
          y: e.clientY,
          button: e.button
        }
      });
    };

    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [screenName, enabled]);

  // تتبع الكتابة
  useEffect(() => {
    if (!enabled) return;

    let keypressCount = 0;
    let lastKeypressTime = Date.now();

    const handleKeypress = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      keypressCount++;

      // تسجيل كل 5 ضغطات أو كل 3 ثوانٍ
      const now = Date.now();
      if (keypressCount >= 5 || now - lastKeypressTime > 3000) {
        microMeasurement.recordEvent({
          eventType: 'keypress',
          screenName,
          elementId: target.id || undefined,
          elementType: target.tagName?.toLowerCase(),
          metadata: {
            count: keypressCount,
            duration: now - lastKeypressTime
          }
        });
        keypressCount = 0;
        lastKeypressTime = now;
      }
    };

    document.addEventListener('keypress', handleKeypress);

    return () => {
      document.removeEventListener('keypress', handleKeypress);
    };
  }, [screenName, enabled]);

  // تتبع التمرير
  useEffect(() => {
    if (!enabled) return;

    let scrollCount = 0;
    let lastScrollTime = Date.now();

    const handleScroll = () => {
      scrollCount++;
      const now = Date.now();

      // تسجيل كل 10 تمريرات أو كل 5 ثوانٍ
      if (scrollCount >= 10 || now - lastScrollTime > 5000) {
        microMeasurement.recordEvent({
          eventType: 'scroll',
          screenName,
          metadata: {
            count: scrollCount,
            scrollY: window.scrollY,
            scrollX: window.scrollX,
            duration: now - lastScrollTime
          }
        });
        scrollCount = 0;
        lastScrollTime = now;
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [screenName, enabled]);

  // دوال مساعدة
  const recordCustomEvent = useCallback((
    eventType: 'click' | 'input' | 'navigation',
    metadata?: Record<string, any>
  ) => {
    if (!enabled) return;
    
    microMeasurement.recordEvent({
      eventType,
      screenName,
      metadata
    });
  }, [screenName, enabled]);

  const getMetrics = useCallback(() => {
    return microMeasurement.calculateBehaviorMetrics(employeeId);
  }, [employeeId]);

  const getScreenTimeMetrics = useCallback(() => {
    return microMeasurement.calculateScreenTimeMetrics();
  }, []);

  return {
    recordCustomEvent,
    getMetrics,
    getScreenTimeMetrics,
    isTracking,
    sessionDuration
  };
}
