(() => {
  const WEB3FORMS_ACCESS_KEY = "438d1b22-4f78-4302-b4e8-f9651f9350e0";

  // ===== Reveal on scroll =====
  function initReveal() {
    const els = Array.from(document.querySelectorAll("[data-reveal]"));
    if (!("IntersectionObserver" in window)) {
      els.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          en.target.classList.add("is-visible");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12 });
    els.forEach((el) => io.observe(el));
  }

  // ===== Connect panel =====
  function initConnectPanel() {
    const btn = document.getElementById("connect-btn");
    const panel = document.getElementById("panel");
    const scrim = document.getElementById("scrim");
    const closeBtn = document.getElementById("panel-close");

    const open = () => {
      panel.classList.add("is-open");
      scrim.classList.add("is-open");
    };
    const close = () => {
      panel.classList.remove("is-open");
      scrim.classList.remove("is-open");
    };

    btn.addEventListener("click", open);
    closeBtn.addEventListener("click", close);
    scrim.addEventListener("click", close);
  }

  // ===== Contact form (Web3Forms) =====
  function initContactForm() {
    const form = document.getElementById("contact-form");
    const errorEl = document.getElementById("form-error");
    const submitBtn = document.getElementById("form-submit");
    const successEl = document.getElementById("form-success");

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      errorEl.hidden = true;
      submitBtn.disabled = true;
      submitBtn.textContent = "Sending…";

      const data = new FormData(form);
      data.append("access_key", WEB3FORMS_ACCESS_KEY);
      data.append("subject", "New portfolio contact from " + (data.get("name") || ""));
      data.append("from_name", "Portfolio — Bhargav N V");

      try {
        const res = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          body: data,
        });
        const json = await res.json();
        if (json.success) {
          form.hidden = true;
          successEl.hidden = false;
        } else {
          errorEl.textContent = json.message || "Something went wrong. Please try again.";
          errorEl.hidden = false;
          submitBtn.disabled = false;
          submitBtn.textContent = "Send";
        }
      } catch (err) {
        errorEl.textContent = "Network error. Please try again.";
        errorEl.hidden = false;
        submitBtn.disabled = false;
        submitBtn.textContent = "Send";
      }
    });
  }

  // ===== Animated particle network background =====
  function initBackground() {
    const canvas = document.getElementById("bg-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const mouse = { x: -9999, y: -9999 };
    let W = 0, H = 0, particles = [], linkDist = 150;
    let raf = null;

    const onMove = (e) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    window.addEventListener("mousemove", onMove);

    function initParticles() {
      const isMobile = W < 768;
      let count = Math.round((W * H) / 15000);
      count = Math.min(count, isMobile ? 46 : 120);
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * W,
          y: Math.random() * H,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          r: Math.random() * 1.8 + 1.1,
        });
      }
      linkDist = isMobile ? 110 : 150;
    }

    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = window.innerWidth;
      H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initParticles();
    }

    function frame() {
      ctx.clearRect(0, 0, W, H);
      const P = particles, ld = linkDist, ld2 = ld * ld;
      const mx = mouse.x, my = mouse.y, mr = 190, mr2 = mr * mr;

      for (const p of P) {
        const dxm = p.x - mx, dym = p.y - my, dm2 = dxm * dxm + dym * dym;
        if (dm2 < mr2 && dm2 > 0.01) {
          const f = (1 - dm2 / mr2) * 0.4;
          const dm = Math.sqrt(dm2);
          p.vx += (dxm / dm) * f * 0.06;
          p.vy += (dym / dm) * f * 0.06;
        }
        p.vx *= 0.995; p.vy *= 0.995;
        p.x += p.vx; p.y += p.vy;
        if (p.x < -20) p.x = W + 20; if (p.x > W + 20) p.x = -20;
        if (p.y < -20) p.y = H + 20; if (p.y > H + 20) p.y = -20;
      }

      ctx.lineWidth = 1;
      for (let i = 0; i < P.length; i++) {
        for (let j = i + 1; j < P.length; j++) {
          const a = P[i], b = P[j];
          const dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy;
          if (d2 < ld2) {
            const al = (1 - d2 / ld2) * 0.28;
            ctx.strokeStyle = "rgba(29,185,84," + al.toFixed(3) + ")";
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      if (mx > -1000) {
        for (const p of P) {
          const dx = p.x - mx, dy = p.y - my, d2 = dx * dx + dy * dy;
          if (d2 < mr2) {
            const al = (1 - d2 / mr2) * 0.5;
            ctx.strokeStyle = "rgba(30,215,96," + al.toFixed(3) + ")";
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(mx, my);
            ctx.stroke();
          }
        }
      }

      ctx.shadowColor = "rgba(29,185,84,0.9)";
      for (const p of P) {
        ctx.shadowBlur = 8;
        ctx.fillStyle = "#1DB954";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      raf = requestAnimationFrame(frame);
    }

    resize();
    window.addEventListener("resize", resize);
    frame();
  }

  document.addEventListener("DOMContentLoaded", () => {
    initReveal();
    initConnectPanel();
    initContactForm();
    initBackground();
  });
})();
