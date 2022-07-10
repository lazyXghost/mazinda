function toggleDD(myDropMenu) {
  document.getElementById(myDropMenu).classList.toggle("invisible");
}
/*Filter dropdown options*/
function filterDD(myDropMenu, myDropMenuSearch) {
  var input, filter, ul, li, a, i;
  input = document.getElementById(myDropMenuSearch);
  filter = input.value.toUpperCase();
  div = document.getElementById(myDropMenu);
  a = div.getElementsByTagName("a");
  for (i = 0; i < a.length; i++) {
    if (a[i].innerHTML.toUpperCase().indexOf(filter) > -1) {
      a[i].style.display = "";
    } else {
      a[i].style.display = "none";
    }
  }
}
// Close the dropdown menu if the user clicks outside of it
window.onclick = function (event) {
  if (
    !event.target.matches(".drop-button") &&
    !event.target.matches(".drop-search")
  ) {
    var dropdowns = document.getElementsByClassName("dropdownlist");
    for (var i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (!openDropdown.classList.contains("invisible")) {
        openDropdown.classList.add("invisible");
      }
    }
  }
};

var isClicked = false;

var showHide = document.getElementById("showHide");
var overlay = document.getElementById("overlay");
var main = document.getElementById("main");

showHide.addEventListener("click", () => {
  isClicked = isClicked ^ 1;
  if (isClicked) {
    overlay.style.transform = "translateX(0px)";
    // main.style.display="none";
  } else {
    overlay.style.transform = "translateX(-300px)";
    // main.style.display="block";
  }
});

function AddToCart(product_id, user_id) {
  var xhr = new XMLHttpRequest();
  var url = `/addToCart/?product_id=${product_id}&user_id=${user_id}`;
  console.log(url);
  xhr.open("GET", url);
  xhr.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      console.log(this.responseText);
      window.location.reload();
    }
  };
  xhr.send();
}

main.addEventListener("click", () => {
  if (isClicked == 1) {
    isClicked = 0;
    overlay.style.transform = "translateX(-300px)";
  }
});
