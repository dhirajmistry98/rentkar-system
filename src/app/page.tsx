import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { Button } from '../components/ui/button'
import { BookOpen, Truck, BarChart3, Users, MapPin, Clock, CheckCircle, TrendingUp, Bell, Search, Settings } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-gray-950 relative overflow-hidden">
      {/* Advanced background effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-violet-900/20 via-transparent to-transparent"></div>
        <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent"></div>
        <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-to-r from-cyan-400/10 to-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-gradient-to-r from-purple-500/10 to-pink-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Enhanced Navigation Header */}
      <nav className="relative z-20 bg-white/[0.02] backdrop-blur-2xl border-b border-white/[0.08] supports-backdrop-blur:bg-white/[0.02]">
        <div className="container mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-500/25">
                  <Truck className="h-7 w-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-gray-950 animate-pulse"></div>
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Rentkar</span>
                <p className="text-xs text-gray-400 -mt-1">Admin Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-6">
              <div className="hidden md:flex items-center space-x-4 bg-white/[0.03] rounded-full px-4 py-2 border border-white/[0.08]">
                <Search className="h-4 w-4 text-gray-400" />
                <input 
                  placeholder="Quick search..." 
                  className="bg-transparent text-sm text-white placeholder-gray-400 border-none outline-none w-32"
                />
              </div>
              
              <div className="flex items-center space-x-3">
                <button className="relative p-2 hover:bg-white/[0.05] rounded-xl transition-colors">
                  <Bell className="h-5 w-5 text-gray-300" />
                  <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                </button>
                
                <button className="p-2 hover:bg-white/[0.05] rounded-xl transition-colors">
                  <Settings className="h-5 w-5 text-gray-300" />
                </button>
                
                <div className="flex items-center space-x-3 pl-3 border-l border-white/[0.08]">
                  <div className="flex items-center space-x-2 text-emerald-400">
                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-sm shadow-emerald-400/50"></div>
                    <span className="text-sm font-medium">System Online</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8 relative z-10">
        {/* Modern Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full border border-blue-500/20 mb-8 backdrop-blur-sm">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse mr-3"></div>
            <span className="text-blue-300 text-sm font-semibold tracking-wide">DASHBOARD V3.0 • REAL-TIME</span>
          </div>
          
          <h1 className="text-7xl font-black mb-6 leading-tight">
            <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              Command
            </span>
            <br />
            <span className="text-5xl bg-gradient-to-r from-gray-300 to-gray-500 bg-clip-text text-transparent">
              Center
            </span>
          </h1>
          
          <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed font-light">
            Next-generation operations hub with AI-powered insights, predictive analytics, 
            and seamless partner orchestration.
          </p>
        </div>

        {/* Modern Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {[
            { icon: BookOpen, label: "Live Bookings", value: "247", change: "+12%", color: "blue" },
            { icon: Users, label: "Active Partners", value: "89", change: "+5%", color: "emerald" },
            { icon: CheckCircle, label: "Completed", value: "34", change: "+23%", color: "purple" },
            { icon: TrendingUp, label: "Success Rate", value: "98.2%", change: "+2.1%", color: "cyan" }
          ].map((stat, index) => (
            <Card key={index} className="bg-white/[0.02] backdrop-blur-xl border border-white/[0.05] hover:border-white/[0.1] hover:bg-white/[0.03] transition-all duration-300 group">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-2xl bg-gradient-to-br ${
                    stat.color === 'blue' ? 'from-blue-500/20 to-blue-600/5' :
                    stat.color === 'emerald' ? 'from-emerald-500/20 to-emerald-600/5' :
                    stat.color === 'purple' ? 'from-purple-500/20 to-purple-600/5' :
                    'from-cyan-500/20 to-cyan-600/5'
                  }`}>
                    <stat.icon className={`h-6 w-6 ${
                      stat.color === 'blue' ? 'text-blue-400' :
                      stat.color === 'emerald' ? 'text-emerald-400' :
                      stat.color === 'purple' ? 'text-purple-400' :
                      'text-cyan-400'
                    }`} />
                  </div>
                </div>
                <div>
                  <p className="text-gray-400 text-sm font-medium mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                  <p className="text-emerald-400 text-xs font-semibold flex items-center">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {stat.change}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Redesigned Action Cards */}
        <div className="grid lg:grid-cols-2 gap-8 max-w-7xl mx-auto mb-16">
          <Card className="relative bg-gradient-to-br from-blue-500/[0.07] via-blue-600/[0.03] to-transparent backdrop-blur-xl border border-blue-500/20 hover:border-blue-400/30 transition-all duration-500 group hover:scale-[1.01] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="pb-6 relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-4 bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-2xl group-hover:from-blue-500/30 group-hover:to-blue-600/20 transition-all duration-300">
                  <BookOpen className="h-8 w-8 text-blue-400" />
                </div>
                <div className="px-3 py-1 bg-blue-500/10 rounded-full border border-blue-500/20">
                  <span className="text-blue-300 text-xs font-semibold">CORE MODULE</span>
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-white mb-2">
                Booking Intelligence
              </CardTitle>
              <CardDescription className="text-gray-400 text-base leading-relaxed">
                Advanced booking orchestration with ML-powered partner matching and automated workflows
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 relative z-10">
              <div className="grid grid-cols-1 gap-4 mb-8">
                {[
                  { icon: MapPin, text: "Smart location algorithms", color: "text-blue-400" },
                  { icon: CheckCircle, text: "AI document verification", color: "text-emerald-400" },
                  { icon: Clock, text: "Real-time orchestration", color: "text-purple-400" }
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.03] transition-colors">
                    <feature.icon className={`h-5 w-5 ${feature.color}`} />
                    <span className="text-gray-300 font-medium">{feature.text}</span>
                  </div>
                ))}
              </div>
              <Button asChild className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white border-0 py-4 text-base font-bold transition-all duration-300 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 rounded-xl">
                <Link href="/bookings">
                  Access Booking Hub
                  <BookOpen className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="relative bg-gradient-to-br from-emerald-500/[0.07] via-emerald-600/[0.03] to-transparent backdrop-blur-xl border border-emerald-500/20 hover:border-emerald-400/30 transition-all duration-500 group hover:scale-[1.01] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            <CardHeader className="pb-6 relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div className="p-4 bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 rounded-2xl group-hover:from-emerald-500/30 group-hover:to-emerald-600/20 transition-all duration-300">
                  <Truck className="h-8 w-8 text-emerald-400" />
                </div>
                <div className="px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                  <span className="text-emerald-300 text-xs font-semibold">LIVE TRACKING</span>
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-white mb-2">
                Partner Network
              </CardTitle>
              <CardDescription className="text-gray-400 text-base leading-relaxed">
                Real-time fleet monitoring with predictive analytics and performance optimization
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 relative z-10">
              <div className="grid grid-cols-1 gap-4 mb-8">
                {[
                  { icon: MapPin, text: "Live GPS telemetry", color: "text-emerald-400" },
                  { icon: BarChart3, text: "Predictive analytics", color: "text-blue-400" },
                  { icon: Users, text: "Dynamic availability", color: "text-purple-400" }
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.02] border border-white/[0.05] hover:bg-white/[0.03] transition-colors">
                    <feature.icon className={`h-5 w-5 ${feature.color}`} />
                    <span className="text-gray-300 font-medium">{feature.text}</span>
                  </div>
                ))}
              </div>
              <Button asChild className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white border-0 py-4 text-base font-bold transition-all duration-300 shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 rounded-xl">
                <Link href="/partners">
                  Monitor Partners
                  <Truck className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Feature Grid */}
        <div className="max-w-6xl mx-auto mb-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent mb-4">
              Platform Capabilities
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Comprehensive suite of tools designed for modern fleet management and operations
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: BarChart3,
                title: "Advanced Analytics",
                description: "Machine learning insights with predictive modeling and trend analysis",
                color: "from-purple-500/10 to-purple-600/5",
                iconColor: "text-purple-400",
                borderColor: "border-purple-500/20"
              },
              {
                icon: MapPin,
                title: "Intelligent Routing",
                description: "AI-powered optimization with real-time traffic and availability data",
                color: "from-blue-500/10 to-blue-600/5",
                iconColor: "text-blue-400",
                borderColor: "border-blue-500/20"
              },
              {
                icon: Clock,
                title: "Live Operations",
                description: "Real-time monitoring with instant alerts and automated responses",
                color: "from-cyan-500/10 to-cyan-600/5",
                iconColor: "text-cyan-400",
                borderColor: "border-cyan-500/20"
              }
            ].map((feature, index) => (
              <Card key={index} className={`bg-gradient-to-br ${feature.color} backdrop-blur-xl border ${feature.borderColor} hover:border-opacity-40 transition-all duration-300 group hover:scale-[1.02]`}>
                <CardContent className="p-8 text-center">
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-br ${feature.color} mb-6`}>
                    <feature.icon className={`h-8 w-8 ${feature.iconColor} group-hover:scale-110 transition-transform duration-300`} />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Modern Footer */}
        <div className="text-center pt-12 border-t border-white/[0.05]">
          <div className="mb-6">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/[0.02] rounded-full border border-white/[0.08]">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
              <span className="text-gray-300 text-sm font-medium">All systems operational</span>
            </div>
          </div>
          <p className="text-gray-500 text-sm">
            © 2024 Rentkar Command Center • Built for the future of logistics
          </p>
        </div>
      </div>
    </div>
  )
}