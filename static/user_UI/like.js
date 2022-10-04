// ----------------like button---------------
var btnvar = document.getElementsByClassName('btn');
for (var i = 0; i < btnvar.length; i++) {
  let btn = btnvar[i];
  btn.addEventListener("click", function () {
    if (btn.style.color == "red") {
      btn.style.color = "white"
    }
    else {
      btn.style.color = "red"
    }
  });
}