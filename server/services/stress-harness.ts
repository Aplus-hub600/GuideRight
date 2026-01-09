/**
 * Stress Test Harness for Provider Testing
 * 
 * Enables controlled failure injection for testing degraded mode behavior:
 * - Quota exceeded simulation
 * - Latency injection (configurable delay)
 * - Malformed JSON responses
 * - Rate limit simulation
 * 
 * Toggle via API endpoints or environment variables for testing.
 */

export interface StressConfig {
  enabled: boolean;
  simulateQuotaExceeded: boolean;
  simulateRateLimit: boolean;
  simulateServerError: boolean;
  simulateMalformedJson: boolean;
  latencyMs: number; // 0 = no added latency
  failureRate: number; // 0-1, probability of injected failure
}

// Default: all stress testing disabled
const defaultConfig: StressConfig = {
  enabled: false,
  simulateQuotaExceeded: false,
  simulateRateLimit: false,
  simulateServerError: false,
  simulateMalformedJson: false,
  latencyMs: 0,
  failureRate: 0,
};

// Current stress configuration (mutable for runtime toggling)
let currentConfig: StressConfig = { ...defaultConfig };

// Track stress test metrics
interface StressMetrics {
  totalRequests: number;
  injectedFailures: number;
  quotaExceededCount: number;
  rateLimitCount: number;
  serverErrorCount: number;
  malformedJsonCount: number;
  totalLatencyAdded: number;
  lastFailureTime: string | null;
}

let metrics: StressMetrics = {
  totalRequests: 0,
  injectedFailures: 0,
  quotaExceededCount: 0,
  rateLimitCount: 0,
  serverErrorCount: 0,
  malformedJsonCount: 0,
  totalLatencyAdded: 0,
  lastFailureTime: null,
};

/**
 * Get current stress configuration
 */
export function getStressConfig(): StressConfig {
  return { ...currentConfig };
}

/**
 * Update stress configuration
 */
export function setStressConfig(config: Partial<StressConfig>): StressConfig {
  currentConfig = { ...currentConfig, ...config };
  console.log("[StressHarness] Configuration updated:", currentConfig);
  return { ...currentConfig };
}

/**
 * Reset to default (all stress testing disabled)
 */
export function resetStressConfig(): StressConfig {
  currentConfig = { ...defaultConfig };
  console.log("[StressHarness] Reset to defaults");
  return { ...currentConfig };
}

/**
 * Get stress test metrics
 */
export function getStressMetrics(): StressMetrics {
  return { ...metrics };
}

/**
 * Reset metrics
 */
export function resetStressMetrics(): void {
  metrics = {
    totalRequests: 0,
    injectedFailures: 0,
    quotaExceededCount: 0,
    rateLimitCount: 0,
    serverErrorCount: 0,
    malformedJsonCount: 0,
    totalLatencyAdded: 0,
    lastFailureTime: null,
  };
  console.log("[StressHarness] Metrics reset");
}

/**
 * Sleep utility for latency injection
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Check if failure should be injected based on failure rate
 */
function shouldInjectFailure(): boolean {
  if (!currentConfig.enabled) return false;
  if (currentConfig.failureRate <= 0) return false;
  return Math.random() < currentConfig.failureRate;
}

/**
 * Stress test error types
 */
export class StressTestError extends Error {
  code: "quota_exceeded" | "rate_limited" | "server_error" | "malformed_json";
  isStressTest: boolean = true;
  
  constructor(message: string, code: StressTestError["code"]) {
    super(message);
    this.name = "StressTestError";
    this.code = code;
  }
}

/**
 * Apply stress test middleware to a provider call
 * Call this before making actual API requests
 * 
 * @throws StressTestError if a failure should be injected
 */
