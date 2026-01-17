import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDateDMY } from '@/lib/date-utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { LoadingButton } from '@/components/ui/loading-button';
import { useNotifications } from '@/components/NotificationSystem';
import { handleApiError, showSuccessNotification } from '@/lib/error-handler';
import { supabaseAPI, Role, AdminUser } from '@/lib/supabaseClient';
import {
  Shield,
  Plus,
  Edit,
  Trash2,
  Users,
  Key,
  UserCheck,
  Search,
  Eye,
  Settings,
  Clock
} from 'lucide-react';

const PERMISSIONS = [
  { id: '1', name: 'إدارة المستخدمين', description: 'إضافة وتعديل وحذف المستخدمين' },
  { id: '2', name: 'إدارة المشاريع', description: 'إنشاء ومتابعة المشاريع' },
  { id: '3', name: 'إدارة المهام', description: 'تعيين ومتابعة المهام' },
  { id: '4', name: 'إدارة المشاهير', description: 'قاعدة بيانات المشاهير والمؤثرين' },
  { id: '5', name: 'النظام المحاسبي', description: 'إدارة الإيرادات والمصروفات' },
  { id: '6', name: 'التقارير والتحليلات', description: 'عرض التقارير والإحصائيات' },
  { id: '7', name: 'إدارة الصلاحيات', description: 'تعديل صلاحيات المستخدمين' },
  { id: '8', name: 'إعدادات النظام', description: 'تكوين إعدادات النظام العامة' },
  { id: '9', name: 'النسخ الاحتياطي', description: 'إنشاء واستعادة النسخ الاحتياطية' },
  { id: '10', name: 'السجلات والأنشطة', description: 'مراجعة سجلات النشاط' }
];

