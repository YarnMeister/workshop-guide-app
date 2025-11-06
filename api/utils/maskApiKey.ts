/**
 * Utility function to mask API keys
 * Shows first 8 characters followed by asterisks
 */
export function maskApiKey(key: string): string {
  if (!key || key.length <= 8) {
    return '**********';
  }
  return key.substring(0, 8) + '*'.repeat(Math.max(8, key.length - 8));
}

