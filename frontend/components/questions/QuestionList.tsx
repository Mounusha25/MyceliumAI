'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import QuestionCard from './QuestionCard';
import { QuestionData } from './QuestionCard';

const tabs = [
  { id: 'top', label: 'Top', heading: 'Highest Scored Questions' },
  { id: 'newest', label: 'Newest', heading: 'Newest Questions' },
];

interface ForumInfo {
  name: string;
  description: string | null;
}

const SkeletonCard = () => (
  <div className="flex flex-col md:flex-row gap-2 md:gap-4 py-4 border-b border-[#e5e5e5]">
    <div className="hidden md:flex flex-shrink-0 gap-4 min-w-[120px]">
      <div className="flex flex-col items-center min-w-[50px] gap-1">
        <div className="skeleton w-8 h-6" />
        <div className="skeleton w-8 h-3" />
      </div>
      <div className="flex flex-col items-center min-w-[50px] gap-1">
        <div className="skeleton w-8 h-6" />
        <div className="skeleton w-10 h-3" />
      </div>
    </div>
    <div className="flex-1 min-w-0">
      <div className="skeleton w-3/4 h-5 mb-2" />
      <div className="skeleton w-full h-4 mb-1" />
      <div className="skeleton w-2/3 h-4 mb-3 md:mb-5" />
      <div className="flex items-center justify-between">
        <div className="skeleton w-24 h-5 rounded" />
        <div className="flex items-center gap-2">
          <div className="skeleton w-5 h-5 rounded" />
          <div className="skeleton w-20 h-4 hidden sm:block" />
          <div className="skeleton w-16 h-4" />
        </div>
      </div>
    </div>
  </div>
);

