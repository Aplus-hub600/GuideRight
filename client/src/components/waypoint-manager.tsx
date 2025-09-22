import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { MapPin, Target, Shield, Home, Plus, Edit2, Trash2, Navigation } from 'lucide-react'
import { apiRequest } from '@/lib/queryClient'
import { useToast } from '@/hooks/use-toast'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { cn } from '@/lib/utils'

export interface Waypoint {
  id: string
  name: string
  lat: number
  lng: number
  type: 'cache' | 'waypoint' | 'target' | 'safe_house'
  description?: string
  intelligenceData?: any
  isActive: boolean
  timestamp: string
}

const waypointSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  type: z.enum(['cache', 'waypoint', 'target', 'safe_house']),
  description: z.string().optional(),
})

type WaypointFormData = z.infer<typeof waypointSchema>

interface WaypointManagerProps {
  selectedPosition?: { lat: number; lng: number }
  onWaypointSelect?: (waypoint: Waypoint) => void
  onWaypointCreate?: (waypoint: Waypoint) => void
  className?: string
}

export function WaypointManager({ 
  selectedPosition,
  onWaypointSelect,
  onWaypointCreate,
  className 
}: WaypointManagerProps) {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingWaypoint, setEditingWaypoint] = useState<Waypoint | null>(null)
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const form = useForm<WaypointFormData>({
    resolver: zodResolver(waypointSchema),
    defaultValues: {
      name: '',
      type: 'waypoint',
      description: '',
      lat: selectedPosition?.lat || 0,
      lng: selectedPosition?.lng || 0,
    }
  })

  // Update form coordinates when selectedPosition changes
  useEffect(() => {
    if (selectedPosition) {
      form.setValue('lat', selectedPosition.lat)
      form.setValue('lng', selectedPosition.lng)
    }
  }, [selectedPosition, form])

  // Fetch waypoints
  const { data: waypointsData, isLoading } = useQuery({
    queryKey: ['/api/waypoints'],
  })
  
  const waypoints = waypointsData?.waypoints || []

  // Create waypoint mutation
  const createWaypoint = useMutation({
    mutationFn: (data: WaypointFormData) => 
      apiRequest('POST', '/api/waypoints', data).then(res => res.json()),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ['/api/waypoints'] })
      setIsCreateDialogOpen(false)
      form.reset()
      onWaypointCreate?.(response.waypoint)
      toast({
        title: 'Waypoint Created',
        description: `${response.waypoint.name} has been added to the tactical map`,
      })
    },
    onError: (error) => {
      console.error('Error creating waypoint:', error)
      toast({
        title: 'Creation Failed',
        description: 'Failed to create waypoint',
        variant: 'destructive'
      })
    }
  })

  // Update waypoint mutation
  const updateWaypoint = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<WaypointFormData> }) =>
      apiRequest('PUT', `/api/waypoints/${id}`, data).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/waypoints'] })
      setEditingWaypoint(null)
      form.reset()
      toast({
        title: 'Waypoint Updated',
        description: 'Waypoint has been successfully updated',
      })
    },
    onError: (error) => {
      console.error('Error updating waypoint:', error)
      toast({
        title: 'Update Failed',
        description: 'Failed to update waypoint',
        variant: 'destructive'
      })
    }
  })

  // Delete waypoint mutation
  const deleteWaypoint = useMutation({
    mutationFn: (id: string) =>
      apiRequest('DELETE', `/api/waypoints/${id}`).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/waypoints'] })
      toast({
        title: 'Waypoint Deleted',
        description: 'Waypoint has been removed from the tactical map',
      })
    },
    onError: (error) => {
      console.error('Error deleting waypoint:', error)
      toast({
        title: 'Deletion Failed',
        description: 'Failed to delete waypoint',
        variant: 'destructive'
      })
    }
  })

  const onSubmit = (data: WaypointFormData) => {
    if (editingWaypoint) {
      updateWaypoint.mutate({ id: editingWaypoint.id, data })
    } else {
      createWaypoint.mutate(data)
    }
  }

  const startEdit = (waypoint: Waypoint) => {
    setEditingWaypoint(waypoint)
    form.reset({
      name: waypoint.name,
      lat: waypoint.lat,
      lng: waypoint.lng,
      type: waypoint.type,
      description: waypoint.description || ''
    })
  }

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371 // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLng = (lng2 - lng1) * Math.PI / 180
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLng/2) * Math.sin(dLng/2)
    
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  }

  const getWaypointIcon = (type: string) => {
    switch (type) {
      case 'cache': return Target
      case 'target': return Target
      case 'safe_house': return Home
      default: return MapPin
    }
  }

  const getWaypointColor = (type: string) => {
    switch (type) {
      case 'cache': return 'text-blue-600 dark:text-blue-400'
      case 'target': return 'text-red-600 dark:text-red-400'
      case 'safe_house': return 'text-green-600 dark:text-green-400'
      default: return 'text-amber-600 dark:text-amber-400'
    }
  }

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Tactical Waypoints ({waypoints.length})
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Manage waypoints, caches, and targets for tactical operations
            </p>
          </div>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="gap-2" data-testid="button-create-waypoint">
                <Plus className="h-4 w-4" />
                Add Waypoint
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingWaypoint ? 'Edit Waypoint' : 'Create New Waypoint'}
                </DialogTitle>
              </DialogHeader>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Enter waypoint name" 
                            {...field} 
                            data-testid="input-waypoint-name"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type</FormLabel>
                        <FormControl>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger data-testid="select-waypoint-type">
                              <SelectValue placeholder="Select waypoint type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="waypoint">Waypoint</SelectItem>
                              <SelectItem value="cache">Intelligence Cache</SelectItem>
                              <SelectItem value="target">Target</SelectItem>
                              <SelectItem value="safe_house">Safe House</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="lat"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Latitude</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="any"
                              placeholder="0.0000" 
                              {...field}
                              onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                              data-testid="input-waypoint-lat"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lng"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Longitude</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="any"
                              placeholder="0.0000" 
                              {...field}
                              onChange={e => field.onChange(parseFloat(e.target.value) || 0)}
                              data-testid="input-waypoint-lng"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Enter tactical notes or intelligence data"
                            className="resize-none"
                            rows={3}
                            {...field}
                            data-testid="textarea-waypoint-description"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-2 pt-4">
                    <Button
                      type="submit"
                      disabled={createWaypoint.isPending || updateWaypoint.isPending}
                      data-testid="button-save-waypoint"
                    >
                      {editingWaypoint ? 'Update' : 'Create'} Waypoint
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsCreateDialogOpen(false)
                        setEditingWaypoint(null)
                        form.reset()
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </Card>

      {/* Waypoint List */}
      <Card className="p-4">
        {isLoading ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              Loading waypoints...
            </div>
          </div>
        ) : waypoints.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No waypoints created yet</p>
            <p className="text-sm">Click "Add Waypoint" to create your first tactical position</p>
          </div>
        ) : (
          <div className="space-y-3">
            {waypoints.map((waypoint) => {
              const WaypointIcon = getWaypointIcon(waypoint.type)
              const distance = selectedPosition 
                ? calculateDistance(selectedPosition.lat, selectedPosition.lng, waypoint.lat, waypoint.lng)
                : null
              
              return (
                <div
                  key={waypoint.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div 
                    className="flex items-center gap-3 flex-1 cursor-pointer"
                    onClick={() => onWaypointSelect?.(waypoint)}
                  >
                    <div className={cn('p-2 rounded-md bg-muted', getWaypointColor(waypoint.type))}>
                      <WaypointIcon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{waypoint.name}</p>
                        <Badge variant="secondary" className="text-xs">
                          {waypoint.type.replace('_', ' ').toUpperCase()}
                        </Badge>
                        {distance && (
                          <Badge variant="outline" className="text-xs gap-1">
                            <Navigation className="h-3 w-3" />
                            {distance.toFixed(1)} km
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {waypoint.lat.toFixed(4)}, {waypoint.lng.toFixed(4)}
                      </p>
                      {waypoint.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {waypoint.description}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <Button
                      onClick={() => startEdit(waypoint)}
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      data-testid={`button-edit-waypoint-${waypoint.id}`}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button
                      onClick={() => deleteWaypoint.mutate(waypoint.id)}
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                      data-testid={`button-delete-waypoint-${waypoint.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}