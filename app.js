"use strict";

const pageNames = {
  overview: "Overview",
  websites: "Website security",
  domains: "Domain monitoring",
  certificates: "SSL certificates",
  uptime: "Uptime monitoring",
  passwords: "Password checker",
  training: "Awareness training",
  incidents: "Incident reports",
  reports: "Audit reports",
  assistant: "AI assistant",
  settings: "Settings"
};

const modalBackdrop = document.getElementById("modal-backdrop");
const modalTitle = document.getElementById("modal-title");
const modalBody = document.getElementById("modal-body");
const modalActions = document.getElementById("modal-actions");
const modalClose = document.getElementById("modal-close");
const toastRegion = document.getElementById("toast-region");
let lastFocusedElement = null;

function showToast(message) {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m5 12 4.5 4.5L19 7"/></svg>';
  const text = document.createElement("span");
  text.textContent = message;
  toast.append(text);
  toastRegion.append(toast);
  window.setTimeout(() => toast.remove(), 3500);
}

function closeModal() {
  modalBackdrop.hidden = true;
  document.body.style.overflow = "";
  if (lastFocusedElement) lastFocusedElement.focus();
}

function openModal(title, bodyHtml, actions, icon = "shield") {
  lastFocusedElement = document.activeElement;
  modalTitle.textContent = title;
  modalBody.innerHTML = bodyHtml;
  modalActions.replaceChildren();
  modalActions.innerHTML = actions;
  modalBackdrop.hidden = false;
  document.body.style.overflow = "hidden";
  modalClose.focus();
  modalActions.querySelectorAll("[data-close]").forEach((button) => {
    button.addEventListener("click", closeModal);
  });
  modalActions.querySelectorAll("[data-toast]").forEach((button) => {
    button.addEventListener("click", () => {
      showToast(button.dataset.toast);
      closeModal();
    });
  });
  if (icon === "alert") {
    document.getElementById("modal-icon").style.color = "#c98f3f";
    document.getElementById("modal-icon").style.background = "#fff4e3";
  } else {
    document.getElementById("modal-icon").style.color = "#399875";
    document.getElementById("modal-icon").style.background = "#eaf7f0";
  }
}

function switchPage(page) {
  const name = pageNames[page];
  if (!name) return;
  document.querySelectorAll(".nav-link[data-page]").forEach((link) => {
    link.classList.toggle("active", link.dataset.page === page);
  });
  document.getElementById("breadcrumb-current").textContent = name;
  document.getElementById("sidebar").classList.remove("menu-open");
  if (page !== "overview") {
    const copy = {
      websites: ["Website security", "Keep an eye on every site you own.", "Review your monitored websites and recent vulnerability findings."],
      domains: ["Domain monitoring", "Your domains, always on your radar.", "Track renewals, DNS changes, and important domain events."],
      certificates: ["SSL certificates", "No certificate should catch you by surprise.", "Review certificate health and upcoming expiration dates."],
      uptime: ["Uptime monitoring", "Know the moment a website needs attention.", "Review availability trends and the latest uptime checks."],
      passwords: ["Password checker", "Build stronger credentials, privately.", "Check password strength locally in your browser."],
      training: ["Awareness training", "Security-smart teams start with small habits.", "Practice spotting suspicious messages and links."],
      incidents: ["Incident reports", "A clear record helps you respond with confidence.", "Submit a security incident for your workspace."],
      reports: ["Audit reports", "A clear picture of where you stand.", "Review security findings, score changes, and recommended actions."],
      assistant: ["AI assistant", "A helpful starting point for security questions.", "Get practical security guidance for your next step."],
      settings: ["Settings", "Make CyberGuard work for your team.", "Manage your workspace preferences."]
    }[page];
    document.getElementById("page-title").textContent = copy[0];
    document.querySelector(".page-subtitle").textContent = copy[2];
    if (page === "passwords") showPasswordChecker();
    else if (page === "training") showTraining();
    else if (page === "incidents") showIncidentForm();
    else if (page === "assistant") showAssistant();
    else if (page === "reports") showReports();
    else if (page === "domains" || page === "certificates") showDomainHealth(page);
    else if (page === "uptime") showUptime();
    else if (page === "websites") showWebsiteSecurity();
    else if (page === "settings") showSettings();
  } else {
    document.getElementById("page-title").innerHTML = 'Good morning, Mish <span class="wave">✦</span>';
    document.querySelector(".page-subtitle").textContent = "Here’s your security snapshot. You’re doing great — let’s keep it that way.";
  }
  if (window.innerWidth <= 640) window.scrollTo({ top: 0, behavior: "smooth" });
}

