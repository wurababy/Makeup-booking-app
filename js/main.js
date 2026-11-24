/* ====== SETTINGS: edit these ====== */
var CONFIG={deposit:15000,currency:"₦",
  // Add your Paystack public key (starts with pk_) to take real payments. Leave blank for demo mode.
  paystackKey:""};
var $=function(i){return document.getElementById(i)};
var fmt=function(n){return CONFIG.currency+n.toLocaleString("en-NG")};
var chosen={style:"",time:""};

/* Makeup looks: edit names, categories, prices, descriptions. Photos go in images/ as <slug>.jpg */
var CATS=["All Looks","Soft Glam","Full Glam","Bridal","Birthday","Natural","Traditional","Editorial"];
var LOOKS=[
 {n:"Soft Glam",c:"Soft Glam",s:"soft-glam",m:60,p:45000,d:"Polished, luminous makeup for parties and photoshoots."},
 {n:"Rosy Soft Glam",c:"Soft Glam",s:"rosy-soft-glam",m:60,p:48000,d:"Dewy skin, rosy cheeks and a glossy lip."},
 {n:"Full Glam",c:"Full Glam",s:"full-glam",m:90,p:55000,d:"Bold, sculpted and camera-ready for your biggest nights."},
 {n:"Smoky Full Glam",c:"Full Glam",s:"smoky-full-glam",m:90,p:60000,d:"Dramatic smoky eyes with flawless, long-wear skin."},
 {n:"Bridal Glam",c:"Bridal",s:"bridal-glam",m:150,p:120000,d:"A long-wear, romantic finish. Trial included."},
 {n:"Bridesmaid Glam",c:"Bridal",s:"bridesmaid-glam",m:75,p:50000,d:"Soft, coordinated glam for the bridal party."},
 {n:"Birthday Glam",c:"Birthday",s:"birthday-glam",m:75,p:50000,d:"Radiant and celebratory, made to be photographed."},
 {n:"Natural Glam",c:"Natural",s:"natural-glam",m:45,p:30000,d:"Fresh, skin-first makeup that looks effortlessly like you."},
 {n:"Traditional Glam",c:"Traditional",s:"traditional-glam",m:120,p:70000,d:"Rich, elegant makeup for weddings and cultural celebrations."},
 {n:"Editorial Look",c:"Editorial",s:"editorial-look",m:120,p:80000,d:"Creative, artistic makeup for shoots and fashion."}];
var grid=$("looks-grid"),sel=$("style"),chips=$("chips"),cat="All Looks",cur="";
function img(s){return "images/"+s+".jpg"}
sel.innerHTML='<option value="">Choose a look</option>';
LOOKS.forEach(function(l){sel.add(new Option(l.n,l.n))});
function drawChips(){
  chips.innerHTML="";
  CATS.forEach(function(x){
    var b=document.createElement("button");b.type="button";b.className="slot";b.textContent=x;
    b.setAttribute("aria-pressed",x===cat);
    b.onclick=function(){cat=x;drawChips();drawGrid()};chips.appendChild(b)});
}
function drawGrid(){
  grid.innerHTML="";
  LOOKS.filter(function(l){return cat==="All Looks"||l.c===cat}).forEach(function(l){
    var a=document.createElement("article");a.className="card look";
    a.innerHTML='<div class="photo" data-ph="Add photo"><img src="'+img(l.s)+'" alt="'+l.n+' makeup look" onerror="this.remove()"></div><h3>'+l.n+'</h3><p class="muted">'+l.d+'</p><div class="price">'+fmt(l.p)+'</div><button class="btn btn-primary" type="button" style="margin:10px 8px 0;align-self:flex-start;padding:10px 22px">Choose This Look</button>';
    a.querySelector("button").onclick=a.querySelector(".photo").onclick=function(){openLook(l)};
    grid.appendChild(a)});
}
function openLook(l){
  cur=l.n;$("dcat").textContent=l.c;$("dname").textContent=l.n;$("ddesc").textContent=l.d;$("dprice").textContent=fmt(l.p)+" · about "+dur(l.m);
  var i=$("dimg");i.style.display="";i.onerror=function(){i.style.display="none"};i.src=img(l.s);
  $("gallery").hidden=true;$("detail").hidden=false;$("looks").scrollIntoView();
}
$("back").onclick=function(){$("detail").hidden=true;$("gallery").hidden=false;$("looks").scrollIntoView()};
$("dbook").onclick=function(){pickStyle(cur)};
function pickStyle(n){sel.value=n;onLook();go(1)}
drawChips();drawGrid();

