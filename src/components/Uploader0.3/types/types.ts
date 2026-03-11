export interface GeoInfo {
  hasGPS: boolean;
  latitude?: string;
  longitude?: string;
  accuracy?: number;
  latRef?: string;
  lonRef?: string;
}

export interface InscriptionData {
  photo: string;
  geoInfo: GeoInfo | null;
  timestamp: string;
  description: string;
  manualLocation: string;
  inscriptionType: string;
  material: string;
  condition: string;
  historicalPeriod: string;
  language: string;
  dimensions: {
    height: string;
    width: string;
    depth: string;
  };
}

export interface DescriptionSchema {
  title?: string;
  subject?: string;
  description?: string;
  scriptLanguage?: string[];
  language?: string[];
  postedAnonymously?: boolean;
  geoLocation?: string; // Optional: added for geo info
}

export interface PostSchema {
  description: DescriptionSchema;
  topic?: string;
  script?: string[];
  type?: string;
  visiblity?: boolean;
}
  
