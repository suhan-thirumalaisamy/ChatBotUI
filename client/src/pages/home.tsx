import { Chatbot } from "@/components/chatbot";
import { Card, CardContent } from "@/components/ui/card";
import { Rocket, Shield, Clock } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Main Content Area */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <header className="text-center mb-12">
            <h1 className="text-4xl font-semibold text-slate-800 mb-4">
              Welcome to Our Platform
            </h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Experience seamless communication with our AI assistant. Click the chat button in the bottom right corner to get started.
            </p>
          </header>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <Card className="bg-white shadow-sm border border-slate-200">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Rocket className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-medium text-slate-800 mb-2">Fast & Reliable</h3>
                <p className="text-slate-600">Get instant responses powered by advanced AI technology.</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white shadow-sm border border-slate-200">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="text-xl font-medium text-slate-800 mb-2">Secure</h3>
                <p className="text-slate-600">Your conversations are encrypted and private.</p>
              </CardContent>
            </Card>
            
            <Card className="bg-white shadow-sm border border-slate-200 md:col-span-2 lg:col-span-1">
              <CardContent className="p-6">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-medium text-slate-800 mb-2">24/7 Available</h3>
                <p className="text-slate-600">Our AI assistant is always ready to help.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Chatbot Component */}
      <Chatbot />
    </div>
  );
}
