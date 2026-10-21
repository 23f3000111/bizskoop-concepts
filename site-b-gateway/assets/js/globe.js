/* Concept B, "Gateway": a dotted globe with pins in clients' home countries and arcs flowing into Kuala Lumpur.
   Canvas 2D, no library. BZGlobe.mount(canvas, { dots, pins: [{ lat, lng, name }], hub: { lat, lng, name }, reduced }) */
(function () {
  'use strict';
  const RAD = Math.PI / 180;
  const unit = (lat, lng) => {
    const p = lat * RAD; const l = lng * RAD;
    return [Math.cos(p) * Math.sin(l), Math.sin(p), Math.cos(p) * Math.cos(l)];
  };

  function mount(canvas, opts) {
    const ctx = canvas.getContext('2d');
    const reduced = !!opts.reduced;
    const n = opts.dots.length / 2;
    const base = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) base.set(unit(opts.dots[i * 2], opts.dots[i * 2 + 1]), i * 3);
    const hub = unit(opts.hub.lat, opts.hub.lng);
    const arcs = opts.pins.map((p, i) => {
      const a = unit(p.lat, p.lng);
      const dot = Math.max(-1, Math.min(1, a[0] * hub[0] + a[1] * hub[1] + a[2] * hub[2]));
      const w = Math.acos(dot);
      const lift = 0.06 + 0.14 * (w / Math.PI); // keeps the highest arc inside the canvas
      const pts = [];
      for (let k = 0; k <= 48; k++) {
        const t = k / 48;
        const s1 = Math.sin((1 - t) * w) / Math.sin(w);
        const s2 = Math.sin(t * w) / Math.sin(w);
        const h = 1 + lift * Math.sin(Math.PI * t);
        pts.push([(a[0] * s1 + hub[0] * s2) * h, (a[1] * s1 + hub[1] * s2) * h, (a[2] * s1 + hub[2] * s2) * h]);
      }
      return { pin: a, name: p.name, pts, offset: (i * 0.37) % 1, speed: 0.00011 + (i % 4) * 0.000012 };
    });

    let W = 0; let H = 0; let R = 0; let cx = 0; let cy = 0; let dpr = 1;
    let drag = 0; let dragging = false; let dragStart = 0; let dragBase = 0;
    let raf = 0; let visible = false;
    const tilt = 14 * RAD;
    const ct = Math.cos(tilt); const st = Math.sin(tilt);
    let cl = 1; let sl = 0;

    const rotate = (v, out) => {
      const x1 = v[0] * cl - v[2] * sl;
      const z1 = v[0] * sl + v[2] * cl;
      out[0] = x1; out[1] = v[1] * ct - z1 * st; out[2] = v[1] * st + z1 * ct;
      return out;
    };
    const tmp = [0, 0, 0];
    const out = [0, 0, 0];
    const rot = new Float32Array(n * 3);

    function size() {
      const r = canvas.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = Math.round(r.width * dpr); H = Math.round(r.height * dpr);
      canvas.width = W; canvas.height = H;
      R = Math.min(W, H) * 0.42; cx = W / 2; cy = H / 2;
    }

    function frame(time) {
      const lon0 = (opts.hub.lng - 14 + 26 * Math.sin(time * 0.00011) + drag) * RAD;
      cl = Math.cos(lon0); sl = Math.sin(lon0);
      ctx.clearRect(0, 0, W, H);

      // the sea: a soft sphere with a halo
      const halo = ctx.createRadialGradient(cx, cy, R * 0.9, cx, cy, R * 1.28);
      halo.addColorStop(0, 'rgba(74,124,191,0.20)'); halo.addColorStop(1, 'rgba(74,124,191,0)');
      ctx.fillStyle = halo; ctx.beginPath(); ctx.arc(cx, cy, R * 1.28, 0, Math.PI * 2); ctx.fill();
      const sea = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.1, cx, cy, R);
      sea.addColorStop(0, '#ffffff'); sea.addColorStop(0.55, '#eef3fb'); sea.addColorStop(1, '#d6e3f4');
      ctx.fillStyle = sea; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = 'rgba(74,124,191,0.35)'; ctx.lineWidth = 1 * dpr; ctx.stroke();

      // land dots, brighter towards the viewer (rotated once, drawn in four depth bands)
      const dotR = Math.max(1, R / 260);
      for (let i = 0; i < n; i++) {
        tmp[0] = base[i * 3]; tmp[1] = base[i * 3 + 1]; tmp[2] = base[i * 3 + 2];
        rotate(tmp, out);
        rot[i * 3] = out[0]; rot[i * 3 + 1] = out[1]; rot[i * 3 + 2] = out[2];
      }
      for (let b = 0; b < 4; b++) {
        ctx.fillStyle = `rgba(9,25,50,${0.16 + b * 0.16})`;
        ctx.beginPath();
        for (let i = 0; i < n; i++) {
          const z = rot[i * 3 + 2];
          if (z <= 0 || Math.min(3, Math.floor(z * 4)) !== b) continue;
          const s = dotR * (0.7 + z * 0.6);
          ctx.rect(cx + rot[i * 3] * R - s, cy - rot[i * 3 + 1] * R - s, s * 2, s * 2);
        }
        ctx.fill();
      }

      // arcs into Kuala Lumpur, each with a travelling highlight
      ctx.lineCap = 'round';
      for (const a of arcs) {
        const scr = a.pts.map((v) => { const p = rotate(v, [0, 0, 0]); return [cx + p[0] * R, cy - p[1] * R, p[2] > 0 || p[0] * p[0] + p[1] * p[1] > 1]; });
        ctx.strokeStyle = 'rgba(74,124,191,0.32)'; ctx.lineWidth = 1.4 * dpr;
        ctx.beginPath();
        let on = false;
        for (const [x, y, vis] of scr) { if (vis) { if (on) ctx.lineTo(x, y); else ctx.moveTo(x, y); on = true; } else on = false; }
        ctx.stroke();
        const head = reduced ? 1 : ((time * a.speed + a.offset) % 1.5);
        if (head <= 1) {
          const from = Math.max(0, head - 0.28);
          const i0 = Math.floor(from * 48); const i1 = Math.ceil(head * 48);
          for (let k = i0; k < i1; k++) {
            if (!scr[k][2] || !scr[k + 1] || !scr[k + 1][2]) continue;
            const f = (k - i0) / Math.max(1, i1 - i0);
            ctx.strokeStyle = `rgba(58,103,168,${0.15 + f * 0.85})`; ctx.lineWidth = (1.4 + f * 1.6) * dpr;
            ctx.beginPath(); ctx.moveTo(scr[k][0], scr[k][1]); ctx.lineTo(scr[k + 1][0], scr[k + 1][1]); ctx.stroke();
          }
        }
        const pp = rotate(a.pin, [0, 0, 0]);
        if (pp[2] > 0) {
          const x = cx + pp[0] * R; const y = cy - pp[1] * R;
          const pulse = reduced ? 0 : ((time * 0.0006 + a.offset) % 1);
          if (pulse) { ctx.strokeStyle = `rgba(74,124,191,${0.5 * (1 - pulse)})`; ctx.lineWidth = 1.5 * dpr; ctx.beginPath(); ctx.arc(x, y, (4 + pulse * 10) * dpr, 0, Math.PI * 2); ctx.stroke(); }
          ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(x, y, 4.2 * dpr, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = '#4A7CBF'; ctx.beginPath(); ctx.arc(x, y, 2.6 * dpr, 0, Math.PI * 2); ctx.fill();
        }
      }

      // the hub: Kuala Lumpur
      const hp = rotate(hub, [0, 0, 0]);
      const hx = cx + hp[0] * R; const hy = cy - hp[1] * R;
      const hpulse = reduced ? 0.4 : (time * 0.0005) % 1;
      ctx.fillStyle = `rgba(74,124,191,${0.35 * (1 - hpulse)})`; ctx.beginPath(); ctx.arc(hx, hy, (8 + hpulse * 18) * dpr, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(hx, hy, 8 * dpr, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#091932'; ctx.beginPath(); ctx.arc(hx, hy, 5 * dpr, 0, Math.PI * 2); ctx.fill();
      ctx.font = `600 ${12.5 * dpr}px "Plus Jakarta Sans", system-ui, sans-serif`;
      const label = opts.hub.name;
      const tw = ctx.measureText(label).width;
      const lx = hx + 14 * dpr; const ly = hy - 30 * dpr;
      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      ctx.beginPath(); ctx.roundRect(lx, ly, tw + 20 * dpr, 26 * dpr, 13 * dpr); ctx.fill();
      ctx.strokeStyle = 'rgba(9,25,50,0.12)'; ctx.lineWidth = 1 * dpr; ctx.stroke();
      ctx.fillStyle = '#091932'; ctx.fillText(label, lx + 10 * dpr, ly + 17.5 * dpr);
    }

    function loop(time) {
      frame(time);
      if (visible && !reduced) raf = requestAnimationFrame(loop);
    }
    function start() { if (raf) cancelAnimationFrame(raf); raf = requestAnimationFrame(loop); }

    size();
    frame(performance.now());
    new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      if (visible && !reduced) start(); else if (raf) { cancelAnimationFrame(raf); raf = 0; }
    }).observe(canvas);
    let rt;
    window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(() => { size(); frame(performance.now()); }, 120); });
    canvas.addEventListener('pointerdown', (e) => { dragging = true; dragStart = e.clientX; dragBase = drag; canvas.setPointerCapture(e.pointerId); });
    canvas.addEventListener('pointermove', (e) => { if (dragging) { drag = Math.max(-70, Math.min(70, dragBase - (e.clientX - dragStart) * 0.25)); if (reduced) frame(performance.now()); } });
    const end = () => { dragging = false; };
    canvas.addEventListener('pointerup', end);
    canvas.addEventListener('pointercancel', end);
    return { redraw: () => frame(performance.now()) };
  }

  window.BZGlobe = { mount };
})();
