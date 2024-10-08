// Aqui tenemos el socket cliente que interactua con el socket servidor. 
// Vamos a interacuar con socket.on y socket.emit para enviar a  y recibir del servidor

const socket = io();

console.log("Defini socket = io()");

socket.emit("message", "Hola me estoy comunicando desde un websocket!");

const form = document.getElementById("formulario");
const tableBody = document.getElementById("table-body");

function getProducts() {
  
    socket.emit("getProducts", (products) => {
    emptyTable();
    showProducts(products);
  });
}

function emptyTable() {
  tableBody.innerHTML = "";
}

function showProducts(products) {
  products.forEach((product) => {
    const row = createTableRow(product);
    tableBody.appendChild(row);
  });
}

socket.on("products", (data) => {
  console.log("Lista de productos recibida del servidor:", data);
  emptyTable();
  showProducts(data);
});

function createTableRow(product) {
  
  // Funcion que crea la tabla con las lineas de cada producto
  // agregado codigo
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${product.id}</td>
    <td class="text-nowrap">${product.nombre}</td>
    <td>${product.recetadesc}</td>
    <td class="text-nowrap">$ ${product.precio}</td>
    <td>${product.categoria}</td>
    <td>${product.maxprod}</td>
    <td>${product.codigo}</td> 
    <td>${product.status}</td>
    <td><img src="${product.img}" alt="Thumbnail" class="thumbnail" style="width: 75px;"></td>
    <td><button class="btn btn-effect btn-dark btn-jif bg-black" onClick="deleteProduct('${product.id}')">Eliminar</button></td>
  `;
  return row;
}

function deleteProduct(productId) {
  const id = parseInt(productId);
  console.log("ID del producto a eliminar en deletePoduct:", id);
  emptyTable();
  
  // hace el emit para el socket.on en sockets.js
  
  socket.emit("delete", id);
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const precio = parseFloat(document.getElementById("price").value);
  const stock = parseInt(document.getElementById("stock").value);
  const porciones = parseInt(document.getElementById("porciones").value);
  const fileInput = document.getElementById("thumbnails");
  const file = fileInput.files[0];

  const formData = new FormData();
  formData.append("nombre", document.getElementById("title").value);
  formData.append("porciones", porciones); // porciones
  formData.append("recetadesc", document.getElementById("description").value);
  formData.append("thumbnails", file);
  //formData.append("thumbnails", "sin img");
  formData.append("stock", stock); // produccion maxima
  formData.append("price", precio);
  formData.append("categoria", document.getElementById("category").value);
  formData.append("codigo", document.getElementById("code").value);
  //formData.append("status", document.getElementById("status").value); Al dar de alta por defecto es T
  formData.append("status", "T");
  
  
  
  try {
    console.log("Estoy en el try del add", formData);
    
    // Aqui da un error cuando se hace el response con POST y Body como parametro.
    // Si saco el throw new error se hace el socket.emit pero con datos indefinidos.
    // En la lista actualizada de productos en el cliente se muestran los atributos como undefined.
    // En el json se da de alta un registro con ID asignado correctamente y el mensaje de error.
    // Si hago el POST por Postman el alta se hace correctamente.

    // Envio response como en Postman 
    //const response = await fetch("/", { DA ERROR 404
    const response = await fetch("/api/products", {
    
      method: "POST",
      body: formData,
    });
    //console.log("contenido de formdata:", formData);
    if (!response.ok) {
      throw new Error("Error al agregar el producto con response y POST en el servidor");
    };
    
    // Si no error en response lo envio por socket
    const newProduct = await response.json();
    
    console.log("resultado de newProduct:", newProduct);
    
    socket.emit("add", newProduct);
    const cancelButtonContainer = document.getElementById(
      "cancelButtonContainer"
    );
    cancelButtonContainer.style.display = "none";
  } catch (error) {
    console.error("Error al agregar el producto:", error);
  }

  form.reset();
  imagePreview.innerHTML = "";
});

function previewImage() {
  const fileInput = document.getElementById("thumbnails");
  const imagePreview = document.getElementById("imagePreview");
  const cancelButtonContainer = document.getElementById(
    "cancelButtonContainer"
  );

  if (fileInput.files && fileInput.files[0]) {
    const reader = new FileReader();

    reader.onload = function (event) {
      const image = document.createElement("img");
      image.src = event.target.result;
      image.style.maxWidth = "200px";
      image.style.maxHeight = "200px";

      imagePreview.innerHTML = "";
      imagePreview.appendChild(image);
      cancelButtonContainer.innerHTML = `<button class="btn btn-danger" style="padding: 0.2rem 0.4rem;border-radius: 50%;margin: 0.4rem;font-size: 1.5em;" onclick="cancelImageSelection()"><i class="fa fa-close" id="btnCerrar" aria-hidden="true"></i></button>`;
    };
    reader.readAsDataURL(fileInput.files[0]);
    showCancelButton();
  } else {
    imagePreview.innerHTML = "";
    cancelButtonContainer.innerHTML = "";
    hideCancelButton();
  }
}
function cancelImageSelection() {
  const fileInput = document.getElementById("thumbnails");
  fileInput.value = "";
  const imagePreview = document.getElementById("imagePreview");
  imagePreview.innerHTML = "";
  cancelButtonContainer.innerHTML = "";
}

function hideCancelButton() {
  const cancelButtonContainer = document.getElementById(
    "cancelButtonContainer"
  );
  cancelButtonContainer.style.display = "none";
}

function showCancelButton() {
  const cancelButtonContainer = document.getElementById(
    "cancelButtonContainer"
  );
  cancelButtonContainer.style.display = "block";
}
