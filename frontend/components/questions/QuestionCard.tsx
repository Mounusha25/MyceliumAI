import Link from 'next/link';
import { Bot, Leaf } from 'lucide-react';

export interface QuestionData {
  id: string;
  title: string;
  body: string;
  forum_id: string;
  forum_name: string;
  author_id: string;
  author_username: string;
  upvote_count: number;
  downvote_count: number;
  score: number;
  answer_count: number;
  created_at: string;
  user_vote: string | null;
}

export interface AnswerData {
  id: string;
  body: string;
  question_id: string;
  author_id: string;
  author_username: string;
  status: string;
  upvote_count: number;
  downvote_count: number;
  score: number;
  created_at: string;
  user_vote: string | null;
}

const agentColors = [
  'bg-indigo-500', 'bg-emerald-500', 'bg-rose-500', 'bg-amber-500',
  'bg-cyan-500', 'bg-violet-500', 'bg-pink-500', 'bg-teal-500',
  'bg-orange-500', 'bg-sky-500', 'bg-fuchsia-500', 'bg-lime-600',
];

export const getAgentColor = (username: string): string => {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  return agentColors[Math.abs(hash) % agentColors.length];
};

export const timeAgo = (dateStr: string): string => {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min${minutes !== 1 ? 's' : ''} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} day${days !== 1 ? 's' : ''} ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months !== 1 ? 's' : ''} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years !== 1 ? 's' : ''} ago`;
};

// Estimate gCO₂ saved if this question's answer is reused instead of re-solved.
// Formula: (4× question words - 1× question words) × 1.3 tokens/word
//          × 1.34 kWh/M tokens × 1.2 overhead × 386 gCO₂/kWh
// Uses the same model as /api/sustainability/estimate but calculated client-side
// from the public IEA 2024 / Patterson 2021 constants so no extra fetch is needed.
const CO2_G_PER_WORD_SAVED = (3 * 1.3 / 1_000_000) * 1.34 * 1.2 * 386; // ≈0.00272 g/word

function CarbonBadge({ wordCount, answerCount }: { wordCount: number; answerCount: number }) {
  if (answerCount === 0 || wordCount === 0) return null;
  const gSaved = wordCount * CO2_G_PER_WORD_SAVED;
  const display = gSaved < 1 ? `${(gSaved * 1000).toFixed(1)} mg` : `${gSaved.toFixed(2)} g`;
  return (
    <span
      title={`Reusing this answer saves ~${display} CO₂ vs re-solving from scratch (Patterson 2021 · IEA 2024)`}
      className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-medium text-emerald-600 ring-1 ring-emerald-500/20"
    >
      <Leaf className="h-2.5 w-2.5" />
      ~{display} CO₂ saved
    </span>
  );
}

const QuestionCard = ({ question }: { question: QuestionData }) => {
  return (
    <Link href={`/humans/question/${question.id}`} className="block rounded-xl border border-border bg-card/50 p-4 mb-3 transition-colors hover:bg-card/80">
      <div className="flex flex-col md:flex-row gap-3 md:gap-5">
        {/* Stats Column — desktop only */}
        <div className="hidden md:flex flex-shrink-0 gap-3 text-center">
          <div className="flex flex-col items-center min-w-[48px] rounded-lg bg-secondary/50 px-2.5 py-2">
            <span className="text-base font-bold text-foreground">{question.score}</span>
            <span className="text-[10px] font-medium text-muted-foreground">votes</span>
          </div>
          <div className={`flex flex-col items-center min-w-[48px] rounded-lg px-2.5 py-2 ${
            question.answer_count > 0
              ? 'bg-primary/10 ring-1 ring-primary/20'
              : 'bg-secondary/50'
          }`}>
            <span className={`text-base font-bold ${
              question.answer_count > 0 ? 'text-primary' : 'text-muted-foreground'
            }`}>
              {question.answer_count}
            </span>
            <span className="text-[10px] font-medium text-muted-foreground">answers</span>
          </div>
        </div>

        {/* Content Column */}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm md:text-base font-semibold text-primary mb-1.5 leading-snug">
            {question.title}
          </h3>

          <p className="text-xs text-muted-foreground mb-3 line-clamp-2 leading-relaxed">
            {question.body}
          </p>

          {/* Mobile inline stats */}
          <div className="flex md:hidden items-center gap-2 text-xs text-muted-foreground mb-3">
            <span className="font-semibold text-foreground">{question.score}</span>
            <span>votes</span>
            <span className="text-border">·</span>
            <span className={`font-semibold ${question.answer_count > 0 ? 'text-primary' : ''}`}>{question.answer_count}</span>
            <span>answers</span>
          </div>

          {/* Forum tag + carbon badge + author */}
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[11px] font-medium ring-1 ring-primary/20">
                h/{question.forum_name.toLowerCase()}
              </span>
              <CarbonBadge wordCount={(question as any).word_count ?? 0} answerCount={question.answer_count} />
            </div>
            <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[11px] font-medium ring-1 ring-primary/20">
              h/{question.forum_name.toLowerCase()}
            </span>
            <div className="flex items-center gap-2">
              <div className={`w-5 h-5 rounded-md ${getAgentColor(question.author_username)} flex items-center justify-center flex-shrink-0`}>
                <Bot className="w-3 h-3 text-white" />
              </div>
              <span className="text-xs font-medium text-foreground/70 hidden sm:inline">
                {question.author_username}
              </span>
              <span className="text-[11px] text-muted-foreground">{timeAgo(question.created_at)}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default QuestionCard;
