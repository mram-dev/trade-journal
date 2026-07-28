/**
 * Trade Journal - Login Page
 */
export function getLoginHTML() {
  return `<!DOCTYPE html><html lang="fa" dir="rtl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Trade Journal</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{--bg:#f4f6fb;--s:#fff;--b:#e4e7f0;--t:#111827;--t2:#374151;--t3:#9ca3af;--a:#4f46e5;--a2:#7c3aed;--glow:rgba(79,70,229,.07);--err:#dc2626;--sh:0 2px 12px rgba(0,0,0,.06),0 1px 4px rgba(0,0,0,.04)}
[data-theme="dark"]{--bg:#09090b;--s:#18181b;--b:#27272a;--t:#fafafa;--t2:#d4d4d8;--t3:#71717a;--sh:0 2px 12px rgba(0,0,0,.4),0 1px 4px rgba(0,0,0,.3)}
body{font-family:'Vazirmatn','Inter',system-ui,sans-serif;background:var(--bg);color:var(--t);min-height:100vh;display:flex;align-items:center;justify-content:center;transition:all .3s}
.wrap{width:100%;max-width:400px;padding:20px}
.card{background:var(--s);border:none;border-radius:20px;padding:40px 32px;box-shadow:0 8px 32px rgba(0,0,0,.08);position:relative}
.theme-btn{position:absolute;top:14px;left:14px;width:32px;height:32px;border-radius:8px;border:1px solid var(--b);background:transparent;color:var(--t3);cursor:pointer;font-size:14px;transition:var(--tr)}
.theme-btn:hover{color:var(--a);border-color:var(--a)}
.logo{text-align:center;margin-bottom:32px}
.logo .icon{width:56px;height:56px;border-radius:16px;background:linear-gradient(135deg,var(--a),var(--a2));display:flex;align-items:center;justify-content:center;font-size:24px;margin:0 auto 14px;box-shadow:0 4px 16px rgba(79,70,229,.3)}
.logo h1{font-size:22px;font-weight:800;letter-spacing:-.5px}.logo p{color:var(--t3);font-size:13px;margin-top:4px}
.fg{margin-bottom:18px}.fg label{display:block;font-size:12px;color:var(--t3);margin-bottom:6px;font-weight:600}
.fg input,.fg select,.fg textarea{width:100%;padding:12px 14px;background:var(--bg);border:1px solid var(--b);border-radius:10px;color:var(--t);font-size:14px;font-family:inherit;transition:all .2s}
.fg input:focus,.fg select:focus,.fg textarea:focus{outline:none;border-color:var(--a);box-shadow:0 0 0 3px var(--glow)}
.btn{width:100%;padding:12px;background:linear-gradient(135deg,var(--a),var(--a2));color:#fff;border:none;border-radius:12px;font-size:14px;font-weight:700;cursor:pointer;font-family:inherit;transition:all .2s}
.btn:hover{transform:translateY(-1px);box-shadow:0 4px 16px rgba(79,70,229,.35)}
.btn:active{transform:scale(.98)}
.err{background:rgba(220,38,38,.06);border:1px solid rgba(220,38,38,.15);color:var(--err);padding:10px;border-radius:10px;font-size:12px;margin-bottom:14px;display:none;text-align:center}
.err.show{display:block}
.lang{display:flex;gap:6px;justify-content:center;margin-top:16px}
.lang button{padding:6px 12px;border-radius:8px;border:1px solid var(--b);background:transparent;color:var(--t3);font-size:11px;cursor:pointer;font-weight:600;transition:var(--tr)}
.lang button.on{background:var(--a);color:#fff;border-color:var(--a)}
</style></head><body>
<div class="wrap"><div class="card">
<button class="theme-btn" onclick="toggleTheme()">🌓</button>
<div class="logo"><div class="icon">📊</div><h1>Trade Journal</h1><p id="subTxt">برای ادامه وارد شوید</p></div>
<div class="err" id="err"></div>
<form onsubmit="login(event)"><div class="fg"><label id="pwLabel">رمز عبور</label><input type="password" id="pw" autofocus></div><button type="submit" class="btn" id="loginBtn">ورود</button></form>
<div class="lang"><button class="on" onclick="setL('fa')">🇮🇷 فارسی</button><button onclick="setL('en')">🇺🇸 English</button></div>
</div></div>
<script>
const T={fa:{sub:'برای ادامه وارد شوید',pw:'رمز عبور',btn:'ورود',err:'رمز عبور اشتباه است'},en:{sub:'Sign in to continue',pw:'Password',btn:'Sign In',err:'Wrong password'}};
let L=localStorage.getItem('lang')||'fa';
function toggleTheme(){const t=document.documentElement.getAttribute('data-theme')==='dark'?'light':'dark';document.documentElement.setAttribute('data-theme',t);localStorage.setItem('theme',t)}
function setL(l){L=l;localStorage.setItem('lang',l);document.documentElement.lang=l;document.documentElement.dir=l==='fa'?'rtl':'ltr';apply()}
function apply(){const t=T[L];document.getElementById('subTxt').textContent=t.sub;document.getElementById('pwLabel').textContent=t.pw;document.getElementById('loginBtn').textContent=t.btn;document.querySelectorAll('.lang button').forEach(b=>b.className=b.textContent.includes(L==='fa'?'🇮🇷':'🇺🇸')?'on':'')}
const th=localStorage.getItem('theme');if(th)document.documentElement.setAttribute('data-theme',th);apply();
async function login(e){e.preventDefault();const pw=document.getElementById('pw').value;const err=document.getElementById('err');if(!pw)return;try{const r=await fetch('/login',{method:'POST',credentials:'include',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:pw})});const d=await r.json();if(d.ok){const sc=document.cookie.match(/session=([^;]+)/);if(sc)localStorage.setItem('tj_token',sc[1]);location.href='/app'}else{err.textContent=T[L].err;err.classList.add('show')}}catch(e){err.textContent='Error';err.classList.add('show')}}
</script></body></html>`;
}

/**
 * Trade Journal - Dashboard
 */
