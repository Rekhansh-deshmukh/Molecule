'use server';
/**
 * @fileOverview Provides formula corrections based on invalid input.
 *
 * - suggestFormulaCorrections - A function that suggests formula corrections.
 * - SuggestFormulaCorrectionsInput - The input type for suggestFormulaCorrections.
 * - SuggestFormulaCorrectionsOutput - The return type for suggestFormulaCorrections.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const SuggestFormulaCorrectionsInputSchema = z.object({
  formula: z.string().describe('The chemical formula provided by the user.'),
});
export type SuggestFormulaCorrectionsInput = z.infer<typeof SuggestFormulaCorrectionsInputSchema>;

const SuggestFormulaCorrectionsOutputSchema = z.object({
  correctedFormulas: z.array(
    z.string().describe('Possible corrections for the provided formula.')
  ).describe('A list of corrected chemical formulas.'),
  interpretation: z.string().optional().describe('A textual interpretation of the provided formula, if ambiguous.'),
});
export type SuggestFormulaCorrectionsOutput = z.infer<typeof SuggestFormulaCorrectionsOutputSchema>;

export async function suggestFormulaCorrections(input: SuggestFormulaCorrectionsInput): Promise<SuggestFormulaCorrectionsOutput> {
  return suggestFormulaCorrectionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestFormulaCorrectionsPrompt',
  input: {
    schema: z.object({
      formula: z.string().describe('The chemical formula provided by the user.'),
    }),
  },
  output: {
    schema: z.object({
      correctedFormulas: z.array(
        z.string().describe('Possible corrections for the provided formula.')
      ).describe('A list of corrected chemical formulas.'),
      interpretation: z.string().optional().describe('A textual interpretation of the provided formula, if ambiguous.'),
    }),
  },
  prompt: `You are a chemistry expert. A user has provided the following chemical formula:

  {{formula}}

  If the formula is invalid or ambiguous, provide a list of possible corrected formulas and, if ambiguous, a textual interpretation. If the formula is valid, return an empty array for correctedFormulas.
  The output should be a JSON object with "correctedFormulas" and "interpretation" fields.
`,
});

const suggestFormulaCorrectionsFlow = ai.defineFlow<
  typeof SuggestFormulaCorrectionsInputSchema,
  typeof SuggestFormulaCorrectionsOutputSchema
>({
  name: 'suggestFormulaCorrectionsFlow',
  inputSchema: SuggestFormulaCorrectionsInputSchema,
  outputSchema: SuggestFormulaCorrectionsOutputSchema,
}, async input => {
  const {output} = await prompt(input);
  return output!;
});
