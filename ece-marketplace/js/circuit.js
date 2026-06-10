// ============================================
// ECE HUB — CIRCUIT BOARD CANVAS ANIMATION
// ============================================

(function () {
  const canvas = document.getElementById('circuit-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, nodes, lines, pulses;

  function resize() {
    W = canvas.width = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
    init();
  }

  function init() {
    nodes = [];
    lines = [];
    pulses = [];

    const count = Math.floor((W * H) / 14000);
    for (let i = 0; i < count; i++) {
      nodes.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 2 + 1,
        alpha: Math.random() * 0.5 + 0.3,
      });
    }

    // Connect nearby nodes
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].x - nodes[j].x;
        const dy = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 180) {
          lines.push({ a: i, b: j, alpha: (1 - dist / 180) * 0.3 });
        }
      }
    }

    // Spawn initial pulses
    for (let i = 0; i < 8; i++) spawnPulse();
  }

  function spawnPulse() {
    if (lines.length === 0) return;
    const line = lines[Math.floor(Math.random() * lines.length)];
    pulses.push({
      line,
      t: Math.random(),
      speed: 0.003 + Math.random() * 0.004,
      dir: Math.random() > 0.5 ? 1 : -1,
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Lines
    for (const l of lines) {
      const a = nodes[l.a], b = nodes[l.b];
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.strokeStyle = `rgba(59, 130, 246, ${l.alpha})`;
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }

    // Nodes
    for (const n of nodes) {
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(96, 165, 250, ${n.alpha})`;
      ctx.fill();
    }

    // Pulses
    for (const p of pulses) {
      const a = nodes[p.line.a], b = nodes[p.line.b];
      const x = a.x + (b.x - a.x) * p.t;
      const y = a.y + (b.y - a.y) * p.t;

      const grad = ctx.createRadialGradient(x, y, 0, x, y, 6);
      grad.addColorStop(0, 'rgba(245, 158, 11, 0.95)');
      grad.addColorStop(1, 'rgba(245, 158, 11, 0)');
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      p.t += p.speed * p.dir;
      if (p.t >= 1 || p.t <= 0) {
        p.dir *= -1;
        p.t = Math.max(0, Math.min(1, p.t));
        // Occasionally redirect to new line
        if (Math.random() < 0.3) {
          p.line = lines[Math.floor(Math.random() * lines.length)];
          p.t = p.dir === 1 ? 0 : 1;
        }
      }
    }

    // Spawn new pulses occasionally
    if (Math.random() < 0.01 && pulses.length < 20) spawnPulse();

    requestAnimationFrame(draw);
  }

  window.addEventListener('resize', () => {
    clearTimeout(window._resizeTimer);
    window._resizeTimer = setTimeout(resize, 200);
  });

  resize();
  draw();
})();