export async function applyStressTest(): Promise<void> {
  metrics.totalRequests++;
  
  if (!currentConfig.enabled) return;
  
  // Apply latency if configured
  if (currentConfig.latencyMs > 0) {
    console.log(`[StressHarness] Injecting ${currentConfig.latencyMs}ms latency`);
    metrics.totalLatencyAdded += currentConfig.latencyMs;
    await sleep(currentConfig.latencyMs);
  }
  
  // Check for specific failure modes (deterministic)
  if (currentConfig.simulateQuotaExceeded) {
    metrics.injectedFailures++;
    metrics.quotaExceededCount++;
    metrics.lastFailureTime = new Date().toISOString();
    console.log("[StressHarness] Injecting quota exceeded error");
    throw new StressTestError(
      "Simulated quota exceeded - stress test active",
      "quota_exceeded"
    );
  }
  
  if (currentConfig.simulateRateLimit) {
    metrics.injectedFailures++;
    metrics.rateLimitCount++;
    metrics.lastFailureTime = new Date().toISOString();
    console.log("[StressHarness] Injecting rate limit error");
    throw new StressTestError(
      "Simulated rate limit - stress test active",
      "rate_limited"
    );
  }
  
  if (currentConfig.simulateServerError) {
    metrics.injectedFailures++;
    metrics.serverErrorCount++;
    metrics.lastFailureTime = new Date().toISOString();
    console.log("[StressHarness] Injecting server error");
    throw new StressTestError(
      "Simulated server error - stress test active",
      "server_error"
    );
  }
  
  // Check probabilistic failure injection
  if (shouldInjectFailure()) {
    const failureTypes: StressTestError["code"][] = ["quota_exceeded", "rate_limited", "server_error"];
    const randomType = failureTypes[Math.floor(Math.random() * failureTypes.length)];
    metrics.injectedFailures++;
    metrics.lastFailureTime = new Date().toISOString();
    
    switch (randomType) {
      case "quota_exceeded":
        metrics.quotaExceededCount++;
        break;
      case "rate_limited":
        metrics.rateLimitCount++;
        break;
      case "server_error":
        metrics.serverErrorCount++;
        break;
    }
    
    console.log(`[StressHarness] Probabilistic failure injection: ${randomType}`);
    throw new StressTestError(
      `Simulated ${randomType} - stress test (probabilistic)`,
      randomType
    );
  }
}

/**
 * Check if malformed JSON should be returned
 * Call this after receiving a valid response to potentially corrupt it
 */
export function shouldReturnMalformedJson(): boolean {
  if (!currentConfig.enabled) return false;
  if (!currentConfig.simulateMalformedJson) return false;
  
  metrics.injectedFailures++;
  metrics.malformedJsonCount++;
  metrics.lastFailureTime = new Date().toISOString();
  console.log("[StressHarness] Returning malformed JSON");
  return true;
}

/**
 * Get malformed JSON string for testing parse error handling
 */
export function getMalformedJson(): string {
  const malformedExamples = [
    '{"pmesii": {"political": {"incomplete',
    '{"pmesii": null, "unexpected": true}',
    'not json at all',
    '{"pmesii": {"political": {"assessment": "", "riskLevel": "INVALID"}}}',
  ];
  return malformedExamples[Math.floor(Math.random() * malformedExamples.length)];
}

/**
 * Preset stress scenarios for easy testing
 */
export const StressScenarios = {
  quotaExceeded: (): StressConfig => setStressConfig({
    enabled: true,
    simulateQuotaExceeded: true,
    simulateRateLimit: false,
    simulateServerError: false,
    simulateMalformedJson: false,
    latencyMs: 0,
    failureRate: 0,
  }),
  
  highLatency: (): StressConfig => setStressConfig({
    enabled: true,
    simulateQuotaExceeded: false,
    simulateRateLimit: false,
    simulateServerError: false,
    simulateMalformedJson: false,
    latencyMs: 15000, // 15 seconds
    failureRate: 0,
  }),
  
  intermittentFailures: (): StressConfig => setStressConfig({
    enabled: true,
    simulateQuotaExceeded: false,
    simulateRateLimit: false,
    simulateServerError: false,
    simulateMalformedJson: false,
    latencyMs: 0,
    failureRate: 0.3, // 30% failure rate
  }),
  
  malformedResponses: (): StressConfig => setStressConfig({
    enabled: true,
    simulateQuotaExceeded: false,
    simulateRateLimit: false,
    simulateServerError: false,
    simulateMalformedJson: true,
    latencyMs: 0,
    failureRate: 0,
  }),
  
  disabled: (): StressConfig => resetStressConfig(),
};
