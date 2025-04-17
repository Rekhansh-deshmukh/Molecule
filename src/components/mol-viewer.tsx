'use client';

import React, {useEffect, useRef} from 'react';

interface MolViewerProps {
  molecularData: string | null;
}

const MolViewer: React.FC<MolViewerProps> = ({molecularData}) => {
  const viewerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!molecularData || !viewerRef.current) {
      return;
    }

    const element = viewerRef.current;
    element.innerHTML = ''; // Clear existing content

    // Dynamically import 3Dmol.js
    import('3dmol')
      .then(() => {
        const config = {backgroundColor: 'white'};
        const viewer = new (window as any).$3Dmol.createViewer(element, config);

        viewer.addModel(molecularData, 'sdf');
        viewer.setStyle({}, {stick: {}, sphere: {radius: 0.3}});
        viewer.zoomTo();
        viewer.render();
        viewer.zoom(1.2, 1000);
      })
      .catch(error => {
        console.error("Failed to load 3Dmol.js", error);
      });
  }, [molecularData]);

  return (
    <div
      ref={viewerRef}
      style={{width: '500px', height: '300px', position: 'relative'}}
    />
  );
};

export default MolViewer;
