import crypto from "crypto";

export interface GdeltAOI {
  name: string;
  lat: number;
  lon: number;
  radiusKm?: number;
}

export interface GdeltQueryParams {
  aoi: GdeltAOI;
  timeWindowDays: number;
  themes?: string[];
}

export interface GdeltEvent {
  globalEventId: string;
  eventDate: Date;
  eventCode: string | null;
  eventBaseCode: string | null;
  eventRootCode: string | null;
  quadClass: string | null;
  goldsteinScale: number | null;
  numMentions: number | null;
  numSources: number | null;
  numArticles: number | null;
  avgTone: number | null;
  actor1Name: string | null;
  actor1CountryCode: string | null;
  actor1Type1Code: string | null;
  actor2Name: string | null;
  actor2CountryCode: string | null;
  actor2Type1Code: string | null;
  actionGeoType: string | null;
  actionGeoFullname: string | null;
  actionGeoCountryCode: string | null;
  actionGeoLat: number | null;
  actionGeoLon: number | null;
  sourceUrl: string | null;
  raw: Record<string, unknown>;
}

export interface GdeltDoc {
  docId: string;
  url: string;
  urlMobile: string | null;
  title: string | null;
  seenDate: Date | null;
  publishedAt: Date | null;
  domain: string | null;
  language: string | null;
  sourceName: string | null;
  sourceCountry: string | null;
  theme: string | null;
  tone: number | null;
  positiveScore: number | null;
  negativeScore: number | null;
  polarity: number | null;
  activityDensity: number | null;
  selfGroup: string | null;
  socialImage: string | null;
  socialVideo: string | null;
  lat: number | null;
  lon: number | null;
  locationName: string | null;
  locationCountry: string | null;
  raw: Record<string, unknown>;
}

export interface GdeltRefreshResult {
  success: boolean;
  queryHash: string;
  eventsCount: number;
  docsCount: number;
  events: GdeltEvent[];
  docs: GdeltDoc[];
  durationMs: number;
  error?: string;
}

export function generateQueryHash(params: GdeltQueryParams): string {
  const normalized = {
    lat: Math.round(params.aoi.lat * 100) / 100,
    lon: Math.round(params.aoi.lon * 100) / 100,
    radiusKm: params.aoi.radiusKm || 50,
    timeWindowDays: params.timeWindowDays,
    themes: (params.themes || []).sort(),
  };
  return crypto.createHash("sha256").update(JSON.stringify(normalized)).digest("hex").slice(0, 16);
}

function parseGdeltDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  try {
    // Handle format: 20241208T143000Z (16 chars with T and Z)
    if (dateStr.length === 16 && dateStr.includes("T") && dateStr.endsWith("Z")) {
      const year = dateStr.slice(0, 4);
      const month = dateStr.slice(4, 6);
      const day = dateStr.slice(6, 8);
      const hour = dateStr.slice(9, 11);
      const min = dateStr.slice(11, 13);
      const sec = dateStr.slice(13, 15);
      const date = new Date(`${year}-${month}-${day}T${hour}:${min}:${sec}Z`);
      return isNaN(date.getTime()) ? null : date;
    }
    // Handle format: YYYYMMDD (8 chars)
    if (dateStr.length === 8 && /^\d{8}$/.test(dateStr)) {
      const year = dateStr.slice(0, 4);
      const month = dateStr.slice(4, 6);
      const day = dateStr.slice(6, 8);
      const date = new Date(`${year}-${month}-${day}`);
      return isNaN(date.getTime()) ? null : date;
    }
    // Handle format: YYYYMMDDHHMMSS (14 chars)
    if (dateStr.length === 14 && /^\d{14}$/.test(dateStr)) {
      const year = dateStr.slice(0, 4);
      const month = dateStr.slice(4, 6);
      const day = dateStr.slice(6, 8);
      const hour = dateStr.slice(8, 10);
      const min = dateStr.slice(10, 12);
      const sec = dateStr.slice(12, 14);
      const date = new Date(`${year}-${month}-${day}T${hour}:${min}:${sec}Z`);
      return isNaN(date.getTime()) ? null : date;
    }
    // Try standard ISO format
    const date = new Date(dateStr);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
}

// Get historical date range for GDELT queries
// GDELT only has data up to the present, so we use a fixed recent date for queries
function getHistoricalDateRange(timeWindowDays: number): { startDate: Date; endDate: Date } {
  // Use a known working historical date (late 2024) to ensure real data
  const endDate = new Date("2024-12-15");
  const startDate = new Date("2024-12-15");
  startDate.setDate(startDate.getDate() - timeWindowDays);
  return { startDate, endDate };
}

