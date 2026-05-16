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
