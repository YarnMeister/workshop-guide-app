import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Function to render text with clickable links
const renderTextWithLinks = (text: string) => {
  const parts: Array<{ type: 'text' | 'markdown-link' | 'url'; content: string; url?: string }> = [];
  
  // First, extract markdown links [text](url)
  const markdownLinkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let lastIndex = 0;
  let match;
  
  while ((match = markdownLinkRegex.exec(text)) !== null) {
    // Add text before the link
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: text.substring(lastIndex, match.index) });
    }
    // Add the link
    parts.push({ type: 'markdown-link', content: match[1], url: match[2] });
    lastIndex = markdownLinkRegex.lastIndex;
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    parts.push({ type: 'text', content: text.substring(lastIndex) });
  }
  
  // If no markdown links found, treat entire text as text
  if (parts.length === 0) {
    parts.push({ type: 'text', content: text });
  }
  
  // Now process each part for plain URLs
  const result: React.ReactNode[] = [];
  
  parts.forEach((part, partIndex) => {
    if (part.type === 'markdown-link') {
      // Render markdown link
      result.push(
        <a
          key={`link-${partIndex}`}
          href={part.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-800 underline cursor-pointer"
          onClick={(e) => {
            e.preventDefault();
            window.open(part.url, '_blank', 'noopener,noreferrer');
          }}
        >
          {part.content}
        </a>
      );
    } else {
      // Process text for plain URLs
      const urlRegex = /(https?:\/\/[^\s]+)/g;
      const textParts = part.content.split(urlRegex);
      
      textParts.forEach((textPart, textIndex) => {
        if (urlRegex.test(textPart)) {
          result.push(
            <a
              key={`url-${partIndex}-${textIndex}`}
              href={textPart}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline cursor-pointer"
              onClick={(e) => {
                e.preventDefault();
                window.open(textPart, '_blank', 'noopener,noreferrer');
              }}
            >
              {textPart}
            </a>
          );
        } else if (textPart) {
          result.push(textPart);
        }
      });
    }
  });
  
  return result;
};

interface Subsection {
  title?: string;
  description?: string;
  commands?: string[];
  codeBlock?: string;
  screenshot?: string;
  subsections?: Subsection[];
}

interface ExtendOption {
  title: string;
  heading?: string;
  content?: string;
  subsections?: Subsection[];
}

const EXTEND_OPTIONS: Record<string, ExtendOption> = {
  "integrate-api": {
    title: "Integrate real data using an API",
    content: "Detailed instructions for integrating real data using an API will be added here."
  },
  "add-ai-assistant": {
    title: "Add an AI Assistant in your app workflow",
    content: "Detailed instructions for adding an AI Assistant to your app workflow will be added here."
  },
  "add-database": {
    title: "Provisioning a Database in Vercel",
    heading: "Provisioning a Database in Vercel",
    subsections: [
      {
        title: "Watch this video",
        description: `Here is a short video with step by step instructions for adding a Database to your project: https://share.synthesia.io/223238ea-0728-4878-9ced-433c28170244`
      },
      {
        title: "Integrating the Database with your app",
        description: `Once you've followed the steps in the video, you'll need to add a variable called "DATABASE_URL" in a file called ".env.local" in the root of your project. To do this you can ask in the AI chat window:`,
        subsections: [
          {
            title: "In AI Chat Window",
            description: `Type this command in the AI chat window in Void Editor:`,
            commands: [
              "Help me create a new .env.local file with a placeholder for DATABASE_URL= so that I can paste the connection string"
            ]
          }
        ]
      },
      {
        title: "Next step",
        description: `Next paste the secret string for your database into the new file.`,
        screenshot: "env-local.png",
        subsections: [
          {
            title: "",
            description: `You can retrieve the string in Setting -> Environment Variables:`,
            screenshot: "vercel-settings.png"
          }
        ]
      },
      {
        title: "⚠️ Important",
        description: `Ensure you save the .env.local file, this is a common mistake - the AI assistant won't be able to access the connection string if you don't save the file`
      },
      {
        title: "Final step",
        description: `Once you are confident the DATABASE_URL is saved correctly, you can paste this into the AI chat window:`,
        subsections: [
          {
            title: "In AI Chat Window",
            description: `Type this command in the AI chat window in Void Editor:`,
            commands: [
              "The DATABASE_URL connection string is available in .env.local. Help me to convert all local storage variables used in the app to proper database persisted variable. Create schemas and migrations needed to save all app data"
            ]
          }
        ]
      }
    ]
  }
};

