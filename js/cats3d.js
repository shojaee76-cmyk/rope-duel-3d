/* ROPE DUEL 3D - procedural cat model: articulated rig, costume, sword. */
import * as THREE from "three";

export const PAL3D = {
  buy: {
    fur: 0xe7a95e, furDark: 0xc07c36, belly: 0xf3d9af,
    cloth: 0x1e6b45, clothLight: 0x2f8a5b, trim: 0xe8c05a, eye: 0x241608
  },
  sell: {
    fur: 0x7a8290, furDark: 0x4c525c, belly: 0xc6ccd4,
    cloth: 0x8e2b26, clothLight: 0xb5453c, trim: 0xe0b24c, eye: 0xf0d24a
  }
};

function mat(color, opts) {
  return new THREE.MeshStandardMaterial(Object.assign({
    color: color, roughness: 0.78, metalness: 0.05
  }, opts || {}));
}

function capsule(r, len, m) {
  var g = new THREE.CapsuleGeometry(r, len, 6, 12);
  var mesh = new THREE.Mesh(g, m);
  mesh.castShadow = true; mesh.receiveShadow = true;
  return mesh;
}
function sphere(r, m, sx, sy, sz) {
  var mesh = new THREE.Mesh(new THREE.SphereGeometry(r, 18, 14), m);
  mesh.scale.set(sx || 1, sy || 1, sz || 1);
  mesh.castShadow = true; mesh.receiveShadow = true;
  return mesh;
}
function box(w, h, d, m) {
  var mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
  mesh.castShadow = true; mesh.receiveShadow = true;
  return mesh;
}

