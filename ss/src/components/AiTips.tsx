import { Icon } from './Icon';
import type { AiTip } from '../types';

type AiTipsProps = {
  tips: AiTip[];
  onAskAi?: () => void;
};

export function AiTips({ tips, onAskAi }: AiTipsProps) {
  const sorted = [...tips].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="bg-primary-container p-xl rounded-2xl shadow-xl relative overflow-hidden group card-hover animate-fade-in-up">
      <div className="absolute inset-0 ai-inner-glow pointer-events-none opacity-50" />
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-tertiary/30 blur-3xl rounded-full animate-pulse-glow" />
      <div className="absolute -bottom-16 -left-12 w-40 h-40 bg-on-tertiary-container/10 blur-3xl rounded-full" />

      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-lg">
          <div className="w-10 h-10 bg-on-tertiary-container rounded-lg flex items-center justify-center shadow-lg">
            <Icon name="auto_awesome" className="text-white text-[22px]" fill />
          </div>
          <h3 className="font-headline-sm text-headline-sm text-white">AI Admission Tips</h3>
        </div>
        <ul className="space-y-lg">
          {sorted.map((tip) => (
            <li key={tip.id} className="flex items-start gap-md">
              <div className="w-1.5 h-1.5 rounded-full bg-on-tertiary-container mt-2 shrink-0" />
              <p className="text-body-sm text-white/90 leading-relaxed">
                <span className="font-bold text-on-tertiary-container">{tip.title}:</span>{' '}
                {tip.body}
              </p>
            </li>
          ))}
        </ul>
        <button
          onClick={onAskAi}
          className="w-full mt-xl py-3 bg-tertiary-container text-white font-bold rounded-xl flex items-center justify-center gap-2 hover:bg-tertiary transition-colors border border-white/10 shadow-lg"
        >
          <Icon name="chat_bubble" className="text-[20px]" />
          Ask AI Anything
        </button>
      </div>
    </div>
  );
}
