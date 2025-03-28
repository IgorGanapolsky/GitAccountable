import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Download } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

export default function InstallPWA() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isPlatformSupported, setIsPlatformSupported] = useState(true);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Check if it's iOS
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(userAgent);
    const isSafari = /safari/.test(userAgent);
    
    setIsIOS(isIOSDevice);

    // iOS devices need special instructions
    if (isIOSDevice) {
      // Check if the app is already in standalone mode
      const isStandalone = 
        'standalone' in window.navigator && 
        (window.navigator as any).standalone === true;
      
      setIsPlatformSupported(isSafari && !isStandalone); // Only Safari can install PWAs on iOS
    }

    // Save the install prompt for later use
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Handle the install button click
  const handleInstallClick = async () => {
    if (!installPrompt) return;
    
    try {
      // Show the browser's install prompt
      await installPrompt.prompt();
      
      // Wait for the user's choice
      const choiceResult = await installPrompt.userChoice;
      
      // Reset the install prompt state
      setInstallPrompt(null);
      setIsOpen(false);
      
      // Log the result
      console.log(`User ${choiceResult.outcome} the installation`);
    } catch (error) {
      console.error('Error while installing the PWA:', error);
    }
  };

  // Don't show the component if:
  // 1. The app is already installed
  // 2. The platform doesn't support installation
  // 3. We don't have an install prompt (for non-iOS devices)
  if (window.matchMedia('(display-mode: standalone)').matches || 
      (!isPlatformSupported) || 
      (!installPrompt && !isIOS)) {
    return null;
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="fixed bottom-4 right-4 flex items-center gap-2 shadow-lg z-50 bg-primary text-white hover:bg-primary/90"
        >
          <Download size={16} />
          Install App
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Install GitAccountable</SheetTitle>
          <SheetDescription>
            Install our app for a better experience
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-6">
          {isIOS ? (
            <>
              <p className="text-sm text-muted-foreground">
                To install this app on your iOS device:
              </p>
              <ol className="list-decimal ml-5 space-y-2 text-sm">
                <li>Tap the Share button in Safari</li>
                <li>Scroll down and tap "Add to Home Screen"</li>
                <li>Tap "Add" in the top right corner</li>
              </ol>
              <div className="pt-4">
                <Button 
                  className="w-full"
                  onClick={() => setIsOpen(false)}
                >
                  Got it
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Install GitAccountable to your device for quick access, even when offline.
              </p>
              <div className="flex flex-col gap-2 pt-4">
                <Button 
                  className="w-full"
                  onClick={handleInstallClick}
                >
                  Install Now
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => setIsOpen(false)}
                >
                  Maybe Later
                </Button>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}