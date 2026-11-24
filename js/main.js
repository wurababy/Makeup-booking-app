/* ====== SETTINGS: edit these ====== */
var CONFIG={deposit:15000,currency:"₦",
  // Add your Paystack public key (starts with pk_) to take real payments. Leave blank for demo mode.
  paystackKey:"",
  times:["9:00 am","11:00 am","1:00 pm","3:00 pm","5:00 pm"]};
var $=function(i){return document.getElementById(i)};
var fmt=function(n){return CONFIG.currency+n.toLocaleString("en-NG")};
var chosen={style:"",time:""};

/* Makeup looks: edit names, categories, prices, descriptions. Photos go in images/ as <slug>.jpg */
var CATS=["All Looks","Soft Glam","Full Glam","Bridal","Birthday","Natural","Traditional","Editorial"];
var LOOKS=[
 {n:"Soft Glam",c:"Soft Glam",s:"soft-glam",p:45000,d:"Polished, luminous makeup for parties and photoshoots."},
 {n:"Rosy Soft Glam",c:"Soft Glam",s:"rosy-soft-glam",p:48000,d:"Dewy skin, rosy cheeks and a glossy lip."},
 {n:"Full Glam",c:"Full Glam",s:"full-glam",p:55000,d:"Bold, sculpted and camera-ready for your biggest nights."},
 {n:"Smoky Full Glam",c:"Full Glam",s:"smoky-full-glam",p:60000,d:"Dramatic smoky eyes with flawless, long-wear skin."},
 {n:"Bridal Glam",c:"Bridal",s:"bridal-glam",p:120000,d:"A long-wear, romantic finish. Trial included."},
 {n:"Bridesmaid Glam",c:"Bridal",s:"bridesmaid-glam",p:50000,d:"Soft, coordinated glam for the bridal party."},
 {n:"Birthday Glam",c:"Birthday",s:"birthday-glam",p:50000,d:"Radiant and celebratory, made to be photographed."},
 {n:"Natural Glam",c:"Natural",s:"natural-glam",p:30000,d:"Fresh, skin-first makeup that looks effortlessly like you."},
 {n:"Traditional Glam",c:"Traditional",s:"traditional-glam",p:70000,d:"Rich, elegant makeup for weddings and cultural celebrations."},
 {n:"Editorial Look",c:"Editorial",s:"editorial-look",p:80000,d:"Creative, artistic makeup for shoots and fashion."}];
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
  cur=l.n;$("dcat").textContent=l.c;$("dname").textContent=l.n;$("ddesc").textContent=l.d;$("dprice").textContent=fmt(l.p);
  var i=$("dimg");i.style.display="";i.onerror=function(){i.style.display="none"};i.src=img(l.s);
  $("gallery").hidden=true;$("detail").hidden=false;$("looks").scrollIntoView();
}
$("back").onclick=function(){$("detail").hidden=true;$("gallery").hidden=false;$("looks").scrollIntoView()};
$("dbook").onclick=function(){pickStyle(cur)};
function pickStyle(n){sel.value=n;$("book").scrollIntoView()}
drawChips();drawGrid();

/* Inspiration photo: previews in the browser. Sending it to you needs a backend (see README). */
$("inspo").onchange=function(){
  var f=this.files[0];if(!f)return;
  var p=$("inspoPv");p.src=URL.createObjectURL(f);p.style.display="block";
  $("inspoNote").textContent="Inspiration photo added: "+f.name;
};

/* Booking: date + times (demo availability; connect a calendar later) */
var d=$("date"),t=new Date();t.setDate(t.getDate()+1);d.min=t.toISOString().slice(0,10);
function drawSlots(){
  var box=$("slots");box.innerHTML="";chosen.time="";
  if(!d.value){box.innerHTML='<span class="note">Choose a date to see times.</span>';return}
  var seed=new Date(d.value).getDate();
  CONFIG.times.forEach(function(x,i){
    var b=document.createElement("button");b.type="button";b.className="slot";b.textContent=x;
    b.setAttribute("aria-pressed","false");b.disabled=(seed+i)%4===0;
    b.onclick=function(){chosen.time=x;box.querySelectorAll(".slot").forEach(function(o){o.setAttribute("aria-pressed",o===b)})};
    box.appendChild(b)});
}
d.addEventListener("change",drawSlots);drawSlots();
$("dep").textContent=fmt(CONFIG.deposit);

$("bookform").addEventListener("submit",function(e){
  e.preventDefault();
  var err=$("err");
  if(!$("style").value||!d.value||!chosen.time){err.textContent="Please choose a style, a date and a time.";return}
  err.textContent="";
  var info={name:$("name").value,email:$("email").value,phone:$("phone").value,style:$("style").value,date:d.value,time:chosen.time};
  if(CONFIG.paystackKey&&window.PaystackPop){
    PaystackPop.setup({key:CONFIG.paystackKey,email:info.email,amount:CONFIG.deposit*100,currency:"NGN",
      callback:function(){confirmBooking(info)}}).openIframe();
  }else{confirmBooking(info)} /* demo mode: no real payment */
});
function confirmBooking(i){
  $("bookform").style.display="none";$("done").style.display="block";
  var when=new Date(i.date).toLocaleDateString("en-GB",{weekday:"long",day:"numeric",month:"long"});
  $("summary").textContent=i.style+" · "+when+" at "+i.time;
  $("who").textContent=i.name.split(" ")[0];
  $("done").scrollIntoView();
}

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
function drawRecs(){
  var t=[];
  if(TIP_SHAPE[res.shape.v])t.push(TIP_SHAPE[res.shape.v]);
  if(TIP_EYE[res.eyes.v])t.push(TIP_EYE[res.eyes.v]);
  t.push("Pick products to match how your skin feels. Your makeup artist will adjust on the day.");
  $("tipl").innerHTML=t.map(function(x){return "<li>"+x+"</li>"}).join("");
  var pool=LOOKS.filter(function(l){return l.c!=="Editorial"&&l.c!=="Bridal"});
  recs=[0,3,6].map(function(d){return pool[(seed+d)%pool.length]});
  recs=recs.filter(function(l,i){return recs.indexOf(l)===i});
  var g=$("recs");g.innerHTML="";
  recs.forEach(function(l){
    var a=document.createElement("div");a.className="card";
    a.innerHTML='<h3>'+l.n+'</h3><p class="muted" style="margin:.3rem 0">A lovely match for your '+res.shape.v.toLowerCase()+' face shape and '+res.eyes.v.toLowerCase()+' eyes.</p><div class="price" style="font-size:1.4rem">'+fmt(l.p)+'</div><button class="btn btn-primary btn-sm" type="button" style="margin-top:10px">View This Look</button>';
    a.querySelector("button").onclick=function(){openLook(l)};g.appendChild(a);
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
