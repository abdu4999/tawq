import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Input } from '@/components/ui/input';
import { useStore } from '@/lib/store';
import { useNotifications } from '@/components/NotificationSystem';
import {
  Bell,
  Search,
  Settings,
  User,
  LogOut,
  Moon,
  Sun,
  Trophy,
  Crown,
  Star,
  Menu,
  Home,
  FolderOpen,
  CheckSquare,
  BarChart3,
  Calculator,
  GraduationCap,
  Brain,
  Gamepad2,
  Heart
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Header() {
  const { currentUser } = useStore();
  const { addNotification } = useNotifications();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Mock user data - في التطبيق الحقيقي سيأتي من قاعدة البيانات
  const userData = {
    name: currentUser?.name || 'أحمد محمد',
    email: currentUser?.email || 'ahmed@charity.org',
    role: currentUser?.role || 'مدير المشاريع',
    avatar: '/api/placeholder/40/40',
    points: 2450,
    level: 'خبير',
    rank: 3,
    notifications: 5
  };

  const navigationItems = [
    { path: '/dashboard', label: 'لوحة التحكم', icon: Home },
    { path: '/tasks', label: 'إدارة المهام', icon: CheckSquare },
    { path: '/projects', label: 'إدارة المشاريع', icon: FolderOpen },
    { path: '/celebrities', label: 'إدارة المشاهير', icon: Star },
    { path: '/analytics', label: 'التحليلات', icon: BarChart3 },
    { path: '/ai-analytics', label: 'التحليلات الذكية', icon: Brain },
    { path: '/gamification', label: 'النقاط والتحفيز', icon: Gamepad2 },
    { path: '/training-platform', label: 'منصة التدريب', icon: GraduationCap },
    { path: '/accounting', label: 'النظام المحاسبي', icon: Calculator },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      addNotification({
        type: 'info',
        title: '🔍 البحث',
        message: `البحث عن: "${searchQuery}"`,
        duration: 3000
      });
    }
  };

  const handleThemeToggle = () => {
    setIsDarkMode(!isDarkMode);
    addNotification({
      type: 'info',
      title: isDarkMode ? '☀️ الوضع النهاري' : '🌙 الوضع الليلي',
      message: `تم تفعيل ${isDarkMode ? 'الوضع النهاري' : 'الوضع الليلي'}`,
      duration: 2000
    });
  };

  const handleNotificationClick = () => {
    addNotification({
      type: 'info',
      title: '🔔 الإشعارات',
      message: `لديك ${userData.notifications} إشعارات جديدة`,
      duration: 4000,
      action: {
        label: 'عرض الكل',
        onClick: () => {
          addNotification({
            type: 'success',
            title: '📋 جميع الإشعارات',
            message: 'تم عرض جميع الإشعارات'
          });
        }
      }
    });
  };

  const handleProfileClick = () => {
    addNotification({
      type: 'info',
      title: '👤 الملف الشخصي',
      message: 'عرض الملف الشخصي',
      duration: 3000
    });
  };

  const handleLogout = () => {
    addNotification({
      type: 'warning',
      title: '👋 تسجيل الخروج',
      message: 'تم تسجيل الخروج بنجاح',
      duration: 3000,
      action: {
        label: 'تراجع',
        onClick: () => {
          addNotification({
            type: 'info',
            title: '↩️ تم الإلغاء',
            message: 'تم إلغاء تسجيل الخروج'
          });
        }
      }
    });
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'خبير': return 'bg-purple-100 text-purple-800';
      case 'متقدم': return 'bg-blue-100 text-blue-800';
      case 'متوسط': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank <= 3) return <Crown className="h-4 w-4 text-yellow-500" />;
    if (rank <= 10) return <Trophy className="h-4 w-4 text-orange-500" />;
    return <Star className="h-4 w-4 text-gray-500" />;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60" dir="rtl">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <div className="hidden md:block">
                <h1 className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  نظام إدارة الأعمال الخيرية
                </h1>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-md mx-8">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="البحث في النظام..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10 bg-gray-50 border-gray-200 focus:bg-white"
                />
              </div>
            </form>
          </div>

          {/* Right Side - User Actions */}
          <div className="flex items-center gap-3">
            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetHeader>
                  <SheetTitle className="text-right">القائمة الرئيسية</SheetTitle>
                  <SheetDescription className="text-right">
                    التنقل بين أقسام النظام
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-6 space-y-2">
                  {navigationItems.map((item) => (
                    <Button
                      key={item.path}
                      variant={location.pathname === item.path ? "default" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => navigate(item.path)}
                    >
                      <item.icon className="h-4 w-4 ml-2" />
                      {item.label}
                    </Button>
                  ))}
                </div>
              </SheetContent>
            </Sheet>

            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleThemeToggle}
              className="hidden md:flex"
            >
              {isDarkMode ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
            </Button>

            {/* Notifications */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNotificationClick}
              className="relative"
            >
              <Bell className="h-5 w-5" />
              {userData.notifications > 0 && (
                <Badge className="absolute -top-1 -left-1 h-5 w-5 p-0 flex items-center justify-center bg-red-500 text-white text-xs">
                  {userData.notifications}
                </Badge>
              )}
            </Button>

            {/* User Points (Hidden on mobile) */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-full border border-yellow-200">
              <Trophy className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-semibold text-yellow-700">
                {userData.points.toLocaleString()}
              </span>
            </div>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={userData.avatar} alt={userData.name} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                      {userData.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -left-1">
                    {getRankIcon(userData.rank)}
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-80" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-3 p-2">
                    {/* User Info */}
                    <div className="flex items-center gap-3">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={userData.avatar} alt={userData.name} />
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                          {userData.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-right">
                        <p className="text-sm font-medium leading-none">{userData.name}</p>
                        <p className="text-xs leading-none text-muted-foreground mt-1">
                          {userData.email}
                        </p>
                        <p className="text-xs text-blue-600 mt-1">{userData.role}</p>
                      </div>
                    </div>

                    {/* User Stats */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t">
                      <div className="text-center">
                        <div className="text-lg font-bold text-yellow-600">
                          {userData.points.toLocaleString()}
                        </div>
                        <div className="text-xs text-gray-500">النقاط</div>
                      </div>
                      <div className="text-center">
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-lg font-bold text-purple-600">#{userData.rank}</span>
                          {getRankIcon(userData.rank)}
                        </div>
                        <div className="text-xs text-gray-500">الترتيب</div>
                      </div>
                      <div className="text-center">
                        <Badge className={getLevelColor(userData.level)} variant="secondary">
                          {userData.level}
                        </Badge>
                        <div className="text-xs text-gray-500 mt-1">المستوى</div>
                      </div>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleProfileClick} className="cursor-pointer">
                  <User className="mr-2 h-4 w-4" />
                  <span>الملف الشخصي</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>الإعدادات</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/gamification')} className="cursor-pointer">
                  <Trophy className="mr-2 h-4 w-4" />
                  <span>النقاط والإنجازات</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>تسجيل الخروج</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}