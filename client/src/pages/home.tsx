import { useState } from "react";
import { Chatbot } from "@/components/chatbot";
import { AuthModal } from "@/components/auth-modal";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { Zap, Droplets, Flame, HelpCircle, Phone, Clock, User, LogOut } from "lucide-react";

export default function Home() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user, isAuthenticated, signOut, isLoading } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header with Authentication */}
      <header className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Zap className="h-6 w-6 text-blue-600" />
              <span className="text-lg font-semibold text-slate-800">Utility Support</span>
            </div>
            
            <div className="flex items-center space-x-4">
              {isAuthenticated && user ? (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-slate-600" />
                    <span className="text-sm text-slate-700">Welcome, {user.name || user.email}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    disabled={isLoading}
                    className="text-slate-600 hover:text-slate-800"
                  >
                    <LogOut className="h-4 w-4 mr-1" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setIsAuthModalOpen(true)}
                  disabled={isLoading}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <User className="h-4 w-4 mr-1" />
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-12">
            <h1 className="text-4xl font-semibold text-slate-800 mb-4">
              Utility Customer Support Bot
            </h1>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto leading-relaxed">
              Get instant help with your utility services. Our AI-powered support bot can assist you with electricity, gas, water, and waste management inquiries 24/7. Click the chat button in the bottom right corner to get started.
            </p>
          </header>
          
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8 mb-12">
            <h2 className="text-2xl font-medium text-slate-800 mb-6 text-center">How Can We Help You Today?</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <Zap className="h-4 w-4 text-yellow-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-800">Electricity Services</h3>
                    <p className="text-slate-600 text-sm">Power outages, billing questions, meter readings, energy efficiency tips</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <Flame className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-800">Gas Services</h3>
                    <p className="text-slate-600 text-sm">Gas leaks, service connections, billing support, safety information</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <Droplets className="h-4 w-4 text-cyan-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-800">Water & Sewer</h3>
                    <p className="text-slate-600 text-sm">Water quality, service interruptions, leak reporting, conservation tips</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <HelpCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-800">Account Management</h3>
                    <p className="text-slate-600 text-sm">Bill payments, service transfers, account setup, payment plans</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <Phone className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-800">Emergency Services</h3>
                    <p className="text-slate-600 text-sm">Report outages, gas leaks, water main breaks, and other urgent issues</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <Clock className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-medium text-slate-800">Service Requests</h3>
                    <p className="text-slate-600 text-sm">New connections, disconnections, meter installations, service upgrades</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-800 text-sm text-center">
                <strong>Available 24/7:</strong> Get instant answers to your utility questions anytime, day or night.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Chatbot Component */}
      <Chatbot />

      {/* Authentication Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </div>
  );
}
