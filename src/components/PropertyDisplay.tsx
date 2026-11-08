import React, { useState } from 'react';
import { PropertyData, MapTypeOption } from '../types/property';
import { buildStaticMapUrl, buildGoogleMapsUrl, formatDMS } from '../utils/coordinateParser';
import {
  MapPin,
  ExternalLink,
  ZoomIn,
  ZoomOut,
  Layers,
  Copy,
  Check,
  Bed,
  Bath,
  Maximize2,
  Calendar,
  Share2,
  Sparkles,
  Download,
  Eye,
  DollarSign,
} from 'lucide-react';
import { APIProvider, Map as GoogleMap, AdvancedMarker, Pin } from '@vis.gl/react-google-maps';

interface PropertyDisplayProps {
  property: PropertyData;
  mapsApiKey: string;
  onOpenAiAssistant?: () => void;
  onEdit?: () => void;
}

export const PropertyDisplay: React.FC<PropertyDisplayProps> = ({
  property,
  mapsApiKey,
  onOpenAiAssistant,
  onEdit,
}) => {
  const [zoom, setZoom] = useState<number>(property.staticMapConfig?.zoom || 15);
  const [mapType, setMapType] = useState<MapTypeOption>(
    property.staticMapConfig?.mapType || 'roadmap'
  );
  const [markerColor, setMarkerColor] = useState<string>(
    property.staticMapConfig?.markerColor || 'red'
  );
  const [showInteractiveMap, setShowInteractiveMap] = useState<boolean>(false);
  const [imageSize, setImageSize] = useState<'compact' | 'medium' | 'wide'>('medium');
  const [copiedCoord, setCopiedCoord] = useState(false);
  const [copiedDesc, setCopiedDesc] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Dimensions based on size selection
  const sizeMap = {
    compact: { width: 340, height: 220, label: 'Small' },
    medium: { width: 480, height: 300, label: 'Medium' },
    wide: { width: 640, height: 340, label: 'Wide' },
  };

  const currentDim = sizeMap[imageSize];

  const staticMapUrl = buildStaticMapUrl({
    latitude: property.latitude,
    longitude: property.longitude,
    zoom,
    width: currentDim.width,
    height: currentDim.height,
    scale: 2,
    mapType,
    markerColor,
    markerLabel: property.title ? property.title.charAt(0) : 'P',
    apiKey: mapsApiKey,
  });

  const googleMapsSearchUrl = buildGoogleMapsUrl(property.latitude, property.longitude);
  const dms = formatDMS(property.latitude, property.longitude);

  const handleCopyCoordinates = () => {
    navigator.clipboard.writeText(`${property.latitude.toFixed(6)}, ${property.longitude.toFixed(6)}`);
    setCopiedCoord(true);
    setTimeout(() => setCopiedCoord(false), 2000);
  };

  const handleCopyDescription = () => {
    navigator.clipboard.writeText(property.description);
    setCopiedDesc(true);
    setTimeout(() => setCopiedDesc(false), 2000);
  };

  const handleDownloadImage = () => {
    const link = document.createElement('a');
    link.href = staticMapUrl;
    link.target = '_blank';
    link.download = `${property.title.replace(/\s+/g, '-').toLowerCase()}-map.png`;
    link.click();
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-stone-200/80 overflow-hidden transition-all">
      {/* Top Banner: Status & Actions */}
      <div className="px-6 py-4 bg-gradient-to-r from-stone-900 via-stone-800 to-stone-900 text-white flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            {property.propertyType || 'Property Listing'}
          </span>
          {property.price && (
            <span className="text-xl font-bold tracking-tight text-white flex items-center">
              {property.price}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {onEdit && (
            <button
              onClick={onEdit}
              className="px-3.5 py-1.5 text-xs font-medium bg-stone-700 hover:bg-stone-600 rounded-lg text-white transition-colors"
            >
              Edit Details
            </button>
          )}
          {onOpenAiAssistant && (
            <button
              onClick={onOpenAiAssistant}
              className="px-3.5 py-1.5 text-xs font-medium bg-indigo-600 hover:bg-indigo-500 rounded-lg text-white transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI Deep Thinking
            </button>
          )}
          <a
            href={googleMapsSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 text-stone-300 hover:text-white bg-stone-700/60 hover:bg-stone-600 rounded-lg transition-colors"
            title="Open in Google Maps"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      <div className="p-6 md:p-8">
        {/* Title and Coordinates Row */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-extrabold text-stone-900 tracking-tight mb-2">
            {property.title || 'Untitled Property'}
          </h1>

          <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs md:text-sm text-stone-600">
            {property.address && (
              <span className="flex items-center gap-1 text-stone-700 font-medium">
                <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                {property.address}
              </span>
            )}

            {/* Clickable Coordinates with Copy */}
            <button
              onClick={handleCopyCoordinates}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-mono transition-colors"
              title="Click to copy exact latitude & longitude"
            >
              <MapPin className="w-3.5 h-3.5 text-indigo-600" />
              <span>
                {property.latitude.toFixed(6)}, {property.longitude.toFixed(6)}
              </span>
              {copiedCoord ? (
                <Check className="w-3.5 h-3.5 text-emerald-600 ml-1" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-stone-400 ml-1" />
              )}
            </button>

            <span className="text-xs text-stone-400 font-mono">
              ({dms.latDMS}, {dms.lngDMS})
            </span>
          </div>
        </div>

        {/* Specs Highlights Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 bg-stone-50 rounded-2xl border border-stone-200/80 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white text-stone-700 rounded-xl shadow-xs border border-stone-200">
              <Bed className="w-4 h-4 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs text-stone-500 font-medium uppercase tracking-wider">Bedrooms</p>
              <p className="text-sm font-bold text-stone-800">{property.bedrooms || '—'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white text-stone-700 rounded-xl shadow-xs border border-stone-200">
              <Bath className="w-4 h-4 text-cyan-600" />
            </div>
            <div>
              <p className="text-xs text-stone-500 font-medium uppercase tracking-wider">Bathrooms</p>
              <p className="text-sm font-bold text-stone-800">{property.bathrooms || '—'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white text-stone-700 rounded-xl shadow-xs border border-stone-200">
              <Maximize2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-stone-500 font-medium uppercase tracking-wider">Area</p>
              <p className="text-sm font-bold text-stone-800">{property.area || '—'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white text-stone-700 rounded-xl shadow-xs border border-stone-200">
              <Calendar className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-stone-500 font-medium uppercase tracking-wider">Year Built</p>
              <p className="text-sm font-bold text-stone-800">{property.yearBuilt || '—'}</p>
            </div>
          </div>
        </div>

        {/* Core Layout: Description on Left, Small Google Maps Image on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT: Property Description */}
          <div className="lg:col-span-7 flex flex-col gap-6">
            <div className="bg-stone-50/70 p-6 rounded-2xl border border-stone-200/90 relative group">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-200">
                <h2 className="text-base font-bold text-stone-900 tracking-tight flex items-center gap-2">
                  <span>Property Description</span>
                </h2>
                <button
                  onClick={handleCopyDescription}
                  className="inline-flex items-center gap-1.5 text-xs text-stone-600 hover:text-stone-900 px-2.5 py-1 bg-white hover:bg-stone-100 border border-stone-200 rounded-lg shadow-xs transition-colors"
                  title="Copy description"
                >
                  {copiedDesc ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-stone-500" />
                      <span>Copy Text</span>
                    </>
                  )}
                </button>
              </div>

              {property.description ? (
                <div className="text-stone-800 text-sm md:text-base leading-relaxed whitespace-pre-line font-normal">
                  {property.description}
                </div>
              ) : (
                <div className="text-stone-400 italic text-sm py-4">
                  No description entered yet. Use the input boxes to provide property details.
                </div>
              )}

              {/* Word & char counter */}
              <div className="mt-4 pt-3 border-t border-stone-200/60 flex items-center justify-between text-xs text-stone-400">
                <span>
                  {property.description ? property.description.trim().split(/\s+/).length : 0} words
                </span>
                <span>
                  {property.description ? Math.ceil(property.description.trim().split(/\s+/).length / 200) : 0} min read
                </span>
              </div>
            </div>

            {/* Key Features & Amenities */}
            {property.features && property.features.length > 0 && (
              <div>
                <h3 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">
                  Highlights &amp; Amenities
                </h3>
                <div className="flex flex-wrap gap-2">
                  {property.features.map((feat, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center px-3 py-1.5 rounded-xl text-xs font-medium bg-stone-100 text-stone-800 border border-stone-200 shadow-2xs"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mr-2"></span>
                      {feat}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: The Small Google Maps Location Image */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="bg-stone-900 text-white rounded-2xl overflow-hidden shadow-lg border border-stone-800 flex flex-col">
              {/* Map Card Header */}
              <div className="px-4 py-3 bg-stone-950/80 border-b border-stone-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-stone-300">
                    Google Maps Location
                  </h3>
                </div>

                {/* Map Type Selector */}
                <div className="flex bg-stone-800 p-0.5 rounded-lg border border-stone-700 text-xs">
                  {(['roadmap', 'satellite', 'hybrid', 'terrain'] as MapTypeOption[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => setMapType(type)}
                      className={`px-2 py-0.5 rounded capitalize transition-colors ${
                        mapType === type
                          ? 'bg-indigo-600 text-white font-medium shadow-xs'
                          : 'text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      {type === 'satellite' ? 'Sat' : type}
                    </button>
                  ))}
                </div>
              </div>

              {/* The Map Image Container */}
              <div className="relative group overflow-hidden bg-stone-950 min-h-[220px] flex items-center justify-center">
                {showInteractiveMap && mapsApiKey ? (
                  <div className="w-full h-[280px]">
                    <APIProvider apiKey={mapsApiKey}>
                      <GoogleMap
                        mapId="DEMO_MAP_ID"
                        style={{ width: '100%', height: '100%' }}
                        defaultCenter={{ lat: property.latitude, lng: property.longitude }}
                        center={{ lat: property.latitude, lng: property.longitude }}
                        defaultZoom={zoom}
                        mapTypeId={mapType}
                        gestureHandling="cooperative"
                        internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
                      >
                        <AdvancedMarker position={{ lat: property.latitude, lng: property.longitude }}>
                          <Pin background="#DC2626" borderColor="#991B1B" glyphColor="#FFFFFF" />
                        </AdvancedMarker>
                      </GoogleMap>
                    </APIProvider>
                  </div>
                ) : (
                  <div className="relative w-full flex justify-center bg-stone-950">
                    <img
                      src={staticMapUrl}
                      alt={`Google Maps location image of ${property.title} at ${property.latitude}, ${property.longitude}`}
                      className="w-full h-auto max-h-[300px] object-cover transition-transform duration-300 group-hover:scale-[1.01]"
                      onError={() => setImgError(true)}
                    />

                    {/* Overlay badge with location details */}
                    <div className="absolute bottom-2.5 left-2.5 bg-black/75 backdrop-blur-md px-2.5 py-1 rounded-lg border border-white/10 text-[11px] font-mono text-stone-200 flex items-center gap-1.5 shadow-md pointer-events-none">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                      <span>
                        {property.latitude.toFixed(5)}, {property.longitude.toFixed(5)}
                      </span>
                    </div>

                    {/* Google branding attribution badge */}
                    <div className="absolute top-2.5 right-2.5 bg-black/60 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] text-stone-300 font-sans pointer-events-none border border-white/10">
                      Google Maps Platform
                    </div>
                  </div>
                )}

                {/* Floating Map Zoom & Action Controls */}
                <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
                  <button
                    onClick={() => setZoom((z) => Math.min(z + 1, 20))}
                    className="p-1.5 bg-black/70 hover:bg-black/90 text-white rounded-lg backdrop-blur-xs border border-white/15 shadow-sm transition-colors"
                    title="Zoom in static map image"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setZoom((z) => Math.max(z - 1, 1))}
                    className="p-1.5 bg-black/70 hover:bg-black/90 text-white rounded-lg backdrop-blur-xs border border-white/15 shadow-sm transition-colors"
                    title="Zoom out static map image"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Map Footer Controls & Quick Actions */}
              <div className="p-3 bg-stone-900 border-t border-stone-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                {/* Size toggle */}
                <div className="flex items-center gap-1 text-stone-400">
                  <span className="text-[11px]">Size:</span>
                  {(['compact', 'medium', 'wide'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => setImageSize(s)}
                      className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-mono ${
                        imageSize === s
                          ? 'bg-stone-700 text-white font-bold'
                          : 'text-stone-400 hover:text-stone-200'
                      }`}
                    >
                      {s.slice(0, 3)}
                    </button>
                  ))}
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowInteractiveMap(!showInteractiveMap)}
                    className="px-2 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded text-xs transition-colors flex items-center gap-1 border border-stone-700"
                    title="Toggle interactive map mode"
                  >
                    <Eye className="w-3 h-3 text-indigo-400" />
                    <span>{showInteractiveMap ? 'Show Static' : 'Interactive'}</span>
                  </button>

                  <a
                    href={googleMapsSearchUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-medium transition-colors flex items-center gap-1 shadow-xs"
                  >
                    <span>Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>

            {/* Geographic Coordinates Details Card */}
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200/80 text-xs text-stone-600">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-stone-900">Geospatial Position</span>
                <span className="text-[11px] font-mono text-stone-500">WGS84 Datum</span>
              </div>

              <div className="space-y-1 font-mono text-[11px]">
                <div className="flex justify-between py-0.5 border-b border-stone-200/60">
                  <span className="text-stone-500">Latitude (Decimal):</span>
                  <span className="text-stone-900 font-semibold">{property.latitude.toFixed(6)}°</span>
                </div>
                <div className="flex justify-between py-0.5 border-b border-stone-200/60">
                  <span className="text-stone-500">Longitude (Decimal):</span>
                  <span className="text-stone-900 font-semibold">{property.longitude.toFixed(6)}°</span>
                </div>
                <div className="flex justify-between py-0.5">
                  <span className="text-stone-500">DMS Coordinates:</span>
                  <span className="text-stone-800">
                    {dms.latDMS}, {dms.lngDMS}
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-2.5 border-t border-stone-200/80 flex items-center justify-between">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${property.latitude},${property.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-800 font-medium inline-flex items-center gap-1 hover:underline"
                >
                  Get Directions <ExternalLink className="w-3 h-3" />
                </a>

                <button
                  onClick={handleDownloadImage}
                  className="text-stone-500 hover:text-stone-800 inline-flex items-center gap-1"
                  title="Download static image"
                >
                  <Download className="w-3 h-3" /> Download Map
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
