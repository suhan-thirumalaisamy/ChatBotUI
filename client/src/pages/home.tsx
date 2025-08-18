import { UserMenu } from "@/components/UserMenu";
import { Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MainChat } from "@/components/MainChat";

export default function Home() {
  const handleCallClick = () => {
    // Open dialer with the specified number
    window.open('tel:+18334263905', '_self');
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header with Navigation */}
      <header className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <img 
                // src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAAP1BMVEVHcEz/Clv/C1z/AFr/AFv/BFv/JGj/Blv/BFr/AVf/AFX/AE3/S3v/wM3/mLD/b5L+//7+2+H/Y4r/MW3/AFrLm4l5AAAAFXRSTlMATJXI/+oTpo0i/////////////8OBOylAAAAA/klEQVR4AWySAQJAIAxFkx+sAO5/VkvVBg/Aq22LUTS2BeBa25gfuh6KvjMvBrywz+EOH5yaZMQvYx0PgLz3RP6GkClzOIDCNE1zPPFlKYqT/GhZ13Xb18ziVaYdtFAMkiC9CGFjkpGn6FmACP5mjsKep+D+auG+9XGSOQuNsW8BLEgS1rRaoIhfmSMLrXFKoMAsm0wWWwH8lLmh8itsB4ngPkIkUA1xvquId5LD+S0zNaoIw7tRkbtMlEaZb6P0asliiaBb3ctyK2GS+84w9iXQXns91F8OYWZyXB/vFyq/XAnCIEP5obtGKNkTnXHALsXIeqRkXkT2F2HFyP4Au4kbEfvki2cAAAAASUVORK5CYII=" 
                src="https://s3-eu-west-2.amazonaws.com/react-app-prod-distbucket-2pgqtbzo1c75/img/Rebel_Energy_Logo.svg"
                alt="Rebel Energy" 
                className="h-16 w-16"
              />
              {/* <span className="ml-2 text-xl font-semibold" style={{ color: "#ff3c5a" }}>
                Rebel Energy Chat
              </span> */}
            </div>

            {/* Navigation */}
            <div className="flex items-center space-x-4">
              <Button
                onClick={handleCallClick}
                variant="ghost"
                size="icon"
                className="text-gray-700 hover:text-gray-900 hover:bg-gray-100"
                title="Call Support: +18334263905"
              >
                <Phone className="h-5 w-5" />
              </Button>
              <UserMenu />
            </div>
          </div>
        </div>
      </header>

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col">
        <MainChat />
      </div>
    </div>
  );
}