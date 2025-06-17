import React from 'react';
import { Home, Key, MapPin, DollarSign, Users, FileText, Calendar, Shield } from 'lucide-react';

// House building animation
export const HouseLoadingAnimation = ({ size = 40, message = "Building your dashboard..." }) => (
  <div className="flex flex-col items-center justify-center space-y-4">
    <div className="relative">
      <div className="house-animation" style={{ width: size, height: size }}>
        <Home className="w-full h-full text-blue-600 animate-pulse" />
        <div className="absolute inset-0 animate-ping">
          <Home className="w-full h-full text-blue-400 opacity-30" />
        </div>
      </div>
    </div>
    <p className="text-sm text-gray-600 animate-pulse">{message}</p>
  </div>
);

// Key turning animation
export const KeyLoadingAnimation = ({ size = 40, message = "Unlocking your data..." }) => (
  <div className="flex flex-col items-center justify-center space-y-4">
    <div className="relative">
      <div className="key-animation" style={{ width: size, height: size }}>
        <Key className="w-full h-full text-yellow-600 transform transition-transform duration-1000 animate-spin" />
      </div>
    </div>
    <p className="text-sm text-gray-600 animate-pulse">{message}</p>
  </div>
);

// Property search animation
export const PropertySearchAnimation = ({ size = 40, message = "Searching properties..." }) => (
  <div className="flex flex-col items-center justify-center space-y-4">
    <div className="relative">
      <div className="search-animation flex space-x-2">
        <MapPin className="w-8 h-8 text-red-500 animate-bounce" style={{ animationDelay: '0ms' }} />
        <MapPin className="w-8 h-8 text-blue-500 animate-bounce" style={{ animationDelay: '150ms' }} />
        <MapPin className="w-8 h-8 text-green-500 animate-bounce" style={{ animationDelay: '300ms' }} />
      </div>
    </div>
    <p className="text-sm text-gray-600 animate-pulse">{message}</p>
  </div>
);

// Commission protection animation
export const CommissionProtectionAnimation = ({ size = 40, message = "Protecting your commission..." }) => (
  <div className="flex flex-col items-center justify-center space-y-4">
    <div className="relative">
      <div className="protection-animation" style={{ width: size, height: size }}>
        <Shield className="w-full h-full text-green-600 animate-pulse" />
        <div className="absolute inset-0 rounded-full border-2 border-green-400 animate-ping opacity-75"></div>
      </div>
    </div>
    <p className="text-sm text-gray-600 animate-pulse">{message}</p>
  </div>
);

// Client management animation
export const ClientLoadingAnimation = ({ size = 40, message = "Loading clients..." }) => (
  <div className="flex flex-col items-center justify-center space-y-4">
    <div className="relative">
      <div className="client-animation flex space-x-1">
        <Users className="w-8 h-8 text-purple-500 animate-pulse" style={{ animationDelay: '0ms' }} />
        <div className="flex flex-col space-y-1">
          <div className="w-8 h-1 bg-purple-300 rounded animate-pulse" style={{ animationDelay: '200ms' }}></div>
          <div className="w-6 h-1 bg-purple-200 rounded animate-pulse" style={{ animationDelay: '400ms' }}></div>
        </div>
      </div>
    </div>
    <p className="text-sm text-gray-600 animate-pulse">{message}</p>
  </div>
);

// Contract processing animation
export const ContractLoadingAnimation = ({ size = 40, message = "Processing contracts..." }) => (
  <div className="flex flex-col items-center justify-center space-y-4">
    <div className="relative">
      <div className="contract-animation" style={{ width: size, height: size }}>
        <FileText className="w-full h-full text-indigo-600 transform transition-transform duration-500 animate-pulse" />
        <div className="absolute top-2 left-2 w-2 h-2 bg-green-500 rounded-full animate-ping"></div>
      </div>
    </div>
    <p className="text-sm text-gray-600 animate-pulse">{message}</p>
  </div>
);

// Money/Commission animation
export const MoneyLoadingAnimation = ({ size = 40, message = "Calculating commissions..." }) => (
  <div className="flex flex-col items-center justify-center space-y-4">
    <div className="relative">
      <div className="money-animation flex items-center space-x-1">
        <DollarSign className="w-8 h-8 text-green-600 animate-bounce" />
        <div className="flex space-x-1">
          <div className="w-1 h-6 bg-green-400 rounded animate-pulse" style={{ animationDelay: '100ms' }}></div>
          <div className="w-1 h-8 bg-green-500 rounded animate-pulse" style={{ animationDelay: '200ms' }}></div>
          <div className="w-1 h-4 bg-green-300 rounded animate-pulse" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
    <p className="text-sm text-gray-600 animate-pulse">{message}</p>
  </div>
);

