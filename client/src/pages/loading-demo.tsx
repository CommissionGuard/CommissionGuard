import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  HouseLoadingAnimation, 
  KeyLoadingAnimation,
  PropertySearchAnimation,
  CommissionProtectionAnimation,
  ClientLoadingAnimation,
  ContractLoadingAnimation,
  MoneyLoadingAnimation,
  ShowingLoadingAnimation,
  PropertyCardSkeleton,
  ClientCardSkeleton,
  ContractCardSkeleton,
  FloatingHouse,
  FloatingKey,
  FloatingDollar,
  PageTransitionLoading,
  ButtonSpinner,
  SuccessAnimation
} from "@/components/ui/loading-animations";
import { Home, Key, Users, FileText, DollarSign, Calendar, MapPin, Shield } from "lucide-react";

export default function LoadingDemo() {
  const [showTransition, setShowTransition] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loadingButtons, setLoadingButtons] = useState<Record<string, boolean>>({});

  const handleButtonClick = (buttonId: string) => {
    setLoadingButtons(prev => ({ ...prev, [buttonId]: true }));
    setTimeout(() => {
      setLoadingButtons(prev => ({ ...prev, [buttonId]: false }));
      if (buttonId === 'success') {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Floating background animations */}
      <FloatingHouse className="top-10 left-10" />
      <FloatingKey className="top-32 right-20" />
      <FloatingDollar className="bottom-40 left-1/4" />
      <FloatingHouse className="bottom-20 right-16" />
      <FloatingKey className="top-1/3 left-3/4" />
      <FloatingDollar className="top-2/3 right-1/3" />

      {/* Page transition overlay */}
      {showTransition && (
        <PageTransitionLoading message="Switching to your dashboard..." />
      )}

      {/* Success animation overlay */}
      {showSuccess && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 shadow-xl">
            <SuccessAnimation message="Animation complete!" />
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Real Estate Loading Animations</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experience playful, real estate themed micro-interactions designed to enhance user engagement 
            throughout the Commission Guard platform.
          </p>
        </div>

        <Tabs defaultValue="primary" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="primary">Primary Animations</TabsTrigger>
            <TabsTrigger value="skeletons">Loading Skeletons</TabsTrigger>
            <TabsTrigger value="interactions">Micro-Interactions</TabsTrigger>
            <TabsTrigger value="buttons">Button States</TabsTrigger>
          </TabsList>

          <TabsContent value="primary" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="card-hover">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Home className="w-5 h-5" />
                    House Animation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <HouseLoadingAnimation size={48} message="Building your dashboard..." />
                </CardContent>
              </Card>

              <Card className="card-hover">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Key className="w-5 h-5" />
                    Key Animation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <KeyLoadingAnimation size={48} message="Unlocking your data..." />
                </CardContent>
              </Card>

              <Card className="card-hover">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="w-5 h-5" />
                    Property Search
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <PropertySearchAnimation size={48} message="Searching properties..." />
                </CardContent>
              </Card>

              <Card className="card-hover">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Commission Protection
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CommissionProtectionAnimation size={48} message="Protecting your commission..." />
                </CardContent>
              </Card>

              <Card className="card-hover">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Client Loading
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ClientLoadingAnimation size={48} message="Loading clients..." />
                </CardContent>
              </Card>

              <Card className="card-hover">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Contract Processing
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ContractLoadingAnimation size={48} message="Processing contracts..." />
                </CardContent>
              </Card>

              <Card className="card-hover">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5" />
                    Money Animation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <MoneyLoadingAnimation size={48} message="Calculating commissions..." />
                </CardContent>
              </Card>

              <Card className="card-hover">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Showing Calendar
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ShowingLoadingAnimation size={48} message="Loading showings..." />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="skeletons" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Property Card Skeleton</CardTitle>
                </CardHeader>
                <CardContent>
                  <PropertyCardSkeleton />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Client Card Skeleton</CardTitle>
                </CardHeader>
                <CardContent>
                  <ClientCardSkeleton />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Contract Card Skeleton</CardTitle>
                </CardHeader>
                <CardContent>
                  <ContractCardSkeleton />
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Multiple Skeleton Grid</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <PropertyCardSkeleton />
                  <ClientCardSkeleton />
                  <ContractCardSkeleton />
                  <PropertyCardSkeleton />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="interactions" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="card-hover btn-real-estate">
                <CardHeader>
                  <CardTitle>Hover Card Animation</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    This card demonstrates the real estate themed hover effects with smooth 
                    transitions and micro-interactions.
                  </p>
                  <Badge className="mt-2">Hover me!</Badge>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden">
                <CardHeader>
                  <CardTitle>Floating Elements</CardTitle>
                </CardHeader>
                <CardContent className="relative">
                  <p className="text-gray-600 mb-4">
                    Background floating animations create a dynamic, engaging experience.
                  </p>
                  <div className="relative h-32 border-2 border-dashed border-gray-300 rounded-lg">
                    <FloatingHouse className="top-2 left-4" />
                    <FloatingKey className="top-8 right-8" />
                    <FloatingDollar className="bottom-4 left-12" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Page Transition</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Full-screen page transitions with real estate branding and smooth animations.
                </p>
                <Button 
                  onClick={() => setShowTransition(true)}
                  className="btn-real-estate"
                >
                  Trigger Page Transition
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="buttons" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Loading Button</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    onClick={() => handleButtonClick('basic')}
                    disabled={loadingButtons.basic}
                    className="w-full btn-real-estate"
                  >
                    {loadingButtons.basic ? (
                      <>
                        <ButtonSpinner size={16} />
                        <span className="ml-2">Processing...</span>
                      </>
                    ) : (
                      "Click to Load"
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Success Animation</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    onClick={() => handleButtonClick('success')}
                    disabled={loadingButtons.success}
                    className="w-full btn-real-estate bg-green-600 hover:bg-green-700"
                  >
                    {loadingButtons.success ? (
                      <>
                        <ButtonSpinner size={16} />
                        <span className="ml-2">Completing...</span>
                      </>
                    ) : (
                      "Show Success"
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Real Estate Button</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button 
                    onClick={() => handleButtonClick('realestate')}
                    disabled={loadingButtons.realestate}
                    className="w-full btn-real-estate bg-blue-600 hover:bg-blue-700"
                  >
                    {loadingButtons.realestate ? (
                      <>
                        <ButtonSpinner size={16} />
                        <span className="ml-2">Protecting...</span>
                      </>
                    ) : (
                      "Commission Guard"
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Button Variations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Button className="btn-real-estate" variant="default">Primary</Button>
                  <Button className="btn-real-estate" variant="secondary">Secondary</Button>
                  <Button className="btn-real-estate" variant="outline">Outline</Button>
                  <Button className="btn-real-estate" variant="ghost">Ghost</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Implementation Notes</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-sm max-w-none">
            <ul className="space-y-2 text-gray-600">
              <li>All animations use CSS keyframes for smooth performance</li>
              <li>Real estate themed icons and micro-interactions enhance user engagement</li>
              <li>Skeleton loading states provide visual feedback during data fetching</li>
              <li>Floating background elements create depth and movement</li>
              <li>Button states include loading spinners and success animations</li>
              <li>Hover effects provide immediate visual feedback</li>
              <li>All animations are optimized for accessibility and performance</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}