'use server';
/**
 * @fileOverview Generates a 3D molecular representation from a given formula.
 *
 * - generateDiagram - A function that generates the 3D molecular representation.
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
  molecularData: z.string().describe('The 3D molecular representation in SDF or PDB format.'),
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
      molecularData: z.string().describe('The 3D molecular representation in SDF or PDB format.'),
    }),
  },
  prompt: `You are an AI that generates 3D molecular representations of chemical compounds given their formula. Your goal is to generate the molecular representation in a suitable format (e.g., SDF or PDB) that can be rendered using 3Dmol.js.

  Given the chemical formula, generate the 3D molecular representation in SDF format. If you cannot find the SDF format, generate the representation in PDB format.

  Chemical Formula: {{{formula}}}
  Molecular Data (SDF or PDB): `,
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
