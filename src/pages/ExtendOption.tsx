import { useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useParticipant } from "@/hooks/useParticipant";
import { revealApiKey } from "@/services/participant";

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
    title: "Integrate property listing data using our API",
    heading: "Connect Real Property Data",
    subsections: [
      {
        title: "What You'll Do",
        description: `1. Add your API key to the environment file

2. Ask your AI assistant to replace mock data with real API calls

3. Test that real property data loads in your app`
      },
      {
        title: "Add Your API Key",
        subsections: [
          {
            title: "1. Find or create Environment Variable File",
            description: `In your project root, find or create the file \`.env.local\`:`,

            screenshot: "env-local.png"
          },
          {
            title: "",
            description: `If the file does not exist, right-click in the "whitespace" and select "Add new file" and then name the file: .env.local (it starts with a dot)`
          },
          {
            title: "2. Add Your API Key",
            description: `Copy and paste the following variable into the .env.local file:`,
            commands: [
              'VITE_WORKSHOP_API_KEY='
            ]
          },
          {
            title: "",
            description: `Next, copy your personal API key and paste the value after the '=' on the same line as the VITE_WORKSHOP_API_KEY=`
          },
          {
            title: "__API_KEY__",
            description: ""
          },
          {
            title: "⚠️ Important Notes",
            description: `- Don't add quotes around the key

- Make sure there are no spaces before or after the \`=\`

- The file should be in the same folder as \`package.json\``
          },
          {
            title: "3. Verify Environment File",
            description: `Your \`.env.local\` variable should look somthing like this:`,
            codeBlock: `VITE_WORKSHOP_API_KEY=sk-or-v1-abc123def456...`,
            subsections: [
              {
                title: "",
                description: `✅ Save the file`
              }
            ]
          },
          {
            title: "⚠️ Important Notes",
            description: `- Don't ever paste your API key in the AI Chat window, this is a serious security breach

- The .env.local file is a secure "wallet" where you can save sensitive data, the system retrieves these values securely without revealing it to the AI assitant.

- Please ensure the .env.local file is SAVED, just because you can see the value on screen does not mean it's saved. Unsaved files will result in a critical connection failure.`
          },
          {
            title: "4. Example: Fetching and Parsing Data",
            description: `Here's how to properly fetch and parse API data:`,
            codeBlock: `// Example: Fetch suburb data
const response = await fetch(
  'https://workshop-guide-app.vercel.app/api/insights/suburbs?limit=10',
  {
    headers: {
      'Authorization': \`Bearer \${import.meta.env.VITE_WORKSHOP_API_KEY}\`
    }
  }
);

const suburbs = await response.json();

// ⚠️ CRITICAL: Parse string numbers before using in charts
const parsedSuburbs = suburbs.map(s => ({
  ...s,
  avg_price: Number(s.avg_price),
  median_price: Number(s.median_price),
  total_sales: Number(s.total_sales)
}));

// Now safe to use in charts
<BarChart data={parsedSuburbs} ... />`
          }
        ]
      },
      {
        title: "Update Your Code with AI",
        subsections: [
          {
            title: "2.1 Stop Your Dev Server",
            description: `If your app is running (\`npm run dev\`), stop it:

- Press \`Ctrl + C\` in the terminal`
          },
          {
            title: "2.2 Paste This Prompt into Your AI Chat",
            description: `Copy this entire prompt and paste it into your AI coding assistant (Cursor, Windsurf, or Void):`,
            commands: [
              `I need to replace the mock property data in my app with real API calls.

---

## API Configuration

- **Base URL:** https://workshop-guide-app.vercel.app
- **Auth:** Bearer token using \`import.meta.env.VITE_WORKSHOP_API_KEY\` from .env.local
- **Rate Limit:** 100 requests per minute

---

## ⚠️ CRITICAL DATA NOTES

- The API primarily contains **Queensland (QLD)** data
- Other states may return **empty results**
- **OMIT the state parameter entirely** to get all available data
- Many numeric fields (\`avg_price\`, \`median_price\`, \`total_sales\`) are returned as **STRINGS**
- You **MUST parse them to numbers** before using in charts or calculations

---

## Available GET Endpoints

### 1. Suburb Insights
\`\`\`
GET /api/insights/suburbs?limit=20
\`\`\`
- **Optional params:** state, limit (default: 20)
- **Returns:** Array of \`{ suburb, avg_price, median_price, total_sales }\`
- **Note:** avg_price and median_price are strings - parse to numbers

### 2. Property Type Insights
\`\`\`
GET /api/insights/property-types
\`\`\`
- **Optional params:** state
- **Returns:** Array of \`{ property_type, avg_price, median_price, total_sales }\`
- **Note:** property_type values are lowercase (e.g., "house", "apartment")

### 3. Price Trends
\`\`\`
GET /api/insights/price-trends?property_type=house&months=12
\`\`\`
- **Optional params:** state, property_type (default: "house"), months (default: 12)
- **Returns:** Array of \`{ month, avg_price, total_sales }\`
- **Note:** month is ISO string, avg_price is string

### 4. Market Statistics
\`\`\`
GET /api/insights/market-stats
\`\`\`
- **Optional params:** state
- **Returns:** \`{ total_sales, avg_price, median_price, total_suburbs, price_range: { min, max }, most_active_month }\`

### 5. Property Search
\`\`\`
GET /api/properties/search?limit=50&offset=0
\`\`\`
- **Optional params:** state, suburb, property_type, min_price, max_price, bedrooms, bathrooms, sale_type, year, limit (default: 50), offset (default: 0)
- **Returns:** \`{ data: [...properties], total, limit, offset }\`

**Property object fields:**
- \`listing_instance_id_hash\` (unique ID - NOT "id")
- \`suburb\`, \`state\`, \`postcode\` (NO "address" field)
- \`property_type\` (lowercase: "house", "apartment", "townhouse")
- \`price_search\` (listing price), \`price_search_sold\` (actual sold price)
- \`active_month\` (ISO string - NOT "sale_date")
- \`bedrooms\`, \`bathrooms\`
- \`sale_type\` ("Auction", "Private")
- \`financial_year\`

**All endpoints require:** \`Authorization: Bearer \${import.meta.env.VITE_WORKSHOP_API_KEY}\`

---

## TypeScript Type Definitions

\`\`\`typescript
interface SuburbInsight {
  suburb: string;
  avg_price: number;  // Parse from string
  median_price: number;  // Parse from string
  total_sales: number;  // Parse from string
}

interface PropertyTypeInsight {
  property_type: string;  // Lowercase: "house", "apartment", etc.
  avg_price: number;  // Parse from string
  median_price: number;  // Parse from string
  total_sales: number;  // Parse from string
}

interface PriceTrend {
  month: string;  // ISO date string
  avg_price: number;  // Parse from string
  total_sales: number;  // Parse from string
}

interface MarketStats {
  total_sales: number;
  avg_price: number;
  median_price: number;
  total_suburbs: number;
  price_range: { min: number; max: number };
  most_active_month: string;
}

interface PropertyListing {
  listing_instance_id_hash: string;  // Unique ID
  suburb: string;
  state: string;
  postcode: string;
  property_type: 'house' | 'apartment' | 'townhouse';  // Lowercase
  price_search: number;  // Listing price
  price_search_sold: number;  // Sold price
  active_month: string;  // ISO date string
  bedrooms: number;
  bathrooms: number;
  sale_type: 'Auction' | 'Private';
  financial_year: number;
}

interface PropertySearchResponse {
  data: PropertyListing[];
  total: number;
  limit: number;
  offset: number;
}
\`\`\`

---

## Requirements

**1. Create src/services/propertyAPI.ts with:**
   - Typed fetch functions for all 5 endpoints
   - Proper error handling for:
     * 401 Unauthorized (invalid API key)
     * 429 Rate Limit Exceeded (too many requests)
     * 500 Server Error (backend issues)
   - Helper function to parse string numbers to actual numbers

**2. Find and update existing components with mock data:**
   - Identify all files using mock/fake property data
   - Replace mock data calls with real API calls from propertyAPI.ts
   - Keep existing UI components and styling unchanged
   - Maintain existing visualizations (charts, tables, cards)

**3. Add proper data handling:**
   - Individual loading states for each API call
   - User-friendly error messages with dismissible alerts
   - CRITICAL: Convert all string numeric values to numbers before passing to chart components
     Example: \`Number(data.avg_price)\` or \`parseFloat(data.avg_price)\`

**4. Data fetching strategy:**
   - Start with NO state filter to get all available data (primarily QLD)
   - Omit state parameter from API calls unless user specifically filters by state

**Start by:**
1. Showing me which files have mock data
2. Creating the API service file with proper TypeScript types
3. Replacing mock data with real API calls in existing components`
            ]
          },
          {
            title: "2.3 Follow AI Instructions",
            description: `Your AI assistant will:

1. Identify files with mock data

2. Create/update an API service file

3. Replace mock data calls with real API calls

4. Add error handling and loading states`
          }
        ]
      },
      {
        title: "Test Your App",
        subsections: [
          {
            title: "2.1 Restart Dev Server",
            description: `In your terminal:`,
            commands: [
              "npm run dev"
            ]
          },
          {
            title: "2.2 Check for Errors",
            description: `- ❌ If you see errors, read them carefully and share with AI assistant`
          },
          {
            title: "2.3 Open in Browser",
            description: `1. Copy the localhost URL from terminal

2. Paste into your browser

3. Open browser DevTools (F12 or Right-click → Inspect)

4. Go to the **Console** tab`
          },
          {
            title: "2.4 Verify Real Data Loads",
            description: `Check for these signs:

- ✅ Property data displays (numbers should look realistic)

- ✅ No "mock" or "sample" labels in the data

- ✅ Console shows successful API calls (green text)

- ❌ Console shows red errors → see Troubleshooting below`
          },
          {
            title: "2.5 Test Different Features",
            description: `Click around your app:

- Try filters (suburb, property type, price range)

- Check different charts/tables

- Verify data updates when you change filters`
          }
        ]
      },
      {
        title: "Troubleshooting",
        subsections: [
          {
            title: "⚠️ Common Pitfalls",
            description: `**Avoid these common mistakes:**

❌ **Using state=VIC in API calls**
→ Returns empty results (API has mostly QLD data)
✅ **Solution:** Omit the state parameter entirely

❌ **Passing string prices directly to charts**
→ Charts break or display incorrectly
✅ **Solution:** Parse to numbers: Number(data.avg_price)

❌ **Looking for "id" field in property objects**
→ Field doesn't exist
✅ **Solution:** Use listing_instance_id_hash instead

❌ **Using "address" field**
→ Field doesn't exist
✅ **Solution:** Use suburb, state, and postcode fields

❌ **Expecting capitalized property types like "House"**
→ API returns lowercase values
✅ **Solution:** Use lowercase: "house", "apartment", "townhouse"

❌ **Looking for "sale_date" field**
→ Field doesn't exist
✅ **Solution:** Use active_month (ISO string)

❌ **Using "price" field**
→ Field doesn't exist
✅ **Solution:** Use price_search (listing) or price_search_sold (actual)`
          },
          {
            title: "Error: \"401 Unauthorized\" or \"Invalid API key\"",
            description: `**Fix:**

1. Check \`.env.local\` has correct key (no typos, no quotes, no spaces)

2. Restart dev server (\`Ctrl+C\`, then \`npm run dev\`)

**Still broken?** Ask AI assistant:`,
            commands: [
              "I'm getting a 401 error. Can you verify the Authorization header is correctly using import.meta.env.VITE_WORKSHOP_API_KEY?"
            ]
          },
          {
            title: "Error: \"429 Rate Limit Exceeded\"",
            description: `**Fix:**

1. Wait 60 seconds

2. Refresh the page

3. Consider adding caching (ask AI assistant to implement)

**Ask AI assistant:**`,
            commands: [
              "Add response caching to avoid hitting rate limits. Cache API responses for 5 minutes."
            ]
          },
          {
            title: "Error: \"Network request failed\" or CORS error",
            description: `**Fix:**

1. Check you're using the correct base URL: \`https://workshop-guide-app.vercel.app\`

2. Verify API key is valid (check Step 1 again)

**Ask AI assistant:**`,
            commands: [
              "I'm getting CORS or network errors. Can you verify the fetch requests are using the correct base URL and headers?"
            ]
          },
          {
            title: "Data Looks Wrong or Empty",
            description: `**Fix:**

1. Check browser Console for errors

2. Check Network tab in DevTools:

   - Look for requests to \`workshop-guide-app.vercel.app\`

   - Click on a request → Preview tab → see the response

3. Verify endpoint URL matches the API docs

**Ask AI assistant:**`,
            commands: [
              "The data looks incorrect. Can you check that we're using the right endpoint and parsing the response correctly?"
            ]
          },
          {
            title: "Environment Variable Not Loading",
            description: `**Symptoms:**

- Console shows \`undefined\` for API key

- 401 errors even though key is correct

**Fix:**

1. Verify \`.env.local\` filename (not \`.env.local.txt\`)

2. Verify it's in project root (same folder as \`package.json\`)

3. **Restart dev server** (environment variables only load on startup)

4. Check the variable name starts with \`VITE_\` (required for Vite projects)`
          }
        ]
      }
    ]
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
            description: `If you navigated away from that screen, you can get back to your database details to retrieve the string by going to: Setting -> Environment Variables:`,
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
  const [isRevealingKey, setIsRevealingKey] = useState<boolean>(false);
  const { apiKey, apiKeyMasked, setApiKey } = useParticipant();
  
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

  const CopyableApiKey = () => {
    const handleRevealAndCopyKey = async () => {
      // If we already have the key in memory, use it
      if (apiKey) {
        await copyToClipboard(apiKey);
        toast({
          title: "Key copied!",
          description: "Full API key copied to clipboard",
        });
        return;
      }

      setIsRevealingKey(true);
      try {
        const result = await revealApiKey();
        if (result.success && result.apiKey) {
          // Store in memory for future use
          setApiKey(result.apiKey);
          await copyToClipboard(result.apiKey);
          toast({
            title: "Key copied!",
            description: "Full API key copied to clipboard",
          });
        } else {
          toast({
            title: "Failed to retrieve key",
            description: result.error || "Please try again or re-enter your participant code",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Reveal key error:", error);
        toast({
          title: "Error",
          description: "Failed to retrieve key. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsRevealingKey(false);
      }
    };

    const displayKey = apiKeyMasked || "sk-or-v1*****************************************************************";
    
    // Always render the component - it should be visible
    return (
      <div className="flex items-center justify-between rounded-md bg-muted p-3 text-sm">
        <code className="flex-1 font-mono break-all">{displayKey}</code>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRevealAndCopyKey}
          disabled={isRevealingKey}
          className="ml-2 h-8 w-8 p-0 shrink-0"
        >
          {isRevealingKey ? (
            <Copy className="h-4 w-4 animate-pulse" />
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
              const isApiKeyMarker = subsection.title === "__API_KEY__";
              // Determine if this is a main step section (indices 1, 2, 3: "Add Your API Key", "Update Your Code with AI", "Test Your App")
              const isMainStep = (index === 1 || index === 2 || index === 3) && subsection.title && !isWarning && !isApiKeyMarker;
              const stepNumber = isMainStep ? index : null;
              
              return (
                <div key={index} className="rounded-lg border bg-card p-6">
                  {subsection.title && !isApiKeyMarker && (
                    <div className="mb-3 flex items-center gap-3">
                      {stepNumber && (
                        <div className="inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                          Step {stepNumber}
                        </div>
                      )}
                      <h2 className={`font-semibold text-lg ${isWarning ? 'text-red-900' : ''}`}>
                        {subsection.title}
                      </h2>
                    </div>
                  )}
                  {subsection.description && subsection.description.trim() && (
                    <div className={`mb-4 text-sm whitespace-pre-line ${isWarning ? 'text-red-800 bg-red-50 rounded-md p-4 border-l-2 border-red-300' : 'text-muted-foreground'}`}>
                      {renderTextWithLinks(subsection.description)}
                    </div>
                  )}
                  {isApiKeyMarker && (
                    <div className="mb-4">
                      <CopyableApiKey />
                    </div>
                  )}
                  {subsection.commands && subsection.commands.length > 0 && (
                    <div className="mb-4 space-y-2">
                      {subsection.commands.map((command, cmdIndex) => (
                        <CopyableCommand key={cmdIndex} command={command} />
                      ))}
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
                        const isApiKeyMarker = subSubsection.title === "__API_KEY__";
                        return (
                          <div key={subIndex} className={`border-l-2 pl-4 ${isSubWarning ? 'border-red-300 bg-red-50 rounded-r-md p-4' : isApiKeyMarker ? '' : 'border-muted'}`}>
                            {subSubsection.title && !isApiKeyMarker && (
                              <h3 className={`mb-2 font-medium text-sm ${isSubWarning ? 'text-red-900' : ''}`}>
                                {subSubsection.title}
                              </h3>
                            )}
                            {subSubsection.description && subSubsection.description.trim() && (
                              <p className={`mb-3 text-sm whitespace-pre-line ${isSubWarning ? 'text-red-800' : 'text-muted-foreground'}`}>
                                {renderTextWithLinks(subSubsection.description)}
                              </p>
                            )}
                            {isApiKeyMarker && (
                              <div className="mb-3 mt-3">
                                <CopyableApiKey />
                              </div>
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

