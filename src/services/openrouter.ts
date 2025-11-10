interface OpenRouterResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  error?: {
    message: string;
    code: string;
  };
}

// Standard system prompt for apps NOT using property data
const STANDARD_SYSTEM_PROMPT = `You are an expert at transforming product requirements into clear, actionable prompts for Lovable (an AI-powered web app builder).

## Your Task

Convert the user's mini PRD into a well-structured Lovable prompt that will generate a working prototype.

## Core Principles

- **No code blocks or pseudo-code** - Write everything in natural language
- **Use localStorage** - Always specify browser localStorage for data persistence (no backend)
- **Be specific and actionable** - Clear direction on layout, functionality, and interactions
- **Preserve the user's vision** - Stay true to their design mood and feature priorities

## Output Structure

**Opening (1-2 sentences)**
"Build a [type of app] that [primary purpose] for [target user]."

**Core Functionality**
- Main features and how they work
- User interactions and flows
- Data handling with localStorage
- AI/intelligent components and behavior

**UI/Design**
- Overall layout and structure
- Design mood and style
- Key UI components
- Responsive behavior

**User Flow**
- Step-by-step interaction flow
- What happens on key actions
- State changes and feedback

**Technical Notes**
- localStorage for all data persistence
- Any specific libraries or integrations
- Responsive requirements

## Formatting

- Clear paragraphs and natural language
- Bullet points for feature lists
- Bold for key sections
- No code syntax or technical jargon

## Example Transformation

**PRD says:** "Must-have: User can add items to a list"  
**Transform to:** "Users can add new items by typing into an input field and clicking an 'Add' button. Each item displays with a checkbox and delete option. Store all items in localStorage for persistence."

## Include

✅ Specific UI elements (buttons, forms, cards)  
✅ Exact interactions (click, type, drag)  
✅ Data storage with localStorage  
✅ Visual style descriptors  
✅ Success/error handling

## Avoid

❌ Code snippets or pseudo-code  
❌ Vague phrases like "implement functionality"  
❌ Backend/database references  
❌ Overly technical implementation details

Now transform the mini PRD into a polished Lovable prompt.`;

