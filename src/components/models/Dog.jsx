import { Suspense, useEffect, useState } from 'react';
import { useGLTF } from '@react-three/drei';
import { MODEL_PATHS, DOG_SCALE } from '../../utils/constants';
import { loadOptionalModel } from '../../services/assetLoader';
import ProceduralDog from './ProceduralDog';

function GltfDog({ url, animation }) {
  const { scene } = useGLTF(url);
  return <primitive object={scene} scale={DOG_SCALE} animation={animation} />;
}

export default function DogModel({ animation, happiness, hunger, energy }) {
  const [gltfUrl, setGltfUrl] = useState(null);

  useEffect(() => {
    let live = true;
    loadOptionalModel('dog').then((gltf) => {
      if (live && gltf) setGltfUrl(MODEL_PATHS.dog);
    });
    return () => {
      live = false;
    };
  }, []);

  if (gltfUrl) {
    return (
      <Suspense fallback={<ProceduralDog animation={animation} happiness={happiness} hunger={hunger} energy={energy} />}>
        <GltfDog url={gltfUrl} animation={animation} />
      </Suspense>
    );
  }

  return <ProceduralDog animation={animation} happiness={happiness} hunger={hunger} energy={energy} />;
}
