import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Shield, FileText, Clock, AlertTriangle, DollarSign, Users, TrendingUp, Eye, Lock, Home, CheckCircle, User } from "lucide-react";
import AnimatedBackground from "@/components/animated-background";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 relative">
      <AnimatedBackground />
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-sm border-b border-gray-200 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-primary to-blue-600 rounded-lg opacity-20 group-hover:opacity-30 transition-opacity duration-300"></div>
                <div className="relative bg-gradient-to-br from-primary to-blue-600 p-2 rounded-lg shadow-lg group-hover:scale-105 transition-transform duration-300">
                  <Shield className="h-6 w-6 text-white" />
                </div>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Commission Guard
              </span>
            </div>
            <Button 
              onClick={() => window.location.href = "/api/login"}
              className="bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-primary transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Sign In
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section with Real Estate Graphics */}
      <div className="relative overflow-hidden py-20">
        {/* Real Estate Background Elements */}
        <div className="absolute inset-0 z-0">
          {/* Property silhouettes in background */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blue-100/20 to-transparent">
            <svg className="absolute bottom-0 left-1/4 w-16 h-20 text-blue-200/40 animate-float" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
            <svg className="absolute bottom-0 right-1/3 w-12 h-16 text-purple-200/40 animate-float-delayed" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
            <svg className="absolute bottom-0 left-1/2 w-20 h-24 text-green-200/40 animate-float" viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
            </svg>
          </div>
          
          {/* Property icons scattered */}
          <div className="absolute top-20 left-10 opacity-10">
            <Home className="h-24 w-24 text-blue-600 animate-bounce-slow" />
          </div>
          <div className="absolute top-32 right-16 opacity-10">
            <Home className="h-32 w-32 text-green-600 animate-float" />
          </div>
          <div className="absolute bottom-40 right-1/4 opacity-10">
            <Home className="h-20 w-20 text-purple-600 animate-ping-slow" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <div className="text-left">
              {/* Hero Icon */}
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary to-blue-600 rounded-xl mb-6 shadow-2xl animate-float">
                <Shield className="w-10 h-10 text-white" />
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                <span className="bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Protect Your
                </span>
                <span className="block bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent animate-gradient">
                  Real Estate Commissions
                </span>
              </h1>
              
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Monitor representation agreements 24/7, detect potential breaches instantly, and connect with legal experts to safeguard your hard-earned income.
              </p>
              
              {/* Trust Indicators */}
              <div className="flex flex-wrap gap-6 mb-8">
                <div className="flex items-center space-x-2">
                  <div className="bg-green-100 rounded-full p-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <span className="text-gray-700 font-medium">$2.3M+ Protected</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="bg-blue-100 rounded-full p-2">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="text-gray-700 font-medium">500+ Agents</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="bg-purple-100 rounded-full p-2">
                    <TrendingUp className="h-5 w-5 text-purple-600" />
                  </div>
                  <span className="text-gray-700 font-medium">94% Success Rate</span>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  onClick={() => window.location.href = "/api/login"}
                  className="bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-purple-600 text-lg px-8 py-4 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
                >
                  Start Protecting Commissions
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="text-lg px-8 py-4 border-2 border-gray-300 hover:border-primary hover:bg-primary/5 transition-all duration-300 shadow-lg"
                >
                  <Eye className="h-5 w-5 mr-2" />
                  Watch Demo
                </Button>
              </div>
            </div>

            {/* Right Column - Real Estate Dashboard Visual */}
            <div className="relative">
              <div className="relative bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 shadow-2xl">
                {/* Property Dashboard Mockup */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-2">
                      <Home className="h-6 w-6 text-primary" />
                      <span className="font-semibold text-gray-900">Property Portfolio</span>
                    </div>
                    <Badge className="bg-green-100 text-green-800">Protected</Badge>
                  </div>
                  
                  {/* Sample Property Cards */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <Home className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">123 Oak Street</p>
                          <p className="text-sm text-gray-600">Buyer Agreement</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">$12,500</p>
                        <p className="text-xs text-gray-500">Commission</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                          <Home className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">456 Pine Avenue</p>
                          <p className="text-sm text-gray-600">Seller Listing</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-green-600">$18,750</p>
                        <p className="text-xs text-gray-500">Commission</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">789 Elm Drive</p>
                          <p className="text-sm text-yellow-700">Requires Attention</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-yellow-600">Alert</p>
                        <p className="text-xs text-gray-500">Contract Issue</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Protection Status */}
                  <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Shield className="h-5 w-5 text-green-600" />
                        <span className="font-medium text-green-900">Commission Protection Active</span>
                      </div>
                      <span className="text-green-600 font-semibold">$31,250</span>
                    </div>
                  </div>
                </div>
                
                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 bg-white rounded-full p-3 shadow-lg animate-bounce-slow">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
                <div className="absolute -bottom-4 -left-4 bg-white rounded-full p-3 shadow-lg animate-float">
                  <Lock className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Everything You Need to Secure Your Commissions
          </h2>
          <p className="text-lg text-gray-600">
            Comprehensive protection for your representation agreements
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <FileText className="h-10 w-10 text-primary mb-4" />
              <CardTitle>Contract Management</CardTitle>
              <CardDescription>
                Upload and manage all your representation agreements in one secure location
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Clock className="h-10 w-10 text-warning mb-4" />
              <CardTitle>Expiration Tracking</CardTitle>
              <CardDescription>
                Get notified before contracts expire so you never lose a client unexpectedly
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <AlertTriangle className="h-10 w-10 text-accent mb-4" />
              <CardTitle>Breach Detection</CardTitle>
              <CardDescription>
                Monitor public records for unauthorized transactions and potential contract breaches
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-10 w-10 text-success mb-4" />
              <CardTitle>Audit Trail</CardTitle>
              <CardDescription>
                Maintain detailed logs of all interactions for legal protection and compliance
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-10 w-10 text-primary mb-4" />
              <CardTitle>Team Management</CardTitle>
              <CardDescription>
                Brokers can oversee their agents' contracts and ensure office-wide compliance
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <DollarSign className="h-10 w-10 text-success mb-4" />
              <CardTitle>ROI Protection</CardTitle>
              <CardDescription>
                For just $199/year, protect thousands in potential commission losses
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Trusted by Top Real Estate Professionals
            </h2>
            <p className="text-lg text-gray-600">
              See how Commission Guard has protected millions in commissions
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="bg-white border border-gray-200 shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  {[1,2,3,4,5].map((star) => (
                    <span key={star} className="text-yellow-400 text-xl">★</span>
                  ))}
                </div>
                <blockquote className="text-gray-700 mb-6 italic">
                  "Commission Guard saved me $18,500 when a client tried to work with another agent behind my back. The breach detection caught it within 24 hours."
                </blockquote>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Sarah Chen</p>
                    <p className="text-gray-600 text-sm">Top Producer, RE/MAX Premier</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  {[1,2,3,4,5].map((star) => (
                    <span key={star} className="text-yellow-400 text-xl">★</span>
                  ))}
                </div>
                <blockquote className="text-gray-700 mb-6 italic">
                  "As a broker, Commission Guard gives me peace of mind knowing all my agents' contracts are monitored. It's paid for itself 10x over this year alone."
                </blockquote>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Michael Rodriguez</p>
                    <p className="text-gray-600 text-sm">Broker/Owner, Pacific Realty Group</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border border-gray-200 shadow-lg">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  {[1,2,3,4,5].map((star) => (
                    <span key={star} className="text-yellow-400 text-xl">★</span>
                  ))}
                </div>
                <blockquote className="text-gray-700 mb-6 italic">
                  "The automated contract tracking alone is worth the price. I never have to worry about missing a renewal deadline again."
                </blockquote>
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">Jennifer Thompson</p>
                    <p className="text-gray-600 text-sm">Luxury Specialist, Coldwell Banker</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Value Proposition */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              One Lost $500K Transaction Costs You $15,000+
            </h2>
            <p className="text-lg text-gray-600 mb-12 max-w-3xl mx-auto">
              Don't let contract breaches drain your income. Commission Guard provides enterprise-level protection at a fraction of the cost.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-red-50 border border-red-200 rounded-xl p-8 transform hover:scale-105 transition-transform duration-300">
                <div className="text-red-600 mb-4">
                  <AlertTriangle className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-red-800 mb-4">Without Protection</h3>
                <ul className="text-red-600 space-y-2 text-left">
                  <li>• Lost commissions ($15,000+ per breach)</li>
                  <li>• Legal fees ($5,000-$25,000)</li>
                  <li>• Damaged client relationships</li>
                  <li>• Reputation risk</li>
                </ul>
              </div>
              
              <div className="bg-gradient-to-br from-primary to-blue-600 text-white rounded-xl p-8 transform hover:scale-105 transition-transform duration-300 shadow-xl">
                <div className="text-white mb-4">
                  <Shield className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold mb-4">Commission Guard</h3>
                <div className="text-blue-100 space-y-2">
                  <p className="text-2xl font-bold text-white">$299/year</p>
                  <p>Complete protection suite</p>
                  <p>24/7 monitoring</p>
                  <p>Legal support network</p>
                </div>
              </div>
              
              <div className="bg-green-50 border border-green-200 rounded-xl p-8 transform hover:scale-105 transition-transform duration-300">
                <div className="text-green-600 mb-4">
                  <TrendingUp className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold text-green-800 mb-4">Return on Investment</h3>
                <ul className="text-green-600 space-y-2 text-left">
                  <li>• 50x ROI average</li>
                  <li>• Pays for itself with one saved breach</li>
                  <li>• $2.3M+ protected to date</li>
                  <li>• 94% success rate</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary to-blue-600 py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Protect Your Commissions?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of agents who trust Commission Guard to secure their income
          </p>
          <Button 
            size="lg"
            onClick={() => window.location.href = "/api/login"}
            className="bg-white text-primary hover:bg-gray-100 text-lg px-8 py-3"
          >
            Start Your Free Trial
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Shield className="h-6 w-6" />
            <span className="text-lg font-semibold">Commission Guard</span>
          </div>
          <p className="text-gray-400">
            © 2024 Commission Guard. All rights reserved. Patent Pending.
          </p>
        </div>
      </footer>
    </div>
  );
}
