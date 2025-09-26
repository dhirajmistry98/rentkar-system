import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Clock, Truck } from 'lucide-react'

interface PartnerTrackerProps {
  partner: {
    _id: string
    name: string
    status: 'online' | 'offline' | 'busy'
    location: {
      lat: number
      lng: number
    }
    lastGpsUpdate?: string
  }
}

export default function PartnerTracker({ partner }: PartnerTrackerProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            {partner.name}
          </div>
          <Badge variant={partner.status === 'online' ? 'default' : 'secondary'}>
            {partner.status}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="h-4 w-4" />
            <span className="font-mono">
              {partner.location.lat.toFixed(6)}, {partner.location.lng.toFixed(6)}
            </span>
          </div>
          {partner.lastGpsUpdate && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>
                {new Date(partner.lastGpsUpdate).toLocaleTimeString()}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}