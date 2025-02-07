let cart = [];  // This array will hold cart item objects

// Mapping section IDs to readable names
const sectionNameMap = {
    "cakepops": "Cake Pops",
    "cakes": "Cake",
    "heartcakes": "Heart Cakes",
    "cupcakes": "Cupcakes",
    "bentobox": "Bento Box"
};

function toggleCartDisplay() {
    const cartElement = document.getElementById('cart');

    // ✅ Toggle visibility
    if (cartElement.style.display === 'none' || cartElement.style.display === '') {
        cartElement.style.display = 'block';
        document.addEventListener('click', closeCartOnClickOutside); //  Listen for outside clicks
    } else {
        cartElement.style.display = 'none';
        document.removeEventListener('click', closeCartOnClickOutside); //  Remove event listener
    }
}

function closeCartOnClickOutside(event) {
    const cartElement = document.getElementById('cart');
    const cartButton = document.getElementById('cartButton');

    // ✅ Check if the click is on the delete button
    if (event.target.closest('.delete-button')) {
        return; // Ignore clicks on delete buttons
    }

    // ✅ Check if click is outside the cart and not on the cart button
    if (!cartElement.contains(event.target) && event.target !== cartButton) {
        cartElement.style.display = 'none';
        document.removeEventListener('click', closeCartOnClickOutside);
    }
}


//  Function to load cart items from localStorage
function loadCartFromLocalStorage() {
    const storedCart = JSON.parse(localStorage.getItem('cart')) || [];
    
    if (storedCart.length > 0) {
        cart = storedCart;
        renderCartItems();
    }
}

function addToCartFromSection(sectionId) {
    const section = document.getElementById(sectionId);
    const sizeSelect = section.querySelector('.size-select');
    const flavorSelect = section.querySelector('.flavor-select');
    const toppingChecks = section.querySelectorAll('.topping-select input[type="checkbox"]:checked');
    const quantityInput = section.querySelector('input[type="number"]'); // For quantity-based items

    const toppings = Array.from(toppingChecks).map(input => input.value).join(', ');

    let price = 0;
    let quantity = 1;
    
    // Use sectionNameMap to get the readable name (Cake, Cupcake, etc.)
    let name = sectionNameMap[sectionId] || sectionId.replace(/-/g, ' ');

    //  If a flavor is selected, include it in the item name
    if (flavorSelect) {
        name = `${flavorSelect.options[flavorSelect.selectedIndex].text} ${name}`;
    }

    if (quantityInput) {
        quantity = parseInt(quantityInput.value) || 1;
    }

    if (sizeSelect) {
        price = parseFloat(sizeSelect.options[sizeSelect.selectedIndex]?.getAttribute('data-price')) || 0;
    } else {
        price = 2.00 * quantity; // Example for cake pops
    }

    const item = {
        id: new Date().getTime(), // Unique ID
        name: name, //includes both the flavor and section name
        toppings: toppings,
        price: price,
        quantity: quantity
    };

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.push(item);
    localStorage.setItem('cart', JSON.stringify(cart)); // 

    renderCartItems(); // Refresh cart display
}


function renderCartItems() {
    const cartItems = document.getElementById('cartItems');
    const totalPrice = document.getElementById('totalPrice');

    // ✅ Check if elements exist before updating
    if (!cartItems || !totalPrice) {
        console.error("❌ Error: Cart elements not found on the page.");
        return;
    }
    
    cartItems.innerHTML = ''; 
    let total = 0;

    let cart = JSON.parse(localStorage.getItem('cart')) || []; // Load updated cart from storage

    cart.forEach(item => {
        const itemNode = document.createElement('li');
        itemNode.textContent = `${item.quantity}x ${item.name} - ${item.toppings || "No toppings"} - $${(item.price * item.quantity).toFixed(2)}`;

        // Create a delete button
        const deleteButton = document.createElement('button');
        deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
        deleteButton.onclick = function () { 
            removeFromCart(item.id); 
        };
        deleteButton.className = 'delete-button';
        
        itemNode.appendChild(deleteButton);
        cartItems.appendChild(itemNode);
        
        total += item.price * item.quantity;
    });

    // Update total price
    totalPrice.textContent = `Total: $${total.toFixed(2)}`;
}


function removeFromCart(itemId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    // Filter out the item to be removed
    cart = cart.filter(item => item.id !== itemId);

    // Update localStorage with the new cart
    localStorage.setItem('cart', JSON.stringify(cart));

    // Refresh the cart display
    renderCartItems();
}

document.addEventListener('DOMContentLoaded', function() {
    loadCartFromLocalStorage();
});

function loadCartFromLocalStorage() {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    renderCartItems();
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
    // Get input values
    const name = document.getElementById('name').value.trim();
    const address = document.getElementById('address').value.trim();
    const email = document.getElementById('email').value.trim();
    const phone = document.getElementById('phone').value.trim();
    const dateInput = document.getElementById('date').value;
    const today = new Date().toISOString().split("T")[0];
    const orderSummary = document.getElementById('orderSummary')?.innerText || "";
    const orderNotes = document.getElementById('orderDescription')?.value || "";
    const uploadedImageUrl = document.getElementById('uploadedImageUrl')?.value || ""; 

    // Check for empty fields before submitting
    if (!name || !address || !email || !phone) {
        alert("⚠️ Please fill in all required fields: Name, Address, Email, and Phone.");
        return;  // Stop submission if any required field is empty
    }

    // Validate phone number (must be 10 digits)
    if (!/^\d{10}$/.test(phone)) {
        alert("⚠️ Please enter a valid 10-digit phone number.");
        return;
    }

    // Validate email format
    if (!/^\S+@\S+\.\S+$/.test(email)) {
        alert("⚠️ Please enter a valid email address.");
        return;
    }

    if (dateInput < today) {
        alert("⚠️ You cannot select a past date. Please pick a valid date.");
        return; // Stop submission
    }

    const orderNumber = 'ORD' + Math.floor(Math.random() * 1000000);
    document.getElementById('orderNumber').textContent = orderNumber;

    const FORMSPREE_URL = "https://formspree.io/f/mjkgrljl"; // Replace with your Formspree ID

    const formData = {
        name: name,
        address: address,
        email: email,
        phone: phone,
        date: dateInput,
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
            console.log("Order sent to Formspree successfully!");

            // Hide all sections except the order confirmation
            document.getElementById('checkoutForm').style.display = 'none';
            document.getElementById('uploadForm').style.display = 'none';
            document.getElementById('orderSummary').style.display = 'none';
            document.getElementById('reviewOrder').style.display = 'none';
            document.getElementById('checkoutSection').style.display = 'none';

            // Clear the uploaded image preview
            document.getElementById('preview').innerHTML = '';  // Clears the preview area
            document.getElementById('imageUpload').value = '';  // Clears the file input
            document.getElementById('uploadedImageUrl').value = ''; // Clears stored image URL

            // Show only the confirmation message
            document.getElementById('orderConfirmation').style.display = 'block';
        } else {
            console.error("❌ Failed to send order:", response.statusText);
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
            document.getElementById('uploadedImageUrl').value = result.data.link; // Store image URL
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






