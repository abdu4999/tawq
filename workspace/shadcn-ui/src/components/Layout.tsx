import React, { useRef, useEffect, useState } from 'react';
import Sidebar from './Sidebar';

interface LayoutProps {
  children: React.ReactNode;
  pageKey?: string; // مفتاح فريد لكل صفحة للحفاظ على موضع التمرير
}

export default function Layout({ children, pageKey = 'default' }: LayoutProps) {
  const contentRef = useRef<HTMLDivElement>(null);
  const [sidebarWidth, setSidebarWidth] = useState(320); // العرض الافتراضي للسايدبار

  // استعادة موضع التمرير عند تحميل الصفحة
  useEffect(() => {
    const savedScrollPosition = sessionStorage.getItem(`scroll-${pageKey}`);
    if (savedScrollPosition && contentRef.current) {
      setTimeout(() => {
        if (contentRef.current) {
          contentRef.current.scrollTop = parseInt(savedScrollPosition, 10);
        }
      }, 0);
    }
  }, [pageKey]);

  // حفظ موضع التمرير عند التمرير
  useEffect(() => {
    const handleScroll = () => {
      if (contentRef.current) {
        const position = contentRef.current.scrollTop;
        sessionStorage.setItem(`scroll-${pageKey}`, position.toString());
      }
    };

    const contentElement = contentRef.current;
    if (contentElement) {
      contentElement.addEventListener('scroll', handleScroll);
      return () => contentElement.removeEventListener('scroll', handleScroll);
    }
  }, [pageKey]);

  // مراقبة تغيير عرض الـ sidebar
  useEffect(() => {
    const observer = new MutationObserver(() => {
      const sidebar = document.querySelector('[class*="right-0"][class*="top-0"]');
      if (sidebar) {
        const width = sidebar.getBoundingClientRect().width;
        setSidebarWidth(width);
      }
    });

    const sidebar = document.querySelector('[class*="right-0"][class*="top-0"]');
    if (sidebar) {
      observer.observe(sidebar, { attributes: true, attributeFilter: ['class'] });
      setSidebarWidth(sidebar.getBoundingClientRect().width);
    }

    return () => observer.disconnect();
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
