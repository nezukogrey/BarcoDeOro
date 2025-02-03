let cart = [];  // This array will hold cart item objects

// Mapping section IDs to readable names
const sectionNameMap = {
    "cakepops": "Cake Pops",
    "cakes": "Cake",
    "heartcakes": "Heart Cakes",
    "cupcakes": "Cupcakes",
    "bentobox": "Bento Box"
};

// Function to toggle the display of the cart
function toggleCartDisplay() {
    const cartElement = document.getElementById('cart');
    cartElement.style.display = cartElement.style.display === 'none' ? 'block' : 'none';
    renderCartItems();  // Update the cart display whenever it is toggled
}

// Function to add items to the cart from a specific section
function addToCartFromSection(sectionId) {
    const section = document.getElementById(sectionId);
    const sizeSelect = section.querySelector('.size-select'); // Only exists for cakes
    const flavorSelect = section.querySelector('.flavor-select'); // Exists for cakes & cake pops
    const toppingChecks = section.querySelectorAll('.topping-select input[type="checkbox"]:checked');
    const quantityInput = section.querySelector('input[type="number"]'); // For Cake Pops

    let price = 0;
    //let name = "Unknown Item";
    let name = sectionNameMap[sectionId] || "Unknown Item"; // Get name from section ID
    let quantity = quantityInput ? parseInt(quantityInput.value) || 1 : 1; // Get quantity from input


    if (flavorSelect) {
        name = `${flavorSelect.options[flavorSelect.selectedIndex].text} ${name}`;
    }

    // Check if this section is for Cake Pops
    if (sectionId === "cakepops") {
        price = 2.00; // Fixed price per Cake Pop
    } else if (sizeSelect) {
        // Standard cakes logic
        price = parseFloat(sizeSelect.options[sizeSelect.selectedIndex]?.getAttribute('data-price')) || 0;
    } else {
        console.error("No valid pricing information found for section:", sectionId);
        return;
    }

    const toppings = Array.from(toppingChecks).map(input => input.value).join(', ');

    const item = {
        id: cart.length + 1,
        name: name,
        size: sizeSelect ? sizeSelect.value : "N/A", // Only relevant for cakes
        toppings: toppings,
        price: price,
        quantity: quantity
    };

    console.log("Adding item to cart:", item);
    cart.push(item);
    localStorage.setItem('cart', JSON.stringify(cart));
    renderCartItems();
}


// Function to render cart items in the UI
function renderCartItems() {
    const cartItems = document.getElementById('cartItems');
    cartItems.innerHTML = '';  // Clear existing items
    let total = 0;

    cart.forEach(item => {
        const itemNode = document.createElement('li');
        itemNode.textContent = `${item.quantity}x ${item.name} - ${item.toppings ? item.toppings : "No toppings"} - $${(item.price * item.quantity).toFixed(2)}`;

        const deleteButton = document.createElement('button');
        deleteButton.innerHTML = '<i class="fas fa-trash"></i>';  // Using Font Awesome icon
        deleteButton.onclick = function() { removeFromCart(item.id); };
        deleteButton.className = 'delete-button';  // Optional: Assign a class for styling
        itemNode.appendChild(deleteButton);

        cartItems.appendChild(itemNode);
        total += item.price * item.quantity;
    });

    // Update total price
    const totalPrice = document.getElementById('totalPrice');
    totalPrice.textContent = `Estimated Total: $${total.toFixed(2)}`;
}

// Function to remove item from cart
function removeFromCart(itemId) {
    const index = cart.findIndex(item => item.id === itemId);
    if (index > -1) {
        cart.splice(index, 1);  // Remove the item from the array
        renderCartItems();  // Re-render the cart items
    }
}

// Display order summary on the checkout page
function displayOrderSummary() {
    const orderSummaryDiv = document.getElementById('orderSummary');
    if (!orderSummaryDiv) return;

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    console.log("Cart retrieved for checkout:", cart);

    // Clear previous contents before adding new items
    orderSummaryDiv.innerHTML = '';

    if (cart.length === 0) {
        orderSummaryDiv.innerHTML = '<p>Your cart is empty.</p>';
        return;
    }

    let total = 0;

    cart.forEach(item => {
        const itemName = item.name || "Unnamed Item";
        const itemPrice = !isNaN(item.price) ? item.price : 0;
        const itemQuantity = !isNaN(item.quantity) ? item.quantity : 1;

        const itemElement = document.createElement('div');
        itemElement.textContent = `${itemQuantity}x ${itemName} - ${item.toppings ? item.toppings : "No toppings"} - $${(itemPrice * itemQuantity).toFixed(2)}`;
        orderSummaryDiv.appendChild(itemElement);
        total += itemPrice * itemQuantity;
    });

    // Remove previous total element before adding a new one
    let existingTotal = document.getElementById('orderTotal');
    if (existingTotal) {
        existingTotal.remove();
    }

    const totalElement = document.createElement('div');
    totalElement.id = 'orderTotal'; // Give the total div a unique ID
    totalElement.textContent = `Estimated Total:$S${total.toFixed(2)}`;
    orderSummaryDiv.appendChild(totalElement);
}

