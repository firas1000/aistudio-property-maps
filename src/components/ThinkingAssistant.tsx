import React, { useState } from 'react';
import { PropertyData } from '../types/property';
import {
  Sparkles,
  Brain,
  Compass,
  FileText,
  Sun,
  Send,
  Loader2,
  Copy,
  Check,
  ArrowRight,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface ThinkingAssistantProps {
  property: PropertyData;
  onApplyDescription?: (newDescription: string) => void;
}

export const ThinkingAssistant: React.FC<ThinkingAssistantProps> = ({
  property,
  onApplyDescription,
}) => {
  const [activeTab, setActiveTab] = useState<'appraisal' | 'copywrite' | 'environmental' | 'custom'>('appraisal');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resultText, setResultText] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [thinkingSteps, setThinkingSteps] = useState<string[]>([]);
  const [showThinkingDetails, setShowThinkingDetails] = useState(true);

  const runQuery = async (type: 'deep_analysis' | 'enhance_description' | 'environmental' | 'custom_query', userPrompt?: string) => {
    setIsLoading(true);
    setErrorMsg('');
    setResultText('');
    setThinkingSteps([
      `Initializing Gemini 4 Argon with ThinkingLevel.HIGH...`,
      `Locating parcel at coordinates (${property.latitude.toFixed(6)}, ${property.longitude.toFixed(6)})...`,
      `Synthesizing regional geography, climate, and topography context...`,
      `Cross-referencing specs (${property.bedrooms || '—'} beds, ${property.area || '—'}, ${property.propertyType})...`,
      `Formulating multi-tier strategic insights...`,
    ]);

    try {
      const response = await fetch('/api/gemini/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          property,
          userPrompt,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to process AI thinking query');
      }

      setResultText(data.text);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('AI Query failed:', msg);
      setErrorMsg(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!resultText) return;
    navigator.clipboard.writeText(resultText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper to extract clean text if user wants to apply to description
  const handleApplyToDesc = () => {
    if (!resultText || !onApplyDescription) return;
    onApplyDescription(resultText);
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-stone-200/90 overflow-hidden">
      {/* Header with High-Thinking Badges */}
      <div className="px-6 py-5 bg-gradient-to-r from-purple-950 via-indigo-950 to-stone-950 text-white border-b border-indigo-900/50 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/20 text-indigo-300 rounded-xl border border-indigo-400/30 backdrop-blur-xs">
            <Brain className="w-5 h-5 text-indigo-400 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold tracking-tight text-white">
                Gemini 4 Argon Intelligence
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/30 text-purple-200 border border-purple-400/30 uppercase">
                High Thinking
              </span>
            </div>
            <p className="text-xs text-indigo-200/80 mt-0.5">
              Deep reasoning incorporating spatial coordinates, topography, architectural specs &amp; valuation.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-indigo-300/70 font-mono text-[11px]">Model: gemini-4-argon</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="px-6 pt-4 bg-stone-50 border-b border-stone-200 flex flex-wrap gap-2 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('appraisal')}
          className={`px-4 py-2.5 rounded-t-xl transition-colors flex items-center gap-1.5 ${
            activeTab === 'appraisal'
              ? 'bg-white text-indigo-700 border-t-2 border-indigo-600 shadow-2xs font-bold'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Geospatial &amp; Market Appraisal</span>
        </button>

        <button
          onClick={() => setActiveTab('copywrite')}
          className={`px-4 py-2.5 rounded-t-xl transition-colors flex items-center gap-1.5 ${
            activeTab === 'copywrite'
              ? 'bg-white text-indigo-700 border-t-2 border-indigo-600 shadow-2xs font-bold'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Listing Copy Enhancer (3 Tiers)</span>
        </button>

        <button
          onClick={() => setActiveTab('environmental')}
          className={`px-4 py-2.5 rounded-t-xl transition-colors flex items-center gap-1.5 ${
            activeTab === 'environmental'
              ? 'bg-white text-indigo-700 border-t-2 border-indigo-600 shadow-2xs font-bold'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Sun className="w-4 h-4" />
          <span>Solar &amp; Microclimate Analysis</span>
        </button>

        <button
          onClick={() => setActiveTab('custom')}
          className={`px-4 py-2.5 rounded-t-xl transition-colors flex items-center gap-1.5 ${
            activeTab === 'custom'
              ? 'bg-white text-indigo-700 border-t-2 border-indigo-600 shadow-2xs font-bold'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Custom Complex Query</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="p-6 md:p-8 space-y-6">
        {/* Appraisal Tab */}
        {activeTab === 'appraisal' && (
          <div className="space-y-4">
            <div className="p-4 bg-indigo-50/60 rounded-2xl border border-indigo-100 flex items-start justify-between gap-4">
              <div>
                <h3 className="font-bold text-indigo-950 text-sm mb-1">
                  Comprehensive Geospatial &amp; Investment Intelligence Report
                </h3>
                <p className="text-xs text-stone-600">
                  Activates deep multi-step reasoning over the property coordinates ({property.latitude.toFixed(5)}, {property.longitude.toFixed(5)}), evaluate regional demographic trends, microclimate suitability, and value-add vectors.
                </p>
              </div>

              <button
                onClick={() => runQuery('deep_analysis')}
                disabled={isLoading}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-2 shrink-0 disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Reasoning...</span>
                  </>
                ) : (
                  <>
                    <Brain className="w-4 h-4" />
                    <span>Generate Deep Analysis</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Copywriter Tab */}
        {activeTab === 'copywrite' && (
          <div className="space-y-4">
            <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-100 flex items-start justify-between gap-4">
              <div>
                <h3 className="font-bold text-purple-950 text-sm mb-1">
                  Generate 3 Professional Copy Variations
                </h3>
                <p className="text-xs text-stone-600">
                  Elevates the current raw description into 3 crafted styles: Luxury Storytelling, High-End MLS Listing, and Social Media Hook.
                </p>
              </div>

              <button
                onClick={() => runQuery('enhance_description')}
                disabled={isLoading || !property.description.trim()}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-2 shrink-0 disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Crafting Copy...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Enhance Descriptions</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Environmental Tab */}
        {activeTab === 'environmental' && (
          <div className="space-y-4">
            <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-100 flex items-start justify-between gap-4">
              <div>
                <h3 className="font-bold text-amber-950 text-sm mb-1">
                  Solar Trajectory, Orientation &amp; Resilience
                </h3>
                <p className="text-xs text-stone-600">
                  Analyzes solar sun paths, seasonal daylight exposure, natural cross-ventilation, and climate resilience for coordinates {property.latitude.toFixed(5)}, {property.longitude.toFixed(5)}.
                </p>
              </div>

              <button
                onClick={() => runQuery('environmental')}
                disabled={isLoading}
                className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-2 shrink-0 disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Analyzing Sun &amp; Climate...</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-4 h-4" />
                    <span>Run Solar Analysis</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Custom Query Tab */}
        {activeTab === 'custom' && (
          <div className="space-y-4">
            <div className="p-4 bg-stone-100/80 rounded-2xl border border-stone-200">
              <label className="block text-xs font-bold text-stone-900 uppercase tracking-wider mb-2">
                Ask a complex question about this property &amp; location:
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="e.g., How would building an accessory dwelling unit (ADU) perform as a short-term rental here?"
                  className="flex-1 px-4 py-2.5 bg-white border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-stone-900"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      if (customPrompt.trim()) runQuery('custom_query', customPrompt);
                    }
                  }}
                />
                <button
                  onClick={() => runQuery('custom_query', customPrompt)}
                  disabled={isLoading || !customPrompt.trim()}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>Ask AI</span>
                </button>
              </div>

              {/* Sample prompts */}
              <div className="mt-3 flex flex-wrap gap-1.5 text-[11px] text-stone-500">
                <span className="font-semibold text-stone-700">Quick ideas:</span>
                {[
                  'Assess cap rate and rental yields for this area',
                  'Evaluate sunlight and solar roof capacity',
                  'What luxury features would add the highest ROI here?',
                ].map((sample, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setCustomPrompt(sample);
                      runQuery('custom_query', sample);
                    }}
                    className="px-2 py-0.5 bg-white hover:bg-stone-200 text-stone-700 rounded border border-stone-200 transition-colors"
                  >
                    "{sample}"
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Loading State with Thinking steps */}
        {isLoading && (
          <div className="p-6 bg-indigo-50/50 rounded-2xl border border-indigo-100 flex flex-col items-center justify-center text-center space-y-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg animate-bounce">
                <Brain className="w-6 h-6" />
              </div>
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-purple-500 rounded-full animate-ping"></span>
            </div>

            <div>
              <h4 className="font-bold text-indigo-950 text-base">
                Gemini 4 Argon Thinking in Progress...
              </h4>
              <p className="text-xs text-stone-500 mt-0.5">
                Applying maximum reasoning level (ThinkingLevel.HIGH) to formulate multi-dimensional analysis.
              </p>
            </div>

            {/* Simulated Reasoning Timeline */}
            <div className="w-full max-w-md bg-white p-3 rounded-xl border border-indigo-200/80 text-left space-y-2 shadow-2xs font-mono text-[11px]">
              {thinkingSteps.map((step, idx) => (
                <div key={idx} className="flex items-center gap-2 text-stone-600">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0"></span>
                  <span>{step}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Error message */}
        {errorMsg && (
          <div className="p-4 bg-rose-50 rounded-2xl border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <p className="font-semibold">Analysis Failed</p>
              <p>{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Results Display */}
        {resultText && (
          <div className="p-6 bg-stone-50 rounded-2xl border border-stone-200 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-stone-200">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <h4 className="font-bold text-stone-900 text-sm uppercase tracking-wider">
                  Analysis Results
                </h4>
                <span className="text-[11px] font-mono text-stone-400">
                  (gemini-4-argon · ThinkingLevel.HIGH)
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="px-3 py-1 bg-white hover:bg-stone-100 text-stone-700 text-xs font-medium rounded-lg border border-stone-200 shadow-2xs transition-colors flex items-center gap-1.5"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-stone-500" />
                      <span>Copy Result</span>
                    </>
                  )}
                </button>

                {onApplyDescription && (
                  <button
                    onClick={handleApplyToDesc}
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-2xs transition-colors flex items-center gap-1.5"
                    title="Insert this text into the property description"
                  >
                    <ArrowRight className="w-3.5 h-3.5" />
                    <span>Apply to Description</span>
                  </button>
                )}
              </div>
            </div>

            {/* Markdown Output Text */}
            <div className="prose prose-stone max-w-none text-stone-800 text-sm leading-relaxed whitespace-pre-line font-sans">
              {resultText}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
