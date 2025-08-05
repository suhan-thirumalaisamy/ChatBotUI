import { Chatbot } from "@/components/chatbot";
import { UserMenu } from "@/components/UserMenu";
// import { Zap, Droplets, Flame, HelpCircle, Phone, Clock } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#f8d7da" }}>
      {/* Header with Navigation */}
      <header className="border-b" style={{ borderColor: "#e8b4b8" }}>
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <div className="text-3xl font-bold" style={{ color: "#ff3c5a" }}>
                Rebel
              </div>
              <div className="ml-1 text-sm" style={{ color: "#ff3c5a" }}>
                energy
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              <a
                href="#"
                className=" hover:text-gray-600 border-b-2"
                style={{ borderColor: "#ff3c5a" }}
              >
                Home
              </a>
              <a href="#" className=" hover:text-gray-600">
                Mission
              </a>
              <a href="#" className=" hover:text-gray-600">
                Energy
              </a>
              <a href="#" className=" hover:text-gray-600">
                Restoration
              </a>
              <a href="#" className=" hover:text-gray-600">
                Views
              </a>
              <a href="#" className=" hover:text-gray-600">
                FAQ
              </a>
              <a href="#" className=" hover:text-gray-600">
                Help
              </a>
              <button className="bg-black text-white px-4 py-2 text-sm font-medium">
                LOGIN
              </button>
            </nav>

            {/* Mobile Menu */}
            <div className="md:hidden">
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Pay Button */}
          <div className="text-center mb-8">
            <button
              className="border-2 px-8 py-4 text-xl font-medium hover:opacity-80 transition-opacity"
              style={{
                borderColor: "#ff3c5a",
                color: "#ff3c5a",
                backgroundColor: "transparent",
              }}
            >
              CLICK HERE TO PAY
            </button>
          </div>

          {/* Main Messages */}
          <div className="text-center mb-12 space-y-6">
            <p className="text-lg max-w-3xl mx-auto leading-relaxed">
              Rebel Energy is ceasing to trade. Ofgem, the energy regulator, is
              appointing a new supplier for our customers.
            </p>

            <p className="text-lg max-w-3xl mx-auto leading-relaxed">
              Rebel Energy have appointed Teneo as Administrator – please see
              the letter of authority{" "}
              <a href="#" className="underline" style={{ color: "#ff3c5a" }}>
                here
              </a>
            </p>

            <p className="text-lg max-w-3xl mx-auto leading-relaxed">
              In relation to outstanding payments to Rebel, click{" "}
              <a href="#" className="underline" style={{ color: "#ff3c5a" }}>
                here
              </a>{" "}
              for information on our final billing processes.
            </p>

            <p className="text-lg max-w-3xl mx-auto leading-relaxed">
              Customers need not worry; your supplies are secure and funds that
              domestic customers have paid into your accounts will be protected
              if you are in credit.
            </p>
            <p className="text-lg max-w-3xl mx-auto leading-relaxed">
              Ofgem’s advice is not to switch, but to wait until they appoint a
              new supplier for you. This will help make sure that the process of
              handing customers over to a new supplier, and honouring domestic
              customers’ credit balances, is as hassle free as possible.
            </p>
            <p className="text-lg max-w-3xl mx-auto leading-relaxed">
              Support and advice is available on the Ofgem website for both
              domestic customers and non-domestic customers. Alternatively, if
              customers need additional support in England and Wales, they can
              call Citizens Advice on 0808 223 1133 or email them via their
              webform. In Scotland, they can contact Advice Direct Scotland on
              0808 196 8660 or email them via their webform.
            </p>
            <p className="text-lg max-w-3xl mx-auto leading-relaxed">
              Advice will also be shared on Ofgem’s twitter @ofgem and facebook
              channels.
            </p>
            <p className="text-lg max-w-3xl mx-auto leading-relaxed">
              For all journalist queries about the supplier of last resort
              process, please contact Ofgem's media team at press@ofgem.gov.uk.
              For any customer enquiries, please email help@rebelenergy.com
            </p>
            <p className="text-lg max-w-3xl mx-auto leading-relaxed">
              Matthew James Cowlishaw and Paul James Meadows were appointed
              Joint Administrators of Rebel Energy Group Limited, Rebel Energy
              Supply Limited and Rebel Energy Labs Limited (together “the
              Companies”) on 8 April 2025. The affairs, business and property of
              Rebel Energy Group Limited, Rebel Energy Supply Limited and Rebel
              Energy Labs Limited are managed by the Joint Administrators. The
              Joint Administrators act as agents of the Companies and contract
              without personal liability. The Joint Administrators are
              authorised by the Institute of Chartered Accountants in England
              and Wales. All licensed insolvency practitioners of Teneo
              Financial Advisory Limited are licensed in the UK.
            </p>
          </div>

          {/* Support Services Section */}
          {/* <div className="bg-white rounded-lg shadow-sm border p-8 mb-12" style={{ borderColor: '#e8b4b8' }}>
            <h2 className="text-2xl font-medium  mb-6 text-center">How Can We Help You Today?</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-1" style={{ backgroundColor: '#fce8ea' }}>
                    <Zap className="h-4 w-4" style={{ color: '#ff3c5a' }} />
                  </div>
                  <div>
                    <h3 className="font-medium ">Electricity Services</h3>
                    <p className="text-gray-600 text-sm">Power outages, billing questions, meter readings, energy efficiency tips</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-1" style={{ backgroundColor: '#fce8ea' }}>
                    <Flame className="h-4 w-4" style={{ color: '#ff3c5a' }} />
                  </div>
                  <div>
                    <h3 className="font-medium ">Gas Services</h3>
                    <p className="text-gray-600 text-sm">Gas leaks, service connections, billing support, safety information</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-1" style={{ backgroundColor: '#fce8ea' }}>
                    <Droplets className="h-4 w-4" style={{ color: '#ff3c5a' }} />
                  </div>
                  <div>
                    <h3 className="font-medium ">Water & Sewer</h3>
                    <p className="text-gray-600 text-sm">Water quality, service interruptions, leak reporting, conservation tips</p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-1" style={{ backgroundColor: '#fce8ea' }}>
                    <HelpCircle className="h-4 w-4" style={{ color: '#ff3c5a' }} />
                  </div>
                  <div>
                    <h3 className="font-medium ">Account Management</h3>
                    <p className="text-gray-600 text-sm">Bill payments, service transfers, account setup, payment plans</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-1" style={{ backgroundColor: '#fce8ea' }}>
                    <Phone className="h-4 w-4" style={{ color: '#ff3c5a' }} />
                  </div>
                  <div>
                    <h3 className="font-medium ">Emergency Services</h3>
                    <p className="text-gray-600 text-sm">Report outages, gas leaks, water main breaks, and other urgent issues</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 mt-1" style={{ backgroundColor: '#fce8ea' }}>
                    <Clock className="h-4 w-4" style={{ color: '#ff3c5a' }} />
                  </div>
                  <div>
                    <h3 className="font-medium ">Service Requests</h3>
                    <p className="text-gray-600 text-sm">New connections, disconnections, meter installations, service upgrades</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 p-4 rounded-lg" style={{ backgroundColor: '#fce8ea' }}>
              <p className="text-sm text-center" style={{ color: '#ff3c5a' }}>
                <strong>Available 24/7:</strong> Get instant answers to your utility questions anytime, day or night.
              </p>
            </div>
          </div> */}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t mt-16" style={{ borderColor: "#e8b4b8" }}>
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Brand */}
            <div>
              <div className="flex items-center mb-4">
                <div
                  className="text-2xl font-bold"
                  style={{ color: "#ff3c5a" }}
                >
                  Rebel
                </div>
                <div className="ml-1 text-sm" style={{ color: "#ff3c5a" }}>
                  energy
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-4">
                Rebel Energy is a company registered in England and Wales (No
                10952085)
              </p>
              <div
                className="text-sm font-medium mb-2"
                style={{ color: "#ff3c5a" }}
              >
                Social
              </div>
              <div className="flex space-x-3">
                <a href="#" className="text-gray-600 hover:">
                  📷
                </a>
                <a href="#" className="text-gray-600 hover:">
                  𝕏
                </a>
                <a href="#" className="text-gray-600 hover:">
                  f
                </a>
                <a href="#" className="text-gray-600 hover:">
                  in
                </a>
              </div>
            </div>

            {/* About Rebel */}
            <div>
              <h3 className="font-medium mb-4" style={{ color: "#ff3c5a" }}>
                About Rebel
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <a href="#" className="hover:">
                    Home
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:">
                    Mission
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:">
                    Energy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:">
                    Restoration
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:">
                    Views
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:">
                    FAQ
                  </a>
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
                  <a href="#" className="hover:">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:">
                    Terms and Conditions
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:">
                    Complaints
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:">
                    Reports and Policies
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:">
                    Smart Export Guarantee
                  </a>
                </li>
              </ul>
            </div>

            {/* Rebel Actions */}
            <div>
              <h3 className="font-medium mb-4" style={{ color: "#ff3c5a" }}>
                Rebel Actions
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>
                  <a href="#" className="hover:">
                    Moving Out
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:">
                    Make a Payment
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:">
                    Setup Direct Debit
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:">
                    Submit a Reading
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div
            className="mt-8 pt-8 border-t text-center"
            style={{ borderColor: "#e8b4b8" }}
          >
            <p className="text-xs text-gray-600">
              licensed insolvency practitioners of Teneo Financial Advisory
              Limited are licensed in the UK.
            </p>
          </div>
        </div>
      </footer>

      {/* Chatbot Component */}
      <Chatbot />
    </div>
  );
}
