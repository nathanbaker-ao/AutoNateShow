import { NodeIO } from '@gltf-transform/core';

async function inspectGLB(filePath) {
  console.log('\n=== Inspecting Bones: ' + filePath + ' ===');

  const io = new NodeIO();
  const document = await io.read(filePath);
  const root = document.getRoot();

  console.log('\nSkin/Skeleton:');
  for (const skin of root.listSkins()) {
    console.log(`  Skin: ${skin.getName()}`);
    const joints = skin.listJoints();
    console.log(`  Joints (${joints.length}):`);
    joints.forEach((joint, i) => {
      const name = joint.getName();
      // Highlight face-related bones
      const isFace = /jaw|mouth|lip|tongue|face|head/i.test(name);
      const marker = isFace ? ' <-- FACE BONE' : '';
      console.log(`    ${i}: ${name}${marker}`);
    });
  }

  console.log('\nAll Nodes (for bone hierarchy):');
  for (const node of root.listNodes()) {
    const name = node.getName();
    const children = node.listChildren();
    const isFace = /jaw|mouth|lip|tongue|face|head/i.test(name);
    if (isFace || children.length > 0) {
      const marker = isFace ? ' <-- FACE' : '';
      console.log(`  ${name}${marker}`);
      if (isFace) {
        children.forEach(child => {
          console.log(`    -> ${child.getName()}`);
        });
      }
    }
  }
}

async function main() {
  try {
    await inspectGLB('./public/characters/autonate-talking.glb');
  } catch (err) {
    console.error('Error:', err.message);
  }
}

main();