const QuestionList = () => {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('search') || '';
  const forumId = searchParams.get('forum') || '';
  const forumNameParam = searchParams.get('fname') || '';
  const forumDescParam = searchParams.get('fdesc') || '';
  const [activeTab, setActiveTab] = useState('top');
  const [currentPage, setCurrentPage] = useState(1);
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState<number | null>(null);
  const [forumInfo, setForumInfo] = useState<ForumInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const prevTotalRef = useRef<number | null>(null);
  const perPage = 20;

  const currentTab = tabs.find((t) => t.id === activeTab)!;

  // Optimistic: set forum info immediately from URL params
  useEffect(() => {
    if (forumId && forumNameParam) {
      setForumInfo({ name: forumNameParam, description: forumDescParam || null });
    } else if (!forumId) {
      setForumInfo(null);
    }
  }, [forumId, forumNameParam, forumDescParam]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, forumId]);

  useEffect(() => {
    setLoading(true);
    let url = `/api/questions?sort=${activeTab}&page=${currentPage}`;
    if (searchQuery) {
      url += `&search=${encodeURIComponent(searchQuery)}`;
    }
    if (forumId) {
      url += `&forum_id=${encodeURIComponent(forumId)}`;
    }
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        setQuestions(data.questions);
        setTotalPages(data.total_pages);

        if (data.total_pages <= 1) {
          const total = data.questions.length;
          prevTotalRef.current = total;
          setTotalQuestions(total);
        } else if (currentPage === data.total_pages) {
          const total = (data.total_pages - 1) * perPage + data.questions.length;
          prevTotalRef.current = total;
          setTotalQuestions(total);
        } else {
          // Show previous total while loading the exact count
          if (prevTotalRef.current !== null) {
            setTotalQuestions(prevTotalRef.current);
          }
          let lastUrl = `/api/questions?sort=${activeTab}&page=${data.total_pages}`;
          if (searchQuery) lastUrl += `&search=${encodeURIComponent(searchQuery)}`;
          if (forumId) lastUrl += `&forum_id=${encodeURIComponent(forumId)}`;
          fetch(lastUrl)
            .then((r) => r.json())
            .then((last) => {
              const total = (data.total_pages - 1) * perPage + last.questions.length;
              prevTotalRef.current = total;
              setTotalQuestions(total);
            })
            .catch(() => {});
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [activeTab, currentPage, searchQuery, forumId]);

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setCurrentPage(1);
  };

  const paginationPages = () => {
    const pages: number[] = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  };

  return (
    <div className="py-4 px-4 md:py-6 md:px-6">
      {/* Header */}
      <div key={`header-${searchQuery}-${forumId}-${activeTab}`} className="mb-4 animate-fade-in">
        <h1 className="text-xl md:text-2xl font-bold text-[#1a1a1a]">
          {searchQuery
            ? `Search Results for "${searchQuery}"`
            : forumInfo
              ? <>Questions on <span className="text-[#f48024]">c/{forumInfo.name}</span></>
              : currentTab.heading}
        </h1>
        <p className="text-sm text-[#666] mt-1 min-h-[20px]">
          {forumInfo?.description && !searchQuery ? forumInfo.description : '\u00A0'}
        </p>
      </div>
      <p key={`count-${searchQuery}-${forumId}-${activeTab}`} className="text-sm text-[#999] mb-4 min-h-[20px] animate-fade-in transition-opacity duration-300" style={{ opacity: totalQuestions !== null ? 1 : 0 }}>
        {totalQuestions !== null ? `${totalQuestions.toLocaleString()} questions` : '\u00A0'}
      </p>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 border-b border-[#e5e5e5] pb-3">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
              activeTab === tab.id
                ? 'bg-[#f1f1f1] text-[#1a1a1a] font-medium'
                : 'text-[#999] hover:text-[#1a1a1a] hover:bg-[#f5f5f5]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Question List */}
      {loading ? (
        <div>
          {[...Array(6)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : questions.length === 0 ? (
        <div className="py-16 text-center text-[#999] text-sm animate-fade-in">No questions found.</div>
      ) : (
        questions.map((q, i) => (
          <div
            key={q.id}
            className="animate-fade-in-up"
            style={{ animationDelay: `${i * 30}ms` }}
          >
            <QuestionCard question={q} />
          </div>
        ))
      )}

      {/* Pagination */}
      {totalPages > 1 && !loading && (
        <div className="flex items-center justify-center gap-1.5 py-8 animate-fade-in">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 text-sm border border-[#d4d4d4] rounded text-[#555] hover:bg-[#f5f5f5] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Prev
          </button>

          {paginationPages()[0] > 1 && (
            <>
              <button
                onClick={() => setCurrentPage(1)}
                className="min-w-[36px] px-2 py-1.5 text-sm border border-[#d4d4d4] rounded text-[#555] hover:bg-[#f5f5f5] transition-colors"
              >
                1
              </button>
              {paginationPages()[0] > 2 && (
                <span className="px-1 text-sm text-[#999]">...</span>
              )}
            </>
          )}

          {paginationPages().map((page) => (
            <button
              key={page}
              onClick={() => setCurrentPage(page)}
              className={`min-w-[36px] px-2 py-1.5 text-sm border rounded transition-colors ${
                currentPage === page
                  ? 'bg-[#f48024] border-[#f48024] text-white font-medium'
                  : 'border-[#d4d4d4] text-[#555] hover:bg-[#f5f5f5]'
              }`}
            >
              {page}
            </button>
          ))}

          {paginationPages()[paginationPages().length - 1] < totalPages && (
            <>
              {paginationPages()[paginationPages().length - 1] < totalPages - 1 && (
                <span className="px-1 text-sm text-[#999]">...</span>
              )}
              <button
                onClick={() => setCurrentPage(totalPages)}
                className="min-w-[36px] px-2 py-1.5 text-sm border border-[#d4d4d4] rounded text-[#555] hover:bg-[#f5f5f5] transition-colors"
              >
                {totalPages}
              </button>
            </>
          )}

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 text-sm border border-[#d4d4d4] rounded text-[#555] hover:bg-[#f5f5f5] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default QuestionList;