function showPasswordChecker() {
  openModal(
    "Check a password",
    '<p>Your password is checked only in this browser. It is never sent or stored.</p><label class="field-label" for="password-field">Password to check</label><input class="modal-input" id="password-field" type="password" autocomplete="off" placeholder="Enter a password"><div class="password-meter"><span id="password-meter-fill"></span></div><div class="password-feedback" id="password-feedback">Your strength assessment will appear here.</div><ul class="password-advice"><li>Use at least 12 characters.</li><li>Avoid names, common words, or reused passwords.</li><li>Use a password manager and enable MFA.</li></ul>',
    '<button class="button button-secondary" data-close>Done</button>'
  );
  const field = document.getElementById("password-field");
  field.addEventListener("input", () => {
    const result = assessPassword(field.value);
    document.getElementById("password-meter-fill").style.width = `${result.score * 25}%`;
    document.getElementById("password-meter-fill").style.background = result.color;
    document.getElementById("password-feedback").textContent = result.message;
  });
  field.focus();
}

function assessPassword(value) {
  if (!value) return { score: 0, color: "#df8377", message: "Your strength assessment will appear here." };
  let score = 0;
  if (value.length >= 8) score++;
  if (value.length >= 12) score++;
  if (/[a-z]/.test(value) && /[A-Z]/.test(value)) score++;
  if (/\d/.test(value) && /[^A-Za-z0-9]/.test(value)) score++;
  if (/^(password|123456|qwerty|letmein)/i.test(value)) score = Math.min(score, 1);
  const ratings = [
    { color: "#df8377", message: "Weak — use a longer, unique passphrase." },
    { color: "#e5aa54", message: "Fair — make it longer and less predictable." },
    { color: "#dfba5e", message: "Getting there — add length and variety." },
    { color: "#85b779", message: "Strong — use it only for one account." },
    { color: "#42ad7c", message: "Very strong — keep it unique and stored safely." }
  ];
  return { score, ...ratings[score] };
}

function showTraining() {
  openModal(
    "Phishing awareness practice",
    '<p>Take a moment to inspect this example. In a real training module, you’ll learn to spot the signals before you click.</p><div class="phishing-card"><strong>From: IT Support &lt;helpdesk@northstarr-support.example&gt;</strong><p>URGENT: Your account will be suspended today. Confirm your password immediately to keep access: <u>northstar-verify.example</u></p></div><div class="phishing-actions"><button data-answer="suspicious">Report as suspicious</button><button data-answer="safe">Looks safe</button></div><p id="training-feedback" aria-live="polite" style="margin:10px 0 0;font-size:9px"></p>',
    '<button class="button button-secondary" data-close>Close</button>'
  );
  modalBody.querySelectorAll("[data-answer]").forEach((button) => {
    button.addEventListener("click", () => {
      const feedback = document.getElementById("training-feedback");
      if (button.dataset.answer === "suspicious") {
        feedback.textContent = "Correct. Look for urgency, an unexpected sender domain, and a link that doesn’t match the real site.";
        feedback.style.color = "#328b64";
      } else {
        feedback.textContent = "Take another look: urgent threats, unfamiliar sender addresses, and mismatched links are common warning signs.";
        feedback.style.color = "#b17c35";
      }
    });
  });
}

function showIncidentForm() {
  openModal(
    "Report a security incident",
    '<p>Describe what happened. This demo keeps the report in your browser and does not transmit it.</p><label class="field-label" for="incident-type">Incident type</label><select class="modal-select" id="incident-type"><option>Suspicious email or phishing</option><option>Account access concern</option><option>Website vulnerability</option><option>Lost or stolen device</option><option>Other</option></select><label class="field-label" for="incident-description">What happened?</label><textarea class="modal-textarea" id="incident-description" placeholder="Include what you noticed and when. Avoid entering passwords or sensitive personal information."></textarea>',
    '<button class="button button-secondary" data-close>Cancel</button><button class="button button-primary" id="submit-incident">Save report</button>',
    "alert"
  );
  document.getElementById("submit-incident").addEventListener("click", () => {
    const description = document.getElementById("incident-description").value.trim();
    if (!description) {
      document.getElementById("incident-description").focus();
      showToast("Add a short description before saving.");
      return;
    }
    closeModal();
    showToast("Incident report saved in this demo.");
  });
}

