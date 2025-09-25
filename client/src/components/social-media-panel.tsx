import { useQuery } from "@tanstack/react-query"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from "recharts"
import { Search, Users, TrendingUp, MapPin, Hash, MessageCircle, Heart, Repeat2, Filter, Activity, Zap, Target } from "lucide-react"
import { SiFacebook, SiX, SiInstagram, SiWhatsapp, SiTelegram, SiTiktok, SiLinkedin, SiYoutube } from 'react-icons/si'
import { useTranslation } from "react-i18next"

interface SocialMediaPost {
  id: string
  message: string
  senderScreenName: string
  senderFollowersCount: number
  sentiment: string
  location: string
  latitude: number
  longitude: number
  createdTime: string
  retweets: number
  favorites: number
  country: string
  platform?: string
}

interface SocialMediaFilters {
  sentiment?: string
  country?: string
  platform?: string
  minFollowers?: number
  location?: { lat: number; lng: number; radius: number }
  limit?: number
}

const SENTIMENT_COLORS = {
  POSITIVE: "#10b981",
  NEGATIVE: "#ef4444", 
  NEUTRAL: "#6b7280"
}

// Enhanced colors for tactical theme
const TACTICAL_COLORS = {
  primary: '#3b82f6',
  secondary: '#ef4444', 
  accent: '#10b981',
  warning: '#f59e0b',
  muted: '#6b7280'
}

// Social media platform configurations
const PLATFORMS = {
  Facebook: { icon: SiFacebook, color: '#1877F2', name: 'Facebook' },
  Twitter: { icon: SiX, color: '#000000', name: 'X (Twitter)' },
  Instagram: { icon: SiInstagram, color: '#E4405F', name: 'Instagram' },
  WhatsApp: { icon: SiWhatsapp, color: '#25D366', name: 'WhatsApp' },
  Telegram: { icon: SiTelegram, color: '#0088CC', name: 'Telegram' },
  TikTok: { icon: SiTiktok, color: '#FF0050', name: 'TikTok' },
  LinkedIn: { icon: SiLinkedin, color: '#0A66C2', name: 'LinkedIn' },
  YouTube: { icon: SiYoutube, color: '#FF0000', name: 'YouTube' }
}

const getPlatformIcon = (platform: string) => {
  const platformData = PLATFORMS[platform as keyof typeof PLATFORMS]
  if (!platformData) return null
  
  const IconComponent = platformData.icon
  return <IconComponent className="h-4 w-4" style={{ color: platformData.color }} />
}

