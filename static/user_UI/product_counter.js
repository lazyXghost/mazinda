// -----------product-counter----------------
var plus = document.getElementsByClassName('plus'),
minus = document.getElementsByClassName("minus"),
num = document.getElementsByClassName("num");
for (var i = 0; i < plus.length; i++) {
var button = plus[i];
button.addEventListener("click", (event) => {
  var buttonClicked = event.target;
  var input = buttonClicked.parentElement.children[1];
  var inputValue = input.value;
  var newValue = parseInt(inputValue) + 1;
  input.value = newValue;
});
}


for (var i = 0; i < minus.length; i++) {
var button = minus[i];
button.addEventListener("click", (event) => {
  var buttonClicked = event.target;
  var input = buttonClicked.parentElement.children[1];
  var inputValue = input.value;
  var newValue = parseInt(inputValue) - 1;
  if (newValue >= 0) {
    input.value = newValue;
  }
  else {
    input.value = 0;
  }
});
}