// Calendar/Showing animation
export const ShowingLoadingAnimation = ({ size = 40, message = "Loading showings..." }) => (
  <div className="flex flex-col items-center justify-center space-y-4">
    <div className="relative">
      <div className="showing-animation" style={{ width: size, height: size }}>
        <Calendar className="w-full h-full text-blue-600 animate-pulse" />
        <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
      </div>
    </div>
    <p className="text-sm text-gray-600 animate-pulse">{message}</p>
  </div>
);

// Skeleton loaders for different content types
export const PropertyCardSkeleton = () => (
  <div className="border rounded-lg p-4 space-y-3 animate-pulse">
    <div className="flex items-center space-x-2">
      <div className="w-8 h-8 bg-gray-200 rounded"></div>
      <div className="w-32 h-4 bg-gray-200 rounded"></div>
    </div>
    <div className="w-full h-3 bg-gray-200 rounded"></div>
    <div className="w-3/4 h-3 bg-gray-200 rounded"></div>
    <div className="flex justify-between">
      <div className="w-16 h-3 bg-gray-200 rounded"></div>
      <div className="w-20 h-3 bg-gray-200 rounded"></div>
    </div>
  </div>
);

export const ClientCardSkeleton = () => (
  <div className="border rounded-lg p-4 space-y-3 animate-pulse">
    <div className="flex items-center space-x-3">
      <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
      <div className="space-y-2">
        <div className="w-24 h-4 bg-gray-200 rounded"></div>
        <div className="w-32 h-3 bg-gray-200 rounded"></div>
      </div>
    </div>
    <div className="space-y-2">
      <div className="w-full h-3 bg-gray-200 rounded"></div>
      <div className="w-2/3 h-3 bg-gray-200 rounded"></div>
    </div>
  </div>
);

export const ContractCardSkeleton = () => (
  <div className="border rounded-lg p-4 space-y-3 animate-pulse">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <div className="w-6 h-6 bg-gray-200 rounded"></div>
        <div className="w-28 h-4 bg-gray-200 rounded"></div>
      </div>
      <div className="w-16 h-6 bg-gray-200 rounded-full"></div>
    </div>
    <div className="space-y-2">
      <div className="w-full h-3 bg-gray-200 rounded"></div>
      <div className="w-1/2 h-3 bg-gray-200 rounded"></div>
    </div>
    <div className="flex justify-between">
      <div className="w-20 h-3 bg-gray-200 rounded"></div>
      <div className="w-24 h-3 bg-gray-200 rounded"></div>
    </div>
  </div>
);

// Floating action animations
export const FloatingHouse = ({ className = "" }) => (
  <div className={`floating-house ${className}`}>
    <Home className="w-6 h-6 text-blue-500 animate-bounce" style={{ animationDuration: '2s' }} />
  </div>
);

export const FloatingKey = ({ className = "" }) => (
  <div className={`floating-key ${className}`}>
    <Key className="w-5 h-5 text-yellow-500 animate-pulse transform rotate-12" />
  </div>
);

export const FloatingDollar = ({ className = "" }) => (
  <div className={`floating-dollar ${className}`}>
    <DollarSign className="w-5 h-5 text-green-500 animate-bounce" style={{ animationDelay: '0.5s' }} />
  </div>
);

// Page transition loading
export const PageTransitionLoading = ({ message = "Loading..." }) => (
  <div className="fixed inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
    <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm mx-4">
      <div className="flex flex-col items-center space-y-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <Home className="w-8 h-8 text-blue-600 animate-pulse" />
          </div>
        </div>
        <div className="text-center space-y-2">
          <h3 className="text-lg font-medium text-gray-900">Commission Guard</h3>
          <p className="text-sm text-gray-600">{message}</p>
        </div>
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  </div>
);

// Button loading states
export const ButtonSpinner = ({ size = 16 }) => (
  <div className="animate-spin" style={{ width: size, height: size }}>
    <div className="w-full h-full border-2 border-white border-t-transparent rounded-full"></div>
  </div>
);

// Success animations
export const SuccessAnimation = ({ message = "Success!" }) => (
  <div className="flex flex-col items-center justify-center space-y-4">
    <div className="relative">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
        <div className="w-8 h-8 bg-green-500 rounded-full animate-ping"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>
    </div>
    <p className="text-sm text-green-600 font-medium">{message}</p>
  </div>
);