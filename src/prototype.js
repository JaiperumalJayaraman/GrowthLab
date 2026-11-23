// Interactive UX concept. No real accounts, emails, analytics ingestion, or API calls.
const templates = [
  { title: "Launch a feature", icon: "🚀", desc: "Product teams", project: "Feature launch plan", task: "Define the launch goal", preview: ["Define the launch goal", "Align the team", "Draft launch checklist"] },
  { title: "Plan a sprint", icon: "◇", desc: "Engineering teams", project: "First sprint", task: "Prioritize the sprint backlog", preview: ["Prioritize the sprint backlog", "Define milestones", "Review blockers"] },
  { title: "Onboard a client", icon: "☰", desc: "Service teams", project: "Client onboarding", task: "Book a kickoff call", preview: ["Book a kickoff call", "Collect requirements", "Share next steps"] }
];
const el = (id) => document.getElementById(id);
const escapeText = (s) => String(s).replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]);
let state;

function record(event) { state.events.push({ event, elapsed_ms: Date.now() - state.startedAt, variant: state.variant }); }
function reset(variant) {
  state = { variant, step: 0, workspace: "", project: "", task: "", template: -1, invited: false, startedAt: Date.now(), events: [] };
  record("journey_started");
  render();
}
function showError(message) { el("proto-error").textContent = message; }

function content() {
  if (state.step === 0) return '<h2>Give your workspace a name.</h2><p>' +
    (state.variant === "guided" ? "Start with a simple home for your team. We will suggest a first project next." : "Your workspace is empty. Create a workspace before adding projects and tasks.") +
    '</p><label class="proto-field-label" for="workspace-input">Workspace name</label><input class="proto-input" id="workspace-input" maxlength="60" placeholder="e.g. Northstar Team" value="' + escapeText(state.workspace) + '">' +
    '<div class="proto-help">A workspace is where you and your collaborators organize projects.</div>';

  if (state.step === 1 && state.variant === "control") return '<h2>Create your first project.</h2><p>Your workspace is ready. Start from a blank project, then create your first task.</p>' +
    '<label class="proto-field-label" for="project-input">Project name</label><input class="proto-input" id="project-input" maxlength="60" placeholder="What will your team work on?" value="' + escapeText(state.project) + '">' +
    '<div class="proto-help">You need to decide how to structure your project before you can get started.</div>';

  if (state.step === 1) return '<h2>Start from something familiar.</h2><p>Pick a starting point. You can customize everything later.</p><div class="proto-template-grid">' +
    templates.map((t, i) => '<button type="button" data-template="' + i + '" class="proto-template' + (state.template === i ? ' active' : '') + '" aria-pressed="' + (state.template === i) + '"><span class="proto-template-icon">' + t.icon + '</span><span><strong>' + t.title + '</strong><small>' + t.desc + '</small></span></button>').join("") +
    '</div>' + (state.template === -1 ? '<div class="proto-help">Choose a template to see your first steps. You can still start from scratch.</div>' :
    '<div class="proto-preview"><strong>Your project will start with:</strong><ul>' + templates[state.template].preview.map((v) => "<li>" + escapeText(v) + "</li>").join("") + '</ul></div>') +
    '<button type="button" class="proto-text-button" id="skip-template" style="margin-top:12px;border:0;background:none;color:#6c5ada;padding:5px 0;font-size:11px;font-weight:700">Start with a blank project instead →</button>';

  if (state.step === 2) return '<h2>Make your first task.</h2><p>' +
    (state.variant === "guided" && state.template >= 0 ? "Here is a useful first action. Rename it to fit your team's goal." : "Think of the first action your team should take and give it a name.") +
    '</p><label class="proto-field-label" for="task-input">First task title</label><input class="proto-input" id="task-input" maxlength="90" placeholder="e.g. Write the first project brief" value="' + escapeText(state.task) + '">' +
    '<div class="proto-example">Workspace: ' + escapeText(state.workspace) + ' &nbsp; / &nbsp; Project: ' + escapeText(state.project) + '</div>';

  return '<div class="proto-success"><div class="proto-success-icon">✓</div><h2>You reached first value.</h2><p>Your first task exists in the demo workspace. This is the moment GrowthLab calls <strong>activation</strong>.</p>' +
    '<div class="proto-success-summary"><strong>' + escapeText(state.workspace) + '</strong> → ' + escapeText(state.project) + ' → ' + escapeText(state.task) + '</div>' +
    '<button type="button" id="invite-button"' + (state.invited ? ' disabled' : '') + '>' + (state.invited ? '✓ Invitation step simulated' : '+ Simulate inviting a teammate (optional)') + '</button>' +
    '<div class="proto-help">No invitation is sent. This action only adds an event to the in-session trace.</div></div>';
}

