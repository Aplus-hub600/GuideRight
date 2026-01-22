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
    if (dateStr.length === 8) {
      const year = dateStr.slice(0, 4);
      const month = dateStr.slice(4, 6);
      const day = dateStr.slice(6, 8);
      return new Date(`${year}-${month}-${day}`);
    }
    if (dateStr.length === 14) {
      const year = dateStr.slice(0, 4);
      const month = dateStr.slice(4, 6);
      const day = dateStr.slice(6, 8);
      const hour = dateStr.slice(8, 10);
      const min = dateStr.slice(10, 12);
      const sec = dateStr.slice(12, 14);
      return new Date(`${year}-${month}-${day}T${hour}:${min}:${sec}Z`);
    }
    return new Date(dateStr);
  } catch {
    return null;
  }
}

export async function fetchGdeltEvents(params: GdeltQueryParams): Promise<GdeltEvent[]> {
  const { aoi, timeWindowDays } = params;
  
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - timeWindowDays);
  
  const formatDate = (d: Date) => d.toISOString().slice(0, 10).replace(/-/g, "");
  
  const aoiNameLower = aoi.name.toLowerCase();
  let query = "";
  
  if (aoiNameLower.includes("bangladesh") || aoiNameLower.includes("dhaka")) {
    query = "sourcecountry:bangladesh OR sourceloc:bangladesh OR sourceloc:dhaka";
  } else if (aoiNameLower.includes(",")) {
    const parts = aoi.name.split(",").map(p => p.trim());
    query = parts.map(p => `sourceloc:${p}`).join(" OR ");
  } else {
    query = `sourceloc:${aoi.name}`;
  }
  
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
    } catch {
      console.error("[GDELT Events] Invalid JSON response");
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
  
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - timeWindowDays);
  
  const formatDate = (d: Date) => d.toISOString().slice(0, 10).replace(/-/g, "");
  
  const aoiNameLower = aoi.name.toLowerCase();
  let query = "";
  
  if (aoiNameLower.includes("bangladesh") || aoiNameLower.includes("dhaka")) {
    query = "sourcecountry:bangladesh OR sourceloc:bangladesh OR sourceloc:dhaka";
  } else if (aoiNameLower.includes(",")) {
    const parts = aoi.name.split(",").map(p => p.trim());
    query = parts.map(p => `sourceloc:${p}`).join(" OR ");
  } else {
    query = `sourceloc:${aoi.name}`;
  }
  
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
    } catch {
      console.error("[GDELT Docs] Invalid JSON response");
      return [];
    }
    
    if (!data.articles || !Array.isArray(data.articles)) {
      console.log("[GDELT Docs] No articles in response");
      return [];
    }
    
    const docs: GdeltDoc[] = data.articles.map((article) => {
      const seenDate = parseGdeltDate(article.seendate as string);
      return {
        docId: article.url as string || crypto.randomUUID(),
        url: article.url as string || "",
        urlMobile: article.url_mobile as string || null,
        title: article.title as string || null,
        seenDate: seenDate,
        publishedAt: seenDate,
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
