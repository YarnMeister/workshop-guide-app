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

export async function enhancePromptWithAI(userInput: string): Promise<{ success: boolean; content: string; error?: string }> {
  const apiKey = import.meta.env.VITE_OPEN_ROUTER_API_KEY;
  
  if (!apiKey) {
    return {
      success: false,
      content: userInput,
      error: 'API key not configured. Please add VITE_OPEN_ROUTER_API_KEY to your .env.local file.'
    };
  }

  const systemPrompt = `You are an expert at creating prompts for Lovable (a web app builder AI). 
Your task is to transform user ideas into well-structured, comprehensive prompts that will generate excellent web applications.

IMPORTANT REQUIREMENTS:
1. The generated app MUST use localStorage for data persistence
2. Be specific about UI components and layout
3. Include user flows and interactions
4. Specify responsive design requirements
5. Mention error handling and edge cases
6. Use modern React patterns and best practices

OUTPUT FORMAT:
- Start with a clear project title and description
- List key features with detailed specifications
- Describe the UI/UX in detail
- Specify data models and localStorage structure
- Include technical requirements
- End with success criteria`;

  const userPrompt = `Transform this idea into a comprehensive Lovable prompt:

"${userInput}"

Create a well-structured prompt that will generate a fully functional web application with localStorage for data persistence. Be specific about features, UI components, and technical implementation.`;

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
        errorMessage = 'Invalid API key. Please check your VITE_OPEN_ROUTER_API_KEY in .env.local';
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
      content: userInput,
      error: errorMessage
    };
  }
}
