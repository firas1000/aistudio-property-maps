import React, { useState, useEffect } from 'react';
import { PropertyData } from './types/property';
import { PRESET_PROPERTIES } from './data/presetProperties';
import { PropertyForm } from './components/PropertyForm';
import { PropertyDisplay } from './components/PropertyDisplay';
import { ThinkingAssistant } from './components/ThinkingAssistant';
import { MapPickerModal } from './components/MapPickerModal';
import { QuotaBanner } from './components/QuotaBanner';
import {
  MapPin,
  Sparkles,
  Plus,
  Compass,
  Layers,
  LayoutGrid,
  FileEdit,
  Eye,
  Building2,
  Check,
} from 'lucide-react';

export default function App() {
  const [quotaExceeded, setQuotaExceeded] = useState(false);
  const [mapsApiKey, setMapsApiKey] = useState<string>(
    import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''
  );
  const [properties, setProperties] = useState<PropertyData[]>(() => {
    try {
      const saved = localStorage.getItem('geoestate_properties');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // ignore
    }
    return PRESET_PROPERTIES;
  });

  const [activePropertyId, setActivePropertyId] = useState<string>(
    PRESET_PROPERTIES[0].id
  );
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'split' | 'form' | 'display'>('split');
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Active property object
  const currentProperty =
    properties.find((p) => p.id === activePropertyId) || properties[0] || PRESET_PROPERTIES[0];

  // Fetch API config (Google Maps Key) if not set via Vite env
  useEffect(() => {
    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => {
        if (data.mapsApiKey && !mapsApiKey) {
          setMapsApiKey(data.mapsApiKey);
        }
      })
      .catch((err) => console.warn('Could not fetch /api/config:', err));
  }, [mapsApiKey]);

  // Google Maps Platform Quota Defense - Tier 2 listener
  useEffect(() => {
    const handleQuota = () => {
      setQuotaExceeded(true);
    };

    window.addEventListener('gmp-quota-exceeded', handleQuota);
    return () => {
      window.removeEventListener('gmp-quota-exceeded', handleQuota);
    };
  }, []);

  // Save properties to local storage
  useEffect(() => {
    try {
      localStorage.setItem('geoestate_properties', JSON.stringify(properties));
    } catch {
      // ignore
    }
  }, [properties]);

  const handleUpdateProperty = (updated: PropertyData) => {
    setProperties((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item))
    );
  };

  const handleCreateNewProperty = () => {
    const newId = `prop-${Date.now()}`;
    const newProp: PropertyData = {
      id: newId,
      title: 'New Property Listing',
      propertyType: 'Single Family Home',
      price: '$1,250,000',
      currency: 'USD',
      bedrooms: 3,
      bathrooms: 2,
      area: '2,200 sq ft',
      lotSize: '0.25 Acres',
      yearBuilt: 2021,
      address: 'San Francisco, CA',
      latitude: 37.774929,
      longitude: -122.419416,
      description: `Contemporary urban residence with open floor layout, expansive natural light, and modern chef's kitchen. Located in a sought-after neighborhood with swift access to transit, parks, and downtown attractions.`,
      features: ['Hardwood Floors', 'High Ceilings', 'Private Backyard', 'Modern Kitchen'],
      staticMapConfig: {
        zoom: 15,
        mapType: 'roadmap',
        markerColor: 'red',
        markerLabel: 'N',
        width: 480,
        height: 320,
        scale: 2,
      },
    };

    setProperties([newProp, ...properties]);
    setActivePropertyId(newId);
    setActiveTab('form');
  };

  const handleSelectCoordinatesFromPicker = (lat: number, lng: number) => {
    const updated = {
      ...currentProperty,
      latitude: lat,
      longitude: lng,
    };
    handleUpdateProperty(updated);
  };

  const handleApplyAiDescription = (newDesc: string) => {
    const updated = {
      ...currentProperty,
      description: newDesc,
    };
    handleUpdateProperty(updated);
    setActiveTab('display');
  };

  return (
    <div className="min-h-screen bg-stone-100/70 text-stone-900 font-sans flex flex-col antialiased">
      {/* Google Maps Quota Warning Banner (Sticky at top, z-50) */}
      <QuotaBanner
        visible={quotaExceeded}
        onDismiss={() => setQuotaExceeded(false)}
      />

      {/* Main Top Navigation Bar */}
      <header className="bg-white border-b border-stone-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo & App Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-sm shadow-indigo-200">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-stone-900 tracking-tight text-lg">
                  GeoEstate
                </span>
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full border border-stone-200">
                  Google Maps Visualizer
                </span>
              </div>
              <p className="text-xs text-stone-500 hidden sm:block">
                Property descriptions &amp; exact Google Maps static location imagery
              </p>
            </div>
          </div>

          {/* Navigation Controls: Views & New */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* View Mode Switcher */}
            <div className="bg-stone-100 p-1 rounded-xl border border-stone-200 flex items-center text-xs font-medium">
              <button
                onClick={() => setActiveTab('split')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'split'
                    ? 'bg-white text-stone-900 shadow-xs font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                title="View inputs and preview side-by-side"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Split View</span>
              </button>

              <button
                onClick={() => setActiveTab('form')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'form'
                    ? 'bg-white text-stone-900 shadow-xs font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                title="Input description and coordinates"
              >
                <FileEdit className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>

              <button
                onClick={() => setActiveTab('display')}
                className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'display'
                    ? 'bg-white text-stone-900 shadow-xs font-bold'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
                title="Display description and Google Maps image"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview</span>
              </button>
            </div>

            {/* AI Assistant Toggle */}
            <button
              onClick={() => setShowAiAssistant(!showAiAssistant)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-xl border transition-all flex items-center gap-1.5 ${
                showAiAssistant
                  ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                  : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Gemini 4 Thinking</span>
            </button>

            {/* Create New Button */}
            <button
              onClick={handleCreateNewProperty}
              className="px-3.5 py-1.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Property</span>
            </button>
          </div>
        </div>
      </header>

      {/* Preset Properties Quick Bar */}
      <section className="bg-white/80 border-b border-stone-200/80 backdrop-blur-xs py-2.5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-stone-500" />
            Preset Examples:
          </span>

          {properties.map((prop) => {
            const isSelected = prop.id === activePropertyId;
            return (
              <button
                key={prop.id}
                onClick={() => setActivePropertyId(prop.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium shrink-0 transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-indigo-600 text-white shadow-xs font-semibold'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200/60'
                }`}
              >
                <MapPin className={`w-3 h-3 ${isSelected ? 'text-white' : 'text-indigo-500'}`} />
                <span className="max-w-[160px] truncate">{prop.title}</span>
                {isSelected && <Check className="w-3 h-3 ml-0.5" />}
              </button>
            );
          })}
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-8">
        {/* Gemini High-Thinking Assistant Section (Expandable or always visible) */}
        {showAiAssistant && (
          <section className="animate-in fade-in slide-in-from-top-4 duration-300">
            <ThinkingAssistant
              property={currentProperty}
              onApplyDescription={handleApplyAiDescription}
            />
          </section>
        )}

        {/* Dynamic Views: Split / Form / Display */}
        {activeTab === 'split' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Input Boxes Form */}
            <div className="lg:col-span-6 xl:col-span-5">
              <PropertyForm
                initialProperty={currentProperty}
                onSaveProperty={handleUpdateProperty}
                onOpenMapPicker={() => setIsMapPickerOpen(true)}
                onTriggerAiEnhance={() => setShowAiAssistant(true)}
                isAiLoading={isAiLoading}
              />
            </div>

            {/* Right: Display Description & Google Maps Location Image */}
            <div className="lg:col-span-6 xl:col-span-7">
              <PropertyDisplay
                property={currentProperty}
                mapsApiKey={mapsApiKey}
                onOpenAiAssistant={() => setShowAiAssistant(true)}
                onEdit={() => setActiveTab('form')}
              />
            </div>
          </div>
        ) : activeTab === 'form' ? (
          <div className="max-w-3xl mx-auto">
            <PropertyForm
              initialProperty={currentProperty}
              onSaveProperty={(prop) => {
                handleUpdateProperty(prop);
                setActiveTab('display');
              }}
              onOpenMapPicker={() => setIsMapPickerOpen(true)}
              onTriggerAiEnhance={() => setShowAiAssistant(true)}
              isAiLoading={isAiLoading}
            />
          </div>
        ) : (
          <div className="max-w-4xl mx-auto">
            <PropertyDisplay
              property={currentProperty}
              mapsApiKey={mapsApiKey}
              onOpenAiAssistant={() => setShowAiAssistant(true)}
              onEdit={() => setActiveTab('form')}
            />
          </div>
        )}
      </main>

      {/* Interactive Google Maps Coordinate Picker Modal */}
      <MapPickerModal
        isOpen={isMapPickerOpen}
        onClose={() => setIsMapPickerOpen(false)}
        initialLat={currentProperty.latitude}
        initialLng={currentProperty.longitude}
        apiKey={mapsApiKey}
        onSelectCoordinates={handleSelectCoordinatesFromPicker}
      />

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 mt-16 py-6 text-center text-xs text-stone-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="flex items-center gap-1">
            <span>Powered by</span>
            <span className="font-semibold text-stone-800">Google Maps Platform</span>
            <span>&amp;</span>
            <span className="font-semibold text-purple-700">Gemini 4 Argon (High Thinking)</span>
          </p>

          <p className="text-stone-400">
            Coordinates parsed into WGS84 Datum. Static map images generated at 2x Retina scale.
          </p>
        </div>
      </footer>
    </div>
  );
}
