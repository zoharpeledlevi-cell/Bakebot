import { useRecipeParser } from './hooks/useRecipeParser'
import { useScaling } from './hooks/useScaling'
import { useSubstitutes } from './hooks/useSubstitutes'
import { RecipeParser } from './components/RecipeParser'
import { ScalingControls } from './components/ScalingControls'
import { ScaleByIngredient } from './components/ScaleByIngredient'
import { RecipeCard } from './components/RecipeCard'
import { SubstituteModal } from './components/SubstituteModal'
import { useLang } from './contexts/LanguageContext'
import { ChefHat, RotateCcw } from 'lucide-react'

export default function App() {
  const { isRTL, t, toggleLang } = useLang()

  const {
    recipe, setRecipe, isParsing, parseRecipe,
    updateIngredient, updateTitle, updateCategory,
    toggleChecked, clearRecipe,
  } = useRecipeParser()

  const { currentFactor, applyScale, scaleByIngredient, resetScale, resetFactor } = useScaling(recipe, setRecipe)

  const {
    isOpen: subOpen,
    activeIngredient,
    substitutes,
    chefNote,
    rejectedIndices,
    isLoading: subLoading,
    openSubstitutes,
    closeSubstitutes,
    rejectSubstitute,
  } = useSubstitutes()

  const handleNewRecipe = () => {
    clearRecipe()
    resetFactor()
  }

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} className="min-h-screen bg-[#F9FAFB]">
      {/* ── Header ── */}
      <header className="bg-white border-b border-gray-100 sticky top-0 z-30 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center shadow-md">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-extrabold text-gray-900 text-xl leading-none">BakeBot</h1>
              <p className="text-xs text-amber-500 font-medium">{t('tagline')}</p>
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {recipe && (
              <button
                onClick={handleNewRecipe}
                className="flex items-center gap-1.5 text-sm font-semibold px-3 py-2 rounded-xl border border-amber-300 text-amber-600 hover:bg-amber-50 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                {t('newRecipe')}
              </button>
            )}

            <button
              onClick={toggleLang}
              className="text-xs font-bold px-3 py-2 rounded-xl border border-gray-200 text-gray-500 hover:border-amber-300 hover:text-amber-600 transition-all"
            >
              {t('langToggle')}
            </button>
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-8">
        {!recipe ? (
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="text-center space-y-2 pb-2">
              <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
                {t('heroTitle1')}{' '}
                <span className="text-amber-500">{t('heroTitleAccent')}</span>
              </h2>
              <p className="text-gray-500 text-sm sm:text-base">{t('heroSubtitle')}</p>
            </div>
            <RecipeParser onParse={parseRecipe} isParsing={isParsing} />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-start">
            {/* Recipe card — first in DOM so it shows first on mobile */}
            <div className="lg:col-span-2 lg:order-2">
              <RecipeCard
                recipe={recipe}
                onToggleChecked={toggleChecked}
                onSubstitute={(id, name) => openSubstitutes(id, name, recipe)}
                onUpdateIngredient={updateIngredient}
                onUpdateTitle={updateTitle}
                onUpdateCategory={updateCategory}
              />
            </div>

            {/* Sidebar — shown below RecipeCard on mobile, left on desktop */}
            <div className="lg:col-span-1 lg:order-1 space-y-4">
              <ScalingControls
                currentFactor={currentFactor}
                onScale={applyScale}
                onReset={resetScale}
              />
              <ScaleByIngredient
                ingredients={recipe.ingredients}
                onScale={scaleByIngredient}
              />
            </div>
          </div>
        )}
      </main>

      {/* Substitute slide-in panel */}
      <SubstituteModal
        isOpen={subOpen}
        ingredientName={activeIngredient?.name ?? ''}
        substitutes={substitutes}
        chefNote={chefNote}
        rejectedIndices={rejectedIndices}
        isLoading={subLoading}
        onClose={closeSubstitutes}
        onReject={rejectSubstitute}
      />
    </div>
  )
}
