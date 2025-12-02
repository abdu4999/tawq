import React, { createContext, useContext, useCallback, useRef } from 'react';

interface ScrollPosition {
  [key: string]: number;
}

interface ScrollContextType {
  saveScrollPosition: (key: string, position: number) => void;
  getScrollPosition: (key: string) => number | null;
  clearScrollPosition: (key: string) => void;
  clearAllScrollPositions: () => void;
}

const ScrollContext = createContext<ScrollContextType | undefined>(undefined);

export function ScrollProvider({ children }: { children: React.ReactNode }) {
  const scrollPositions = useRef<ScrollPosition>({});

  // حفظ موضع التمرير في الذاكرة وفي sessionStorage
  const saveScrollPosition = useCallback((key: string, position: number) => {
    scrollPositions.current[key] = position;
    sessionStorage.setItem(`scroll-${key}`, position.toString());
  }, []);

  // استرجاع موضع التمرير من الذاكرة أو sessionStorage
  const getScrollPosition = useCallback((key: string): number | null => {
    // محاولة الحصول من الذاكرة أولاً (أسرع)
    if (scrollPositions.current[key] !== undefined) {
      return scrollPositions.current[key];
    }

    // محاولة الحصول من sessionStorage
    const saved = sessionStorage.getItem(`scroll-${key}`);
    if (saved) {
      const position = parseInt(saved, 10);
      scrollPositions.current[key] = position; // حفظ في الذاكرة للوصول السريع
      return position;
    }

    return null;
  }, []);

  // مسح موضع التمرير لصفحة معينة
  const clearScrollPosition = useCallback((key: string) => {
    delete scrollPositions.current[key];
    sessionStorage.removeItem(`scroll-${key}`);
  }, []);

  // مسح جميع مواضع التمرير
  const clearAllScrollPositions = useCallback(() => {
    scrollPositions.current = {};
    
    // مسح جميع المفاتيح المتعلقة بالتمرير من sessionStorage
    Object.keys(sessionStorage).forEach(key => {
      if (key.startsWith('scroll-')) {
        sessionStorage.removeItem(key);
      }
    });
  }, []);

  return (
    <ScrollContext.Provider
      value={{
        saveScrollPosition,
        getScrollPosition,
        clearScrollPosition,
        clearAllScrollPositions,
      }}
    >
      {children}
    </ScrollContext.Provider>
  );
}

// Hook مخصص لاستخدام ScrollContext
export function useScrollContext() {
  const context = useContext(ScrollContext);
  if (!context) {
    throw new Error('useScrollContext must be used within ScrollProvider');
  }
  return context;
}

// Hook مخصص لحفظ واستعادة التمرير التلقائي
export function useScrollMemory(pageKey: string, contentRef: React.RefObject<HTMLElement>) {
  const { saveScrollPosition, getScrollPosition } = useScrollContext();
  const scrollTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  React.useEffect(() => {
    // استعادة موضع التمرير عند التحميل
    const savedPosition = getScrollPosition(pageKey);
    
    if (savedPosition !== null && contentRef.current) {
      // تأخير استعادة الموضع للتأكد من تحميل المحتوى
      const timer = setTimeout(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            if (contentRef.current) {
              contentRef.current.scrollTop = savedPosition;
              console.log(`✅ استعادة التمرير: ${pageKey} → ${savedPosition}px`);
            }
          });
        });
      }, 100);
      
      return () => clearTimeout(timer);
    } else {
      console.log(`📄 صفحة جديدة: ${pageKey} - البدء من الأعلى`);
    }
  }, [pageKey]);
    const handleScroll = () => {
      if (contentRef.current) {
        const position = contentRef.current.scrollTop;
        
        if (scrollTimeoutRef.current) {
          clearTimeout(scrollTimeoutRef.current);
        }
        
        scrollTimeoutRef.current = setTimeout(() => {
          saveScrollPosition(pageKey, position);
        }, 150);
      }
    };

    const element = contentRef.current;
    if (element) {
      element.addEventListener('scroll', handleScroll, { passive: true });
    }

    // حفظ الموضع قبل إلغاء التثبيت
    return () => {
      if (element) {
        element.removeEventListener('scroll', handleScroll);
      }
      
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
      
      if (contentRef.current) {
        const position = contentRef.current.scrollTop;
        saveScrollPosition(pageKey, position);
        console.log(`📍 حفظ نهائي: ${pageKey} → ${position}px`);
      }
    };
  }, [pageKey, contentRef, saveScrollPosition, getScrollPosition]);
}
