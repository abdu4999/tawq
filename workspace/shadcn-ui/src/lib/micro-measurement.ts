/**
 * MICRO MEASUREMENT ENGINE
 * نظام قياس الفعل الدقيق - يقيس كل حركة صغيرة داخل النظام
 */

export interface MicroEvent {
  id: string;
  sessionId: string;
  employeeId: string;
  employeeName: string;
  eventType: 'click' | 'input' | 'focus' | 'blur' | 'scroll' | 'navigation' | 'keypress';
  timestamp: Date;
  screenName: string;
  elementId?: string;
  elementType?: string;
  elementText?: string;
  duration?: number; // للأحداث التي لها مدة (focus)
  metadata?: Record<string, any>;
}

export interface MicroSession {
  id: string;
  employeeId: string;
  employeeName: string;
  startTime: Date;
  endTime?: Date;
  totalEvents: number;
  screens: string[];
  duration?: number;
}

export interface ScreenTimeMetric {
  screenName: string;
  totalTime: number; // بالميلي ثانية
  focusTime: number; // وقت التركيز الفعلي
  blurTime: number; // وقت عدم التركيز
  visits: number;
  lastVisit: Date;
}

export interface BehaviorMetrics {
  employeeId: string;
  clicksPerMinute: number;
  averageTimePerScreen: number;
  focusScore: number; // 0-100
  distractionScore: number; // 0-100
  navigationSpeed: number;
  inputSpeed: number; // characters per minute
  totalScreens: number;
  mostVisitedScreen: string;
  leastVisitedScreen: string;
}

