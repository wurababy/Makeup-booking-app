/* ====== SETTINGS: edit these ====== */
var CONFIG={deposit:15000,currency:"₦",
  // Add your Paystack public key (starts with pk_) to take real payments. Leave blank for demo mode.
  paystackKey:"",
  times:["9:00 am","11:00 am","1:00 pm","3:00 pm","5:00 pm"]};
var $=function(i){return document.getElementById(i)};
var fmt=function(n){return CONFIG.currency+n.toLocaleString("en-NG")};
var chosen={style:"",time:""};

/* Makeup looks: edit names, descriptions, prices. Photos go in images/ as <slug>.jpg */
var LOOKS=[
 ["Soft Glam","soft-glam",45000,"Polished, luminous makeup for parties and photoshoots."],
 ["Full Glam","full-glam",55000,"Bold, sculpted and camera-ready for your biggest nights."],
 ["Bridal Glam","bridal-glam",120000,"A long-wear, romantic finish. Trial included."],
 ["Birthday Glam","birthday-glam",50000,"Radiant and celebratory, made to be photographed."],
 ["Natural Glam","natural-glam",30000,"Fresh, skin-first makeup that looks effortlessly like you."],
 ["Traditional Glam","traditional-glam",70000,"Rich, elegant makeup for weddings and cultural celebrations."]];
var grid=$("looks-grid"),sel=$("style");
sel.innerHTML='<option value="">Choose a look</option>';
LOOKS.forEach(function(l){
  var a=document.createElement("article");a.className="card look";
  a.innerHTML='<div class="photo" data-ph="Add photo"><img src="images/'+l[1]+'.jpg" alt="'+l[0]+' makeup look" onerror="this.remove()"></div><h3>'+l[0]+'</h3><p class="note">From '+fmt(l[2])+'</p><button class="btn btn-quiet" type="button">View Look</button>';
  a.querySelector("button").onclick=function(){openLook(l)};grid.appendChild(a);
  sel.add(new Option(l[0],l[0]));
});
var dlg=$("lookdlg"),cur="";
function openLook(l){
  cur=l[0];$("lname").textContent=l[0];$("ldesc").textContent=l[3];$("lprice").textContent="From "+fmt(l[2]);
  var i=$("limg");i.style.display="";i.onerror=function(){i.style.display="none"};i.src="images/"+l[1]+".jpg";dlg.showModal();
}
$("lclose").onclick=function(){dlg.close()};
dlg.addEventListener("click",function(e){if(e.target===dlg)dlg.close()});
$("lbook").onclick=function(){dlg.close();pickStyle(cur)};
function pickStyle(n){sel.value=n;$("book").scrollIntoView()}
$("start").onclick=function(){$("photo").scrollIntoView({block:"center"});$("photo").focus()};

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

/* AI Beauty Assistant: photo stays in the browser. Demo picks a look; connect a real AI service later. */
var photo=$("photo"),ok=$("consent"),go=$("analyse");
function ready(){go.disabled=!(photo.files.length&&ok.checked)}
photo.addEventListener("change",function(){
  var f=photo.files[0];if(!f)return;
  var p=$("pv");p.src=URL.createObjectURL(f);p.style.display="block";ready();
});
ok.addEventListener("change",ready);
var tips=[
 ["Soft Glam","Warm peach blush, a champagne eye and a defined lip will bring out your natural glow."],
 ["Natural Glam","Skin-first makeup with a rosy cheek and brushed brows will keep things fresh and effortless."],
 ["Bridal Glam","A luminous base with soft rose tones and lifted lashes will photograph beautifully."]];
go.addEventListener("click",function(){
  var f=photo.files[0],r=tips[f.size%3];
  $("rname").textContent=r[0];$("rtext").textContent=r[1];
  $("result").style.display="block";
  $("rbook").onclick=function(){pickStyle(r[0])};
});

/* Mobile menu: open/close with the button, a link tap, or Escape */
var burger=document.querySelector(".burger"),menu=$("menu");
function setMenu(open){menu.classList.toggle("open",open);burger.setAttribute("aria-expanded",open);burger.setAttribute("aria-label",open?"Close menu":"Open menu")}
burger.addEventListener("click",function(){setMenu(!menu.classList.contains("open"))});
menu.querySelectorAll("a").forEach(function(a){a.addEventListener("click",function(){setMenu(false)})});
document.addEventListener("keydown",function(e){if(e.key==="Escape")setMenu(false)});
