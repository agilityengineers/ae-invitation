(function(){
  if(window.__aeAdminInit)return; window.__aeAdminInit=1;
  var KEY='aeAdminConfig_v1';
  var DEF={sections:{spec:true},els:{},fields:{},heroImgUrl:'',heroVideoUrl:'',mediaType:'image',guideMode:'stats',proofMode:'metrics',proofSide:'right',logo:'chip',headerLinks:[{label:'About Us',url:'https://agilityengineers.com/'},{label:'Directory',url:'https://www.agility-engineers.com/'}]};
  function renderNav(){
    var nav=document.getElementById('aeNavLinks');if(!nav)return;
    var links=state.headerLinks||[];
    var sig=JSON.stringify(links);
    if(nav.getAttribute('data-sig')===sig)return;
    nav.setAttribute('data-sig',sig);
    while(nav.firstChild)nav.removeChild(nav.firstChild);
    var any=false;
    links.forEach(function(l){
      if(!l||!String(l.label||'').trim())return;any=true;
      var a=document.createElement('a');a.className='ae-nav';a.setAttribute('href',String(l.url||'').trim()||'#');a.textContent=String(l.label).trim();
      nav.appendChild(a);
    });
    if(any){var sp=document.createElement('span');sp.style.cssText='width:1px;height:22px;background:#D5DEE2';nav.appendChild(sp);}
  }
  function renderLinkRows(){
    var box=document.getElementById('aeLinkRows');if(!box)return;
    while(box.firstChild)box.removeChild(box.firstChild);
    var links=state.headerLinks||[];
    links.forEach(function(l,i){
      var row=document.createElement('div');row.style.cssText='border:1px solid #E2E8EB;border-radius:10px;padding:10px;margin-bottom:10px';
      var head=document.createElement('div');head.style.cssText='display:flex;justify-content:space-between;align-items:center;margin-bottom:6px';
      var tag=document.createElement('span');tag.style.cssText='font:700 11px sans-serif;letter-spacing:.08em;text-transform:uppercase;color:#0F88A2';tag.textContent='Link '+(i+1);
      var rm=document.createElement('button');rm.type='button';rm.setAttribute('data-ae-link-remove',String(i));rm.style.cssText='border:none;background:#FDECEC;color:#C0392B;border-radius:6px;padding:5px 10px;font:600 12px sans-serif;cursor:pointer';rm.textContent='Remove';
      head.appendChild(tag);head.appendChild(rm);
      var la=document.createElement('input');la.type='text';la.setAttribute('data-ae-link-field','label');la.setAttribute('data-i',String(i));la.value=String(l.label||'');la.placeholder='Title';la.style.cssText='width:100%;padding:8px 10px;border:1px solid #D5DEE2;border-radius:7px;font:500 13px sans-serif;color:#0B2A38;margin-bottom:6px';
      var ua=document.createElement('input');ua.type='text';ua.setAttribute('data-ae-link-field','url');ua.setAttribute('data-i',String(i));ua.value=String(l.url||'');ua.placeholder='https://example.com';ua.style.cssText='width:100%;padding:8px 10px;border:1px solid #D5DEE2;border-radius:7px;font:500 13px sans-serif;color:#0B2A38';
      row.appendChild(head);row.appendChild(la);row.appendChild(ua);
      box.appendChild(row);
    });
  }
  function vidSrc(type,url){url=(url||'').trim();if(!url)return '';var id='';
    if(type==='youtube'){var m=url.match(/(?:youtu\.be\/|v=|\/embed\/|\/shorts\/)([\w-]{6,})/);id=m?m[1]:(/^[\w-]{6,}$/.test(url)?url:'');return id?'https://www.youtube.com/embed/'+id+'?autoplay=1&mute=1&loop=1&playlist='+id+'&controls=0&modestbranding=1&playsinline=1&rel=0':'';}
    if(type==='vimeo'){var v=url.match(/(?:vimeo\.com\/(?:video\/)?)(\d+)/);id=v?v[1]:(/^\d+$/.test(url)?url:'');return id?'https://player.vimeo.com/video/'+id+'?background=1&autoplay=1&muted=1&loop=1':'';}
    return '';}
  function load(){try{return Object.assign({},DEF,JSON.parse(localStorage.getItem(KEY))||{});}catch(e){return Object.assign({},DEF);}}
  function save(s){try{localStorage.setItem(KEY,JSON.stringify(s));}catch(e){}}
  var state=load();
  function on(map,name){return map[name]!==false;}
  function hex2rgb(h){h=(h||'').replace('#','');if(h.length===3)h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];return [parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16)];}
  function colorDist(a,b){var x=hex2rgb(a),y=hex2rgb(b);return Math.sqrt(Math.pow(x[0]-y[0],2)+Math.pow(x[1]-y[1],2)+Math.pow(x[2]-y[2],2));}
  function lumOf(h){var r=hex2rgb(h);return (0.299*r[0]+0.587*r[1]+0.114*r[2])/255;}
  function sepSweep(){
    var secs=[].slice.call(document.querySelectorAll('[data-ae-section]'));
    var vis=secs.filter(function(s){return s.style.display!=='none';});
    vis.forEach(function(s){s.style.borderTop='';});
    for(var i=1;i<vis.length;i++){
      var prev=vis[i-1],cur=vis[i];
      var pb=prev.getAttribute('data-tone-bot'),ct=cur.getAttribute('data-tone-top');
      if(pb&&ct&&colorDist(pb,ct)<46){
        cur.style.borderTop='1px solid '+(lumOf(ct)>0.6?'rgba(8,82,127,.13)':'rgba(255,255,255,.14)');
      }
    }
  }
  function apply(){
    document.querySelectorAll('[data-ae-section]').forEach(function(el){
      var n=el.getAttribute('data-ae-section');var show=on(state.sections,n);
      var d=show?'':'none';if(el.style.display!==d)el.style.display=d;
    });
    document.querySelectorAll('[data-ae-el]').forEach(function(el){
      var n=el.getAttribute('data-ae-el');var show=on(state.els,n);
      var d=show?'':'none';if(el.style.display!==d)el.style.display=d;
    });
    sepSweep();
    var gWrap=document.getElementById('aeGuideImageWrap'),gimg=document.getElementById('aeGuideImg');
    if(gWrap){var gu=((state.fields&&state.fields.guideImgUrl)||'').trim();var useImg=(state.guideMode==='image')&&gu;if(useImg){gWrap.style.display='';if(gimg&&gimg.getAttribute('src')!==gu)gimg.setAttribute('src',gu);['guide-stat1','guide-stat2','guide-creds'].forEach(function(n){var e=document.querySelector('[data-ae-el="'+n+'"]');if(e)e.style.display='none';});}else{gWrap.style.display='none';}}
    var pWrap=document.getElementById('aeProofImageWrap'),pimg=document.getElementById('aeProofImg'),pMet=document.getElementById('aeProofMetrics'),pQuote=document.getElementById('aeProofQuote');
    if(pWrap){var pu=((state.fields&&state.fields.proofImgUrl)||'').trim();var pUse=(state.proofMode==='image')&&pu;if(pUse){pWrap.style.display='';if(pimg&&pimg.getAttribute('src')!==pu)pimg.setAttribute('src',pu);if(pMet)pMet.style.display='none';var pl=(state.proofSide==='left');pWrap.style.order=pl?'1':'2';if(pQuote)pQuote.style.order=pl?'2':'1';}else{pWrap.style.display='none';if(pMet)pMet.style.display='';if(pQuote)pQuote.style.order='';}}
    document.querySelectorAll('[data-ae-field]').forEach(function(el){
      var id=el.getAttribute('data-ae-field');var v=(state.fields[id]||'').trim();
      var want=v||el.getAttribute('data-ph')||'';
      if(el.textContent!==want)el.textContent=want;
    });
    document.querySelectorAll('[data-ae-href]').forEach(function(el){
      var k=el.getAttribute('data-ae-href');var u=(state.fields[k]||'').trim();
      if(u&&el.getAttribute('href')!==u)el.setAttribute('href',u);
    });
    renderNav();
    var yEl=document.getElementById('aeYear');if(yEl){var yy=String(new Date().getFullYear());if(yEl.textContent!==yy)yEl.textContent=yy;}
    var box=document.getElementById('aeHeroMediaBox'),himg=document.getElementById('aeHeroImg'),hvid=document.getElementById('aeHeroVideo');
    if(box&&himg&&hvid){
      var mt=state.mediaType||'image';
      var vs=mt!=='image'?vidSrc(mt,state.heroVideoUrl):'';
      if(vs){
        himg.style.display='none';hvid.style.display='block';
        if(hvid.getAttribute('data-src')!==vs){hvid.setAttribute('data-src',vs);hvid.innerHTML='<iframe src="'+vs+'" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:calc(100% * 11 / 9);height:100%;border:0;pointer-events:none" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen title="Agility Engineers background video"></iframe>';}
      } else {
        hvid.style.display='none';if(hvid.getAttribute('data-src')){hvid.removeAttribute('data-src');hvid.innerHTML='';}
        himg.style.display='block';
        var u=(state.heroImgUrl||'').trim()||'assets/hero-placeholder.png';if(himg.getAttribute('src')!==u)himg.setAttribute('src',u);
      }
    }
    document.querySelectorAll('[data-ae-logo]').forEach(function(sp){
      var img=sp.querySelector('img');var t=state.logo||'chip';
      if(t==='hide'){sp.style.display='none';return;}
      sp.style.display='inline-flex';
      if(t==='white'){sp.style.background='transparent';sp.style.padding='0';sp.style.boxShadow='none';if(img){img.style.filter='brightness(0) invert(1)';img.style.opacity='.92';}}
      else{sp.style.background='#ffffff';sp.style.padding='9px 14px';sp.style.boxShadow='0 4px 14px rgba(0,0,0,.18)';if(img){img.style.filter='none';img.style.opacity='1';}}
    });
  }
  function syncControls(){
    document.querySelectorAll('[data-ae-toggle]').forEach(function(c){
      var p=c.getAttribute('data-ae-toggle').split(':');var map=p[0]==='section'?state.sections:state.els;
      c.checked=on(map,p[1]);
    });
    document.querySelectorAll('[data-ae-input]').forEach(function(c){
      var id=c.getAttribute('data-ae-input');
      c.value=id==='heroImgUrl'?(state.heroImgUrl||''):id==='heroVideoUrl'?(state.heroVideoUrl||''):(state.fields[id]||'');
    });
    var sel=document.querySelector('[data-ae-logo-treat]');if(sel)sel.value=state.logo||'chip';
    var msel=document.querySelector('[data-ae-media-type]');if(msel)msel.value=state.mediaType||'image';
    var gsel=document.querySelector('[data-ae-guide-mode]');if(gsel)gsel.value=state.guideMode||'stats';
    var psel=document.querySelector('[data-ae-proof-mode]');if(psel)psel.value=state.proofMode||'metrics';
    var pside=document.querySelector('[data-ae-proof-side]');if(pside)pside.value=state.proofSide||'right';
    renderLinkRows();
  }
  document.addEventListener('change',function(e){
    var t=e.target;
    if(t.matches&&t.matches('[data-ae-toggle]')){
      var p=t.getAttribute('data-ae-toggle').split(':');var map=p[0]==='section'?state.sections:state.els;
      map[p[1]]=t.checked;save(state);apply();
    } else if(t.matches&&t.matches('[data-ae-logo-treat]')){
      state.logo=t.value;save(state);apply();
    } else if(t.matches&&t.matches('[data-ae-media-type]')){
      state.mediaType=t.value;save(state);apply();
    } else if(t.matches&&t.matches('[data-ae-guide-mode]')){
      state.guideMode=t.value;save(state);apply();
    } else if(t.matches&&t.matches('[data-ae-proof-mode]')){
      state.proofMode=t.value;save(state);apply();
    } else if(t.matches&&t.matches('[data-ae-proof-side]')){
      state.proofSide=t.value;save(state);apply();
    }
  });
  document.addEventListener('input',function(e){
    var t=e.target;
    if(t.matches&&t.matches('[data-ae-link-field]')){var li=parseInt(t.getAttribute('data-i'),10);var lf=t.getAttribute('data-ae-link-field');if(state.headerLinks&&state.headerLinks[li]){state.headerLinks[li][lf]=t.value;save(state);renderNav();}return;}
    if(!(t.matches&&t.matches('[data-ae-input]')))return;
    var id=t.getAttribute('data-ae-input');
    if(id==='heroImgUrl')state.heroImgUrl=t.value;else if(id==='heroVideoUrl')state.heroVideoUrl=t.value;else state.fields[id]=t.value;
    save(state);apply();
  });
  document.addEventListener('click',function(e){
    var t=e.target;
    var d=document.getElementById('aeDrawer'),sc=document.getElementById('aeScrim');
    function open(o){if(!d)return;d.style.transform=o?'translateX(0)':'translateX(100%)';if(sc){sc.style.opacity=o?'1':'0';sc.style.visibility=o?'visible':'hidden';}if(o)syncControls();}
    if(t.closest&&t.closest('#aeAddLink')){if(!state.headerLinks){state.headerLinks=[];}state.headerLinks.push({label:'',url:''});save(state);renderNav();renderLinkRows();return;}
    var rmBtn=t.closest?t.closest('[data-ae-link-remove]'):null;
    if(rmBtn){var rmi=parseInt(rmBtn.getAttribute('data-ae-link-remove'),10);if(state.headerLinks){state.headerLinks.splice(rmi,1);save(state);renderNav();renderLinkRows();}return;}
    if(t.closest&&t.closest('#aeGear')){open(true);}
    else if(t.closest&&(t.closest('#aeClose')||t.id==='aeScrim')){open(false);}
    else if(t.closest&&t.closest('#aeReset')){state=JSON.parse(JSON.stringify(DEF));save(state);syncControls();apply();}
    else if(t.closest&&t.closest('#aeExport')){
      var json=JSON.stringify(state,null,2);
      if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(json).then(function(){alert('Page config copied to clipboard.');},function(){window.prompt('Copy this page config:',json);});}
      else{window.prompt('Copy this page config:',json);}
    }
  });
  var pending=null;
  function schedule(){if(pending)return;pending=setTimeout(function(){pending=null;apply();},40);}
  if(document.readyState!=='loading'){apply();}else{document.addEventListener('DOMContentLoaded',apply);}
  new MutationObserver(schedule).observe(document.documentElement,{childList:true,subtree:true});
  window.aeAdmin={get:function(){return state;},apply:apply};
})();

