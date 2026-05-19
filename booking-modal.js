/**
 * booking-modal.js — Ramika Safaris
 * Global booking modal. Import this on any page.
 * Usage:
 *   import { openBookingModal } from './booking-modal.js';
 *   openBookingModal({ tourName: 'Kitulo Safari', priceDisplay: '$120' });
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SB_URL = "https://tmqxjnegtiuircaxqkof.supabase.co";
const SB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRtcXhqbmVndGl1aXJjYXhxa29mIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTczMTIwNTEsImV4cCI6MjA3Mjg4ODA1MX0.Mx-7VrVhR5kxiKwpuBVHyKy1LO278Z3EbcAqWLXX8Yk";
const supabase = createClient(SB_URL, SB_KEY);

const esc = s => (s||'').replace(/[&<>'"]/g, t => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[t]||t));

// ── Inject styles once ────────────────────────────────────────────────────────
function injectStyles() {
  if (document.getElementById('__bm-styles')) return;
  const style = document.createElement('style');
  style.id = '__bm-styles';
  style.textContent = `
/* ── BOOKING MODAL ── */
#__bm-overlay {
  position: fixed; inset: 0; z-index: 9800;
  background: rgba(0,0,0,0.55);
  backdrop-filter: blur(3px);
  display: flex; align-items: center; justify-content: center;
  padding: 16px;
  opacity: 0; transition: opacity 0.22s ease;
  pointer-events: none;
}
#__bm-overlay.bm-open {
  opacity: 1; pointer-events: all;
}
#__bm-box {
  background: #fff;
  border-radius: 18px;
  width: 100%; max-width: 480px;
  max-height: 92vh;
  overflow-y: auto;
  box-shadow: 0 24px 64px rgba(0,0,0,0.22);
  transform: translateY(16px) scale(0.98);
  transition: transform 0.22s ease;
  scrollbar-width: thin;
  scrollbar-color: #e5e7eb transparent;
}
#__bm-overlay.bm-open #__bm-box {
  transform: translateY(0) scale(1);
}
.bm-head {
  background: linear-gradient(135deg, #1a6644 0%, #124d33 100%);
  padding: 24px 24px 20px;
  position: relative;
  border-radius: 18px 18px 0 0;
}
.bm-head-top {
  display: flex; align-items: flex-start; justify-content: space-between; gap: 12px;
}
.bm-close {
  width: 32px; height: 32px; border-radius: 50%;
  background: rgba(255,255,255,0.15); border: none;
  display: flex; align-items: center; justify-content: center;
  color: rgba(255,255,255,0.9); cursor: pointer; flex-shrink: 0;
  transition: background 0.15s; margin-top: -2px;
}
.bm-close:hover { background: rgba(255,255,255,0.25); }
.bm-eyebrow {
  font-size: 10px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.12em; color: rgba(255,255,255,0.6); margin-bottom: 4px;
}
.bm-tour-name {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 20px; font-weight: 600; color: #fff; line-height: 1.25;
}
.bm-price-row {
  display: flex; align-items: baseline; gap: 4px; margin-top: 10px;
}
.bm-price-from { font-size: 11px; color: rgba(255,255,255,0.6); }
.bm-price-val  { font-size: 22px; font-weight: 700; color: #fff; }
.bm-price-per  { font-size: 12px; color: rgba(255,255,255,0.6); }

/* Steps indicator */
.bm-steps {
  display: flex; align-items: center; gap: 0;
  padding: 16px 24px 0;
}
.bm-step {
  display: flex; flex-direction: column; align-items: center; gap: 4px; flex: 1;
}
.bm-step-dot {
  width: 26px; height: 26px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-size: 11px; font-weight: 700;
  border: 2px solid #e5e7eb; color: #9ca3af; background: #fff;
  transition: all 0.2s;
}
.bm-step.active   .bm-step-dot { border-color: #1a6644; color: #1a6644; background: #eef7f2; }
.bm-step.done     .bm-step-dot { border-color: #1a6644; background: #1a6644; color: #fff; }
.bm-step-label { font-size: 10px; font-weight: 600; color: #9ca3af; text-align: center; }
.bm-step.active .bm-step-label, .bm-step.done .bm-step-label { color: #1a6644; }
.bm-step-line { flex: 1; height: 2px; background: #e5e7eb; margin-bottom: 18px; transition: background 0.2s; }
.bm-step-line.done { background: #1a6644; }

.bm-body { padding: 20px 24px 24px; }

/* Form fields */
.bm-ff { display: flex; flex-direction: column; gap: 5px; margin-bottom: 12px; }
.bm-ff label {
  font-size: 11px; font-weight: 700; color: #374151;
  text-transform: uppercase; letter-spacing: 0.04em;
}
.bm-ff input, .bm-ff select, .bm-ff textarea {
  width: 100%; padding: 10px 13px;
  border: 1.5px solid #e5e7eb; border-radius: 8px;
  font-size: 14px; color: #111827; background: #fff;
  font-family: inherit; outline: none; appearance: none;
  transition: border-color 0.15s, box-shadow 0.15s;
}
.bm-ff input:focus, .bm-ff select:focus, .bm-ff textarea:focus {
  border-color: #1a6644; box-shadow: 0 0 0 3px rgba(26,102,68,0.1);
}
.bm-ff input.err, .bm-ff select.err { border-color: #c0392b; box-shadow: 0 0 0 3px rgba(192,57,43,0.1); }
.bm-ff textarea { resize: none; height: 72px; }
.bm-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
@media (max-width: 400px) { .bm-row { grid-template-columns: 1fr; } }

.bm-tour-selector {
  background: #f9fafb; border: 1.5px solid #e5e7eb; border-radius: 10px;
  padding: 12px 14px; margin-bottom: 16px;
  display: flex; align-items: center; gap: 10px;
}
.bm-tour-selector svg { color: #1a6644; flex-shrink: 0; }
.bm-tour-selector span { font-size: 14px; font-weight: 600; color: #111827; flex: 1; }
.bm-change-tour {
  font-size: 12px; color: #1a6644; font-weight: 600; background: none;
  border: none; cursor: pointer; padding: 2px 0; text-decoration: underline;
}

/* Select tour dropdown in step 1 */
.bm-tour-list {
  display: flex; flex-direction: column; gap: 8px; margin-bottom: 16px;
  max-height: 260px; overflow-y: auto;
  scrollbar-width: thin; scrollbar-color: #e5e7eb transparent;
}
.bm-tour-option {
  display: flex; align-items: center; gap: 12px;
  padding: 10px 12px; border: 1.5px solid #e5e7eb; border-radius: 10px;
  cursor: pointer; transition: all 0.15s; background: #fff;
}
.bm-tour-option:hover { border-color: #1a6644; background: #eef7f2; }
.bm-tour-option.selected { border-color: #1a6644; background: #eef7f2; }
.bm-tour-thumb {
  width: 52px; height: 40px; border-radius: 6px; object-fit: cover;
  background: #e5e7eb; flex-shrink: 0;
}
.bm-tour-info { flex: 1; min-width: 0; }
.bm-tour-info h4 { font-size: 13px; font-weight: 600; color: #111827; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.bm-tour-info span { font-size: 12px; color: #6b7280; }
.bm-radio { width: 18px; height: 18px; border: 2px solid #e5e7eb; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; transition: border-color 0.15s; }
.bm-tour-option.selected .bm-radio { border-color: #1a6644; }
.bm-radio-dot { width: 8px; height: 8px; border-radius: 50%; background: #1a6644; display: none; }
.bm-tour-option.selected .bm-radio-dot { display: block; }

/* Buttons */
.bm-btn {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  width: 100%; padding: 12px 20px; border: none; border-radius: 9px;
  font-size: 14px; font-weight: 600; font-family: inherit; cursor: pointer;
  transition: background 0.15s;
}
.bm-btn-primary { background: #1a6644; color: #fff; }
.bm-btn-primary:hover { background: #124d33; }
.bm-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
.bm-btn-ghost {
  background: transparent; color: #374151;
  border: 1.5px solid #e5e7eb; margin-top: 8px;
}
.bm-btn-ghost:hover { border-color: #1a6644; color: #1a6644; background: #eef7f2; }
.bm-btn-row { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }

/* Security note */
.bm-note {
  display: flex; align-items: center; gap: 6px;
  font-size: 11px; color: #9ca3af; margin-top: 10px; text-align: center;
  justify-content: center;
}
.bm-note svg { color: #1a6644; flex-shrink: 0; }

/* Success screen */
.bm-success { text-align: center; padding: 8px 0 12px; }
.bm-success-icon {
  width: 64px; height: 64px; background: #eef7f2; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  margin: 0 auto 16px; color: #1a6644;
}
.bm-success h3 {
  font-family: 'Playfair Display', Georgia, serif;
  font-size: 22px; font-weight: 600; color: #111827; margin-bottom: 6px;
}
.bm-success p { font-size: 14px; color: #6b7280; margin-bottom: 20px; line-height: 1.6; }
.bm-ref {
  display: inline-block; background: #f3f4f6; border-radius: 8px;
  padding: 6px 14px; font-size: 12px; font-weight: 700;
  letter-spacing: 0.06em; color: #374151; margin-bottom: 20px;
}
.bm-details-grid {
  background: #f9fafb; border-radius: 10px; padding: 14px;
  text-align: left; margin-bottom: 20px;
}
.bm-det-row {
  display: flex; justify-content: space-between; align-items: center;
  font-size: 13px; padding: 6px 0; border-bottom: 1px solid #f3f4f6;
}
.bm-det-row:last-child { border-bottom: none; }
.bm-det-row span { color: #6b7280; }
.bm-det-row strong { color: #111827; text-align: right; }
.bm-wa-btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  width: 100%; padding: 11px 20px; background: #25d366; color: #fff;
  border: none; border-radius: 9px; font-size: 14px; font-weight: 600;
  cursor: pointer; text-decoration: none; font-family: inherit;
  margin-bottom: 8px;
}
.bm-wa-btn:hover { background: #1ebe5a; }
@keyframes __bm-spin { 0%{transform:rotate(0deg)} 100%{transform:rotate(360deg)} }
.bm-spinner {
  display: inline-block; width: 14px; height: 14px;
  border: 2px solid rgba(255,255,255,0.35); border-top-color: #fff;
  border-radius: 50%; animation: __bm-spin 0.7s linear infinite;
}
  `;
  document.head.appendChild(style);
}

// ── Toast helper (if page doesn't have one) ───────────────────────────────────
function showToast(msg, type = 'info', dur = 4000) {
  let root = document.getElementById('toast-root');
  if (!root) {
    root = document.createElement('div');
    root.id = 'toast-root';
    root.style.cssText = 'position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:9999;display:flex;flex-direction:column;align-items:center;gap:10px;pointer-events:none;';
    document.body.appendChild(root);
  }
  const el = document.createElement('div');
  const colors = { success:'#f0fdf4;border:1px solid #86efac;color:#166534', error:'#fef2f2;border:1px solid #fca5a5;color:#c0392b', warning:'#fefce8;border:1px solid #fde68a;color:#7a4f00', info:'#eff6ff;border:1px solid #bfdbfe;color:#1e40af' };
  el.style.cssText = `padding:10px 18px;border-radius:8px;font-size:13px;font-weight:500;max-width:340px;text-align:center;opacity:0;transform:translateY(8px);transition:opacity .25s,transform .25s;box-shadow:0 4px 12px rgba(0,0,0,.12);background:${colors[type]||colors.info};pointer-events:all;font-family:inherit;`;
  el.textContent = msg;
  root.appendChild(el);
  requestAnimationFrame(() => { el.style.opacity = '1'; el.style.transform = 'translateY(0)'; });
  setTimeout(() => { el.style.opacity = '0'; el.style.transform = 'translateY(8px)'; setTimeout(() => el.remove(), 300); }, dur);
}

// ── State ─────────────────────────────────────────────────────────────────────
let _tours = null;
let _step = 1; // 1=select tour, 2=details, 3=success
let _selected = null; // { id, name, price_usd, price, image_url }
let _overlay = null;

async function fetchTours() {
  if (_tours) return _tours;
  const { data } = await supabase.from('activities').select('id,name,price,price_usd,image_url').order('created_at', { ascending: false });
  _tours = data || [];
  return _tours;
}

function fmtUSD(val) {
  const n = parseFloat(val);
  if (!val || isNaN(n) || n === 0) return 'Contact us';
  return '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

// ── Build overlay DOM ─────────────────────────────────────────────────────────
function buildOverlay() {
  const el = document.createElement('div');
  el.id = '__bm-overlay';
  el.innerHTML = `<div id="__bm-box"></div>`;
  document.body.appendChild(el);
  // Close on backdrop click
  el.addEventListener('click', e => { if (e.target === el) closeModal(); });
  // Close on Escape
  document.addEventListener('keydown', onKey);
  return el;
}

function onKey(e) {
  if (e.key === 'Escape') closeModal();
}

function closeModal() {
  if (!_overlay) return;
  _overlay.classList.remove('bm-open');
  setTimeout(() => {
    _overlay.remove();
    _overlay = null;
    document.removeEventListener('keydown', onKey);
    document.body.style.overflow = '';
  }, 240);
}

function stepDots(step) {
  const steps = ['Tour', 'Details', 'Done'];
  const lines = [false, step >= 2, step >= 3];
  return `
    <div class="bm-steps">
      ${steps.map((s, i) => `
        ${i > 0 ? `<div class="bm-step-line${step > i ? ' done' : ''}"></div>` : ''}
        <div class="bm-step${step === i+1 ? ' active' : step > i+1 ? ' done' : ''}">
          <div class="bm-step-dot">
            ${step > i+1
              ? `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>`
              : i+1}
          </div>
          <div class="bm-step-label">${s}</div>
        </div>`).join('')}
    </div>`;
}

// ── STEP 1: Choose tour ───────────────────────────────────────────────────────
async function renderStep1(preselected) {
  const box = document.getElementById('__bm-box');
  box.innerHTML = `
    <div class="bm-head">
      <div class="bm-head-top">
        <div>
          <p class="bm-eyebrow">Ramika Safaris · Tanzania</p>
          <p class="bm-tour-name">Book a Safari</p>
        </div>
        <button class="bm-close" id="__bm-close" aria-label="Close">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    </div>
    ${stepDots(1)}
    <div class="bm-body">
      <p style="font-size:13px;color:#6b7280;margin-bottom:14px;">Choose the tour you'd like to book:</p>
      <div class="bm-tour-list" id="__bm-tour-list">
        <div style="text-align:center;padding:24px;color:#9ca3af;font-size:13px;">
          <div class="bm-spinner" style="border-color:rgba(26,102,68,0.2);border-top-color:#1a6644;margin:0 auto 8px;"></div>
          Loading tours…
        </div>
      </div>
      <button class="bm-btn bm-btn-primary" id="__bm-next1" disabled>
        Continue
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </button>
    </div>`;

  document.getElementById('__bm-close').addEventListener('click', closeModal);

  const tours = await fetchTours();
  const list  = document.getElementById('__bm-tour-list');

  if (!tours.length) {
    list.innerHTML = `<div style="text-align:center;padding:20px;color:#9ca3af;font-size:13px;">No tours available</div>`;
    return;
  }

  const SB_STORAGE = `${SB_URL}/storage/v1/object/public/tour-images/`;

  list.innerHTML = tours.map(t => {
    let img = t.image_url;
    if (img && !img.startsWith('http')) img = SB_STORAGE + img;
    if (!img) img = `https://via.placeholder.com/80x60/1a6644/fff?text=${encodeURIComponent(t.name.slice(0,2))}`;
    const price = fmtUSD(t.price_usd ?? t.price);
    const isPreselected = preselected && t.name === preselected;
    return `
      <div class="bm-tour-option${isPreselected ? ' selected' : ''}" data-id="${t.id}" data-name="${esc(t.name)}" data-price="${esc(price)}">
        <img class="bm-tour-thumb" src="${esc(img)}" alt="${esc(t.name)}" onerror="this.src='https://via.placeholder.com/80x60/1a6644/fff?text=Tour'">
        <div class="bm-tour-info">
          <h4>${esc(t.name)}</h4>
          <span>${price === 'Contact us' ? 'Price on request' : `From ${price} / person`}</span>
        </div>
        <div class="bm-radio"><div class="bm-radio-dot"></div></div>
      </div>`;
  }).join('');

  // Set initial selection
  if (preselected) {
    const pre = tours.find(t => t.name === preselected);
    if (pre) {
      _selected = pre;
      document.getElementById('__bm-next1').disabled = false;
    }
  }

  list.querySelectorAll('.bm-tour-option').forEach(opt => {
    opt.addEventListener('click', () => {
      list.querySelectorAll('.bm-tour-option').forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      const id = parseInt(opt.dataset.id);
      _selected = tours.find(t => t.id === id);
      document.getElementById('__bm-next1').disabled = false;
    });
  });

  document.getElementById('__bm-next1').addEventListener('click', () => {
    if (_selected) renderStep2();
  });
}

// ── STEP 2: Fill details ──────────────────────────────────────────────────────
function renderStep2() {
  const box = document.getElementById('__bm-box');
  const price = fmtUSD(_selected.price_usd ?? _selected.price);

  // Restore saved info from localStorage
  let saved = {};
  try { saved = JSON.parse(localStorage.getItem('rs_ud') || '{}'); } catch(e) {}

  const minDate = new Date(); minDate.setDate(minDate.getDate() + 1);
  const minStr  = minDate.toISOString().split('T')[0];

  box.innerHTML = `
    <div class="bm-head">
      <div class="bm-head-top">
        <div>
          <p class="bm-eyebrow">Step 2 of 2 · Your Details</p>
          <p class="bm-tour-name">${esc(_selected.name)}</p>
        </div>
        <button class="bm-close" id="__bm-close" aria-label="Close">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      ${price !== 'Contact us' ? `
      <div class="bm-price-row">
        <span class="bm-price-from">From</span>
        <span class="bm-price-val">${esc(price)}</span>
        <span class="bm-price-per">/ person</span>
      </div>` : ''}
    </div>
    ${stepDots(2)}
    <div class="bm-body">
      <div class="bm-row">
        <div class="bm-ff">
          <label>Full Name *</label>
          <input type="text" id="__bm-name" placeholder="Your full name" value="${esc(saved.full_name||'')}" autocomplete="name">
        </div>
        <div class="bm-ff">
          <label>Email *</label>
          <input type="email" id="__bm-email" placeholder="you@email.com" value="${esc(saved.email||'')}" autocomplete="email">
        </div>
      </div>
      <div class="bm-row">
        <div class="bm-ff">
          <label>Phone</label>
          <input type="tel" id="__bm-phone" placeholder="+255 …" value="${esc(saved.phone||'')}" autocomplete="tel">
        </div>
        <div class="bm-ff">
          <label>Group Size</label>
          <select id="__bm-group">
            <option value="1">1 — Solo</option>
            <option value="2" selected>2 people</option>
            <option value="3">3 people</option>
            <option value="4">4 people</option>
            <option value="5-8">5–8 people</option>
            <option value="9+">9+ (group)</option>
          </select>
        </div>
      </div>
      <div class="bm-ff">
        <label>Preferred Date *</label>
        <input type="date" id="__bm-date" min="${minStr}">
      </div>
      <div class="bm-ff">
        <label>Notes (optional)</label>
        <textarea id="__bm-notes" placeholder="Special requests, dietary needs, accessibility…"></textarea>
      </div>

      <button class="bm-btn bm-btn-primary" id="__bm-submit">
        Confirm Booking
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
      </button>
      <button class="bm-btn bm-btn-ghost" id="__bm-back">← Back</button>

      <p class="bm-note">
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        We confirm within 24 hours. No payment required now.
      </p>
    </div>`;

  document.getElementById('__bm-close').addEventListener('click', closeModal);
  document.getElementById('__bm-back').addEventListener('click', () => renderStep1(_selected?.name));
  document.getElementById('__bm-submit').addEventListener('click', submitBooking);
}

// ── Submit booking ────────────────────────────────────────────────────────────
async function submitBooking() {
  const name  = document.getElementById('__bm-name').value.trim();
  const email = document.getElementById('__bm-email').value.trim();
  const phone = document.getElementById('__bm-phone').value.trim();
  const group = document.getElementById('__bm-group').value;
  const date  = document.getElementById('__bm-date').value;
  const notes = document.getElementById('__bm-notes').value.trim();
  const btn   = document.getElementById('__bm-submit');

  // Validate
  let ok = true;
  const mark = (id, bad) => {
    const el = document.getElementById(id);
    el?.classList.toggle('err', bad);
    if (bad && ok) { el?.focus(); ok = false; }
  };
  mark('__bm-name',  name.length < 2);
  mark('__bm-email', !email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
  mark('__bm-date',  !date);

  if (!ok) { showToast('Please fill in all required fields', 'warning'); return; }

  const sel  = new Date(date), today = new Date(); today.setHours(0,0,0,0);
  if (sel < today) { showToast('Please choose a future date', 'warning'); document.getElementById('__bm-date')?.focus(); return; }

  // Loading state
  btn.disabled = true;
  btn.innerHTML = `<div class="bm-spinner"></div> Processing…`;

  const rst = () => {
    btn.disabled = false;
    btn.innerHTML = `Confirm Booking <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`;
  };

  try {
    // Duplicate check
    const { data: dup } = await supabase.from('bookings').select('id')
      .eq('email', email).eq('tour_name', _selected.name).eq('tour_date', date);
    if (dup?.length) { showToast('You already booked this tour on that date', 'warning'); rst(); return; }

    const { error } = await supabase.from('bookings').insert([{
      full_name: name, email, phone: phone || null,
      tour_name: _selected.name, tour_date: date,
      notes: [group !== '2' ? `Group: ${group}` : null, notes].filter(Boolean).join(' | ') || null
    }]);

    if (error) { showToast('Booking failed: ' + error.message, 'error'); rst(); return; }

    // Save user info
    try { localStorage.setItem('rs_ud', JSON.stringify({ full_name: name, email, phone, ts: Date.now() })); } catch(e) {}

    renderStep3({ name, email, phone, tour: _selected.name, date, group });
  } catch(e) {
    showToast('Something went wrong. Please try again.', 'error'); rst();
  }
}

// ── STEP 3: Success ───────────────────────────────────────────────────────────
function renderStep3({ name, email, phone, tour, date, group }) {
  const box = document.getElementById('__bm-box');
  const ref = '#RS' + Date.now().toString().slice(-6);
  const dateStr = new Date(date).toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long', year:'numeric' });
  const waText  = encodeURIComponent(`Hi Ramika Safaris! I just booked the "${tour}" tour for ${dateStr}. Ref ${ref}. Name: ${name}.`);

  box.innerHTML = `
    <div class="bm-head">
      <div class="bm-head-top">
        <div>
          <p class="bm-eyebrow">Booking confirmed!</p>
          <p class="bm-tour-name">${esc(tour)}</p>
        </div>
        <button class="bm-close" id="__bm-close" aria-label="Close">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
    </div>
    ${stepDots(3)}
    <div class="bm-body">
      <div class="bm-success">
        <div class="bm-success-icon">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        </div>
        <h3>You're booked!</h3>
        <p>We'll confirm your spot and send payment details to <strong>${esc(email)}</strong> within 24 hours.</p>
        <div class="bm-ref">${ref}</div>

        <div class="bm-details-grid">
          <div class="bm-det-row"><span>Tour</span><strong>${esc(tour)}</strong></div>
          <div class="bm-det-row"><span>Date</span><strong>${esc(dateStr)}</strong></div>
          <div class="bm-det-row"><span>Guest</span><strong>${esc(name)}</strong></div>
          <div class="bm-det-row"><span>Group</span><strong>${esc(group)} person${group === '1' ? '' : 's'}</strong></div>
          ${phone ? `<div class="bm-det-row"><span>Phone</span><strong>${esc(phone)}</strong></div>` : ''}
        </div>

        <a href="https://wa.me/255621403021?text=${waText}" target="_blank" rel="noopener" class="bm-wa-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          Message us on WhatsApp
        </a>
        <button class="bm-btn bm-btn-ghost" id="__bm-done">Done</button>
      </div>
    </div>`;

  document.getElementById('__bm-close').addEventListener('click', closeModal);
  document.getElementById('__bm-done').addEventListener('click', closeModal);
}

// ── Public API ────────────────────────────────────────────────────────────────
/**
 * openBookingModal(options?)
 * options.tourName     — pre-select this tour (optional)
 * options.priceDisplay — shown in header (optional, fetched if omitted)
 */
export function openBookingModal(options = {}) {
  injectStyles();

  // Remove any existing modal
  document.getElementById('__bm-overlay')?.remove();
  document.removeEventListener('keydown', onKey);

  _step = 1;
  _selected = null;

  _overlay = buildOverlay();
  document.body.style.overflow = 'hidden';

  // Animate in next frame
  requestAnimationFrame(() => _overlay.classList.add('bm-open'));

  // If tour pre-selected and we have data, skip to step 2
  if (options.tourName && _tours) {
    const pre = _tours.find(t => t.name === options.tourName);
    if (pre) {
      _selected = pre;
      renderStep2();
      return;
    }
  }

  renderStep1(options.tourName || null);
}

// ── Wire all "Book Now" / "Book" buttons automatically on page load ───────────
// Any element with data-book or class .js-book-btn will open the modal.
// Pass data-tour-name="..." to pre-select a tour.
function wireButtons() {
  const selectors = '[data-book], .js-book-btn, [data-action="book"]';
  document.querySelectorAll(selectors).forEach(el => {
    el.addEventListener('click', e => {
      e.preventDefault();
      const tourName = el.dataset.tourName || el.dataset.tour || null;
      openBookingModal({ tourName });
    });
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', wireButtons);
} else {
  wireButtons();
}