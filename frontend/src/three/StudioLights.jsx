import { Environment, Lightformer } from '@react-three/drei'

// Product-photo lighting built from local light panels (no HDRI download):
// a big warm softbox key, a soft fill, a rim strip behind for the glossy edges,
// a top light, plus one shadow-casting key for layer-on-layer shadows.
// keyIntensity / envScale let a scene trade flat fill for a stronger, shadow-casting key.
export default function StudioLights({ tier, keyIntensity = 2.3, envScale = 1 }) {
  const shadowSize = tier.shadowMapSize || 512
  return (
    <>
      <Environment resolution={tier.envResolution} frames={1}>
        <Lightformer form="rect" intensity={2.4 * envScale} color="#fff2e2" position={[-1.4, 1.2, 1.3]} scale={[2.4, 1.6, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={0.7 * envScale} color="#ffe6cc" position={[1.6, 0.5, 1.0]} scale={[1.8, 1.8, 1]} target={[0, 0, 0]} />
        <Lightformer form="rect" intensity={3.2 * envScale} color="#ffd9ad" position={[0.7, 0.7, -1.8]} scale={[2.4, 0.5, 1]} target={[0, 0, 0]} />
        <Lightformer form="circle" intensity={1.1 * envScale} color="#fff8ee" position={[0, 2.6, 0]} scale={2.4} rotation-x={Math.PI / 2} />
        <Lightformer form="rect" intensity={0.35 * envScale} color="#f6ebdd" position={[0, -1.4, 0]} rotation-x={-Math.PI / 2} scale={[6, 6, 1]} />
      </Environment>

      <hemisphereLight args={['#fff4e6', '#e6cfb2', 0.3]} />
      <directionalLight
        position={[-0.35, 0.55, 0.42]}
        intensity={keyIntensity}
        color="#fff1df"
        castShadow={tier.shadows}
        shadow-mapSize={[shadowSize, shadowSize]}
        shadow-bias={-0.0002}
        shadow-normalBias={0.0015}
        shadow-radius={5}
      >
        {/* Tight shadow frustum around the burger (metres), tall enough for the exploded view. */}
        <orthographicCamera attach="shadow-camera" args={[-0.3, 0.3, 0.48, -0.48, 0.05, 2]} />
      </directionalLight>
    </>
  )
}
