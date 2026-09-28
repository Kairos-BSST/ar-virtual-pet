import { Suspense, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { AdaptiveDpr } from '@react-three/drei';
import ARScene from './ARScene';
import { useARSession } from '../../hooks/useARSession';
import { attachListener } from '../../services/audioService';
import { preloadCoreAssets } from '../../services/assetLoader';

function XRBootstrap({ overlayRoot }) {
  const gl = useThree((s) => s.gl);
  const camera = useThree((s) => s.camera);
  useARSession(gl, overlayRoot);
  useEffect(() => {
    attachListener(camera);
  }, [camera]);
  return null;
}

export default function ARCanvasRoot({ overlayRoot, cameraPosRef }) {
  useEffect(() => {
    preloadCoreAssets();
  }, []);

  return (
    <Canvas
      shadows
      className="h-full w-full bg-transparent"
      style={{ background: 'transparent' }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      camera={{ fov: 70, near: 0.01, far: 40, position: [0, 1.5, 0] }}
      onCreated={({ gl }) => {
        gl.xr.enabled = true;
        gl.shadowMap.enabled = true;
        gl.setClearColor(0x000000, 0);
        gl.setClearAlpha(0);
        if (typeof gl.xr.setDepthSensing === 'function') {
          gl.xr.setDepthSensing({
            usagePreference: ['gpu-optimized', 'cpu-optimized'],
            dataFormatPreference: ['luminance-alpha', 'float32'],
          });
        }
      }}
    >
      <AdaptiveDpr pixelated />
      <Suspense fallback={null}>
        <XRBootstrap overlayRoot={overlayRoot} />
        <ARScene cameraPosRef={cameraPosRef} />
      </Suspense>
    </Canvas>
  );
}
