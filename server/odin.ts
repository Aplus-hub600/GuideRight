import axios from 'axios';

const ODIN_BASE_URL = 'https://odin.tradoc.army.mil';

// ODIN regions and their fictional countries
export const ODIN_REGIONS = {
  'Indo-Pacific': {
    name: 'Indo-Pacific',
    url: '/Region/Indo-Pacific',
    countries: [
      { name: 'Bagansait', political: '/DATE/0b3b9858fd5d7ed84cfe38185a86fa60', military: '/DATE/656d76bc34a6d8cbc441605f35e459a4', economic: '/DATE/15b86d2891ba2173299d092af0e0d515', social: '/DATE/42dc8ad2e7bf783ad4f8541be1aecd43', information: '/DATE/32635ed3715a273d9f39d116e14e03f7', infrastructure: '/DATE/5fc15ff55d0b75e0bf5732af8b955985' },
      { name: 'Belesia', political: '/DATE/49bb463490bb8039e1ff944e4ad826e5', military: '/DATE/db80f2f49f43dc3a85f04ee50c7adc51', economic: '/DATE/ab7c9debee4651fed92f0b1fa99c219d', social: '/DATE/0f6deaa991fdc6805c52f0e184e01566', information: '/DATE/4512dfbae16b1750393ed372909bc5d4', infrastructure: '/DATE/31eb0313b7fe53a63c60457ba60de377' },
      { name: 'North Torbia', political: '/DATE/676d61bb81057ca37ac3d254411337b9', military: '/DATE/437d3e350241798be91b40b4c57b5ed1', economic: '/DATE/75635c4bbada6e4b94536377c43203f0', social: '/DATE/89d7b95118bf68fc3ff520096e3831be', information: '/DATE/c39af4e4b28224c23354234e2acc9449', infrastructure: '/DATE/ed9945e4e6d1ef25d60d96ed1ec1e7f4' },
      { name: 'South Torbia', political: '/DATE/81c18d9604342dc000ed4c1854f891f0', military: '/DATE/244221b85417ac88d5f09be1fe1a2bc4', economic: '/DATE/b74a45c1e05055cffc5bb9dbc699ef7c', social: '/DATE/f2e617e42f55cacff2fbe17aa34a08a6', information: '/DATE/b6d59aa8a9bb03e0b62ecd754a3b4ef5', infrastructure: '/DATE/9f73c51c44fd8bb519d6fa42a5710d2e' }
    ]
  }
};

interface PMESIIData {
  political: string;
  military: string;
  economic: string;
  social: string;
  information: string;
  infrastructure: string;
}

export async function fetchODINData(url: string): Promise<string> {
  try {
    const response = await axios.get(`${ODIN_BASE_URL}${url}`, {
      headers: {
        'User-Agent': 'GuideRight-Tactical-Assistant/1.0'
      },
      timeout: 10000
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching ODIN data:', error);
    throw new Error(`Failed to fetch ODIN data from ${url}`);
  }
}

interface ODINDataResult {
  success: boolean;
  data?: PMESIIData;
  error?: string;
  partialData?: Partial<PMESIIData>;
}

export async function getODINCountryData(countryName: string): Promise<ODINDataResult> {
  for (const region of Object.values(ODIN_REGIONS)) {
    const country = region.countries.find(c => c.name === countryName);
    if (country) {
      const results = await Promise.allSettled([
        fetchODINData(country.political),
        fetchODINData(country.military),
        fetchODINData(country.economic),
        fetchODINData(country.social),
        fetchODINData(country.information),
        fetchODINData(country.infrastructure)
      ]);

      const categories = ['political', 'military', 'economic', 'social', 'information', 'infrastructure'] as const;
      const data: Partial<PMESIIData> = {};
      const errors: string[] = [];

      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          data[categories[index]] = result.value;
        } else {
          errors.push(`${categories[index]}: ${result.reason.message}`);
        }
      });

      if (errors.length === results.length) {
        return { success: false, error: 'Failed to fetch all ODIN data categories' };
      }

      if (errors.length > 0) {
        return { 
          success: true, 
          partialData: data,
          error: `Partial data available. Missing categories: ${errors.join('; ')}`
        };
      }

      return { success: true, data: data as PMESIIData };
    }
  }
  return { success: false, error: `Country '${countryName}' not found in ODIN database` };
}

export function parseODINContent(html: string): string {
  // Basic HTML to text conversion
  let text = html
    .replace(/<script[^>]*>.*?<\/script>/gi, '')
    .replace(/<style[^>]*>.*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  
  return text;
}

export async function getODINCountriesList(): Promise<Array<{ name: string; region: string }>> {
  const countries: Array<{ name: string; region: string }> = [];
  
  for (const [regionName, region] of Object.entries(ODIN_REGIONS)) {
    for (const country of region.countries) {
      countries.push({
        name: country.name,
        region: regionName
      });
    }
  }
  
  return countries;
}

export async function getODINSummary(countryName: string, category: 'political' | 'military' | 'economic' | 'social' | 'information' | 'infrastructure'): Promise<{ success: boolean; summary?: string; error?: string }> {
  for (const region of Object.values(ODIN_REGIONS)) {
    const country = region.countries.find(c => c.name === countryName);
    if (country) {
      const url = country[category];
      try {
        const html = await fetchODINData(url);
        const text = parseODINContent(html);
        
        // Extract summary (first 1000 characters of meaningful content)
        const summary = text.substring(0, 1000).trim();
        return { success: true, summary: summary || 'No summary available' };
      } catch (error) {
        console.error(`Error getting ${category} summary for ${countryName}:`, error);
        return { success: false, error: `Failed to retrieve ${category} data from ODIN` };
      }
    }
  }
  return { success: false, error: `Country '${countryName}' not found in ODIN database` };
}
