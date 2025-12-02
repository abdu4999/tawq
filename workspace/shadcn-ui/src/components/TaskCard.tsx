import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Task, Employee } from '@/lib/types';
import { useStore } from '@/lib/store';
import { Clock, User, Target, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
import { formatDateDMY } from '@/lib/date-utils';

interface TaskCardProps {
  task: Task;
}

export default function TaskCard({ task }: TaskCardProps) {
  const { employees, updateTask } = useStore();
  
  const assignee = employees.find(emp => emp.id === task.assigneeId);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500 text-white';
      case 'in-progress': return 'bg-blue-500 text-white';
      case 'pending': return 'bg-yellow-500 text-white';
      case 'cancelled': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'مكتملة';
      case 'in-progress': return 'قيد التنفيذ';
      case 'pending': return 'في الانتظار';
      case 'cancelled': return 'ملغية';
      default: return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return 'عالية';
      case 'medium': return 'متوسطة';
      case 'low': return 'منخفضة';
      default: return priority;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'in-progress': return <Target className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'cancelled': return <AlertCircle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const isOverdue = task.status !== 'completed' && new Date(task.dueDate) < new Date();
  const daysUntilDue = Math.ceil((new Date(task.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));

  const handleStatusChange = (newStatus: Task['status']) => {
    const updates: Partial<Task> = { status: newStatus };
    if (newStatus === 'completed' && !task.completedAt) {
      updates.completedAt = new Date();
    }
    updateTask(task.id, updates);
  };

  return (
    <Card className={`hover:shadow-lg transition-shadow ${isOverdue ? 'border-red-200 bg-red-50/30' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{task.title}</CardTitle>
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={getStatusColor(task.status)}>
                {getStatusIcon(task.status)}
                <span className="mr-1">{getStatusText(task.status)}</span>
              </Badge>
              <Badge variant="outline" className={getPriorityColor(task.priority)}>
                {getPriorityText(task.priority)}
              </Badge>
              <Badge variant="outline">
                {task.points} نقطة
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-gray-600 text-sm line-clamp-2">{task.description}</p>

        {/* Assignee */}
        {assignee && (
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-gray-500" />
            <Avatar className="h-6 w-6">
              <AvatarImage src={assignee.avatar} />
              <AvatarFallback className="text-xs">{assignee.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-sm text-gray-600">{assignee.name}</span>
          </div>
        )}

        {/* Due Date */}
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span className={`text-sm ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
            {isOverdue 
              ? `متأخرة بـ ${Math.abs(daysUntilDue)} يوم`
              : daysUntilDue === 0 
                ? 'مستحقة اليوم'
                : daysUntilDue > 0 
                  ? `${daysUntilDue} يوم متبقي`
                  : 'انتهت المهلة'
            }
          </span>
        </div>

        {/* Category and Tags */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">الفئة:</span>
            <Badge variant="secondary" className="text-xs">{task.category}</Badge>
          </div>
          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {task.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Progress for in-progress tasks */}
        {task.status === 'in-progress' && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>التقدم</span>
              <span>65%</span>
            </div>
            <Progress value={65} className="h-2" />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {task.status === 'pending' && (
            <Button 
              size="sm" 
              onClick={() => handleStatusChange('in-progress')}
              className="flex-1"
            >
              بدء العمل
            </Button>
          )}
          {task.status === 'in-progress' && (
            <Button 
              size="sm" 
              onClick={() => handleStatusChange('completed')}
              className="flex-1 bg-green-600 hover:bg-green-700"
            >
              إكمال المهمة
            </Button>
          )}
          {task.status !== 'completed' && (
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleStatusChange('cancelled')}
            >
              إلغاء
            </Button>
          )}
        </div>

        {/* Completion Info */}
        {task.status === 'completed' && task.completedAt && (
          <div className="text-xs text-green-600 bg-green-50 p-2 rounded">
            ✅ تم الإكمال في: {formatDateDMY(task.completedAt)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}