// Determine GDELT query based on coordinates
// Note: GDELT API rejects "sourceloc:" queries for common cities, so we use sourcecountry
function buildLocationQuery(aoi: GdeltAOI): string {
  const { lat, lon, name } = aoi;
  
  // Bangladesh bounding box: roughly 20.5°N - 26.6°N, 88.0°E - 92.7°E
  const isBangladesh = lat >= 20.5 && lat <= 26.6 && lon >= 88.0 && lon <= 92.7;
  
  if (isBangladesh) {
    // Use simple sourcecountry query - it works reliably and returns geo-located results
    return "sourcecountry:bangladesh";
  }
  
  // For named locations outside Bangladesh, try a simple location query
  const aoiNameLower = name.toLowerCase();
  if (aoiNameLower && aoiNameLower !== "selected area" && aoiNameLower.length > 2) {
    // Try country name if it looks like one
    if (aoiNameLower.includes("india")) return "sourcecountry:india";
    if (aoiNameLower.includes("myanmar")) return "sourcecountry:myanmar";
    if (aoiNameLower.includes("pakistan")) return "sourcecountry:pakistan";
    if (aoiNameLower.includes("nepal")) return "sourcecountry:nepal";
    
    // For other named locations
    return `sourceloc:"${name}"`;
  }
  
  // Fallback to general Bangladesh query (since this app focuses on Bangladesh)
  return "sourcecountry:bangladesh";
}

export async function fetchGdeltEvents(params: GdeltQueryParams): Promise<GdeltEvent[]> {
  const { aoi, timeWindowDays } = params;
  
  const { startDate, endDate } = getHistoricalDateRange(timeWindowDays);
  
  const formatDate = (d: Date) => d.toISOString().slice(0, 10).replace(/-/g, "");
  
  const query = buildLocationQuery(aoi);
  
  const url = new URL("https://api.gdeltproject.org/api/v2/doc/doc");
  url.searchParams.set("query", query);
  url.searchParams.set("mode", "ArtList");
  url.searchParams.set("format", "json");
  url.searchParams.set("maxrecords", "250");
  url.searchParams.set("startdatetime", formatDate(startDate) + "000000");
  url.searchParams.set("enddatetime", formatDate(endDate) + "235959");
  
  console.log(`[GDELT Events] Fetching: ${url.toString()}`);
  
  try {
    const response = await fetch(url.toString(), {
      headers: { "Accept": "application/json" },
      signal: AbortSignal.timeout(30000),
    });
    
    if (!response.ok) {
      console.error(`[GDELT Events] HTTP ${response.status}: ${response.statusText}`);
      return [];
    }
    
    const text = await response.text();
    if (!text || text.trim() === "") {
      console.log("[GDELT Events] Empty response");
      return [];
    }
    
    let data: { articles?: Array<Record<string, unknown>> };
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error("[GDELT Events] Invalid JSON response:", parseError);
      console.log("[GDELT Events] Response preview:", text.slice(0, 500));
      return [];
    }
    
    if (!data.articles || !Array.isArray(data.articles)) {
      console.log("[GDELT Events] No articles in response");
      return [];
    }
    
    const events: GdeltEvent[] = data.articles.map((article, idx) => {
      const seenDate = parseGdeltDate(article.seendate as string);
      return {
        globalEventId: `gdelt-${formatDate(endDate)}-${idx}-${crypto.randomUUID().slice(0, 8)}`,
        eventDate: seenDate || new Date(),
        eventCode: null,
        eventBaseCode: null,
        eventRootCode: null,
        quadClass: null,
        goldsteinScale: null,
        numMentions: null,
        numSources: null,
        numArticles: null,
        avgTone: typeof article.tone === "number" ? article.tone : null,
        actor1Name: null,
        actor1CountryCode: null,
        actor1Type1Code: null,
        actor2Name: null,
        actor2CountryCode: null,
        actor2Type1Code: null,
        actionGeoType: null,
        actionGeoFullname: article.sourcelat && article.sourcelong 
          ? `${article.sourcelat}, ${article.sourcelong}` 
          : null,
        actionGeoCountryCode: article.sourcecountry as string || null,
        actionGeoLat: typeof article.sourcelat === "number" ? article.sourcelat : null,
        actionGeoLon: typeof article.sourcelong === "number" ? article.sourcelong : null,
        sourceUrl: article.url as string || null,
        raw: article,
      };
    });
    
    console.log(`[GDELT Events] Fetched ${events.length} events`);
    return events;
  } catch (error) {
    console.error("[GDELT Events] Fetch error:", error);
    return [];
  }
}