export function buildCat(id, facing) {
  var P = PAL3D[id] || PAL3D.buy;
  var furM = mat(P.fur, { roughness: 0.86 });
  var darkM = mat(P.furDark, { roughness: 0.88 });
  var bellyM = mat(P.belly, { roughness: 0.9 });
  var clothM = mat(P.cloth, { roughness: 0.8 });
  var clothLtM = mat(P.clothLight, { roughness: 0.78 });
  var trimM = mat(P.trim, { roughness: 0.35, metalness: 0.85 });
  var eyeM = mat(P.eye, { roughness: 0.22, metalness: 0.1, emissive: P.eye, emissiveIntensity: 0.25 });
  var steelM = mat(0xc9d0da, { roughness: 0.24, metalness: 0.95 });

  var root = new THREE.Group();
  var rig = {};
  rig.root = root;

  /* hips pivot */
  var hips = new THREE.Group();
  hips.position.y = 0.72;
  root.add(hips);
  rig.hips = hips;

  /* torso */
  var torso = capsule(0.33, 0.52, furM);
  torso.position.y = 0.18;
  torso.scale.z = 1.12;
  hips.add(torso);

  var belly = sphere(0.24, bellyM, 0.7, 1.0, 0.8);
  belly.position.set(0.20, 0.16, 0);
  hips.add(belly);

  /* tunic over the torso */
  var tunic = capsule(0.355, 0.46, clothM);
  tunic.position.y = 0.12;
  tunic.scale.z = 1.1;
  hips.add(tunic);
  var belt = new THREE.Mesh(new THREE.TorusGeometry(0.355, 0.045, 8, 20), trimM);
  belt.rotation.x = Math.PI / 2;
  belt.position.y = 0.05;
  belt.scale.z = 1.1;
  hips.add(belt);

  /* chest */
  var chest = new THREE.Group();
  chest.position.y = 0.58;
  hips.add(chest);
  rig.chest = chest;

  /* head */
  var head = new THREE.Group();
  head.position.set(0.08, 0.30, 0);
  chest.add(head);
  rig.head = head;

  var skull = sphere(0.30, furM, 1.02, 1.0, 0.96);
  head.add(skull);
  var muzzle = sphere(0.15, bellyM, 1.25, 0.8, 0.95);
  muzzle.position.set(0.25, -0.07, 0);
  head.add(muzzle);
  var nose = sphere(0.045, mat(0xc86a72, { roughness: 0.5 }), 1, 0.8, 1);
  nose.position.set(0.40, -0.03, 0);
  head.add(nose);

  /* eyes */
  var eyeL = sphere(0.10, eyeM, 1, 1.05, 1);
  eyeL.position.set(0.23, 0.075, 0.275);
  head.add(eyeL);
  var eyeR = eyeL.clone();
  eyeR.position.z = -0.275;
  head.add(eyeR);
  rig.eyeL = eyeL; rig.eyeR = eyeR;

  /* whiskers */
  var whiskerM = mat(0xf2ead8, { roughness: 0.6, emissive: 0x2a2620, emissiveIntensity: 0.3 });
  for (var wi = 0; wi < 3; wi++) {
    [-1, 1].forEach(function (side) {
      var w = new THREE.Mesh(new THREE.CylinderGeometry(0.006, 0.004, 0.30, 4), whiskerM);
      w.position.set(0.34, -0.05 + wi * 0.035, side * 0.13);
      w.rotation.z = Math.PI / 2 - 0.15 + wi * 0.08;
      w.rotation.y = side * 0.35;
      head.add(w);
    });
  }

  /* ears */
  var earGeo = new THREE.ConeGeometry(0.145, 0.32, 4);
  var earL = new THREE.Mesh(earGeo, furM);
  earL.position.set(-0.05, 0.31, 0.185);
  earL.rotation.set(0.15, 0, -0.18);
  earL.castShadow = true;
  head.add(earL);
  var earR = earL.clone();
  earR.position.z = -0.185;
  earR.rotation.set(-0.15, 0, -0.18);
  head.add(earR);
  rig.ears = [earL, earR];

  /* headgear */
  if (id === "buy") {
    var wrap = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.10, 10, 22), clothM);
    wrap.rotation.x = Math.PI / 2;
    wrap.position.set(-0.02, 0.17, 0);
    head.add(wrap);
    var cap = sphere(0.25, clothLtM, 1.0, 0.55, 1.0);
    cap.position.set(-0.02, 0.23, 0);
    head.add(cap);
    var band = new THREE.Mesh(new THREE.TorusGeometry(0.265, 0.028, 8, 22), trimM);
    band.rotation.x = Math.PI / 2;
    band.position.set(-0.02, 0.10, 0);
    head.add(band);
    var gem = sphere(0.045, mat(0x3fd98a, { roughness: 0.2, metalness: 0.6, emissive: 0x1f7a4a, emissiveIntensity: 0.4 }), 1, 1, 0.6);
    gem.position.set(0.22, 0.11, 0);
    head.add(gem);
  } else {
    var helm = new THREE.Mesh(new THREE.SphereGeometry(0.315, 18, 12, 0, Math.PI * 2, 0, Math.PI / 2), mat(0x3a3f49, { roughness: 0.42, metalness: 0.7 }));
    helm.position.set(-0.02, 0.06, 0);
    helm.castShadow = true;
    head.add(helm);
    var brim = new THREE.Mesh(new THREE.TorusGeometry(0.345, 0.038, 8, 24), trimM);
    brim.rotation.x = Math.PI / 2;
    brim.position.set(-0.02, 0.06, 0);
    head.add(brim);
    var comb = box(0.05, 0.16, 0.52, mat(0x4a505b, { roughness: 0.4, metalness: 0.7 }));
    comb.position.set(-0.02, 0.18, 0);
    head.add(comb);
    var plume = new THREE.Mesh(new THREE.ConeGeometry(0.075, 0.46, 8), clothLtM);
    plume.position.set(-0.16, 0.22, 0);
    plume.rotation.z = 1.1;
    plume.castShadow = true;
    head.add(plume);
  }

  /* arms */
  function buildArm(z, holdsSword) {
    var shoulder = new THREE.Group();
    shoulder.position.set(0.05, 0.10, z);
    chest.add(shoulder);
    var upper = capsule(0.095, 0.26, holdsSword ? clothLtM : clothM);
    upper.position.y = -0.21;
    shoulder.add(upper);
    var elbow = new THREE.Group();
    elbow.position.y = -0.42;
    shoulder.add(elbow);
    var fore = capsule(0.085, 0.20, holdsSword ? clothM : clothLtM);
    fore.position.y = -0.17;
    elbow.add(fore);
    var hand = sphere(0.10, furM);
    hand.position.y = -0.34;
    elbow.add(hand);
    var grip = new THREE.Group();
    grip.position.y = -0.34;
    elbow.add(grip);
    return { shoulder: shoulder, elbow: elbow, hand: hand, grip: grip };
  }
  var armFront = buildArm(0.28, true);
  var armBack = buildArm(-0.28, false);
  rig.shoulder = armFront.shoulder;
  rig.elbow = armFront.elbow;
  rig.grip = armFront.grip;
  rig.shoulderBack = armBack.shoulder;
  rig.elbowBack = armBack.elbow;

  /* sword on the front hand */
  var sword = new THREE.Group();
  var blade = box(0.055, 0.95, 0.10, steelM);
  blade.position.y = 0.52;
  sword.add(blade);
  var tip = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.16, 4), steelM);
  tip.position.y = 1.06;
  tip.rotation.y = Math.PI / 4;
  sword.add(tip);
  var guard = box(0.26, 0.05, 0.09, trimM);
  guard.position.y = 0.06;
  sword.add(guard);
  var gripMesh = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.04, 0.20, 8), mat(0x3a2b20, { roughness: 0.7 }));
  gripMesh.position.y = -0.06;
  sword.add(gripMesh);
  var pommel = sphere(0.055, trimM);
  pommel.position.y = -0.17;
  sword.add(pommel);
  sword.traverse(function (o) { if (o.isMesh) o.castShadow = true; });
  armFront.grip.add(sword);
  rig.sword = sword;

  /* legs */
  function buildLeg(x, z) {
    var hip = new THREE.Group();
    hip.position.set(x, 0, z);
    hips.add(hip);
    var thigh = capsule(0.105, 0.24, furM);
    thigh.position.y = -0.22;
    hip.add(thigh);
    var knee = new THREE.Group();
    knee.position.y = -0.44;
    hip.add(knee);
    var shin = capsule(0.09, 0.22, darkM);
    shin.position.y = -0.17;
    knee.add(shin);
    var paw = sphere(0.105, bellyM, 1.25, 0.75, 1.0);
    paw.position.set(0.05, -0.32, 0);
    knee.add(paw);
    return { hip: hip, knee: knee, paw: paw };
  }
  var legF = buildLeg(0.10, 0.18);
  var legB = buildLeg(-0.06, -0.18);
  rig.legF = legF; rig.legB = legB;

  /* tail */
  var tail = new THREE.Group();
  tail.position.set(-0.30, 0.30, 0);
  tail.rotation.z = -0.5;
  hips.add(tail);
  var tailSegs = [];
  var parent = tail;
  for (var i = 0; i < 6; i++) {
    var seg = new THREE.Group();
    seg.position.y = i === 0 ? 0 : -0.17;
    var m = capsule(0.075 - i * 0.009, 0.14, i % 2 ? darkM : furM);
    m.position.y = -0.09;
    seg.add(m);
    parent.add(seg);
    parent = seg;
    tailSegs.push(seg);
  }
  rig.tail = tailSegs;

  /* face the right way: sell cat faces -X */
  if (facing === -1) root.rotation.y = Math.PI;

  root.traverse(function (o) { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });

  var baseX = 0;
  function applyPose(p, t) {
    var lean = p.lean || 0, crouch = p.crouch || 0, bob = p.bob || 0;
    root.position.x = baseX + (p.lungeX || 0) * 0.012;
    root.rotation.z = -(p.fall || 0);
    var kb = 0.20 + crouch * 0.70;
    hips.position.y = 0.72 - crouch * 0.26 + bob * 0.012 - 0.32 * (1 - Math.cos(kb));
    hips.rotation.z = -lean;
    head.rotation.z = -(p.headTilt || 0);
    head.rotation.x = Math.sin(t * 1.3) * 0.03;

    // 2D poses are authored in screen space (y down); mirror the angles for a Y-up world
    var armA = -(p.armAngle != null ? p.armAngle : -0.35);
    var bladeA = -(p.bladeAngle != null ? p.bladeAngle : -1.0);
    var bend = p.guard ? 0.72 : 0.55;
    var t1 = armA + Math.PI / 2;
    rig.shoulder.rotation.z = t1;
    rig.elbow.rotation.z = bend;
    rig.grip.rotation.z = bladeA - Math.PI / 2 - (t1 + bend);
    rig.shoulderBack.rotation.z = -0.9 + Math.sin(t * 1.7) * 0.05;
    rig.elbowBack.rotation.z = -0.8;

    rig.legF.knee.rotation.z = kb;
    rig.legB.knee.rotation.z = kb;
    rig.legF.hip.rotation.z = -crouch * 0.35;
    rig.legB.hip.rotation.z = crouch * 0.25;

    var sway = p.tail || 0;
    for (var i = 0; i < rig.tail.length; i++) {
      var s = rig.tail[i];
      s.rotation.z = (i === 0 ? -0.25 : 0.10) + Math.sin(t * 2.0 + i * 0.7) * 0.10 + sway * 0.06;
      s.rotation.x = Math.sin(t * 1.4 + i * 0.5) * 0.07;
    }

    var blink = p.eye == null ? 1 : p.eye;
    var eyeScale = Math.max(0.08, blink);
    rig.eyeL.scale.y = eyeScale;
    rig.eyeR.scale.y = eyeScale;
  }

  return { root: root, rig: rig, applyPose: applyPose, setBaseX: function (x) { baseX = x; } };
}
