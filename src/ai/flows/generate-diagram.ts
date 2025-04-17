'use server';
/**
 * @fileOverview Generates a chemical compound diagram from a given formula.
 *
 * - generateDiagram - A function that generates the diagram.
 * - GenerateDiagramInput - The input type for the generateDiagram function.
 * - GenerateDiagramOutput - The return type for the generateDiagram function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const GenerateDiagramInputSchema = z.object({
  formula: z.string().describe('The chemical formula of the compound.'),
});
export type GenerateDiagramInput = z.infer<typeof GenerateDiagramInputSchema>;

const GenerateDiagramOutputSchema = z.object({
  diagramUrl: z.string().describe('The URL of the generated chemical diagram.'),
});
export type GenerateDiagramOutput = z.infer<typeof GenerateDiagramOutputSchema>;

export async function generateDiagram(input: GenerateDiagramInput): Promise<GenerateDiagramOutput> {
  return generateDiagramFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateDiagramPrompt',
  input: {
    schema: z.object({
      formula: z.string().describe('The chemical formula of the compound.'),
    }),
  },
  output: {
    schema: z.object({
      diagramUrl: z.string().describe('The URL of the generated chemical diagram.'),
    }),
  },
  prompt: `You are an AI that generates diagrams of chemical compounds given their formula. Your goal is to find a reliable URL for an image of the chemical structure.

  Follow these steps:
  1. First, try to find the diagram on PubChem using the following URL format: https://pubchem.ncbi.nlm.nih.gov/image/imgsrv.fcgi?cid=[PubChem CID]. You will need to determine the correct PubChem CID for the given formula. If you cannot reliably determine the PubChem CID, move to step 2.
  2. If the diagram is not available on PubChem or you cannot determine the CID, use another reliable source, such as commonchemistry.org or Wikimedia Commons, ensuring the image is a clear representation of the compound's structure.
  3. Ensure that the URL is publicly accessible and points directly to an image file (e.g., PNG, JPEG, SVG).

  Chemical Formula: {{{formula}}}
  Diagram URL: `,
});

const generateDiagramFlow = ai.defineFlow<
  typeof GenerateDiagramInputSchema,
  typeof GenerateDiagramOutputSchema
>({
  name: 'generateDiagramFlow',
  inputSchema: GenerateDiagramInputSchema,
  outputSchema: GenerateDiagramOutputSchema,
}, async input => {
  const {output} = await prompt(input);
  return output!;
});
