import { useState } from 'react';
import { ChefHat, Sparkles } from 'lucide-react';
import { useLang } from '../contexts/LanguageContext';

interface Props {
  onParse: (text: string) => void;
  isParsing: boolean;
}

export function RecipeParser({ onParse, isParsing }: Props) {
  const { t } = useLang();
  const [text, setText] = useState('');

  return (
    <div className="bg-white rounded-2xl shadow-soft p-6 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
          <ChefHat className="w-5 h-5 text-amber-500" />
        </div>
        <div>
          <h2 className="font-bold text-gray-800 text-lg">{t('pasteTitle')}</h2>
          <p className="text-sm text-gray-500">{t('pasteSubtitle')}</p>
        </div>
      </div>

      <textarea
        className="w-full h-56 p-4 rounded-xl border border-gray-200 text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent placeholder-gray-300 transition"
        placeholder={t('pastePlaceholder')}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <button
        onClick={() => text.trim() && onParse(text)}
        disabled={!text.trim() || isParsing}
        className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-200 disabled:text-gray-400 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 active:scale-95"
      >
        <Sparkles className="w-4 h-4" />
        {isParsing ? t('parseBtnLoading') : t('parseBtnIdle')}
      </button>
    </div>
  );
}