export function getDashboardHTML() {
  return `<!DOCTYPE html><html lang="fa" dir="rtl"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Trade Journal</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
:root{
--bg:#f4f6fb;--s:#fff;--s2:#f8f9fc;--b:#e4e7f0;--b2:#c8cdd9;
--t:#111827;--t2:#374151;--t3:#6b7280;--t4:#9ca3af;
--a:#4f46e5;--a2:#7c3aed;--ab:rgba(79,70,229,.07);--ab2:rgba(79,70,229,.18);
--g:#059669;--gb:rgba(5,150,105,.07);--r:#dc2626;--rb:rgba(220,38,38,.07);
--bl:#2563eb;--blb:rgba(37,99,235,.07);--o:#ea580c;--ob:rgba(234,88,12,.07);
--y:#ca8a04;--yb:rgba(202,138,4,.07);
--rad:16px;--rads:12px;--radxs:8px;
--sh:0 1px 3px rgba(0,0,0,.04),0 1px 2px rgba(0,0,0,.03);--shl:0 4px 24px rgba(0,0,0,.06),0 1px 4px rgba(0,0,0,.04);
--tr:all .2s cubic-bezier(.4,0,.2,1)
}
[data-theme="dark"]{
--bg:#09090b;--s:#18181b;--s2:#27272a;--b:#27272a;--b2:#3f3f46;
--t:#fafafa;--t2:#d4d4d8;--t3:#a1a1aa;--t4:#71717a;
--ab:rgba(129,140,248,.1);--ab2:rgba(129,140,248,.22);
--gb:rgba(52,211,153,.1);--rb:rgba(248,113,113,.1);
--blb:rgba(96,165,250,.1);--ob:rgba(251,146,60,.1);--yb:rgba(250,204,21,.1);
--sh:0 1px 3px rgba(0,0,0,.3);--shl:0 4px 24px rgba(0,0,0,.4)
}
body{font-family:'Vazirmatn','Inter',system-ui,sans-serif;background:var(--bg);color:var(--t);min-height:100vh;transition:background .3s,color .3s;-webkit-text-size-adjust:100%;scroll-behavior:smooth}
::-webkit-scrollbar{width:4px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:var(--b2);border-radius:2px}
a{color:var(--a);text-decoration:none;font-weight:500}
html,body{overflow-x:hidden;max-width:100vw}
.app{display:flex;min-height:100vh;overflow-x:hidden}

/* === SIDEBAR === */
.sb{width:240px;background:var(--s);border-left:1px solid var(--b);position:fixed;top:52px;height:calc(100vh - 52px);display:flex;flex-direction:column;z-index:100;transition:transform .3s ease;will-change:transform}
.sb-top{padding:16px;border-bottom:1px solid var(--b)}
.sb-brand{display:flex;align-items:center;gap:10px}
.sb-brand .ic{width:32px;height:32px;border-radius:8px;background:linear-gradient(135deg,var(--a),var(--a2));display:flex;align-items:center;justify-content:center;font-size:15px;box-shadow:0 2px 8px rgba(79,70,229,.2)}
.sb-brand h1{font-size:13px;font-weight:700}.sb-brand p{font-size:9px;color:var(--t4);margin-top:1px}
.nav{flex:1;padding:6px 8px;overflow-y:auto}
.ni{display:flex;align-items:center;gap:9px;padding:8px 10px;color:var(--t3);cursor:pointer;transition:var(--tr);border-radius:8px;font-size:12px;font-weight:500;margin-bottom:1px}
.ni:hover{color:var(--t);background:var(--ab)}.ni.on{color:var(--a);background:var(--ab);font-weight:600}
.ni .ic{width:18px;text-align:center;font-size:13px}
.sb-bot{padding:8px;border-top:1px solid var(--b);display:flex;gap:4px}
.sb-bot button{flex:1;padding:6px;border-radius:6px;border:1px solid var(--b);background:var(--s2);color:var(--t3);cursor:pointer;font-size:10px;font-weight:500;font-family:inherit;transition:var(--tr)}
.sb-bot button:hover{border-color:var(--a);color:var(--a)}
.sb-overlay{position:fixed;inset:0;background:rgba(0,0,0,.35);z-index:99;display:none;backdrop-filter:blur(4px);opacity:0;transition:opacity .3s}
.sb-overlay.show{display:block;opacity:1}
.sb.hidden{transform:translateX(100%)}
html[dir="ltr"] .sb.hidden{transform:translateX(-100%)}

/* === TOP BAR === */
.top-bar{display:flex;align-items:center;position:fixed;top:0;left:0;right:0;height:52px;background:var(--s);border-bottom:1px solid var(--b);z-index:160;padding:0 14px;justify-content:space-between}
.tb-left{display:flex;align-items:center;gap:8px;min-width:0}
.tb-title{min-width:0;overflow:hidden}
.tb-title h2{font-size:14px;font-weight:700;margin:0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.tb-clock{font-size:10px;color:var(--t3);white-space:nowrap;font-weight:500;flex-shrink:0;padding:4px 10px;background:var(--bg);border:1px solid var(--b);border-radius:6px;display:inline-flex;align-items:center;gap:5px;line-height:1;height:28px;box-sizing:border-box}
.tb-clock::before{content:'🕐';font-size:10px}
.tb-right{display:flex;align-items:center;gap:6px;flex-shrink:0}
.tb-acct{display:inline-flex;align-items:center;gap:0;background:var(--bg);border:1px solid var(--b);border-radius:6px;padding:0;overflow:hidden;transition:var(--tr);height:28px}
.tb-acct:hover{border-color:var(--a)}
.tb-acct .acct-icon{display:flex;align-items:center;justify-content:center;width:24px;height:28px;font-size:11px;flex-shrink:0}
.tb-acct select{appearance:none;-webkit-appearance:none;background:transparent;border:none;color:var(--t2);font-size:10px;font-weight:600;font-family:inherit;padding:0 24px 0 4px;cursor:pointer;direction:ltr;height:28px;line-height:28px}
.tb-acct select:focus{outline:none}
.tb-acct .acct-arrow{display:flex;align-items:center;justify-content:center;width:16px;font-size:8px;color:var(--t4);flex-shrink:0}
.tb-toggle,.menu-t{display:flex;align-items:center;justify-content:center;width:30px;height:30px;border:none;border-radius:8px;background:transparent;color:var(--t3);cursor:pointer;font-size:16px;flex-shrink:0;transition:var(--tr)}
  .tb-toggle:hover,.menu-t:hover{color:var(--a);background:var(--ab)}
  .menu-t{display:none}
  .tb-btn{display:flex;align-items:center;justify-content:center;width:30px;height:30px;border:none;border-radius:8px;background:transparent;color:var(--t3);cursor:pointer;font-size:14px;flex-shrink:0;transition:var(--tr)}
  .tb-btn:hover{color:var(--a);background:var(--ab)}
  .sb-close{display:none}

/* === MAIN CONTENT === */
.mn{margin-left:0;margin-right:240px;margin-top:52px;flex:1;padding:20px;min-height:calc(100vh - 52px)}
html[dir="ltr"] .mn{margin-left:240px;margin-right:0}
html[dir="ltr"] .sb{left:0;border-left:none;border-right:1px solid var(--b)}
html[dir="ltr"] .ni{text-align:right}
html[dir="ltr"] .sb-top{text-align:left}
html[dir="ltr"] th{text-align:left}
.mn.expanded{margin-right:0!important;margin-left:0!important}

.img-upload{display:flex;flex-direction:column;gap:6px}
.img-upload input{width:100%}
.img-preview img{width:100%;max-height:120px;object-fit:cover;border-radius:8px;border:1px solid var(--b)}


.hd{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;flex-wrap:wrap;gap:10px}
.hd h2{font-size:20px;font-weight:700;letter-spacing:-.5px}.hd .sub{font-size:12px;color:var(--t4);margin-top:2px}
.hd-act{display:flex;gap:8px}

/* === MINI STATS BAR === */
.mini-bar{display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap}
.mini-item{display:flex;align-items:center;gap:6px;padding:6px 12px;background:var(--s);border:1px solid var(--b);border-radius:10px;font-size:11px;font-weight:600;white-space:nowrap}
.mini-item .mi-icon{font-size:13px}
.mini-item .mi-val{font-weight:700;font-size:12px}
.mini-item .mi-lbl{color:var(--t4);font-weight:500;font-size:10px}
.mini-item.pos{border-color:rgba(5,150,105,.3)}.mini-item.pos .mi-val{color:var(--g)}
.mini-item.neg{border-color:rgba(220,38,38,.3)}.mini-item.neg .mi-val{color:var(--r)}
.mini-item.info{border-color:rgba(99,102,241,.2)}.mini-item.info .mi-val{color:var(--a)}
.mini-item.warn{border-color:rgba(234,88,12,.3)}.mini-item.warn .mi-val{color:var(--o)}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.5}}
.mini-item .pulse{animation:pulse 2s infinite}

/* === BUTTONS === */
.btn{display:inline-flex;align-items:center;justify-content:center;gap:5px;padding:8px 16px;border:none;border-radius:10px;font-size:12px;font-weight:600;cursor:pointer;transition:all .15s;position:relative;letter-spacing:.01em}
.btn:focus-visible{outline:none;box-shadow:0 0 0 3px var(--ab2)}
.btn:active{transform:scale(.97)}

/* Primary */
.btn-p{background:linear-gradient(135deg,var(--a),var(--a2));color:#fff;box-shadow:0 2px 8px rgba(79,70,229,.25)}
.btn-p:hover{box-shadow:0 4px 12px rgba(79,70,229,.35);filter:brightness(1.05)}

/* Ghost */
.btn-g{background:var(--s);color:var(--t2);border:1px solid var(--b);box-shadow:none}
.btn-g:hover{background:var(--s2);border-color:var(--b2);color:var(--t)}

/* Danger */
.btn-d{background:var(--s);color:var(--r);border:1px solid rgba(220,38,38,.15)}
.btn-d:hover{background:var(--rb);border-color:rgba(220,38,38,.3)}

/* Small */
.btn-s{padding:5px 10px;font-size:11px;border-radius:7px}
.btn:disabled{opacity:.4;cursor:not-allowed;transform:none!important;pointer-events:none}

/* === EXPORT BUTTONS === */
.btn-export{display:inline-flex;align-items:center;gap:5px;padding:7px 14px;border:1px solid var(--b);border-radius:10px;font-size:11px;font-weight:600;cursor:pointer;transition:all .15s;background:var(--s);color:var(--t3);position:relative}
.btn-export:hover{border-color:var(--b2);color:var(--t);background:var(--s2)}
.btn-export:active{transform:scale(.97)}
.btn-pdf{color:#dc2626;border-color:rgba(220,38,38,.15)}
.btn-pdf:hover{background:var(--rb);border-color:rgba(220,38,38,.3);color:#dc2626}
.btn-excel{color:#059669;border-color:rgba(5,150,105,.15)}
.btn-excel:hover{background:var(--gb);border-color:rgba(5,150,105,.3);color:#059669}

/* === STATS ROW === */
.sr{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:20px}.sr>.sc{min-width:0}
.sr-auto{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;margin-bottom:20px}
.sc{background:var(--s);border:1px solid var(--b);border-radius:14px;padding:18px;transition:var(--tr);position:relative;overflow:hidden}
.sc:hover{transform:translateY(-1px);box-shadow:var(--shl)}
.sc .tp{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}
.sc .icon{width:34px;height:34px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:15px}
.sc.c1 .icon{background:var(--ab);color:var(--a)}.sc.c2 .icon{background:var(--gb);color:var(--g)}.sc.c3 .icon{background:var(--rb);color:var(--r)}.sc.c4 .icon{background:var(--blb);color:var(--bl)}
.sc .lbl{font-size:11px;color:var(--t4);font-weight:500}
.sc .val{font-size:24px;font-weight:800;letter-spacing:-1px;line-height:1}
.sc .sub{font-size:10px;color:var(--t4);margin-top:4px}
.val.pos{color:var(--g)}.val.neg{color:var(--r)}

/* === CHART === */
.cb{background:var(--s);border:1px solid var(--b);border-radius:var(--rad);padding:18px;margin-bottom:20px}
.cb-hd{display:flex;justify-content:space-between;align-items:center;margin-bottom:14px}
.cb-hd h3{font-size:13px;font-weight:600}
.ca{height:180px;display:flex;align-items:flex-end;gap:4px;padding:0 2px}
.cc{flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;height:100%;justify-content:flex-end}
.cbar{width:100%;border-radius:5px 5px 2px 2px;min-height:3px;transition:all .4s;cursor:pointer;position:relative}
.cbar:hover{filter:brightness(1.15)}
.cbar .tip{position:absolute;bottom:calc(100% + 5px);left:50%;transform:translateX(-50%);background:var(--t);color:var(--bg);padding:4px 8px;border-radius:5px;font-size:9px;white-space:nowrap;opacity:0;pointer-events:none;transition:opacity .2s;font-weight:600}
.cbar:hover .tip{opacity:1}
.clbl{font-size:8px;color:var(--t4);font-weight:500}

/* === BADGE === */
.badge{font-size:9px;background:var(--ab);color:var(--a);padding:2px 8px;border-radius:12px;font-weight:600;border:1px solid var(--ab2)}

/* === PANEL / TABLE === */
.pnl{background:var(--s);border:1px solid var(--b);border-radius:var(--rad);overflow:hidden;margin-bottom:16px}
.pnl-hd{display:flex;justify-content:space-between;align-items:center;padding:14px 18px;border-bottom:1px solid var(--b)}
.pnl-hd h3{font-size:13px;font-weight:600}
table{width:100%;border-collapse:collapse}
th{text-align:right;padding:9px 18px;font-size:9px;color:var(--t4);text-transform:uppercase;letter-spacing:.8px;border-bottom:1px solid var(--b);font-weight:700;background:var(--s2);position:sticky;top:0;z-index:1}
td{padding:10px 18px;font-size:12px;border-bottom:1px solid var(--b)}
tr:last-child td{border-bottom:none}tr:hover td{background:var(--ab)}
.tag{display:inline-flex;align-items:center;gap:3px;padding:2px 8px;border-radius:5px;font-size:9px;font-weight:600}
.tag-g{background:var(--gb);color:var(--g)}.tag-r{background:var(--rb);color:var(--r)}.tag-a{background:var(--ab);color:var(--a)}.tag-b{background:var(--blb);color:var(--bl)}.tag-o{background:var(--ob);color:var(--o)}
.dir-l{color:var(--g);font-weight:600}.dir-s{color:var(--r);font-weight:600}

/* === SEARCH === */
.srch{position:relative;margin-bottom:14px}
.srch input{width:100%;padding:10px 14px 10px 36px;background:var(--s);border:1px solid var(--b);border-radius:var(--radxs);color:var(--t);font-size:12px;font-family:inherit;transition:var(--tr)}
.srch input:focus{outline:none;border-color:var(--a);box-shadow:0 0 0 3px var(--ab)}
.srch .ico{position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--t4);font-size:13px}

/* === FORM === */
.fg{margin-bottom:14px}.fg label{display:block;font-size:11px;color:var(--t3);margin-bottom:5px;font-weight:600}
.fg input,.fg select,.fg textarea{width:100%;padding:9px 12px;background:var(--bg);border:1px solid var(--b);border-radius:var(--radxs);color:var(--t);font-size:12px;font-family:inherit;transition:var(--tr)}
.fg input:focus,.fg select:focus,.fg textarea:focus{outline:none;border-color:var(--a);box-shadow:0 0 0 3px var(--ab)}
.fg textarea{resize:vertical;min-height:60px}
.fg-r{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.fg-r3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px}

/* === MODAL === */
.m-bg{position:fixed;inset:0;background:rgba(0,0,0,.4);backdrop-filter:blur(4px);z-index:200;display:none;align-items:center;justify-content:center;transition:opacity .25s}
.m-bg.show{display:flex}
.modal{background:var(--s);border:1px solid var(--b);border-radius:20px;padding:24px;width:90%;max-width:600px;max-height:85vh;overflow-y:auto;box-shadow:0 25px 60px rgba(0,0,0,.15);backdrop-filter:blur(20px);animation:modalIn .35s cubic-bezier(.34,1.56,.64,1)}
.modal h3{font-size:15px;font-weight:700;margin-bottom:16px}
.m-act{display:flex;gap:8px;margin-top:16px}
.sc-viewer{max-width:95vw;max-height:95vh;width:auto;padding:0;background:#000;border:1px solid rgba(255,255,255,.08);display:flex;flex-direction:column}
.sc-viewer .sc-wrap{flex:1;display:flex;align-items:center;justify-content:center;overflow:auto;touch-action:none;min-height:0;max-height:calc(95vh - 56px)}
.sc-viewer .sc-wrap img{max-width:100%;max-height:100%;object-fit:contain;transform-origin:0 0;transition:transform .1s}
.sc-bar{display:flex;gap:4px;justify-content:center;padding:10px;background:rgba(255,255,255,.06);border-top:1px solid rgba(255,255,255,.08);flex-shrink:0}
.sc-btn{background:rgba(255,255,255,.1);color:#fff;border:none;border-radius:10px;width:44px;height:44px;font-size:18px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .15s}
.sc-btn:hover{background:rgba(255,255,255,.2)}
.sc-close{background:rgba(220,38,38,.3)!important;font-size:20px}
.sc-close:hover{background:rgba(220,38,38,.5)!important}

/* === TOAST === */
.toast{position:fixed;bottom:20px;left:50%;transform:translateX(-50%) translateY(100px);background:var(--s);border:1px solid var(--b);padding:10px 20px;border-radius:12px;font-size:12px;z-index:1000;transition:transform .3s cubic-bezier(.4,0,.2,1);box-shadow:var(--shl);font-weight:600}
.toast.show{transform:translateX(-50%) translateY(0)}

/* === PROGRESS === */
.prog{height:5px;background:var(--b);border-radius:3px;overflow:hidden}
.prog-f{height:100%;border-radius:3px;transition:width .5s}

/* === TRADES PAGE === */
.trades-page{padding:0}
.tp-head{display:flex;justify-content:space-between;align-items:center;margin-bottom:16px}
.tp-title{display:flex;align-items:center;gap:10px}
.tp-title h2{margin:0;font-size:20px;font-weight:800}
.tp-count{background:var(--a);color:#fff;font-size:11px;font-weight:700;padding:2px 8px;border-radius:20px}
.tp-actions{display:flex;gap:6px}
.btn-sm{padding:8px 14px;font-size:12px;min-height:auto;border-radius:10px}
.tp-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-bottom:16px}
.tp-stat{background:var(--s);border:1px solid var(--b);border-radius:12px;padding:12px;text-align:center}
.tp-stat-val{font-size:20px;font-weight:800;color:var(--t)}
.tp-stat-lbl{font-size:11px;color:var(--t3);margin-top:2px}
.tp-search{position:relative;margin-bottom:12px}
.tp-search input{width:100%;padding:12px 14px 12px 40px;background:var(--s);border:1px solid var(--b);border-radius:12px;color:var(--t);font-size:14px;font-family:inherit;outline:none;transition:border .2s}
.tp-search input:focus{border-color:var(--a)}
.tp-search-ico{position:absolute;right:14px;top:50%;transform:translateY(-50%);font-size:14px;color:var(--t3)}
.tp-filters{display:flex;gap:8px;margin-bottom:16px;overflow-x:auto;-webkit-overflow-scrolling:touch;scrollbar-width:none}
.tp-filters::-webkit-scrollbar{display:none}
.tp-filters select{flex:0 0 auto;padding:8px 12px;font-size:12px;border:1px solid var(--b);border-radius:10px;background:var(--s);color:var(--t);font-family:inherit;cursor:pointer}
.tp-table{overflow-x:auto;-webkit-overflow-scrolling:touch}
.tp-table table{width:100%;border-collapse:collapse;font-size:13px}
.tp-table th{padding:10px 12px;text-align:right;font-size:11px;font-weight:600;color:var(--t3);border-bottom:2px solid var(--b);white-space:nowrap}
.tp-table td{padding:10px 12px;border-bottom:1px solid var(--b);white-space:nowrap}
.tp-table tr:hover td{background:var(--glow)}

/* === MOBILE CARDS === */
.trade-card{display:block;background:var(--s);border:1px solid var(--b);border-radius:14px;padding:14px;margin-bottom:10px;transition:transform .15s}
.trade-card:active{transform:scale(.985)}
.tc-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px}
.tc-sym{font-size:16px;font-weight:800;letter-spacing:-.3px}
.tc-dir{padding:3px 10px;border-radius:20px;font-size:10px;font-weight:700}
.tc-dir.long{background:rgba(5,150,105,.1);color:var(--g)}
.tc-dir.short{background:rgba(220,38,38,.1);color:var(--r)}
.tc-row{display:flex;justify-content:space-between;font-size:12px;color:var(--t2);padding:5px 0}
.tc-row span:first-child{color:var(--t3);font-weight:500}
.tc-actions{display:flex;gap:6px;margin-top:12px;padding-top:10px;border-top:1px solid var(--b)}
.tc-actions .btn{flex:1;justify-content:center;padding:8px;font-size:11px;min-height:40px;border-radius:10px}
.tc-scr{margin-bottom:10px;border-radius:10px;overflow:hidden}
.tc-scr img{width:100%;max-height:200px;object-fit:cover;border-radius:10px;cursor:pointer}

/* === PAGES === */
.page{display:none;animation:pageIn .35s cubic-bezier(.4,0,.2,1)}.page.on{display:block}

/* === DASHBOARD PANELS === */
.g2{display:grid;grid-template-columns:1fr 1fr;gap:12px}
.empty{padding:32px;text-align:center;color:var(--t4);font-size:12px}
.time{color:var(--t4);font-size:10px}

/* === DIRECTION BOX === */
.dir-box{display:flex;gap:16px;justify-content:center;flex-wrap:wrap}
.dir-item{text-align:center;min-width:80px}
.dir-item .num{font-size:24px;font-weight:800}
.dir-item .lbl-sm{font-size:11px;color:var(--t4)}
.dir-item .pnl-sm{font-size:13px;font-weight:600}

/* === BREAKDOWN === */
.breakdown-row{padding:12px 18px;border-bottom:1px solid var(--b);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px}
.breakdown-row:last-child{border-bottom:none}
.breakdown-name{display:flex;align-items:center;gap:8px;font-size:12px;font-weight:500}
.breakdown-tags{display:flex;gap:8px;font-size:11px;flex-wrap:wrap}
.color-dot{display:inline-block;width:10px;height:10px;border-radius:3px}

/* === JOURNAL CARDS === */
.journal-card{background:var(--s);border:1px solid var(--b);border-radius:var(--rad);padding:18px;margin-bottom:12px;transition:transform .2s,box-shadow .2s}
.journal-card:hover{box-shadow:0 4px 16px rgba(0,0,0,.06)}
.journal-header{display:flex;justify-content:space-between;margin-bottom:10px;flex-wrap:wrap;gap:6px}
.journal-body{font-size:12px}.journal-body p{margin-bottom:6px}
.journal-mood{font-size:20px}

/* === ACCOUNT TABLE === */
.acc-table-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;max-width:100%}

/* === RATING / EMOTION === */
.stars{display:flex;gap:2px}.stars span{cursor:pointer;font-size:14px;opacity:.3;transition:opacity .2s}.stars span.on{opacity:1}
.emotion{display:flex;gap:6px;flex-wrap:wrap}.emotion span{cursor:pointer;font-size:20px;padding:4px;border-radius:8px;border:2px solid transparent;transition:all .2s}.emotion span.sel{border-color:var(--a);background:var(--ab)}

/* === EXPORT BUTTONS === */
.export-grp{display:flex;gap:6px;align-items:center}

.btn-pdf{border-color:rgba(220,38,38,.25);color:#dc2626;background:var(--s)}
.btn-pdf:hover{background:rgba(220,38,38,.08);border-color:rgba(220,38,38,.4);box-shadow:0 6px 20px rgba(220,38,38,.15)}
.btn-excel{border-color:rgba(5,150,105,.25);color:#059669;background:var(--s)}
.btn-excel:hover{background:rgba(5,150,105,.08);border-color:rgba(5,150,105,.4);box-shadow:0 6px 20px rgba(5,150,105,.15)}

/* === SKELETON LOADING === */
@keyframes shimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
.skeleton{background:linear-gradient(90deg,var(--b) 25%,var(--s2) 50%,var(--b) 75%);background-size:200% 100%;animation:shimmer 1.5s infinite;border-radius:var(--radxs)}
.skeleton-card{height:80px;margin-bottom:12px;border-radius:var(--rad)}
.skeleton-row{height:14px;margin-bottom:8px;border-radius:4px}
.skeleton-stat{height:100px;border-radius:var(--rad)}

/* === MOBILE TRADE CARDS (hidden on desktop) === */
.trade-card{display:none}

/* ================================================
   MOBILE-FIRST RESPONSIVE
   ================================================ */

/* === TABLET (768px+) === */
@media(min-width:768px){
  .tp-stats{gap:12px}
  .tp-filters{flex-wrap:wrap}
}

/* === DESKTOP (1024px+) === */
@media(min-width:1024px){
  .sr{grid-template-columns:repeat(4,1fr)}
  .tp-table table{font-size:13px}
  .tp-table th,.tp-table td{padding:10px 14px}
}

/* === BOTTOM BAR (mobile nav) === */
.bottom-bar{display:none;position:fixed;bottom:0;left:0;right:0;height:56px;background:var(--s);border-top:1px solid var(--b);z-index:200;align-items:center;justify-content:space-around;padding:0 2px}
.bb-item{display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;flex:1;padding:5px 0;font-size:9px;color:var(--t3);cursor:pointer;border-radius:8px;transition:color .2s,background .2s;-webkit-tap-highlight-color:transparent}
.bb-item.on{color:var(--a);font-weight:600}
.bb-item:active{background:var(--bg)}
.bb-ic{font-size:18px;line-height:1}

/* ================================================
   MOBILE (max-width: 767px)
   ================================================ */
@media(max-width:767px){
  .sb{display:none!important}
  .bottom-bar{display:flex!important}
  .mn{margin-bottom:60px!important}
  .top-bar{left:0!important;right:0!important;height:52px;padding:0 12px;width:100%!important}
    html[dir="ltr"] .top-bar{left:0!important;right:0!important}
    .menu-t{display:none!important}
    .tb-toggle{display:none}
    .tb-btn{display:flex!important}
    .tb-acct{max-width:160px}
    .tb-acct .acct-icon{width:26px;height:26px;font-size:12px}
    .tb-acct select{font-size:10px;max-width:100px;height:26px;padding-right:20px}
    .tb-clock{font-size:10px}
    .sb-close{display:flex;align-items:center;justify-content:center;width:28px;height:28px;border:none;border-radius:8px;background:var(--bg);color:var(--t3);cursor:pointer;font-size:14px;flex-shrink:0}
    .sb-close:hover{color:var(--r)}
    .mn{margin-right:0!important;margin-left:0!important;padding:12px;padding-top:62px;overflow-x:hidden;max-width:100vw}
    .sr{grid-template-columns:1fr 1fr;gap:10px}
    .sr-auto{grid-template-columns:repeat(auto-fit,minmax(140px,1fr))}
    .sc{padding:14px}.sc .val{font-size:22px}.sc .icon{width:32px;height:32px;font-size:14px}
    .cb{padding:16px}.cb .cb-hd{margin-bottom:8px}.ca{height:160px}
    .g2{grid-template-columns:1fr;gap:10px}
    .trade-card{display:block}
    .tp-table{display:none}
    .tp-stats{grid-template-columns:repeat(3,1fr);gap:8px}
    .tp-stat{padding:10px}.tp-stat-val{font-size:16px}
    .tp-filters{gap:6px}
    .tp-filters select{padding:8px 10px;font-size:11px}
    .tp-table table{font-size:12px}
    .tp-table th,.tp-table td{padding:8px 10px}
    .tp-head{flex-wrap:wrap;gap:8px}
    .tp-actions{width:100%;justify-content:flex-end}
  #p-accounts .pnl,#p-strategies .pnl,#p-journal .pnl{overflow-x:auto;-webkit-overflow-scrolling:touch}
  .fg-r,.fg-r3,.g2{grid-template-columns:1fr;gap:8px}
  .fg input,.fg select,.fg textarea{font-size:16px;min-height:44px}
  .emotion span{min-width:44px;min-height:44px;font-size:24px}
  .stars span{min-width:36px;min-height:36px;font-size:16px}
  .btn{min-height:44px}
  .btn-s{min-height:36px;padding:6px 12px;font-size:11px}
  .hd{flex-direction:column;align-items:flex-start;gap:8px}
  .hd-act{display:flex;gap:6px;flex-wrap:wrap;align-items:center}
  .hd-act .btn{padding:8px 12px;font-size:11px}
  .hd-act .btn span{display:none}
  .export-grp{display:flex;gap:4px}
  .export-grp .btn-export{padding:8px 10px}
  .export-grp .btn-export span{display:none}
  .m-bg{align-items:flex-end;padding:0}
  .modal{width:100%;max-height:90dvh;padding:20px;border-radius:20px 20px 0 0}
  .modal h3{font-size:14px;margin-bottom:12px}
  .m-act{flex-direction:column}.m-act .btn{width:100%;justify-content:center}
  .ni{min-height:44px;padding:12px}
  .sb-bot button{min-height:44px;font-size:13px}
  .toast{left:12px;right:12px;width:auto;max-width:calc(100vw - 24px);transform:translateX(0) translateY(100px);bottom:calc(12px + env(safe-area-inset-bottom,0px))}
  .toast.show{transform:translateX(0) translateY(0);text-align:center;font-size:13px;padding:12px 16px}
  .srch input{padding:12px 14px 12px 38px;font-size:13px}
  .srch .ico{left:12px;font-size:15px}
  .breakdown-row{padding:10px 12px;flex-direction:column;align-items:flex-start;gap:6px}
  .breakdown-tags{width:100%}
  .journal-card{padding:14px}.journal-header{flex-direction:column;gap:4px}
  .dir-box{gap:12px}.dir-item .num{font-size:20px}

  ::-webkit-scrollbar{width:3px}
  .trade-card .tc-actions .btn-del{color:var(--r)}
}

/* === SMALL MOBILE (max-width: 480px) === */
@media(max-width:480px){
  .sr{grid-template-columns:1fr;gap:8px}
  .sr-auto{grid-template-columns:1fr}
  .trades-stats{grid-template-columns:1fr 1fr;gap:6px}
  .trades-stats .sc{padding:10px 6px}.trades-stats .sc .val{font-size:15px}.trades-stats .sc .lbl{font-size:9px}
  .trades-filter{grid-template-columns:1fr;gap:6px}
  .trades-filter input,.trades-filter select{padding:9px 8px;font-size:13px}
  .sc{padding:12px}.sc .val{font-size:18px}.sc .sub{font-size:9px}
  .badge{font-size:8px;padding:1px 6px}.tag{font-size:8px;padding:1px 6px}
  .sb{width:100%;max-width:300px}.sb-top{padding:14px}
  .ni{padding:10px 12px;font-size:13px}
  .ca{height:120px}
  .g2{gap:6px}
  .pnl{padding:0}.pnl-hd{padding:10px 12px}.pnl-hd h3{font-size:11px}
  .cb-hd h3{font-size:11px}
  .fg-r{gap:6px}.fg-r3{gap:6px}
  .fg{margin-bottom:10px}.fg input,.fg select,.fg textarea{padding:8px 10px;font-size:11px}.fg label{font-size:10px}
  .btn{padding:8px 12px;font-size:11px;border-radius:8px}
  .btn-s{padding:5px 8px;font-size:10px}
  .modal{padding:16px;border-radius:16px 16px 0 0;width:100%}
  .modal h3{font-size:13px}
  .hd h2{font-size:16px}.hd{width:100%}
  .tb-clock{font-size:10px}
  #eqChart.cc .cbar{min-height:3px}
  .emotion span{font-size:16px;padding:3px}
  .stars span{font-size:12px}
  .toast{font-size:11px;padding:8px 12px;bottom:8px;left:8px;right:8px}
  .hd-act{gap:6px}.hd-act .btn{font-size:10px;padding:6px 8px}
}

/* === VERY SMALL (max-width: 360px) === */
@media(max-width:360px){
  table{min-width:320px}
  .sc .val{font-size:16px}
  .btn{font-size:9px;padding:6px 8px}
  .hd h2{font-size:14px}
  .sb{max-width:260px}
  .menu-t{width:32px;height:32px;font-size:16px}
  .top-bar{padding:0 8px;gap:6px}
  .mn{padding:8px;padding-top:56px}
  .sr{gap:6px}
  th,td{font-size:9px;padding:4px 4px}
  .breakdown-row{padding:8px 10px}
  .journal-card{padding:12px}
  .dir-item .num{font-size:18px}
  .dir-item .pnl-sm{font-size:11px}
}

/* === SAFE AREAS (notched phones) === */
@supports(padding:env(safe-area-inset-bottom)){
  .mn{padding-bottom:calc(12px + env(safe-area-inset-bottom))}
  .toast{bottom:calc(12px + env(safe-area-inset-bottom))}
  .sb-bot{padding-bottom:calc(10px + env(safe-area-inset-bottom))}
}

/* === TOUCH-FRIENDLY === */
@media(hover:none) and (pointer:coarse){
  .ni{min-height:44px;padding:12px}
  .btn{min-height:44px}
  .btn-s{min-height:36px;padding:6px 12px}
  tr:hover td{background:inherit}
  .sc:hover{transform:none;box-shadow:var(--sh)}
}

/* === ANIMATIONS === */
@keyframes modalIn{from{opacity:0;transform:scale(.95) translateY(10px)}to{opacity:1;transform:scale(1) translateY(0)}}
@keyframes pageIn{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}}</style></head><body>
<div class="app">
<nav class="sb" id="sb">
<div class="sb-top"><div class="sb-brand"><div class="ic">📊</div><div><h1>Trade Journal</h1><p>v1.0</p></div></div><button class="sb-close" onclick="document.getElementById('sb').classList.remove('open')">✕</button></div>
<div class="nav">
<div class="ni on" onclick="go('dash')" data-p="dash"><span class="ic">📊</span><span data-i18n="nDash">داشبورد</span></div>
<div class="ni" onclick="go('trades')" data-p="trades"><span class="ic">📋</span><span data-i18n="nTrades">تریدها</span></div>
<div class="ni" onclick="go('add')" data-p="add"><span class="ic">➕</span><span data-i18n="nAdd">ثبت ترید</span></div>
<div class="ni" onclick="go('strategies')" data-p="strategies"><span class="ic">🎯</span><span data-i18n="nStrat">استراتژیها</span></div>
<div class="ni" onclick="go('journal')" data-p="journal"><span class="ic">📝</span><span data-i18n="nJournal">ژورنال روزانه</span></div>
<div class="ni" onclick="go('accounts')" data-p="accounts"><span class="ic">💰</span><span data-i18n="nAcc">حسابها</span></div>
</div>
<div class="sb-bot">
<button onclick="toggleTheme()" id="themeBtn">🌙</button>
<button onclick="toggleLang()" id="langBtn">🇺🇸</button>
<button onclick="location.href='/logout'">🚪</button>
</div>
</nav>
<nav class="bottom-bar" id="bottomBar">
<div class="bb-item on" onclick="go('dash')" data-p="dash"><span class="bb-ic">📊</span><span data-i18n="nDash">داشبورد</span></div>
<div class="bb-item" onclick="go('trades')" data-p="trades"><span class="bb-ic">📋</span><span data-i18n="nTrades">تریدها</span></div>
<div class="bb-item" onclick="go('add')" data-p="add"><span class="bb-ic">➕</span><span data-i18n="nAdd">ثبت</span></div>
<div class="bb-item" onclick="go('strategies')" data-p="strategies"><span class="bb-ic">🎯</span><span data-i18n="nStrat">استراتژی</span></div>
<div class="bb-item" onclick="go('accounts')" data-p="accounts"><span class="bb-ic">💰</span><span data-i18n="nAcc">حسابها</span></div>
</nav>
<header class="top-bar" id="topBar">
<div class="tb-left">
<button class="menu-t" onclick="document.getElementById('sb').classList.toggle('open')">☰</button>
<button class="tb-toggle" onclick="toggleSidebar()">☰</button>
<div class="tb-title"><h2 id="pageTitle">داشبورد</h2></div>
<span class="tb-clock" id="tbClock"></span>
</div>
<div class="tb-right">
<div class="tb-acct"><span class="acct-icon">💰</span><select id="tbAccount" onchange="onAccountChange()"><option value="">همه حسابها</option></select><span class="acct-arrow">▾</span></div>
<button class="tb-btn" onclick="toggleTheme()" id="tbThemeBtn" aria-label="تغییر تم">🌙</button>
<button class="tb-btn" onclick="toggleLang()" id="tbLangBtn" aria-label="تغییر زبان">🇺🇸</button>
</div>
</header>
<div class="mn">

<!-- DASHBOARD -->
<div class="page on" id="p-dash">
<div class="hd"><div><h2 data-i18n="dashTitle">داشبورد</h2><div class="sub" data-i18n="dashSub">خلاصه عملکرد</div></div>
<div class="hd-act"><button class="btn btn-p" onclick="go('add')">➕ <span data-i18n="newTrade">ترید جدید</span></button><button class="btn btn-g" onclick="loadDash()">🔄</button><div class="export-grp"><button class="btn btn-export btn-pdf" onclick="exportDashPDF()">📄 <span>PDF</span></button><button class="btn btn-export btn-excel" onclick="exportDashExcel()">📊 <span>Excel</span></button></div></div></div>

<div class="mini-bar" id="miniBar">
<div class="mini-item info"><span class="mi-icon">📅</span><span class="mi-lbl">امروز:</span><span class="mi-val" id="mb-today">-</span></div>
<div class="mini-item info"><span class="mi-icon">🔥</span><span class="mi-lbl">استریک:</span><span class="mi-val" id="mb-streak">-</span></div>
<div class="mini-item warn"><span class="mi-icon">📉</span><span class="mi-lbl">MA:</span><span class="mi-val" id="mb-mdd">-</span></div>
<div class="mini-item info"><span class="mi-icon">💰</span><span class="mi-lbl">کارمزد:</span><span class="mi-val" id="mb-fees">-</span></div>
<div class="mini-item info"><span class="mi-icon">📊</span><span class="mi-lbl">RR:</span><span class="mi-val" id="mb-rr">-</span></div>
</div>

<div class="sr">
<div class="sc c1"><div class="tp"><div class="icon">💰</div><span class="badge" data-i18n="totalPnl">سود کل</span></div><div class="val" id="d-pnl">-</div><div class="sub" data-i18n="allTime">از ابتدا</div></div>
<div class="sc c2"><div class="tp"><div class="icon">📈</div><span class="badge" data-i18n="winRate">نرخ برد</span></div><div class="val" id="d-wr">-</div><div class="sub" id="d-wrSub">-</div></div>
<div class="sc c3"><div class="tp"><div class="icon">📊</div><span class="badge" data-i18n="totalTrades">کل تریدها</span></div><div class="val" id="d-total">-</div><div class="sub" id="d-totalSub">-</div></div>
<div class="sc c4"><div class="tp"><div class="icon">⚡</div><span class="badge" data-i18n="profitFactor">فاکتور سود</span></div><div class="val" id="d-pf">-</div><div class="sub" data-i18n="openTrades">تریدهای باز</div></div>
</div>

<div class="sr">
<div class="sc c2"><div class="tp"><div class="icon">✅</div><span class="badge" data-i18n="wins">بردها</span></div><div class="val" id="d-wins">-</div><div class="sub" id="d-avgWin">-</div></div>
<div class="sc c3"><div class="tp"><div class="icon">❌</div><span class="badge" data-i18n="losses">باختها</span></div><div class="val" id="d-losses">-</div><div class="sub" id="d-avgLoss">-</div></div>
<div class="sc c1"><div class="tp"><div class="icon">🏆</div><span class="badge" data-i18n="best">بهترین</span></div><div class="val" id="d-best">-</div></div>
<div class="sc c3"><div class="tp"><div class="icon">💔</div><span class="badge" data-i18n="worst">بدترین</span></div><div class="val" id="d-worst">-</div></div>
</div>

<div class="cb"><div class="cb-hd"><h3 data-i18n="equityCurve">📈 منحنی سود</h3><span class="badge" id="eqTotal">0</span></div><div class="ca" id="eqChart"></div></div>

<div class="g2">
<div class="pnl"><div class="pnl-hd"><h3 data-i18n="byStrategy">🎯 بر اساس استراتژی</h3></div><div id="stratBox"></div></div>
<div class="pnl"><div class="pnl-hd"><h3 data-i18n="bySymbol">💱 بر اساس نماد</h3></div><div id="symBox"></div></div>
</div>

<div class="g2">
<div class="pnl"><div class="pnl-hd"><h3 data-i18n="monthlyPnl">📅 سود ماهانه</h3></div><div class="ca" id="monthChart" style="height:140px"></div></div>
<div class="pnl"><div class="pnl-hd"><h3 data-i18n="direction">📊 جهت معاملات</h3></div><div id="dirBox" style="padding:18px"></div></div>
</div>

<div class="pnl" style="margin-top:12px"><div class="pnl-hd"><h3 data-i18n="recentTrades">🕐 آخرین تریدها</h3></div><div id="recentTradesBox" style="max-height:200px;overflow-y:auto"></div></div>
</div>

<!-- TRADES LIST -->
<div class="page" id="p-trades">
<div class="hd"><div><h2 data-i18n="tradesTitle">تریدها</h2><div class="sub" data-i18n="tradesSub">لیست تمام تریدها</div></div>
<div class="hd-act"><button class="btn btn-p" onclick="go('add')">➕</button> <div class="export-grp"><button class="btn btn-export btn-pdf" onclick="exportPDF()">📄 <span>PDF</span></button><button class="btn btn-export btn-excel" onclick="exportExcel()">📊 <span>Excel</span></button><button class="btn btn-export btn-import" onclick="importCSVModal()">📥 <span>Import</span></button></div></div></div>
<div class="trades-page">
<div class="tp-head"><div class="tp-title"><h2 data-i18n="tradesTitle">تریدها</h2><span class="tp-count" id="t-total">0</span></div><div class="tp-actions"><button class="btn btn-p btn-sm" onclick="go('add')">➕ افزودن</button><button class="btn btn-s btn-g btn-sm" onclick="exportPDF()">📄</button><button class="btn btn-s btn-g btn-sm" onclick="exportExcel()">📊</button></div></div>
<div class="tp-stats"><div class="tp-stat"><div class="tp-stat-val" id="t-total2">-</div><div class="tp-stat-lbl" data-i18n="totalTrades">کل</div></div><div class="tp-stat"><div class="tp-stat-val" id="t-open">-</div><div class="tp-stat-lbl" data-i18n="openTrades">باز</div></div><div class="tp-stat"><div class="tp-stat-val" id="t-pnl">-</div><div class="tp-stat-lbl" data-i18n="totalPnl">سود کل</div></div></div>
<div class="tp-search"><span class="tp-search-ico">🔍</span><input type="text" id="f-sym" placeholder="جستجوی نماد..." oninput="debounceSearch()"></div>
<div class="tp-filters"><select id="f-dir" onchange="loadTrades()"><option value="">همه جهتها</option><option value="long">Long</option><option value="short">Short</option></select><select id="f-status" onchange="loadTrades()"><option value="">همه وضعیتها</option><option value="open">باز</option><option value="closed">بسته</option></select><select id="f-strat" onchange="loadTrades()"><option value="">همه استراتژیها</option></select><select id="f-sort" onchange="loadTrades()"><option value="date_desc">تاریخ ↓</option><option value="date_asc">تاریخ ↑</option><option value="pnl_desc">سود ↓</option><option value="pnl_asc">سود ↑</option></select></div>
<div class="tp-table"><table><thead><tr><th data-i18n="thSymbol">نماد</th><th data-i18n="thDir">جهت</th><th data-i18n="thEntry">ورود</th><th data-i18n="thExit">خروج</th><th data-i18n="thPnl">سود</th><th data-i18n="thStrategy">استراتژی</th><th data-i18n="thDate">تاریخ</th><th data-i18n="thActions">عملیات</th><th>📸</th><th>منبع</th></tr></thead><tbody id="tradesTable"></tbody></table></div>
<div id="tradesCards"></div>
</div>
</div>

<!-- ADD TRADE -->
<div class="page" id="p-add">
<div class="hd"><div><h2 data-i18n="addTitle">ثبت ترید جدید</h2></div></div>
<div class="pnl" style="padding:24px">
<div class="fg-r">
<div class="fg"><label data-i18n="fSymbol">نماد *</label><input type="text" id="a-sym" placeholder="BTC/USDT"></div>
<div class="fg"><label data-i18n="fDirection">جهت *</label><select id="a-dir"><option value="long">🟢 Long</option><option value="short">🔴 Short</option></select></div>
</div>
<div class="fg-r3">
<div class="fg"><label data-i18n="fEntry">قیمت ورود *</label><input type="number" step="any" id="a-entry"></div>
<div class="fg"><label data-i18n="fExit">قیمت خروج</label><input type="number" step="any" id="a-exit"></div>
<div class="fg"><label data-i18n="fLot">لاتیج</label><select id="a-lot"><option value="0.01">0.01 (Micro)</option><option value="0.1">0.1 (Mini)</option><option value="0.5">0.5</option><option value="1" selected>1 (Standard)</option><option value="2">2</option><option value="5">5</option><option value="10">10</option></select></div>
</div>
<div class="fg-r3">
<div class="fg"><label data-i18n="fSL">استاپ لاس</label><input type="number" step="any" id="a-sl"></div>
<div class="fg"><label data-i18n="fTP">تیک پروفیت</label><input type="number" step="any" id="a-tp"></div>
<div class="fg"><label data-i18n="fFees">کارمزد</label><input type="number" step="any" id="a-fees" value="0"></div>
</div>
<div class="fg-r">
<div class="fg"><label data-i18n="fStrategy">استراتژی</label><select id="a-strat"></select></div>
<div class="fg"><label data-i18n="fAccount">حساب</label><select id="a-acc"></select></div>
</div>
<div class="fg-r3">
<div class="fg"><label data-i18n="fEntryDate">تاریخ ورود *</label><input type="datetime-local" id="a-edate"></div>
<div class="fg"><label data-i18n="fExitDate">تاریخ خروج</label><input type="datetime-local" id="a-xdate"></div>
<div class="fg"><label data-i18n="fTimeframe">تایم فریم</label><select id="a-tf"><option value="M1">M1</option><option value="M5">M5</option><option value="M15">M15</option><option value="M30">M30</option><option value="H1" selected>H1</option><option value="H4">H4</option><option value="D1">D1</option><option value="W1">W1</option><option value="MN">MN</option></select></div>
</div>
<div class="fg"><label data-i18n="fEmotion">احساسات</label>
<div class="emotion" id="a-emo">
<span onclick="setEmo(this,'😊')" data-e="😊">😊</span><span onclick="setEmo(this,'😐')" data-e="😐">😐</span><span onclick="setEmo(this,'😰')" data-e="😰">😰</span><span onclick="setEmo(this,'😤')" data-e="😤">😤</span><span onclick="setEmo(this,'🤑')" data-e="🤑">🤑</span><span onclick="setEmo(this,'😱')" data-e="😱">😱</span><span onclick="setEmo(this,'🤔')" data-e="🤔">🤔</span><span onclick="setEmo(this,'😎')" data-e="😎">😎</span>
</div></div>
<div class="fg"><label data-i18n="fRating">امتیاز</label>
<div class="stars" id="a-stars"><span onclick="setRate(1)">⭐</span><span onclick="setRate(2)">⭐</span><span onclick="setRate(3)">⭐</span><span onclick="setRate(4)">⭐</span><span onclick="setRate(5)">⭐</span></div></div>
<div class="fg"><label data-i18n="fNotes">یادداشت</label><textarea id="a-notes" rows="3" placeholder="چرا این ترید رو گرفتی؟"></textarea></div>
<div class="fg"><label>عکس اسکرین‌شات</label><div class="img-upload"><input type="file" id="a-scr" accept="image/*" onchange="uploadScreenshot(this.files[0],null)"><div id="a-scr-preview" class="img-preview"></div></div></div>
<div class="m-act"><button class="btn btn-p" onclick="saveTrade()" data-i18n="save">💾 ذخیره</button><button class="btn btn-g" onclick="go('trades')" data-i18n="cancel">انصراف</button></div>
</div>
</div>

<!-- STRATEGIES -->
<div class="page" id="p-strategies">
<div class="hd"><div><h2 data-i18n="stratTitle">استراتژیها</h2></div><button class="btn btn-p" onclick="showModal('m-strat')">+ <span data-i18n="addStrat">افزودن</span></button></div>
<div class="pnl acc-table-wrap"><table><thead><tr><th>نام</th><th>توضیحات</th><th>تریدها</th><th>سود</th><th>نرخ برد</th><th>عملیات</th></tr></thead><tbody id="stratTable"></tbody></table></div>
</div>

<!-- DAILY JOURNAL -->
<div class="page" id="p-journal">
<div class="hd"><div><h2 data-i18n="journalTitle">ژورنال روزانه</h2></div><button class="btn btn-p" onclick="showModal('m-journal')">+ <span data-i18n="addEntry">ثبت</span></button></div>
<div id="journalBox"></div>
</div>

<!-- ACCOUNTS -->
<div class="page" id="p-accounts">
<div class="hd"><div><h2 data-i18n="accTitle">حسابها</h2></div><button class="btn btn-p" onclick="showModal('m-acc')">+ <span data-i18n="addAcc">افزودن</span></button></div>
<div class="pnl acc-table-wrap"><table><thead><tr><th>نام</th><th>موجودی</th><th>ارز</th><th>بروکر</th><th>لوریج</th><th>پیشفرض</th><th>عملیات</th></tr></thead><tbody id="accTable"></tbody></table></div>
</div>

</div>
</div>

<!-- MODALS -->
<div class="m-bg" id="m-strat"><div class="modal">
<h3 data-i18n="addStratModal">افزودن استراتژی</h3>
<div class="fg"><label>نام</label><input type="text" id="st-name"></div>
<div class="fg"><label>توضیحات</label><input type="text" id="st-desc"></div>
<div class="fg"><label>قوانین</label><textarea id="st-rules" rows="3"></textarea></div>
<div class="fg"><label>رنگ</label><input type="color" id="st-color" value="#6366f1"></div>
<div class="m-act"><button class="btn btn-p" onclick="saveStrat()">ذخیره</button><button class="btn btn-g" onclick="hideModal('m-strat')">انصراف</button></div>
</div></div>

<div class="m-bg" id="m-journal"><div class="modal">
<h3>ثبت ژورنال روزانه</h3>
<div class="fg"><label>تاریخ</label><input type="date" id="j-date"></div>
<div class="fg"><label>حال و هوا</label><div class="emotion" id="j-mood"><span onclick="this.parentElement.querySelectorAll('span').forEach(s=>s.classList.remove('sel'));this.classList.add('sel')" data-e="😊">😊</span><span onclick="this.parentElement.querySelectorAll('span').forEach(s=>s.classList.remove('sel'));this.classList.add('sel')" data-e="😐">😐</span><span onclick="this.parentElement.querySelectorAll('span').forEach(s=>s.classList.remove('sel'));this.classList.add('sel')" data-e="😰">😰</span><span onclick="this.parentElement.querySelectorAll('span').forEach(s=>s.classList.remove('sel'));this.classList.add('sel')" data-e="😤">😤</span><span onclick="this.parentElement.querySelectorAll('span').forEach(s=>s.classList.remove('sel'));this.classList.add('sel')" data-e="🤑">🤑</span></div></div>
<div class="fg"><label>شرایط بازار</label><textarea id="j-market" rows="2"></textarea></div>
<div class="fg"><label>یادداشت</label><textarea id="j-notes" rows="3"></textarea></div>
<div class="fg"><label>درسهای امروز</label><textarea id="j-lessons" rows="2"></textarea></div>
<div class="m-act"><button class="btn btn-p" onclick="saveJournal()">ذخیره</button><button class="btn btn-g" onclick="hideModal('m-journal')">انصراف</button></div>
</div></div>

<div class="m-bg" id="m-acc"><div class="modal">
<h3>افزودن حساب</h3>
<div class="fg"><label>نام</label><input type="text" id="ac-name"></div>
<div class="fg-r3">
<div class="fg"><label>موجودی</label><input type="number" id="ac-bal"></div>
<div class="fg"><label>ارز</label><select id="ac-cur"><option>USD</option><option>EUR</option><option>IRR</option><option>USDT</option></select></div>
<div class="fg"><label>لوریج</label><select id="ac-lev"><option value="1">1:1</option><option value="10">1:10</option><option value="20">1:20</option><option value="50">1:50</option><option value="100" selected>1:100</option><option value="200">1:200</option><option value="500">1:500</option><option value="1000">1:1000</option></select></div>
</div>
<div class="fg"><label>بروکر</label><input type="text" id="ac-broker"></div>
<div class="m-act"><button class="btn btn-p" onclick="saveAcc()">ذخیره</button><button class="btn btn-g" onclick="hideModal('m-acc')">انصراف</button></div>
</div></div>

<div class="m-bg" id="m-edit-acc"><div class="modal">
<h3>ویرایش حساب</h3>
<div class="fg"><label>نام</label><input type="text" id="ea-name"></div>
<div class="fg-r3">
<div class="fg"><label>موجودی</label><input type="number" id="ea-bal"></div>
<div class="fg"><label>ارز</label><select id="ea-cur"><option>USD</option><option>EUR</option><option>IRR</option><option>USDT</option></select></div>
<div class="fg"><label>لوریج</label><select id="ea-lev"><option value="1">1:1</option><option value="10">1:10</option><option value="20">1:20</option><option value="50">1:50</option><option value="100">1:100</option><option value="200">1:200</option><option value="500">1:500</option><option value="1000">1:1000</option></select></div>
</div>
<div class="fg"><label>بروکر</label><input type="text" id="ea-broker"></div>
<div class="m-act"><button class="btn btn-p" onclick="saveEditAcc()">💾 ذخیره</button><button class="btn btn-g" onclick="hideModal('m-edit-acc')">انصراف</button></div>
</div></div>

<div class="m-bg" id="m-close"><div class="modal">
<h3>بستن ترید</h3>
<div class="fg"><label>قیمت خروج *</label><input type="number" step="any" id="cl-price"></div>
<div class="fg"><label>تاریخ خروج *</label><input type="datetime-local" id="cl-date"></div>
<div class="fg"><label>کارمزد</label><input type="number" step="any" id="cl-fees" value="0"></div>
<div class="m-act"><button class="btn btn-p" onclick="doCloseTrade()">بستن ترید</button><button class="btn btn-g" onclick="hideModal('m-close')">انصراف</button></div>
</div></div>

<div class="m-bg" id="m-screenshot"><div class="modal sc-viewer"><div class="sc-wrap" id="scWrap"><img id="screenshot-img" src=""></div><div class="sc-bar"><button class="sc-btn" onclick="scZoom(1/1.2)">🔍⁻</button><button class="sc-btn" onclick="scReset()">🔲</button><button class="sc-btn" onclick="scZoom(1.2)">🔍⁺</button><button class="sc-btn sc-close" onclick="hideModal('m-screenshot')">✕</button></div></div></div>

<div class="m-bg" id="m-edit-trade"><div class="modal">
<h3>ویرایش ترید</h3>
<div class="fg-r">
<div class="fg"><label>نماد</label><input type="text" id="et-sym"></div>
<div class="fg"><label>جهت</label><select id="et-dir"><option value="long">🟢 Long</option><option value="short">🔴 Short</option></select></div>
</div>
<div class="fg-r3">
<div class="fg"><label>قیمت ورود</label><input type="number" step="any" id="et-entry"></div>
<div class="fg"><label>قیمت خروج</label><input type="number" step="any" id="et-exit"></div>
<div class="fg"><label>لاتیج</label><input type="number" step="any" id="et-lot" value="0.01"></div>
</div>
<div class="fg-r3">
<div class="fg"><label>استاپ لاس</label><input type="number" step="any" id="et-sl"></div>
<div class="fg"><label>تیک پروفیت</label><input type="number" step="any" id="et-tp"></div>
<div class="fg"><label>کارمزد</label><input type="number" step="any" id="et-fees" value="0"></div>
</div>
<div class="fg-r">
<div class="fg"><label>استراتژی</label><select id="et-strat"></select></div>
<div class="fg"><label>حساب</label><select id="et-acc"></select></div>
</div>
<div class="fg-r">
<div class="fg"><label>تاریخ ورود</label><input type="datetime-local" id="et-edate"></div>
<div class="fg"><label>تاریخ خروج</label><input type="datetime-local" id="et-xdate"></div>
</div>
<div class="fg"><label>لینک اسکرینشات</label><input type="url" id="et-screenshot" placeholder="https://..."></div>
<div class="fg"><label>عکس اسکرین‌شات</label><div class="img-upload"><input type="file" id="et-scr" accept="image/*" onchange="uploadScreenshot(this.files[0],_editTradeId)"><div id="et-scr-preview" class="img-preview"></div></div></div>
<div class="fg"><label>یادداشت</label><textarea id="et-notes" rows="3"></textarea></div>
<div class="m-act"><button class="btn btn-p" onclick="saveEditTrade()">💾 ذخیره</button><button class="btn btn-g" onclick="hideModal('m-edit-trade')">انصراف</button></div>
</div></div>

<div class="m-bg" id="m-import"><div class="modal">
<div class="m-hd"><h3>📥 <span data-i18n="importCSV">Import از متاتریدر</span></h3><button class="m-cl" onclick="hideModal('m-import')">×</button></div>
<div style="padding:16px">
  <div class="field"><label>حساب مقصد</label><select id="imp-account"></select></div>
  <div class="field"><label>فایل CSV / Excel</label><label for="imp-file" style="display:block;padding:20px;border:2px dashed var(--b2);border-radius:8px;background:var(--b2);cursor:pointer;text-align:center;font-size:14px;color:var(--t2);margin-top:6px">📂 فایل رو اینجا لمس کنید<br><small>.csv .xlsx .xls .html</small></label><input type="file" id="imp-file" accept=".csv,.xlsx,.xls,.html" style="display:none"></div>
  <div style="background:var(--b2);padding:10px;border-radius:8px;font-size:12px;color:var(--t3);margin:8px 0">
    💡 فرمت: <b>Open Time, Type, Symbol, Volume, Price, S/L, T/P, Close Time, Close Price, Commission, Swap, Profit</b>
  </div>
  <div id="imp-status" style="margin:8px 0;padding:8px;display:none"></div>
</div>
<div class="m-act"><button class="btn btn-p" onclick="doImportCSV()">📥 Import</button><button class="btn btn-g" onclick="hideModal('m-import')">انصراف</button></div>
</div></div>

<div class="toast" id="toast"></div>

<script>
// === i18n ===
const T={
fa:{nDash:'داشبورد',nTrades:'تریدها',nAdd:'ثبت ترید',nStrat:'استراتژیها',nJournal:'ژورنال روزانه',nAcc:'حسابها',
dashTitle:'داشبورد',dashSub:'خلاصه عملکرد',newTrade:'ترید جدید',totalPnl:'سود کل',winRate:'نرخ برد',totalTrades:'کل تریدها',profitFactor:'فاکتور سود',openTrades:'تریدهای باز',open:'باز',wins:'بردها',losses:'باختها',best:'بهترین',worst:'بدترین',allTime:'از ابتدا',
equityCurve:'📈 منحنی سود',byStrategy:'🎯 بر اساس استراتژی',bySymbol:'💱 بر اساس نماد',monthlyPnl:'📅 سود ماهانه',direction:'📊 جهت معاملات',
tradesTitle:'تریدها',tradesSub:'لیست تمام تریدها',thSymbol:'نماد',thDir:'جهت',thEntry:'ورود',thExit:'خروج',thPnl:'سود',thStrategy:'استراتژی',thDate:'تاریخ',thActions:'عملیات',
addTitle:'ثبت ترید جدید',fSymbol:'نماد',fDirection:'جهت',fEntry:'قیمت ورود',fExit:'قیمت خروج',fLot:'لاتیج',fSL:'استاپ لاس',fTP:'تیک پروفیت',fFees:'کارمزد',fStrategy:'استراتژی',fAccount:'حساب',fTimeframe:'تایم فریم',fEntryDate:'تاریخ ورود',fExitDate:'تاریخ خروج',fEmotion:'احساسات',fRating:'امتیاز',fNotes:'یادداشت',
stratTitle:'استراتژیها',addStrat:'افزودن',addStratModal:'افزودن استراتژی',journalTitle:'ژورنال روزانه',addEntry:'ثبت',accTitle:'حسابها',addAcc:'افزودن',
save:'💾 ذخیره',cancel:'انصراف',close:'بستن',delete:'حذف',edit:'ویرایش',
saved:'✅ ذخیره شد',deleted:'🗑️ حذف شد',err:'❌ خطا',required:'فیلدهای الزامی را پر کنید',
noTrades:'تریدی ثبت نشده',noStrat:'استراتژی ثبت نشده',noJournal:'ژورنالی ثبت نشده',noAcc:'حسابی ثبت نشده',recentTrades:'🕐 آخرین تریدها',timeframe:'تایم فریم',allAccounts:'همه حسابها',
confirmDel:'آیا مطمئنید؟',win:'برد',loss:'باخت',breakeven:'سرسری',importCSV:'Import از متاتریدر'},
en:{nDash:'Dashboard',nTrades:'Trades',nAdd:'Add Trade',nStrat:'Strategies',nJournal:'Daily Journal',nAcc:'Accounts',
dashTitle:'Dashboard',dashSub:'Performance summary',newTrade:'New Trade',totalPnl:'Total P&L',winRate:'Win Rate',totalTrades:'Total Trades',profitFactor:'Profit Factor',openTrades:'Opens',open:'Opens',wins:'Wins',losses:'Losses',best:'Best',worst:'Worst',allTime:'All time',
equityCurve:'📈 Equity Curve',byStrategy:'🎯 By Strategy',bySymbol:'💱 By Symbol',monthlyPnl:'📅 Monthly P&L',direction:'📊 Direction',
tradesTitle:'Trades',tradesSub:'All trades list',thSymbol:'Symbol',thDir:'Dir',thEntry:'Entry',thExit:'Exit',thPnl:'P&L',thStrategy:'Strategy',thDate:'Date',thActions:'Actions',
addTitle:'Add New Trade',fSymbol:'Symbol',fDirection:'Direction',fEntry:'Entry Price',fExit:'Exit Price',fLot:'Lot Size',fSL:'Stop Loss',fTP:'Take Profit',fFees:'Fees',fStrategy:'Strategy',fAccount:'Account',fTimeframe:'Timeframe',fEntryDate:'Entry Date',fExitDate:'Exit Date',fEmotion:'Emotion',fRating:'Rating',fNotes:'Notes',
stratTitle:'Strategies',addStrat:'Add',addStratModal:'Add Strategy',journalTitle:'Daily Journal',addEntry:'Add',accTitle:'Accounts',addAcc:'Add',
save:'💾 Save',cancel:'Cancel',close:'Close',delete:'Delete',edit:'Edit',
saved:'✅ Saved',deleted:'🗑️ Deleted',err:'❌ Error',required:'Fill required fields',
noTrades:'No trades yet',noStrat:'No strategies yet',noJournal:'No journal entries yet',noAcc:'No accounts yet',recentTrades:'🕐 Recent Trades',timeframe:'Timeframe',allAccounts:'All Accounts',
confirmDel:'Are you sure?',win:'Win',loss:'Loss',breakeven:'Breakeven',importCSV:'Import from MT5'}};
let L=localStorage.getItem('lang')||'fa';
let TH=localStorage.getItem('theme')||'light';
let selectedEmo='';
let selectedRate=0;
let strategies=[];

function t(k){return(T[L]||T.fa)[k]||k}
function applyI18n(){
document.querySelectorAll('[data-i18n]').forEach(el=>{const k=el.getAttribute('data-i18n');if(T[L]&&T[L][k])el.textContent=T[L][k]});
document.documentElement.lang=L;document.documentElement.dir=L==='fa'?'rtl':'ltr';
document.getElementById('langBtn').textContent=L==='fa'?'🇺🇸':'🇮🇷';
document.getElementById('themeBtn').textContent=TH==='dark'?'☀️':'🌙';
const tbT=document.getElementById('tbThemeBtn');if(tbT)tbT.textContent=TH==='dark'?'☀️':'🌙';
const tbL=document.getElementById('tbLangBtn');if(tbL)tbL.textContent=L==='fa'?'🇺🇸':'🇮🇷';
}
function toggleLang(){L=L==='fa'?'en':'fa';localStorage.setItem('lang',L);applyI18n();go(document.querySelector('.ni.on')?.dataset.p||'dash');updateClock();updateAccountSelectorText();}
function setTheme(t){TH=t;localStorage.setItem('theme',t);document.documentElement.setAttribute('data-theme',t);applyI18n()}
function toggleTheme(){setTheme(TH==='dark'?'light':'dark')}
setTheme(TH);

function go(p){document.querySelectorAll('.page').forEach(x=>x.classList.remove('on'));document.getElementById('p-'+p)?.classList.add('on');document.querySelectorAll('.ni').forEach(x=>x.classList.toggle('on',x.dataset.p===p));document.querySelectorAll('.bb-item').forEach(x=>x.classList.toggle('on',x.dataset.p===p));document.getElementById('sb').classList.remove('open');const tl=pageNames[L]||pageNames.fa;const ti=document.getElementById('pageTitle');if(ti)ti.textContent=tl[p]||p;if(p==='dash')loadDash();else if(p==='trades')loadTrades();else if(p==='add')loadAddForm();else if(p==='strategies')loadStrategies();else if(p==='journal')loadJournal();else if(p==='accounts')loadAccounts()}
function toast(m,d=3000){const el=document.getElementById('toast');el.textContent=m;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),d)}
function showModal(id){document.getElementById(id).classList.add('show')}
function hideModal(id){document.getElementById(id).classList.remove('show')}
function setEmo(el,emo){el.parentElement.querySelectorAll('span').forEach(s=>s.classList.remove('sel'));el.classList.add('sel');selectedEmo=emo}
function setRate(n){selectedRate=n;document.querySelectorAll('#a-stars span').forEach((s,i)=>s.classList.toggle('on',i<n))}
function fmt(n){return n!=null?(n>=0?'+':'')+n.toFixed(2):'-'}
function fmtP(n){return n!=null?(n>=0?'+':'')+n.toFixed(1)+'%':'-'}
function pnlClass(n){return n>0?'pos':n<0?'neg':''}
async function api(p,m='GET',b=null){const tk=localStorage.getItem('tj_token');const u=p+(tk?(p.includes('?')?'&':'?')+'token='+encodeURIComponent(tk):'');const isForm=b instanceof FormData;const o={method:m,credentials:'include'};if(!isForm)o.headers={'Content-Type':'application/json'};if(b)o.body=isForm?b:JSON.stringify(b);const r=await fetch(u,o);if(r.status===401){location.href='/login';return{}}return r.json()}
function drawChart(id,data,c1,c2){const el=document.getElementById(id);if(!el)return;el.innerHTML='';if(!data||!data.length){el.innerHTML='<div class="empty">'+t('noTrades')+'</div>';return}const mx=Math.max(...data.map(d=>Math.abs(d.v)),1);data.forEach(d=>{const col=document.createElement('div');col.className='cc';const bar=document.createElement('div');bar.className='cbar';const h=Math.max(Math.abs(d.v)/mx*100,3);bar.style.height=h+'%';bar.style.background=d.v>=0?'linear-gradient(to top,#059669,#34d399)':'linear-gradient(to top,#dc2626,#f87171)';bar.innerHTML='<div class="tip">'+(d.l||'')+': '+d.v.toFixed(2)+'</div>';col.appendChild(bar);const lbl=document.createElement('span');lbl.className='clbl';lbl.textContent=d.sl||'';col.appendChild(lbl);el.appendChild(col)})}

// === DASHBOARD ===
async function loadDash(){
try{
const acct=getSelectedAccount();const s=await api('/api/stats'+(acct?'?account_id='+acct:''));
document.getElementById('d-pnl').textContent=fmt(s.totalPnl);document.getElementById('d-pnl').className='val '+pnlClass(s.totalPnl);
document.getElementById('d-wr').textContent=s.winRate+'%';document.getElementById('d-wrSub').textContent=s.wins+'W / '+s.losses+'L';
document.getElementById('d-total').textContent=s.total;document.getElementById('d-totalSub').textContent=s.openTrades+' '+(L==='fa'?'باز':t('open'));
document.getElementById('d-pf').textContent=s.profitFactor;
document.getElementById('d-wins').textContent=s.wins;document.getElementById('d-avgWin').textContent='avg: '+fmt(s.avgWin);
document.getElementById('d-losses').textContent=s.losses;document.getElementById('d-avgLoss').textContent='avg: '+fmt(s.avgLoss);
document.getElementById('d-best').textContent=fmt(s.bestTrade);document.getElementById('d-best').className='val pos';
document.getElementById('d-worst').textContent=fmt(s.worstTrade);document.getElementById('d-worst').className='val neg';
document.getElementById('eqTotal').textContent=s.total+' trades';

// Mini stats bar
document.getElementById('mb-today').textContent=(s.todayTrades||0)+' '+(L==='fa'?'ترید':'trades')+' | '+fmt(s.todayPnl||0);
const mbToday=document.getElementById('mb-today').parentElement;
mbToday.className='mini-item '+(s.todayPnl>0?'pos':s.todayPnl<0?'neg':'info');
document.getElementById('mb-streak').textContent=(s.streak||0)+' '+(s.streakType==='win'?(L==='fa'?'برد':'Win'):(L==='fa'?'باخت':'Loss'));
const mbStreak=document.getElementById('mb-streak').parentElement;
mbStreak.className='mini-item '+(s.streakType==='win'?'pos':'neg');
document.getElementById('mb-mdd').textContent=fmt(s.maxDrawdown||0);
const mbDD=document.getElementById('mb-mdd').parentElement;
mbDD.className='mini-item '+(s.maxDrawdown>0?'warn':'info');
document.getElementById('mb-fees').textContent=fmt(s.totalFees||0);
document.getElementById('mb-rr').textContent=s.avgRR||'-';

// Equity chart
drawChart('eqChart',(s.equity||[]).map((e,i)=>({l:e.exit_date,sl:'#'+(i+1),v:e.cumulative})),'#4f46e5','#7c3aed');

// Monthly chart
drawChart('monthChart',(s.monthly||[]).filter(m=>m.month).map(m=>({l:m.month,sl:m.month.split('-')[1],v:m.pnl})),'#6366f1','#8b5cf6');

// Strategy breakdown
const sb=document.getElementById('stratBox');
sb.innerHTML=(s.byStrategy||[]).map(st=>'<div class="breakdown-row"><div class="breakdown-name"><span class="color-dot" style="background:'+esc(st.color)+'"></span><span>'+esc(st.name)+'</span></div><div class="breakdown-tags"><span class="tag tag-a">'+st.trades+' trades</span><span class="tag '+(st.total_pnl>=0?'tag-g':'tag-r')+'">'+fmt(st.total_pnl)+'</span><span class="tag tag-b">'+(st.trades>0?Math.round(st.wins/st.trades*100):0)+'%</span></div></div>').join('')||'<div class="empty">'+t('noStrat')+'</div>';

// Symbol breakdown
const sy=document.getElementById('symBox');
sy.innerHTML=(s.bySymbol||[]).map(y=>'<div class="breakdown-row"><span class="breakdown-name"><span>'+esc(y.symbol)+'</span></span><div class="breakdown-tags"><span class="tag tag-a">'+y.trades+'</span><span class="tag '+(y.total_pnl>=0?'tag-g':'tag-r')+'">'+fmt(y.total_pnl)+'</span></div></div>').join('')||'<div class="empty">-</div>';

// Direction
const dr=document.getElementById('dirBox');
dr.innerHTML='<div class="dir-box"><div class="dir-item"><div class="num" style="color:var(--g)">'+s.long.trades+'</div><div class="lbl-sm">Long</div><div class="pnl-sm" style="color:var(--g)">'+fmt(s.long.pnl)+'</div></div><div style="width:1px;background:var(--b)"></div><div class="dir-item"><div class="num" style="color:var(--r)">'+s.short.trades+'</div><div class="lbl-sm">Short</div><div class="pnl-sm" style="color:var(--r)">'+fmt(s.short.pnl)+'</div></div></div>';
// Recent trades
const rt=document.getElementById('recentTradesBox');
if(s.recentTrades&&s.recentTrades.length){
  rt.innerHTML=s.recentTrades.map(tr=>{
    const pc=tr.pnl>0?'tag-g':tr.pnl<0?'tag-r':'tag-a';
    return '<div class="breakdown-row"><div class="breakdown-name"><span style="font-weight:600">'+esc(tr.symbol)+'</span><span class="'+(tr.direction==='long'?'dir-l':'dir-s')+'">'+(tr.direction==='long'?'▲':'▼')+'</span>'+(tr.strategy_name?'<span class="tag tag-a" style="border-right:3px solid '+(tr.strategy_color||'#666')+'">'+esc(tr.strategy_name)+'</span>':'')+'</div><div class="breakdown-tags"><span class="tag '+pc+'">'+fmt(tr.pnl)+'</span><span class="time">'+esc(tr.exit_date||'')+'</span></div></div>';
  }).join('');
}else rt.innerHTML='<div class="empty">'+t('noTrades')+'</div>';
}catch(e){console.error(e)}
}

// === TRADES ===
async function loadTrades(){
try{
const sym=document.getElementById('f-sym').value;const dir=document.getElementById('f-dir').value;const status=document.getElementById('f-status').value;const strat=document.getElementById('f-strat').value;const sort=document.getElementById('f-sort').value;
const acct=getSelectedAccount();let url='/api/trades?limit=200';if(acct)url+='&account_id='+acct;if(sym)url+='&symbol='+sym;if(dir)url+='&direction='+dir;if(status)url+='&status='+status;if(strat)url+='&strategy='+strat;if(sort)url+='&sort='+sort;
const r=await api(url);const trades=r.trades||[];
document.getElementById('t-total').textContent=trades.length;
document.getElementById('t-total2').textContent=trades.length;
document.getElementById('t-open').textContent=trades.filter(t=>t.status==='open').length;
const totalPnl=trades.filter(t=>t.status==='closed').reduce((s,t)=>s+(t.pnl||0),0);
const pnlEl=document.getElementById('t-pnl');pnlEl.textContent=fmt(totalPnl);pnlEl.style.color=totalPnl>0?'var(--g)':totalPnl<0?'var(--r)':'';
document.getElementById('t-open').style.color=trades.filter(t=>t.status==='open').length>0?'var(--a)':'';
document.getElementById('tradesTable').innerHTML=trades.map(t=>{const sc=t.screenshot_url;const scUrl=sc&&sc.includes('drive.google')?'/api/proxy-image?url='+encodeURIComponent(fixDriveUrl(sc)):sc||'';const scBtn=scUrl
  ?'<img src="'+scUrl+'" onclick="viewScreenshot(this.dataset.u)" data-u="'+esc(sc||'')+'" style="width:40px;height:30px;object-fit:cover;border-radius:4px;cursor:pointer;border:1px solid var(--b)">'
  :'<button class="btn btn-s btn-g" title="افزودن عکس" onclick="editTradeModal('+t.id+')">📷+</button>';
return '<tr><td style="font-weight:600">'+esc(t.symbol)+'</td><td><span class="'+(t.direction==='long'?'dir-l':'dir-s')+'">'+(t.direction==='long'?'▲ Long':'▼ Short')+'</span></td><td>'+esc(t.entry_price)+'</td><td>'+(t.exit_price?esc(t.exit_price):'<span style="color:var(--t4)">-</span>')+'</td><td><span class="tag '+(t.pnl>0?'tag-g':t.pnl<0?'tag-r':'tag-a')+'">'+fmt(t.pnl)+'</span></td><td>'+(t.strategy_name?'<span class="tag tag-a" style="border-right:3px solid '+(t.strategy_color||'#666')+'">'+esc(t.strategy_name)+'</span>':'-')+'</td><td class="time">'+esc(t.entry_date||'')+'</td><td style="white-space:nowrap">'+(t.status==='open'?'<button class="btn btn-s btn-p" onclick="closeTradeModal('+t.id+')">بستن</button>':'')+' <button class="btn btn-s btn-g" onclick="editTradeModal('+t.id+')">✏️</button> <button class="btn btn-s btn-d" onclick="delTrade('+t.id+')">🗑️</button></td><td>'+scBtn+'</td>'+(t.source==='mt5'?'<td><span class="tag tag-b" title="MT5 #'+esc(t.mt5_ticket||'')+'">MT5</span></td>':'<td></td>')+'</tr>';
}).join('')||'<tr><td colspan="9"><div class="empty">'+t('noTrades')+'</div></td></tr>';
// Mobile cards
document.getElementById('tradesCards').innerHTML=trades.map(tr=>{
const pnl=tr.pnl||0;
const pnlCls=pnl>0?'tag-g':pnl<0?'tag-r':'tag-a';
const scUrl2=tr.screenshot_url&&tr.screenshot_url.includes('drive.google')?'/api/proxy-image?url='+encodeURIComponent(fixDriveUrl(tr.screenshot_url)):tr.screenshot_url||'';
const scHtml=scUrl2
  ?'<div class="tc-scr"><img src="'+esc(scUrl2)+'" onclick="viewScreenshot(this.dataset.u)" data-u="'+esc(tr.screenshot_url||'')+'" style="width:100%;max-height:200px;object-fit:cover;border-radius:8px;cursor:pointer;border:1px solid var(--b)">'
  :'';
return '<div class="trade-card" data-id="'+tr.id+'">'+scHtml+'<div class="tc-top"><span class="tc-sym">'+esc(tr.symbol)+'</span><span class="tc-dir '+(tr.direction)+'">'+(tr.direction==='long'?'▲ Long':'▼ Short')+'</span></div><div class="tc-row"><span>'+t('thEntry')+'</span><span>'+esc(tr.entry_price)+'</span></div><div class="tc-row"><span>'+t('thExit')+'</span><span>'+(tr.exit_price?esc(tr.exit_price):'<span style=color:var(--t4)>-</span>')+'</span></div><div class="tc-row"><span>'+t('thPnl')+'</span><span class="tag '+pnlCls+'">'+fmt(pnl)+'</span></div>'+(tr.strategy_name?'<div class="tc-row"><span>'+t('thStrategy')+'</span><span class="tag tag-a" style="border-right:3px solid '+(tr.strategy_color||'#666')+'">'+esc(tr.strategy_name)+'</span></div>':'')+(tr.entry_date?'<div class="tc-row"><span>'+t('thDate')+'</span><span>'+esc(tr.entry_date)+'</span></div>':'')+'<div class="tc-actions">'+(tr.status==='open'?'<button class="btn btn-s btn-p" onclick="closeTradeModal('+tr.id+')">'+t('close')+'</button>':'')+'<button class="btn btn-s btn-g" onclick="editTradeModal('+tr.id+')">✏️</button><button class="btn btn-s btn-d" onclick="delTrade('+tr.id+')">🗑️</button></div></div>';
}).join('')||'<div class="empty">'+t('noTrades')+'</div>';
}catch(e){console.error(e)}
}
function closeTradeModal(id){
  window._closeTradeId=id;
  document.getElementById('cl-price').value='';
  document.getElementById('cl-date').value=new Date().toISOString().slice(0,16);
  document.getElementById('cl-fees').value='0';
  showModal('m-close');
}
async function doCloseTrade(){
  const id=window._closeTradeId;
  const price=parseFloat(document.getElementById('cl-price').value);
  const date=document.getElementById('cl-date').value;
  const fees=parseFloat(document.getElementById('cl-fees').value)||0;
  if(!price||!date)return toast(t('required'));
  await api('/api/trades/'+id+'/close','POST',{exit_price:price,exit_date:date,fees});
  hideModal('m-close');toast(t('saved'));loadTrades();
}
async function delTrade(id){if(!confirm(t('confirmDel')))return;await api('/api/trades/'+id,'DELETE');toast(t('deleted'));loadTrades()}

let scScale=1,scX=0,scY=0,isDragging=false,dragX=0,dragY=0,lastTap=0;
function scApply(){const img=document.getElementById('screenshot-img');img.style.transform='translate('+scX+'px,'+scY+'px) scale('+scScale+')'}
function scZoom(f){scScale=Math.min(Math.max(scScale*f,0.2),5);scApply()}
function scReset(){scScale=1;scX=0;scY=0;scApply()}
const scImg=document.getElementById('screenshot-img');
if(scImg){
const wrap=document.getElementById('scWrap');
wrap.addEventListener('wheel',e=>{e.preventDefault();scZoom(e.deltaY>0?1/1.1:1.1)},{passive:false});
// Mouse drag
scImg.addEventListener('mousedown',e=>{e.preventDefault();isDragging=true;dragX=e.clientX-scX;dragY=e.clientY-scY});
window.addEventListener('mousemove',e=>{if(!isDragging)return;scX=e.clientX-dragX;scY=e.clientY-dragY;scApply()});
window.addEventListener('mouseup',()=>isDragging=false);
// Touch: 1 finger drag, 2 fingers pinch
let pinchStart=0,scaleStart=0;
wrap.addEventListener('touchstart',e=>{
if(e.touches.length===2){pinchStart=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);scaleStart=scScale;isDragging=false}
else if(e.touches.length===1){isDragging=true;dragX=e.touches[0].clientX-scX;dragY=e.touches[0].clientY-scY}
},{passive:true});
wrap.addEventListener('touchmove',e=>{
if(e.touches.length===2){e.preventDefault();const d=Math.hypot(e.touches[0].clientX-e.touches[1].clientX,e.touches[0].clientY-e.touches[1].clientY);if(pinchStart>0)scScale=Math.min(Math.max(scaleStart*(d/pinchStart),0.2),5);scApply()}
else if(e.touches.length===1&&isDragging){e.preventDefault();scX=e.touches[0].clientX-dragX;scY=e.touches[0].clientY-dragY;scApply()}
},{passive:false});
wrap.addEventListener('touchend',()=>{isDragging=false});
// Double-click to reset
scImg.addEventListener('dblclick',scReset);
}
function viewScreenshot(url){if(!url)return;const u=url.includes('drive.google')?'/api/proxy-image?url='+encodeURIComponent(fixDriveUrl(url)):url;document.getElementById('screenshot-img').src=u;showModal('m-screenshot')}
function fixDriveUrl(url){if(!url)return url;if(url.indexOf('drive.google.com/file/d/')===-1)return url;var id=url.split('/d/')[1];if(!id)return url;return 'https://drive.google.com/uc?export=view&id='+id.split('/')[0]}

async function uploadScreenshot(file,tradeId){
if(!file)return;
toast('در حال آپلود...');
try{
const fd=new FormData();
fd.append('key','a5d3fea6976a3092499ff78d830908bb');
fd.append('image',file);
const r=await fetch('https://api.imgbb.com/1/upload',{method:'POST',body:fd});
const d=await r.json();
if(!d.success||!d.data||!d.data.url){toast('خطا در آپلود: '+(d.error?.message||'نامشخص'));return}
const url=d.data.url;
const preview=document.getElementById(tradeId?'et-scr-preview':'a-scr-preview');
if(preview){preview.innerHTML='<img src="'+url+'" style="max-width:100%;max-height:150px;border-radius:8px;border:1px solid var(--b)"><br><small>عکس ذخیره شده</small>';}
toast('عکس آپلود شد ✅');
if(tradeId)document.getElementById('et-screenshot').value=url;
return url}catch(e){toast('خطا در آپلود');console.error(e)}
}

let _editTradeId=null;
async function editTradeModal(id){
  _editTradeId=id;
  const [r, strats, accs] = await Promise.all([api('/api/trades/'+id), api('/api/strategies'), api('/api/accounts')]);
  document.getElementById('et-sym').value=r.symbol||'';
  document.getElementById('et-dir').value=r.direction||'long';
  document.getElementById('et-entry').value=r.entry_price||'';
  document.getElementById('et-exit').value=r.exit_price!=null?r.exit_price:'';
  document.getElementById('et-lot').value=r.lot_size||0.01;
  document.getElementById('et-sl').value=r.stop_loss||'';
  document.getElementById('et-tp').value=r.take_profit||'';
  document.getElementById('et-fees').value=r.fees||0;
  document.getElementById('et-strat').innerHTML='<option value="">-</option>'+(strats.strategies||[]).map(s=>'<option value="'+s.id+'"'+(s.id===r.strategy_id?' selected':'')+'>'+s.name+'</option>').join('');
  document.getElementById('et-acc').innerHTML='<option value="">-</option>'+(accs.accounts||[]).map(a=>'<option value="'+a.id+'"'+(a.id===r.account_id?' selected':'')+'>'+a.name+'</option>').join('');
  document.getElementById('et-edate').value=r.entry_date?r.entry_date.replace(' ','T').slice(0,16):'';
  document.getElementById('et-xdate').value=r.exit_date?r.exit_date.replace(' ','T').slice(0,16):'';
  document.getElementById('et-screenshot').value=r.screenshot_url||'';
  document.getElementById('et-notes').value=r.notes||'';
  // Show uploaded screenshot preview in edit modal
  const etPrev=document.getElementById('et-scr-preview');
  if(etPrev&&r.screenshot_url)etPrev.innerHTML='<img src="'+r.screenshot_url+'" style="max-width:100%;max-height:120px;object-fit:cover;border-radius:8px;border:1px solid var(--b)"><br><small>عکس ذخیره شده</small>';
  showModal('m-edit-trade');
}
async function saveEditTrade(){
  if(!_editTradeId)return;
  const data={
    symbol:document.getElementById('et-sym').value.toUpperCase(),
    direction:document.getElementById('et-dir').value,
    entry_price:parseFloat(document.getElementById('et-entry').value)||null,
    exit_price:document.getElementById('et-exit').value!==''?parseFloat(document.getElementById('et-exit').value):null,
    lot_size:parseFloat(document.getElementById('et-lot').value)||0.01,
    stop_loss:parseFloat(document.getElementById('et-sl').value)||null,
    take_profit:parseFloat(document.getElementById('et-tp').value)||null,
    fees:parseFloat(document.getElementById('et-fees').value)||0,
    strategy_id:document.getElementById('et-strat').value?parseInt(document.getElementById('et-strat').value):null,
    account_id:document.getElementById('et-acc').value?parseInt(document.getElementById('et-acc').value):null,
    entry_date:document.getElementById('et-edate').value||null,
    exit_date:document.getElementById('et-xdate').value||null,
    screenshot_url:document.getElementById('et-screenshot').value||null,
    notes:document.getElementById('et-notes').value||null,
    timeframe:document.getElementById('et-tf')?.value||'',
    status:document.getElementById('et-exit').value?'closed':'open'
  };
  await api('/api/trades/'+_editTradeId,'PUT',data);
  hideModal('m-edit-trade');toast(t('saved'));loadTrades();
}

// === ADD TRADE ===
async function loadAddForm(){
document.getElementById('a-edate').value=new Date().toISOString().slice(0,16);selectedEmo='';selectedRate=0;
document.querySelectorAll('#a-emo span').forEach(s=>s.classList.remove('sel'));document.querySelectorAll('#a-stars span').forEach(s=>s.classList.remove('on'));
try{
const [strats, accs] = await Promise.all([api('/api/strategies'), api('/api/accounts')]);
strategies=strats.strategies||[];
document.getElementById('a-strat').innerHTML='<option value="">-</option>'+strategies.map(s=>'<option value="'+s.id+'">'+s.name+'</option>').join('');
document.getElementById('a-acc').innerHTML='<option value="">-</option>'+(accs.accounts||[]).map(a=>'<option value="'+a.id+'">'+a.name+' ('+(a.balance??0)+' '+a.currency+')</option>').join('');
const sel2=document.getElementById('f-strat');if(sel2)sel2.innerHTML='<option value="">همه</option>'+strategies.map(s=>'<option value="'+s.id+'">'+s.name+'</option>').join('');
// Populate top-bar account selector
const tbAcct=document.getElementById('tbAccount');if(tbAcct){const cur=tbAcct.value;tbAcct.innerHTML='<option value="">'+(L==='fa'?'همه حسابها':'All accounts')+'</option>'+(accs.accounts||[]).map(a=>'<option value="'+a.id+'">'+a.name+' ('+(a.balance??0)+' '+a.currency+')</option>').join('');if(cur)tbAcct.value=cur;}
}catch(e){console.error('loadAddForm:',e)}}
async function saveTrade(){
const sym=document.getElementById('a-sym').value;const entry=parseFloat(document.getElementById('a-entry').value);
if(!sym||!entry)return toast(t('required'));
const scrUrl=document.getElementById('a-scr-preview')?.querySelector('img')?.src||'';
const data={
symbol:sym.toUpperCase(),direction:document.getElementById('a-dir').value,strategy_id:document.getElementById('a-strat').value||null,
account_id:document.getElementById('a-acc').value||null,
entry_price:entry,exit_price:document.getElementById('a-exit').value!==''?parseFloat(document.getElementById('a-exit').value):null,
lot_size:parseFloat(document.getElementById('a-lot').value)||0.01,
stop_loss:parseFloat(document.getElementById('a-sl').value)||null,take_profit:parseFloat(document.getElementById('a-tp').value)||null,
fees:parseFloat(document.getElementById('a-fees').value)||0,
entry_date:document.getElementById('a-edate').value,exit_date:document.getElementById('a-xdate').value||null,
timeframe:document.getElementById('a-tf')?.value||'1h',emotion:selectedEmo,rating:selectedRate,
notes:document.getElementById('a-notes').value,screenshot_url:scrUrl,tags:[]
};
await api('/api/trades','POST',data);toast(t('saved'));go('trades');
}

// === STRATEGIES ===
async function loadStrategies(){
try{const r=await api('/api/strategies');strategies=r.strategies||[];
document.getElementById('stratTable').innerHTML=strategies.map(s=>'<tr><td style="font-weight:600"><span style="display:inline-block;width:10px;height:10px;border-radius:3px;background:'+esc(s.color)+';margin-left:8px"></span>'+esc(s.name)+'</td><td style="color:var(--t3);font-size:11px">'+(s.description?esc(s.description):'-')+'</td><td>-</td><td>-</td><td>-</td><td style="white-space:nowrap"><button class="btn btn-s btn-g" onclick="editStratModal('+s.id+')">✏️</button> <button class="btn btn-s btn-d" onclick="delStrat('+s.id+')">✕</button></td></tr>').join('')||'<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--t3)">'+t('noStrat')+'</td></tr>';
loadAddForm();}catch(e){}}
async function delStrat(id){if(!confirm(t('confirmDel')))return;await api('/api/strategies/'+id,'DELETE');toast(t('deleted'));loadStrategies()}
let _editStratId=null;
async function editStratModal(id){_editStratId=id;const r=await api('/api/strategies');const s=(r.strategies||[]).find(x=>x.id===id);if(!s)return;document.getElementById('st-name').value=s.name||'';document.getElementById('st-desc').value=s.description||'';document.getElementById('st-rules').value=s.rules||'';document.getElementById('st-color').value=s.color||'#7c3aed';document.querySelector('#m-strat h3').textContent='✏️ ویرایش استراتژی';showModal('m-strat')}
async function saveStrat(){if(_editStratId){await api('/api/strategies/'+_editStratId,'PUT',{name:document.getElementById('st-name').value,description:document.getElementById('st-desc').value,rules:document.getElementById('st-rules').value,color:document.getElementById('st-color').value});_editStratId=null;document.querySelector('#m-strat h3').textContent='🎯 استراتژی جدید';hideModal('m-strat');toast(t('saved'));loadStrategies();return}const name=document.getElementById('st-name').value;if(!name)return;await api('/api/strategies','POST',{name,description:document.getElementById('st-desc').value,rules:document.getElementById('st-rules').value,color:document.getElementById('st-color').value});hideModal('m-strat');toast(t('saved'));loadStrategies()}

// === JOURNAL ===
async function loadJournal(){
try{const r=await api('/api/journal');const entries=r.entries||[];
document.getElementById('journalBox').innerHTML=entries.map(e=>'<div class="journal-card"><div class="journal-header"><span style="font-weight:600">'+esc(e.date)+'</span>'+(e.mood?'<span class="journal-mood">'+esc(e.mood)+'</span>':'')+'</div><div class="journal-body">'+(e.market_conditions?'<p><strong>بازار:</strong> '+esc(e.market_conditions)+'</p>':'')+(e.notes?'<p>'+esc(e.notes)+'</p>':'')+(e.lessons?'<p style="color:var(--g)"><strong>درسها:</strong> '+esc(e.lessons)+'</p>':'')+'</div></div>').join('')||'<div class="empty">'+t('noJournal')+'</div>';
document.getElementById('j-date').value=new Date().toISOString().slice(0,10);}catch(e){}}
async function saveJournal(){const date=document.getElementById('j-date').value;if(!date)return;const mood=document.querySelector('#j-mood .sel')?.dataset.e||'';await api('/api/journal','POST',{date,mood,market_conditions:document.getElementById('j-market').value,notes:document.getElementById('j-notes').value,lessons:document.getElementById('j-lessons').value});hideModal('m-journal');toast(t('saved'));loadJournal()}

// === ACCOUNTS ===
async function loadAccounts(){
try{const r=await api('/api/accounts');document.getElementById('accTable').innerHTML=(r.accounts||[]).map(a=>'<tr><td style="font-weight:600">'+a.name+'</td><td>'+(a.balance??0).toFixed(2)+'</td><td>'+a.currency+'</td><td>'+(a.broker||'-')+'</td><td>1:'+(a.leverage||1)+'</td><td>'+(a.is_default?'<span style="color:var(--a);font-weight:600">⭐ پیش‌فرض</span>':'<button class="btn btn-s btn-g" onclick="setDefaultAcc('+a.id+')">⭐ پیش‌فرض</button>')+'</td><td style="white-space:nowrap"><button class="btn btn-s btn-g" onclick="editAccModal('+a.id+')">✏️</button> <button class="btn btn-s btn-d" onclick="delAcc('+a.id+')">🗑️</button></td></tr>').join('')||'<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--t3)">'+t('noAcc')+'</td></tr>';}catch(e){}}
async function setDefaultAcc(id){
  await api('/api/accounts/'+id+'/default','PUT');
  toast(t('saved'));
  loadAccounts();
  loadAccountSelector();
}
async function saveAcc(){const name=document.getElementById('ac-name').value;if(!name)return;await api('/api/accounts','POST',{name,balance:parseFloat(document.getElementById('ac-bal').value)||0,currency:document.getElementById('ac-cur').value,broker:document.getElementById('ac-broker').value,leverage:parseFloat(document.getElementById('ac-lev').value)||1});hideModal('m-acc');toast(t('saved'));loadAccounts()}
let _editAccId=null;
async function editAccModal(id){
  _editAccId=id;
  const r=await api('/api/accounts');
  const a=(r.accounts||[]).find(x=>x.id===id);
  if(!a)return;
  document.getElementById('ea-name').value=a.name||'';
  document.getElementById('ea-bal').value=a.balance||0;
  document.getElementById('ea-cur').value=a.currency||'USD';
  document.getElementById('ea-lev').value=a.leverage||100;
  document.getElementById('ea-broker').value=a.broker||'';
  showModal('m-edit-acc');
}
async function saveEditAcc(){
  if(!_editAccId)return;
  await api('/api/accounts/'+_editAccId,'PUT',{
    name:document.getElementById('ea-name').value,
    initial_balance:parseFloat(document.getElementById('ea-bal').value)||0,
    currency:document.getElementById('ea-cur').value,
    broker:document.getElementById('ea-broker').value,
    leverage:parseFloat(document.getElementById('ea-lev').value)||1
  });
  hideModal('m-edit-acc');toast(t('saved'));loadAccounts();
}
async function delAcc(id){if(!confirm(t('confirmDel')))return;await api('/api/accounts/'+id,'DELETE');toast(t('deleted'));loadAccounts()}

// === CLOCK ===
let sbHidden=false;
function toggleSidebar(){
  const sb=document.getElementById('sb');
  const mn=document.querySelector('.mn');
  const tb=document.querySelector('.top-bar');
  sbHidden=!sbHidden;
  if(sbHidden){
    sb.classList.add('hidden');
    mn.classList.add('expanded');
    if(tb)tb.style.marginRight='0';
    if(tb)tb.style.marginLeft='0';
  }else{
    sb.classList.remove('hidden');
    mn.classList.remove('expanded');
    if(tb)tb.style.marginRight='';if(tb)tb.style.marginLeft='';
  }
}
const pageNames={fa:{dash:'داشبورد',trades:'تریدها',add:'ثبت ترید',strategies:'استراتژیها',journal:'ژورنال روزانه',accounts:'حسابها'},en:{dash:'Dashboard',trades:'Trades',add:'Add Trade',strategies:'Strategies',journal:'Daily Journal',accounts:'Accounts'}};
function updateClock(){
  const now=new Date();
  const loc=L==='fa'?'fa-IR':'en-US';
  const opts={timeZone:'Asia/Tehran',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'};
  const str=new Intl.DateTimeFormat(loc,opts).format(now);
  const el=document.getElementById('tbClock');
  if(el)el.textContent=str;
  setTimeout(updateClock,1000);
}
updateClock();

// === REAL-TIME SEARCH (debounced) ===
let _searchTimer=null;
function debounceSearch(){clearTimeout(_searchTimer);_searchTimer=setTimeout(loadTrades,300)}

function esc(s){return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}

// === CDN loader ===
function loadScript(u){return new Promise((res,rej)=>{const s=document.createElement('script');s.src=u;s.onload=res;s.onerror=rej;document.head.appendChild(s)})}
let _xlsxReady=false;
function ensureXLSX(){if(_xlsxReady)return Promise.resolve();return loadScript('https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js').then(()=>{_xlsxReady=true}).catch(e=>console.warn('XLSX load failed:',e))}

// === CSV IMPORT ===
async function importCSVModal(){var sel=document.getElementById('imp-account');try{var r=await api('/api/accounts');var opts='';var accts=r.accounts||[];for(var i=0;i<accts.length;i++){var a=accts[i];opts+='<option value="'+a.id+'">'+esc(a.name)+' ('+(a.currency||'USD')+')</option>'}sel.innerHTML=opts}catch(e){sel.innerHTML='<option value="">-</option>'}var fl=document.getElementById('imp-file');fl.value='';fl.onchange=function(){var lbl=document.querySelector('label[for=imp-file]');if(lbl&&this.files[0])lbl.textContent='✅ '+this.files[0].name};setTimeout(function(){showModal('m-import')},50);document.getElementById('imp-status').style.display='none';showModal('m-import')}
async function doImportCSV(){var accountId=document.getElementById('imp-account').value;var file=document.getElementById('imp-file').files[0];if(!accountId){toast('حساب را انتخاب کنید');return}if(!file){toast('فایل را انتخاب کنید');return}var status=document.getElementById('imp-status');status.style.display='block';status.innerHTML='در حال پردازش...';try{var fname=file.name.toLowerCase();var rows;if(fname.indexOf('.xlsx')!==-1||fname.indexOf('.xls')!==-1){await ensureXLSX();if(typeof XLSX==='undefined'){status.innerHTML='خطا: XLSX library لود نشد';return}var wb=XLSX.read(await file.arrayBuffer(),{type:'array'});var ws=wb.Sheets[wb.SheetNames[0]];var allRows=XLSX.utils.sheet_to_json(ws,{header:1});var posS=-1,posE=allRows.length;for(var ri=0;ri<allRows.length;ri++){var c=String(allRows[ri][0]||'').trim();if(c==='Positions')posS=ri;else if(posS>-1&&ri>posS+1&&c&&['Orders','Deals','Balance:','Results'].indexOf(c)!==-1){posE=ri;break}}rows=posS>-1?allRows.slice(posS,posE):allRows;}else if(fname.indexOf('.html')!==-1||fname.indexOf('.htm')!==-1){var text=await file.text();var parser=new DOMParser();var doc=parser.parseFromString(text,'text/html');var tables=doc.getElementsByTagName('table');rows=[];for(var ti=0;ti<tables.length;ti++){var trs=tables[ti].getElementsByTagName('tr');for(var ri=0;ri<trs.length;ri++){var tds=trs[ri].getElementsByTagName('td');var ths=trs[ri].getElementsByTagName('th');var cells=[];for(var ci=0;ci<ths.length;ci++)cells.push(ths[ci].textContent.trim());for(var ci=0;ci<tds.length;ci++)cells.push(tds[ci].textContent.trim());if(cells.length)rows.push(cells)}if(rows.length)break}if(!rows.length){status.innerHTML='هیچ جدولی در فایل HTML پیدا نشد';return}}else{var text=await file.text();var lines=text.split(String.fromCharCode(13,10));if(lines.length<=1)lines=text.split(String.fromCharCode(10));rows=[];for(var i=0;i<lines.length;i++){if(lines[i].trim())rows.push(lines[i].split(String.fromCharCode(9)).length>1?lines[i].split(String.fromCharCode(9)):lines[i].split(','))}}var trades=parseRows(rows);if(!trades.length){status.innerHTML='هیچ تریدی پیدا نشد';return}status.innerHTML=trades.length+' ترید پیدا شد. در حال ثبت...';var r=await api('/api/trades/bulk','POST',{account_id:parseInt(accountId),trades:trades});var cnt=r.inserted||trades.length;status.innerHTML=cnt+' ترید ثبت شد.';setTimeout(function(){hideModal('m-import')},1500);if(r.errors&&r.errors.length)status.innerHTML+=' '+r.errors.length+' خطا';loadTrades();loadAccounts();loadAccountSelector()}catch(e){status.innerHTML='خطا: '+(e.message||e)}}
function colIdx(headers,names){for(var n=0;n<names.length;n++){for(var h=0;h<headers.length;h++){if(headers[h]&&headers[h].toLowerCase().indexOf(names[n])!==-1)return h}if(n<headers.length&&n<headers.length===names.length)return n}return-1}
function parseRows(rows){var trades=[];if(!rows||rows.length<2)return trades;var hdrIdx=-1;for(var ri=0;ri<Math.min(rows.length,15);ri++){var row=rows[ri];if(!row)continue;var joined='';for(var ci=0;ci<row.length;ci++)joined+=String(row[ci]||'').toLowerCase()+' ';if(joined.indexOf('symbol')!==-1&&joined.indexOf('profit')!==-1){hdrIdx=ri;break}if(joined.indexOf('type')!==-1&&(joined.indexOf('volume')!==-1||joined.indexOf('size')!==-1)&&joined.indexOf('price')!==-1){hdrIdx=ri;break}if(joined.indexOf('item')!==-1&&joined.indexOf('profit')!==-1){hdrIdx=ri;break}}if(hdrIdx===-1)hdrIdx=0;var hdrs=[];var baseRow=rows[hdrIdx];for(var h=0;h<(baseRow?baseRow.length:0);h++)hdrs.push(String(baseRow[h]||'').trim().toLowerCase());var iSym=colIdx(hdrs,['symbol','pair','instrument','item','نماد']);var iType=colIdx(hdrs,['type','side','direction','نوع']);var iVol=colIdx(hdrs,['volume','size','lots','lot','حجم']);var iPrice=colIdx(hdrs,['price','entry','open','قیمت','نقطه ورود']);var iClose=colIdx(hdrs,['close price','exit price','exit','نقطه خروج']);var iProfit=colIdx(hdrs,['profit','pnl','p&l','سود']);var iDate=colIdx(hdrs,['open time','open time','time','date','تاریخ','زمان']);var iCloseDate=colIdx(hdrs,['close time','close date','تاریخ بسته شدن']);var iComm=colIdx(hdrs,['commission','کارمزد']);var iSwap=colIdx(hdrs,['swap','سواپ']);if(iSym===-1)iSym=0;if(iType===-1)iType=1;if(iVol===-1)iVol=2;if(iPrice===-1)iPrice=3;if(iProfit===-1)iProfit=7;if(iDate===-1)iDate=0;
      // MT5 format: duplicate Time/Price headers — second ones are close time/price
      if(iClose===-1||iClose===iPrice){for(var hi=iPrice+1;hi<hdrs.length;hi++){if(hdrs[hi]==='price'){iClose=hi;break}}}
      if(iClose===-1)iClose=9;if(iCloseDate===iDate||iCloseDate===-1){for(var hi2=iDate+1;hi2<hdrs.length;hi2++){if(hdrs[hi2]==='time'&&hi2!==iDate){iCloseDate=hi2;break}}}
      if(iCloseDate===-1)iCloseDate=8;for(var r=hdrIdx+1;r<rows.length;r++){var p=rows[r];if(!p||p.length<3)continue;var sym=String(p[iSym]||'').trim();if(sym.charAt(sym.length-1)==='.')sym=sym.slice(0,-1);sym=sym.toUpperCase();if(sym.length===6&&/^[A-Z]{6}$/.test(sym))sym=sym.slice(0,3)+'/'+sym.slice(3);if(!sym)continue;if(sym.toLowerCase().indexOf('profit')!==-1||sym.toLowerCase().indexOf('balance')!==-1||sym.toLowerCase().indexOf('credit')!==-1)continue;var typ=String(p[iType]||'').trim().toLowerCase();if(typ==='balance')continue;var vol=parseFloat(p[iVol]);var prc=parseFloat(p[iPrice]);if(isNaN(vol)||isNaN(prc))continue;if(vol===0&&prc===0)continue;if(typ.indexOf('cancel')!==-1||typ.indexOf('delete')!==-1)continue;var cls=iClose<p.length?parseFloat(p[iClose]):null;var pnl=iProfit<p.length?parseFloat(p[iProfit]):0;if(isNaN(pnl))pnl=0;var dt=iDate<p.length?String(p[iDate]):'';var cdt=iCloseDate<p.length?String(p[iCloseDate]):'';var isLong=typ.indexOf('buy')!==-1||typ.indexOf('long')!==-1;if(!isLong&&typ.indexOf('sell')===-1)continue;var comm=iComm<p.length?parseFloat(p[iComm])||0:0;var swp=iSwap<p.length?parseFloat(p[iSwap])||0:0;var fees=Math.round((comm+swp)*100)/100;trades.push({symbol:sym,direction:isLong?'long':'short',entry_price:prc,exit_price:cls||null,lot_size:vol,entry_date:parseMT5Date(dt),exit_date:cdt?parseMT5Date(cdt):null,status:cls?'closed':'open',pnl:pnl-Math.abs(fees),fees:Math.abs(fees),notes:'Imported from MT5'})}return trades}
function parseMT5Date(s){if(!s||!s.trim())return null;var t=s.trim();t=t.split('.').join('-');var parts=t.split(' ');if(parts.length>=2)return parts[0]+'T'+parts[1];return t}

// === EXPORT PDF (Trades) ===
async function exportPDF(){
try{
  const r=await api('/api/trades?limit=500');const trades=r.trades||[];
  if(!trades.length)return toast(t('noTrades'));
  const dir=L==='fa'?'rtl':'ltr';
  let rows=trades.filter(t=>t.status==='closed').map(t=>'<tr><td>'+esc(t.symbol)+'</td><td>'+(t.direction==='long'?'▲':'▼')+'</td><td>'+esc(String(t.entry_price))+'</td><td>'+(t.exit_price?esc(String(t.exit_price)):'-')+'</td><td class="'+(t.pnl>0?'pos':'neg')+'">'+fmt(t.pnl)+'</td><td>'+(t.strategy_name||'-')+'</td><td>'+(t.entry_date||'')+'</td></tr>').join('');
  const html='<html dir="'+dir+'"><head><meta charset="utf-8"><style>body{font-family:"Vazirmatn","Tahoma",sans-serif;padding:20px;direction:'+dir+'}h1{font-size:18px;margin-bottom:8px}h2{font-size:14px;margin-bottom:16px;color:#666}table{width:100%;border-collapse:collapse;font-size:12px}th{background:#4f46e5;color:#fff;padding:8px 10px;text-align:left}th[dir='+dir+']{text-align:'+(L==='fa'?'right':'left')+'}td{padding:6px 10px;border-bottom:1px solid #eee}tr:nth-child(even){background:#f9fafb}.pos{color:#059669}.neg{color:#dc2626}</style></head><body><h1>'+esc(t('reportTitle'))+'</h1><h2>'+new Date().toLocaleDateString()+'</h2><table><thead><tr><th>'+esc(t('thSymbol'))+'</th><th>'+esc(t('thDir'))+'</th><th>'+esc(t('thEntry'))+'</th><th>'+esc(t('thExit'))+'</th><th>'+esc(t('thPnl'))+'</th><th>'+esc(t('thStrategy'))+'</th><th>'+esc(t('thDate'))+'</th></tr></thead><tbody>'+rows+'</tbody></table></body></html>';
  const w=window.open('','_blank');
  if(w){w.document.write(html);w.document.close();setTimeout(()=>w.print(),500)}else toast(t('err'));
}catch(e){console.error(e);toast(t('err'))}}

// === EXPORT PDF (Dashboard) ===
async function exportDashPDF(){
try{
  const s=await api('/api/stats');
  const dir=L==='fa'?'rtl':'ltr';
  const statRow=(label,val,c)=>'<tr><td style="padding:6px 10px;border-bottom:1px solid #eee;font-weight:600">'+label+'</td><td style="padding:6px 10px;border-bottom:1px solid #eee;text-align:'+(L==='fa'?'left':'right')+';'+(c?'color:'+c:'')+'">'+val+'</td></tr>';
  const html='<html dir="'+dir+'"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><style>body{font-family:"Vazirmatn","Tahoma",sans-serif;padding:20px;direction:'+dir+'}h1{font-size:18px}h2{font-size:14px;color:#666}table{width:100%;border-collapse:collapse;font-size:13px}th{background:#4f46e5;color:#fff;padding:8px;text-align:left}</style></head><body><h1>'+esc(t('dashReportTitle'))+'</h1><h2>'+new Date().toLocaleDateString()+'</h2><table>'+statRow(t('totalPnl'),fmt(s.totalPnl),s.totalPnl>=0?'#059669':'#dc2626')+statRow(t('winRate'),s.winRate+'% ('+s.wins+'W/'+s.losses+'L)')+statRow(t('totalTrades'),String(s.total))+statRow(t('profitFactor'),s.profitFactor)+statRow(t('best'),fmt(s.bestTrade),'#059669')+statRow(t('worst'),fmt(s.worstTrade),'#dc2626')+'</table></body></html>';
  const w=window.open('','_blank');
  if(w){w.document.write(html);w.document.close();setTimeout(()=>w.print(),500)}else toast(t('err'));
}catch(e){console.error(e);toast(t('err'))}}

// === EXPORT EXCEL (Trades) ===
async function exportExcel(){
try{
  await ensureXLSX();if(typeof XLSX==='undefined')return toast(t('err'));
  const r=await api('/api/trades?limit=500');const trades=r.trades||[];
  if(!trades.length)return toast(t('noTrades'));
  const data=trades.filter(t=>t.status==='closed').map(t=>({[t('thSymbol')]:t.symbol,[t('thDir')]:t.direction==='long'?'Long':'Short',[t('thEntry')]:t.entry_price,[t('thExit')]:t.exit_price||'',[t('thPnl')]:t.pnl,[t('thStrategy')]:t.strategy_name||'',[t('thDate')]:t.entry_date}));
  const ws=XLSX.utils.json_to_sheet(data);const wb=XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb,ws,t('reportTitle'));
  XLSX.writeFile(wb,'trade-journal-'+new Date().toISOString().split('T')[0]+'.xlsx');
  toast('✅');
}catch(e){console.error(e);toast(t('err'))}}

// === EXPORT EXCEL (Dashboard) ===
async function exportDashExcel(){
try{
  await ensureXLSX();if(typeof XLSX==='undefined')return toast(t('err'));
  const [stats,tradesR]=await Promise.all([api('/api/stats'),api('/api/trades?limit=500')]);
  const wb=XLSX.utils.book_new();
  const summaryData=[[t('totalPnl'),stats.totalPnl],[t('winRate'),stats.winRate+'%'],[t('totalTrades'),stats.total],[t('profitFactor'),stats.profitFactor],[t('best'),stats.bestTrade],[t('worst'),stats.worstTrade]];
  XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(summaryData),t('dashReportTitle'));
  const trades=(tradesR.trades||[]).filter(t=>t.status==='closed');
  if(trades.length){
    const tradeData=trades.map(t=>({[t('thSymbol')]:t.symbol,[t('thDir')]:t.direction,[t('thEntry')]:t.entry_price,[t('thExit')]:t.exit_price||'',[t('thPnl')]:t.pnl,[t('thStrategy')]:t.strategy_name||'',[t('thDate')]:t.entry_date}));
    XLSX.utils.book_append_sheet(wb,XLSX.utils.json_to_sheet(tradeData),t('reportTitle'));
  }
  XLSX.writeFile(wb,'dashboard-'+new Date().toISOString().split('T')[0]+'.xlsx');
  toast('✅');
}catch(e){console.error(e);toast(t('err'))}}

// === ACCOUNT SELECTOR ===
async function loadAccountSelector(){
  try{
    const r=await api('/api/accounts');
    const accts=r.accounts||[];
    const tbAcct=document.getElementById('tbAccount');
    if(tbAcct){
      const cur=localStorage.getItem('selectedAccount')||'';
      tbAcct.innerHTML='<option value="">'+(L==='fa'?'همه حسابها':'All accounts')+'</option>'+accts.map(a=>'<option value="'+a.id+'">'+(a.is_default?'⭐ ':'')+a.name+' ('+a.balance+' '+a.currency+')</option>').join('');
      tbAcct.value=cur;
    }
  }catch(e){console.error('loadAccountSelector:',e)}
}
function onAccountChange(){
  const v=document.getElementById('tbAccount')?.value||'';
  localStorage.setItem('selectedAccount',v);
  const pg=document.querySelector('.ni.on')?.dataset.p||'dash';
  go(pg);
}
// Update account selector text when language changes
function updateAccountSelectorText(){
  const tbAcct=document.getElementById('tbAccount');
  if(!tbAcct)return;
  const firstOpt=tbAcct.querySelector('option[value=""]');
  if(firstOpt)firstOpt.textContent=L==='fa'?'همه حسابها':'All Accounts';
}
function getSelectedAccount(){
  const v=document.getElementById('tbAccount')?.value;
  return v?parseInt(v):null;
}

applyI18n();
loadAccountSelector().then(()=>{
  const saved=localStorage.getItem('selectedAccount');
  if(saved){const sel=document.getElementById('tbAccount');if(sel){sel.value=saved;}}
}).finally(()=>loadDash());
</script></body></html>`;
}
