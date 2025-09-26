'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card'
import { Button } from '../../../components/ui/button'
import { Badge } from '../../../components/ui/badge'
import { ArrowLeft, MapPin, Clock, Truck, Activity, Navigation, Zap, Users, BarChart3, Radio } from 'lucide-react'

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-400 border-green-500/30 bg-green-500/20'
      case 'busy': return 'text-orange-400 border-orange-500/30 bg-orange-500/20'
      case 'offline': return 'text-gray-400 border-gray-500/30 bg-gray-500/20'
      default: return 'text-gray-400 border-gray-500/30 bg-gray-500/20'
    }
  }

  const getStatusGradient = (status: string) => {
    switch (status) {
      case 'online': return 'from-green-500/10 to-emerald-600/5 border-green-500/20'
      case 'busy': return 'from-orange-500/10 to-orange-600/5 border-orange-500/20'  
      case 'offline': return 'from-gray-500/10 to-gray-600/5 border-gray-500/20'
      default: return 'from-gray-500/10 to-gray-600/5 border-gray-500/20'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
        <div className="text-center relative z-10">
          <div className="relative">
            <div className="animate-spin rounded-full h-32 w-32 border-4 border-blue-500/30 border-t-blue-500 mb-6 mx-auto"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Navigation className="h-8 w-8 text-blue-400 animate-pulse" />
            </div>
          </div>
          <p className="text-white text-xl font-semibold">Connecting to GPS Network...</p>
          <p className="text-gray-400 mt-2">Initializing real-time tracking system</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/5 rounded-full blur-2xl"></div>
      </div>

      {/* Navigation Header */}
      <nav className="relative z-10 bg-white/5 backdrop-blur-xl border-b border-white/10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <Button className="bg-white/10 hover:bg-white/20 border-white/20 text-white" asChild>
                <Link href="/partners">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Partners
                </Link>
              </Button>
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
                    <Radio className="h-6 w-6 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Live GPS Tracking</h1>
                  <p className="text-gray-400 text-sm">Real-time partner monitoring system</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-green-500/20 px-4 py-2 rounded-full border border-green-500/30">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm font-medium">System Online</span>
              </div>
              <div className="text-gray-400 text-sm">
                {gpsUpdates.length} GPS Updates
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8 relative z-10">
        {/* Statistics Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-600/5 backdrop-blur-xl border-green-500/20 hover:scale-105 transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Online Partners</p>
                  <p className="text-3xl font-bold text-green-400 mt-1">
                    {partners.filter(p => p.status === 'online').length}
                  </p>
                </div>
                <div className="p-3 bg-green-500/20 rounded-xl group-hover:rotate-12 transition-transform duration-300">
                  <Users className="h-6 w-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500/10 to-orange-600/5 backdrop-blur-xl border-orange-500/20 hover:scale-105 transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Busy Partners</p>
                  <p className="text-3xl font-bold text-orange-400 mt-1">
                    {partners.filter(p => p.status === 'busy').length}
                  </p>
                </div>
                <div className="p-3 bg-orange-500/20 rounded-xl group-hover:rotate-12 transition-transform duration-300">
                  <Activity className="h-6 w-6 text-orange-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500/10 to-blue-600/5 backdrop-blur-xl border-blue-500/20 hover:scale-105 transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">GPS Updates</p>
                  <p className="text-3xl font-bold text-blue-400 mt-1">{gpsUpdates.length}</p>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-xl group-hover:rotate-12 transition-transform duration-300">
                  <BarChart3 className="h-6 w-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-purple-600/5 backdrop-blur-xl border-purple-500/20 hover:scale-105 transition-all duration-300 group">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Total Partners</p>
                  <p className="text-3xl font-bold text-purple-400 mt-1">{partners.length}</p>
                </div>
                <div className="p-3 bg-purple-500/20 rounded-xl group-hover:rotate-12 transition-transform duration-300">
                  <Truck className="h-6 w-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Active Partners Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-2">Active Partners</h2>
              <p className="text-gray-400">Real-time status monitoring</p>
            </div>
            
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {partners.map(partner => (
                <Card key={partner._id} className={`bg-gradient-to-br ${getStatusGradient(partner.status)} backdrop-blur-xl border hover:scale-[1.02] transition-all duration-300 group`}>
                  <CardContent className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <Truck className="h-6 w-6 text-white" />
                          </div>
                          <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full ${
                            partner.status === 'online' ? 'bg-green-400 animate-pulse' :
                            partner.status === 'busy' ? 'bg-orange-400' : 'bg-gray-400'
                          }`}></div>
                        </div>
                        <div>
                          <h3 className="font-semibold text-white">{partner.name}</h3>
                          <Badge className={`text-xs ${getStatusColor(partner.status)} border`}>
                            {partner.status.toUpperCase()}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-gray-300 bg-white/5 p-3 rounded-lg">
                        <MapPin className="h-4 w-4 text-blue-400" />
                        <span className="font-mono text-sm">
                          {partner.location.lat.toFixed(4)}, {partner.location.lng.toFixed(4)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2 text-gray-300 bg-white/5 p-3 rounded-lg">
                        <Clock className="h-4 w-4 text-green-400" />
                        <span className="text-sm">
                          {new Date(partner.lastGpsUpdate).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Live Updates Feed */}
          <div className="lg:col-span-2">
            <Card className="bg-white/10 backdrop-blur-xl border-white/20 h-full">
              <CardHeader className="border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg">
                      <Navigation className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-white text-xl">Live GPS Updates Feed</CardTitle>
                      <CardDescription className="text-gray-400">
                        Real-time location updates from all active partners
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-green-500/20 px-4 py-2 rounded-full border border-green-500/30">
                    <Zap className="h-4 w-4 text-green-400" />
                    <span className="text-green-400 text-sm font-medium">Live Stream</span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-6">
                <div 
                  ref={tableRef}
                  className="max-h-[500px] overflow-y-auto bg-white/5 rounded-xl border border-white/10"
                >
                  {gpsUpdates.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                      <div className="relative mb-6">
                        <div className="w-20 h-20 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center">
                          <Navigation className="h-10 w-10 text-blue-400 animate-pulse" />
                        </div>
                        <div className="absolute inset-0 rounded-full border-2 border-blue-500/30 animate-ping"></div>
                      </div>
                      <h3 className="text-xl font-semibold text-white mb-2">Initializing GPS Network</h3>
                      <p className="text-gray-400 mb-1">Waiting for location updates...</p>
                      <p className="text-gray-500 text-sm">Updates will appear here automatically</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {gpsUpdates.slice(-50).reverse().map((update, index) => (
                        <div 
                          key={index} 
                          className={`flex items-center justify-between p-4 rounded-lg transition-all duration-300 hover:bg-white/10 ${
                            index === 0 ? 'bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 shadow-lg' : 'bg-white/5'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="relative">
                              <div className={`w-3 h-3 rounded-full ${
                                index === 0 ? 'bg-green-400 animate-pulse shadow-lg shadow-green-400/50' : 'bg-blue-400'
                              }`}></div>
                              {index === 0 && (
                                <div className="absolute inset-0 rounded-full border-2 border-green-400/50 animate-ping"></div>
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-white text-sm">
                                {update.partnerName}
                              </p>
                              <p className="text-gray-400 text-xs">
                                {new Date(update.timestamp).toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="font-mono text-white text-sm">
                                {update.location.lat.toFixed(6)}, {update.location.lng.toFixed(6)}
                              </p>
                            </div>
                            <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${
                              index === 0 ? 'bg-green-500/30 border border-green-500/50' : 'bg-blue-500/20 border border-blue-500/30'
                            }`}>
                              <div className={`w-2 h-2 rounded-full ${
                                index === 0 ? 'bg-green-400 animate-pulse' : 'bg-blue-400'
                              }`}></div>
                              <span className={`text-xs font-medium ${
                                index === 0 ? 'text-green-400' : 'text-blue-400'
                              }`}>
                                {index === 0 ? 'LIVE' : 'UPDATE'}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-between items-center mt-6 p-4 bg-white/5 rounded-lg border border-white/10">
                  <div className="flex items-center gap-2 text-gray-400 text-sm">
                    <BarChart3 className="h-4 w-4" />
                    <span>Total updates: <span className="text-white font-medium">{gpsUpdates.length}</span></span>
                  </div>
                  <div className="text-gray-400 text-sm">
                    Showing last <span className="text-white font-medium">{Math.min(50, gpsUpdates.length)}</span> updates
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Custom Scrollbar Styles */}
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.3);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.5);
        }
      `}</style>
    </div>
  )
}