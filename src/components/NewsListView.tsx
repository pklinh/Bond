import { useState, useEffect, useCallback, useRef } from 'react';
import { NewsItem } from '../types';
import { Newspaper, ChevronRight, ChevronLeft, RefreshCw, AlertCircle, ExternalLink } from 'lucide-react';
import { fetchNewsData, getCachedNews, getNewsLastUpdate } from '../services/newsService';
import { formatDate } from '../utils/format';
import { useTheme } from '../ThemeContext';
import { useLanguage } from '../LanguageContext';

interface NewsListViewProps {
  onSelectNews: (news: NewsItem) => void;
}

const ITEMS_PER_PAGE = 12;
const REFRESH_INTERVAL = 300000; // 5 minutes

export default function NewsListView({ onSelectNews }: NewsListViewProps) {
  const { effectiveTheme } = useTheme();
  const { t } = useLanguage();
  const isDark = effectiveTheme === 'dark';
  const [currentPage, setCurrentPage] = useState(1);
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const loadingRef = useRef(false);

  // Initialize from cache immediately
  useEffect(() => {
    const cached = getCachedNews();
    if (cached) {
      setNewsList(cached);
    }
  }, []);

  const loadData = useCallback(async (isAutoRefresh = false, force = false) => {
    if (loadingRef.current) return;
    
    // Cooldown check: Only fetch if forced or > 2 minutes since last update (for non-auto-refresh)
    if (!isAutoRefresh && !force) {
      const lastUpdate = getNewsLastUpdate();
      const now = Date.now();
      if (lastUpdate && now - lastUpdate < 120000) {
        return;
      }
    }

    // If we have news, don't show full page loading skeleton
    const hasExistingNews = newsList.length > 0;
    if (!hasExistingNews) {
      setLoading(true);
    }
    
    loadingRef.current = true;
    setError(null);
    
    try {
      const data = await fetchNewsData();
      setNewsList(data);
    } catch (err) {
      if (!hasExistingNews) {
        setError(t('newsFetchError'));
      }
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [newsList.length]);

  useEffect(() => {
    loadData();

    const interval = setInterval(() => {
      loadData(true);
    }, REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, [loadData]);

  const totalPages = Math.ceil(newsList.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentNews = newsList.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const NewsSkeleton = () => (
    <div className="bg-bg-surface rounded-2xl border border-border-base shadow-sm overflow-hidden flex flex-col h-full animate-pulse transition-colors">
      <div className="h-48 bg-bg-base/50" />
      <div className="p-5 flex-1 flex flex-col gap-3">
        <div className="h-4 w-1/4 bg-bg-base/50 rounded" />
        <div className="h-6 w-full bg-bg-base/50 rounded" />
        <div className="h-6 w-3/4 bg-bg-base/50 rounded" />
        <div className="h-4 w-full bg-bg-base/30 rounded mt-2" />
        <div className="h-4 w-5/6 bg-bg-base/30 rounded" />
        <div className="mt-auto pt-4 flex justify-between">
          <div className="h-4 w-20 bg-bg-base/50 rounded" />
          <div className="h-4 w-24 bg-bg-base/50 rounded" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 transition-colors">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-text-base flex items-center gap-3 transition-colors">
            <Newspaper className="h-7 w-7 text-[#3634B3]" />
            {t('relatedNews')}
          </h2>
          <p className="text-sm text-text-muted mt-1 transition-colors">{t('newsDescription')}</p>
        </div>
        {!loading && (
          <button 
            onClick={() => loadData()}
            disabled={loading}
            className="p-2 text-text-muted hover:text-[#3634B3] transition-colors"
            title={t('refresh')}
          >
            <RefreshCw className={`h-5 w-5 ${loadingRef.current ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>

      {loading && newsList.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => <NewsSkeleton key={i} />)}
        </div>
      ) : error && newsList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-bg-surface rounded-3xl border border-dashed border-border-base transition-colors">
          <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-full mb-4">
            <AlertCircle className="h-8 w-8 text-red-500 dark:text-red-400" />
          </div>
          <p className="text-text-base font-bold mb-4">{error}</p>
          <button 
            onClick={() => loadData()}
            className="flex items-center gap-2 px-6 py-3 bg-[#3634B3] text-white rounded-xl font-bold hover:opacity-90 transition-all shadow-lg shadow-[#3634B3]/20"
          >
            <RefreshCw className="h-4 w-4" /> {t('retry')}
          </button>
        </div>
      ) : newsList.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center bg-bg-surface rounded-3xl border border-dashed border-border-base transition-colors">
          <div className="bg-bg-base p-4 rounded-full mb-4 text-text-muted">
            <Newspaper className="h-8 w-8" />
          </div>
          <p className="text-text-muted font-medium transition-colors">{t('noNewsAvailable')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentNews.map((news) => (
            <div 
              key={news.id} 
              onClick={() => onSelectNews(news)}
              className="bg-bg-surface rounded-2xl border border-border-base shadow-sm overflow-hidden hover:shadow-md hover:border-[#3634B3]/20 transition-all cursor-pointer group flex flex-col h-full"
            >
              <div className="relative h-48 overflow-hidden bg-bg-base">
                <img 
                  src={news.image} 
                  alt={news.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://picsum.photos/seed/${news.title}/800/600`;
                  }}
                />
                <div className="absolute top-3 left-3">
                  <span className="px-3 py-1 bg-bg-surface/90 backdrop-blur-sm text-[10px] font-bold text-[#3634B3] uppercase tracking-wider rounded-full shadow-sm transition-colors">
                    {news.source}
                  </span>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <div className="mb-4">
                  <h3 className="text-base font-bold text-text-base leading-tight group-hover:text-[#3634B3] transition-colors line-clamp-2 md:h-[2.6rem]">
                    {news.title}
                  </h3>
                  <p className="text-sm text-text-muted mt-2 line-clamp-2 leading-relaxed h-[2.5rem] transition-colors">
                    {news.summary}
                  </p>
                </div>
                <div className="mt-auto flex items-center justify-between pt-4 border-t border-border-base transition-colors">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-text-muted font-bold uppercase tracking-tight line-clamp-1 transition-colors">
                      {news.author}
                    </span>
                    <span className="text-[10px] text-text-muted font-medium mt-0.5 transition-colors">
                      {formatDate(news.date)}
                    </span>
                  </div>
                  <div className="flex items-center text-[#3634B3] text-[10px] font-bold uppercase tracking-wider group-hover:gap-2 transition-all">
                    {t('readMore')} <ChevronRight className="h-3 w-3" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8 pb-8">
          <button
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-xl border border-border-base text-text-muted disabled:opacity-30 bg-bg-base/50 hover:bg-bg-base transition-all"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          
          {[...Array(totalPages)].map((_, i) => {
            // Only show limited pages around current page
            const page = i + 1;
            if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-10 h-10 rounded-xl text-sm font-bold transition-all border ${
                    currentPage === page
                      ? 'bg-[#3634B3] text-white border-transparent shadow-lg shadow-[#3634B3]/20'
                      : 'bg-bg-surface text-text-base border-border-base hover:border-[#3634B3] hover:text-[#3634B3]'
                  }`}
                >
                  {page}
                </button>
              );
            } else if (page === currentPage - 2 || page === currentPage + 2) {
              return <span key={page} className="px-1 text-text-muted">...</span>;
            }
            return null;
          })}

          <button
            onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-xl border border-border-base text-text-muted disabled:opacity-30 bg-bg-base/50 hover:bg-bg-base transition-all"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}
