import { NodeIO } from '@gltf-transform/core';

async function inspectGLB(filePath) {
  console.log('\n=== Inspecting: ' + filePath + ' ===');

  const io = new NodeIO();
  const document = await io.read(filePath);
  const root = document.getRoot();

  console.log('\nMeshes:');
  for (const mesh of root.listMeshes()) {
    console.log(`  Mesh: ${mesh.getName()}`);

    for (const primitive of mesh.listPrimitives()) {
      const targets = primitive.listTargets();
      if (targets.length > 0) {
        console.log(`    Morph Targets: ${targets.length}`);
        targets.forEach((target, i) => {
          const attrs = [];
          if (target.getAttribute('POSITION')) attrs.push('POSITION');
          if (target.getAttribute('NORMAL')) attrs.push('NORMAL');
          console.log(`      ${i}: ${attrs.join(', ')}`);
        });
      } else {
        console.log('    No morph targets');
      }
    }
  }

  // Check for morph target names in extras
  console.log('\nNodes:');
  for (const node of root.listNodes()) {
    const mesh = node.getMesh();
    if (mesh) {
      console.log(`  Node: ${node.getName()} -> Mesh: ${mesh.getName()}`);

      // Check weights
      const weights = mesh.getWeights();
      if (weights && weights.length > 0) {
        console.log(`    Weights: ${weights.length}`);
      }
    }
  }

  console.log('\nAnimations:');
  for (const animation of root.listAnimations()) {
    console.log(`  ${animation.getName()}`);
    for (const channel of animation.listChannels()) {
      const targetPath = channel.getTargetPath();
      const targetNode = channel.getTargetNode();
      if (targetPath === 'weights') {
        console.log(`    -> ${targetNode?.getName()}: ${targetPath} (MORPH TARGET ANIMATION)`);
      }
    }
  }
}

async function main() {
  try {
    await inspectGLB('./public/characters/autonate-talking.glb');
    await inspectGLB('./public/characters/autonate-idle.glb');
  } catch (err) {
    console.error('Error:', err.message);
  }
}

main();
