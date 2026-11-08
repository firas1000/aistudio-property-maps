import React, { useState } from 'react';
import { PropertyData } from '../types/property';
import { parseCoordinates, isValidLatLng } from '../utils/coordinateParser';
import {
  MapPin,
  Sparkles,
  Navigation,
  Globe,
  Plus,
  X,
  FileText,
  DollarSign,
  Home,
  Check,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface PropertyFormProps {
  initialProperty: PropertyData;
  onSaveProperty: (property: PropertyData) => void;
  onOpenMapPicker: () => void;
  onTriggerAiEnhance: (property: PropertyData) => void;
  isAiLoading?: boolean;
}

const COMMON_FEATURES = [
  'Ocean View',
  'Mountain View',
  'Private Pool',
  'Rooftop Terrace',
  'Solar Energy',
  'EV Charger',
  'Smart Home',
  'Wine Cellar',
  'Fireplace',
  'Garden & Patio',
  'Guest House',
  'Gated Security',
];

export const PropertyForm: React.FC<PropertyFormProps> = ({
  initialProperty,
  onSaveProperty,
  onOpenMapPicker,
  onTriggerAiEnhance,
  isAiLoading = false,
}) => {
  const [formData, setFormData] = useState<PropertyData>(initialProperty);
  const [quickCoordInput, setQuickCoordInput] = useState('');
  const [coordError, setCoordError] = useState('');
  const [newFeatureText, setNewFeatureText] = useState('');
  const [showHelpTooltip, setShowHelpTooltip] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync if initialProperty changes
  React.useEffect(() => {
    setFormData(initialProperty);
  }, [initialProperty]);

  // Handle Quick Paste of Coordinates or Maps URL
  const handleQuickCoordParse = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuickCoordInput(val);

    if (!val.trim()) {
      setCoordError('');
      return;
    }

    const parsed = parseCoordinates(val);
    if (parsed.isValid) {
      setFormData((prev) => ({
        ...prev,
        latitude: parsed.latitude,
        longitude: parsed.longitude,
      }));
      setCoordError('');
    } else {
      setCoordError('Could not recognize coordinates. Try "34.0259, -118.7797" or a Google Maps link.');
    }
  };

  // Handle direct Lat/Lng input
  const handleLatChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setFormData((prev) => ({ ...prev, latitude: isNaN(val) ? 0 : val }));
  };

  const handleLngChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setFormData((prev) => ({ ...prev, longitude: isNaN(val) ? 0 : val }));
  };

  // Browser Geolocation
  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setFormData((prev) => ({
          ...prev,
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        }));
        setQuickCoordInput(`${pos.coords.latitude.toFixed(6)}, ${pos.coords.longitude.toFixed(6)}`);
        setCoordError('');
      },
      (err) => {
        console.warn('Geolocation failed:', err);
        setCoordError('Unable to retrieve location. Please check browser permissions.');
      }
    );
  };

  // Add / Remove Feature tag
  const handleToggleFeature = (feature: string) => {
    setFormData((prev) => {
      const exists = prev.features.includes(feature);
      return {
        ...prev,
        features: exists ? prev.features.filter((f) => f !== feature) : [...prev.features, feature],
      };
    });
  };

  const handleAddCustomFeature = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeatureText.trim()) return;
    if (!formData.features.includes(newFeatureText.trim())) {
      setFormData((prev) => ({
        ...prev,
        features: [...prev.features, newFeatureText.trim()],
      }));
    }
    setNewFeatureText('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isValidLatLng(formData.latitude, formData.longitude)) {
      setCoordError('Please enter valid latitude (-90 to 90) and longitude (-180 to 180).');
      return;
    }

    onSaveProperty(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const insertTemplate = (type: 'luxury' | 'cozy' | 'investment') => {
    let tpl = '';
    if (type === 'luxury') {
      tpl = `A distinguished private estate embodying contemporary architectural elegance. Designed with soaring ceilings, extensive glass walls that capture sweeping horizons, and natural stone finishes throughout. The bespoke kitchen features premier European appliances and a waterfall island, while the expansive outdoor terrace boasts an infinity pool, alfresco kitchen, and manicured landscaped grounds. Situated in a prestigious neighborhood with effortless access to private aviation, fine dining, and cultural amenities.`;
    } else if (type === 'cozy') {
      tpl = `Warm and inviting sun-drenched residence offering a tranquil neighborhood retreat. Boasting an open-concept living pavilion with a wood-burning fireplace, warm hardwood floors, and a renovated chef's kitchen. The serene backyard features mature fruit trees, a covered patio dining space, and garden beds. Located on a quiet tree-lined street close to local artisan cafes, top-rated schools, and parks.`;
    } else {
      tpl = `Exceptional prime real estate asset with substantial appreciation and income upside. Features versatile zoning, robust historical rental performance, and low vacancy metrics in a high-demand urban corridor. Upgraded mechanicals, high-efficiency HVAC, and turn-key modern interior finishes ensure steady yields with minimal maintenance overhead.`;
    }
    setFormData((prev) => ({ ...prev, description: tpl }));
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-xl border border-stone-200/90 overflow-hidden">
      {/* Form Header */}
      <div className="px-6 py-5 bg-gradient-to-r from-stone-50 to-stone-100/80 border-b border-stone-200 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-stone-900 tracking-tight flex items-center gap-2">
            <Home className="w-5 h-5 text-indigo-600" />
            <span>Describe Property &amp; Coordinates</span>
          </h2>
          <p className="text-xs text-stone-500 mt-0.5">
            Fill in the property description and input exact Google Maps coordinates to generate the preview.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {saveSuccess && (
            <span className="text-xs font-medium text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              <Check className="w-3.5 h-3.5" /> Updated!
            </span>
          )}
          <button
            type="submit"
            className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl shadow-sm transition-colors flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" /> Save &amp; Display
          </button>
        </div>
      </div>

      <div className="p-6 md:p-8 space-y-8">
        {/* SECTION 1: Core Property Information */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
              1. Basic Property Details
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-8">
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Property Title / Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Modern Cliffside Villa, Downtown Sky Loft"
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-stone-900 font-medium placeholder-stone-400"
              />
            </div>

            <div className="md:col-span-4">
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Property Type
              </label>
              <select
                value={formData.propertyType}
                onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-stone-900 font-medium"
              >
                <option value="Single Family Home">Single Family Home</option>
                <option value="Luxury Coastal Estate">Luxury Coastal Estate</option>
                <option value="Penthouse Residence">Penthouse Residence</option>
                <option value="Alpine Ski Chalet">Alpine Ski Chalet</option>
                <option value="Modern Villa">Modern Villa</option>
                <option value="Historic Townhouse">Historic Townhouse</option>
                <option value="Commercial Office / Retail">Commercial / Retail</option>
                <option value="Ranch & Acreage">Ranch &amp; Acreage</option>
                <option value="Vacation Rental">Vacation Rental</option>
                <option value="Cave Residence & Villa">Cave Residence &amp; Villa</option>
              </select>
            </div>

            <div className="md:col-span-6">
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Price or Estimated Value
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="e.g. $2,450,000 or €1,800,000"
                  className="w-full px-3.5 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-stone-900"
                />
              </div>
            </div>

            <div className="md:col-span-6">
              <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                Street Address or Region
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="e.g. 100 Ocean Blvd, Malibu, CA 90265"
                className="w-full px-3.5 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-stone-900"
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: Google Maps Coordinates Input */}
        <div className="p-5 bg-indigo-50/50 rounded-2xl border border-indigo-100">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <h3 className="text-sm font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4 text-indigo-600" />
              <span>2. Google Maps Coordinates</span>
            </h3>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleGetCurrentLocation}
                className="px-2.5 py-1 text-xs font-medium text-stone-700 bg-white hover:bg-stone-100 border border-stone-300 rounded-lg shadow-2xs transition-colors flex items-center gap-1"
                title="Use device GPS location"
              >
                <Navigation className="w-3 h-3 text-indigo-600" />
                <span>My Location</span>
              </button>

              <button
                type="button"
                onClick={onOpenMapPicker}
                className="px-3 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors flex items-center gap-1"
                title="Open interactive Google Map to click and pick coordinates"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Pick on Map</span>
              </button>
            </div>
          </div>

          <p className="text-xs text-stone-600 mb-4">
            Enter the exact latitude and longitude of the property. You can paste coordinates from Google Maps (e.g.{' '}
            <code className="bg-white px-1.5 py-0.5 rounded border border-indigo-200 text-indigo-900 font-mono text-[11px]">
              34.025922, -118.779757
            </code>
            ) or paste a full Google Maps share link!
          </p>

          {/* Smart Paste Box */}
          <div className="mb-4">
            <label className="block text-xs font-semibold text-stone-800 mb-1 flex items-center justify-between">
              <span>Quick Paste (Coordinates or Google Maps Link)</span>
              <button
                type="button"
                onClick={() => setShowHelpTooltip(!showHelpTooltip)}
                className="text-indigo-600 hover:text-indigo-800 text-[11px] flex items-center gap-1"
              >
                <HelpCircle className="w-3 h-3" /> Format Help
              </button>
            </label>

            <input
              type="text"
              value={quickCoordInput}
              onChange={handleQuickCoordParse}
              placeholder="Paste e.g. 34.0259, -118.7797 OR https://maps.google.com/..."
              className="w-full px-3.5 py-2.5 bg-white border border-indigo-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-stone-900 font-mono placeholder:font-sans placeholder-stone-400 shadow-2xs"
            />

            {showHelpTooltip && (
              <div className="mt-2 p-3 bg-white rounded-xl border border-indigo-200 text-xs text-stone-600 space-y-1">
                <p className="font-semibold text-stone-800">Supported Google Maps Formats:</p>
                <ul className="list-disc pl-4 space-y-0.5 font-mono text-[11px] text-stone-600">
                  <li>Decimal: 37.7749, -122.4194</li>
                  <li>DMS: 37°46'29.6"N 122°25'09.8"W</li>
                  <li>Google Maps URL: https://www.google.com/maps/@37.774929,-122.4194155,17z</li>
                  <li>Google Maps search link: https://maps.google.com/?q=37.7749,-122.4194</li>
                </ul>
              </div>
            )}

            {coordError && (
              <p className="text-xs text-rose-600 mt-1.5 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {coordError}
              </p>
            )}
          </div>

          {/* Split Lat & Lng Input Boxes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Latitude <span className="text-rose-500">*</span> (-90.0 to 90.0)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  required
                  value={formData.latitude}
                  onChange={handleLatChange}
                  placeholder="e.g. 34.025922"
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-stone-900 font-mono shadow-2xs"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 font-mono">
                  °N/S
                </span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                Longitude <span className="text-rose-500">*</span> (-180.0 to 180.0)
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="any"
                  required
                  value={formData.longitude}
                  onChange={handleLngChange}
                  placeholder="e.g. -118.779757"
                  className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-stone-900 font-mono shadow-2xs"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-stone-400 font-mono">
                  °E/W
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: Property Description Input Box */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              <span>3. Property Description</span>
            </h3>

            {/* Quick helper templates */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-stone-400 text-[11px]">Templates:</span>
              <button
                type="button"
                onClick={() => insertTemplate('luxury')}
                className="px-2 py-0.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded text-[11px] transition-colors"
              >
                Luxury
              </button>
              <button
                type="button"
                onClick={() => insertTemplate('cozy')}
                className="px-2 py-0.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded text-[11px] transition-colors"
              >
                Cozy
              </button>
              <button
                type="button"
                onClick={() => insertTemplate('investment')}
                className="px-2 py-0.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded text-[11px] transition-colors"
              >
                Investor
              </button>
            </div>
          </div>

          <p className="text-xs text-stone-500 mb-2">
            Describe the property's design, views, architectural elements, neighborhood vibe, and special attributes.
          </p>

          <div className="relative">
            <textarea
              rows={6}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the property here... Mention layout, views, recent upgrades, craftsmanship, surrounding scenery, and atmosphere."
              className="w-full p-4 bg-stone-50 border border-stone-300 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-stone-900 leading-relaxed placeholder-stone-400"
            />

            {/* AI polish helper button right inside textarea footer */}
            <div className="mt-2 flex items-center justify-between">
              <span className="text-xs text-stone-400 font-mono">
                {formData.description ? formData.description.length : 0} characters |{' '}
                {formData.description ? formData.description.trim().split(/\s+/).length : 0} words
              </span>

              <button
                type="button"
                onClick={() => onTriggerAiEnhance(formData)}
                disabled={isAiLoading || !formData.description.trim()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-xs transition-all disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isAiLoading ? 'Reasoning with AI...' : 'AI Enhance Copy (High Thinking)'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* SECTION 4: Physical Specs */}
        <div>
          <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-3">
            4. Key Specifications
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Bedrooms</label>
              <input
                type="text"
                value={formData.bedrooms}
                onChange={(e) => setFormData({ ...formData, bedrooms: e.target.value })}
                placeholder="e.g. 4"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Bathrooms</label>
              <input
                type="text"
                value={formData.bathrooms}
                onChange={(e) => setFormData({ ...formData, bathrooms: e.target.value })}
                placeholder="e.g. 3.5"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Living Area</label>
              <input
                type="text"
                value={formData.area}
                onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                placeholder="e.g. 3,500 sq ft"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-stone-900"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Year Built</label>
              <input
                type="text"
                value={formData.yearBuilt}
                onChange={(e) => setFormData({ ...formData, yearBuilt: e.target.value })}
                placeholder="e.g. 2022"
                className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 text-stone-900"
              />
            </div>
          </div>
        </div>

        {/* SECTION 5: Amenities and Highlights */}
        <div>
          <h3 className="text-sm font-bold text-stone-900 uppercase tracking-wider mb-2">
            5. Highlights &amp; Amenities
          </h3>
          <p className="text-xs text-stone-500 mb-3">
            Select or add tags to highlight distinctive features of the property.
          </p>

          <div className="flex flex-wrap gap-2 mb-3">
            {COMMON_FEATURES.map((feature) => {
              const isSelected = formData.features.includes(feature);
              return (
                <button
                  type="button"
                  key={feature}
                  onClick={() => handleToggleFeature(feature)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'bg-stone-100 text-stone-700 hover:bg-stone-200 border border-stone-200'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 inline mr-1" />}
                  {feature}
                </button>
              );
            })}
          </div>

          {/* Add custom feature tag */}
          <div className="flex gap-2">
            <input
              type="text"
              value={newFeatureText}
              onChange={(e) => setNewFeatureText(e.target.value)}
              placeholder="Add custom feature (e.g. Heated Driveway, Zen Garden)..."
              className="flex-1 px-3 py-1.5 bg-stone-50 border border-stone-300 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-stone-900"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddCustomFeature(e);
                }
              }}
            />
            <button
              type="button"
              onClick={handleAddCustomFeature}
              className="px-3 py-1.5 bg-stone-800 hover:bg-stone-900 text-white text-xs font-medium rounded-xl transition-colors flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>
        </div>
      </div>

      {/* Form Action Footer */}
      <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
        <p className="text-xs text-stone-500">
          Google Maps static location image will refresh automatically upon saving.
        </p>

        <button
          type="submit"
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
        >
          <Check className="w-4 h-4" />
          Update Preview &amp; Map
        </button>
      </div>
    </form>
  );
};
