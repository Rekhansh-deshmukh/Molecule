'use client';

import {useState, useRef, useEffect} from 'react';
import {Button} from '@/components/ui/button';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Input} from '@/components/ui/input';
import {generateDiagram} from '@/ai/flows/generate-diagram';
import {suggestFormulaCorrections} from '@/ai/flows/suggest-formula-corrections';
import {Alert, AlertDescription} from '@/components/ui/alert';
import {Icons} from '@/components/icons';
import {Tooltip, TooltipContent, TooltipProvider, TooltipTrigger} from '@/components/ui/tooltip';
import {toast} from '@/hooks/use-toast';
import {cn} from '@/lib/utils';
import dynamic from 'next/dynamic';

const MolViewer = dynamic(() => import('@/components/mol-viewer'), {
  ssr: false,
});

export default function Home() {
  const [formula, setFormula] = useState('');
  const [molecularData, setMolecularData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const generateDiagramHandler = async () => {
    setIsLoading(true);
    setError(null);
    setSuggestions([]);
    setMolecularData(null);

    try {
      const diagramData = await generateDiagram({formula});
      setMolecularData(diagramData.molecularData);
    } catch (err: any) {
      setError(err.message || 'Failed to generate diagram.');

      try {
        const corrections = await suggestFormulaCorrections({formula});
        setSuggestions(corrections.correctedFormulas);
        if (corrections.correctedFormulas.length === 0) {
          setError('Invalid chemical formula.');
        } else {
          setError('Invalid chemical formula. Suggestions provided.');
        }
      } catch (suggestionErr: any) {
        setError(
          `Failed to generate diagram or suggestions. Original error: ${
            err.message
          }, Suggestion error: ${suggestionErr.message || 'Unknown error'}`
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const applySuggestion = (suggestion: string) => {
    setFormula(suggestion);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md space-y-4">
        <CardHeader>
          <CardTitle>ChemDraw AI</CardTitle>
          <CardDescription>
            Enter a chemical compound formula to generate its 3D model.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="space-y-1">
            <Input
              type="text"
              placeholder="Enter chemical formula (e.g., H2O)"
              value={formula}
              onChange={e => setFormula(e.target.value)}
            />
          </div>
          <div className="flex justify-between">
            <Button onClick={generateDiagramHandler} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  Generating
                </>
              ) : (
                'Generate 3D Model'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive" className="mt-4 w-full max-w-md">
          <Icons.close className="h-4 w-4" />
          <AlertDescription>
            {error}
            {suggestions.length > 0 && (
              <>
                <br />
                Did you mean:
                <ul className="list-disc pl-5">
                  {suggestions.map((suggestion, index) => (
                    <li key={index} className="cursor-pointer">
                      <Button
                        variant="link"
                        onClick={() => applySuggestion(suggestion)}
                      >
                        {suggestion}
                      </Button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </AlertDescription>
        </Alert>
      )}

      {molecularData && (
        <Card className="mt-4 w-full max-w-md">
          <CardHeader>
            <CardTitle>3D Chemical Model</CardTitle>
            <CardDescription>
              3D Model for chemical formula: {formula}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative overflow-hidden rounded-md">
              <MolViewer molecularData={molecularData} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
