import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      // Navigation
      "nav.map": "Map",
      "nav.intelligence": "Intelligence",
      "nav.chat": "Chat",
      "nav.analytics": "Analytics",
      "nav.timeline": "Timeline",
      "nav.weather": "Weather",
      
      // Chat Interface
      "chat.placeholder": "Ask about any area of interest...",
      "chat.mic.start": "Start Recording",
      "chat.mic.stop": "Stop Recording",
      "chat.mic.listening": "Listening...",
      "chat.send": "Send Query",
      
      // PMESII Categories
      "pmesii.political": "Political",
      "pmesii.military": "Military", 
      "pmesii.economic": "Economic",
      "pmesii.social": "Social",
      "pmesii.information": "Information",
      "pmesii.infrastructure": "Infrastructure",
      
      // Risk & Confidence
      "risk.score": "Risk Score",
      "confidence.label": "Confidence",
      "confidence.belief": "Belief",
      "confidence.disbelief": "Disbelief", 
      "confidence.uncertainty": "Uncertainty",
      
      // Map Interface
      "map.aoi": "Area of Interest",
      "map.movement": "Movement Plan",
      "map.route": "Compute Route",
      
      // File Upload
      "upload.drop": "Drop image or video files here",
      "upload.analyzing": "Analyzing media...",
      
      // Sources
      "sources.title": "Sources",
      "sources.fraym": "Fraym",
      "sources.seerist": "Seerist", 
      "sources.sprinklr": "Sprinklr",
      "sources.news": "News",
      "sources.social": "Social",
      "sources.weather": "Weather",
      "sources.infra": "Infrastructure",
      
      // Weather
      "weather.title": "Weather Intelligence",
      "weather.description": "Real-time weather data and forecasting for tactical operations",
      "weather.location.title": "Weather Location",
      "weather.current": "Current Weather",
      "weather.forecast": "Forecast",
      "weather.alerts.title": "Weather Alerts",
      "weather.fetch": "Fetch Weather",
      "weather.noData": "No current weather data available",
      "weather.noForecast": "No forecast data available",
      "weather.fetchFirst": "Fetch Weather Data",
      "weather.fetchForecast": "Fetch Forecast Data"
    }
  },
  es: {
    translation: {
      "nav.map": "Mapa",
      "nav.intelligence": "Inteligencia",
      "nav.chat": "Chat", 
      "nav.analytics": "Análisis",
      "nav.timeline": "Cronología",
      "nav.weather": "Clima",
      "chat.placeholder": "Consulta sobre cualquier área de interés...",
      "pmesii.political": "Político",
      "pmesii.military": "Militar",
      "pmesii.economic": "Económico", 
      "pmesii.social": "Social",
      "pmesii.information": "Información",
      "pmesii.infrastructure": "Infraestructura",
      "risk.score": "Puntuación de Riesgo",
      "confidence.label": "Confianza"
    }
  },
  fr: {
    translation: {
      "nav.map": "Carte",
      "nav.intelligence": "Renseignement",
      "nav.chat": "Chat",
      "nav.analytics": "Analyse",
      "nav.timeline": "Chronologie",
      "nav.weather": "Météo",
      "chat.placeholder": "Demandez à propos de toute zone d'intérêt...",
      "pmesii.political": "Politique",
      "pmesii.military": "Militaire",
      "pmesii.economic": "Économique",
      "pmesii.social": "Social", 
      "pmesii.information": "Information",
      "pmesii.infrastructure": "Infrastructure",
      "risk.score": "Score de Risque",
      "confidence.label": "Confiance"
    }
  },
  ar: {
    translation: {
      "nav.map": "خريطة",
      "nav.intelligence": "استخبارات",
      "nav.chat": "محادثة",
      "nav.analytics": "تحليلات",
      "nav.timeline": "الجدول الزمني",
      "nav.weather": "الطقس",
      "chat.placeholder": "اسأل عن أي منطقة اهتمام...",
      "pmesii.political": "سياسي",
      "pmesii.military": "عسكري",
      "pmesii.economic": "اقتصادي",
      "pmesii.social": "اجتماعي",
      "pmesii.information": "معلومات", 
      "pmesii.infrastructure": "بنية تحتية",
      "risk.score": "نقاط المخاطر",
      "confidence.label": "الثقة"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;