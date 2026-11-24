/* ====== SETTINGS: edit these ====== */
var CONFIG={deposit:15000,currency:"₦",
  // Add your Paystack public key (starts with pk_) to take real payments. Leave blank for demo mode.
  paystackKey:"",
  times:["9:00 am","11:00 am","1:00 pm","3:00 pm","5:00 pm"]};
var $=function(i){return document.getElementById(i)};
var fmt=function(n){return CONFIG.currency+n.toLocaleString("en-NG")};
var chosen={style:"",time:""};

/* Styles: tapping a card selects it for booking */
document.querySelectorAll(".style").forEach(function(c){c.addEventListener("click",function(){pickStyle(c.dataset.name)})});
function pickStyle(n){
  chosen.style=n;$("style").value=n;
  document.querySelectorAll(".style").forEach(function(c){c.setAttribute("aria-pressed",c.dataset.name===n)});
  $("book").scrollIntoView();
}

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
 ["Natural Beauty","Skin-first makeup with a rosy cheek and brushed brows will keep things fresh and effortless."],
 ["Bridal Glow","A luminous base with soft rose tones and lifted lashes will photograph beautifully."]];
go.addEventListener("click",function(){
  var f=photo.files[0],r=tips[f.size%3];
  $("rname").textContent=r[0];$("rtext").textContent=r[1];
  $("result").style.display="block";
  $("rbook").onclick=function(){pickStyle(r[0])};
});