// Property data-aware system prompt for apps using Australian property market data
const PROPERTY_DATA_SYSTEM_PROMPT = `You are an expert at transforming product requirements into clear, actionable prompts for Lovable (an AI-powered web app builder).

## Your Task

Convert the user's mini PRD into a well-structured Lovable prompt that will generate a working prototype that leverages Australian property market data.

## Available Property Data API

The user will have access to a comprehensive Australian property market data API that will be integrated later in the workshop (Step 8). Design the UI and functionality to work seamlessly with this data structure.

### API Endpoints Available:

**1. Suburb Insights** (\`/api/insights/suburbs\`)
Returns aggregated data by suburb:
- \`suburb\` (string) - Suburb name
- \`avg_price\` (number) - Average sale price
- \`median_price\` (number) - Median sale price
- \`total_sales\` (number) - Total number of sales
Supports filtering by \`state\` (VIC, NSW, QLD, etc.) and \`limit\` (max results)

**2. Property Type Insights** (\`/api/insights/property-types\`)
Returns aggregated data by property type:
- \`property_type\` (string) - e.g., "House", "Unit", "Townhouse"
- \`avg_price\` (number) - Average sale price
- \`median_price\` (number) - Median sale price
- \`total_sales\` (number) - Total number of sales
Supports filtering by \`state\`

**3. Price Trends** (\`/api/insights/price-trends\`)
Returns time-series pricing data:
- \`month\` (string) - Format: "YYYY-MM"
- \`avg_price\` (number) - Average price for that month
- \`total_sales\` (number) - Number of sales in that month
Supports filtering by \`state\`, \`property_type\`, and \`months\` (default: 12, max: 60)

**4. Sale Type Insights** (\`/api/insights/sale-types\`)
Returns data by sale method:
- \`sale_type\` (string) - e.g., "Auction", "Private Treaty"
- \`avg_price\` (number) - Average sale price
- \`total_sales\` (number) - Total number of sales
- \`avg_premium_pct\` (number) - Average premium percentage
Supports filtering by \`state\`

**5. Market Statistics** (\`/api/insights/market-stats\`)
Returns high-level market overview:
- \`total_sales\` (number) - Total sales count
- \`avg_price\` (number) - Overall average price
- \`median_price\` (number) - Overall median price
- \`total_suburbs\` (number) - Number of suburbs with data
- \`price_range\` (object) - \`{ min: number, max: number }\`
- \`most_active_month\` (string) - Month with most sales
Supports filtering by \`state\`

**6. Property Search** (\`/api/properties/search\`)
Returns individual property records with full details:
- \`financial_year\` (number) - e.g., 2024
- \`active_month\` (string) - Sale date (ISO format)
- \`state\` (string) - e.g., "VIC", "NSW"
- \`suburb\` (string) - Suburb name
- \`property_type\` (string) - Type of property
- \`price_search_sold\` (number) - Sale price
- \`bedrooms\` (number) - Number of bedrooms
- \`bathrooms\` (number) - Number of bathrooms
- \`sale_type\` (string) - Sale method

Supports filtering by: \`state\`, \`suburb\`, \`property_type\`, \`min_price\`, \`max_price\`, \`bedrooms\`, \`bathrooms\`, \`sale_type\`, \`year\`
Pagination: \`limit\` (max 100), \`offset\` (for pagination)

### Important API Integration Notes:

- **Current Phase:** Use localStorage with realistic mock data that matches the API schema above
- **Future Integration:** The actual API will be connected in Step 8 of the workshop
- **Design Goal:** Create UI components that will work seamlessly when real API data replaces mock data
- **Data Strategy:** Structure your mock data to match the exact field names and data types listed above

## Core Principles

- **No code blocks or pseudo-code** - Write everything in natural language
- **Use localStorage with API-shaped mock data** - Create realistic sample data matching the API schema
- **Design for the API** - UI should be optimized for displaying property market data
- **Be specific and actionable** - Clear direction on layout, functionality, and interactions
- **Preserve the user's vision** - Stay true to their design mood and feature priorities

## Output Structure

**Opening (1-2 sentences)**
"Build a [type of app] that [primary purpose] for [target user] using Australian property market data."

**Core Functionality**
- Main features and how they work with property data
- User interactions and flows (search, filter, compare, visualize)
- Data handling with localStorage (mock data matching API schema)
- AI/intelligent components and behavior
- How property data enhances the user experience

**Data & API Integration**
- Which API endpoints the app will use (from the list above)
- What mock data structure to create in localStorage
- How data flows through the application
- Specific data fields to display and how

**UI/Design**
- Overall layout and structure optimized for property data display
- Design mood and style
- Key UI components (data tables, charts, cards, filters, search)
- How property information is visualized
- Responsive behavior

**User Flow**
- Step-by-step interaction flow with data
- What happens on key actions (search, filter, select property)
- State changes and feedback
- How users discover and interact with property insights

**Technical Notes**
- localStorage structure matching API schema
- Realistic mock data examples (use field names from API)
- State management for filters and search
- Responsive requirements
- Preparation for API integration in Step 8

## Formatting

- Clear paragraphs and natural language
- Bullet points for feature lists
- Bold for key sections
- No code syntax or technical jargon

## Example Transformation

**PRD says:** "Users can search for properties by location"
**Transform to:** "Users can search for properties using a search bar that filters by suburb name. Display results in a grid of property cards showing the suburb, property type, price, bedrooms, and bathrooms. Store search filters in localStorage. Use mock data matching the Property Search API schema with fields: suburb, property_type, price_search_sold, bedrooms, bathrooms, state, sale_type. When the API is integrated in Step 8, the mock data will be replaced with real API calls to /api/properties/search."

## Include

✅ Specific UI elements for data display (cards, tables, charts, filters)
✅ Exact interactions (search, filter, sort, compare)
✅ Data storage with localStorage using API-matching schema
✅ Visual style descriptors appropriate for data-heavy apps
✅ Success/error handling for data operations
✅ Mock data structure matching API field names exactly
✅ Clear indication of which API endpoints will be used
✅ Data visualization approaches (charts, graphs, maps if relevant)

## Avoid

❌ Code snippets or pseudo-code
❌ Vague phrases like "implement functionality"
❌ Backend/database references (API integration happens in Step 8)
❌ Overly technical implementation details
❌ Mock data that doesn't match the API schema
❌ Ignoring the available property data in the design

## Special Emphasis for Property Data Apps

When the user's PRD involves property market analysis, real estate insights, suburb comparisons, price trends, or market statistics:

- **Prioritize data visualization** - Suggest charts, graphs, and visual comparisons
- **Enable filtering and search** - Make it easy to explore the data by state, suburb, property type, price range
- **Show key metrics prominently** - Average prices, median prices, total sales, trends
- **Design for comparison** - Allow users to compare suburbs, property types, or time periods
- **Make insights actionable** - Help users understand what the data means
- **Use appropriate UI patterns** - Data tables, stat cards, trend charts, interactive filters

Now transform the mini PRD into a polished Lovable prompt that makes full use of the available Australian property market data.`;