/* ===================== LEAD QUALIFIER ENGINE (v3) ===================== */
(function(){
  if(window.__aeQuizInit)return; window.__aeQuizInit=1;
  var QKEY='aeQuizConfig_v1', SKEY='aeQuizSettings_v1', LKEY='aeLeads_v1';
  var TEAL='#0F88A2',NAVY='#08527F',NAVY7='#063A5A',GREEN='#2E8B57',BG='#F2F5F7',INK='#0B2A38',MUT='#5A6B73',LINE='#E2E8EB';
  var DEFAULTQUIZ=[
    {id:'industry',q:'Which best describes your company\u2019s industry?',options:[
      {label:'Specialty / Regional Insurance Carrier',pts:25},
      {label:'Third-Party Logistics (3PL) or Warehousing',pts:24},
      {label:'Funded B2B SaaS (Series-A+)',pts:24},
      {label:'Commercial Real Estate / PropTech',pts:20},
      {label:'Niche Healthcare / Clinical Network',pts:18},
      {label:'Other mid-market business',pts:10},
      {label:'Pre-seed / bootstrapped, enterprise bank, or B2C e-commerce',pts:0,kill:'industry'}
    ]},
    {id:'stage',q:'What is the current stage of your software or system architecture?',options:[
      {label:'A concept or clickable prototype we need turned into a secure, production-grade app',pts:15},
      {label:'An AI / vibe-coded prototype hitting bugs, security gaps, and \u201Ccontext rot\u201D at scale',pts:15},
      {label:'Drowning in manual spreadsheets \u2014 we need a custom operational system',pts:10},
      {label:'A legacy / undocumented codebase or monolith we need to modernize or migrate',pts:15}
    ]},
    {id:'po',q:'Do you have a dedicated internal Product Owner / Project Manager for this initiative?',options:[
      {label:'Yes \u2014 an internal Product Owner is fully accountable for the roadmap',pts:20},
      {label:'No, but we\u2019re planning to hire or assign one',pts:10},
      {label:'No \u2014 we expect our development partner to act as sole Product Owner',pts:0,flag:'discovery'}
    ]},
    {id:'budget',q:'What is your estimated development budget for this initiative?',options:[
      {label:'$200,000+',pts:25},
      {label:'$80,000 \u2013 $200,000',pts:22},
      {label:'$40,000 \u2013 $80,000',pts:18},
      {label:'$15,000 \u2013 $40,000',pts:10},
      {label:'Under $15,000',pts:0,kill:'budget'}
    ]},
    {id:'team',q:'How is your internal technical / engineering team structured?',options:[
      {label:'A lean internal team, fully consumed by daily ops and maintenance',pts:10},
      {label:'No in-house developers \u2014 we need a full cross-functional delivery team',pts:10},
      {label:'We want low-cost hourly staff augmentation (\u201Cbody-rental\u201D) under our direction',pts:0,kill:'bodyrental'}
    ]},
    {id:'compliance',q:'Does your application require specialized security or regulatory compliance?',options:[
      {label:'Yes \u2014 data compliance such as HIPAA, GDPR, or SOC 2',pts:5},
      {label:'Yes \u2014 technical standards such as RESO Web API or statutory insurance reporting',pts:5},
      {label:'No \u2014 standard cloud security is sufficient',pts:2}
    ]}
  ];
  var DEFSET={schedProvider:'calendly',schedMode:'link',schedUrl:'',schedEmbed:'',killOn:true,killTiming:'end',showScore:false,resourceOn:true};
  function rd(k,d){try{var v=JSON.parse(localStorage.getItem(k));return v==null?d:v;}catch(e){return d;}}
  function wr(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(e){}}
  function getQuiz(){var q=rd(QKEY,null);return (q&&q.length)?q:JSON.parse(JSON.stringify(DEFAULTQUIZ));}
  function getSet(){return Object.assign({},DEFSET,rd(SKEY,{})||{});}
  function el(tag,css,txt){var e=document.createElement(tag);if(css)e.style.cssText=css;if(txt!=null)e.textContent=txt;return e;}

  var ov,card,answers,lead,step,quiz;
  function ensureOverlay(){
    if(ov)return;
    ov=el('div','position:fixed;inset:0;z-index:10000;background:rgba(4,33,51,.62);backdrop-filter:blur(6px);display:none;align-items:flex-start;justify-content:center;overflow-y:auto;padding:28px 16px');
    ov.id='aeQuizOverlay';
    ov.addEventListener('click',function(e){if(e.target===ov)close();});
    card=el('div','width:100%;max-width:660px;background:#fff;border-radius:20px;box-shadow:0 40px 90px rgba(0,0,0,.4);overflow:hidden;font-family:\'IBM Plex Sans\',system-ui,sans-serif');
    ov.appendChild(card);
    document.body.appendChild(ov);
  }
  function open(){ensureOverlay();answers={};lead={};step=0;quiz=getQuiz();ov.style.display='flex';document.documentElement.style.overflow='hidden';render();}
  function close(){if(ov){ov.style.display='none';}document.documentElement.style.overflow='';}

  function topBar(label){
    var bar=el('div','display:flex;align-items:center;justify-content:space-between;padding:16px 22px;border-bottom:1px solid '+LINE);
    var lab=el('div','font:700 11px/1 \'Archivo\',sans-serif;letter-spacing:.14em;text-transform:uppercase;color:'+TEAL,label);
    var x=el('button','border:none;background:'+BG+';color:'+MUT+';width:32px;height:32px;border-radius:8px;font-size:17px;cursor:pointer','\u2715');
    x.addEventListener('click',close);
    bar.appendChild(lab);bar.appendChild(x);return bar;
  }
  function progress(frac){
    var wrap=el('div','height:4px;background:'+BG);
    var fill=el('div','height:100%;width:'+Math.round(frac*100)+'%;background:linear-gradient(90deg,'+NAVY+','+TEAL+');transition:width .3s ease');
    wrap.appendChild(fill);return wrap;
  }
  function render(){
    while(card.firstChild)card.removeChild(card.firstChild);
    var N=quiz.length;
    if(step<N){renderQuestion(N);}
    else if(step===N){renderLead(N);}
    else {renderResult(N);}
  }
  function renderQuestion(N){
    var qd=quiz[step];
    card.appendChild(topBar('Agility Assessment'));
    card.appendChild(progress(step/(N+1)));
    var body=el('div','padding:26px 26px 28px');
    body.appendChild(el('div','font:600 12.5px/1 \'IBM Plex Sans\',sans-serif;color:'+MUT+';margin-bottom:10px','Question '+(step+1)+' of '+N));
    body.appendChild(el('h2','font:800 clamp(20px,2.4vw,26px)/1.2 \'Archivo\',sans-serif;color:'+NAVY+';letter-spacing:-.01em;margin:0 0 20px',qd.q));
    var list=el('div','display:flex;flex-direction:column;gap:10px');
    qd.options.forEach(function(opt,oi){
      var sel=answers[qd.id]===oi;
      var b=el('button','text-align:left;cursor:pointer;border-radius:12px;padding:15px 16px;font:500 15px/1.4 \'IBM Plex Sans\',sans-serif;display:flex;align-items:center;gap:13px;transition:all .15s ease;'+(sel?'border:2px solid '+TEAL+';background:#F0FAFC;color:'+INK:'border:1px solid '+LINE+';background:#fff;color:'+INK));
      var dot=el('span','flex:none;width:20px;height:20px;border-radius:50%;'+(sel?'background:'+TEAL+';box-shadow:inset 0 0 0 4px #fff;border:1px solid '+TEAL:'border:2px solid #C4D2D9'));
      var t=el('span',null,opt.label);
      b.appendChild(dot);b.appendChild(t);
      b.addEventListener('mouseenter',function(){if(answers[qd.id]!==oi)b.style.borderColor=TEAL;});
      b.addEventListener('mouseleave',function(){if(answers[qd.id]!==oi)b.style.borderColor=LINE;});
      b.addEventListener('click',function(){
        answers[qd.id]=oi;
        var s=getSet();
        if(s.killOn&&s.killTiming==='immediate'&&opt.kill){step=quiz.length+1;render();return;}
        if(step<quiz.length-1){step++;}else{step=quiz.length;}
        render();
      });
      list.appendChild(b);
    });
    body.appendChild(list);
    if(step>0){
      var back=el('button','margin-top:22px;border:none;background:none;color:'+MUT+';font:600 14px \'IBM Plex Sans\',sans-serif;cursor:pointer;padding:6px 0','\u2190 Back');
      back.addEventListener('click',function(){step--;render();});
      body.appendChild(back);
    }
    card.appendChild(body);
  }
  function field(labelTxt,key,type,ph){
    var w=el('div','margin-bottom:14px');
    w.appendChild(el('div','font:600 12.5px/1 \'IBM Plex Sans\',sans-serif;color:'+MUT+';margin-bottom:6px',labelTxt));
    var inp=el('input','width:100%;padding:12px 13px;border:1px solid #C4D2D9;border-radius:9px;font:500 15px \'IBM Plex Sans\',sans-serif;color:'+INK);
    inp.type=type||'text';inp.placeholder=ph||'';inp.value=lead[key]||'';
    inp.addEventListener('input',function(){lead[key]=inp.value;});
    w.appendChild(inp);return w;
  }
  function renderLead(N){
    card.appendChild(topBar('Almost there'));
    card.appendChild(progress(N/(N+1)));
    var body=el('div','padding:26px');
    body.appendChild(el('h2','font:800 clamp(20px,2.4vw,26px)/1.2 \'Archivo\',sans-serif;color:'+NAVY+';margin:0 0 6px','Where should we send your assessment?'));
    body.appendChild(el('p','font:500 14.5px/1.5 \'IBM Plex Sans\',sans-serif;color:'+MUT+';margin:0 0 20px','We\u2019ll show your result, then take you straight to book a meeting with a client advisor \u2014 no spam, no list.'));
    body.appendChild(field('Full name','name','text','Jane Doe'));
    body.appendChild(field('Work email','email','email','jane@company.com'));
    body.appendChild(field('Company','company','text','Company, Inc.'));
    body.appendChild(field('Phone','phone','tel','(555) 123-4567'));
    var err=el('div','font:500 13px \'IBM Plex Sans\',sans-serif;color:#C0392B;margin:2px 0 12px;display:none');
    body.appendChild(err);
    var go=el('button','width:100%;border:none;background:'+GREEN+';color:#fff;font:700 16px \'Archivo\',sans-serif;padding:16px;border-radius:11px;cursor:pointer;box-shadow:0 12px 26px rgba(46,139,87,.3)','See my results & book my call \u2192');
    go.addEventListener('click',function(){
      if(!lead.name||!lead.email||!/.+@.+\..+/.test(lead.email||'')){err.textContent='Please add your name and a valid work email.';err.style.display='block';return;}
      step=N+1;render();
    });
    body.appendChild(go);
    var back=el('button','margin-top:14px;border:none;background:none;color:'+MUT+';font:600 14px \'IBM Plex Sans\',sans-serif;cursor:pointer;width:100%','\u2190 Back');
    back.addEventListener('click',function(){step=N-1;render();});
    body.appendChild(back);
    card.appendChild(body);
  }
  function compute(){
    var total=0,kills=[],flags=[];
    quiz.forEach(function(qd){
      var oi=answers[qd.id];if(oi==null)return;var opt=qd.options[oi];if(!opt)return;
      total+=(opt.pts||0);
      if(opt.kill)kills.push(opt.kill);
      if(opt.flag)flags.push(opt.flag);
    });
    var s=getSet();
    var disq=s.killOn&&kills.length>0;
    var tier=disq?'disqualified':(total>=80?'elite':(total>=50?'moderate':'low'));
    if(flags.indexOf('discovery')>-1&&tier==='elite')tier='moderate';
    return {total:total,kills:kills,flags:flags,tier:tier,disq:disq};
  }
  function saveLead(r){
    var arr=rd(LKEY,[])||[];
    arr.unshift({ts:new Date().toISOString(),lead:lead,answers:answers,score:r.total,tier:r.tier,kills:r.kills});
    wr(LKEY,arr.slice(0,200));
  }
  function openScheduler(){
    var s=getSet();
    if(s.schedMode==='embed'&&(s.schedEmbed||'').trim()){renderEmbedPage(s);return;}
    var u=(s.schedUrl||'').trim();
    if(u){window.open(u,'_blank','noopener');return;}
    alert('Scheduler not configured yet. An admin can add a Calendly or SmartScheduler link (or embed code) in the Page admin panel.');
  }
  function renderEmbedPage(s){
    while(card.firstChild)card.removeChild(card.firstChild);
    card.style.maxWidth='860px';
    card.appendChild(topBar('Book your Agility Assessment'));
    var body=el('div','padding:0');
    var host=el('div','min-height:640px;background:'+BG);
    host.innerHTML=s.schedEmbed;
    // re-exec any scripts in the embed
    var scripts=host.querySelectorAll('script');
    for(var i=0;i<scripts.length;i++){var os=scripts[i];var ns=document.createElement('script');if(os.src)ns.src=os.src;else ns.textContent=os.textContent;os.parentNode.replaceChild(ns,os);}
    body.appendChild(host);card.appendChild(body);
  }
  function pill(txt,bg,col){var p=el('span','display:inline-block;padding:6px 12px;border-radius:100px;font:700 12px \'Archivo\',sans-serif;background:'+bg+';color:'+col,txt);return p;}
  function renderResult(N){
    var r=compute();saveLead(r);
    var s=getSet();
    card.style.maxWidth='660px';
    var qualified=(r.tier==='elite'||r.tier==='moderate');
    // If qualified and admin hides score -> go straight to scheduler
    if(qualified&&!s.showScore){renderBooking(r,s);return;}
    if(!qualified){renderResource(r,s);return;}
    // qualified + show score
    card.appendChild(topBar('Your Strategic Fit'));
    var body=el('div','padding:28px 26px');
    var ring=el('div','display:flex;align-items:center;gap:18px;margin-bottom:18px');
    var num=el('div','font:800 48px/1 \'Archivo\',sans-serif;color:'+NAVY,String(r.total));
    var of=el('div','font:600 15px \'IBM Plex Sans\',sans-serif;color:'+MUT,'/ 100\nStrategic Fit Score'.split('\n')[0]);
    var scoreWrap=el('div',null);scoreWrap.appendChild(num);
    var lab=el('div','font:600 13px \'IBM Plex Sans\',sans-serif;color:'+MUT+';margin-top:2px','out of 100 \u00b7 Strategic Fit Score');
    scoreWrap.appendChild(lab);
    ring.appendChild(scoreWrap);
    body.appendChild(ring);
    body.appendChild(r.tier==='elite'?pill('Strong fit','#E8F6EE',GREEN):pill('Promising fit','#EAF1F8',NAVY));
    var msg=r.tier==='elite'
      ?'Your initiative lines up closely with the work we do best. A client advisor can walk you through what this score means and the fastest path to production.'
      :'You\u2019re a promising fit. We\u2019d start with a short paid discovery sprint to lock scope before any build \u2014 a client advisor will explain how that de-risks the work.';
    body.appendChild(el('p','font:500 15.5px/1.6 \'IBM Plex Sans\',sans-serif;color:'+INK+';margin:16px 0 22px',msg));
    var go=el('button','width:100%;border:none;background:'+GREEN+';color:#fff;font:700 16px \'Archivo\',sans-serif;padding:16px;border-radius:11px;cursor:pointer;box-shadow:0 12px 26px rgba(46,139,87,.3)','Book your Agility Assessment \u2192');
    go.addEventListener('click',function(){openScheduler();});
    body.appendChild(go);
    body.appendChild(el('p','font:500 12.5px/1.5 \'IBM Plex Sans\',sans-serif;color:'+MUT+';text-align:center;margin:12px 0 0','30 minutes with a client advisor to go deeper on your score and next steps.'));
    card.appendChild(body);
  }
  function renderBooking(r,s){
    card.appendChild(topBar(r.tier==='moderate'?'One step before we build':'You\u2019re a strong fit'));
    var body=el('div','padding:28px 26px');
    body.appendChild(el('h2','font:800 24px/1.2 \'Archivo\',sans-serif;color:'+NAVY+';margin:0 0 10px',r.tier==='moderate'?'Let\u2019s scope it the right way':'Let\u2019s map your path to production'));
    var msg=r.tier==='moderate'
      ?'Based on your answers, we\u2019d begin with a short paid discovery sprint to lock scope before any code \u2014 your advisor will explain how it works on the call.'
      :'Your answers line up closely with the work we do best. Grab a time with a client advisor to map the fastest path from idea to production.';
    body.appendChild(el('p','font:500 15.5px/1.6 \'IBM Plex Sans\',sans-serif;color:'+INK+';margin:0 0 22px',msg));
    var go=el('button','width:100%;border:none;background:'+GREEN+';color:#fff;font:700 16px \'Archivo\',sans-serif;padding:16px;border-radius:11px;cursor:pointer;box-shadow:0 12px 26px rgba(46,139,87,.3)','Book your Agility Assessment \u2192');
    go.addEventListener('click',function(){openScheduler();});
    body.appendChild(go);
    card.appendChild(body);
  }
  function renderResource(r,s){
    if(!s.resourceOn){
      card.appendChild(topBar('Thank you'));
      var b0=el('div','padding:28px 26px');
      b0.appendChild(el('h2','font:800 24px/1.2 \'Archivo\',sans-serif;color:'+NAVY+';margin:0 0 10px','Thanks \u2014 we\u2019ve got your details'));
      b0.appendChild(el('p','font:500 15.5px/1.6 \'IBM Plex Sans\',sans-serif;color:'+INK,'A member of our team will reach out if there\u2019s a fit. We appreciate your time.'));
      card.appendChild(b0);return;
    }
    card.appendChild(topBar('A better-fit path'));
    var body=el('div','padding:28px 26px');
    body.appendChild(el('h2','font:800 24px/1.2 \'Archivo\',sans-serif;color:'+NAVY+';margin:0 0 10px','Here\u2019s the fastest way forward for you'));
    body.appendChild(el('p','font:500 15px/1.6 \'IBM Plex Sans\',sans-serif;color:'+INK+';margin:0 0 20px','Based on where your project is today, a full custom engineering engagement likely isn\u2019t the most efficient next step. These get you moving quickly \u2014 and we\u2019re here when the build gets serious.'));
    var recs=[
      ['Validate with no-code','Stand up a working version fast on a visual platform like Bubble or Softr before investing in custom code.'],
      ['Start with off-the-shelf SaaS','For common workflows, a configurable SaaS tool will outpace a from-scratch build on both cost and time.'],
      ['Right-size the budget','When the idea proves out and the budget grows with it, come back \u2014 that\u2019s exactly when our team adds the most value.']
    ];
    var list=el('div','display:flex;flex-direction:column;gap:12px;margin-bottom:22px');
    recs.forEach(function(rc){
      var rcw=el('div','border:1px solid '+LINE+';border-radius:12px;padding:16px 18px;background:'+BG);
      rcw.appendChild(el('div','font:700 15px \'Archivo\',sans-serif;color:'+NAVY+';margin-bottom:4px',rc[0]));
      rcw.appendChild(el('div','font:500 14px/1.5 \'IBM Plex Sans\',sans-serif;color:'+MUT,rc[1]));
      list.appendChild(rcw);
    });
    body.appendChild(list);
    body.appendChild(el('p','font:500 13px/1.5 \'IBM Plex Sans\',sans-serif;color:'+MUT+';text-align:center','We\u2019ll keep your details on file \u2014 reach back out anytime your scope or budget changes.'));
    card.appendChild(body);
  }

  /* ---- intercept every CTA ---- */
  document.addEventListener('click',function(e){
    var a=e.target.closest&&e.target.closest('a[href="#book"]');
    if(!a)return;
    if(a.closest&&a.closest('#aeDrawer'))return;
    e.preventDefault();open();
  },true);

  /* ---- admin settings injected into the existing drawer ---- */
  function chip(labelTxt){return el('div','font:700 11px/1 \'Archivo\',sans-serif;letter-spacing:.12em;text-transform:uppercase;color:'+TEAL+';margin:22px 0 8px',labelTxt);}
  function selectRow(labelTxt,key,opts){
    var w=el('div','margin-bottom:11px');
    w.appendChild(el('div','font:600 12px/1 \'IBM Plex Sans\',sans-serif;color:#46565E;margin-bottom:5px',labelTxt));
    var sel=el('select','width:100%;padding:10px 11px;border:1px solid #D5DEE2;border-radius:8px;font:500 14px \'IBM Plex Sans\',sans-serif;color:'+INK+';background:#fff');
    opts.forEach(function(o){var op=el('option',null,o[1]);op.value=o[0];sel.appendChild(op);});
    sel.value=getSet()[key];
    sel.addEventListener('change',function(){var s=getSet();s[key]=sel.value;wr(SKEY,s);});
    w.appendChild(sel);return w;
  }
  function textRow(labelTxt,key,ph,area){
    var w=el('div','margin-bottom:11px');
    w.appendChild(el('div','font:600 12px/1 \'IBM Plex Sans\',sans-serif;color:#46565E;margin-bottom:5px',labelTxt));
    var inp=area?el('textarea','width:100%;min-height:74px;padding:9px 11px;border:1px solid #D5DEE2;border-radius:8px;font:500 13px \'IBM Plex Sans\',sans-serif;color:'+INK):el('input','width:100%;padding:9px 11px;border:1px solid #D5DEE2;border-radius:8px;font:500 14px \'IBM Plex Sans\',sans-serif;color:'+INK);
    if(!area)inp.type='text';inp.placeholder=ph||'';inp.value=getSet()[key]||'';
    inp.addEventListener('input',function(){var s=getSet();s[key]=inp.value;wr(SKEY,s);});
    w.appendChild(inp);return w;
  }
  function toggleRow(labelTxt,key){
    var lab=el('label','display:flex;align-items:center;justify-content:space-between;gap:12px;padding:9px 0;border-bottom:1px solid #EEF2F4;font:500 14px/1.3 \'IBM Plex Sans\',sans-serif;color:'+INK+';cursor:pointer');
    lab.appendChild(el('span',null,labelTxt));
    var c=el('input','width:18px;height:18px;accent-color:'+GREEN);c.type='checkbox';c.checked=!!getSet()[key];
    c.addEventListener('change',function(){var s=getSet();s[key]=c.checked;wr(SKEY,s);});
    lab.appendChild(c);return lab;
  }
  function btn(labelTxt,fn,primary){
    var b=el('button','width:100%;padding:11px;margin-top:8px;border-radius:9px;font:700 13px \'Archivo\',sans-serif;cursor:pointer;'+(primary?'border:none;background:'+NAVY+';color:#fff':'border:1px solid #D5DEE2;background:#fff;color:'+NAVY),labelTxt);
    b.addEventListener('click',fn);return b;
  }
  function injectAdmin(){
    var drawer=document.getElementById('aeDrawer');if(!drawer)return false;
    var scroll=drawer.children[1];if(!scroll||scroll.getAttribute('data-quiz-ui'))return true;
    scroll.setAttribute('data-quiz-ui','1');
    var sec=el('div',null);
    sec.appendChild(chip('Lead qualifier \u2192 booking'));
    sec.appendChild(el('div','font:500 12px/1.4 \'IBM Plex Sans\',sans-serif;color:#8a9aa2;margin-bottom:10px','Every CTA opens the qualifier, then routes the lead. Configure the flow here.'));
    sec.appendChild(selectRow('Scheduler provider','schedProvider',[['calendly','Calendly'],['smartscheduler','SmartScheduler.ai'],['custom','Other / custom']]));
    sec.appendChild(selectRow('Booking mode','schedMode',[['link','Direct link (opens scheduler)'],['embed','Embed (builds an in-app booking page)']]));
    sec.appendChild(textRow('Scheduler link (Calendly / SmartScheduler)','schedUrl','https://calendly.com/\u2026'));
    sec.appendChild(textRow('Embed code (used when mode = Embed)','schedEmbed','<!-- paste Calendly / SmartScheduler embed -->',true));
    sec.appendChild(chip('Qualifying rules'));
    sec.appendChild(toggleRow('Enable kill-switches (auto-disqualify)','killOn'));
    sec.appendChild(selectRow('Kill-switch timing','killTiming',[['end','Route at the end of the form'],['immediate','Bounce as soon as it triggers']]));
    sec.appendChild(toggleRow('Show the Fit Score to the prospect','showScore'));
    sec.appendChild(toggleRow('Show the better-fit resource page','resourceOn'));
    sec.appendChild(chip('Questionnaire & leads'));
    sec.appendChild(btn('Edit questionnaire (JSON)',openQuizEditor));
    sec.appendChild(btn('View captured leads',openLeads));
    sec.appendChild(btn('Preview the qualifier',function(){open();}));
    scroll.appendChild(sec);
    return true;
  }
  var tries=0;var iv=setInterval(function(){tries++;if(injectAdmin()||tries>60)clearInterval(iv);},150);

  function modal(title){
    ensureOverlay();while(card.firstChild)card.removeChild(card.firstChild);card.style.maxWidth='720px';
    ov.style.display='flex';document.documentElement.style.overflow='hidden';
    card.appendChild(topBar(title));return el;
  }
  function openQuizEditor(){
    modal('Edit questionnaire');
    var body=el('div','padding:22px 24px');
    body.appendChild(el('p','font:500 13.5px/1.5 \'IBM Plex Sans\',sans-serif;color:'+MUT+';margin:0 0 12px','Questions, options and point weights live here as JSON. Edit and save \u2014 a friendlier visual editor is a Claude Code build task.'));
    var ta=el('textarea','width:100%;min-height:340px;padding:12px;border:1px solid #C4D2D9;border-radius:10px;font:500 12.5px/1.5 ui-monospace,Menlo,monospace;color:'+INK);
    ta.value=JSON.stringify(getQuiz(),null,2);
    body.appendChild(ta);
    var err=el('div','font:500 13px \'IBM Plex Sans\',sans-serif;color:#C0392B;margin-top:8px;display:none');body.appendChild(err);
    var save=el('button','margin-top:12px;border:none;background:'+GREEN+';color:#fff;font:700 14px \'Archivo\',sans-serif;padding:13px 18px;border-radius:9px;cursor:pointer','Save questionnaire');
    save.addEventListener('click',function(){try{var v=JSON.parse(ta.value);if(!Array.isArray(v)||!v.length)throw 0;wr(QKEY,v);close();}catch(e){err.textContent='That isn\u2019t valid JSON \u2014 check your commas and brackets.';err.style.display='block';}});
    body.appendChild(save);
    var reset=el('button','margin-top:8px;border:1px solid #D5DEE2;background:#fff;color:'+NAVY+';font:700 14px \'Archivo\',sans-serif;padding:13px 18px;border-radius:9px;cursor:pointer;width:100%','Reset to default questions');
    reset.addEventListener('click',function(){ta.value=JSON.stringify(DEFAULTQUIZ,null,2);});
    body.appendChild(reset);
    card.appendChild(body);
  }
  function openLeads(){
    modal('Captured leads');
    var body=el('div','padding:18px 22px');
    var leads=rd(LKEY,[])||[];
    body.appendChild(el('p','font:500 13px/1.5 \'IBM Plex Sans\',sans-serif;color:'+MUT+';margin:0 0 14px','Demo capture (saved in this browser). In production these flow to your CRM / dashboard with the score attached.'));
    if(!leads.length){body.appendChild(el('div','font:500 14px \'IBM Plex Sans\',sans-serif;color:'+MUT,'No leads captured yet \u2014 run the qualifier to see one here.'));}
    leads.forEach(function(L){
      var tierCol=L.tier==='elite'?GREEN:(L.tier==='moderate'?NAVY:(L.tier==='disqualified'?'#C0392B':'#B9770C'));
      var row=el('div','border:1px solid '+LINE+';border-radius:12px;padding:14px 16px;margin-bottom:10px');
      var head=el('div','display:flex;justify-content:space-between;align-items:center;gap:10px;margin-bottom:6px');
      head.appendChild(el('div','font:700 15px \'Archivo\',sans-serif;color:'+NAVY,(L.lead&&L.lead.name||'\u2014')+(L.lead&&L.lead.company?' \u00b7 '+L.lead.company:'')));
      var badge=el('span','font:700 11px \'Archivo\',sans-serif;padding:4px 10px;border-radius:100px;background:'+BG+';color:'+tierCol,(L.score!=null?L.score+' \u00b7 ':'')+L.tier);
      head.appendChild(badge);row.appendChild(head);
      row.appendChild(el('div','font:500 12.5px/1.5 \'IBM Plex Sans\',sans-serif;color:'+MUT,(L.lead&&L.lead.email||'')+(L.lead&&L.lead.phone?' \u00b7 '+L.lead.phone:'')));
      body.appendChild(row);
    });
    if(leads.length){
      var clr=el('button','margin-top:6px;border:1px solid #D5DEE2;background:#fff;color:#C0392B;font:700 13px \'Archivo\',sans-serif;padding:11px;border-radius:9px;cursor:pointer;width:100%','Clear captured leads');
      clr.addEventListener('click',function(){wr(LKEY,[]);openLeads();});
      body.appendChild(clr);
    }
    card.appendChild(body);
  }
  window.aeQuiz={open:open};
})();