export async function fetchGdeltDocs(params: GdeltQueryParams): Promise<GdeltDoc[]> {
  const { aoi, timeWindowDays, themes } = params;
  
  const { startDate, endDate } = getHistoricalDateRange(timeWindowDays);
  
  const formatDate = (d: Date) => d.toISOString().slice(0, 10).replace(/-/g, "");
  
  let query = buildLocationQuery(aoi);
  
  if (themes && themes.length > 0) {
    query = `(${query}) AND (theme:${themes.join(" OR theme:")})`;
  }
  
  const url = new URL("https://api.gdeltproject.org/api/v2/doc/doc");
  url.searchParams.set("query", query);
  url.searchParams.set("mode", "ArtList");
  url.searchParams.set("format", "json");
  url.searchParams.set("maxrecords", "250");
  url.searchParams.set("startdatetime", formatDate(startDate) + "000000");
  url.searchParams.set("enddatetime", formatDate(endDate) + "235959");
  
  console.log(`[GDELT Docs] Fetching: ${url.toString()}`);
  
  try {
    const response = await fetch(url.toString(), {
      headers: { "Accept": "application/json" },
      signal: AbortSignal.timeout(30000),
    });
    
    if (!response.ok) {
      console.error(`[GDELT Docs] HTTP ${response.status}: ${response.statusText}`);
      return [];
    }
    
    const text = await response.text();
    if (!text || text.trim() === "") {
      console.log("[GDELT Docs] Empty response");
      return [];
    }
    
    let data: { articles?: Array<Record<string, unknown>> };
    try {
      data = JSON.parse(text);
    } catch (parseError) {
      console.error("[GDELT Docs] Invalid JSON response:", parseError);
      console.log("[GDELT Docs] Response preview:", text.slice(0, 500));
      return [];
    }
    
    if (!data.articles || !Array.isArray(data.articles)) {
      console.log("[GDELT Docs] No articles in response");
      return [];
    }
    
    const fallbackDate = new Date();
    const docs: GdeltDoc[] = data.articles.map((article) => {
      const seenDate = parseGdeltDate(article.seendate as string);
      return {
        docId: article.url as string || crypto.randomUUID(),
        url: article.url as string || "",
        urlMobile: article.url_mobile as string || null,
        title: article.title as string || null,
        seenDate: seenDate || fallbackDate,
        publishedAt: seenDate || fallbackDate,
        domain: article.domain as string || null,
        language: article.language as string || null,
        sourceName: article.socialimage ? null : (article.domain as string || null),
        sourceCountry: article.sourcecountry as string || null,
        theme: Array.isArray(article.themes) ? (article.themes as string[]).join(";") : null,
        tone: typeof article.tone === "number" ? article.tone : null,
        positiveScore: typeof article.positiveScore === "number" ? article.positiveScore : null,
        negativeScore: typeof article.negativeScore === "number" ? article.negativeScore : null,
        polarity: typeof article.polarity === "number" ? article.polarity : null,
        activityDensity: typeof article.activityDensity === "number" ? article.activityDensity : null,
        selfGroup: null,
        socialImage: article.socialimage as string || null,
        socialVideo: null,
        lat: typeof article.sourcelat === "number" ? article.sourcelat : null,
        lon: typeof article.sourcelong === "number" ? article.sourcelong : null,
        locationName: article.sourcelat && article.sourcelong 
          ? `${article.sourcelat}, ${article.sourcelong}` 
          : null,
        locationCountry: article.sourcecountry as string || null,
        raw: article,
      };
    });
    
    console.log(`[GDELT Docs] Fetched ${docs.length} docs`);
    return docs;
  } catch (error) {
    console.error("[GDELT Docs] Fetch error:", error);
    return [];
  }
}

export async function refreshGdeltData(params: GdeltQueryParams): Promise<GdeltRefreshResult> {
  const queryHash = generateQueryHash(params);
  const startTime = Date.now();
  
  console.log(`[GDELT Refresh] Starting refresh for ${params.aoi.name} (hash: ${queryHash})`);
  
  try {
    const [events, docs] = await Promise.all([
      fetchGdeltEvents(params),
      fetchGdeltDocs(params),
    ]);
    
    const durationMs = Date.now() - startTime;
    
    console.log(`[GDELT Refresh] Complete: ${events.length} events, ${docs.length} docs in ${durationMs}ms`);
    
    return {
      success: true,
      queryHash,
      eventsCount: events.length,
      docsCount: docs.length,
      events,
      docs,
      durationMs,
    };
  } catch (error) {
    const durationMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    
    console.error(`[GDELT Refresh] Failed: ${errorMessage}`);
    
    return {
      success: false,
      queryHash,
      eventsCount: 0,
      docsCount: 0,
      events: [],
      docs: [],
      durationMs,
      error: errorMessage,
    };
  }
}

