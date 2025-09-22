import { Map, MessageSquare, BarChart3, Shield, Globe2, Clock } from "lucide-react"
import { useLocation } from "wouter"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { ThemeToggle } from "./theme-toggle"
import { LanguageSwitcher } from "./language-switcher"
import { useTranslation } from "react-i18next"

const navItems = [
  {
    title: "nav.map",
    url: "/",
    icon: Map,
  },
  {
    title: "nav.chat", 
    url: "/chat",
    icon: MessageSquare,
  },
  {
    title: "nav.intelligence",
    url: "/intelligence", 
    icon: Shield,
  },
  {
    title: "nav.analytics",
    url: "/analytics",
    icon: BarChart3,
  },
  {
    title: "nav.timeline",
    url: "/timeline",
    icon: Clock,
  },
]

export function AppSidebar() {
  const { t } = useTranslation()
  const [location] = useLocation()

  return (
    <Sidebar variant="inset">
      <SidebarHeader>
        <div className="flex items-center gap-3 px-2 py-2">
          <div className="flex items-center gap-2">
            <Globe2 className="h-6 w-6 text-primary" />
            <div className="flex flex-col">
              <span className="text-sm font-semibold">GuideRight</span>
              <span className="text-xs text-muted-foreground">Tactical Intel</span>
            </div>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = location === item.url || 
                  (item.url !== "/" && location.startsWith(item.url))
                
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild
                      isActive={isActive}
                      tooltip={t(item.title)}
                    >
                      <a href={item.url} data-testid={`nav-${item.title.split('.')[1]}`}>
                        <Icon className="h-4 w-4" />
                        <span>{t(item.title)}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <div className="flex items-center gap-2 px-2 py-1.5">
                  <ThemeToggle />
                  <LanguageSwitcher />
                </div>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarRail />
    </Sidebar>
  )
}