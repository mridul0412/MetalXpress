#!/usr/bin/env python3
"""Build a clean visual roadmap HTML from roadmap-data.json.
Vertical road per track (Product / Business): car travels top->bottom,
gold rail behind cleared phases, every exact item rendered with status."""
import json, re

def parse_md(path):
    with open(path, 'r', encoding='utf-8') as f:
        lines = f.read().split('\n')
    sections, cur = [], None
    for ln in lines:
        h = re.match(r'^## (.+)', ln)
        if h:
            cur = {'title': h.group(1).strip(), 'items': []}
            sections.append(cur); continue
        it = re.match(r'^- \[([ x~])\]\s+(.+)', ln)
        if it and cur is not None:
            status = {'x': 'done', ' ': 'todo', '~': 'wip'}[it.group(1)]
            t = re.sub(r'\*\*(.+?)\*\*', r'\1', it.group(2))
            t = re.sub(r'\[(.+?)\]\(.+?\)', r'\1', t).replace('`', '')
            cur['items'].append({'s': status, 't': t.strip()})
    return [s for s in sections if s['items']]

# Parse both roadmap files directly — single source of truth, no stale intermediate
data = {'product': parse_md('ROADMAP.md'), 'business': parse_md('BUSINESS_ROADMAP.md')}

def clean_title(t):
    # drop leading colored-circle emoji + collapse double spaces from stripped em-dash
    t = re.sub(r'^[\U0001F300-\U0001FAFF☀-➿️]+\s*', '', t)
    t = t.replace('  ', ' — ')
    return t.strip()

# Reorder PRODUCT so "Completed" (legacy done bucket) shows first as Foundation
prod = data['product']
foundation = [s for s in prod if s['title'].strip().lower() == 'completed']
rest = [s for s in prod if s['title'].strip().lower() != 'completed']
if foundation:
    foundation[0]['title'] = 'Foundation — Already Shipped'
prod_ordered = foundation + rest

def tag_phases(phases):
    found_current = False
    for ph in phases:
        incomplete = any(i['s'] != 'done' for i in ph['items'])
        if not incomplete:
            ph['phase'] = 'done'
        elif not found_current:
            ph['phase'] = 'current'; found_current = True
        else:
            ph['phase'] = 'future'
        ph['title'] = clean_title(ph['title'])
        ph['done'] = sum(1 for i in ph['items'] if i['s'] == 'done')
        ph['total'] = len(ph['items'])
    return phases

roads = {
    'product':  {'label': '⚙ Product Road',  'color': '#5B8DEF', 'phases': tag_phases(prod_ordered)},
    'business': {'label': '🏛 Business Road', 'color': '#34d399', 'phases': tag_phases(data['business'])},
}

# overall progress
for r in roads.values():
    d = sum(p['done'] for p in r['phases']); t = sum(p['total'] for p in r['phases'])
    r['doneCount'] = d; r['totalCount'] = t; r['pct'] = round(100*d/t) if t else 0

payload = json.dumps(roads, ensure_ascii=False)

