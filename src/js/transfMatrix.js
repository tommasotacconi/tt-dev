export function getRotationMatrix(el) {
  const cs = getComputedStyle(el);
  let m = new DOMMatrix();

  if (cs.rotate && cs.rotate !== 'none') {
    const parts = cs.rotate.trim().split(/\s+/);
    const angle = parseFloat(parts[parts.length - 1]); // parseFloat strips the "deg" suffix
    const [ax, ay, az] = parts.length === 4 ? parts.slice(0, 3).map(Number) : [0, 0, 1]; // bare angle = rotation about z
    m = m.rotateAxisAngle(ax, ay, az, angle);
  }

  if (cs.transform && cs.transform !== 'none') {
    m = m.multiply(new DOMMatrix(cs.transform)); // in case both are ever combined
  }

  return m;
}

const dot3 = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const sub3 = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];

// w=1 → transforms a point (keeps any translation); w=0 → transforms a direction (ignores it)
const xformPoint = (m, x, y, z) => {
  const p = m.transformPoint(new DOMPoint(x, y, z, 1));
  return [p.x, p.y, p.z];
};
const xformVector = (m, x, y, z) => {
  const p = m.transformPoint(new DOMPoint(x, y, z, 0));
  return [p.x, p.y, p.z];
};

// transfMatrix.js
export function backendLocalToFrontendLocal({ xb, yb, zOffset, width, height, perspectiveDepth, R }) {
  const px = xb - width / 2,
    py = yb - height / 2;
  const w = 1 - zOffset / perspectiveDepth; // perspective divisor, in LOCAL frame — happens before rotation
  const Vx = px / w,
    Vy = py / w,
    Vz = zOffset / w; // locally-projected point (this is the whole answer if R were identity)

  // n = local-frame direction that becomes the screen's viewing axis once rotated.
  // Built via DOMMatrix's own .inverse() rather than hand-picking matrix rows — less room for a sign/order mistake.
  const Rinv = R.inverse();
  const n = [
    Rinv.transformPoint(new DOMPoint(0, 0, 1, 0)).x,
    Rinv.transformPoint(new DOMPoint(0, 0, 1, 0)).y,
    Rinv.transformPoint(new DOMPoint(0, 0, 1, 0)).z,
  ];

  const t = -Vz / n[2]; // slide along n until z lands back on the z=0 plane (frontend's own plane)
  return { x: Vx + t * n[0] + width / 2, y: Vy + t * n[1] + height / 2 };
}
