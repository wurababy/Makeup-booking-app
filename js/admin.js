var $=function(i){return document.getElementById(i)};
var CODE="rose2026"; /* demo lock only: change it, and see the note about real security */
function esc(s){return String(s==null?"":s).replace(/[&<>"]/g,function(c){return{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]})}
function fmt(n){return "₦"+(+n||0).toLocaleString("en-NG")}
function lbl(m){var h=Math.floor(m/60),i=m%60,a=h>=12?"pm":"am";h=h%12||12;return h+":"+(i<10?"0":"")+i+" "+a}
function nice(d){return new Date(d+"T00:00:00").toLocaleDateString("en-GB",{weekday:"short",day:"numeric",month:"short",year:"numeric"})}
var DAYS=["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],S={},B=[];
try{S=JSON.parse(localStorage.getItem("settings"))||{}}catch(e){}
S.looks=S.looks||JSON.parse(JSON.stringify(LOOKS));S.cats=S.cats||CATS.slice(1);S.deposit=S.deposit||15000;
S.av=Object.assign({workDays:[1,2,3,4,5,6],open:"09:00",close:"18:00",step:30,buffer:30,leadDays:1,maxDays:90,blocked:[],extra:[]},S.av||{});
try{B=JSON.parse(localStorage.getItem("bk")||"[]")}catch(e){}
function save(){try{localStorage.setItem("settings",JSON.stringify(S));$("msg").textContent="Saved on this device."}catch(e){$("msg").textContent="Couldn’t save. Your photos may be too large."}}
function saveB(){try{localStorage.setItem("bk",JSON.stringify(B))}catch(e){}}

/* lock (keeps casual visitors out; it is not real security) */
function unlock(){$("gate").hidden=true;$("app").hidden=false;try{sessionStorage.setItem("adm","1")}catch(e){}rA();rD();rL()}
$("gform").onsubmit=function(e){e.preventDefault();if($("code").value===CODE)unlock();else $("gerr").textContent="That code isn’t right."};
try{if(sessionStorage.getItem("adm"))unlock()}catch(e){}
$("tabs").onclick=function(e){var t=e.target.dataset.t;if(!t)return;
  ["t1","t2","t3"].forEach(function(id){$(id).hidden=id!==t});
  this.querySelectorAll("button").forEach(function(b){b.setAttribute("aria-pressed",b.dataset.t===t)})};

/* appointments */
function rA(){
  var live=B.filter(function(b){return b.status!=="cancelled"}),dep=0,out=0;
  live.forEach(function(b){dep+=b.deposit||0;if(!b.balancePaid)out+=Math.max((b.price||0)-(b.deposit||0),0)});
  $("sumrow").innerHTML=[["Deposits received",fmt(dep)],["Outstanding balances",fmt(out)],["Active bookings",live.length]].map(function(x){return '<div class="card"><span class="muted">'+x[0]+'</span><div class="price">'+x[1]+'</div></div>'}).join("");
  var L=B.slice().sort(function(a,b){return (a.date+(1000+a.start)).localeCompare(b.date+(1000+b.start))});
  $("seed").hidden=B.length>0;
  $("alist").innerHTML=L.length?L.map(function(b){
    var i=B.indexOf(b),ph=String(b.phone||"").replace(/\D/g,"").replace(/^0/,"234"),rem=Math.max((b.price||0)-(b.deposit||0),0);
    var so=["confirmed","completed","cancelled"].map(function(s){return '<option value="'+s+'"'+(s===b.status?" selected":"")+'>'+s.charAt(0).toUpperCase()+s.slice(1)+'</option>'}).join("");
    return '<details class="card appt'+(b.status==="cancelled"?" off":"")+'" data-r="'+esc(b.ref)+'"><summary><b>'+nice(b.date)+' · '+lbl(b.start)+'</b> · '+esc(b.name)+', '+esc(b.look)+' <span class="tag">'+b.status+'</span></summary><div class="two" style="margin-top:14px"><p><b>Phone:</b> <a href="tel:'+esc(b.phone)+'">'+esc(b.phone)+'</a> · <a target="_blank" rel="noopener" href="https://wa.me/'+ph+'">WhatsApp</a><br><b>Email:</b> <a href="mailto:'+esc(b.email)+'">'+esc(b.email)+'</a><br><b>Occasion:</b> '+esc(b.occ)+'<br><b>Notes:</b> '+(esc(b.notes)||"None")+'<br><b>Reference:</b> '+esc(b.ref)+'</p><div><p><b>Total:</b> '+fmt(b.price)+' · <b>Deposit paid:</b> '+fmt(b.deposit)+'<br><b>Balance:</b> '+(b.balancePaid?"Paid":fmt(rem)+" due")+'</p><label>Status</label><select data-i="'+i+'" data-f="status">'+so+'</select><label class="check" style="margin-top:12px"><input type="checkbox" data-i="'+i+'" data-f="balancePaid"'+(b.balancePaid?" checked":"")+'><span>Balance paid</span></label></div></div></details>'}).join(""):'<p class="muted">No bookings yet. New bookings appear here with their deposit and balance.</p>';
}
$("alist").onchange=function(e){var t=e.target,r=t.closest("details").dataset.r,i=+t.dataset.i;
  B[i][t.dataset.f]=t.dataset.f==="balancePaid"?t.checked:t.value;saveB();rA();var d=$("alist").querySelector('[data-r="'+r+'"]');if(d)d.open=true};
$("seed").onclick=function(){
  function day(n){var d=new Date();d.setDate(d.getDate()+n);return d.getFullYear()+"-"+("0"+(d.getMonth()+1)).slice(-2)+"-"+("0"+d.getDate()).slice(-2)}
  B=[{ref:"BKSAMPLE1",date:day(3),start:600,end:720,name:"Adaeze Obi",phone:"0803 000 0001",email:"adaeze@example.com",occ:"Wedding",notes:"Trial please",look:"Bridal Glam",price:120000,deposit:15000,status:"confirmed",balancePaid:false},
     {ref:"BKSAMPLE2",date:day(5),start:780,end:870,name:"Tola Bello",phone:"0803 000 0002",email:"tola@example.com",occ:"Birthday",notes:"",look:"Birthday Glam",price:50000,deposit:15000,status:"confirmed",balancePaid:false}];
  saveB();rA()};

/* dates & times */
function rD(){var a=S.av;$("open").value=a.open;$("close").value=a.close;$("step").value=a.step;$("buf").value=a.buffer;$("dep").value=S.deposit;
  $("days").innerHTML=DAYS.map(function(d,i){return '<label class="check" style="margin:0"><input type="checkbox" data-d="'+i+'"'+(a.workDays.indexOf(i)>-1?" checked":"")+'><span>'+d+'</span></label>'}).join("");
  ["blocked","extra"].forEach(function(k){$("l-"+k).innerHTML=a[k].map(function(d,i){return '<li>'+nice(d)+' <button type="button" class="btn btn-text btn-sm" data-k="'+k+'" data-i="'+i+'">Remove</button></li>'}).join("")||'<li class="muted">None</li>'})}
["open","close"].forEach(function(id){$(id).onchange=function(){S.av[id]=this.value;save()}});
$("step").onchange=function(){S.av.step=+this.value;save()};
$("buf").onchange=function(){S.av.buffer=+this.value;save()};
$("dep").onchange=function(){S.deposit=+this.value;save()};
$("days").onchange=function(){S.av.workDays=[].slice.call(this.querySelectorAll("input:checked")).map(function(x){return +x.dataset.d});save()};
["blocked","extra"].forEach(function(k){
  $("add-"+k).onclick=function(){var v=$("in-"+k).value,a=S.av[k];if(v&&a.indexOf(v)<0){a.push(v);a.sort();save();rD()}};
  $("l-"+k).onclick=function(e){var b=e.target.closest("button");if(b){S.av[k].splice(+b.dataset.i,1);save();rD()}}});

/* looks, prices, photos, categories */
function shrink(f,cb){var r=new FileReader();r.onload=function(){var im=new Image();im.onload=function(){var s=Math.min(1,900/Math.max(im.width,im.height)),c=document.createElement("canvas");c.width=im.width*s;c.height=im.height*s;c.getContext("2d").drawImage(im,0,0,c.width,c.height);cb(c.toDataURL("image/jpeg",.75))};im.src=r.result};r.readAsDataURL(f)}
function rL(){
  $("cats").innerHTML=S.cats.map(function(c,i){return '<span class="chip">'+esc(c)+' <button type="button" data-c="'+i+'" aria-label="Remove '+esc(c)+'">×</button></span>'}).join("");
  $("llist").innerHTML=S.looks.map(function(l,i){
    var o=S.cats.concat(S.cats.indexOf(l.c)<0?[l.c]:[]).map(function(c){return '<option'+(c===l.c?" selected":"")+'>'+esc(c)+'</option>'}).join("");
    return '<div class="card lk"><div class="photo thumb" data-ph="No photo"><img src="'+(l.photo||"images/"+l.s+".jpg")+'" alt="" onerror="this.remove()"></div><div class="lkf"><div><label>Name</label><input data-i="'+i+'" data-f="n" value="'+esc(l.n)+'"></div><div><label>Category</label><select data-i="'+i+'" data-f="c">'+o+'</select></div><div><label>Price (₦)</label><input type="number" min="0" step="1000" data-i="'+i+'" data-f="p" value="'+l.p+'"></div><div><label>Duration (minutes)</label><input type="number" min="15" step="15" data-i="'+i+'" data-f="m" value="'+l.m+'"></div><div style="grid-column:1/-1"><label>Description</label><input data-i="'+i+'" data-f="d" value="'+esc(l.d)+'"></div><div><label>Photo</label><input type="file" accept="image/*" data-i="'+i+'" data-ph="1"></div><div style="align-self:end"><button type="button" class="btn btn-text btn-sm" data-rm="'+i+'">Remove this look</button></div></div></div>'}).join("")}
$("llist").onchange=function(e){var t=e.target,i=+t.dataset.i,l=S.looks[i];
  if(t.dataset.ph){var f=t.files[0];if(f)shrink(f,function(u){l.photo=u;save();rL()});return}
  l[t.dataset.f]=(t.dataset.f==="p"||t.dataset.f==="m")?+t.value:t.value;save()};
$("llist").onclick=function(e){var b=e.target.closest("[data-rm]");if(b&&confirm("Remove this look?")){S.looks.splice(+b.dataset.rm,1);save();rL()}};
$("addlook").onclick=function(){S.looks.push({n:"New look",c:S.cats[0]||"",s:"look-"+Date.now(),m:60,p:0,d:"Short description"});save();rL()};
$("addcat").onclick=function(){var v=$("newcat").value.trim();if(v&&S.cats.indexOf(v)<0){S.cats.push(v);$("newcat").value="";save();rL()}};
$("cats").onclick=function(e){var b=e.target.closest("button");if(!b)return;var c=S.cats[+b.dataset.c];
  if(S.looks.some(function(l){return l.c===c})){$("msg").textContent="Move or remove the looks in “"+c+"” first.";return}
  S.cats.splice(+b.dataset.c,1);save();rL()};

/* publishing */
function out(){return JSON.stringify({looks:S.looks,cats:S.cats,av:S.av,deposit:S.deposit},null,1)}
$("dl").onclick=function(){var a=document.createElement("a");a.href=URL.createObjectURL(new Blob([out()],{type:"application/json"}));a.download="settings.json";a.click()};
$("cp").onclick=function(){navigator.clipboard.writeText(out()).then(function(){$("msg").textContent="Copied. Paste it into data/settings.json on GitHub."},function(){$("msg").textContent="Couldn’t copy. Use Download instead."})};