export default function AdminPermissions() {
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [roles, setRoles] = useState<Role[]>([]);
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'roles' | 'users'>('roles');
  const [isCreateRoleDialogOpen, setIsCreateRoleDialogOpen] = useState(false);
  const [isEditRoleDialogOpen, setIsEditRoleDialogOpen] = useState(false);
  const [isCreateUserDialogOpen, setIsCreateUserDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
    color: 'bg-blue-500'
  });
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    role_id: '',
    status: 'active' as const
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [rolesData, usersData] = await Promise.all([
        supabaseAPI.getRoles(),
        supabaseAPI.getAdminUsers()
      ]);
      setRoles(rolesData);
      setAdminUsers(usersData);
    } catch (error) {
      console.error('Error loading data:', error);
      addNotification({
        type: 'error',
        title: '❌ خطأ في تحميل البيانات',
        message: 'حدث خطأ أثناء تحميل البيانات من قاعدة البيانات'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = async () => {
    try {
      // Validation
      if (!newRole.name.trim()) {
        addNotification({
          type: 'warning',
          title: '⚠️ خطأ في البيانات',
          message: 'يرجى إدخال اسم الدور'
        });
        return;
      }

      setIsSaving(true);
      
      const roleData = {
        ...newRole,
        description: newRole.description || null
      };
      
      const createdRole = await supabaseAPI.createRole(roleData);
      setRoles([createdRole, ...roles]);
      
      // Reset form
      setNewRole({
        name: '',
        description: '',
        permissions: [],
        color: 'bg-blue-500'
      });
      setIsCreateRoleDialogOpen(false);

      // Success notification
      showSuccessNotification(
        'تم الحفظ بنجاح ✅',
        `تم إنشاء دور "${createdRole.name}" بنجاح`
      );
      
    } catch (error) {
      await handleApiError(error, {
        message: 'فشل في إنشاء الدور',
        context: 'AdminPermissions - CreateRole',
        severity: 'high',
        userFriendlyMessage: 'حدث خطأ أثناء إنشاء الدور',
        payload: newRole,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateUser = async () => {
    try {
      // Validation
      if (!newUser.name.trim() || !newUser.email.trim()) {
        addNotification({
          type: 'warning',
          title: '⚠️ خطأ في البيانات',
          message: 'يرجى إدخال الاسم والبريد الإلكتروني'
        });
        return;
      }

      setIsSaving(true);
      
      const userData = {
        ...newUser,
        phone: newUser.phone || null,
        role_id: newUser.role_id || null
      };
      
      const createdUser = await supabaseAPI.createAdminUser(userData);
      setAdminUsers([createdUser, ...adminUsers]);
      
      // Reset form
      setNewUser({
        name: '',
        email: '',
        phone: '',
        role_id: '',
        status: 'active'
      });
      setIsCreateUserDialogOpen(false);

      // Success notification
      showSuccessNotification(
        'تم الحفظ بنجاح ✅',
        `تم إضافة "${createdUser.name}" بنجاح`
      );
      
    } catch (error) {
      await handleApiError(error, {
        message: 'فشل في إضافة المستخدم',
        context: 'AdminPermissions - CreateUser',
        severity: 'high',
        userFriendlyMessage: 'حدث خطأ أثناء إضافة المستخدم',
        payload: newUser,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getRoleById = (roleId: string) => {
    return roles.find(role => role.id === roleId);
  };

  const getPermissionName = (permissionId: string) => {
    const permission = PERMISSIONS.find(p => p.id === permissionId);
    return permission ? permission.name : `صلاحية ${permissionId}`;
  };

  const filteredRoles = roles.filter(role => 
    role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredUsers = adminUsers.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
        <div className="flex items-center justify-center h-full min-h-[50vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">جاري تحميل بيانات الصلاحيات من قاعدة البيانات...</p>
          </div>
        </div>
    );
  }

  return (
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            إدارة الصلاحيات والمستخدمين
          </h1>
          <p className="text-xl text-gray-600">تحكم في صلاحيات النظام وإدارة المستخدمين</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-6 text-center">
              <Shield className="h-8 w-8 mx-auto mb-3 text-blue-200" />
              <div className="text-3xl font-bold mb-1">{roles.length}</div>
              <p className="text-blue-100">الأدوار</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 mx-auto mb-3 text-green-200" />
              <div className="text-3xl font-bold mb-1">{adminUsers.length}</div>
              <p className="text-green-100">المستخدمين</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-6 text-center">
              <UserCheck className="h-8 w-8 mx-auto mb-3 text-purple-200" />
              <div className="text-3xl font-bold mb-1">{adminUsers.filter(u => u.status === 'active').length}</div>
              <p className="text-purple-100">نشطون</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
            <CardContent className="p-6 text-center">
              <Key className="h-8 w-8 mx-auto mb-3 text-orange-200" />
              <div className="text-3xl font-bold mb-1">{PERMISSIONS.length}</div>
              <p className="text-orange-100">الصلاحيات</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => setActiveTab('roles')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'roles'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            الأدوار والصلاحيات
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'users'
                ? 'bg-white text-blue-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            المستخدمين
          </button>
        </div>

        {/* Controls */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder={activeTab === 'roles' ? 'البحث في الأدوار...' : 'البحث في المستخدمين...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-10"
                />
              </div>

              {activeTab === 'roles' ? (
                <Dialog open={isCreateRoleDialogOpen} onOpenChange={setIsCreateRoleDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600">
                      <Plus className="h-4 w-4 ml-2" />
                      إضافة دور جديد
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-lg">
                    <DialogHeader>
                      <DialogTitle>إضافة دور جديد</DialogTitle>
                      <DialogDescription>
                        إنشاء دور جديد مع تحديد الصلاحيات
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="role-name">اسم الدور</Label>
                        <Input
                          id="role-name"
                          value={newRole.name}
                          onChange={(e) => setNewRole({...newRole, name: e.target.value})}
                          placeholder="أدخل اسم الدور"
                        />
                      </div>
                      <div>
                        <Label htmlFor="role-description">الوصف</Label>
                        <Textarea
                          id="role-description"
                          value={newRole.description}
                          onChange={(e) => setNewRole({...newRole, description: e.target.value})}
                          placeholder="وصف الدور ومسؤولياته"
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="role-color">لون الدور</Label>
                        <Select value={newRole.color} onValueChange={(value) => setNewRole({...newRole, color: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="bg-blue-500">أزرق</SelectItem>
                            <SelectItem value="bg-green-500">أخضر</SelectItem>
                            <SelectItem value="bg-purple-500">بنفسجي</SelectItem>
                            <SelectItem value="bg-red-500">أحمر</SelectItem>
                            <SelectItem value="bg-yellow-500">أصفر</SelectItem>
                            <SelectItem value="bg-pink-500">وردي</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label>الصلاحيات</Label>
                        <div className="grid grid-cols-1 gap-3 mt-2 max-h-60 overflow-y-auto">
                          {PERMISSIONS.map(permission => (
                            <div key={permission.id} className="flex items-start space-x-2">
                              <Checkbox
                                id={`perm-${permission.id}`}
                                checked={newRole.permissions.includes(permission.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setNewRole({...newRole, permissions: [...newRole.permissions, permission.id]});
                                  } else {
                                    setNewRole({...newRole, permissions: newRole.permissions.filter(p => p !== permission.id)});
                                  }
                                }}
                              />
                              <div className="grid gap-1.5 leading-none">
                                <label
                                  htmlFor={`perm-${permission.id}`}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  {permission.name}
                                </label>
                                <p className="text-xs text-muted-foreground">
                                  {permission.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsCreateRoleDialogOpen(false)} disabled={isSaving}>
                        إلغاء
                      </Button>
                      <LoadingButton 
                        onClick={handleCreateRole}
                        loading={isSaving}
                        loadingText="جاري الحفظ..."
                        disabled={!newRole.name}
                      >
                        إنشاء الدور
                      </LoadingButton>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              ) : (
                <Dialog open={isCreateUserDialogOpen} onOpenChange={setIsCreateUserDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-green-500 to-blue-500 hover:from-green-600 hover:to-blue-600">
                      <Plus className="h-4 w-4 ml-2" />
                      إضافة مستخدم جديد
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>إضافة مستخدم جديد</DialogTitle>
                      <DialogDescription>
                        إضافة مستخدم جديد للنظام
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="user-name">الاسم الكامل</Label>
                        <Input
                          id="user-name"
                          value={newUser.name}
                          onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                          placeholder="أدخل الاسم الكامل"
                        />
                      </div>
                      <div>
                        <Label htmlFor="user-email">البريد الإلكتروني</Label>
                        <Input
                          id="user-email"
                          type="email"
                          value={newUser.email}
                          onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                          placeholder="user@example.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="user-phone">رقم الهاتف</Label>
                        <Input
                          id="user-phone"
                          value={newUser.phone}
                          onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                          placeholder="+966501234567"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="user-role">الدور</Label>
                          <Select
                            value={newUser.role_id || 'none'}
                            onValueChange={(value) =>
                              setNewUser({ ...newUser, role_id: value === 'none' ? '' : value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="اختر الدور" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">بدون دور</SelectItem>
                              {roles.map(role => (
                                <SelectItem key={role.id} value={role.id}>
                                  {role.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="user-status">الحالة</Label>
                          <Select value={newUser.status} onValueChange={(value: AdminUser['status']) => setNewUser({...newUser, status: value})}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">نشط</SelectItem>
                              <SelectItem value="inactive">غير نشط</SelectItem>
                              <SelectItem value="suspended">معلق</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsCreateUserDialogOpen(false)} disabled={isSaving}>
                        إلغاء
                      </Button>
                      <LoadingButton 
                        onClick={handleCreateUser}
                        loading={isSaving}
                        loadingText="جاري الحفظ..."
                        disabled={!newUser.name || !newUser.email}
                      >
                        إضافة المستخدم
                      </LoadingButton>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Content */}
        {activeTab === 'roles' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRoles.map((role) => (
              <Card key={role.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 ${role.color} rounded-lg`}>
                        <Shield className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{role.name}</CardTitle>
                        <CardDescription className="text-sm">
                          {role.permissions.length} صلاحية
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {role.description && (
                    <p className="text-gray-600 text-sm line-clamp-2">{role.description}</p>
                  )}
                  
                  <div>
                    <h4 className="text-sm font-medium mb-2">الصلاحيات:</h4>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.slice(0, 3).map(permId => (
                        <Badge key={permId} variant="outline" className="text-xs">
                          {getPermissionName(permId)}
                        </Badge>
                      ))}
                      {role.permissions.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{role.permissions.length - 3} أخرى
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-xs text-gray-500 mt-4">
                      أنشئ: {formatDateDMY(role.created_at)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          addNotification({
                            type: 'info',
                            title: '👁️ عرض الدور',
                            message: `عرض تفاصيل دور: ${role.name}`
                          });
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedRole(role);
                          setIsEditRoleDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredUsers.map((user) => {
              const userRole = user.role_id ? getRoleById(user.role_id) : null;
              
              return (
                <Card key={user.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <Users className="h-6 w-6 text-blue-600" />
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-semibold text-lg">{user.name}</h3>
                            <Badge className={
                              user.status === 'active' ? 'bg-green-100 text-green-800' :
                              user.status === 'inactive' ? 'bg-gray-100 text-gray-800' :
                              'bg-red-100 text-red-800'
                            }>
                              {user.status === 'active' ? 'نشط' :
                               user.status === 'inactive' ? 'غير نشط' : 'معلق'}
                            </Badge>
                            {userRole && (
                              <Badge className={`${userRole.color} text-white`}>
                                {userRole.name}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>{user.email}</span>
                            {user.phone && <span>{user.phone}</span>}
                            {user.last_login && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>آخر دخول: {formatDateDMY(user.last_login)}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            addNotification({
                              type: 'info',
                              title: '👁️ عرض المستخدم',
                              message: `عرض ملف ${user.name} الشخصي`
                            });
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedUser(user);
                            setIsEditUserDialogOpen(true);
                          }}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

            {filteredUsers.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Users className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-semibold mb-2 text-gray-600">لا توجد مستخدمين</h3>
                  <p className="text-gray-500 mb-4">
                    {searchQuery 
                      ? 'لا توجد مستخدمين تطابق معايير البحث' 
                      : 'لم يتم إضافة أي مستخدمين بعد'}
                  </p>
                  <Button onClick={() => setIsCreateUserDialogOpen(true)}>
                    <Plus className="h-4 w-4 ml-2" />
                    إضافة أول مستخدم
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
  );
}