import { readFile } from 'fs/promises';

const buffer = await readFile('./public/characters/autonate-talking.glb');
const jsonStart = buffer.indexOf('{');
const jsonEnd = buffer.indexOf('}}}') + 3;
const jsonStr = buffer.slice(jsonStart, jsonEnd).toString('utf8');

try {
  const gltf = JSON.parse(jsonStr);
  console.log('=== GLB Analysis ===\n');
  console.log('Animations:', gltf.animations?.length || 0);
  if (gltf.animations) {
    gltf.animations.forEach((anim, i) => {
      console.log(`  ${i}: "${anim.name}"`);
    });
  }
  console.log('\nNodes (bones/meshes):', gltf.nodes?.length || 0);
  console.log('Meshes:', gltf.meshes?.length || 0);
  console.log('Skins (rigs):', gltf.skins?.length || 0);
} catch (e) {
  console.log('Could not parse GLB JSON chunk');
}
