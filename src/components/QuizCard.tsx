import React from 'react';
import { cn } from '@/utils/cn';
import type { Quiz } from '@/types';
import Badge from './Badge';
import Button from './Button';
import { Play, HelpCircle, Clock } from 'lucide-react';

export interface QuizCardProps {
  quiz: Quiz;
  onClick?: () => void;
  onStart?: () => void;
  showStart?: boolean;
  className?: string;
}

const difficultyVariant: Record<string, 'primary' | 'warning' | 'error'> = {
  beginner: 'primary',
  intermediate: 'warning',
  advanced: 'error',
};

const statusVariant: Record<string, 'success' | 'slate'> = {
  published: 'success',
  draft: 'slate',
  archived: 'slate',
};

const QuizCard: React.FC<QuizCardProps> = ({
  quiz,
  onClick,
  onStart,
  showStart = true,
  className,
}) => {
  const handleCardClick = () => {
    onClick?.();
  };

  const handleStartClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onStart?.();
  };

  return (
    <div
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && onClick) {
          e.preventDefault();
          onClick();
        }
      }}
      className={cn(
        'rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden transition-all hover:shadow-md cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary-500/30',
        className
      )}
      aria-label={`Quiz: ${quiz.title}`}
    >
      <div className="p-5">
        <div className="flex items-start justify-between mb-3 gap-3">
          <h3 className="text-lg font-semibold text-dark-900 leading-tight">
            {quiz.title}
          </h3>
          <Badge variant={statusVariant[quiz.status] || 'slate'}>
            {quiz.status.charAt(0).toUpperCase() + quiz.status.slice(1)}
          </Badge>
        </div>

        {quiz.description && (
          <p className="text-sm text-slate-500 mb-4 line-clamp-2">
            {quiz.description}
          </p>
        )}

        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="slate" size="sm">
            <HelpCircle className="h-3 w-3 mr-1" />
            {quiz.questionCount} Questions
          </Badge>
          <Badge variant="cyan" size="sm">
            <Clock className="h-3 w-3 mr-1" />
            {quiz.durationMins} Min
          </Badge>
          <Badge
            variant={difficultyVariant[quiz.difficulty] || 'slate'}
            size="sm"
          >
            {quiz.difficulty.charAt(0).toUpperCase() + quiz.difficulty.slice(1)}
          </Badge>
        </div>

        <div className="flex items-center justify-between">
          <Badge variant="amber" size="sm">
            {quiz.category}
          </Badge>
          {showStart && onStart && (
            <Button
              size="sm"
              leftIcon={<Play className="h-4 w-4" />}
              onClick={handleStartClick}
            >
              Start Quiz
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizCard;
