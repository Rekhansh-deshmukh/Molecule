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
  prompt: `You are an AI that generates diagrams of chemical compounds given their formula.

  Given the chemical formula, generate a URL for an image of the diagram of the chemical compound.
  The URL must be publicly accessible and should point directly to an image file (e.g., PNG, JPEG, SVG). The preferred image source is PubChem.
  If the diagram can be found on PubChem, the URL format should be: https://pubchem.ncbi.nlm.nih.gov/image/imgsrv.fcgi?cid=[PubChem CID]
  If the diagram is not available on PubChem, use another reliable source, ensuring the image is a clear representation of the compound's structure.

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
