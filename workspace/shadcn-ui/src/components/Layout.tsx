import React, { useRef, useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import { useScrollMemory } from '@/contexts/ScrollContext';

interface LayoutProps {
  children: React.ReactNode;
  pageKey?: string; // مفتاح فريد لكل صفحة للحفاظ على موضع التمرير
}

export default function Layout({ children, pageKey }: LayoutProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [sidebarWidth, setSidebarWidth] = useState(320); // العرض الافتراضي للسايدبار
  const location = useLocation();
  
  // استخدام pathname كمفتاح افتراضي إذا لم يتم تمرير pageKey
  const scrollKey = pageKey || location.pathname;
  
  // استخدام Hook المخصص لإدارة التمرير
  useScrollMemory(scrollKey, contentRef);

  // مراقبة تغيير عرض الـ sidebar مع transition سلس
  useEffect(() => {
    const updateSidebarWidth = () => {
      const sidebar = document.querySelector('[class*="right-0"][class*="top-0"][class*="fixed"]');
      if (sidebar) {
        const width = sidebar.getBoundingClientRect().width;
        setSidebarWidth(width);
      }
    };

    // تحديث فوري
    updateSidebarWidth();

    // مراقبة التغييرات
    const observer = new MutationObserver(updateSidebarWidth);
    const sidebar = document.querySelector('[class*="right-0"][class*="top-0"][class*="fixed"]');
    
    if (sidebar) {
      observer.observe(sidebar, { 
        attributes: true, 
        attributeFilter: ['class', 'style'],
        subtree: true 
      });
    }

    // مراقبة تغيير حجم النافذة
    window.addEventListener('resize', updateSidebarWidth);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateSidebarWidth);
    };
  }, []);

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex overflow-hidden" dir="rtl">
      <Sidebar />
      
      {/* Main content area - يتكيف مع عرض الـ sidebar */}
      <div 
        ref={contentRef}
        className="flex-1 overflow-y-auto transition-all duration-300"
        style={{ 
          marginRight: `${sidebarWidth}px`,
          height: '100vh'
        }}
      >
        <div className="p-6 min-h-full">
          {children}
        </div>
      </div>
    </div>
  );
}
