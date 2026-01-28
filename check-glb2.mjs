import { readFile } from 'fs/promises';

const buffer = await readFile('./public/characters/autonate-idle.glb');

const chunk0Length = buffer.readUInt32LE(12);
const jsonData = buffer.slice(20, 20 + chunk0Length).toString('utf8');
const gltf = JSON.parse(jsonData);

console.log('=== Idle Animation Info ===');
console.log('Animations:', gltf.animations?.length || 0);
if (gltf.animations) {
  gltf.animations.forEach((anim, i) => {
    console.log(`  ${i}: "${anim.name}"`);
  });
}
console.log('Rigged:', gltf.skins?.length > 0 ? 'Yes' : 'No');
console.log('Bones:', gltf.skins?.[0]?.joints?.length || 0);