export function SocialMediaPanel({ "data-testid": testId }: { "data-testid"?: string }) {
  const { t } = useTranslation()
  const [filters, setFilters] = useState<SocialMediaFilters>({ limit: 100 })
  const [searchQuery, setSearchQuery] = useState("")
  const [realTimeData, setRealTimeData] = useState(0)
  
  // Simulate real-time data updates
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData(prev => prev + 1)
    }, 3000) // Update every 3 seconds
    return () => clearInterval(interval)
  }, [])

  const { data: postsData, isLoading } = useQuery({
    queryKey: ['/api/social-media/posts', filters],
    queryFn: async ({ queryKey }) => {
      const [url, filters] = queryKey;
      const params = new URLSearchParams();
      
      if (filters && typeof filters === 'object') {
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null) {
            params.append(key, String(value));
          }
        });
      }
      
      const response = await fetch(`${url}?${params.toString()}`);
      return response.json();
    },
    enabled: true
  })

  const { data: influencersData } = useQuery({
    queryKey: ['/api/social-media/influencers', { minFollowers: 1000 }],
    enabled: true
  })

  const posts: SocialMediaPost[] = (postsData as any)?.posts || []
  const totalPosts: number = (postsData as any)?.total || 0
  const influencers: SocialMediaPost[] = (influencersData as any)?.influencers || []

  // Filter posts based on search query, sentiment, and platform filters
  const filteredPosts = posts.filter(post => {
    // Apply search filter
    const matchesSearch = !searchQuery || 
      post.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.senderScreenName.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Apply sentiment filter
    const matchesSentiment = !filters.sentiment || 
      post.sentiment?.toUpperCase() === filters.sentiment.toUpperCase()
    
    // Apply platform filter
    const matchesPlatform = !filters.platform || 
      post.platform === filters.platform
    
    return matchesSearch && matchesSentiment && matchesPlatform
  })

  // Calculate analytics
  const sentimentStats = posts.reduce((acc, post) => {
    const sentiment = post.sentiment || 'NEUTRAL'
    acc[sentiment] = (acc[sentiment] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const sentimentChartData = Object.entries(sentimentStats).map(([sentiment, count]) => ({
    sentiment,
    count,
    fill: SENTIMENT_COLORS[sentiment as keyof typeof SENTIMENT_COLORS] || '#6b7280'
  }))

  const engagementData = posts.slice(0, 10).map(post => ({
    user: post.senderScreenName.substring(0, 10),
    retweets: post.retweets || 0,
    favorites: post.favorites || 0
  }))

  const locationStats = posts.reduce((acc, post) => {
    if (post.location) {
      acc[post.location] = (acc[post.location] || 0) + 1
    }
    return acc
  }, {} as Record<string, number>)

  const topLocations = Object.entries(locationStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)

  // Enhanced trending data for time-based analytics
  const trendingData = posts.slice(0, 24).reduce((acc, post, index) => {
    const hour = Math.floor(index / 2) // Group by hours
    if (!acc[hour]) acc[hour] = { hour, positive: 0, negative: 0, neutral: 0 }
    const sentiment = post.sentiment?.toLowerCase() || 'neutral'
    acc[hour][sentiment] = (acc[hour][sentiment] || 0) + 1
    return acc
  }, {} as Record<number, any>)
  
  const trendChartData = Object.values(trendingData).slice(0, 12)

  const hashtags = posts
    .flatMap(post => post.message.match(/#\w+/g) || [])
    .reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1
      return acc
    }, {} as Record<string, number>)

  const topHashtags = Object.entries(hashtags)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)

  // Platform statistics
  const platformStats = posts.reduce((acc, post) => {
    const platform = post.platform || 'Unknown'
    acc[platform] = (acc[platform] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const platformChartData = Object.entries(platformStats).map(([platform, count]) => ({
    platform,
    count,
    fill: PLATFORMS[platform as keyof typeof PLATFORMS]?.color || '#6b7280'
  }))

  return (
    <div className="space-y-6" data-testid={testId}>
      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search posts, users, hashtags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full"
                data-testid="input-social-search"
              />
            </div>
            <Select 
              value={filters.sentiment || "all"} 
              onValueChange={(value) => setFilters({...filters, sentiment: value === "all" ? undefined : value})}
            >
              <SelectTrigger className="w-48" data-testid="select-sentiment-filter">
                <SelectValue placeholder="Sentiment" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sentiments</SelectItem>
                <SelectItem value="POSITIVE">Positive</SelectItem>
                <SelectItem value="NEGATIVE">Negative</SelectItem>
                <SelectItem value="NEUTRAL">Neutral</SelectItem>
              </SelectContent>
            </Select>
            <Select 
              value={filters.platform || "all"} 
              onValueChange={(value) => setFilters({...filters, platform: value === "all" ? undefined : value})}
            >
              <SelectTrigger className="w-48" data-testid="select-platform-filter">
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Platforms</SelectItem>
                {Object.entries(PLATFORMS).map(([key, platform]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      {getPlatformIcon(key)}
                      {platform.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              size="sm" 
              className="whitespace-nowrap" 
              onClick={() => {
                setFilters({ limit: 100 })
                setSearchQuery("")
              }}
              data-testid="button-clear-filters"
            >
              <Filter className="h-4 w-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="posts" data-testid="tab-posts">Posts</TabsTrigger>
          <TabsTrigger value="influencers" data-testid="tab-influencers">Influencers</TabsTrigger>
          <TabsTrigger value="analytics" data-testid="tab-analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
                <MessageCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-total-posts">{totalPosts.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">From social media sources</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Platforms</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-platforms-count">{Object.keys(platformStats).length}</div>
                <p className="text-xs text-muted-foreground">Active sources</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Influencers</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-influencers-count">{influencers.length}</div>
                <p className="text-xs text-muted-foreground">1000+ followers</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Top Hashtags</CardTitle>
                <Hash className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-hashtags-count">{topHashtags.length}</div>
                <p className="text-xs text-muted-foreground">Trending topics</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Locations</CardTitle>
                <MapPin className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-locations-count">{topLocations.length}</div>
                <p className="text-xs text-muted-foreground">Geotagged posts</p>
              </CardContent>
            </Card>
          </div>

          {/* Analytics Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <Card className="border-2 border-primary/30 shadow-2xl bg-gradient-to-br from-card via-card to-primary/5 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent animate-pulse" />
                <CardHeader className="relative z-10">
                  <CardTitle className="flex items-center gap-2">
                    <motion.div
                      animate={{ rotate: [0, 360] }}
                      transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                    >
                      <Activity className="h-5 w-5 text-primary" />
                    </motion.div>
                    <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                      Sentiment Distribution
                    </span>
                    <motion.div
                      className="ml-auto px-2 py-1 bg-primary/20 rounded-full text-xs text-primary font-mono"
                      key={realTimeData}
                      initial={{ scale: 0.8, opacity: 0.5 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      LIVE
                    </motion.div>
                  </CardTitle>
                  <CardDescription>Real-time sentiment analysis • {posts.length} posts tracked</CardDescription>
                </CardHeader>
              <CardContent>
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 1, delay: 0.3 }}
                >
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={sentimentChartData}
                        dataKey="count"
                        nameKey="sentiment"
                        cx="50%"
                        cy="50%"
                        outerRadius={90}
                        innerRadius={40}
                        paddingAngle={8}
                        animationBegin={300}
                        animationDuration={2000}
                        animationEasing="ease-out"
                        label={({ sentiment, count }) => `${sentiment}: ${count}`}
                      >
                        {sentimentChartData.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.fill}
                            stroke="rgba(255,255,255,0.2)"
                            strokeWidth={3}
                            style={{
                              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))',
                            }}
                          />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'hsl(var(--popover))',
                          border: '1px solid hsl(var(--primary))',
                          borderRadius: '12px',
                          boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
                          backdropFilter: 'blur(8px)'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </motion.div>
              </CardContent>
            </Card>
            </motion.div>

            <Card className="border-2 border-warning/20 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-warning" />
                  Platform Distribution
                </CardTitle>
                <CardDescription>Intelligence sources across social media platforms</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={platformChartData}
                      dataKey="count"
                      nameKey="platform"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      innerRadius={40}
                      paddingAngle={5}
                      animationBegin={400}
                      animationDuration={1500}
                      label={({ platform, count }) => `${platform}: ${count}`}
                    >
                      {platformChartData.map((entry, index) => (
                        <Cell 
                          key={`cell-${index}`} 
                          fill={entry.fill}
                          stroke="rgba(255,255,255,0.2)"
                          strokeWidth={2}
                        />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--primary))',
                        borderRadius: '8px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card className="border-2 border-accent/20 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Hash className="h-5 w-5 text-accent animate-spin" style={{animationDuration: '3s'}} />
                  Trending Hashtags
                </CardTitle>
                <CardDescription>Most frequently used hashtags in intelligence chatter</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {topHashtags.map(([hashtag, count], index) => {
                      const intensity = Math.min(count / Math.max(...topHashtags.map(([,c]) => c)), 1)
                      const size = 0.8 + (intensity * 0.4) // Scale from 0.8 to 1.2
                      return (
                        <div key={hashtag} className="group p-2 rounded-lg hover:bg-muted/30 transition-all duration-200">
                          <div className="flex items-center justify-between">
                            <Badge 
                              variant="outline" 
                              className={`text-sm transition-all duration-300 group-hover:scale-110 ${intensity > 0.7 ? 'bg-warning/20 border-warning text-warning' : intensity > 0.4 ? 'bg-primary/20 border-primary text-primary' : ''}`}
                              style={{ fontSize: `${size}rem` }}
                            >
                              {hashtag}
                            </Badge>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-muted-foreground font-mono">{count}</span>
                              <div className="w-12 h-1 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className="bg-gradient-to-r from-warning to-primary h-full transition-all duration-1000"
                                  style={{ width: `${intensity * 100}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="posts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Social Media Posts</CardTitle>
              <CardDescription>
                Showing {filteredPosts.length} of {posts.length} posts
                {searchQuery && ` matching "${searchQuery}"`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {isLoading ? (
                    <div className="text-center py-8 text-muted-foreground">Loading posts...</div>
                  ) : filteredPosts.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No posts found</div>
                  ) : (
                    filteredPosts.slice(0, 50).map((post) => (
                      <Card key={post.id} className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            {post.platform && (
                              <Badge variant="outline" className="flex items-center gap-1">
                                {getPlatformIcon(post.platform)}
                                {post.platform}
                              </Badge>
                            )}
                            <span className="font-medium" data-testid={`text-username-${post.id}`}>@{post.senderScreenName}</span>
                            <Badge 
                              variant={post.sentiment === 'POSITIVE' ? 'default' : post.sentiment === 'NEGATIVE' ? 'destructive' : 'secondary'}
                              data-testid={`badge-sentiment-${post.id}`}
                            >
                              {post.sentiment}
                            </Badge>
                            {post.senderFollowersCount > 1000 && (
                              <Badge variant="outline">
                                <Users className="h-3 w-3 mr-1" />
                                {post.senderFollowersCount.toLocaleString()}
                              </Badge>
                            )}
                          </div>
                          {post.location && (
                            <Badge variant="outline">
                              <MapPin className="h-3 w-3 mr-1" />
                              {post.location}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm mb-3" data-testid={`text-message-${post.id}`}>{post.message}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Repeat2 className="h-3 w-3" />
                            {post.retweets || 0}
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {post.favorites || 0}
                          </div>
                          <div>{new Date(post.createdTime).toLocaleDateString()}</div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="influencers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Social Media Influencers</CardTitle>
              <CardDescription>Users with significant follower counts and engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {influencers.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">No influencers found</div>
                  ) : (
                    influencers.slice(0, 20).map((influencer) => (
                      <Card key={influencer.id} className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div>
                              <h4 className="font-medium" data-testid={`text-influencer-${influencer.id}`}>@{influencer.senderScreenName}</h4>
                              <p className="text-sm text-muted-foreground">
                                {influencer.senderFollowersCount.toLocaleString()} followers
                              </p>
                            </div>
                          </div>
                          <Badge 
                            variant={influencer.sentiment === 'POSITIVE' ? 'default' : influencer.sentiment === 'NEGATIVE' ? 'destructive' : 'secondary'}
                          >
                            {influencer.sentiment}
                          </Badge>
                        </div>
                        <p className="text-sm mb-3">{influencer.message}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Repeat2 className="h-3 w-3" />
                            {influencer.retweets || 0}
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="h-3 w-3" />
                            {influencer.favorites || 0}
                          </div>
                          {influencer.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="h-3 w-3" />
                              {influencer.location}
                            </div>
                          )}
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Engagement Analysis */}
          <Card className="border-2 border-primary/30 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Engagement Analysis
              </CardTitle>
              <CardDescription>Social media engagement metrics and performance indicators</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={engagementData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" opacity={0.3} />
                  <XAxis 
                    dataKey="user" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--popover))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                  />
                  <Bar 
                    dataKey="retweets" 
                    fill={TACTICAL_COLORS.secondary}
                    name="Retweets"
                    radius={[2, 2, 0, 0]}
                  />
                  <Bar 
                    dataKey="favorites" 
                    fill={TACTICAL_COLORS.accent}
                    name="Favorites"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Geographic Distribution */}
          <Card className="border-2 border-warning/30 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-warning" />
                Geographic Distribution
              </CardTitle>
              <CardDescription>Intelligence source locations across Bangladesh operational areas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground">Top Locations</h4>
                  {topLocations.map(([location, count], index) => (
                    <div key={location} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className="bg-warning/20 text-warning border-warning">
                          #{index + 1}
                        </Badge>
                        <div>
                          <span className="font-medium">{location}</span>
                          <p className="text-xs text-muted-foreground">Strategic location</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-lg font-bold">{count}</span>
                        <p className="text-xs text-muted-foreground">posts</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-muted-foreground">Coordinate Summary</h4>
                  {posts.filter(p => p.lat && p.lng).slice(0, 5).map((post) => (
                    <div key={post.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div>
                        <span className="font-medium text-sm">{post.location}</span>
                        <p className="text-xs text-muted-foreground">
                          {post.lat?.toFixed(4)}°N, {post.lng?.toFixed(4)}°E
                        </p>
                      </div>
                      <Badge variant={post.sentiment === 'POSITIVE' ? 'default' : post.sentiment === 'NEGATIVE' ? 'destructive' : 'secondary'}>
                        {post.sentiment}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Real-time Sentiment Timeline */}
          <Card className="border-2 border-accent/30 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-accent animate-pulse" />
                Sentiment Timeline Trends
              </CardTitle>
              <CardDescription>Real-time sentiment patterns over operational hours</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={trendChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" opacity={0.3} />
                  <XAxis 
                    dataKey="hour" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                    tickFormatter={(hour) => `${hour}:00`}
                  />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--popover))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '6px'
                    }}
                    labelFormatter={(hour) => `Hour ${hour}:00`}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="positive" 
                    stackId="1" 
                    stroke={SENTIMENT_COLORS.POSITIVE} 
                    fill={SENTIMENT_COLORS.POSITIVE}
                    fillOpacity={0.6}
                    animationDuration={2000}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="neutral" 
                    stackId="1" 
                    stroke={SENTIMENT_COLORS.NEUTRAL} 
                    fill={SENTIMENT_COLORS.NEUTRAL}
                    fillOpacity={0.6}
                    animationDuration={2000}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="negative" 
                    stackId="1" 
                    stroke={SENTIMENT_COLORS.NEGATIVE} 
                    fill={SENTIMENT_COLORS.NEGATIVE}
                    fillOpacity={0.6}
                    animationDuration={2000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-2 border-secondary/20 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-secondary animate-bounce" />
                  Engagement Analysis
                </CardTitle>
                <CardDescription>Top {engagementData.length} posts by interaction metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={engagementData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" opacity={0.3} />
                    <XAxis 
                      dataKey="user" 
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                    />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--popover))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '6px'
                      }}
                    />
                    <Bar 
                      dataKey="retweets" 
                      fill={TACTICAL_COLORS.primary}
                      radius={[4, 4, 0, 0]}
                      animationDuration={1200}
                    />
                    <Bar 
                      dataKey="favorites" 
                      fill={TACTICAL_COLORS.secondary}
                      radius={[4, 4, 0, 0]}
                      animationDuration={1200}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="border-2 border-accent/20 shadow-lg hover:shadow-xl transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-accent animate-pulse" />
                  Geographic Distribution
                </CardTitle>
                <CardDescription>Top {topLocations.length} locations by intelligence activity</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {topLocations.map(([location, count], index) => {
                      const percentage = Math.round((count / posts.length) * 100)
                      return (
                        <div key={location} className="group p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all duration-200">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-bold text-sm">
                                #{index + 1}
                              </div>
                              <span className="text-sm font-medium group-hover:text-primary transition-colors">{location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="animate-in fade-in duration-300">
                                {count} posts
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {percentage}%
                              </Badge>
                            </div>
                          </div>
                          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                            <div 
                              className="bg-gradient-to-r from-primary to-accent h-full transition-all duration-1000 ease-out"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}