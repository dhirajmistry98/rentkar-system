'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Badge } from '../../../components/ui/badge'
import { ArrowLeft, MapPin, Clock, Truck, Activity, Navigation } from 'lucide-react'


interface Partner {
  _id: string
  name: string
  status: 'online' | 'offline' | 'busy'
  location: {
    lat: number
    lng: number
  }
  lastGpsUpdate: string
}

interface GPSUpdate {
  partnerId: string
  partnerName: string
  location: {
    lat: number
    lng: number
  }
  timestamp: string
}

export default function PartnerTrackingPage() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [gpsUpdates, setGpsUpdates] = useState<GPSUpdate[]>([])
  const [loading, setLoading] = useState(true)
  const tableRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const samplePartners: Partner[] = [
      {
        _id: "partner123",
        name: "Rajesh Kumar",
        status: "online",
        location: { lat: 19.2030, lng: 72.8278 },
        lastGpsUpdate: new Date().toISOString()
      },
      {
        _id: "partner124",
        name: "Amit Sharma", 
        status: "busy",
        location: { lat: 19.1136, lng: 72.8697 },
        lastGpsUpdate: new Date().toISOString()
      },
      {
        _id: "partner125",
        name: "Priya Singh",
        status: "online",
        location: { lat: 19.0728, lng: 72.8826 },
        lastGpsUpdate: new Date().toISOString()
      }
    ]

    setTimeout(() => {
      setPartners(samplePartners)
      setLoading(false)
    }, 1000)
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      const randomPartner = partners[Math.floor(Math.random() * partners.length)]
      if (randomPartner && Math.random() > 0.6) {
        const latOffset = (Math.random() - 0.5) * 0.002
        const lngOffset = (Math.random() - 0.5) * 0.002
        
        const newLocation = {
          lat: randomPartner.location.lat + latOffset,
          lng: randomPartner.location.lng + lngOffset
        }

        const update: GPSUpdate = {
          partnerId: randomPartner._id,
          partnerName: randomPartner.name,
          location: newLocation,
          timestamp: new Date().toISOString()
        }
        
        setGpsUpdates(prev => [...prev, update])
        
        setPartners(prev => prev.map(p => 
          p._id === randomPartner._id 
            ? { ...p, location: newLocation, lastGpsUpdate: update.timestamp }
            : p
        ))
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [partners])

  useEffect(() => {
    if (tableRef.current) {
      tableRef.current.scrollTop = tableRef.current.scrollHeight
    }
  }, [gpsUpdates])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="outline" size="icon" asChild>
            <Link href="/partners">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Activity className="h-8 w-8" />
              Live Partner Tracking
            </h1>
            <p className="text-muted-foreground">Real-time GPS monitoring dashboard</p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Partner Status Cards */}
          <div className="lg:col-span-1 space-y-4">
            <h2 className="text-xl font-semibold mb-4">Active Partners</h2>
            {partners.map(partner => (
              <Card key={partner._id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4" />
                      <span className="font-medium">{partner.name}</span>
                    </div>
                    <Badge variant={partner.status === 'online' ? 'default' : partner.status === 'busy' ? 'secondary' : 'destructive'}>
                      {partner.status}
                    </Badge>
                  </div>
                  
                  <div className="space-y-1 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      <span className="font-mono">
                        {partner.location.lat.toFixed(4)}, {partner.location.lng.toFixed(4)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{new Date(partner.lastGpsUpdate).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Live Updates Feed */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="h-5 w-5" />
                  Live GPS Updates Feed
                </CardTitle>
                <CardDescription>
                  Real-time location updates from all active partners
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div 
                  ref={tableRef}
                  className="max-h-[600px] overflow-y-auto border rounded-lg"
                >
                  <table className="w-full">
                    <thead className="bg-muted/50 sticky top-0">
                      <tr>
                        <th className="text-left p-3 text-sm font-medium">Time</th>
                        <th className="text-left p-3 text-sm font-medium">Partner</th>
                        <th className="text-left p-3 text-sm font-medium">Location</th>
                        <th className="text-left p-3 text-sm font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {gpsUpdates.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="text-center p-12 text-muted-foreground">
                            <div className="flex flex-col items-center gap-2">
                              <Navigation className="h-8 w-8 opacity-50" />
                              <p>Waiting for GPS updates...</p>
                              <p className="text-xs">Updates will appear here automatically</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        gpsUpdates.slice(-100).reverse().map((update, index) => (
                          <tr 
                            key={index} 
                            className={`border-b hover:bg-muted/50 ${index === 0 ? 'bg-green-50 dark:bg-green-950/20' : ''}`}
                          >
                            <td className="p-3 text-sm">
                              {new Date(update.timestamp).toLocaleTimeString()}
                            </td>
                            <td className="p-3 text-sm font-medium">
                              {update.partnerName}
                            </td>
                            <td className="p-3 text-sm font-mono">
                              {update.location.lat.toFixed(6)}, {update.location.lng.toFixed(6)}
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-1">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                                <span className="text-xs text-green-600 font-medium">LIVE</span>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-between items-center mt-4 text-sm text-muted-foreground">
                  <span>
                    Total updates: {gpsUpdates.length}
                  </span>
                  <span>
                    Showing last {Math.min(100, gpsUpdates.length)} updates
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-green-600">
                {partners.filter(p => p.status === 'online').length}
              </p>
              <p className="text-sm text-muted-foreground">Online</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-yellow-600">
                {partners.filter(p => p.status === 'busy').length}
              </p>
              <p className="text-sm text-muted-foreground">Busy</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-blue-600">
                {gpsUpdates.length}
              </p>
              <p className="text-sm text-muted-foreground">GPS Updates</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-purple-600">
                {partners.length}
              </p>
              <p className="text-sm text-muted-foreground">Total Partners</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}