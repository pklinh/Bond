import { useState, FormEvent, useEffect } from 'react';
import { NewsItem } from '../types';
import { ChevronLeft, Calendar, Share2, MessageCircle, Bookmark, Send, Volume2, VolumeX, ExternalLink } from 'lucide-react';
import { formatDate } from '../utils/format';
import { useTheme } from '../ThemeContext';
import { useLanguage } from '../LanguageContext';

interface NewsDetailViewProps {
  news: NewsItem;
  onBack: () => void;
}

export default function NewsDetailView({ news, onBack }: NewsDetailViewProps) {
  const { effectiveTheme } = useTheme();
  const { t, language } = useLanguage();
  const isDark = effectiveTheme === 'dark';
  const [comment, setComment] = useState('');
  const [isSaved, setIsSaved] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Stop speech when component unmounts
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const processTextForSpeech = (text: string) => {
    // 1. Loại bỏ các phần trong ngoặc đơn (ví dụ: (TPDN), (VBMA), ...)
    // Loại bỏ cả dấu ngoặc và nội dung bên trong
    let processedText = text.replace(/\([^)]*\)/g, ' ');

    const abbreviations: Record<string, string> = {
      'TPDN': 'Trái phiếu doanh nghiệp',
      'CK': 'Chứng khoán',
      'DN': 'Doanh nghiệp',
      'NH': 'Ngân hàng',
      'TMCP': 'Thương mại cổ phần',
      'BĐS': 'Bất động sản',
      'LS': 'Lãi suất',
      'VNĐ': 'Việt Nam đồng',
      'ĐVT': 'Đơn vị tính',
      'HĐQT': 'Hội đồng quản trị',
      'ĐHĐCĐ': 'Đại hội đồng cổ đông',
      'GĐ': 'Giám đốc',
      'TGĐ': 'Tổng giám đốc',
      'TCT': 'Tổng công ty',
      'MTV': 'Một thành viên',
      'CP': 'Cổ phần',
      'VN-Index': 'Việt Nam Index',
      'HNX': 'Sàn Hà Nội',
      'UPCoM': 'Sàn Up-com',
      'HNX-Index': 'Hắt nờ ích Index',
      'USD': 'Đô la Mỹ',
      'VND': 'Việt Nam đồng'
    };

    Object.entries(abbreviations).forEach(([abbr, full]) => {
      const regex = new RegExp(`\\b${abbr}\\b`, 'g');
      processedText = processedText.replace(regex, full);
    });

    // 2. Làm sạch khoảng trắng thừa
    processedText = processedText.replace(/\s+/g, ' ').trim();

    return processedText;
  };

  const toggleSpeech = () => {
    if (!window.speechSynthesis) {
      alert(t('ttsNotSupported'));
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      // Chuẩn bị nội dung đọc: Tiêu đề + Nội dung
      const titleText = processTextForSpeech(news.title);
      const contentText = processTextForSpeech(news.content || '');
      
      const fullText = `${titleText}. . . ${contentText}`;

      const utterance = new SpeechSynthesisUtterance(fullText);
      
      // Thiết lập ngôn ngữ
      utterance.lang = language === 'vi' ? 'vi-VN' : 'en-US';
      
      // Tìm giọng đọc phù hợp nhất trong hệ thống
      const voices = window.speechSynthesis.getVoices();
      
      // Một số trình duyệt có giọng đọc chất lượng cao (Google)
      const langCode = language === 'vi' ? 'vi-VN' : 'en-US';
      const preferredVoice = voices.find(v => v.lang.includes(langCode) && v.name.includes('Google')) || 
                           voices.find(v => v.lang.includes(langCode)) || 
                           voices.find(v => v.lang.startsWith(language));
      
      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      // Điều chỉnh để giống giọng phát thanh viên:
      utterance.rate = 0.85; 
      utterance.pitch = 0.95; 

      utterance.onstart = () => {
        setIsSpeaking(true);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
      };

      utterance.onerror = (event) => {
        console.error(t('newsSpeechError'), event);
        setIsSpeaking(false);
      };

      window.speechSynthesis.speak(utterance);
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: news.title,
        text: t('shareText'),
        url: window.location.href,
      }).catch(console.error);
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert(t('linkCopied'));
    }
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    // Placeholder for actual save functionality
    console.log(isSaved ? 'Unsaved article' : 'Saved article');
  };

  const handleComment = (e: FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    
    // Placeholder for actual comment submission
    console.log('Submitted comment:', comment);
    alert(t('commentThanks'));
    setComment('');
  };

  return (
    <div className="max-w-4xl mx-auto p-8 animate-in fade-in slide-in-from-left-4 duration-700 transition-colors">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-sm font-bold text-[#3634B3] hover:gap-3 transition-all mb-8 bg-bg-surface px-4 py-2 rounded-xl border border-border-base shadow-sm hover:shadow-md"
      >
        <ChevronLeft className="h-4 w-4" /> {t('back')}
      </button>

      <article className="bg-bg-surface rounded-3xl border border-border-base shadow-sm overflow-hidden p-8 md:p-12 transition-colors">
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="px-4 py-1.5 bg-[#3634B3]/5 text-xs font-bold text-[#3634B3] uppercase tracking-widest rounded-full transition-colors">
              {news.source}
            </span>
            <div className="flex items-center gap-1.5 text-xs text-text-muted font-medium whitespace-nowrap transition-colors">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(news.date)}
            </div>
          </div>
          
          <h1 className="text-2xl md:text-3xl font-bold text-text-base leading-tight mb-8 transition-colors">
            {news.title}
          </h1>

          <div className="flex items-center justify-between py-6 border-y border-border-base transition-colors">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#3634B3] flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-[#3634B3]/20 transition-colors">
                {news.source.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-bold text-text-base leading-none transition-colors">{news.author}</p>
              </div>
            </div>

            <button
              onClick={toggleSpeech}
              title={isSpeaking ? t("stopReading") : t("listenArticle")}
              className={`p-3 rounded-full transition-all duration-300 ${
                isSpeaking 
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-500 dark:text-red-400 shadow-inner' 
                  : 'bg-[#3634B3]/5 text-[#3634B3] hover:bg-[#3634B3] hover:text-white hover:shadow-lg'
              }`}
            >
              {isSpeaking ? (
                <VolumeX className="h-5 w-5 animate-pulse" />
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </button>
          </div>
        </header>

        <div className="relative aspect-video rounded-3xl overflow-hidden mb-12 shadow-2xl shadow-gray-200 dark:shadow-none bg-bg-base transition-colors">
          <img 
            src={news.image} 
            alt={news.title} 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = `https://picsum.photos/seed/${news.title}/1200/800`;
            }}
          />
        </div>

        <div className="prose prose-blue dark:prose-invert max-w-none">
          <div className="text-base text-text-base leading-relaxed font-normal whitespace-pre-wrap transition-colors">
            {news.content || news.summary || t('updateContent')}
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-border-base italic text-sm text-text-muted transition-colors">
          {news.url && (
            <p className="mb-4">
              {t('source')}: <span className="font-bold">{news.source}</span>
              <a href={news.url} target="_blank" rel="noopener noreferrer" className="ml-2 text-[#3634B3] hover:underline inline-flex items-center gap-1 transition-colors">
                ({t('readOriginal')} <ExternalLink className="h-3 w-3" />)
              </a>
            </p>
          )}
        </div>

        <div className="mt-8 pt-8 border-t border-border-base transition-colors">
          <div className="flex flex-wrap items-center justify-between gap-6 mb-12">
            <div className="flex items-center gap-4">
              <button 
                onClick={handleShare}
                className="flex items-center gap-2 px-6 py-3 bg-[#3634B3] text-white rounded-2xl font-bold text-sm hover:translate-y-[-2px] hover:shadow-lg hover:shadow-[#3634B3]/25 transition-all active:translate-y-0"
              >
                <Share2 className="h-4 w-4" /> {t('share')}
              </button>
              <button 
                onClick={handleSave}
                className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm transition-all border ${
                  isSaved 
                    ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-400/30' 
                    : 'bg-bg-surface text-text-muted border-border-base hover:border-[#3634B3] hover:text-[#3634B3]'
                }`}
              >
                <Bookmark className={`h-4 w-4 ${isSaved ? 'fill-current' : ''}`} /> 
                {isSaved ? t('saved') : t('saveNews')}
              </button>
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-xl font-bold text-text-base flex items-center gap-2 transition-colors">
              <MessageCircle className="h-6 w-6 text-[#3634B3]" />
              {t('comments')}
            </h3>
            
            <form onSubmit={handleComment} className="relative group">
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t('commentPlaceholder')}
                className="w-full p-5 pt-6 pb-16 bg-bg-base/50 dark:bg-bg-base/20 rounded-3xl border border-border-base focus:bg-bg-surface focus:border-[#3634B3]/30 focus:ring-4 focus:ring-[#3634B3]/5 transition-all resize-none min-h-[140px] text-text-base placeholder:text-text-muted outline-none"
              />
              <div className="absolute bottom-4 right-4 flex items-center gap-3">
                <span className="text-[10px] text-text-muted font-bold uppercase tracking-wide transition-colors">
                  {comment.length} {t('characters')}
                </span>
                <button 
                  type="submit"
                  disabled={!comment.trim()}
                  className="p-3 bg-[#3634B3] text-white rounded-xl disabled:opacity-30 disabled:translate-y-0 hover:translate-y-[-2px] hover:shadow-lg transition-all"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </form>
          </div>
        </div>
      </article>
      
      <div className="mt-12 text-center transition-colors">
        <p className="text-xs text-text-muted font-medium transition-colors">{t('platformFooter')}</p>
      </div>
    </div>
  );
}
