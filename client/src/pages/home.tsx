import { Chatbot } from "@/components/chatbot";
import { UserMenu } from "@/components/UserMenu";
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const handleCallClick = () => {
    // Open dialer with the specified number
    window.open('tel:91234567890', '_self');
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: "#f8d7da" }}>
      {/* Header with Navigation */}
      <header className="border-b" style={{ borderColor: "#e8b4b8" }}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <img src="https://s3-eu-west-2.amazonaws.com/react-app-prod-distbucket-2pgqtbzo1c75/img/Rebel_Energy_Logo.svg" alt="logo" />
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a
                href="#"
                className=" hover:text-gray-600 border-b-2"
                style={{ borderColor: "#ff3c5a" }}
              >
                Chat
              </a>
              <a href="#" className=" hover:text-gray-600">
                FAQ
              </a>
              <a href="#" className=" hover:text-gray-600">
                Help
              </a>
              <Button
                onClick={handleCallClick}
                variant="ghost"
                size="icon"
                className="text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                title="Call Support: 91234567890"
              >
                <Phone className="h-5 w-5" />
              </Button>
              <UserMenu />
            </nav>

            {/* Mobile Menu */}
            <div className="md:hidden flex items-center space-x-2">
              <Button
                onClick={handleCallClick}
                variant="ghost"
                size="icon"
                className="text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                title="Call Support: 91234567890"
              >
                <Phone className="h-5 w-5" />
              </Button>
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-4xl mx-auto">
          {/* Welcome Message */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4" style={{ color: "#ff3c5a" }}>
              Rebel Energy Support Chat
            </h1>
            <p className="text-lg text-gray-700 mb-6">
              Get instant help with your energy account, billing questions, and service requests.
            </p>
            <div className="bg-white rounded-lg shadow-sm border p-6 mb-8" style={{ borderColor: '#e8b4b8' }}>
              <h2 className="text-xl font-medium mb-4 text-center">How Can We Help You Today?</h2>
              <div className="grid md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#ff3c5a' }}></div>
                    <span>Account management and billing</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#ff3c5a' }}></div>
                    <span>Service requests and connections</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#ff3c5a' }}></div>
                    <span>Payment plans and options</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#ff3c5a' }}></div>
                    <span>Energy efficiency tips</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#ff3c5a' }}></div>
                    <span>Meter readings and installations</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: '#ff3c5a' }}></div>
                    <span>Emergency support and outages</span>
                  </div>
                </div>
              </div>
              <div className="mt-6 p-4 rounded-lg text-center" style={{ backgroundColor: '#fce8ea' }}>
                <p className="text-sm" style={{ color: '#ff3c5a' }}>
                  <strong>Available 24/7:</strong> Click the chat icon below to start a conversation
                </p>
              </div>
            </div>
            
            {/* Chat Instruction */}
            <div className="flex items-center justify-center space-x-2 text-gray-600">
              <span>Click the chat icon to get started</span>
              <div className="animate-bounce">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t mt-auto" style={{ borderColor: "#e8b4b8" }}>
        <div className="container mx-auto px-4 py-8">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Brand */}
            <div>
              <div className="flex items-center mb-4">
                <img src="https://s3-eu-west-2.amazonaws.com/react-app-prod-distbucket-2pgqtbzo1c75/img/Rebel_Energy_Logo.svg" alt="logo" />
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Rebel Energy is a company registered in England and Wales (No 10952085)
              </p>
              <div className="text-sm font-medium mb-2" style={{ color: "#ff3c5a" }}>
                Contact Support
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Phone className="h-4 w-4" />
                <span>91234567890</span>
              </div>
            </div>

            {/* Quick Actions */}
            <div>
              <h3 className="font-medium mb-4" style={{ color: "#ff3c5a" }}>
                Quick Actions
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <a href="#" className="hover:text-gray-800">
                    Start Chat
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-800">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-800">
                    Help Center
                  </a>
                </li>
                <li>
                  <button 
                    onClick={handleCallClick}
                    className="hover:text-gray-800 text-left"
                  >
                    Call Support
                  </button>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-medium mb-4" style={{ color: "#ff3c5a" }}>
                Legal
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <a href="#" className="hover:text-gray-800">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-800">
                    Terms and Conditions
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-800">
                    Complaints
                  </a>
                </li>
              </ul>
            </div>

            {/* Support Hours */}
            <div>
              <h3 className="font-medium mb-4" style={{ color: "#ff3c5a" }}>
                Support Hours
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Chat: 24/7 Available</li>
                <li>Phone: Mon-Fri 9AM-6PM</li>
                <li>Emergency: 24/7</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t text-center" style={{ borderColor: "#e8b4b8" }}>
            <p className="text-xs text-gray-600">
              Licensed insolvency practitioners of Teneo Financial Advisory Limited are licensed in the UK.
            </p>
          </div>
        </div>
      </footer>

      {/* Chatbot Component - This maintains all existing functionality */}
      <Chatbot />
    </div>
  );
}