//For Checkout.html 
async function placeOrder() {
    const name = document.getElementById('name').value;
    const address = document.getElementById('address').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const date = document.getElementById('date').value;
    const orderSummary = document.getElementById('orderSummary')?.innerText || "";
    const orderNotes = document.getElementById('orderDescription')?.value || "";
    const uploadedImageUrl = document.getElementById('uploadedImageUrl')?.value || ""; 

    const orderNumber = 'ORD' + Math.floor(Math.random() * 1000000);
    document.getElementById('orderNumber').textContent = orderNumber;

    const FORMSPREE_URL = "https://formspree.io/f/mdkazybk"; // ✅ Replace with correct Form ID

    const formData = {
        name: name,
        address: address,
        email: email,
        phone: phone,
        date: date,
        orderSummary: orderSummary,
        orderNotes: orderNotes,
        orderNumber: orderNumber,
        imageURL: uploadedImageUrl
    };

    try {
        const response = await fetch(FORMSPREE_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            console.log("✅ Order sent to Formspree successfully!");

            // ✅ Hide all sections except the order confirmation
            document.getElementById('checkoutForm').style.display = 'none';
            document.getElementById('uploadForm').style.display = 'none';
            document.getElementById('orderSummary').style.display = 'none';
            document.getElementById('reviewOrder').style.display = 'none';
            document.getElementById('checkoutSection').style.display = 'none';

            // ✅ Show only the confirmation message
            document.getElementById('orderConfirmation').style.display = 'block';
        } else {
            console.error("❌Failed to send order:", response.statusText);
            alert("There was an error submitting your order. Please try again.");
        }
    } catch (error) {
        console.error("❌ Order submission error:", error);
        alert("There was an error sending your order. Please check your connection and try again.");
    }
}


async function uploadImage() {
    const fileInput = document.getElementById('imageUpload');
    const file = fileInput.files[0];

    if (!file) {
        alert("Please select an image to upload.");
        return;
    }

    const formData = new FormData();
    formData.append("image", file);

    const IMGUR_CLIENT_ID = "dc57a895f590af6"; // 🔹 Replace with your Imgur Client ID
    const IMGUR_UPLOAD_URL = "https://api.imgur.com/3/image";

    try {
        const response = await fetch(IMGUR_UPLOAD_URL, {
            method: "POST",
            headers: {
                "Authorization": `Client-ID ${IMGUR_CLIENT_ID}`
            },
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            console.log("✅ Image uploaded successfully:", result.data.link);
            document.getElementById('uploadedImageUrl').value = result.data.link; // ✅ Store image URL
        } else {
            console.error("❌ Upload failed:", result);
            alert("Image upload failed. Try again.");
        }
    } catch (error) {
        console.error("❌ Upload error:", error);
        alert("Image upload error.");
    }
}


// Event listeners for the DOM
document.addEventListener('DOMContentLoaded', function() {
    displayOrderSummary(); // Only call this on pages with an orderSummary div

    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const sectionId = this.getAttribute('data-section-id');
            addToCartFromSection(sectionId);
        });
    });

    const imageUploadInput = document.getElementById('imageUpload');
    if (imageUploadInput) {
        imageUploadInput.addEventListener('change', function(event) {
            const file = event.target.files[0];
            const validTypes = ['image/jpeg', 'image/png', 'image/gif'];
            if (file && validTypes.includes(file.type)) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const imgElement = document.createElement("img");
                    imgElement.src = e.target.result;
                    imgElement.style.maxWidth = "150px";
                    imgElement.style.maxHeight = "150px";
                    const preview = document.getElementById("preview");
                    preview.innerHTML = '';
                    preview.appendChild(imgElement);
                };
                reader.readAsDataURL(file);
            } else {
                alert('Invalid file type. Please select an image file (JPEG, PNG, or GIF).');
                document.getElementById('imageUpload').value = ''; // Reset the file input
            }
        });
    }
});