/* Inspiration photo: previews in the browser. Sending it to you needs a backend (see README). */
$("inspo").onchange=function(){
  var f=this.files[0];if(!f)return;
  var p=$("inspoPv");p.src=URL.createObjectURL(f);p.style.display="block";
  $("inspoNote").textContent="Inspiration photo added: "+f.name;
};

/* ===== Booking =====
   Working hours, buffer and blocked dates are set in data/availability.json (edit it on GitHub to block dates).
   IMPORTANT: bookings are remembered in this browser only (demo). To truly stop two clients booking the
   same time, a server must keep the bookings, check them again at payment and confirm only after Paystack
   verifies the payment. The functions slotsFor() and finish() are where that connects. */
var AV={workDays:[1,2,3,4,5,6],open:"09:00",close:"18:00",step:30,buffer:30,leadDays:1,maxDays:90,blocked:[]};
var B=[];try{B=JSON.parse(localStorage.getItem("bk")||"[]")}catch(x){}
function saveB(){try{localStorage.setItem("bk",JSON.stringify(B))}catch(x){}}
function tm(s){var p=s.split(":");return +p[0]*60+ +p[1]}
function lbl(m){var h=Math.floor(m/60),i=m%60,a=h>=12?"pm":"am";h=h%12||12;return h+":"+(i<10?"0":"")+i+" "+a}
function dur(m){return m<60?m+" min":Math.floor(m/60)+" hr"+(m%60?" "+m%60+" min":"")}
function two(n){return n<10?"0"+n:""+n}
function ds(d){return d.getFullYear()+"-"+two(d.getMonth()+1)+"-"+two(d.getDate())}
function curLook(){return LOOKS.filter(function(l){return l.n===sel.value})[0]}
function slotsFor(date){
  var l=curLook(),out=[];if(!l)return out;
  for(var s=tm(AV.open);s+l.m<=tm(AV.close);s+=AV.step){
    var e=s+l.m+AV.buffer,free=true;
    B.forEach(function(b){if(b.date===date&&s<b.end&&e>b.start)free=false});
    if(free)out.push(s)}
  return out;
}
function dayOK(d){
  var t=new Date();t.setHours(0,0,0,0);
  var a=new Date(t),z=new Date(t);a.setDate(t.getDate()+AV.leadDays);z.setDate(t.getDate()+AV.maxDays);
  return d>=a&&d<=z&&AV.workDays.indexOf(d.getDay())>-1&&AV.blocked.indexOf(ds(d))<0&&slotsFor(ds(d)).length>0;
}
var now=new Date(),cy=now.getFullYear(),cm=now.getMonth(),pickD="",pickT=null,info={};
function calDraw(){
  var c=$("cal"),first=new Date(cy,cm,1),n=new Date(cy,cm+1,0).getDate();
  var h='<div class="calhead"><button type="button" class="navb" id="cp" aria-label="Previous month">‹</button><span>'+first.toLocaleDateString("en-GB",{month:"long",year:"numeric"})+'</span><button type="button" class="navb" id="cn" aria-label="Next month">›</button></div><div class="cgrid">';
  "SMTWTFS".split("").forEach(function(x){h+="<span>"+x+"</span>"});
  for(var i=0;i<first.getDay();i++)h+="<div></div>";
  for(var d=1;d<=n;d++){var dt=new Date(cy,cm,d),s=ds(dt);
    h+='<button type="button" class="day" data-d="'+s+'" aria-pressed="'+(s===pickD)+'" aria-label="'+dt.toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long"})+'"'+(dayOK(dt)?"":" disabled")+">"+d+"</button>"}
  c.innerHTML=h+"</div>";
  var t=new Date(),mx=new Date();mx.setDate(t.getDate()+AV.maxDays);
  $("cp").disabled=cy===t.getFullYear()&&cm===t.getMonth();
  $("cn").disabled=cy>mx.getFullYear()||(cy===mx.getFullYear()&&cm>=mx.getMonth());
  $("cp").onclick=function(){cm--;if(cm<0){cm=11;cy--}calDraw()};
  $("cn").onclick=function(){cm++;if(cm>11){cm=0;cy++}calDraw()};
  c.querySelectorAll(".day").forEach(function(b){b.onclick=function(){pickD=b.dataset.d;pickT=null;calDraw();slotDraw();ready1()}});
}
function slotDraw(){
  var box=$("slots"),note=$("slotnote");box.innerHTML="";note.textContent="";
  if(!curLook()){note.textContent="Choose a look to see available dates.";return}
  if(!pickD){note.textContent="Choose a date to see times.";return}
  var list=slotsFor(pickD);
  if(!list.length){note.textContent="No times left on this day. Please choose another date.";return}
  list.forEach(function(s){
    var b=document.createElement("button");b.type="button";b.className="slot";b.textContent=lbl(s);
    b.setAttribute("aria-pressed",s===pickT);
    b.onclick=function(){pickT=s;slotDraw();ready1()};box.appendChild(b)});
}
function ready1(){$("to2").disabled=!(curLook()&&pickD&&pickT!==null)}
function onLook(){
  var l=curLook();pickT=null;
  $("bkname").textContent=l?l.n:"Choose a look";
  $("bkmeta").textContent=l?fmt(l.p)+" · about "+dur(l.m)+" (plus a short buffer)":"Pick a look below to begin.";
  if(pickD&&!slotsFor(pickD).length)pickD="";
  calDraw();slotDraw();ready1();
}
sel.onchange=onLook;
fetch("data/availability.json").then(function(r){return r.ok?r.json():{}}).then(function(o){for(var k in o)AV[k]=o[k];onLook()}).catch(function(){});
function go(n,quiet){
  ["p1","p2","p3"].forEach(function(id,i){$(id).hidden=i!==n-1});
  document.querySelectorAll("#steps li").forEach(function(li,i){li.className=i===n-1?"on":""});
  $("done").style.display="none";if(!quiet)$("book").scrollIntoView();
}
$("to2").onclick=function(){go(2)};
$("back1").onclick=function(){go(1)};
$("back2").onclick=function(){go(2)};
function rows(o,list){return list.map(function(r){return "<div><span>"+r[0]+"</span><b>"+r[1]+"</b></div>"}).join("")}
function summary(){
  var l=curLook(),dt=new Date(pickD+"T00:00:00");
  return [["Look",l.n],["Date",dt.toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long",year:"numeric"})],
    ["Time",lbl(pickT)+" (about "+dur(l.m)+")"],["Name",info.name],["Phone",info.phone],["Email",info.email],["Occasion",info.occ]]
    .concat(info.notes?[["Notes",info.notes]]:[]);
}
$("p2").onsubmit=function(e){
  e.preventDefault();
  info={name:$("name").value,phone:$("phone").value,email:$("email").value,occ:$("occ").value,notes:$("notes").value};
  var l=curLook();
  $("sum").innerHTML=rows(0,summary().concat([["Total price",fmt(l.p)],["Deposit due now",fmt(CONFIG.deposit)],["Balance on the day",fmt(Math.max(l.p-CONFIG.deposit,0))]]));
  $("pay").textContent="Pay "+fmt(CONFIG.deposit)+" deposit";$("payerr").textContent="";
  $("demo").innerHTML=CONFIG.paystackKey?"Secure payment by Paystack. Your booking is only confirmed after the deposit is paid.":'Demo mode: no real payment is taken. <button type="button" id="failbtn" class="btn btn-text btn-sm" style="padding:0 4px">Simulate a failed payment</button>';
  if($("failbtn"))$("failbtn").onclick=function(){fail("Payment wasn’t completed, so no booking was made and no time was reserved.")};
  go(3);
};
function fail(msg){$("payerr").textContent=msg}
function finish(ref){
  /* Server version: confirm here only after your server verifies the Paystack payment. */
  if(slotsFor(pickD).indexOf(pickT)<0){fail("Sorry, that time was just taken. Your payment was not used for a booking. Please choose another time.");go(1);slotDraw();calDraw();return}
  var l=curLook();B.push({date:pickD,start:pickT,end:pickT+l.m+AV.buffer,ref:ref});saveB();
  ["p1","p2","p3"].forEach(function(id){$(id).hidden=true});
  $("who").textContent=info.name.split(" ")[0];
  $("donesum").innerHTML=rows(0,summary().concat([["Deposit paid",fmt(CONFIG.deposit)],["Reference",ref]]));
  $("donenote").textContent=CONFIG.paystackKey?"A confirmation will be sent to "+info.email+".":"Demo mode: no payment was taken and no email was sent.";
  $("done").style.display="block";$("done").scrollIntoView();calDraw();slotDraw();
}
$("pay").onclick=function(){
  $("payerr").textContent="";
  if(slotsFor(pickD).indexOf(pickT)<0){fail("Sorry, that time was just taken. Please choose another.");go(1);slotDraw();return}
  var ref="BK"+Date.now().toString(36).toUpperCase();
  if(CONFIG.paystackKey&&window.PaystackPop){
    PaystackPop.setup({key:CONFIG.paystackKey,email:info.email,amount:CONFIG.deposit*100,currency:"NGN",ref:ref,
      metadata:{look:curLook().n,date:pickD,start:lbl(pickT),name:info.name,phone:info.phone},
      callback:function(){finish(ref)},
      onClose:function(){fail("Payment wasn’t completed, so no booking was made and no time was reserved.")}}).openIframe();
  }else finish(ref); /* demo mode */
};
onLook();go(1,true);

/* AI Beauty Assistant. analyse() below gives sample results in this preview.
   To go live, replace it with a call to your backend (a small server that sends the photos to an AI vision
   model and returns the same shape of result). */
var G={front:'<ellipse cx="40" cy="46" rx="22" ry="30"/><path d="M30 42h6M44 42h6M40 50v8M34 68q6 4 12 0"/>',
 left:'<path d="M52 16C34 16 30 34 32 48L24 58l8 3c0 14 8 22 20 20 12-3 14-36 0-65z"/><path d="M40 40h5"/>',
 right:'<g transform="translate(80 0) scale(-1 1)"><path d="M52 16C34 16 30 34 32 48L24 58l8 3c0 14 8 22 20 20 12-3 14-36 0-65z"/><path d="M40 40h5"/></g>'};
var SL=[["front","Front-facing","Look straight at the camera"],["left","Left profile","Turn so your left side faces the camera"],["right","Right profile","Turn so your right side faces the camera"]];
var files={front:null,left:null,right:null},urls={};
var box=$("slots3");
SL.forEach(function(s){
  var k=s[0],t=document.createElement("div");t.className="tile3";
  t.innerHTML='<b>'+s[1]+(k==="front"?"":" (optional)")+'</b><div class="pv3" id="pv-'+k+'"></div><p class="note">'+s[2]+'</p><input class="sr" type="file" accept="image/*" id="f-'+k+'"><label class="btn btn-quiet btn-sm" for="f-'+k+'" id="lb-'+k+'">Add photo</label><button type="button" class="btn btn-text btn-sm" id="rm-'+k+'" hidden>Remove</button>';
  box.appendChild(t);
  $("f-"+k).onchange=function(){if(this.files[0]){files[k]=this.files[0];paint(k)}};
  $("rm-"+k).onclick=function(){files[k]=null;$("f-"+k).value="";paint(k)};
  paint(k);
});
function paint(k){
  var p=$("pv-"+k),f=files[k];
  if(urls[k]){URL.revokeObjectURL(urls[k]);urls[k]=null}
  if(f){urls[k]=URL.createObjectURL(f);p.innerHTML='<img src="'+urls[k]+'" alt="Your '+k+' photo">'}
  else p.innerHTML='<svg viewBox="0 0 80 100" aria-hidden="true">'+G[k]+'</svg>';
  $("lb-"+k).textContent=f?"Replace":"Add photo";$("rm-"+k).hidden=!f;
  $("analyse").disabled=!(files.front&&$("consent").checked);
}
$("consent").onchange=function(){$("analyse").disabled=!(files.front&&this.checked)};

var FEATS=[
 ["shape","Face shape",["Oval","Round","Heart","Square","Diamond","Long"]],
 ["eyes","Eye shape",["Almond","Round","Hooded","Upturned","Downturned","Monolid"]],
 ["lips","Lip shape",["Balanced","Full","Fuller lower lip","Thinner upper lip","Wide","Petite"]],
 ["jaw","Jawline",["Soft","Defined","Angular","Rounded"]],
 ["cheeks","Cheekbones",["High","Soft","Subtle","Wide-set"]],
 ["prop","Facial proportions",["Balanced","Longer face","Wider face","Fuller forehead","Wider jaw"]],
 ["skin","How your skin feels",["Not sure","Dry","Normal","Oily","Combination","Sensitive"]]];
var TIP_SHAPE={Oval:"Your proportions are naturally balanced, so a soft contour keeps things fresh.",Round:"Soft contour along the cheekbones adds gentle definition.",Heart:"Blend blush toward the temples and keep the chin area soft.",Square:"A rosy blush on the apples of the cheeks softens the jawline.",Diamond:"Highlight the cheekbones and add a little softness at the forehead.",Long:"Blush placed more horizontally adds balance."};
var TIP_EYE={Almond:"Almond eyes suit almost any eye look, so you can play with colour.",Round:"Extend liner and shadow slightly outward to elongate.",Hooded:"Keep shadow just above the crease so it stays visible when your eyes are open.",Upturned:"Soft winged liner follows your natural lift.",Downturned:"Lift the outer corner with shadow angled upward.",Monolid:"Gradient shadow from the lash line adds depth."};
var res={},seed=0,recs=[];
function analyse(){ /* sample result: swap for a real AI call */
  var n=0;Object.keys(files).forEach(function(k){if(files[k])n+=files[k].size});seed=n;
  var side=!!(files.left||files.right),o={};
  FEATS.forEach(function(f,i){
    var unsure=(f[0]==="jaw"||f[0]==="cheeks")&&!side;
    o[f[0]]={v:f[0]==="skin"?"Not sure":f[2][(seed+i*3)%f[2].length],
      note:f[0]==="skin"?"Lighting and cameras make skin hard to judge from a photo. You know it best, so tell me how it feels.":
        unsure?"I’m not very sure about this one. A side profile would help.":"Fairly sure, though lighting and angles can affect this.",unsure:unsure||f[0]==="skin",edited:false};
  });
  return o;
}
function showResults(){
  var f=$("feat");f.innerHTML="";
  FEATS.forEach(function(x){
    var r=res[x[0]],row=document.createElement("div");row.className="frow";
    var opts=x[2].map(function(v){return '<option'+(v===r.v?" selected":"")+'>'+v+'</option>'}).join("");
    row.innerHTML='<div><b>'+x[1]+'</b><span class="conf'+(r.unsure?" unsure":"")+'" id="c-'+x[0]+'">'+r.note+'</span></div><select aria-label="'+x[1]+'">'+opts+'</select>';
    row.querySelector("select").onchange=function(){
      r.v=this.value;r.edited=true;r.unsure=false;
      $("c-"+x[0]).textContent="Updated by you. Thank you!";$("c-"+x[0]).className="conf";drawRecs()};
    f.appendChild(row);
  });
  drawRecs();
}
var WHY={"Soft Glam":"Soft, diffused tones balance your {s} face shape and keep your {e} eyes as the focus.","Full Glam":"Defined, sculpted makeup brings out your {s} face shape and makes your {e} eyes stand out.","Bridal":"A luminous, long-wear finish complements your {s} face shape and photographs beautifully.","Birthday":"A radiant, celebratory finish that flatters your {s} face shape and {e} eyes.","Natural":"Skin-first makeup lets your {s} face shape and {e} eyes shine without covering your features.","Traditional":"Rich, elegant colour suits your {s} face shape and frames your {e} eyes.","Editorial":"Creative colour and shape make the most of your {s} face shape and {e} eyes."};
function drawRecs(){
  var t=[];
  if(TIP_SHAPE[res.shape.v])t.push(TIP_SHAPE[res.shape.v]);
  if(TIP_EYE[res.eyes.v])t.push(TIP_EYE[res.eyes.v]);
  t.push("Pick products to match how your skin feels. Your makeup artist will adjust on the day.");
  $("tipl").innerHTML=t.map(function(x){return "<li>"+x+"</li>"}).join("");
  /* Only looks from your own LOOKS list are ever recommended */
  var order=["Soft Glam","Natural","Full Glam","Birthday","Traditional","Bridal","Editorial"],r=seed%order.length;
  order=order.slice(r).concat(order.slice(0,r));
  var picks=[];
  order.forEach(function(c){if(picks.length<4){var m=LOOKS.filter(function(l){return l.c===c});if(m.length)picks.push(m[seed%m.length])}});
  var g=$("recs");g.innerHTML="";
  picks.forEach(function(l){
    var a=document.createElement("article");a.className="card rec";
    a.innerHTML='<div class="photo" data-ph="Add photo"><img src="'+img(l.s)+'" alt="'+l.n+' makeup look" onerror="this.remove()"></div><h3>'+l.n+'</h3><p class="muted">'+l.d+'</p><p class="why"><b>Why this look:</b> '+WHY[l.c].replace("{s}",res.shape.v.toLowerCase()).replace("{e}",res.eyes.v.toLowerCase())+'</p><div class="meta">'+fmt(l.p)+' · about '+dur(l.m)+'</div><button class="btn btn-primary btn-sm" type="button">Select This Look</button>';
    a.querySelector("button").onclick=function(){pickStyle(l.n)};g.appendChild(a);
  });
}
var LINES=["Looking at your face shape…","Noticing your eye shape…","Finding what suits your cheekbones…","Choosing looks you’ll love…"];
$("analyse").onclick=function(){
  $("aimsg").textContent="";$("ai-upload").hidden=true;$("ai-loading").hidden=false;
  var i=0,st=$("status");st.textContent=LINES[0];
  var iv=setInterval(function(){i=(i+1)%LINES.length;st.textContent=LINES[i]},1100);
  setTimeout(function(){
    clearInterval(iv);res=analyse();
    if(!$("keep").checked)clearPhotos(); /* default: photos are not kept */
    $("ai-loading").hidden=true;$("ai-results").hidden=false;showResults();$("assistant").scrollIntoView();
  },4200);
};
function clearPhotos(){Object.keys(files).forEach(function(k){files[k]=null;$("f-"+k).value="";paint(k)})}
function reset(msg){clearPhotos();$("ai-results").hidden=true;$("ai-upload").hidden=false;$("aimsg").textContent=msg||"";$("assistant").scrollIntoView()}
$("redo").onclick=function(){reset("")};
$("wipe").onclick=function(){reset("Your photos have been deleted. If you chose to keep them, email us and we’ll remove any saved copy too.")};

/* Mobile menu: open/close with the button, a link tap, or Escape */
var burger=document.querySelector(".burger"),menu=$("menu");
function setMenu(open){menu.classList.toggle("open",open);burger.setAttribute("aria-expanded",open);burger.setAttribute("aria-label",open?"Close menu":"Open menu")}
burger.addEventListener("click",function(){setMenu(!menu.classList.contains("open"))});
menu.querySelectorAll("a").forEach(function(a){a.addEventListener("click",function(){setMenu(false)})});
document.addEventListener("keydown",function(e){if(e.key==="Escape")setMenu(false)});
