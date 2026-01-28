import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { readFileSync } from 'fs';

async function inspectGLB(filePath) {
  console.log('\n=== Inspecting: ' + filePath + ' ===');

  const buffer = readFileSync(filePath);
  const arrayBuffer = buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);

  const loader = new GLTFLoader();

  return new Promise((resolve, reject) => {
    loader.parse(arrayBuffer, '', (gltf) => {
      const scene = gltf.scene;

      const box = new THREE.Box3().setFromObject(scene);
      const size = new THREE.Vector3();
      box.getSize(size);

      const center = new THREE.Vector3();
      box.getCenter(center);

      console.log('Bounding Box:');
      console.log('  Min:', box.min.x.toFixed(3), box.min.y.toFixed(3), box.min.z.toFixed(3));
      console.log('  Max:', box.max.x.toFixed(3), box.max.y.toFixed(3), box.max.z.toFixed(3));
      console.log('  Size:', size.x.toFixed(3), 'x', size.y.toFixed(3), 'x', size.z.toFixed(3));
      console.log('  Center:', center.x.toFixed(3), center.y.toFixed(3), center.z.toFixed(3));

      if (gltf.animations && gltf.animations.length > 0) {
        console.log('\nAnimations:', gltf.animations.length);
        gltf.animations.forEach((anim, i) => {
          console.log('  ', i, ':', anim.name, '- duration:', anim.duration.toFixed(2), 's');
        });
      }

      resolve({ size, center, box });
    }, reject);
  });
}

async function main() {
  try {
    await inspectGLB('./public/characters/autonate-idle.glb');
    await inspectGLB('./public/characters/autonate-talking.glb');
    await inspectGLB('./public/environments/scene-1.glb');
  } catch (err) {
    console.error('Error:', err.message);
  }
}

main();
