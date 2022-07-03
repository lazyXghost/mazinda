
const productContainer = document.querySelector("[data-product-container]");
const productBox = document.querySelectorAll("[data-product-box]");
const searchInput = document.querySelector("[data-search]");
const searchValue = document.querySelector("[data-search]");
console.log(searchValue.value);
const searchButton = document.querySelector(".searchButton");

const filterFunction = function (e) {
    const value = (e?.target?.value || e?.target?.value=="") ? e.target.value.toLowerCase():e.toLowerCase();
    console.log("filter function works");
  console.log(value);
  productBox.forEach((product) => {
    const name = product.querySelector(".productName").innerHTML.toLowerCase();
    console.log(product.querySelector(".productDescription"));
    const description = product
      .querySelector(".productDescription")
      .innerHTML.toLowerCase();
    console.log(name);
    if (name.includes(value) || description.includes(value))
      product.classList.remove("hide");
    else product.classList.add("hide");
  });
};

filterFunction(searchValue.value);
// searchValue.addEventListener("onload",filterFunction);
searchInput.addEventListener("input", filterFunction);

// searchInput.addEventListener("input", (e) => {
//   const value = e.target.value.toLowerCase();
//   console.log(value);
//   productBox.forEach((product) => {
//     const name = product.querySelector(".productName").innerHTML.toLowerCase();
//     const description = product
//       .querySelector(".productDescription")
//       .innerHTML.toLowerCase();
//     console.log(name);
//     if (name.includes(value) || description.includes(value))
//       product.classList.remove("hide");
//     else product.classList.add("hide");
//   });
// });
console.log("this script was called as well.");