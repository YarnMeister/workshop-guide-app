import { useState, useEffect, useRef } from 'react';
import { Copy, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface CredentialsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  anchorRef?: React.RefObject<HTMLElement>;
}

export const CredentialsPanel = ({ isOpen, onClose, anchorRef }: CredentialsPanelProps) => {
  const [username, setUsername] = useState<string | null>(null);
  const [password, setPassword] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<'username' | 'password' | null>(null);
  const [panelPosition, setPanelPosition] = useState({ left: 0 });
  const { toast } = useToast();
  const panelRef = useRef<HTMLDivElement>(null);

  // Calculate panel position based on anchor element
  useEffect(() => {
    if (isOpen && anchorRef?.current) {
      const anchorRect = anchorRef.current.getBoundingClientRect();
      const padding = 24; // padding from viewport edge
      
      // Align left edge of panel with left edge of anchor button
      const left = anchorRect.left;
      
      setPanelPosition({ left: Math.max(padding, left) });
    }
  }, [isOpen, anchorRef]);

  // Fetch credentials when panel opens
  useEffect(() => {
    if (isOpen) {
      fetchCredentials();
    } else {
      // Reset state when closed
      setUsername(null);
      setPassword(null);
      setCopiedField(null);
    }
  }, [isOpen]);

  // Handle Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isOpen && panelRef.current && !panelRef.current.contains(e.target as Node)) {
        // Don't close if clicking on the anchor button
        if (anchorRef?.current && anchorRef.current.contains(e.target as Node)) {
          return;
        }
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen, onClose, anchorRef]);

  const fetchCredentials = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/participant/credentials');
      if (!response.ok) {
        throw new Error('Failed to fetch credentials');
      }
      const data = await response.json();
      setUsername(data.username);
      setPassword(data.password);
    } catch (error) {
      console.error('Failed to fetch credentials:', error);
      toast({
        title: 'Error',
        description: 'Failed to load credentials',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string, field: 'username' | 'password') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      toast({
        title: 'Copied!',
        description: `${field === 'username' ? 'Username' : 'Password'} copied to clipboard`,
      });
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      toast({
        title: 'Copy failed',
        description: 'Could not copy to clipboard',
        variant: 'destructive',
      });
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 z-40 transition-opacity"
        onClick={onClose}
      />
      
      {/* Panel */}
      <div
        ref={panelRef}
        className={`fixed top-16 z-50 bg-card border rounded-lg shadow-lg transition-all duration-300 ease-out ${
          isOpen ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0 pointer-events-none'
        }`}
        style={{ 
          minWidth: '300px', 
          maxWidth: '400px',
          left: `${panelPosition.left}px`
        }}
      >
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-lg">WiFi Credentials</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          {isLoading ? (
            <div className="text-sm text-muted-foreground">Loading...</div>
          ) : (
            <div className="space-y-4">
              {/* Username */}
              <div>
                <label className="text-sm font-medium mb-2 block">Username</label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 rounded-md bg-muted p-3 text-sm">
                    {username || 'Not available'}
                  </div>
                  {username && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(username, 'username')}
                      className="h-8 w-8 p-0 shrink-0"
                    >
                      {copiedField === 'username' ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="text-sm font-medium mb-2 block">Password</label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 rounded-md bg-muted p-3 text-sm">
                    {password || 'Not available'}
                  </div>
                  {password && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(password, 'password')}
                      className="h-8 w-8 p-0 shrink-0"
                    >
                      {copiedField === 'password' ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

