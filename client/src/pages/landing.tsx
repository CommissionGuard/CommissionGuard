import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, FileText, Clock, AlertTriangle, DollarSign, Users } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Navigation */}
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-gray-900">Commission Guard</span>
            </div>
            <Button 
              onClick={() => window.location.href = "/api/login"}
              className="bg-primary hover:bg-blue-700"
            >
              Sign In
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Protect Your Real Estate
            <span className="text-primary block">Commissions</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Monitor representation agreements, track contract expirations, and detect potential breaches
            before they cost you thousands in lost commissions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg"
              onClick={() => window.location.href = "/api/login"}
              className="bg-primary hover:bg-blue-700 text-lg px-8 py-3"
            >
              Get Started Today
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg px-8 py-3"
            >
              Watch Demo
            </Button>
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

      {/* Value Proposition */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              One Lost $500K Transaction Costs You $10,000
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-red-800 mb-2">Without Protection</h3>
                <p className="text-red-600">Lost commissions, legal fees, damaged reputation</p>
              </div>
              <div className="bg-primary text-white rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-2">Commission Guard</h3>
                <p className="text-blue-100">$199.99/year comprehensive protection</p>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-success mb-2">50x ROI</h3>
                <p className="text-green-600">Pays for itself with just one saved breach</p>
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