const ExtendOption = () => {
  const { optionId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [copiedCommands, setCopiedCommands] = useState<Set<string>>(new Set());
  
  const option = optionId ? EXTEND_OPTIONS[optionId as keyof typeof EXTEND_OPTIONS] : null;

  if (!option) {
    navigate("/onboarding/step/8");
    return null;
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedCommands(prev => new Set(prev).add(text));
      toast({
        title: "Copied!",
        description: "Command copied to clipboard",
      });
      // Reset the copied state after 2 seconds
      setTimeout(() => {
        setCopiedCommands(prev => {
          const newSet = new Set(prev);
          newSet.delete(text);
          return newSet;
        });
      }, 2000);
    } catch (err) {
      toast({
        title: "Copy failed",
        description: "Could not copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const CopyableCommand = ({ command }: { command: string }) => {
    const isCopied = copiedCommands.has(command);
    
    return (
      <div className="flex items-center justify-between rounded-md bg-muted p-3 text-sm">
        <code className="flex-1 font-mono">{command}</code>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => copyToClipboard(command)}
          className="ml-2 h-8 w-8 p-0"
        >
          {isCopied ? (
            <Check className="h-4 w-4 text-green-600" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Back button */}
      <div className="border-b bg-background px-6 py-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            window.scrollTo({ top: 0, behavior: 'instant' });
            navigate('/onboarding/step/8');
          }}
          className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">{option.heading || option.title}</h1>
          {option.content && (
            <p className="text-sm text-muted-foreground whitespace-pre-line">{renderTextWithLinks(option.content)}</p>
          )}
        </div>

        {option.subsections && option.subsections.length > 0 ? (
          <div className="space-y-6">
            {option.subsections.map((subsection, index) => {
              const isWarning = subsection.title?.includes('⚠️');
              return (
                <div key={index} className="rounded-lg border bg-card p-6">
                  {subsection.title && (
                    <h2 className={`mb-3 font-semibold text-lg ${isWarning ? 'text-red-900' : ''}`}>
                      {subsection.title}
                    </h2>
                  )}
                  {subsection.description && (
                    <div className={`mb-4 text-sm whitespace-pre-line ${isWarning ? 'text-red-800 bg-red-50 rounded-md p-4 border-l-2 border-red-300' : 'text-muted-foreground'}`}>
                      {renderTextWithLinks(subsection.description)}
                    </div>
                  )}
                  {subsection.screenshot && !subsection.subsections && (
                    <div className="mb-4">
                      <img 
                        src={`/${subsection.screenshot}`} 
                        alt={subsection.title || `Screenshot ${index + 1}`}
                        className="rounded-lg border shadow-sm max-w-full h-auto"
                      />
                    </div>
                  )}
                  {subsection.subsections && subsection.subsections.length > 0 ? (
                    <>
                      {subsection.screenshot && (
                        <div className="mb-4">
                          <img 
                            src={`/${subsection.screenshot}`} 
                            alt={subsection.title || `Screenshot ${index + 1}`}
                            className="rounded-lg border shadow-sm max-w-full h-auto"
                          />
                        </div>
                      )}
                      <div className="space-y-4">
                      {subsection.subsections.map((subSubsection, subIndex) => {
                        const isSubWarning = subSubsection.title?.includes('⚠️');
                        return (
                          <div key={subIndex} className={`border-l-2 pl-4 ${isSubWarning ? 'border-red-300 bg-red-50 rounded-r-md p-4' : 'border-muted'}`}>
                            {subSubsection.title && (
                              <h3 className={`mb-2 font-medium text-sm ${isSubWarning ? 'text-red-900' : ''}`}>
                                {subSubsection.title}
                              </h3>
                            )}
                            {subSubsection.description && (
                              <p className={`mb-3 text-sm whitespace-pre-line ${isSubWarning ? 'text-red-800' : 'text-muted-foreground'}`}>
                                {renderTextWithLinks(subSubsection.description)}
                              </p>
                            )}
                            {subSubsection.commands && subSubsection.commands.length > 0 && (
                              <div className="space-y-2">
                                {subSubsection.commands.map((command, cmdIndex) => (
                                  <CopyableCommand key={cmdIndex} command={command} />
                                ))}
                              </div>
                            )}
                            {subSubsection.codeBlock && (
                              <div className="overflow-x-auto rounded-md bg-muted p-3 text-sm">
                                <div className="whitespace-pre-wrap">{renderTextWithLinks(subSubsection.codeBlock)}</div>
                              </div>
                            )}
                            {subSubsection.screenshot && (
                              <div className="mb-4 mt-3">
                                <img 
                                  src={`/${subSubsection.screenshot}`} 
                                  alt={subSubsection.title || `Screenshot ${subIndex + 1}`}
                                  className="rounded-lg border shadow-sm max-w-full h-auto"
                                />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                  ) : (
                    <>
                      {subsection.commands && subsection.commands.length > 0 && (
                        <div className="mb-4 space-y-2">
                          {subsection.commands.map((command, cmdIndex) => (
                            <CopyableCommand key={cmdIndex} command={command} />
                          ))}
                        </div>
                      )}
                      {subsection.codeBlock && (
                        <div className="mb-4">
                          <div className="overflow-x-auto rounded-md bg-muted p-4 text-sm">
                            <div className="whitespace-pre-wrap">{renderTextWithLinks(subsection.codeBlock)}</div>
                          </div>
                        </div>
                      )}
                      {subsection.screenshot && (
                        <div className="mb-4">
                          <img 
                            src={`/${subsection.screenshot}`} 
                            alt={subsection.title || `Screenshot ${index + 1}`}
                            className="rounded-lg border shadow-sm max-w-full h-auto"
                          />
                        </div>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="rounded-lg border bg-card p-6">
            <p className="text-sm text-muted-foreground">{option.content || "Content for this option will be added here."}</p>
          </div>
        )}
      </div>

      {/* Back button at bottom */}
      <div className="border-t bg-background px-6 py-6">
        <div className="container mx-auto max-w-4xl">
          <Button
            variant="outline"
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'instant' });
              navigate('/onboarding/step/8');
            }}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExtendOption;