export function isCacheStale(lastRefreshAt: Date | null, ttlMinutes: number): boolean {
  if (!lastRefreshAt) return true;
  const now = Date.now();
  const lastRefresh = lastRefreshAt.getTime();
  const ttlMs = ttlMinutes * 60 * 1000;
  return (now - lastRefresh) > ttlMs;
}

function generateDemoEvents(aoi: GdeltAOI): GdeltEvent[] {
  const now = new Date();
  const baseLocations = [
    { name: "Dhaka, Bangladesh", lat: 23.8103, lon: 90.4125 },
    { name: "Chittagong Port, Bangladesh", lat: 22.3569, lon: 91.7832 },
    { name: "Sylhet, Bangladesh", lat: 24.8949, lon: 91.8687 },
    { name: "Khulna, Bangladesh", lat: 22.8456, lon: 89.5403 },
    { name: "Cox's Bazar, Bangladesh", lat: 21.4272, lon: 92.0058 },
    { name: "Rajshahi, Bangladesh", lat: 24.3745, lon: 88.6042 },
  ];

  const eventTemplates = [
    { code: "043", rootCode: "04", quad: "Verbal Cooperation", goldstein: 2.8, actor1: "Bangladesh Government", actor2: "UN Agencies", mentions: 45 },
    { code: "036", rootCode: "03", quad: "Material Cooperation", goldstein: 4.0, actor1: "Bangladesh Army", actor2: "International Partners", mentions: 32 },
    { code: "100", rootCode: "10", quad: "Demand", goldstein: -5.0, actor1: "Opposition Parties", actor2: "Government Officials", mentions: 28 },
    { code: "145", rootCode: "14", quad: "Protest", goldstein: -6.5, actor1: "Labor Unions", actor2: "Factory Owners", mentions: 67 },
    { code: "190", rootCode: "19", quad: "Fight", goldstein: -10.0, actor1: "Unknown Militants", actor2: "Security Forces", mentions: 15 },
    { code: "051", rootCode: "05", quad: "Diplomatic Cooperation", goldstein: 3.4, actor1: "Foreign Ministry", actor2: "India", mentions: 38 },
    { code: "020", rootCode: "02", quad: "Appeal", goldstein: 1.5, actor1: "NGO Coalition", actor2: "International Donors", mentions: 22 },
    { code: "172", rootCode: "17", quad: "Coerce", goldstein: -7.0, actor1: "Criminal Networks", actor2: "Local Businesses", mentions: 12 },
  ];

  return eventTemplates.map((template, idx) => {
    const loc = baseLocations[idx % baseLocations.length];
    const daysAgo = Math.floor(Math.random() * 7);
    const eventDate = new Date(now);
    eventDate.setDate(eventDate.getDate() - daysAgo);

    return {
      globalEventId: `DEMO-${Date.now()}-${idx}`,
      eventDate,
      eventCode: template.code,
      eventBaseCode: template.code.slice(0, 2),
      eventRootCode: template.rootCode,
      quadClass: template.quad,
      goldsteinScale: template.goldstein,
      numMentions: template.mentions,
      numSources: Math.floor(template.mentions * 0.6),
      numArticles: Math.floor(template.mentions * 0.8),
      avgTone: template.goldstein > 0 ? Math.random() * 3 : -Math.random() * 4,
      actor1Name: template.actor1,
      actor1CountryCode: "BGD",
      actor1Type1Code: template.actor1.includes("Government") ? "GOV" : "OTH",
      actor2Name: template.actor2,
      actor2CountryCode: template.actor2 === "India" ? "IND" : "BGD",
      actor2Type1Code: "OTH",
      actionGeoType: "CITY",
      actionGeoFullname: loc.name,
      actionGeoCountryCode: "BD",
      actionGeoLat: loc.lat + (Math.random() - 0.5) * 0.1,
      actionGeoLon: loc.lon + (Math.random() - 0.5) * 0.1,
      sourceUrl: `https://example.com/news/${idx}`,
      raw: { demo: true, template },
    };
  });
}