function renderTrace() {
  el("proto-event-list").innerHTML = state.events.map((r) =>
    '<li>' + escapeText(r.event.replaceAll("_", " ")) + '<span>+' + (r.elapsed_ms / 1000).toFixed(1) + 's</span></li>'
  ).join("");
}
function render() {
  el("variant-control").classList.toggle("active", state.variant === "control");
  el("variant-guided").classList.toggle("active", state.variant === "guided");
  el("variant-control").setAttribute("aria-pressed", String(state.variant === "control"));
  el("variant-guided").setAttribute("aria-pressed", String(state.variant === "guided"));
  el("proto-progress-label").textContent = state.step === 3 ? "FIRST VALUE REACHED" : "STEP " + (state.step + 1) + " OF 3";
  el("proto-progress-caption").textContent = ["Workspace", "First project", "First task", "Activated"][state.step];
  el("proto-progress-fill").style.width = ((state.step + (state.step === 3 ? 0 : 1)) / 3 * 100) + "%";
  el("proto-stage").innerHTML = content();
  el("proto-actions").innerHTML = state.step === 3
    ? '<button type="button" class="proto-action ghost" id="proto-restart">↺ Start over</button><a href="./index.html#experiments" class="proto-action" style="text-decoration:none;text-align:center">See experiment readout ↗</a>'
    : (state.step ? '<button class="proto-action ghost" type="button" id="proto-previous">← Back</button>' : '<span></span>') +
      '<button class="proto-action" type="button" id="proto-next">' + (state.step === 2 ? "Create first task →" : "Continue →") + '</button>';
  showError("");

  const workspace = el("workspace-input");
  if (workspace) { workspace.addEventListener("input", (e) => { state.workspace = e.target.value; }); workspace.addEventListener("keydown", enterNext); }
  const project = el("project-input");
  if (project) { project.addEventListener("input", (e) => { state.project = e.target.value; }); project.addEventListener("keydown", enterNext); }
  const task = el("task-input");
  if (task) { task.addEventListener("input", (e) => { state.task = e.target.value; }); task.addEventListener("keydown", enterNext); }
  document.querySelectorAll("[data-template]").forEach((button) => button.addEventListener("click", () => {
    state.template = Number(button.dataset.template);
    state.project = templates[state.template].project;
    state.task = templates[state.template].task;
    render();
  }));
  if (el("skip-template")) el("skip-template").addEventListener("click", () => {
    state.variant = "control";
    state.template = -1;
    record("opted_for_blank_project");
    render();
  });
  if (el("proto-previous")) el("proto-previous").addEventListener("click", () => { state.step -= 1; render(); });
  if (el("proto-next")) el("proto-next").addEventListener("click", advance);
  if (el("proto-restart")) el("proto-restart").addEventListener("click", () => reset(state.variant));
  if (el("invite-button")) el("invite-button").addEventListener("click", () => {
    state.invited = true;
    record("teammate_invite_simulated");
    render();
  });
  renderTrace();
}
function enterNext(e) { if (e.key === "Enter") { e.preventDefault(); advance(); } }
function advance() {
  if (state.step === 0) {
    if (!state.workspace.trim()) { showError("Name your workspace to continue."); return; }
    state.workspace = state.workspace.trim();
    record("workspace_created");
  } else if (state.step === 1) {
    if (state.variant === "guided" && state.template < 0) { showError("Choose a template or start with a blank project."); return; }
    if (!state.project.trim()) { showError("Give your first project a name."); return; }
    state.project = state.project.trim();
    record("first_project_created");
  } else if (state.step === 2) {
    if (!state.task.trim()) { showError("Add your first task to reach activation."); return; }
    state.task = state.task.trim();
    record("first_task_created");
  }
  state.step = Math.min(3, state.step + 1);
  render();
}
function exportTrace() {
  const data = JSON.stringify({ data_type: "local UX walkthrough", purpose: "demonstration only", ...state, startedAt: new Date(state.startedAt).toISOString() }, null, 2);
  const url = URL.createObjectURL(new Blob([data], { type: "application/json" }));
  const a = document.createElement("a"); a.href = url; a.download = "growthlab-onboarding-walkthrough.json";
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
el("variant-control").addEventListener("click", () => reset("control"));
el("variant-guided").addEventListener("click", () => reset("guided"));
el("proto-export").addEventListener("click", exportTrace);
reset("control");
