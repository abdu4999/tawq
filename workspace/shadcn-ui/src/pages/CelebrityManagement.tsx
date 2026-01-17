import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { LoadingButton } from '@/components/ui/loading-button';
import { useNotifications } from '@/components/NotificationSystem';
import { useAuth } from '@/components/AuthProvider';
import { handleApiError, showSuccessNotification } from '@/lib/error-handler';
import { supabaseAPI, Celebrity, CelebrityPlatform, OtherAccountLink } from '@/lib/supabaseClient';
import { formatDateDMY } from '@/lib/date-utils';
import { executeSchemaFixNow, checkAccountLinkStatus } from '@/lib/executeSchemaFix';
import * as XLSX from 'xlsx';
import {
  Star,
  Plus,
  Edit,
  Trash2,
  Users,
  Mail,
  Phone,
  Instagram,
  Twitter,
  DollarSign,
  Search,
  Eye,
  TrendingUp,
  Youtube,
  LayoutGrid,
  List,
  Upload,
  FileText,
  Link as LinkIcon,
  CheckSquare,
  Square,
  Loader2,
  Download
} from 'lucide-react';

type PlatformKey = CelebrityPlatform;

const SOCIAL_PLATFORMS: Exclude<PlatformKey, 'website'>[] = ['instagram', 'snapchat', 'tiktok', 'youtube', 'twitter'];

const PLATFORM_REGEXES: Array<{ platform: PlatformKey; pattern: RegExp }> = [
  { platform: 'instagram', pattern: /instagram\.com\/(?:@)?([A-Za-z0-9._]+)/i },
  { platform: 'snapchat', pattern: /snapchat\.com\/add\/([A-Za-z0-9._-]+)/i },
  { platform: 'tiktok', pattern: /tiktok\.com\/@?([A-Za-z0-9._-]+)/i },
  { platform: 'youtube', pattern: /youtube\.com\/(?:c\/|channel\/|@)?([A-Za-z0-9._-]+)/i },
  { platform: 'twitter', pattern: /(twitter\.com|x\.com)\/@?([A-Za-z0-9._-]+)/i }
];

const PLATFORM_LABELS: Record<PlatformKey, string> = {
  instagram: 'إنستغرام',
  snapchat: 'سناب شات',
  tiktok: 'تيك توك',
  youtube: 'يوتيوب',
  twitter: 'منصة X (تويتر)',
  website: 'الموقع الرسمي'
};

const getPlatformLabel = (platform?: string | null) => {
  if (!platform) return '—';
  const key = platform as PlatformKey;
  return PLATFORM_LABELS[key] || platform;
};

const PLATFORM_HANDLE_FIELDS: Record<Exclude<PlatformKey, 'website'>, keyof Celebrity> = {
  instagram: 'instagram_handle',
  snapchat: 'snapchat_handle',
  tiktok: 'tiktok_handle',
  youtube: 'youtube_handle',
  twitter: 'twitter_handle'
};

const PLATFORM_DOMAINS: Record<PlatformKey, string> = {
  instagram: 'instagram.com',
  snapchat: 'snapchat.com/add',
  tiktok: 'tiktok.com/@',
  youtube: 'youtube.com/@',
  twitter: 'x.com',
  website: ''
};

const EMPTY_OTHER_ACCOUNT: OtherAccountLink = { platform: '', handle: '', link: '' };

const LOCATION_CANDIDATES = ['الرياض', 'جدة', 'دبي', 'الكويت', 'أبوظبي', 'الدوحة', 'القاهرة', 'عمان'] as const;
const CATEGORY_CANDIDATES = ['اجتماعي', 'ترفيهي', 'تعليمي', 'خيري', 'ديني', 'لايف ستايل', 'تقني', 'سفر'] as const;
const CONTENT_FOCUS = ['حكايا يومية', 'مراجعات سريعة', 'محتوى تعليمي مبسط', 'حملات خيرية', 'تغطيات فعاليات', 'نصائح مهنية'] as const;

const DEFAULT_PLATFORM: PlatformKey = 'instagram';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const randomFromArray = <T,>(items: readonly T[]): T => items[Math.floor(Math.random() * items.length)];

