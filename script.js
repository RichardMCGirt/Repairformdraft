/* ===== Utilities ===== */
function formatMoneyInput(el){
  const raw = (el.value || "").replace(/[^0-9.]/g, "");
  if(!raw){ el.value=""; return; }
  const firstDot = raw.indexOf(".");
  const sanitized = firstDot === -1 ? raw : raw.slice(0, firstDot+1) + raw.slice(firstDot+1).replace(/\./g,"");
  const num = Number.parseFloat(sanitized);
  if(Number.isFinite(num)) el.value = num.toFixed(2);
}

function reveal(node, show){
  node.classList.toggle("hide", !show);
}

/* ===== Reveals (Prepay/CO + Commercial) ===== */
function toggleReveals(){
  const prepayYes = document.querySelector('input[name="prepay"][value="yes"]');
  const projCommercial = document.querySelector('input[name="ptype"][value="Commercial"]');

  // Always keep Pre-payment visible; only toggle its inner fields
  reveal(document.getElementById("mockCOWrap"), prepayYes && prepayYes.checked);

  
  // Commercial-only fields
  reveal(document.getElementById("commercialFields"), projCommercial && projCommercial.checked);

  // Require fields only when visible
  document.getElementById("subPayAmt").required = !!(projCommercial && projCommercial.checked);
  document.getElementById("subcontractor").required = !!(projCommercial && projCommercial.checked);
}



/* ===== Mock Change Orders =====
   - Generated whenever: Job name changes OR Pre-payment toggles to Yes.
   - Uses Job name as the theme so items "match" the job. */
function buildMockCO(job){
  const j = (job || "").trim();
  const base = j ? j : "Project";
  const items = [
    { code:"CO-001", title:`${base}: Material Upgrade`, amt: 250.00, note:"Customer requested higher-grade materials." },
    { code:"CO-002", title:`${base}: Scope Add – Extras`, amt: 175.00, note:"Additional minor repairs discovered on site." },
    { code:"CO-003", title:`${base}: Schedule Acceleration`, amt: 125.00, note:"Overtime / weekend work to meet deadline." },
    { code:"CO-004", title:`${base}: Owner Directive`, amt: 90.00, note:"Owner-directed modification to layout." }
  ];
  return items;
}

function renderCOList(items){
  const list = document.getElementById("coList");
  list.innerHTML = "";
  items.forEach(it=>{
    const card = document.createElement("div");
    card.className = "co-card";
    card.innerHTML = `
      <div style="display:flex;justify-content:space-between;gap:10px;align-items:center;margin-bottom:6px">
        <strong>${it.code}</strong>
        <span style="font-weight:700">$${it.amt.toFixed(2)}</span>
      </div>
      <div style="font-weight:600;margin-bottom:4px">${it.title}</div>
      <div class="hint">${it.note}</div>
    `;
    list.appendChild(card);
  });
}

function refreshMockCO(){
  const prepayYes = document.querySelector('input[name="prepay"][value="yes"]');
  const show = prepayYes && prepayYes.checked;
  reveal(document.getElementById("mockCOWrap"), show);
  if(!show) return;

  const job = document.getElementById("jobName").value || "";
  document.getElementById("jobMirror").textContent = job || "[Job name]";
  const items = buildMockCO(job);
  renderCOList(items);
}

/* ===== Wire-up ===== */
document.addEventListener("DOMContentLoaded", () => {
  // radio reveals
  document.querySelectorAll('input[name="prepay"], input[name="co"], input[name="ptype"]').forEach(r => {
    r.addEventListener("change", () => { toggleReveals(); refreshMockCO(); });
  });

  // update mock COs when Job name changes
  document.getElementById("jobName").addEventListener("input", refreshMockCO);

  // format $ fields on blur + basic input guards
  ["subPayAmt"].forEach(id => {
    const el = document.getElementById(id);
    el.addEventListener("blur", () => formatMoneyInput(el));
    el.addEventListener("input", () => {
      const cur = el.value;
      const ok = /^[0-9]*\.?[0-9]{0,2}$/.test(cur.replace(/[^0-9.]/g,""));
      if(!ok) el.value = cur.replace(/[^0-9.]/g,"");
    });
  });

  // initial state
  toggleReveals();
  refreshMockCO();

  // validation on submit
  document.getElementById("repairForm").addEventListener("submit", (e) => {
    const form = e.currentTarget;
    if(!form.checkValidity()){
      e.preventDefault();
      form.reportValidity();
    }
  });
});