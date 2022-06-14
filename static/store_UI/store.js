function changeQuantity(product_id, field) {
    var xhr = new XMLHttpRequest();
    var url = `/store/updateProduct/?product_id=${product_id}&newQuantity=${field.value}`;
    xhr.open("GET", url);
    xhr.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            console.log(this.responseText);
        }
        document.location.reload();
    }
    xhr.send();
}