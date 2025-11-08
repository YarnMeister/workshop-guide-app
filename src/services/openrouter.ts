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

export async function enhancePromptWithAI(
  prdContent: string,
  getApiKey: () => Promise<string | null>
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
  console.log('[enhancePromptWithAI] Calling OpenRouter API...');

  const systemPrompt = `You are an expert at transforming product requirements into clear, actionable prompts for Lovable (an AI-powered web app builder).

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

  const userPrompt = `Transform this mini PRD into a well-structured Lovable prompt:

${prdContent}

Create a comprehensive prompt that will generate a fully functional web application prototype using localStorage for all data persistence. Be specific about features, UI components, interactions, and design direction.`;

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