const sanitizeHandle = (value: string) =>
  value
    .replace(/\?.*/, '')
    .replace(/[@\s]/g, '')
    .replace(/[^A-Za-z0-9._-]/g, '')
    .replace(/^\//, '')
    .replace(/\/$/, '');

const buildPlatformLink = (platform: PlatformKey, handle?: string | null) => {
  if (!handle) return '';
  const normalized = sanitizeHandle(handle);
  if (!normalized) return '';
  switch (platform) {
    case 'instagram':
      return `https://www.instagram.com/${normalized}`;
    case 'snapchat':
      return `https://www.snapchat.com/add/${normalized}`;
    case 'tiktok':
      return `https://www.tiktok.com/@${normalized}`;
    case 'youtube':
      return `https://www.youtube.com/@${normalized}`;
    case 'twitter':
      return `https://x.com/${normalized}`;
    case 'website':
    default:
      return normalized.startsWith('http') ? normalized : `https://${normalized}`;
  }
};

const extractHandleFromUrl = (url: string): { handle: string | null; platform: PlatformKey } => {
  try {
    const parsed = new URL(url);
    const normalized = parsed.toString();
    for (const { platform, pattern } of PLATFORM_REGEXES) {
      const match = normalized.match(pattern);
      if (match) {
        const handle = sanitizeHandle(match[1] || match[2] || '');
        if (handle) {
          return { handle, platform };
        }
      }
    }

    const segments = parsed.pathname.split('/').filter(Boolean);
    if (segments.length > 0) {
      const fallbackHandle = sanitizeHandle(segments[segments.length - 1]);
      if (fallbackHandle) {
        return { handle: fallbackHandle, platform: 'website' };
      }
    }
  } catch (error) {
    console.warn('Failed to parse URL for handle extraction', error);
  }

  return { handle: null, platform: 'website' };
};

interface SimulatedSearchResult {
  title: string;
  snippet: string;
  platform?: Exclude<PlatformKey, 'website'>;
  handle?: string;
  followers_estimate?: number;
  location_hint?: string;
  category_hint?: string;
  link?: string;
}

interface SimulatedSearchOptions {
  mode: 'url' | 'handle';
  platform: PlatformKey;
  handle?: string | null;
}

const simulateGoogleSearch = (query: string, options: SimulatedSearchOptions): SimulatedSearchResult[] => {
  const baseHandle = sanitizeHandle(options.handle || query.split('/').pop() || '');
  const persona = baseHandle || `profile${Math.floor(Math.random() * 900 + 100)}`;
  const primaryPlatform = options.platform === 'website' ? randomFromArray(SOCIAL_PLATFORMS) : options.platform;
  const primaryFollowers = Math.floor(Math.random() * 800000) + 20000;

  const results: SimulatedSearchResult[] = [
    {
      title: `${persona} - حضور على ${PLATFORM_LABELS[primaryPlatform]}`,
      snippet:
        options.mode === 'url'
          ? `نتائج البحث تؤكد الرابط المدخل وتعرض سيرة ${persona} على ${PLATFORM_LABELS[primaryPlatform]}.`
          : `استخدام المعرف ${persona} في البحث أظهر الحساب الرسمي على ${PLATFORM_LABELS[primaryPlatform]}.`,
      platform: primaryPlatform as Exclude<PlatformKey, 'website'>,
      handle: persona,
      followers_estimate: primaryFollowers,
      location_hint: randomFromArray(LOCATION_CANDIDATES),
      category_hint: randomFromArray(CATEGORY_CANDIDATES),
      link:
        options.mode === 'url'
          ? query
          : `https://${primaryPlatform === 'twitter' ? 'x' : primaryPlatform}.com/${persona}`
    }
  ];

  const alternativePlatform = randomFromArray(
    SOCIAL_PLATFORMS.filter((platform) => platform !== results[0].platform)
  );

  results.push({
    title: `${persona} - تواجد على ${PLATFORM_LABELS[alternativePlatform]}`,
    snippet: `معلومات إضافية تربط ${persona} بمنصات أخرى وتعزز التحقق من الهوية الرقمية.`,
    platform: alternativePlatform,
    handle: alternativePlatform === 'youtube' ? `${persona}TV` : persona,
    followers_estimate: Math.floor(primaryFollowers * (0.4 + Math.random() * 0.4)),
    location_hint: randomFromArray(LOCATION_CANDIDATES),
    category_hint: randomFromArray(CATEGORY_CANDIDATES),
    link: `https://${alternativePlatform === 'twitter' ? 'x' : alternativePlatform}.com/${persona}`
  });

  return results;
};

const buildDisplayName = (handle?: string | null, fallbackTitle?: string) => {
  if (handle) {
    const cleaned = handle.replace(/[_-]+/g, ' ').trim();
    if (cleaned) {
      return cleaned
        .split(' ')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
    }
  }

  if (fallbackTitle) {
    const trimmed = fallbackTitle.split('-')[0]?.trim();
    if (trimmed) {
      return trimmed;
    }
  }

  return 'مؤثر رقمي';
};

const buildArabicBio = ({
  name,
  category,
  location,
  platform,
  followers,
  contentFocus
}: {
  name: string;
  category: string;
  location: string;
  platform: string;
  followers: number;
  contentFocus: string;
}) => {
  const formatter = new Intl.NumberFormat('ar-SA', { maximumFractionDigits: 0 });
  const followersText = formatter.format(followers);
  return `${name} صانع محتوى ${category} ينشط على ${platform} ويقدم محتوى ${contentFocus}. يمتلك ما يقارب ${followersText} متابع ويقيم في ${location} مع حضور واضح عبر المنصات الأخرى.`;
};

interface AggregateInput {
  url: string;
  extractedHandle: string | null;
  platform: PlatformKey;
  urlResults: SimulatedSearchResult[];
  handleResults: SimulatedSearchResult[];
}

const aggregateSearchInsights = ({
  url,
  extractedHandle,
  platform,
  urlResults,
  handleResults
}: AggregateInput): Partial<Celebrity> => {
  const combined = [...urlResults, ...handleResults];
  const handlesByPlatform: Partial<Record<Exclude<PlatformKey, 'website'>, string>> = {};

  combined.forEach((result) => {
    if (result.platform && result.handle && !handlesByPlatform[result.platform]) {
      handlesByPlatform[result.platform] = result.handle;
    }
  });

  if (extractedHandle && platform !== 'website' && !handlesByPlatform[platform]) {
    handlesByPlatform[platform] = extractedHandle;
  }

  const resolvedPrimaryPlatform: PlatformKey =
    platform !== 'website'
      ? platform
      : handlesByPlatform.instagram
        ? 'instagram'
        : handlesByPlatform.snapchat
          ? 'snapchat'
          : handlesByPlatform.tiktok
            ? 'tiktok'
            : handlesByPlatform.youtube
              ? 'youtube'
              : handlesByPlatform.twitter
                ? 'twitter'
                : 'website';

  const representativeHandle =
    resolvedPrimaryPlatform !== 'website'
      ? handlesByPlatform[resolvedPrimaryPlatform] || extractedHandle || ''
      : extractedHandle || '';

  const otherAccounts: OtherAccountLink[] = (Object.entries(handlesByPlatform) as Array<[
    Exclude<PlatformKey, 'website'>,
    string
  ]>)
    .filter(([key]) => key !== resolvedPrimaryPlatform)
    .map(([key, handle]) => ({
      platform: key,
      handle,
      link: buildPlatformLink(key, handle)
    }));

  const notes = otherAccounts.length
    ? `حسابات إضافية: ${otherAccounts
        .map((account) => {
          const label = getPlatformLabel(account.platform);
          return `${label}${account.handle ? ` (${account.handle})` : ''}`;
        })
        .join(' | ')}`
    : undefined;

  const displayName = buildDisplayName(representativeHandle, combined[0]?.title);
  const followersEstimate =
    combined.reduce((max, result) => {
      if (!result.followers_estimate) return max;
      return result.followers_estimate > max ? result.followers_estimate : max;
    }, 0) || Math.floor(Math.random() * 900000) + 50000;

  const location = combined.find((result) => result.location_hint)?.location_hint || randomFromArray(LOCATION_CANDIDATES);
  const category = combined.find((result) => result.category_hint)?.category_hint || randomFromArray(CATEGORY_CANDIDATES);
  const engagement = parseFloat((Math.random() * 4 + 1).toFixed(2));

  const aggregated: Partial<Celebrity> = {
    name: displayName,
    category,
    bio: buildArabicBio({
      name: displayName,
      category,
      location,
      platform: resolvedPrimaryPlatform !== 'website' ? PLATFORM_LABELS[resolvedPrimaryPlatform] : PLATFORM_LABELS.website,
      followers: followersEstimate,
      contentFocus: randomFromArray(CONTENT_FOCUS)
    }),
    followers_count: followersEstimate,
    engagement_rate: engagement,
    status: 'available',
    account_link: url,
    location,
    platform: resolvedPrimaryPlatform !== 'website' ? resolvedPrimaryPlatform : undefined,
    collaboration_rate: 0,
    notes,
    other_accounts: otherAccounts
  };

  (Object.entries(handlesByPlatform) as Array<[Exclude<PlatformKey, 'website'>, string]>).forEach(([key, handle]) => {
    const prop = PLATFORM_HANDLE_FIELDS[key];
    if (prop) {
      (aggregated as any)[prop] = handle;
    }
  });

  return aggregated;
};

// Mock extraction function with multi-step simulation
const extractCelebrityData = async (url: string): Promise<Partial<Celebrity>> => {
  // Step 1: Validate URL & read page
  await delay(600);
  if (!url.startsWith('http')) {
    throw new Error('الرابط غير صالح، الرجاء التأكد من كتابته.');
  }

  const { handle, platform } = extractHandleFromUrl(url);

  // Step 3: Google search using the link
  await delay(600);
  const urlResults = simulateGoogleSearch(url, { mode: 'url', platform, handle });

  // Step 4: Google search using the extracted handle
  await delay(600);
  const handleResults = handle ? simulateGoogleSearch(handle, { mode: 'handle', platform, handle }) : [];

  // Step 5/6: Aggregate & summarize
  await delay(600);
  return aggregateSearchInsights({
    url,
    extractedHandle: handle,
    platform,
    urlResults,
    handleResults
  });
};

type ImportPreviewRow = Partial<Celebrity> & {
  processing_status?: 'success' | 'manual';
  error_message?: string;
};

export default function CelebrityManagement() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [loading, setLoading] = useState(true);
  const [celebrities, setCelebrities] = useState<Celebrity[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedCelebrity, setSelectedCelebrity] = useState<Celebrity | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Import State
  const [importUrl, setImportUrl] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [importMessage, setImportMessage] = useState('');
  const [importError, setImportError] = useState('');
  const [showImportPreview, setShowImportPreview] = useState(false);
  const [importPreviewData, setImportPreviewData] = useState<ImportPreviewRow[]>([]);
  const [selectedImportRows, setSelectedImportRows] = useState<number[]>([]);

  const [newCelebrity, setNewCelebrity] = useState({
    name: '',
    category: 'كتابة',
    bio: '',
    notes: '',
    location: '',
    followers_count: 0,
    engagement_rate: 0,
    contact_email: '',
    contact_phone: '',
    instagram_handle: '',
    snapchat_handle: '',
    tiktok_handle: '',
    youtube_handle: '',
    twitter_handle: '',
    account_link: '',
    collaboration_rate: 0,
    status: 'available' as const,
    platform: DEFAULT_PLATFORM,
    other_accounts: [] as OtherAccountLink[]
  });

  useEffect(() => {
    loadData();
    checkAndFixSchema();
  }, []);

  const checkAndFixSchema = async () => {
    try {
      console.log('🔍 فحص حالة الأعمدة المطلوبة...');
      
      // التحقق من حالة العمود
      const status = await checkAccountLinkStatus();
      console.log('حالة الأعمدة:', status);
      
      if (!status.exists) {
        console.warn('⚠️ أعمدة مفقودة في Schema Cache');
        
        // محاولة تنفيذ الإصلاح
        console.log('🔧 محاولة تطبيق الإصلاح...');
        const result = await executeSchemaFixNow();
        console.log('نتيجة الإصلاح:', result);
        
        if (result.success) {
          addNotification({
            type: 'success',
            title: '✅ تم إصلاح قاعدة البيانات',
            message: `تم إضافة الأعمدة المفقودة بنجاح (${result.method})`
          });
        } else {
          // إظهار رسالة تتطلب تدخل يدوي
          addNotification({
            type: 'error',
            title: '⚠️ يتطلب إصلاح يدوي',
            message: 'يرجى فتح Supabase SQL Editor وتنفيذ السكريبت من ملف FIX_ACCOUNT_LINK.sql',
            duration: 10000
          });
          
          console.error('❌ فشل الإصلاح التلقائي. يتطلب تدخل يدوي في Supabase Dashboard');
        }
      } else {
        console.log('✅ جميع الأعمدة المطلوبة موجودة وجاهزة للاستخدام');
      }
    } catch (error) {
      console.error('خطأ في فحص/إصلاح Schema:', error);
      addNotification({
        type: 'error',
        title: '❌ خطأ في فحص قاعدة البيانات',
        message: 'حدث خطأ أثناء التحقق من Schema'
      });
    }
  };

  useEffect(() => {
    const state = location.state as { editCelebrityId?: string } | null;
    if (!state?.editCelebrityId || celebrities.length === 0) {
      return;
    }

    const target = celebrities.find(c => c.id === state.editCelebrityId);
    if (target) {
      setSelectedCelebrity({
        ...target,
        notes: target.notes || '',
        other_accounts: target.other_accounts || []
      });
      setIsEditDialogOpen(true);
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location.state, location.pathname, celebrities, navigate]);

  const loadData = async () => {
    try {
      setLoading(true);
      const celebritiesData = await supabaseAPI.getCelebrities();
      setCelebrities(celebritiesData);
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

  const handleImportSingle = async () => {
    if (!importUrl) return;
    
    try {
      setImportError('');
      setImportMessage('🔄 جاري التحقق من الرابط، استخراج المعرف، وتشغيل بحث مزدوج في قوقل...');
      setIsImporting(true);
      const data = await extractCelebrityData(importUrl);
      
      setNewCelebrity(prev => ({
        ...prev,
        ...data,
        name: data.name || prev.name,
        category: data.category || prev.category,
        bio: data.bio || prev.bio,
        location: data.location || prev.location,
        followers_count: data.followers_count || prev.followers_count,
        engagement_rate: data.engagement_rate || prev.engagement_rate,
        account_link: data.account_link || prev.account_link,
        instagram_handle: data.instagram_handle || prev.instagram_handle,
        snapchat_handle: data.snapchat_handle || prev.snapchat_handle,
        tiktok_handle: data.tiktok_handle || prev.tiktok_handle,
        youtube_handle: data.youtube_handle || prev.youtube_handle,
        twitter_handle: data.twitter_handle || prev.twitter_handle,
        platform: data.platform || prev.platform,
        notes: data.notes ?? prev.notes,
        other_accounts: data.other_accounts ?? prev.other_accounts,
      }));
      
      setImportMessage('✅ تم تعبئة الحقول تلقائيًا. يمكنك مراجعتها قبل الحفظ.');
      showSuccessNotification('تم استخراج البيانات بنجاح', 'تم تعبئة الحقول بالبيانات المتاحة');
    } catch (error) {
      const rawMessage = error instanceof Error ? error.message : 'حدث خطأ غير متوقع';
      let userFriendlyMessage = 'تعذّر الوصول لصفحة المشهور، قد تكون خاصة أو غير متاحة.';
      if (rawMessage.includes('غير صالح')) {
        userFriendlyMessage = 'الرابط غير صالح، الرجاء التأكد من كتابته.';
      } else if (rawMessage.includes('معلومات')) {
        userFriendlyMessage = 'لم يتم العثور على معلومات كافية، يمكنك تعبئة بيانات المشهور يدويًا.';
      }
      setImportMessage('');
      setImportError(userFriendlyMessage);
      addNotification({
        type: 'error',
        title: '⚠️ تعذر الاستيراد',
        message: userFriendlyMessage
      });
    } finally {
      setIsImporting(false);
    }
  };

  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setImportError('');
      setImportMessage('⌛️ جاري معالجة الروابط (التحقق من الرابط + استخراج المعرف + بحث مزدوج)...');
      setIsImporting(true);
      const extension = file.name.split('.').pop()?.toLowerCase();
      let lines: string[] = [];
      let ignoredCount = 0;

      if (extension === 'txt' || extension === 'csv') {
        const text = await file.text();
        const rawLines = text.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
        lines = rawLines.filter(line => line.startsWith('http'));
        ignoredCount = rawLines.length - lines.length;
      } else if (extension === 'xlsx' || extension === 'xls') {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer, { type: 'array' });
        const firstSheet = workbook.SheetNames[0];
        const sheet = workbook.Sheets[firstSheet];
        const rows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 });
        const rawEntries = rows
          .map(row => (Array.isArray(row) && row.length > 0 ? String(row[0]).trim() : ''))
          .filter(Boolean);
        lines = rawEntries.filter(value => value.startsWith('http'));
        ignoredCount = rawEntries.length - lines.length;
      } else {
        throw new Error('صيغة الملف غير مدعومة (يُدعم TXT / CSV / Excel).');
      }
      if (ignoredCount > 0) {
        addNotification({
          type: 'warning',
          title: 'تم تجاهل بعض الصفوف',
          message: `تم تجاهل ${ignoredCount} صف لأنه لا يحتوي على رابط صالح.`,
          duration: 5000
        });
      }
      
      if (lines.length === 0) {
        throw new Error('لم يتم العثور على روابط صالحة في الملف');
      }

      const results: ImportPreviewRow[] = [];
      for (const [index, line] of lines.entries()) {
        setImportMessage(`⌛️ رابط ${index + 1}/${lines.length}: استخراج المعرف وتشغيل بحث مزدوج...`);
        try {
          const data = await extractCelebrityData(line.trim());
          results.push({ ...data, processing_status: 'success' });
        } catch (e) {
          console.error(`Failed to import ${line}`, e);
          results.push({ 
            name: 'يحتاج إدخال يدوي', 
            account_link: line, 
            status: 'unavailable',
            platform: 'website',
            processing_status: 'manual',
            notes: 'تعذّر استخراج الحسابات الأخرى، يرجى إضافة الروابط يدويًا.',
            other_accounts: [],
            error_message: 'تعذّر قراءة الرابط، الرجاء تعديل البيانات يدويًا.'
          });
        }
      }

      setImportPreviewData(results);
      setSelectedImportRows(results.map((_, i) => i)); // Select all by default
      setShowImportPreview(true);
      setImportMessage('✅ تم تجهيز النتائج، راجع جدول المعاينة قبل الحفظ.');
      
    } catch (error) {
      const rawMessage = error instanceof Error ? error.message : 'حدث خطأ أثناء قراءة الملف';
      const userFriendlyMessage = rawMessage.includes('روابط صالحة')
        ? 'لم يتم العثور على روابط صالحة، الرجاء التأكد من الملف.'
        : 'تعذّر معالجة الملف، الرجاء المحاولة مرة أخرى.';
      setImportMessage('');
      setImportError(userFriendlyMessage);
      addNotification({
        type: 'error',
        title: '⚠️ فشل الاستيراد من الملف',
        message: userFriendlyMessage
      });
    } finally {
      setIsImporting(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const applyOtherAccountsUpdate = (
    mode: 'new' | 'edit',
    updater: (accounts: OtherAccountLink[]) => OtherAccountLink[]
  ) => {
    if (mode === 'new') {
      setNewCelebrity((prev) => ({
        ...prev,
        other_accounts: updater(prev.other_accounts || [])
      }));
    } else {
      setSelectedCelebrity((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          other_accounts: updater(prev.other_accounts || [])
        };
      });
    }
  };

  const handleAddOtherAccount = (mode: 'new' | 'edit') => {
    applyOtherAccountsUpdate(mode, (accounts) => [...accounts, { ...EMPTY_OTHER_ACCOUNT }]);
  };

  const handleRemoveOtherAccount = (mode: 'new' | 'edit', index: number) => {
    applyOtherAccountsUpdate(mode, (accounts) => accounts.filter((_, i) => i !== index));
  };

  const handleOtherAccountFieldChange = (
    mode: 'new' | 'edit',
    index: number,
    field: keyof Pick<OtherAccountLink, 'platform' | 'handle' | 'link'>,
    value: string
  ) => {
    applyOtherAccountsUpdate(mode, (accounts) => {
      const next = accounts.length ? [...accounts] : [{ ...EMPTY_OTHER_ACCOUNT }];
      if (!next[index]) {
        next[index] = { ...EMPTY_OTHER_ACCOUNT };
      }
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const getPrimaryPlatformKey = (row: ImportPreviewRow) => {
    if (row.platform && row.platform !== 'website') return row.platform;
    if (row.instagram_handle) return 'instagram';
    if (row.snapchat_handle) return 'snapchat';
    if (row.tiktok_handle) return 'tiktok';
    if (row.youtube_handle) return 'youtube';
    if (row.twitter_handle) return 'twitter';
    return 'instagram';
  };

  const getPrimaryHandleValue = (row: ImportPreviewRow) => {
    return (
      row.instagram_handle ||
      row.snapchat_handle ||
      row.tiktok_handle ||
      row.youtube_handle ||
      row.twitter_handle ||
      ''
    );
  };

  const updatePrimaryHandleValue = (index: number, value: string) => {
    const newData = [...importPreviewData];
    const platformKey = getPrimaryPlatformKey(newData[index]);

    switch (platformKey) {
      case 'snapchat':
        newData[index].snapchat_handle = value;
        break;
      case 'tiktok':
        newData[index].tiktok_handle = value;
        break;
      case 'youtube':
        newData[index].youtube_handle = value;
        break;
      case 'twitter':
        newData[index].twitter_handle = value;
        break;
      case 'instagram':
      default:
        newData[index].instagram_handle = value;
        break;
    }

    if (platformKey !== 'website') {
      newData[index].platform = platformKey;
    }

    setImportPreviewData(newData);
  };

  const handleSaveImported = async () => {
    try {
      setIsSaving(true);
      const selectedData = importPreviewData.filter((_, i) => selectedImportRows.includes(i));
      
      for (const data of selectedData) {
        const payload = {
          ...data,
          bio: data.bio || null,
          notes: data.notes || null,
          other_accounts: data.other_accounts?.length ? data.other_accounts : null,
          created_by: user?.id
        } as Partial<Celebrity> & { created_by?: string | null };

        await supabaseAPI.createCelebrity(payload as any);
      }
      
      showSuccessNotification('تم الحفظ', `تم إضافة ${selectedData.length} مشهور بنجاح`);
      setShowImportPreview(false);
      setImportPreviewData([]);
      loadData();
    } catch (error) {
      await handleApiError(error, {
        message: 'فشل حفظ البيانات المستوردة',
        context: 'Save Imported'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const filteredCelebrities = celebrities.filter(celebrity => {
    const lowerSearch = searchQuery.toLowerCase();
    const matchesSearch =
      celebrity.name.toLowerCase().includes(lowerSearch) ||
      (celebrity.bio?.toLowerCase() || '').includes(lowerSearch) ||
      (celebrity.notes?.toLowerCase() || '').includes(lowerSearch) ||
      (celebrity.location?.toLowerCase() || '').includes(lowerSearch) ||
      (celebrity.instagram_handle?.toLowerCase() || '').includes(lowerSearch) ||
      (celebrity.twitter_handle?.toLowerCase() || '').includes(lowerSearch);
    const matchesCategory = filterCategory === 'all' || celebrity.category === filterCategory;
    const matchesStatus = filterStatus === 'all' || celebrity.status === filterStatus;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleCreateCelebrity = async () => {
    try {
      // Validation
      if (!newCelebrity.name.trim()) {
        addNotification({
          type: 'warning',
          title: '⚠️ خطأ في البيانات',
          message: 'يرجى إدخال اسم المشهور'
        });
        return;
      }

      setIsSaving(true);
      
      const celebrityData = {
        ...newCelebrity,
        contact_email: newCelebrity.contact_email || null,
        contact_phone: newCelebrity.contact_phone || null,
        instagram_handle: newCelebrity.instagram_handle || null,
        snapchat_handle: newCelebrity.snapchat_handle || null,
        tiktok_handle: newCelebrity.tiktok_handle || null,
        youtube_handle: newCelebrity.youtube_handle || null,
        twitter_handle: newCelebrity.twitter_handle || null,
        account_link: newCelebrity.account_link || null,
        bio: newCelebrity.bio || null,
        location: newCelebrity.location || null,
        notes: newCelebrity.notes || null,
        other_accounts: newCelebrity.other_accounts?.length ? newCelebrity.other_accounts : null,
        platform: newCelebrity.platform || null,
        created_by: user?.id
      };
      
      const createdCelebrity = await supabaseAPI.createCelebrity(celebrityData);
      setCelebrities([createdCelebrity, ...celebrities]);
      
      // Reset form
      setNewCelebrity({
        name: '',
        category: 'كتابة',
        bio: '',
        notes: '',
        location: '',
        followers_count: 0,
        engagement_rate: 0,
        contact_email: '',
        contact_phone: '',
        instagram_handle: '',
        snapchat_handle: '',
        tiktok_handle: '',
        youtube_handle: '',
        twitter_handle: '',
        account_link: '',
        collaboration_rate: 0,
        status: 'available',
        platform: DEFAULT_PLATFORM,
        other_accounts: [] as OtherAccountLink[]
      });
      setIsCreateDialogOpen(false);

      // Success notification
      showSuccessNotification(
        'تم الحفظ بنجاح ✅',
        `تم إضافة "${createdCelebrity.name}" بنجاح`
      );
      
    } catch (error) {
      await handleApiError(error, {
        message: 'فشل في إضافة المشهور',
        context: 'CelebrityManagement - Create',
        severity: 'high',
        userFriendlyMessage: 'حدث خطأ أثناء إضافة المشهور',
        payload: newCelebrity,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateCelebrity = async () => {
    if (!selectedCelebrity) return;

    try {
      setIsSaving(true);
      
      const payload: Partial<Celebrity> = {
        ...selectedCelebrity,
        notes: selectedCelebrity.notes || null,
        other_accounts: selectedCelebrity.other_accounts?.length ? selectedCelebrity.other_accounts : null
      };

      const updatedCelebrity = await supabaseAPI.updateCelebrity(selectedCelebrity.id, payload);
      setCelebrities(celebrities.map(celebrity => celebrity.id === selectedCelebrity.id ? updatedCelebrity : celebrity));
      
      setIsEditDialogOpen(false);
      setSelectedCelebrity(null);

      // Success notification
      showSuccessNotification(
        'تم الحفظ بنجاح ✅',
        `تم تحديث بيانات "${updatedCelebrity.name}" بنجاح`
      );
      
    } catch (error) {
      await handleApiError(error, {
        message: 'فشل في تحديث المشهور',
        context: 'CelebrityManagement - Update',
        severity: 'high',
        userFriendlyMessage: 'حدث خطأ أثناء تحديث البيانات',
        payload: selectedCelebrity,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCelebrity = async (celebrityId: string, celebrityName: string) => {
    try {
      await supabaseAPI.deleteCelebrity(celebrityId);
      setCelebrities(celebrities.filter(celebrity => celebrity.id !== celebrityId));
      
      addNotification({
        type: 'warning',
        title: '🗑️ تم حذف المشهور',
        message: `تم حذف "${celebrityName}"`,
        duration: 4000,
        action: {
          label: 'تراجع',
          onClick: () => {
            loadData();
            addNotification({
              type: 'info',
              title: '↩️ تم التراجع',
              message: 'تم إلغاء عملية الحذف'
            });
          }
        }
      });
    } catch (error) {
      console.error('Error deleting celebrity:', error);
      addNotification({
        type: 'error',
        title: '❌ خطأ في الحذف',
        message: 'حدث خطأ أثناء حذف المشهور'
      });
    }
  };

  const getStatusColor = (status: Celebrity['status']) => {
    switch (status) {
      case 'available': return 'bg-green-100 text-green-800 border-green-200';
      case 'contracted': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'busy': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'unavailable': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryColor = (category: Celebrity['category']) => {
    switch (category) {
      case 'influencer': return 'bg-purple-100 text-purple-800';
      case 'actor': return 'bg-blue-100 text-blue-800';
      case 'athlete': return 'bg-green-100 text-green-800';
      case 'singer': return 'bg-pink-100 text-pink-800';
      case 'writer': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate statistics
  const celebrityStats = {
    total: celebrities.length,
    available: celebrities.filter(c => c.status === 'available').length,
    contracted: celebrities.filter(c => c.status === 'contracted').length,
    totalFollowers: celebrities.reduce((sum, c) => sum + c.followers_count, 0),
    avgRate: celebrities.length > 0 ? Math.round(celebrities.reduce((sum, c) => sum + c.collaboration_rate, 0) / celebrities.length) : 0
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل بيانات المشاهير من قاعدة البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8" dir="rtl">
      {/* Header */}
      <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            إدارة المشاهير والمؤثرين
          </h1>
          <p className="text-xl text-gray-600">قاعدة بيانات المشاهير والمؤثرين للتعاون</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
            <CardContent className="p-6 text-center">
              <Star className="h-8 w-8 mx-auto mb-3 text-purple-200" />
              <div className="text-3xl font-bold mb-1">{celebrityStats.total}</div>
              <p className="text-purple-100">إجمالي المشاهير</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
            <CardContent className="p-6 text-center">
              <Users className="h-8 w-8 mx-auto mb-3 text-green-200" />
              <div className="text-3xl font-bold mb-1">{celebrityStats.available}</div>
              <p className="text-green-100">متاحون</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0">
            <CardContent className="p-6 text-center">
              <TrendingUp className="h-8 w-8 mx-auto mb-3 text-blue-200" />
              <div className="text-3xl font-bold mb-1">{celebrityStats.contracted}</div>
              <p className="text-blue-100">متعاقدون</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-pink-500 to-pink-600 text-white border-0">
            <CardContent className="p-6 text-center">
              <Instagram className="h-8 w-8 mx-auto mb-3 text-pink-200" />
              <div className="text-2xl font-bold mb-1">{(celebrityStats.totalFollowers / 1000000).toFixed(1)}M</div>
              <p className="text-pink-100">إجمالي المتابعين</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0">
            <CardContent className="p-6 text-center">
              <DollarSign className="h-8 w-8 mx-auto mb-3 text-emerald-200" />
              <div className="text-2xl font-bold mb-1">{celebrityStats.avgRate.toLocaleString()}</div>
              <p className="text-emerald-100">متوسط السعر</p>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="البحث في المشاهير..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pr-10"
                  />
                </div>
                
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="الفئة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الفئات</SelectItem>
                    <SelectItem value="influencer">مؤثر</SelectItem>
                    <SelectItem value="actor">ممثل</SelectItem>
                    <SelectItem value="athlete">رياضي</SelectItem>
                    <SelectItem value="singer">مطرب</SelectItem>
                    <SelectItem value="writer">كاتب</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    <SelectItem value="available">متاح</SelectItem>
                    <SelectItem value="busy">مشغول</SelectItem>
                    <SelectItem value="contracted">متعاقد</SelectItem>
                    <SelectItem value="unavailable">غير متاح</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center border rounded-md bg-white" dir="ltr">
                  <Button
                    variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                    size="sm"
                    className="px-3 rounded-none rounded-l-md"
                    onClick={() => setViewMode('grid')}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                    size="sm"
                    className="px-3 rounded-none rounded-r-md"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                    <Plus className="h-4 w-4 ml-2" />
                    إضافة مشهور جديد
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>إضافة مشهور جديد</DialogTitle>
                    <DialogDescription>
                      أدخل بيانات المشهور الجديد
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    {/* Import Section */}
                    <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-4">
                      <h3 className="font-medium text-sm text-slate-900 flex items-center gap-2">
                        <Download className="h-4 w-4" />
                        استيراد بيانات المشهور تلقائيًا (Import)
                      </h3>
                      
                      {/* Single URL Import */}
                      <div className="space-y-2">
                        <Label htmlFor="import-url" className="text-xs">رابط صفحة المشهور</Label>
                        <div className="flex gap-2">
                          <Input 
                            id="import-url" 
                            placeholder="https://..." 
                            value={importUrl}
                            onChange={(e) => setImportUrl(e.target.value)}
                            className="h-8 text-sm"
                          />
                          <Button 
                            size="sm" 
                            variant="secondary"
                            onClick={handleImportSingle}
                            disabled={isImporting || !importUrl}
                          >
                            {isImporting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Search className="h-3 w-3" />}
                            <span className="mr-2">بحث واستخراج</span>
                          </Button>
                        </div>
                      </div>

                      {/* Bulk Import */}
                      <div className="space-y-2 pt-2 border-t border-slate-200">
                        <Label className="text-xs">استيراد روابط من ملف (Excel / TXT)</Label>
                        <div className="flex items-center gap-2">
                          <Input 
                            type="file" 
                            accept=".txt,.csv,.xlsx,.xls"
                            onChange={handleImportFile}
                            className="h-8 text-sm file:mr-4 file:py-1 file:px-2 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                          />
                        </div>
                        <p className="text-[10px] text-slate-500">
                          الملف يحتوي على رابط واحد في كل سطر (TXT) أو صف واحد في العمود الأول (CSV / Excel).
                        </p>
                        <p className="text-[11px] text-slate-600 leading-5">
                          ↪️ يتم التحقق من الرابط، استخراج المعرف، ثم تنفيذ بحث مزدوج في قوقل (بالرابط والمعرف) قبل تلخيص النتائج تلقائيًا بالعربية.
                        </p>
                        {importMessage && (
                          <p className="text-[11px] text-green-700 flex items-center gap-2">
                            <span>ℹ️</span>
                            {importMessage}
                          </p>
                        )}
                        {importError && (
                          <p className="text-[11px] text-red-600 flex items-center gap-2">
                            <span>⚠️</span>
                            {importError}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="name">الاسم</Label>
                      <Input
                        id="name"
                        value={newCelebrity.name}
                        onChange={(e) => setNewCelebrity({...newCelebrity, name: e.target.value})}
                        placeholder="أدخل اسم المشهور"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="category">الفئة</Label>
                        <Input
                          id="category"
                          value={newCelebrity.category}
                          onChange={(e) => setNewCelebrity({...newCelebrity, category: e.target.value})}
                          placeholder="أدخل الفئة (مثال: كاتب، مؤثر...)"
                        />
                      </div>
                      <div>
                        <Label htmlFor="status">الحالة</Label>
                        <Select value={newCelebrity.status} onValueChange={(value: Celebrity['status']) => setNewCelebrity({...newCelebrity, status: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="available">متاح</SelectItem>
                            <SelectItem value="busy">مشغول</SelectItem>
                            <SelectItem value="contracted">متعاقد</SelectItem>
                            <SelectItem value="unavailable">غير متاح</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <Label htmlFor="bio">نبذة عن المشهور</Label>
                        <Textarea
                          id="bio"
                          value={newCelebrity.bio}
                          onChange={(e) => setNewCelebrity({...newCelebrity, bio: e.target.value})}
                          placeholder="نبذة مختصرة عن المشهور"
                          rows={3}
                        />
                      </div>
                      <div>
                        <Label htmlFor="notes">ملاحظات / روابط إضافية</Label>
                        <Textarea
                          id="notes"
                          value={newCelebrity.notes}
                          onChange={(e) => setNewCelebrity({...newCelebrity, notes: e.target.value})}
                          placeholder="أضف أي ملاحظات أو روابط إضافية للحسابات الأخرى"
                          rows={3}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="location">الدولة / المدينة</Label>
                      <Input
                        id="location"
                        value={newCelebrity.location || ''}
                        onChange={(e) => setNewCelebrity({...newCelebrity, location: e.target.value})}
                        placeholder="الرياض، السعودية"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label htmlFor="followers_count">عدد المتابعين</Label>
                        <Input
                          id="followers_count"
                          type="number"
                          value={newCelebrity.followers_count}
                          onChange={(e) => setNewCelebrity({...newCelebrity, followers_count: parseInt(e.target.value) || 0})}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="engagement_rate">معدل التفاعل %</Label>
                        <Input
                          id="engagement_rate"
                          type="number"
                          step="0.1"
                          value={newCelebrity.engagement_rate}
                          onChange={(e) => setNewCelebrity({...newCelebrity, engagement_rate: parseFloat(e.target.value) || 0})}
                          placeholder="0"
                        />
                      </div>
                      <div>
                        <Label htmlFor="collaboration_rate">سعر التعاون</Label>
                        <Input
                          id="collaboration_rate"
                          type="number"
                          value={newCelebrity.collaboration_rate}
                          onChange={(e) => setNewCelebrity({...newCelebrity, collaboration_rate: parseFloat(e.target.value) || 0})}
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="contact_email">البريد الإلكتروني</Label>
                        <Input
                          id="contact_email"
                          type="email"
                          value={newCelebrity.contact_email}
                          onChange={(e) => setNewCelebrity({...newCelebrity, contact_email: e.target.value})}
                          placeholder="email@example.com"
                        />
                      </div>
                      <div>
                        <Label htmlFor="contact_phone">رقم الهاتف</Label>
                        <Input
                          id="contact_phone"
                          value={newCelebrity.contact_phone}
                          onChange={(e) => setNewCelebrity({...newCelebrity, contact_phone: e.target.value})}
                          placeholder="+966501234567"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="snapchat_handle">Snapchat</Label>
                        <Input
                          id="snapchat_handle"
                          value={newCelebrity.snapchat_handle}
                          onChange={(e) => setNewCelebrity({...newCelebrity, snapchat_handle: e.target.value})}
                          placeholder="@username"
                        />
                      </div>
                      <div>
                        <Label htmlFor="tiktok_handle">TikTok</Label>
                        <Input
                          id="tiktok_handle"
                          value={newCelebrity.tiktok_handle}
                          onChange={(e) => setNewCelebrity({...newCelebrity, tiktok_handle: e.target.value})}
                          placeholder="@username"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="instagram_handle">Instagram</Label>
                        <Input
                          id="instagram_handle"
                          value={newCelebrity.instagram_handle}
                          onChange={(e) => setNewCelebrity({...newCelebrity, instagram_handle: e.target.value})}
                          placeholder="@username"
                        />
                      </div>
                      <div>
                        <Label htmlFor="youtube_handle">YouTube</Label>
                        <Input
                          id="youtube_handle"
                          value={newCelebrity.youtube_handle}
                          onChange={(e) => setNewCelebrity({...newCelebrity, youtube_handle: e.target.value})}
                          placeholder="@username"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="twitter_handle">X (تويتر)</Label>
                        <Input
                          id="twitter_handle"
                          value={newCelebrity.twitter_handle}
                          onChange={(e) => setNewCelebrity({...newCelebrity, twitter_handle: e.target.value})}
                          placeholder="@username"
                        />
                      </div>
                      <div>
                        <Label htmlFor="platform">المنصة الأساسية</Label>
                        <Select
                          value={newCelebrity.platform || DEFAULT_PLATFORM}
                          onValueChange={(value) => setNewCelebrity({...newCelebrity, platform: value as PlatformKey})}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="اختر المنصة" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="instagram">إنستغرام</SelectItem>
                            <SelectItem value="snapchat">سناب شات</SelectItem>
                            <SelectItem value="tiktok">تيك توك</SelectItem>
                            <SelectItem value="youtube">يوتيوب</SelectItem>
                            <SelectItem value="twitter">X (تويتر)</SelectItem>
                            <SelectItem value="website">موقع شخصي</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Label>روابط إضافية للحسابات الأخرى</Label>
                        <Button type="button" variant="outline" size="sm" onClick={() => handleAddOtherAccount('new')}>
                          <Plus className="h-4 w-4 mr-1" />
                          إضافة رابط
                        </Button>
                      </div>
                      {(!newCelebrity.other_accounts || newCelebrity.other_accounts.length === 0) && (
                        <p className="text-xs text-slate-500">لا توجد روابط إضافية حاليًا.</p>
                      )}
                      {newCelebrity.other_accounts?.map((account, index) => (
                        <div key={`new-account-${index}`} className="grid grid-cols-1 md:grid-cols-12 gap-2">
                          <Input
                            value={account.platform || ''}
                            onChange={(e) => handleOtherAccountFieldChange('new', index, 'platform', e.target.value)}
                            placeholder="المنصة أو الوصف"
                            className="md:col-span-3"
                          />
                          <Input
                            value={account.handle || ''}
                            onChange={(e) => handleOtherAccountFieldChange('new', index, 'handle', e.target.value)}
                            placeholder="@handle"
                            className="md:col-span-3"
                          />
                          <div className="flex gap-2 md:col-span-6">
                            <Input
                              value={account.link || ''}
                              onChange={(e) => handleOtherAccountFieldChange('new', index, 'link', e.target.value)}
                              placeholder="https://..."
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveOtherAccount('new', index)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div>
                      <Label htmlFor="account_link">رابط الحساب</Label>
                      <Input
                        id="account_link"
                        value={newCelebrity.account_link}
                        onChange={(e) => setNewCelebrity({...newCelebrity, account_link: e.target.value})}
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} disabled={isSaving}>
                      إلغاء
                    </Button>
                    <LoadingButton 
                      onClick={handleCreateCelebrity}
                      loading={isSaving}
                      loadingText="جاري الحفظ..."
                      disabled={!newCelebrity.name}
                    >
                      إضافة المشهور
                    </LoadingButton>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>

        {/* Celebrities Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCelebrities.map((celebrity) => (
              <Card key={celebrity.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-50 rounded-lg">
                        {celebrity.snapchat_handle ? <div className="h-6 w-6 text-yellow-400 font-bold flex items-center justify-center">👻</div> :
                         celebrity.tiktok_handle ? <div className="h-6 w-6 text-black font-bold flex items-center justify-center">🎵</div> :
                         celebrity.youtube_handle ? <Youtube className="h-6 w-6 text-red-600" /> :
                         celebrity.twitter_handle ? <Twitter className="h-6 w-6 text-sky-500" /> :
                         celebrity.instagram_handle ? <Instagram className="h-6 w-6 text-pink-600" /> :
                         <Star className="h-6 w-6 text-purple-600" />}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{celebrity.name}</CardTitle>
                        <CardDescription className="text-sm">
                          {celebrity.followers_count.toLocaleString()} متابع
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge className={getStatusColor(celebrity.status)}>
                        {celebrity.status === 'available' ? 'متاح' :
                         celebrity.status === 'busy' ? 'مشغول' :
                         celebrity.status === 'contracted' ? 'متعاقد' : 'غير متاح'}
                      </Badge>
                      <Badge className={getCategoryColor(celebrity.category)}>
                        {celebrity.category}
                      </Badge>
                      {celebrity.platform && (
                        <Badge variant="outline">
                          {getPlatformLabel(celebrity.platform)}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {celebrity.bio && (
                    <p className="text-gray-600 text-sm line-clamp-3">{celebrity.bio}</p>
                  )}
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="font-medium">{celebrity.collaboration_rate.toLocaleString()} ريال</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-purple-600" />
                      <span className="font-medium">{celebrity.engagement_rate || 0}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-blue-600" />
                      <span className="font-medium">{(celebrity.followers_count / 1000).toFixed(0)}K</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    {celebrity.location && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs">📍</span>
                        <span>{celebrity.location}</span>
                      </div>
                    )}
                    {celebrity.contact_email && (
                      <div className="flex items-center gap-1">
                        <Mail className="h-4 w-4" />
                        <span className="truncate max-w-[150px]">{celebrity.contact_email}</span>
                      </div>
                    )}
                    {celebrity.contact_phone && (
                      <div className="flex items-center gap-1">
                        <Phone className="h-4 w-4" />
                        <span>{celebrity.contact_phone}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
                    {celebrity.snapchat_handle && (
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-yellow-500">👻</span>
                        <span>{celebrity.snapchat_handle}</span>
                      </div>
                    )}
                    {celebrity.tiktok_handle && (
                      <div className="flex items-center gap-1">
                        <span className="font-bold text-black">🎵</span>
                        <span>{celebrity.tiktok_handle}</span>
                      </div>
                    )}
                    {celebrity.instagram_handle && (
                      <div className="flex items-center gap-1">
                        <Instagram className="h-4 w-4" />
                        <span>{celebrity.instagram_handle}</span>
                      </div>
                    )}
                    {celebrity.youtube_handle && (
                      <div className="flex items-center gap-1">
                        <Youtube className="h-4 w-4" />
                        <span>{celebrity.youtube_handle}</span>
                      </div>
                    )}
                    {celebrity.twitter_handle && (
                      <div className="flex items-center gap-1">
                        <Twitter className="h-4 w-4 text-sky-500" />
                        <span>{celebrity.twitter_handle}</span>
                      </div>
                    )}
                  </div>
                  {celebrity.other_accounts && celebrity.other_accounts.length > 0 && (
                    <div className="flex flex-wrap gap-2 text-xs text-blue-700">
                      {celebrity.other_accounts.map((account, idx) => {
                        const label = getPlatformLabel(account.platform);
                        const text = `${label}${account.handle ? ` (${account.handle})` : ''}`;
                        return account.link ? (
                          <a
                            key={`card-acc-${celebrity.id}-${idx}`}
                            href={account.link}
                            target="_blank"
                            rel="noreferrer"
                            className="underline hover:text-blue-900"
                          >
                            {text}
                          </a>
                        ) : (
                          <span key={`card-acc-${celebrity.id}-${idx}`}>{text}</span>
                        );
                      })}
                    </div>
                  )}
                  {celebrity.notes && (
                    <div className="text-xs text-blue-900 bg-blue-50 border border-blue-100 rounded-md p-2">
                      {celebrity.notes}
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between pt-4 border-t">
                    <div className="text-xs text-gray-500">
                      أضيف: {formatDateDMY(celebrity.created_at)}
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/celebrities/${celebrity.id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedCelebrity({
                            ...celebrity,
                            notes: celebrity.notes || '',
                            other_accounts: celebrity.other_accounts || []
                          });
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteCelebrity(celebrity.id, celebrity.name)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 font-medium text-gray-500">الاسم</th>
                    <th className="px-4 py-3 font-medium text-gray-500">الفئة</th>
                    <th className="px-4 py-3 font-medium text-gray-500">الحالة</th>
                    <th className="px-4 py-3 font-medium text-gray-500">المنصة</th>
                    <th className="px-4 py-3 font-medium text-gray-500">المتابعين</th>
                    <th className="px-4 py-3 font-medium text-gray-500">التفاعل</th>
                    <th className="px-4 py-3 font-medium text-gray-500">السعر</th>
                    <th className="px-4 py-3 font-medium text-gray-500">الموقع</th>
                    <th className="px-4 py-3 font-medium text-gray-500">الملاحظات</th>
                    <th className="px-4 py-3 font-medium text-gray-500">التواصل</th>
                    <th className="px-4 py-3 font-medium text-gray-500">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {filteredCelebrities.map((celebrity) => (
                    <tr key={celebrity.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium">
                        <div className="flex items-center gap-2">
                          {celebrity.snapchat_handle ? <span className="text-lg">👻</span> :
                           celebrity.tiktok_handle ? <span className="text-lg">🎵</span> :
                           celebrity.youtube_handle ? <Youtube className="h-4 w-4 text-red-600" /> :
                           celebrity.twitter_handle ? <Twitter className="h-4 w-4 text-sky-500" /> :
                           celebrity.instagram_handle ? <Instagram className="h-4 w-4 text-pink-600" /> :
                           <Star className="h-4 w-4 text-purple-600" />}
                          {celebrity.name}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={getCategoryColor(celebrity.category)} variant="outline">
                          {celebrity.category}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={getStatusColor(celebrity.status)} variant="outline">
                          {celebrity.status === 'available' ? 'متاح' :
                           celebrity.status === 'busy' ? 'مشغول' :
                           celebrity.status === 'contracted' ? 'متعاقد' : 'غير متاح'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        {celebrity.platform ? (
                          <Badge variant="outline">{getPlatformLabel(celebrity.platform)}</Badge>
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">{celebrity.followers_count.toLocaleString()}</td>
                      <td className="px-4 py-3">{celebrity.engagement_rate || 0}%</td>
                      <td className="px-4 py-3">{celebrity.collaboration_rate.toLocaleString()} ريال</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{celebrity.location || '—'}</td>
                      <td className="px-4 py-3 text-xs text-gray-600">
                        {celebrity.notes ? (
                          <p className="line-clamp-2">{celebrity.notes}</p>
                        ) : celebrity.other_accounts && celebrity.other_accounts.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {celebrity.other_accounts.map((account, idx) => (
                              <Badge key={`list-acc-${celebrity.id}-${idx}`} variant="outline">
                                {getPlatformLabel(account.platform)}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col text-xs text-gray-500">
                          <span>{celebrity.contact_email}</span>
                          <span>{celebrity.contact_phone}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => navigate(`/celebrities/${celebrity.id}`)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => {
                              setSelectedCelebrity({
                                ...celebrity,
                                notes: celebrity.notes || '',
                                other_accounts: celebrity.other_accounts || []
                              });
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDeleteCelebrity(celebrity.id, celebrity.name)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {filteredCelebrities.length === 0 && (
          <div className="col-span-full">
            <Card>
              <CardContent className="p-12 text-center">
                <Star className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold mb-2 text-gray-600">لا توجد نتائج</h3>
                <p className="text-gray-500 mb-4">
                  {searchQuery || filterCategory !== 'all' || filterStatus !== 'all'
                    ? 'لا توجد مشاهير تطابق معايير البحث' 
                    : 'لم يتم إضافة أي مشاهير بعد'}
                </p>
                <Button onClick={() => setIsCreateDialogOpen(true)}>
                  <Plus className="h-4 w-4 ml-2" />
                  إضافة أول مشهور
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Edit Celebrity Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>تعديل بيانات المشهور</DialogTitle>
              <DialogDescription>
                تحديث معلومات المشهور
              </DialogDescription>
            </DialogHeader>
            {selectedCelebrity && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-name">الاسم</Label>
                  <Input
                    id="edit-name"
                    value={selectedCelebrity.name}
                    onChange={(e) => setSelectedCelebrity({...selectedCelebrity, name: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-category">الفئة</Label>
                    <Input
                      id="edit-category"
                      value={selectedCelebrity.category}
                      onChange={(e) => setSelectedCelebrity({...selectedCelebrity, category: e.target.value})}
                      placeholder="أدخل الفئة (مثال: كاتب، مؤثر...)"
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-status">الحالة</Label>
                    <Select value={selectedCelebrity.status} onValueChange={(value: Celebrity['status']) => setSelectedCelebrity({...selectedCelebrity, status: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">متاح</SelectItem>
                        <SelectItem value="busy">مشغول</SelectItem>
                        <SelectItem value="contracted">متعاقد</SelectItem>
                        <SelectItem value="unavailable">غير متاح</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="edit-bio">نبذة عن المشهور</Label>
                    <Textarea
                      id="edit-bio"
                      value={selectedCelebrity.bio || ''}
                      onChange={(e) => setSelectedCelebrity({...selectedCelebrity, bio: e.target.value})}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-notes">ملاحظات / روابط إضافية</Label>
                    <Textarea
                      id="edit-notes"
                      value={selectedCelebrity.notes || ''}
                      onChange={(e) => setSelectedCelebrity({...selectedCelebrity, notes: e.target.value})}
                      rows={3}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="edit-location">الدولة / المدينة</Label>
                  <Input
                    id="edit-location"
                    value={selectedCelebrity.location || ''}
                    onChange={(e) => setSelectedCelebrity({...selectedCelebrity, location: e.target.value})}
                    placeholder="الرياض، السعودية"
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="edit-followers_count">عدد المتابعين</Label>
                    <Input
                      id="edit-followers_count"
                      type="number"
                      value={selectedCelebrity.followers_count}
                      onChange={(e) => setSelectedCelebrity({...selectedCelebrity, followers_count: parseInt(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-engagement_rate">معدل التفاعل %</Label>
                    <Input
                      id="edit-engagement_rate"
                      type="number"
                      step="0.1"
                      value={selectedCelebrity.engagement_rate || 0}
                      onChange={(e) => setSelectedCelebrity({...selectedCelebrity, engagement_rate: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-collaboration_rate">سعر التعاون</Label>
                    <Input
                      id="edit-collaboration_rate"
                      type="number"
                      value={selectedCelebrity.collaboration_rate}
                      onChange={(e) => setSelectedCelebrity({...selectedCelebrity, collaboration_rate: parseFloat(e.target.value) || 0})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-contact_email">البريد الإلكتروني</Label>
                    <Input
                      id="edit-contact_email"
                      type="email"
                      value={selectedCelebrity.contact_email || ''}
                      onChange={(e) => setSelectedCelebrity({...selectedCelebrity, contact_email: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-contact_phone">رقم الهاتف</Label>
                    <Input
                      id="edit-contact_phone"
                      value={selectedCelebrity.contact_phone || ''}
                      onChange={(e) => setSelectedCelebrity({...selectedCelebrity, contact_phone: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-snapchat_handle">Snapchat</Label>
                    <Input
                      id="edit-snapchat_handle"
                      value={selectedCelebrity.snapchat_handle || ''}
                      onChange={(e) => setSelectedCelebrity({...selectedCelebrity, snapchat_handle: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-tiktok_handle">TikTok</Label>
                    <Input
                      id="edit-tiktok_handle"
                      value={selectedCelebrity.tiktok_handle || ''}
                      onChange={(e) => setSelectedCelebrity({...selectedCelebrity, tiktok_handle: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-instagram_handle">Instagram</Label>
                    <Input
                      id="edit-instagram_handle"
                      value={selectedCelebrity.instagram_handle || ''}
                      onChange={(e) => setSelectedCelebrity({...selectedCelebrity, instagram_handle: e.target.value})}
                    />
                  </div>
                      <div>
                    <Label htmlFor="edit-youtube_handle">YouTube</Label>
                    <Input
                      id="edit-youtube_handle"
                      value={selectedCelebrity.youtube_handle || ''}
                      onChange={(e) => setSelectedCelebrity({...selectedCelebrity, youtube_handle: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="edit-twitter_handle">X (تويتر)</Label>
                    <Input
                      id="edit-twitter_handle"
                      value={selectedCelebrity.twitter_handle || ''}
                      onChange={(e) => setSelectedCelebrity({...selectedCelebrity, twitter_handle: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="edit-platform">المنصة الأساسية</Label>
                    <Select
                      value={selectedCelebrity.platform || DEFAULT_PLATFORM}
                      onValueChange={(value) => setSelectedCelebrity({...selectedCelebrity, platform: value as PlatformKey})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر المنصة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="instagram">إنستغرام</SelectItem>
                        <SelectItem value="snapchat">سناب شات</SelectItem>
                        <SelectItem value="tiktok">تيك توك</SelectItem>
                        <SelectItem value="youtube">يوتيوب</SelectItem>
                        <SelectItem value="twitter">X (تويتر)</SelectItem>
                        <SelectItem value="website">موقع شخصي</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label>روابط إضافية للحسابات الأخرى</Label>
                    <Button type="button" variant="outline" size="sm" onClick={() => handleAddOtherAccount('edit')}>
                      <Plus className="h-4 w-4 mr-1" />
                      إضافة رابط
                    </Button>
                  </div>
                  {(!selectedCelebrity.other_accounts || selectedCelebrity.other_accounts.length === 0) && (
                    <p className="text-xs text-slate-500">لا توجد روابط إضافية حالياً.</p>
                  )}
                  {selectedCelebrity.other_accounts?.map((account, index) => (
                    <div key={`edit-account-${index}`} className="grid grid-cols-1 md:grid-cols-12 gap-2">
                      <Input
                        value={account.platform || ''}
                        onChange={(e) => handleOtherAccountFieldChange('edit', index, 'platform', e.target.value)}
                        placeholder="المنصة أو الوصف"
                        className="md:col-span-3"
                      />
                      <Input
                        value={account.handle || ''}
                        onChange={(e) => handleOtherAccountFieldChange('edit', index, 'handle', e.target.value)}
                        placeholder="@handle"
                        className="md:col-span-3"
                      />
                      <div className="flex gap-2 md:col-span-6">
                        <Input
                          value={account.link || ''}
                          onChange={(e) => handleOtherAccountFieldChange('edit', index, 'link', e.target.value)}
                          placeholder="https://..."
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveOtherAccount('edit', index)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div>
                  <Label htmlFor="edit-account_link">رابط الحساب</Label>
                  <Input
                    id="edit-account_link"
                    value={selectedCelebrity.account_link || ''}
                    onChange={(e) => setSelectedCelebrity({...selectedCelebrity, account_link: e.target.value})}
                    placeholder="https://..."
                  />
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isSaving}>
                إلغاء
              </Button>
              <LoadingButton 
                onClick={handleUpdateCelebrity}
                loading={isSaving}
                loadingText="جاري الحفظ..."
                disabled={!selectedCelebrity?.name}
              >
                حفظ التغييرات
              </LoadingButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Import Preview Dialog */}
        <Dialog open={showImportPreview} onOpenChange={setShowImportPreview}>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>معاينة البيانات المستوردة</DialogTitle>
              <DialogDescription>
                قم بمراجعة البيانات قبل الحفظ. يمكنك تعديل الحقول أو إلغاء تحديد الصفوف التي لا تريد حفظها.
              </DialogDescription>
            </DialogHeader>
            
            <div className="border rounded-md overflow-hidden">
              <table className="w-full text-sm text-right">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="p-3 w-10">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="p-0 h-4 w-4"
                        onClick={() => {
                          if (selectedImportRows.length === importPreviewData.length) {
                            setSelectedImportRows([]);
                          } else {
                            setSelectedImportRows(importPreviewData.map((_, i) => i));
                          }
                        }}
                      >
                        {selectedImportRows.length === importPreviewData.length ? 
                          <CheckSquare className="h-4 w-4" /> : 
                          <Square className="h-4 w-4" />
                        }
                      </Button>
                    </th>
                    <th className="p-3">الاسم</th>
                    <th className="p-3">اسم الحساب</th>
                    <th className="p-3">المنصة</th>
                    <th className="p-3">عدد المتابعين</th>
                    <th className="p-3">الموقع</th>
                    <th className="p-3">النبذة</th>
                    <th className="p-3">الرابط</th>
                    <th className="p-3">ملاحظات / روابط إضافية</th>
                    <th className="p-3">حالة القراءة</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {importPreviewData.map((row, index) => (
                    <tr key={index} className={selectedImportRows.includes(index) ? 'bg-blue-50/30' : ''}>
                      <td className="p-3">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="p-0 h-4 w-4"
                          onClick={() => {
                            if (selectedImportRows.includes(index)) {
                              setSelectedImportRows(prev => prev.filter(i => i !== index));
                            } else {
                              setSelectedImportRows(prev => [...prev, index]);
                            }
                          }}
                        >
                          {selectedImportRows.includes(index) ? 
                            <CheckSquare className="h-4 w-4 text-blue-600" /> : 
                            <Square className="h-4 w-4 text-gray-400" />
                          }
                        </Button>
                      </td>
                      <td className="p-3">
                        <Input 
                          value={row.name || ''} 
                          onChange={(e) => {
                            const newData = [...importPreviewData];
                            newData[index] = { ...newData[index], name: e.target.value };
                            setImportPreviewData(newData);
                          }}
                          className="h-8 w-32"
                        />
                      </td>
                      <td className="p-3">
                        <Input
                          value={getPrimaryHandleValue(row)}
                          onChange={(e) => updatePrimaryHandleValue(index, e.target.value)}
                          className="h-8 w-32"
                          placeholder="@username"
                        />
                      </td>
                      <td className="p-3">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          {row.instagram_handle && (
                            <span className="flex items-center gap-1">
                              <Instagram className="h-3 w-3 text-pink-600" />
                              <span>Instagram</span>
                            </span>
                          )}
                          {row.snapchat_handle && (
                            <span className="flex items-center gap-1">
                              <span className="text-yellow-500">👻</span>
                              <span>Snapchat</span>
                            </span>
                          )}
                          {row.tiktok_handle && (
                            <span className="flex items-center gap-1">
                              <span className="text-black">🎵</span>
                              <span>TikTok</span>
                            </span>
                          )}
                          {row.youtube_handle && (
                            <span className="flex items-center gap-1">
                              <Youtube className="h-3 w-3 text-red-600" />
                              <span>YouTube</span>
                            </span>
                          )}
                          {row.twitter_handle && (
                            <span className="flex items-center gap-1">
                              <Twitter className="h-3 w-3 text-sky-500" />
                              <span>X (تويتر)</span>
                            </span>
                          )}
                          {!row.instagram_handle && !row.snapchat_handle && !row.tiktok_handle && !row.youtube_handle && !row.twitter_handle && (
                            <span className="text-gray-400">—</span>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <Input
                          type="number"
                          value={row.followers_count ?? 0}
                          onChange={(e) => {
                            const newData = [...importPreviewData];
                            newData[index] = { ...newData[index], followers_count: parseInt(e.target.value) || 0 };
                            setImportPreviewData(newData);
                          }}
                          className="h-8 w-28"
                        />
                      </td>
                      <td className="p-3">
                        <Input
                          value={row.location || ''}
                          onChange={(e) => {
                            const newData = [...importPreviewData];
                            newData[index] = { ...newData[index], location: e.target.value };
                            setImportPreviewData(newData);
                          }}
                          className="h-8 w-32"
                          placeholder="المدينة"
                        />
                      </td>
                      <td className="p-3">
                        <Textarea
                          value={row.bio || ''}
                          onChange={(e) => {
                            const newData = [...importPreviewData];
                            newData[index] = { ...newData[index], bio: e.target.value };
                            setImportPreviewData(newData);
                          }}
                          className="h-16 text-sm"
                        />
                      </td>
                      <td className="p-3">
                        <div className="space-y-1">
                          <Input
                            value={row.account_link || ''}
                            onChange={(e) => {
                              const newData = [...importPreviewData];
                              newData[index] = { ...newData[index], account_link: e.target.value };
                              setImportPreviewData(newData);
                            }}
                            className="h-8"
                            placeholder="https://..."
                          />
                          {row.account_link && (
                            <a
                              href={row.account_link}
                              target="_blank"
                              rel="noreferrer"
                              className="text-blue-600 hover:underline text-xs truncate max-w-[150px] block"
                            >
                              {row.account_link}
                            </a>
                          )}
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-1 text-[10px] text-gray-600">
                            {row.other_accounts && row.other_accounts.length > 0 ? (
                              row.other_accounts.map((account, accountIndex) => (
                                <Badge key={`row-${index}-account-${accountIndex}`} variant="outline">
                                  {getPlatformLabel(account.platform)}
                                  {account.handle ? ` (${account.handle})` : ''}
                                </Badge>
                              ))
                            ) : (
                              <span className="text-gray-400">لا يوجد</span>
                            )}
                          </div>
                          <Textarea
                            value={row.notes || ''}
                            onChange={(e) => {
                              const newData = [...importPreviewData];
                              newData[index] = { ...newData[index], notes: e.target.value };
                              setImportPreviewData(newData);
                            }}
                            className="h-16 text-sm"
                            placeholder="أضف تفاصيل أو روابط إضافية"
                          />
                        </div>
                      </td>
                      <td className="p-3">
                        <div className="space-y-1">
                          <Badge variant={row.processing_status === 'success' ? 'outline' : 'destructive'}>
                            {row.processing_status === 'success' ? 'ناجح' : 'يحتاج إدخال يدوي'}
                          </Badge>
                          {row.error_message && (
                            <p className="text-[10px] text-gray-500">{row.error_message}</p>
                          )}
                          <Badge variant={row.status === 'unavailable' ? 'destructive' : 'outline'}>
                            {row.status === 'unavailable' ? 'فشل' : 'جاهز'}
                          </Badge>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setShowImportPreview(false)}>إلغاء</Button>
              <LoadingButton 
                onClick={handleSaveImported}
                loading={isSaving}
                loadingText="جاري الحفظ..."
                disabled={selectedImportRows.length === 0}
              >
                حفظ المشاهير المحددين ({selectedImportRows.length})
              </LoadingButton>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </div>
  );
}