function showAssistant() {
  openModal(
    "Ask CyberGuard",
    '<p>This demo assistant offers quick security guidance. Do not enter passwords, personal information, or confidential business details.</p><label class="field-label" for="assistant-question">What would you like help with?</label><textarea class="modal-textarea" id="assistant-question" placeholder="For example: What should I fix first?"></textarea><div class="phishing-card"><strong>Suggested questions</strong><p>How can I enable MFA? &nbsp;·&nbsp; What makes a strong password? &nbsp;·&nbsp; How do I spot phishing?</p></div><div id="assistant-response" aria-live="polite"></div>',
    '<button class="button button-secondary" data-close>Close</button><button class="button button-primary" id="ask-assistant">Get guidance</button>'
  );
  document.getElementById("ask-assistant").addEventListener("click", () => {
    const question = document.getElementById("assistant-question").value.trim();
    if (!question) {
      document.getElementById("assistant-question").focus();
      return;
    }
    const response = document.getElementById("assistant-response");
    response.className = "phishing-card";
    response.textContent = "Start with the high-priority vulnerability on lumenmarket.com, then renew the pixelandpine.co certificate before it expires. Turn on MFA for important accounts and schedule a follow-up scan.";
  });
}

function showReports() {
  openModal(
    "Security audit report",
    '<p><strong>Northstar Studio · November 2026</strong></p><div class="scan-result-summary"><span class="result-score">86</span><div><strong>Good security posture</strong><span>Score improved 4.2% since last month</span></div></div><ul class="result-list"><li><i></i>4 websites monitored with 99.9% average uptime</li><li class="warn"><i></i>1 high and 2 medium findings need review</li><li class="warn"><i></i>1 SSL certificate expires in 15 days</li><li><i></i>2 vulnerabilities resolved this week</li></ul><p style="margin-top:13px;font-size:9px">This is sample dashboard data for demonstration purposes.</p>',
    '<button class="button button-secondary" data-close>Close</button><button class="button button-primary" data-toast="Audit report prepared for this demo.">Export report</button>'
  );
}

function showDomainHealth(page) {
  const title = page === "certificates" ? "SSL certificate monitoring" : "Domain monitoring";
  openModal(
    title,
    page === "certificates"
      ? '<p>Certificate status across your monitored websites.</p><ul class="result-list"><li><i></i>northstar.studio · Valid · 90 days remaining</li><li class="warn"><i></i>pixelandpine.co · Expires Dec 02, 2026 · 15 days</li><li><i></i>lumenmarket.com · Valid · 63 days remaining</li><li><i></i>cloudnine.app · Valid · 81 days remaining</li></ul><div class="phishing-card"><strong>Renewal reminder</strong><p>We recommend renewing pixelandpine.co before December 02 to avoid service disruption.</p></div>'
      : '<p>Domain renewals and watchlist. Keep registration details and DNS changes on your radar.</p><ul class="result-list"><li><i></i>northstar.studio · Renewal Dec 14, 2026</li><li><i></i>lumenmarket.com · Renewal Mar 08, 2027</li><li class="warn"><i></i>pixelandpine.co · Renewal reminder enabled</li><li><i></i>cloudnine.app · Renewal Jun 21, 2027</li></ul><div class="phishing-card"><strong>Monitoring tip</strong><p>Enable registrar lock and multi-factor authentication on your domain registrar account.</p></div>',
    '<button class="button button-secondary" data-close>Close</button><button class="button button-primary" data-toast="Monitoring preferences saved in this demo.">Manage alerts</button>'
  );
}

function showUptime() {
  openModal(
    "Uptime monitoring",
    '<p>Availability summary for the last 30 days.</p><div class="scan-result-summary"><span class="result-score">99.9</span><div><strong>All monitored sites are online</strong><span>Average uptime across 4 assets</span></div></div><ul class="result-list"><li><i></i>northstar.studio · 99.99%</li><li><i></i>lumenmarket.com · 99.87%</li><li><i></i>pixelandpine.co · 99.96%</li><li><i></i>cloudnine.app · 100%</li></ul>',
    '<button class="button button-secondary" data-close>Close</button><button class="button button-primary" data-toast="Uptime report prepared for this demo.">View report</button>'
  );
}

function showWebsiteSecurity() {
  openModal(
    "Website security overview",
    '<p>Recent results from your monitored websites.</p><ul class="result-list"><li class="warn"><i></i>lumenmarket.com · Outdated jQuery library · High</li><li class="warn"><i></i>pixelandpine.co · Missing recommended security header · Medium</li><li class="warn"><i></i>lumenmarket.com · Cookie configuration review · Medium</li><li><i></i>northstar.studio · No high-priority findings</li><li><i></i>cloudnine.app · No high-priority findings</li></ul><div class="phishing-card"><strong>Suggested first step</strong><p>Prioritize the outdated library on lumenmarket.com, then run a fresh scan after updating.</p></div>',
    '<button class="button button-secondary" data-close>Close</button><button class="button button-primary" data-toast="Findings marked for review.">Review findings</button>',
    "alert"
  );
}

