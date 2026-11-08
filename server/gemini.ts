import { GoogleGenAI, ThinkingLevel } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

export interface PropertyData {
  title: string;
  propertyType: string;
  price?: string;
  bedrooms?: number | string;
  bathrooms?: number | string;
  area?: string;
  lotSize?: string;
  yearBuilt?: number | string;
  description: string;
  latitude: number;
  longitude: number;
  address?: string;
  features?: string[];
}

export type QueryType = 'deep_analysis' | 'enhance_description' | 'environmental' | 'custom_query';

export async function processGeminiQuery(
  type: QueryType,
  property: PropertyData,
  userPrompt?: string
) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in the server environment.');
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  const propertyContext = `
Property Details:
- Title: ${property.title || 'Untitled Property'}
- Type: ${property.propertyType || 'Residential'}
- Price/Value: ${property.price || 'Not specified'}
- Coordinates: Latitude ${property.latitude.toFixed(6)}, Longitude ${property.longitude.toFixed(6)}
- Address/Location: ${property.address || 'Coordinates provided'}
- Bedrooms: ${property.bedrooms ?? 'N/A'}, Bathrooms: ${property.bathrooms ?? 'N/A'}
- Floor Area: ${property.area || 'N/A'}, Lot Size: ${property.lotSize || 'N/A'}
- Year Built: ${property.yearBuilt ?? 'N/A'}
- Key Features: ${property.features && property.features.length > 0 ? property.features.join(', ') : 'None specified'}
- Current Description:
"${property.description || 'No description provided yet.'}"
`.trim();

  let prompt = '';
  let systemInstruction = '';

  if (type === 'deep_analysis') {
    systemInstruction = `You are an elite real estate investment strategist, geospatial analyst, and architectural advisor.
You are equipped with high-level analytical reasoning to evaluate properties based on physical attributes and geographical coordinates.
Analyze the property thoroughly, taking into account the exact geographic coordinates (lat: ${property.latitude}, lng: ${property.longitude}), likely regional context, topography, microclimate, investment potential, and neighborhood dynamics.`;

    prompt = `Please conduct a comprehensive, deep-thinking property evaluation and intelligence report for the following property:

${propertyContext}

Please structure your analysis into these clear sections:
1. **Executive Summary & Property Profile**: Highlights and character.
2. **Geospatial & Location Intelligence**: Insights based on the latitude (${property.latitude}) and longitude (${property.longitude}) — region, terrain context, sunlight orientation, accessibility, and setting.
3. **Market & Investment Analysis**: Target buyer/renter demographic, estimated market appeal, potential ROI drivers, and rental viability.
4. **Strengths & Value-Add Opportunities**: Key advantages and high-ROI upgrade or renovation suggestions.
5. **Key Risks & Environmental Considerations**: Factors to investigate (climate risks, zoning, sun exposure, infrastructure).
6. **Strategic Verdict & Next Steps**: Clear, actionable summary for an owner or prospective buyer.`;
  } else if (type === 'enhance_description') {
    systemInstruction = `You are a premier luxury real estate copywriter and creative director.
Your goal is to craft compelling, high-converting property descriptions that captivate buyers while accurately portraying the property's coordinates and attributes.`;

    prompt = `Transform the following property notes and draft description into 3 distinct, beautifully polished descriptions:

${propertyContext}

Please provide:
1. **Option 1: Luxury & Emotional Storytelling** (Atmospheric, evocative, highlighting lifestyle and geographic setting).
2. **Option 2: Executive & Professional MLS Listing** (Crisp, bulleted highlights, clear dimensions, features, and location).
3. **Option 3: Modern Social & Catchy Highlight** (Punchy, energetic, with hashtags and key selling points).
Include a brief "Why this works" rationale for each.`;
  } else if (type === 'environmental') {
    systemInstruction = `You are a specialist in environmental real estate analysis, solar orientation, microclimates, and sustainable architecture.`;

    prompt = `Analyze the environmental and solar characteristics of this property based on its coordinates (${property.latitude}, ${property.longitude}) and description:

${propertyContext}

Evaluate:
- Solar trajectory and natural light optimization (passive solar heating, shading considerations).
- Regional climate considerations and seasonal weather impact.
- Energy efficiency recommendations (e.g., solar panels, insulation, native landscaping).
- Environmental resilience and outdoor living viability.`;
  } else {
    // Custom query
    systemInstruction = `You are an expert real estate consultant and geospatial intelligence advisor.
Apply high reasoning to solve complex property questions incorporating spatial coordinates, architectural specs, and real estate market dynamics.`;

    prompt = `Regarding this property:
${propertyContext}

User Query:
"${userPrompt || 'Provide an in-depth analysis of this property.'}"

Provide a thorough, highly reasoned, and insightful response with clear practical advice.`;
  }

  // Try gemini-4-argon with ThinkingLevel.HIGH first.
  // If Argon hits 429 Free Tier quota, fall back to gemini-3.8-flash (with High Thinking), with retry logic.
  const modelsToTry = [
    { model: 'gemini-4-argon', thinking: ThinkingLevel.HIGH },
    { model: 'gemini-3.8-flash', thinking: ThinkingLevel.HIGH },
    { model: 'gemini-flash-latest', thinking: ThinkingLevel.HIGH },
  ];

  let lastError: unknown = null;

  for (const candidate of modelsToTry) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model: candidate.model,
          contents: prompt,
          config: {
            thinkingConfig: {
              thinkingLevel: candidate.thinking,
            },
            systemInstruction,
          },
        });

        if (response.text) {
          return {
            text: response.text,
            model: candidate.model,
            thinkingLevel: 'HIGH',
          };
        }
      } catch (err: unknown) {
        lastError = err;
        const errStr = err instanceof Error ? err.message : String(err);
        // If 429 quota on argon, immediately move to next model without waiting
        if (candidate.model === 'gemini-4-argon' && (errStr.includes('429') || errStr.includes('RESOURCE_EXHAUSTED'))) {
          break;
        }
        // If 503 temporary unavailable, wait 1s before retry
        if (errStr.includes('503') || errStr.includes('UNAVAILABLE')) {
          await new Promise((r) => setTimeout(r, 1200));
        } else {
          break;
        }
      }
    }
  }

  throw lastError || new Error('Unable to complete AI query at this time.');
}
