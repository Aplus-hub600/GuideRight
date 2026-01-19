import { createContext, useContext, useState, ReactNode } from "react";
import { DHAKA_POLITICAL_CRISIS, type Scenario, type TimeWindow } from "@shared/scenarios";

export type TimeWindowId = "baseline" | "focused" | "recent";

interface ScenarioContextValue {
  currentScenario: Scenario;
  activeTimeWindow: TimeWindowId;
  setActiveTimeWindow: (windowId: TimeWindowId) => void;
  getActiveTimeWindowLabel: () => string;
  getPMESIIForWindow: () => Scenario["pmesiiAssessments"][0] | undefined;
  getASCOPEForWindow: () => Scenario["ascopeProfiles"][0] | undefined;
  getSIGACTsForWindow: () => Scenario["sigactEvents"];
  getInfrastructureForWindow: () => Scenario["infrastructureStatus"][0] | undefined;
  getRiskIndicatorsForWindow: () => Scenario["riskIndicators"];
}

const ScenarioContext = createContext<ScenarioContextValue | null>(null);

export function ScenarioProvider({ children }: { children: ReactNode }) {
  const [currentScenario] = useState<Scenario>(DHAKA_POLITICAL_CRISIS);
  const [activeTimeWindow, setActiveTimeWindow] = useState<TimeWindowId>("recent");

  const getActiveTimeWindowLabel = () => {
    const window = currentScenario.timeWindows.find(w => w.id === activeTimeWindow);
    return window?.label || "Recent";
  };

  const getPMESIIForWindow = () => {
    return currentScenario.pmesiiAssessments.find(p => p.timeWindow === activeTimeWindow);
  };

  const getASCOPEForWindow = () => {
    return currentScenario.ascopeProfiles.find(a => a.timeWindow === activeTimeWindow) 
      || currentScenario.ascopeProfiles[0];
  };

  const getSIGACTsForWindow = () => {
    return currentScenario.sigactEvents.filter(s => s.timeWindow === activeTimeWindow);
  };

  const getInfrastructureForWindow = () => {
    return currentScenario.infrastructureStatus.find(i => i.timeWindow === activeTimeWindow);
  };

  const getRiskIndicatorsForWindow = () => {
    return currentScenario.riskIndicators.filter(r => r.timeWindow === activeTimeWindow);
  };

  return (
    <ScenarioContext.Provider value={{
      currentScenario,
      activeTimeWindow,
      setActiveTimeWindow,
      getActiveTimeWindowLabel,
      getPMESIIForWindow,
      getASCOPEForWindow,
      getSIGACTsForWindow,
      getInfrastructureForWindow,
      getRiskIndicatorsForWindow
    }}>
      {children}
    </ScenarioContext.Provider>
  );
}

export function useScenario() {
  const context = useContext(ScenarioContext);
  if (!context) {
    throw new Error("useScenario must be used within a ScenarioProvider");
  }
  return context;
}