function showSettings() {
  openModal(
    "Workspace settings",
    '<p>Manage your CyberGuard workspace preferences.</p><div class="phishing-card"><strong>Northstar Studio</strong><p>Business workspace · 4 monitored websites</p></div><label class="field-label" for="alert-frequency">Security summary frequency</label><select class="modal-select" id="alert-frequency"><option>Weekly summary</option><option>Daily summary</option><option>Critical alerts only</option></select><label class="field-label" for="timezone">Timezone</label><select class="modal-select" id="timezone"><option>Eastern Time (UTC−05:00)</option><option>Pacific Time (UTC−08:00)</option><option>Coordinated Universal Time (UTC)</option></select>',
    '<button class="button button-secondary" data-close>Cancel</button><button class="button button-primary" data-toast="Settings saved in this demo.">Save settings</button>'
  );
}

function runDemoScan(rawUrl) {
  let parsedUrl;
  try {
    const normalized = /^https?:\/\//i.test(rawUrl) ? rawUrl : `https://${rawUrl}`;
    parsedUrl = new URL(normalized);
  } catch {
    showToast("Enter a valid website address, such as example.com.");
    return;
  }
  if (!["http:", "https:"].includes(parsedUrl.protocol) || !parsedUrl.hostname.includes(".")) {
    showToast("Enter a valid website address, such as example.com.");
    return;
  }
  const hostname = parsedUrl.hostname.toLowerCase();
  openModal(
    "Website checkup",
    `<p>Here’s a preview of the security report for <strong>${escapeHtml(hostname)}</strong>.</p><div class="scan-result-summary"><span class="result-score">--</span><div><strong>Demo preview only</strong><span>No external scan was performed.</span></div></div><ul class="result-list"><li><i></i>Use HTTPS and keep your certificate current</li><li><i></i>Keep your site software and dependencies up to date</li><li><i></i>Review security headers and MFA settings</li></ul><p style="margin-top:13px;font-size:9px">This interface does not connect to or probe the submitted website. Connect a trusted, authorized scanning service to enable live results.</p>`,
    '<button class="button button-secondary" data-close>Close</button><button class="button button-primary" data-toast="Report preview prepared for this demo.">View report</button>'
  );
}

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (char) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[char]);
}

document.querySelectorAll("[data-page]").forEach((link) => {
  link.addEventListener("click", (event) => {
    event.preventDefault();
    switchPage(link.dataset.page);
    if (window.location.hash !== `#${link.dataset.page}`) {
      window.history.replaceState(null, "", `#${link.dataset.page}`);
    }
  });
});

document.getElementById("scan-form").addEventListener("submit", (event) => {
  event.preventDefault();
  runDemoScan(document.getElementById("scan-url").value.trim());
});

document.getElementById("report-button").addEventListener("click", showReports);
document.getElementById("assistant-button").addEventListener("click", showAssistant);
document.getElementById("add-website").addEventListener("click", () => {
  openModal(
    "Add a website",
    '<p>Add a website to your workspace. This demo does not perform live checks or save data to a server.</p><label class="field-label" for="new-website">Website address</label><input class="modal-input" id="new-website" type="url" placeholder="https://yourwebsite.com">',
    '<button class="button button-secondary" data-close>Cancel</button><button class="button button-primary" id="save-website">Add website</button>'
  );
  document.getElementById("save-website").addEventListener("click", () => {
    const value = document.getElementById("new-website").value.trim();
    if (!value) {
      document.getElementById("new-website").focus();
      return;
    }
    try {
      const url = new URL(value);
      if (!["http:", "https:"].includes(url.protocol)) throw new Error("Unsupported protocol");
      closeModal();
      showToast(`${url.hostname} is ready to add when a backend is connected.`);
    } catch {
      showToast("Enter a valid website URL beginning with https://.");
    }
  });
});

modalClose.addEventListener("click", closeModal);
modalBackdrop.addEventListener("click", (event) => {
  if (event.target === modalBackdrop) closeModal();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !modalBackdrop.hidden) closeModal();
});
document.getElementById("menu-button").addEventListener("click", () => {
  document.getElementById("sidebar").classList.toggle("menu-open");
});
document.addEventListener("click", (event) => {
  const rowMenu = event.target.closest(".row-menu");
  if (rowMenu) showToast("Website actions are available when connected to your workspace.");
});

const initialPage = window.location.hash.slice(1);
if (pageNames[initialPage] && initialPage !== "overview") switchPage(initialPage);