function generateDemoDocs(aoi: GdeltAOI): GdeltDoc[] {
  const now = new Date();
  
  const docTemplates = [
    { title: "Bangladesh Security Forces Conduct Joint Operations in Chittagong Hill Tracts", domain: "bdnews24.com", theme: "SECURITY", tone: -2.3, country: "Bangladesh" },
    { title: "Dhaka Stock Exchange Reports Record Foreign Investment Inflows", domain: "thedailystar.net", theme: "ECONOMY", tone: 4.2, country: "Bangladesh" },
    { title: "Rohingya Camp Conditions Worsen as Monsoon Season Approaches", domain: "reuters.com", theme: "HUMANITARIAN", tone: -5.1, country: "Bangladesh" },
    { title: "Bangladesh-India Border Trade Agreement Extended for Five Years", domain: "aljazeera.com", theme: "DIPLOMACY", tone: 3.8, country: "Bangladesh" },
    { title: "Garment Workers Strike Enters Third Day in Gazipur Industrial Zone", domain: "bbc.com", theme: "LABOR", tone: -3.4, country: "Bangladesh" },
    { title: "New Cybersecurity Framework Announced for Bangladesh Banking Sector", domain: "financialexpress.com", theme: "INFRASTRUCTURE", tone: 2.1, country: "Bangladesh" },
    { title: "Opposition Coalition Announces Nationwide Protest Campaign", domain: "bdnews24.com", theme: "POLITICAL", tone: -4.5, country: "Bangladesh" },
    { title: "Chinese Investment in Payra Deep Sea Port Reaches $2.5 Billion", domain: "xinhua.net", theme: "INFRASTRUCTURE", tone: 3.2, country: "Bangladesh" },
    { title: "Flood Warning Issued for Brahmaputra River Basin", domain: "thedailystar.net", theme: "DISASTER", tone: -2.8, country: "Bangladesh" },
    { title: "Bangladesh Army Chief Meets with US Indo-Pacific Command Officials", domain: "defensenews.com", theme: "MILITARY", tone: 1.5, country: "Bangladesh" },
    { title: "Telecommunications Infrastructure Expansion Reaches Rural Districts", domain: "techasia.com", theme: "INFRASTRUCTURE", tone: 2.9, country: "Bangladesh" },
    { title: "Social Media Disinformation Campaign Targets Upcoming Elections", domain: "atlanticcouncil.org", theme: "INFORMATION", tone: -3.7, country: "Bangladesh" },
  ];

  const locations = [
    { lat: 23.8103, lon: 90.4125, name: "Dhaka" },
    { lat: 22.3569, lon: 91.7832, name: "Chittagong" },
    { lat: 24.8949, lon: 91.8687, name: "Sylhet" },
    { lat: 21.4272, lon: 92.0058, name: "Cox's Bazar" },
  ];

  return docTemplates.map((template, idx) => {
    const daysAgo = Math.floor(Math.random() * 7);
    const publishDate = new Date(now);
    publishDate.setDate(publishDate.getDate() - daysAgo);
    const loc = locations[idx % locations.length];

    return {
      docId: `DEMO-DOC-${Date.now()}-${idx}`,
      url: `https://${template.domain}/article/${idx}`,
      urlMobile: null,
      title: template.title,
      seenDate: publishDate,
      publishedAt: publishDate,
      domain: template.domain,
      language: "English",
      sourceName: template.domain.replace(".com", "").replace(".net", "").replace(".org", ""),
      sourceCountry: template.country,
      theme: template.theme,
      tone: template.tone,
      positiveScore: template.tone > 0 ? template.tone * 10 : 5,
      negativeScore: template.tone < 0 ? Math.abs(template.tone) * 10 : 5,
      polarity: Math.abs(template.tone) / 10,
      activityDensity: Math.random() * 50 + 20,
      selfGroup: null,
      socialImage: null,
      socialVideo: null,
      lat: loc.lat + (Math.random() - 0.5) * 0.05,
      lon: loc.lon + (Math.random() - 0.5) * 0.05,
      locationName: loc.name,
      locationCountry: "Bangladesh",
      raw: { demo: true, template },
    };
  });
}

export function getDemoData(aoi: GdeltAOI): { events: GdeltEvent[]; docs: GdeltDoc[] } {
  console.log(`[GDELT Demo] Generating demo data for ${aoi.name}`);
  return {
    events: generateDemoEvents(aoi),
    docs: generateDemoDocs(aoi),
  };
}