TEMPLATE = r'''<!doctype html>
<html lang="en"><head>
<meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>BhavX — The Journey</title>
<link rel="preconnect" href="https://fonts.googleapis.com"/><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
<link href="https://fonts.googleapis.com/css2?family=Cinzel:wght@700;900&family=Marcellus&family=Cormorant+SC:wght@700&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet"/>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{background:#050912;color:#fff;font-family:Inter,sans-serif;padding:32px 18px 80px;min-height:100vh}
body::before{content:'';position:fixed;inset:0;pointer-events:none;background:radial-gradient(ellipse at 50% -10%,rgba(207,181,59,.10),transparent 60%),radial-gradient(ellipse at 85% 110%,rgba(255,140,40,.04),transparent 55%)}
.wrap{max-width:780px;margin:0 auto;position:relative;z-index:1}
.head{text-align:center;margin-bottom:28px}
.chakra{width:60px;height:60px;margin:0 auto 14px;display:block;animation:spin 3s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.brand{font-family:Marcellus,serif;font-size:38px;line-height:1;display:inline-flex;align-items:center;gap:13px;background:linear-gradient(180deg,#FFE9A8,#FFC942 28%,#CFB53B 60%,#8C6818);-webkit-background-clip:text;background-clip:text;color:transparent}
.brand .bar{width:2px;height:.45em;background:linear-gradient(180deg,#FFE9A8,#CFB53B 50%,#8C6818);border-radius:1px}
.brand .xf{border:1.5px solid #CFB53B;background:rgba(207,181,59,.06);border-radius:4px;padding:4px 13px;font-size:.92em}
.tag{font-family:'Cormorant SC',serif;font-weight:700;font-size:11px;letter-spacing:.36em;color:rgba(207,181,59,.7);text-transform:uppercase;margin-top:12px}
.date{font-size:12px;color:rgba(207,181,59,.55);margin-top:8px}
.toggle{display:flex;gap:8px;justify-content:center;margin:24px 0 8px}
.tbtn{padding:9px 20px;border-radius:10px;font-size:13px;font-weight:700;cursor:pointer;border:1px solid rgba(255,255,255,.1);background:rgba(255,255,255,.04);color:rgba(255,255,255,.55);transition:.15s}
.tbtn.active{border-color:rgba(207,181,59,.5);color:#0a0f1a}
.tbtn.active.product{background:linear-gradient(180deg,#7FB0F5,#5B8DEF)}
.tbtn.active.business{background:linear-gradient(180deg,#6EE7B7,#34d399)}
.pbar-wrap{margin:18px 6px 30px}
.pbar-top{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:7px}
.pbar-label{font-family:Cinzel,serif;font-size:13px;font-weight:700;letter-spacing:.08em}
.pbar-pct{font-size:13px;font-weight:700}
.pbar{height:9px;border-radius:99px;background:rgba(255,255,255,.06);overflow:hidden;border:1px solid rgba(255,255,255,.05)}
.pbar-fill{height:100%;border-radius:99px;transition:width .6s ease}
/* vertical road */
.road{position:relative;padding-left:54px}
.rail{position:absolute;left:23px;top:8px;bottom:8px;width:4px;border-radius:2px;background:rgba(255,255,255,.07)}
.rail-fill{position:absolute;left:0;top:0;width:100%;border-radius:2px;background:linear-gradient(180deg,#FFE9A8,#CFB53B);box-shadow:0 0 12px rgba(207,181,59,.35)}
.phase{position:relative;margin-bottom:30px}
.node{position:absolute;left:-46px;top:0;width:34px;height:34px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:15px;font-weight:800;z-index:2}
.node.done{background:linear-gradient(180deg,#FFE9A8,#CFB53B 60%,#8C6818);color:#0a0f1a;box-shadow:0 0 12px rgba(207,181,59,.4)}
.node.current{background:radial-gradient(circle,#FFFEF0,#FFC942 50%,#FF6B1A 100%);box-shadow:0 0 0 5px rgba(255,140,40,.18),0 0 18px rgba(255,140,40,.55);animation:pulse 2s ease-in-out infinite}
.node.future{background:rgba(255,255,255,.07);border:2px solid rgba(255,255,255,.16);color:rgba(255,255,255,.4)}
@keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.12)}}
.car{position:absolute;left:-86px;top:-2px;font-size:30px;animation:bob 1.6s ease-in-out infinite;transform:scaleX(-1)}
@keyframes bob{0%,100%{transform:scaleX(-1) translateY(0)}50%{transform:scaleX(-1) translateY(-3px)}}
.yah{position:absolute;left:-92px;top:34px;font-size:8px;font-weight:800;letter-spacing:.1em;text-transform:uppercase;color:#FF6B1A;white-space:nowrap}
.ph-title{font-family:Cinzel,serif;font-size:16px;font-weight:700;letter-spacing:.04em;margin-bottom:2px}
.ph-title.done{color:rgba(207,181,59,.85)}
.ph-title.current{color:#FFC942}
.ph-title.future{color:rgba(255,255,255,.55)}
.ph-count{font-size:11px;color:rgba(255,255,255,.4);margin-bottom:12px;letter-spacing:.03em}
.items{display:flex;flex-direction:column;gap:7px}
.item{display:flex;align-items:flex-start;gap:9px;font-size:13px;line-height:1.45}
.ico{flex-shrink:0;width:16px;height:16px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;margin-top:1px}
.ico.done{background:rgba(207,181,59,.18);color:#CFB53B}
.ico.wip{background:rgba(251,191,36,.18);color:#fbbf24}
.ico.todo{border:1.5px solid rgba(255,255,255,.18);color:transparent}
.item.done .txt{color:rgba(255,255,255,.42)}
.item.wip .txt{color:#fbbf24;font-weight:600}
.item.todo .txt{color:rgba(255,255,255,.82)}
.collapsed .items{display:none}
.ph-toggle{font-size:10px;color:rgba(207,181,59,.7);cursor:pointer;margin-top:6px;user-select:none}
.foot{margin-top:40px;padding:26px;text-align:center;background:linear-gradient(135deg,rgba(207,181,59,.08),rgba(13,20,32,.5));border:1px solid rgba(207,181,59,.3);border-radius:16px}
.foot h3{font-family:Cinzel,serif;font-size:17px;color:#CFB53B;letter-spacing:.05em;margin-bottom:9px}
.foot p{font-size:13px;color:rgba(255,255,255,.7);line-height:1.7;max-width:600px;margin:0 auto}
.foot .next{margin-top:14px;font-size:13px;color:rgba(255,140,40,.95);font-weight:600}
</style></head><body><div class="wrap">
<div class="head">
<svg class="chakra" viewBox="0 0 64 64" fill="none"><defs>
<linearGradient id="g" x1="0" y1="0" x2="0" y2="64" gradientUnits="userSpaceOnUse"><stop stop-color="#FFE9A8"/><stop offset=".4" stop-color="#CFB53B"/><stop offset="1" stop-color="#7A5A18"/></linearGradient>
<radialGradient id="b" cx="32" cy="32" r="6" gradientUnits="userSpaceOnUse"><stop stop-color="#FFFEF0"/><stop offset=".5" stop-color="#FFC942"/><stop offset="1" stop-color="#C73E0A"/></radialGradient></defs>
<g fill="url(#g)"><path d="M21 7 43 7 29 22 26 23Z"/><path d="M21 7 43 7 29 22 26 23Z" transform="rotate(45 32 32)"/><path d="M21 7 43 7 29 22 26 23Z" transform="rotate(90 32 32)"/><path d="M21 7 43 7 29 22 26 23Z" transform="rotate(135 32 32)"/><path d="M21 7 43 7 29 22 26 23Z" transform="rotate(180 32 32)"/><path d="M21 7 43 7 29 22 26 23Z" transform="rotate(225 32 32)"/><path d="M21 7 43 7 29 22 26 23Z" transform="rotate(270 32 32)"/><path d="M21 7 43 7 29 22 26 23Z" transform="rotate(315 32 32)"/></g>
<circle cx="32" cy="32" r="4" fill="url(#b)"/></svg>
<div class="brand"><span>Bhav</span><span class="bar"></span><span class="xf">X</span></div>
<div class="tag">The Journey to India's Metal Exchange</div>
<div class="date" id="date"></div>
</div>
<div class="toggle">
<button class="tbtn product active" data-road="product" onclick="show('product')">⚙ Product Road</button>
<button class="tbtn business" data-road="business" onclick="show('business')">🏛 Business Road</button>
</div>
<div id="mount"></div>
<div class="foot">
<h3>You are further than you feel.</h3>
<p>A live product, a real brand, a working marketplace with KYC + deal flow + disputes. Most never get past the idea. The broker said the marketplace won't work — every incumbent says that. Lead with free rates (zero trust needed), layer the marketplace later, raise capital for legitimacy. The difficulty <em style="color:#CFB53B;font-style:normal">is</em> the moat.</p>
<div class="next">⛳ The wall: your first 20 traders. Everything waits behind it.</div>
</div>
</div>
<script>
const DATA = __PAYLOAD__;
document.getElementById('date').textContent = new Date().toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
const ICO = {done:'✓', wip:'◐', todo:''};
function render(roadKey){
  const r = DATA[roadKey];
  // progress fill stops at the current phase node
  let curIdx = r.phases.findIndex(p=>p.phase==='current');
  if(curIdx<0) curIdx = r.phases.length-1;
  const fillPct = r.phases.length>1 ? (curIdx/(r.phases.length-1))*100 : 100;
  let h = '';
  h += '<div class="pbar-wrap"><div class="pbar-top"><span class="pbar-label" style="color:'+r.color+'">'+r.label+'</span><span class="pbar-pct" style="color:'+r.color+'">'+r.doneCount+' / '+r.totalCount+' done · '+r.pct+'%</span></div><div class="pbar"><div class="pbar-fill" style="width:'+r.pct+'%;background:linear-gradient(90deg,'+r.color+',#FFE9A8)"></div></div></div>';
  h += '<div class="road"><div class="rail"><div class="rail-fill" style="height:'+fillPct+'%"></div></div>';
  r.phases.forEach((p,i)=>{
    const sym = p.phase==='done' ? '✓' : (p.phase==='future' ? (i+1) : '');
    const car = p.phase==='current' ? '<div class="car">🚗</div><div class="yah">you<br>are<br>here</div>' : '';
    const collapse = p.phase==='done' && p.items.length>6;
    h += '<div class="phase'+(collapse?' collapsed':'')+'" id="'+roadKey+'-ph'+i+'">';
    h += car;
    h += '<div class="node '+p.phase+'">'+sym+'</div>';
    h += '<div class="ph-title '+p.phase+'">'+p.title+'</div>';
    h += '<div class="ph-count">'+p.done+' / '+p.total+' complete</div>';
    h += '<div class="items">';
    p.items.forEach(it=>{
      h += '<div class="item '+it.s+'"><span class="ico '+it.s+'">'+(ICO[it.s]||'')+'</span><span class="txt">'+escapeHtml(it.t)+'</span></div>';
    });
    h += '</div>';
    if(collapse) h += '<div class="ph-toggle" onclick="document.getElementById(\''+roadKey+'-ph'+i+'\').classList.toggle(\'collapsed\')">▼ show '+p.total+' shipped items</div>';
    h += '</div>';
  });
  h += '</div>';
  return h;
}
function escapeHtml(s){return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');}
function show(roadKey){
  document.getElementById('mount').innerHTML = render(roadKey);
  document.querySelectorAll('.tbtn').forEach(b=>b.classList.toggle('active', b.dataset.road===roadKey));
}
show('product');
</script>
</body></html>'''

html = TEMPLATE.replace('__PAYLOAD__', payload)
with open('frontend/public/roadmap.html', 'w', encoding='utf-8') as f:
    f.write(html)
print('Built roadmap.html —', len(html), 'chars')
print('Product:', roads['product']['doneCount'], '/', roads['product']['totalCount'])
print('Business:', roads['business']['doneCount'], '/', roads['business']['totalCount'])
