import { SocialMediaPanel } from "@/components/social-media-panel"
import { useTranslation } from "react-i18next"

export default function SocialMedia() {
  const { t } = useTranslation()
  
  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          {t('socialMedia.title', 'Social Media Intelligence')}
        </h1>
        <p className="text-muted-foreground mt-2">
          {t('socialMedia.description', 'Analysis of social media posts, sentiment trends, and influencer activity for tactical intelligence')}
        </p>
      </div>
      
      <SocialMediaPanel data-testid="social-media-panel-main" />
    </div>
  )
}