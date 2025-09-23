import { useQuery } from "@tanstack/react-query"
import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { Search, Users, TrendingUp, MapPin, Hash, MessageCircle, Heart, Repeat2, Filter } from "lucide-react"
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
}

interface SocialMediaFilters {
  sentiment?: string
  country?: string
  minFollowers?: number
  location?: { lat: number; lng: number; radius: number }
  limit?: number
}

const SENTIMENT_COLORS = {
  POSITIVE: "#10b981",
  NEGATIVE: "#ef4444", 
  NEUTRAL: "#6b7280"
}

export function SocialMediaPanel({ "data-testid": testId }: { "data-testid"?: string }) {
  const { t } = useTranslation()
  const [filters, setFilters] = useState<SocialMediaFilters>({ limit: 100 })
  const [searchQuery, setSearchQuery] = useState("")

  const { data: postsData, isLoading } = useQuery({
    queryKey: ['/api/social-media/posts', filters],
    enabled: true
  })

  const { data: influencersData } = useQuery({
    queryKey: ['/api/social-media/influencers', { minFollowers: 1000 }],
    enabled: true
  })

  const posts: SocialMediaPost[] = (postsData as any)?.posts || []
  const influencers: SocialMediaPost[] = (influencersData as any)?.influencers || []

  // Filter posts based on search query and sentiment filter
  const filteredPosts = posts.filter(post => {
    // Apply search filter
    const matchesSearch = !searchQuery || 
      post.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.senderScreenName.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Apply sentiment filter
    const matchesSentiment = !filters.sentiment || 
      post.sentiment?.toUpperCase() === filters.sentiment.toUpperCase()
    
    return matchesSearch && matchesSentiment
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

  const hashtags = posts
    .flatMap(post => post.message.match(/#\w+/g) || [])
    .reduce((acc, tag) => {
      acc[tag] = (acc[tag] || 0) + 1
      return acc
    }, {} as Record<string, number>)

  const topHashtags = Object.entries(hashtags)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 10)

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
                <MessageCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-total-posts">{posts.length.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">From social media sources</p>
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

          {/* Sentiment Analysis Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sentiment Distribution</CardTitle>
                <CardDescription>Overall sentiment analysis of social media posts</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={sentimentChartData}
                      dataKey="count"
                      nameKey="sentiment"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label={({ sentiment, count }) => `${sentiment}: ${count}`}
                    >
                      {sentimentChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Hashtags</CardTitle>
                <CardDescription>Most frequently used hashtags</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {topHashtags.map(([hashtag, count], index) => (
                      <div key={hashtag} className="flex items-center justify-between">
                        <Badge variant="outline" className="text-sm">
                          {hashtag}
                        </Badge>
                        <span className="text-sm text-muted-foreground">{count}</span>
                      </div>
                    ))}
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

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Engagement Analysis</CardTitle>
                <CardDescription>Top posts by retweets and favorites</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={engagementData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="user" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="retweets" fill="#3b82f6" />
                    <Bar dataKey="favorites" fill="#ef4444" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Geographic Distribution</CardTitle>
                <CardDescription>Top locations by post count</CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <div className="space-y-3">
                    {topLocations.map(([location, count], index) => (
                      <div key={location} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">#{index + 1}</span>
                          <span className="text-sm">{location}</span>
                        </div>
                        <Badge variant="outline">{count} posts</Badge>
                      </div>
                    ))}
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