class MicroMeasurementEngine {
  private events: MicroEvent[] = [];
  private currentSession: MicroSession | null = null;
  private screenStartTimes: Map<string, Date> = new Map();
  private focusStartTime: Date | null = null;
  private batchSize = 10; // إرسال كل 10 أحداث
  private batchInterval = 5000; // أو كل 5 ثوانٍ
  private batchTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.initializeListeners();
  }

  /**
   * بدء جلسة جديدة
   */
  startSession(employeeId: string, employeeName: string): string {
    const sessionId = `session_${Date.now()}_${employeeId}`;
    this.currentSession = {
      id: sessionId,
      employeeId,
      employeeName,
      startTime: new Date(),
      totalEvents: 0,
      screens: []
    };

    // حفظ في localStorage
    localStorage.setItem('currentMicroSession', JSON.stringify(this.currentSession));
    
    // بدء مؤقت الإرسال التلقائي
    this.startBatchTimer();

    return sessionId;
  }

  /**
   * إنهاء الجلسة الحالية
   */
  endSession(): void {
    if (this.currentSession) {
      this.currentSession.endTime = new Date();
      this.currentSession.duration = this.currentSession.endTime.getTime() - this.currentSession.startTime.getTime();
      
      // إرسال آخر الأحداث
      this.sendBatch();
      
      // حفظ الجلسة
      this.saveSessions([this.currentSession]);
      
      // مسح الجلسة الحالية
      localStorage.removeItem('currentMicroSession');
      this.currentSession = null;
    }

    if (this.batchTimer) {
      clearInterval(this.batchTimer);
      this.batchTimer = null;
    }
  }

  /**
   * تسجيل حدث جديد
   */
  recordEvent(event: Omit<MicroEvent, 'id' | 'timestamp' | 'sessionId' | 'employeeId' | 'employeeName'>): void {
    if (!this.currentSession) {
      console.warn('No active session. Event not recorded.');
      return;
    }

    const microEvent: MicroEvent = {
      id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      sessionId: this.currentSession.id,
      employeeId: this.currentSession.employeeId,
      employeeName: this.currentSession.employeeName,
      timestamp: new Date(),
      ...event
    };

    this.events.push(microEvent);
    this.currentSession.totalEvents++;

    // إضافة الشاشة للقائمة إذا لم تكن موجودة
    if (!this.currentSession.screens.includes(event.screenName)) {
      this.currentSession.screens.push(event.screenName);
    }

    // إرسال دفعة إذا وصلنا للحد
    if (this.events.length >= this.batchSize) {
      this.sendBatch();
    }
  }

  /**
   * تسجيل وقت دخول الشاشة
   */
  enterScreen(screenName: string): void {
    this.screenStartTimes.set(screenName, new Date());
    this.recordEvent({
      eventType: 'navigation',
      screenName,
      metadata: { action: 'enter' }
    });
  }

  /**
   * تسجيل وقت مغادرة الشاشة
   */
  leaveScreen(screenName: string): void {
    const startTime = this.screenStartTimes.get(screenName);
    if (startTime) {
      const duration = Date.now() - startTime.getTime();
      this.recordEvent({
        eventType: 'navigation',
        screenName,
        duration,
        metadata: { action: 'leave', timeSpent: duration }
      });
      this.screenStartTimes.delete(screenName);
    }
  }

  /**
   * تسجيل التركيز على الشاشة
   */
  onFocus(screenName: string): void {
    this.focusStartTime = new Date();
    this.recordEvent({
      eventType: 'focus',
      screenName
    });
  }

  /**
   * تسجيل فقدان التركيز
   */
  onBlur(screenName: string): void {
    if (this.focusStartTime) {
      const duration = Date.now() - this.focusStartTime.getTime();
      this.recordEvent({
        eventType: 'blur',
        screenName,
        duration,
        metadata: { focusDuration: duration }
      });
      this.focusStartTime = null;
    }
  }

  /**
   * حساب وقت التواجد في كل شاشة
   */
  calculateScreenTimeMetrics(): ScreenTimeMetric[] {
    const screenMetrics = new Map<string, ScreenTimeMetric>();

    this.events.forEach(event => {
      if (!screenMetrics.has(event.screenName)) {
        screenMetrics.set(event.screenName, {
          screenName: event.screenName,
          totalTime: 0,
          focusTime: 0,
          blurTime: 0,
          visits: 0,
          lastVisit: event.timestamp
        });
      }

      const metric = screenMetrics.get(event.screenName)!;

      if (event.eventType === 'navigation' && event.metadata?.action === 'enter') {
        metric.visits++;
        metric.lastVisit = event.timestamp;
      }

      if (event.eventType === 'navigation' && event.metadata?.action === 'leave' && event.duration) {
        metric.totalTime += event.duration;
      }

      if (event.eventType === 'blur' && event.duration) {
        metric.focusTime += event.duration;
      }
    });

    return Array.from(screenMetrics.values());
  }

  /**
   * حساب مقاييس السلوك
   */
  calculateBehaviorMetrics(employeeId: string): BehaviorMetrics | null {
    const employeeEvents = this.events.filter(e => e.employeeId === employeeId);
    
    if (employeeEvents.length === 0) return null;

    const sessionDuration = this.currentSession?.duration || 
      (Date.now() - this.currentSession!.startTime.getTime());
    
    const minutesElapsed = sessionDuration / 60000;
    
    const clickEvents = employeeEvents.filter(e => e.eventType === 'click');
    const inputEvents = employeeEvents.filter(e => e.eventType === 'input' || e.eventType === 'keypress');
    const focusEvents = employeeEvents.filter(e => e.eventType === 'focus');
    const blurEvents = employeeEvents.filter(e => e.eventType === 'blur');

    const totalFocusTime = focusEvents.reduce((sum, e) => sum + (e.duration || 0), 0);
    const totalBlurTime = blurEvents.reduce((sum, e) => sum + (e.duration || 0), 0);
    
    const focusScore = totalFocusTime / (totalFocusTime + totalBlurTime) * 100 || 0;
    const distractionScore = 100 - focusScore;

    const screenTimes = this.calculateScreenTimeMetrics();
    const averageTimePerScreen = screenTimes.length > 0
      ? screenTimes.reduce((sum, s) => sum + s.totalTime, 0) / screenTimes.length / 1000
      : 0;

    const sortedScreens = screenTimes.sort((a, b) => b.visits - a.visits);

    return {
      employeeId,
      clicksPerMinute: clickEvents.length / minutesElapsed,
      averageTimePerScreen,
      focusScore: Math.round(focusScore),
      distractionScore: Math.round(distractionScore),
      navigationSpeed: (this.currentSession?.screens.length || 0) / minutesElapsed,
      inputSpeed: inputEvents.length / minutesElapsed,
      totalScreens: this.currentSession?.screens.length || 0,
      mostVisitedScreen: sortedScreens[0]?.screenName || '',
      leastVisitedScreen: sortedScreens[sortedScreens.length - 1]?.screenName || ''
    };
  }

  /**
   * تهيئة المستمعين للأحداث
   */
  private initializeListeners(): void {
    // سيتم تفعيلها من خلال المكون الرئيسي
  }

  /**
   * بدء مؤقت الإرسال التلقائي
   */
  private startBatchTimer(): void {
    if (this.batchTimer) {
      clearInterval(this.batchTimer);
    }

    this.batchTimer = setInterval(() => {
      if (this.events.length > 0) {
        this.sendBatch();
      }
    }, this.batchInterval);
  }

  /**
   * إرسال دفعة الأحداث
   */
  private async sendBatch(): Promise<void> {
    if (this.events.length === 0) return;

    const batch = [...this.events];
    this.events = [];

    try {
      // حفظ في localStorage مؤقتاً
      const existingEvents = this.getStoredEvents();
      const allEvents = [...existingEvents, ...batch];
      localStorage.setItem('microEvents', JSON.stringify(allEvents.slice(-1000))); // آخر 1000 حدث

      // هنا يمكن إرسال إلى API
      // await fetch('/api/micro-events', {
      //   method: 'POST',
      //   body: JSON.stringify(batch)
      // });

      console.log(`📊 Micro Measurement: Sent batch of ${batch.length} events`);
    } catch (error) {
      console.error('Failed to send micro events batch:', error);
      // إعادة الأحداث للقائمة في حالة الفشل
      this.events.unshift(...batch);
    }
  }

  /**
   * حفظ الجلسات
   */
  private saveSessions(sessions: MicroSession[]): void {
    const existingSessions = this.getStoredSessions();
    const allSessions = [...existingSessions, ...sessions];
    localStorage.setItem('microSessions', JSON.stringify(allSessions.slice(-100))); // آخر 100 جلسة
  }

  /**
   * استرجاع الأحداث المخزنة
   */
  getStoredEvents(): MicroEvent[] {
    try {
      const stored = localStorage.getItem('microEvents');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  /**
   * استرجاع الجلسات المخزنة
   */
  getStoredSessions(): MicroSession[] {
    try {
      const stored = localStorage.getItem('microSessions');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  /**
   * مسح جميع البيانات
   */
  clearAllData(): void {
    this.events = [];
    this.screenStartTimes.clear();
    this.focusStartTime = null;
    localStorage.removeItem('microEvents');
    localStorage.removeItem('microSessions');
    localStorage.removeItem('currentMicroSession');
  }
}

// Singleton instance
export const microMeasurement = new MicroMeasurementEngine();
