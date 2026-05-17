// Hide the React Chrome overlays (brand mark, counter, dot, progress bar) inside the animation iframe
(function () {
  const frame = document.querySelector(".animation-frame");
  if (!frame) return;
  const CSS = `
    /* top-left brand mark */
    [style*="top: 36px"][style*="left: 48px"],
    /* top-right scene counter */
    [style*="top: 36px"][style*="right: 48px"],
    /* bottom-left live dot */
    [style*="bottom: 40px"][style*="left: 48px"],
    /* bottom-right progress bar */
    [style*="bottom: 40px"][style*="right: 48px"] {
      display: none !important;
    }
  `;
  function inject() {
    try {
      const doc = frame.contentDocument;
      if (!doc || !doc.head) return;
      const s = doc.createElement("style");
      s.textContent = CSS;
      doc.head.appendChild(s);
    } catch (_) {}
  }
  frame.addEventListener("load", inject);
  // Also try immediately in case already loaded (cached)
  if (frame.contentDocument && frame.contentDocument.readyState === "complete") inject();
})();

// Live stats bar — populated from facts.json
(async () => {
  const bar = document.getElementById("liveStatsBar");
  if (!bar) return;
  try {
    const res = await fetch("facts.json");
    if (!res.ok) return;
    const data = await res.json();
    const stats = data.live_stats || [];
    bar.innerHTML = stats.map((s) => `
      <div class="stat-chip">
        <span class="stat-value color-${s.color}">${s.value}</span>
        <span class="stat-label">${s.label}</span>
        <span class="stat-unit">${s.unit}</span>
      </div>
    `).join("");
  } catch (_) {
    bar.style.display = "none";
  }
})();

const form = document.getElementById("waitlistForm");

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formData = new FormData(form);
    const payload = {
      email: formData.get("email")?.toString().trim(),
      company: formData.get("company")?.toString().trim(),
      sector: formData.get("sector")?.toString().trim(),
      notes: formData.get("notes")?.toString().trim(),
    };

    const submitButton = form.querySelector("button[type='submit']");
    submitButton.disabled = true;
    submitButton.textContent = "Sending...";

    try {
      const SUPABASE_URL      = "https://mqdeppcivrysnovmacqp.supabase.co";
      const SUPABASE_ANON_KEY = "sb_publishable_uDKvirv-Crl3Kp8PjVn8PA_YDBbG4bI";

      const response = await fetch(`${SUPABASE_URL}/rest/v1/waitlist`, {
        method: "POST",
        headers: {
          "apikey": SUPABASE_ANON_KEY,
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
          "Content-Type": "application/json",
          "Prefer": "return=representation",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Unable to submit: ${response.statusText}`);
      }

      form.reset();
      alert("Thank you! Your interest has been recorded.");
    } catch (error) {
      console.error(error);
      alert("There was an issue submitting the form. Please try again later.");
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = "Reserve my spot";
    }
  });
}
