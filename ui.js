// Shared by every mechanism page: helpers, theme switcher, help popouts, input clamping.
const $ = id => document.getElementById(id);
const TP = 2 * Math.PI;
const val = id => parseFloat($(id).value);
const fmt = (x, d = 2) => isFinite(x) ? x.toFixed(d) : "–";

const THEMES = [["drafting", "Drafting"], ["blueprint", "Blueprint"], ["chalkboard", "Chalkboard"], ["graphite", "Graphite"]];
const THEME_KEY = "beltTheme"; // same key the belt page uses, so the choice carries across pages
function setTheme(t) {
  document.documentElement.dataset.theme = t;
  const r = document.querySelector('input[name=theme][value="' + t + '"]');
  if (r) r.checked = true;
  try { localStorage.setItem(THEME_KEY, t); } catch (e) {}
}
function initTheme() {
  const slot = $("themeSlot");
  if (slot) slot.innerHTML = `<div class="pair"><b>Theme</b><div class="seg" role="radiogroup" aria-label="Theme">${THEMES.map(([v, n]) => `<label><input type="radio" name="theme" value="${v}"><span>${n}</span></label>`).join("")}</div></div>`;
  let saved = null;
  try { saved = localStorage.getItem(THEME_KEY); } catch (e) {}
  setTheme(THEMES.some(t => t[0] === saved) ? saved : (matchMedia("(prefers-color-scheme: dark)").matches ? "blueprint" : "drafting"));
  document.querySelectorAll("input[name=theme]").forEach(r => r.addEventListener("change", () => setTheme(r.value)));
}

// Snap typed values back into each field's min/max, then call cb.
function clampInputs(sel, cb) {
  document.querySelectorAll(sel).forEach(el => el.addEventListener("change", () => {
    const lo = parseFloat(el.min), hi = parseFloat(el.max), v = parseFloat(el.value);
    if (!isFinite(v)) return;
    const c = Math.min(isFinite(hi) ? hi : Infinity, Math.max(isFinite(lo) ? lo : -Infinity, v));
    if (c !== v) { el.value = c; cb(); }
  }));
}

// Adds a "?" popout beside each labelled input. TIPS maps input id -> help text.
function initTips(TIPS) {
  const box = document.createElement("div");
  box.className = "tipbox"; box.hidden = true; document.body.appendChild(box);
  let cur = null;
  const hide = () => { box.hidden = true; cur = null; };
  const show = b => {
    box.textContent = b.dataset.tip; box.hidden = false; cur = b;
    const r = b.getBoundingClientRect(), w = box.offsetWidth, h = box.offsetHeight;
    box.style.left = Math.min(Math.max(8, r.left + r.width / 2 - w / 2), innerWidth - w - 8) + "px";
    box.style.top = (r.bottom + h + 12 > innerHeight ? r.top - h - 6 : r.bottom + 6) + "px";
  };
  for (const id in TIPS) {
    const el = $(id); if (!el) continue;
    const b = document.createElement("button");
    b.type = "button"; b.className = "tip"; b.textContent = "?"; b.dataset.tip = TIPS[id];
    b.setAttribute("aria-label", "About " + el.parentElement.firstChild.textContent.trim());
    el.before(b);
  }
  const canHover = matchMedia("(hover: hover)").matches;
  document.addEventListener("click", e => {
    const b = e.target.closest(".tip");
    if (!b) return hide();
    e.preventDefault();
    if (canHover || cur !== b) show(b); else hide();
  });
  if (canHover) document.addEventListener("mouseover", e => { const b = e.target.closest(".tip"); if (b) show(b); else if (cur) hide(); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") hide(); });
  addEventListener("scroll", hide, true);
}

initTheme();
