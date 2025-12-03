import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Upload, File, Image, Video, Music, X, Download, Eye } from 'lucide-react';
import { FileService, FileMetadata } from '@/lib/file-service';
import { formatDateDMY } from '@/lib/date-utils';

interface FileUploadProps {
  taskId?: string;
  projectId?: string;
  userId: string;
  onFileUploaded?: (file: FileMetadata) => void;
}

export default function FileUpload({ taskId, projectId, userId, onFileUploaded }: FileUploadProps) {
  const [files, setFiles] = useState<FileMetadata[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [showFilesDialog, setShowFilesDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    loadFiles();
  }, [taskId, projectId]);

  const loadFiles = () => {
    const filters: Record<string, string> = {};
    if (taskId) filters.taskId = taskId;
    if (projectId) filters.projectId = projectId;
    
    const loadedFiles = FileService.getFiles(filters);
    setFiles(loadedFiles);
  };

  const handleFileSelect = (selectedFiles: FileList) => {
    Array.from(selectedFiles).forEach(uploadFile);
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    setUploadProgress(0);

    try {
      // محاكاة تقدم الرفع
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const uploadedFile = await FileService.uploadFile(file, userId, taskId, projectId);
      
      clearInterval(progressInterval);
      setUploadProgress(100);
      
      setTimeout(() => {
        setUploadProgress(0);
        setUploading(false);
        loadFiles();
        onFileUploaded?.(uploadedFile);
      }, 500);

    } catch (error) {
      console.error('خطأ في رفع الملف:', error);
      setUploading(false);
      setUploadProgress(0);
      alert(error instanceof Error ? error.message : 'حدث خطأ في رفع الملف');
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleDeleteFile = (fileId: string) => {
    const success = FileService.deleteFile(fileId, userId);
    if (success) {
      loadFiles();
    } else {
      alert('لا يمكن حذف هذا الملف');
    }
  };

  const getFileIcon = (category: string) => {
    switch (category) {
      case 'image': return <Image className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      case 'audio': return <Music className="h-4 w-4" />;
      default: return <File className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'image': return 'bg-green-100 text-green-800';
      case 'video': return 'bg-blue-100 text-blue-800';
      case 'audio': return 'bg-purple-100 text-purple-800';
      case 'document': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 بايت';
    const k = 1024;
    const sizes = ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4" dir="rtl">
      {/* Upload Area */}
      <Card
        className={`border-2 border-dashed transition-colors ${
          dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <CardContent className="p-6">
          <div className="text-center space-y-4">
            <Upload className="h-12 w-12 mx-auto text-gray-400" />
            <div>
              <h3 className="text-lg font-semibold">رفع الملفات</h3>
              <p className="text-gray-500">اسحب الملفات هنا أو انقر للاختيار</p>
            </div>
            
            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="w-full max-w-xs"
            >
              {uploading ? 'جاري الرفع...' : 'اختيار الملفات'}
            </Button>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={(e) => e.target.files && handleFileSelect(e.target.files)}
              accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.csv"
            />
            
            <p className="text-xs text-gray-400">
              الحد الأقصى: 10 ميجابايت لكل ملف
            </p>
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="mt-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span>جاري الرفع...</span>
                <span>{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Files List */}
      {files.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-semibold">الملفات المرفقة ({files.length})</h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilesDialog(true)}
              >
                عرض الكل
              </Button>
            </div>
            
            <div className="space-y-2">
              {files.slice(0, 3).map((file) => (
                <div key={file.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                  {getFileIcon(file.category)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)} • {formatDateDMY(file.uploadedAt)}
                    </p>
                  </div>
                  <Badge className={getCategoryColor(file.category)}>
                    {file.category}
                  </Badge>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Eye className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                      <Download className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                      onClick={() => handleDeleteFile(file.id)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {files.length > 3 && (
                <p className="text-sm text-gray-500 text-center">
                  و {files.length - 3} ملف آخر...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Files Dialog */}
      <Dialog open={showFilesDialog} onOpenChange={setShowFilesDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh]" dir="rtl">
          <DialogHeader>
            <DialogTitle>جميع الملفات المرفقة</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-2 overflow-y-auto">
            {files.map((file) => (
              <Card key={file.id}>
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    {/* Thumbnail or Icon */}
                    <div className="flex-shrink-0">
                      {file.thumbnail ? (
                        <img
                          src={file.thumbnail}
                          alt={file.name}
                          className="w-12 h-12 object-cover rounded"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                          {getFileIcon(file.category)}
                        </div>
                      )}
                    </div>
                    
                    {/* File Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{file.name}</h4>
                      <p className="text-sm text-gray-500">
                        {formatFileSize(file.size)} • {formatDateDMY(file.uploadedAt)}
                      </p>
                      <p className="text-xs text-gray-400">
                        رفع بواسطة: {file.uploadedBy}
                      </p>
                    </div>
                    
                    {/* Category Badge */}
                    <Badge className={getCategoryColor(file.category)}>
                      {file.category}
                    </Badge>
                    
                    {/* Actions */}
                    <div className="flex gap-1">
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4 ml-1" />
                        عرض
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 ml-1" />
                        تحميل
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-500 hover:text-red-700"
                        onClick={() => handleDeleteFile(file.id)}
                      >
                        <X className="h-4 w-4 ml-1" />
                        حذف
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}