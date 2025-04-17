'use client';

import Image from 'next/image';
import {useState} from 'react';
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

export default function Home() {
  const [formula, setFormula] = useState('');
  const [diagramUrl, setDiagramUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const isValidUrl = (url: string | null): boolean => {
    if (!url) return false;
    try {
      new URL(url);
      return true;
    } catch (e) {
      return false;
    }
  };

  const generateDiagramHandler = async () => {
    setIsLoading(true);
    setError(null);
    setSuggestions([]);
    setDiagramUrl(null);

    try {
      const diagramData = await generateDiagram({formula});
      setDiagramUrl(diagramData.diagramUrl);
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

  const downloadDiagram = async () => {
    if (!diagramUrl || !isValidUrl(diagramUrl)) {
      toast({
        title: 'No valid diagram to download',
        description: 'Please generate a valid diagram first.',
      });
      return;
    }

    try {
      const response = await fetch(diagramUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chemical_diagram.${diagramUrl.split('.').pop()}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      toast({
        title: 'Error downloading diagram',
        description: err.message || 'Failed to download the diagram.',
        variant: 'destructive',
      });
      console.error('Download error:', err);
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
            Enter a chemical compound formula to generate its diagram.
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
                'Generate Diagram'
              )}
            </Button>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="secondary"
                    onClick={downloadDiagram}
                    disabled={!diagramUrl}
                  >
                    <Icons.download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Download the generated diagram in the original format.
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
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

      {diagramUrl && (
        <Card className="mt-4 w-full max-w-md">
          <CardHeader>
            <CardTitle>Chemical Diagram</CardTitle>
            <CardDescription>
              Diagram for chemical formula: {formula}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative overflow-hidden rounded-md">
              {isValidUrl(diagramUrl) ? (
                <Image
                  src={diagramUrl}
                  alt="Chemical Diagram"
                  width={500}
                  height={300}
                  style={{ objectFit: 'contain', width: '100%', height: 'auto' }}
                />
              ) : (
                <Image
                  src={`https://picsum.photos/500/300`}
                  alt="Placeholder"
                  width={500}
                  height={300}
                  style={{objectFit: 'contain', width: '100%', height: 'auto'}}
                />
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
