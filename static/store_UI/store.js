function changeQuantity(product_id, field) {
  var xhr = new XMLHttpRequest();
  var url = `/store/updateQuantity/?product_id=${product_id}&newQuantity=${field.value}`;
  xhr.open("GET", url, (async = true));
  document.getElementById("Quantity").setAttribute("disabled", "true");
  xhr.onreadystatechange = function () {
    if (this.readyState == 4 && this.status == 200) {
      document.location.reload();
    }
  };
  xhr.send();
}
function changeMrpMinValue(field) {
  document.getElementById("mrp").setAttribute("min", field.value);
}
