export default function AnimatedBackground() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Floating geometric shapes */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full animate-float"></div>
      <div className="absolute top-40 right-20 w-16 h-16 bg-gradient-to-br from-yellow-400/10 to-orange-400/10 rounded-lg rotate-45 animate-float-delayed"></div>
      <div className="absolute bottom-32 left-1/4 w-12 h-12 bg-gradient-to-br from-green-400/10 to-blue-400/10 rounded-full animate-bounce-slow"></div>
      <div className="absolute top-1/2 right-1/3 w-8 h-8 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full animate-ping-slow"></div>
      <div className="absolute bottom-20 right-10 w-24 h-24 bg-gradient-to-br from-indigo-400/10 to-blue-400/10 rounded-lg animate-float"></div>
      
      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
    </div>
  );
}