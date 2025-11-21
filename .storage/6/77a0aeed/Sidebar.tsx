import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  CheckSquare,
  FolderOpen,
  Star,
  BarChart3,
  Calculator,
  Users,
  Settings,
  Bell,
  User,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Brain,
  GraduationCap,
  Gamepad2,
  Shield,
  AlertTriangle
} from 'lucide-react';

const navigationItems = [
  { path: '/', icon: Home, label: 'لوحة التحكم', badge: null },
  { path: '/tasks', icon: CheckSquare, label: 'إدارة المهام', badge: '12' },
  { path: '/projects', icon: FolderOpen, label: 'إدارة المشاريع', badge: '5' },
  { path: '/celebrities', icon: Star, label: 'إدارة المشاهير', badge: null },
  { path: '/analytics', icon: BarChart3, label: 'التحليلات والتقارير', badge: null },
  { path: '/ai-analytics', icon: Brain, label: 'التحليلات الذكية', badge: 'AI' },
  { path: '/training-platform', icon: GraduationCap, label: 'منصة التدريب', badge: null },
  { path: '/gamification', icon: Gamepad2, label: 'النقاط والتحفيز', badge: '🏆' },
  { path: '/accounting', icon: Calculator, label: 'النظام المحاسبي', badge: null },
  { path: '/admin-permissions', icon: Shield, label: 'إدارة الصلاحيات', badge: null },
  { path: '/error-management', icon: AlertTriangle, label: 'إدارة الأخطاء', badge: null }
];

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleNavigation = (path: string, label: string) => {
    navigate(path);
  };

  const handleNotifications = () => {
    navigate('/notifications');
  };

  const handleProfile = () => {
    navigate('/profile');
  };

  const handleSettings = () => {
    navigate('/settings');
  };

  const handleLogout = () => {
    navigate('/login');
  };

  const unreadCount = 5; // Mock unread notifications count

  return (
    <TooltipProvider>
      <div className={`fixed right-0 top-0 h-full bg-white shadow-xl border-l border-gray-200 transition-all duration-300 z-50 ${
        isCollapsed ? 'w-16' : 'w-80'
      }`}>
        {/* Toggle Button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute -left-3 top-6 bg-white shadow-md rounded-full p-1 h-6 w-6 z-50"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          {isCollapsed ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>

        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-4 border-b border-gray-200">
            {!isCollapsed ? (
              <div className="text-center">
                <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  نظام إدارة الجمعية
                </h2>
                <p className="text-sm text-gray-600 mt-1">لوحة التحكم الشاملة</p>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg mx-auto"></div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="p-4 border-b border-gray-200">
            {!isCollapsed ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                      أم
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">أحمد محمد</h3>
                    <p className="text-sm text-gray-600">مدير النظام</p>
                    <Badge className="bg-green-100 text-green-800 text-xs mt-1">
                      متصل الآن
                    </Badge>
                  </div>
                </div>
                
                {/* User Actions - Compact Icons */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 relative"
                        onClick={handleNotifications}
                      >
                        <Bell className="h-4 w-4" />
                        {unreadCount > 0 && (
                          <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                            {unreadCount}
                          </Badge>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      <p>الإشعارات ({unreadCount} جديد)</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={handleProfile}
                      >
                        <User className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      <p>الملف الشخصي</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={handleSettings}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      <p>الإعدادات</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={handleLogout}
                      >
                        <LogOut className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      <p>تسجيل الخروج</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex justify-center">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold text-sm">
                      أم
                    </AvatarFallback>
                  </Avatar>
                </div>
                
                {/* Collapsed User Actions */}
                <div className="space-y-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full h-8 p-0 relative"
                        onClick={handleNotifications}
                      >
                        <Bell className="h-4 w-4" />
                        {unreadCount > 0 && (
                          <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                            {unreadCount}
                          </Badge>
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      <p>الإشعارات ({unreadCount} جديد)</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full h-8 p-0"
                        onClick={handleProfile}
                      >
                        <User className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      <p>الملف الشخصي</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full h-8 p-0"
                        onClick={handleSettings}
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      <p>الإعدادات</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full h-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={handleLogout}
                      >
                        <LogOut className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      <p>تسجيل الخروج</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Tooltip key={item.path}>
                  <TooltipTrigger asChild>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={`w-full justify-start h-12 ${
                        isActive 
                          ? 'bg-blue-500 text-white shadow-md' 
                          : 'hover:bg-gray-100 text-gray-700'
                      } ${isCollapsed ? 'px-2' : 'px-4'}`}
                      onClick={() => handleNavigation(item.path, item.label)}
                    >
                      <item.icon className={`h-5 w-5 ${isCollapsed ? '' : 'ml-3'}`} />
                      {!isCollapsed && (
                        <>
                          <span className="flex-1 text-right">{item.label}</span>
                          {item.badge && (
                            <Badge 
                              variant={isActive ? "secondary" : "outline"}
                              className="text-xs"
                            >
                              {item.badge}
                            </Badge>
                          )}
                        </>
                      )}
                    </Button>
                  </TooltipTrigger>
                  {isCollapsed && (
                    <TooltipContent side="left">
                      <p>{item.label}</p>
                    </TooltipContent>
                  )}
                </Tooltip>
              );
            })}
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}