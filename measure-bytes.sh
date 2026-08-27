#!/bin/bash
# Measures real bytes served over HTTP for every asset index.html references.
python3 - "$1" <<'PY'
import re,sys,urllib.parse,urllib.request
label=sys.argv[1]
h=urllib.request.urlopen('http://localhost:3000/').read().decode('utf-8')
tot=len(h.encode('utf-8')); n=1; vid=0; img=0; rows=[]; fails=[]
for r in sorted(set(re.findall(r'(?:src|href|poster)="([^"]+)"',h))):
    if r.startswith(('http','#','mailto:','tel:','viber:','data:')): continue
    path=urllib.parse.unquote(r.lstrip('/'))
    url='http://localhost:3000/'+urllib.parse.quote(path)
    try: s=len(urllib.request.urlopen(url).read())
    except Exception as e: fails.append((path,str(e)[:40])); continue
    tot+=s; n+=1; rows.append((s,path))
    if path.lower().endswith('.mp4'): vid+=s
    elif re.search(r'\.(png|jpe?g|webp|gif|svg|ico)$',path,re.I): img+=s
for s,p in sorted(rows,reverse=True)[:8]: print(f"  {s/1048576:7.2f} MB  {p}")
if fails:
    print("  FAILED:"); [print(f"    {p} -> {e}") for p,e in fails]
print(f"\n  {label.upper()}")
print(f"  total transferred : {tot/1048576:.2f} MB ({tot:,} bytes)")
print(f"  requests          : {n}")
print(f"  video bytes       : {vid/1048576:.2f} MB")
print(f"  image bytes       : {img/1048576:.2f} MB")
PY
