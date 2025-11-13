/**
 * Text sanitization utilities for cleaning user input
 * Prevents formatting conflicts when users paste content from ChatGPT or other sources
 */

/**
 * Sanitizes user input by removing markdown formatting and normalizing whitespace
 * Applied at input time to ensure clean data is stored from the start
 * 
 * @param text - Raw user input text
 * @returns Cleaned text with markdown formatting removed
 * 
 * @example
 * sanitizeInput("## Header\n**bold text**\n\n\nMultiple breaks")
 * // Returns: "Header\nbold text\n\nMultiple breaks"
 */
export function sanitizeInput(text: string): string {
  if (!text) return '';
  
  return text
    // Remove markdown headers (# Header, ## Header, etc.)
    .replace(/^#{1,6}\s+/gm, '')
    
    // Remove markdown bold/italic formatting
    .replace(/\*\*(.+?)\*\*/g, '$1')      // **bold**
    .replace(/\*(.+?)\*/g, '$1')          // *italic*
    .replace(/__(.+?)__/g, '$1')          // __bold__
    .replace(/_(.+?)_/g, '$1')            // _italic_
    
    // Remove markdown list markers
    .replace(/^[\*\-\+]\s+/gm, '')        // - bullet or * bullet or + bullet
    .replace(/^\d+\.\s+/gm, '')           // 1. numbered list
    
    // Remove code blocks and inline code
    .replace(/```[\s\S]*?```/g, (match) => {
      // Extract content from code blocks, removing the backticks
      return match.replace(/```\w*\n?/g, '').replace(/```/g, '');
    })
    .replace(/`(.+?)`/g, '$1')            // `inline code`
    
    // Remove blockquotes
    .replace(/^>\s+/gm, '')               // > quote
    
    // Remove horizontal rules
    .replace(/^[\-\*_]{3,}$/gm, '')       // --- or *** or ___
    
    // Remove markdown links but keep the text
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')   // [text](url) -> text
    
    // Normalize line endings
    .replace(/\r\n/g, '\n')               // Windows to Unix
    .replace(/\r/g, '\n')                 // Old Mac to Unix
    
    // Normalize whitespace
    .replace(/\t/g, '  ')                 // Convert tabs to 2 spaces
    .replace(/[ ]{2,}/g, ' ')             // Collapse multiple spaces to single space
    .replace(/\n{3,}/g, '\n\n')           // Max 2 consecutive newlines
    
    // Clean up leading/trailing whitespace
    .trim();
}

/**
 * Checks if sanitization removed a significant amount of content
 * Used to detect if user pasted mostly formatting with little actual content
 * 
 * @param original - Original text before sanitization
 * @param sanitized - Text after sanitization
 * @returns Object with warning flag and percentage of content removed
 */
export function checkSanitizationImpact(
  original: string,
  sanitized: string
): { shouldWarn: boolean; percentRemoved: number } {
  if (!original) return { shouldWarn: false, percentRemoved: 0 };
  
  const originalLength = original.trim().length;
  const sanitizedLength = sanitized.trim().length;
  
  if (originalLength === 0) return { shouldWarn: false, percentRemoved: 0 };
  
  const percentRemoved = ((originalLength - sanitizedLength) / originalLength) * 100;
  
  // Warn if more than 30% of content was removed OR if result is very short
  const shouldWarn = percentRemoved > 30 || (sanitizedLength < 10 && originalLength > 20);
  
  return { shouldWarn, percentRemoved: Math.round(percentRemoved) };
}

