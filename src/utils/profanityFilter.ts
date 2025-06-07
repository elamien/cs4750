import { Filter } from 'bad-words';

const filter = new Filter();

/**
 * Checks if a string contains profanity.
 * @param text The string to check.
 * @returns True if profanity is found, false otherwise.
 */
export function containsProfanity(text: string | null | undefined): boolean {
  if (!text) {
    return false;
  }
  return filter.isProfane(text);
}

/**
 * Cleans a string by replacing profanity with placeholders.
 * @param text The string to clean.
 * @returns The cleaned string.
 */
export function cleanProfanity(text: string | null | undefined): string {
  if (!text) {
    return '';
  }
  return filter.clean(text);
} 