export async function enhancePromptWithAI(
  prdContent: string,
  getApiKey: () => Promise<string | null>,
  willUsePropertyData: boolean = false
): Promise<{ success: boolean; content: string; error?: string }> {
  // Get API key from provided function (which checks memory first, then database)
  console.log('[enhancePromptWithAI] Requesting API key...');
  const apiKey = await getApiKey();

  if (!apiKey) {
    console.error('[enhancePromptWithAI] API key not available');
    return {
      success: false,
      content: '',
      error: 'API key not available. Please make sure you are logged in with a valid participant code. If the issue persists, try logging out and logging back in.'
    };
  }

  // Log first few characters of API key for debugging (don't log full key for security)
  console.log('[enhancePromptWithAI] API key obtained, length:', apiKey.length, 'starts with:', apiKey.substring(0, 10) + '...');
  console.log('[enhancePromptWithAI] Calling OpenRouter API with', willUsePropertyData ? 'PROPERTY_DATA' : 'STANDARD', 'prompt...');

  // Select the appropriate system prompt based on property data usage
  const systemPrompt = willUsePropertyData
    ? PROPERTY_DATA_SYSTEM_PROMPT
    : STANDARD_SYSTEM_PROMPT;

  const userPrompt = `Transform this mini PRD into a well-structured Lovable prompt:

${prdContent}

Create a comprehensive prompt that will generate a fully functional web application prototype${willUsePropertyData ? ' that leverages the available Australian property market data API' : ' using localStorage for all data persistence'}. Be specific about features, UI components, interactions, and design direction.`;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': window.location.origin,
        'X-Title': 'Workshop Guide App',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('[enhancePromptWithAI] OpenRouter API error response:', {
        status: response.status,
        statusText: response.statusText,
        error: errorData
      });
      throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
    }

    const data: OpenRouterResponse = await response.json();
    
    if (data.error) {
      throw new Error(data.error.message);
    }

    if (!data.choices?.[0]?.message?.content) {
      throw new Error('No response content from AI');
    }

    return {
      success: true,
      content: data.choices[0].message.content.trim()
    };

  } catch (error) {
    console.error('OpenRouter API error:', error);
    
    let errorMessage = 'Failed to enhance prompt with AI.';
    
    if (error instanceof Error) {
      if (error.message.includes('401')) {
        errorMessage = 'Invalid API key. Please check your participant code or contact support.';
      } else if (error.message.includes('429')) {
        errorMessage = 'Rate limit exceeded. Please try again in a few moments.';
      } else if (error.message.includes('Failed to fetch')) {
        errorMessage = 'Network error. Please check your internet connection.';
      } else {
        errorMessage = `AI Enhancement failed: ${error.message}`;
      }
    }

    return {
      success: false,
      content: '',
      error: errorMessage
    };
  }
}
