export interface PropertyData {
  id: string;
  title: string;
  propertyType: string;
  price: string;
  currency: string;
  bedrooms: number | string;
  bathrooms: number | string;
  area: string;
  lotSize: string;
  yearBuilt: number | string;
  description: string;
  latitude: number;
  longitude: number;
  address: string;
  features: string[];
  staticMapConfig: {
    zoom: number;
    mapType: 'roadmap' | 'satellite' | 'hybrid' | 'terrain';
    markerColor: string;
    markerLabel: string;
    width: number;
    height: number;
    scale: number;
  };
  aiReport?: {
    text: string;
    type: string;
    model: string;
    timestamp: number;
  };
}

export type MapTypeOption = 'roadmap' | 'satellite' | 'hybrid' | 'terrain';
