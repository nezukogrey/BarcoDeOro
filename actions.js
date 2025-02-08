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
    const cartElement = document.getElementById("cart");

    if (!cartElement) {
        console.error("❌ Cart element not found!");
        return;
    }

    cartElement.classList.toggle("show"); // Toggle cart visibility

    // Close cart if clicking outside, but not if clicking inside or on delete button
    document.addEventListener("click", function (event) {
        if (
            !cartElement.contains(event.target) && 
            event.target !== document.getElementById("cartButton") &&
            !event.target.closest('.delete-button') // ✅ Prevents cart from closing when clicking delete
        ) {
            cartElement.classList.remove("show");
        }
    });
}

// ✅ Close cart when clicking the "X" button
document.addEventListener("DOMContentLoaded", function () {
    const closeCartButton = document.getElementById("closeCart");
    if (closeCartButton) {
        closeCartButton.addEventListener("click", function () {
            document.getElementById("cart").classList.remove("show");
        });
    } else {
        console.warn("⚠️ Close Cart button not found!");
    }
});



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

    let name = sectionNameMap[sectionId] || sectionId.replace(/-/g, ' ');

    if (flavorSelect) {
        name = `${flavorSelect.options[flavorSelect.selectedIndex].text} ${name}`;
    }

    if (quantityInput) {
        quantity = parseInt(quantityInput.value) || 1;
    }

    if (sizeSelect) {
        price = parseFloat(sizeSelect.options[sizeSelect.selectedIndex]?.getAttribute('data-price')) || 0;
    } else {
        price = 2.00; // ✅ Store the unit price, NOT multiplied by quantity
    }

    const item = {
        id: new Date().getTime(),
        name: name,
        toppings: toppings,
        price: price,  // ✅ Keep price as UNIT price
        quantity: quantity
    };

    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    cart.push(item);
    localStorage.setItem('cart', JSON.stringify(cart)); 

    renderCartItems(); 
}


function renderCartItems() {
    const cartItemsContainer = document.getElementById('cartItems');
    const totalPriceElement = document.getElementById('totalPrice');

    if (!cartItemsContainer || !totalPriceElement) {
        console.warn("⚠️ Cart elements not found. Skipping renderCartItems().");
        return;
    }

    cartItemsContainer.innerHTML = ''; 
    let total = 0;
    let cart = JSON.parse(localStorage.getItem('cart')) || [];

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = "<p>Your cart is empty.</p>";
    } else {
        cart.forEach(item => {
            let pricePerItem = parseFloat(item.price);  // ✅ Ensure it's a number
            let itemTotalPrice = pricePerItem * item.quantity;

            console.log(`DEBUG: ${item.quantity}x ${item.name}, Price Per Item: $${pricePerItem}, Total: $${itemTotalPrice}`);

            const itemNode = document.createElement('li');
            itemNode.className = 'cart-item';

            const itemText = document.createElement('p');
            itemText.textContent = `${item.quantity}x ${item.name} - ${item.toppings || "No toppings"}`;

            const priceText = document.createElement('p');
            priceText.textContent = `- $${itemTotalPrice.toFixed(2)}`;

            const deleteButton = document.createElement('button');
            deleteButton.innerHTML = '<i class="fas fa-trash"></i> Remove';
            deleteButton.onclick = function () { 
                removeFromCart(item.id); 
            };
            deleteButton.className = 'delete-button';

            itemNode.appendChild(itemText);
            itemNode.appendChild(priceText);
            itemNode.appendChild(deleteButton);
            cartItemsContainer.appendChild(itemNode); 

            total += itemTotalPrice;  // ✅ Ensure correct total calculation
        });
    }

    totalPriceElement.textContent = `Estimated Total: $${total.toFixed(2)}`;
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
    totalElement.textContent = `Estimated Total:$${total.toFixed(2)}`;
    orderSummaryDiv.appendChild(totalElement);
}

//For Checkout.html 
async function placeOrder() {
    console.log("🟢 Starting order submission...");

    // Get input values
    const name = document.getElementById('name')?.value.trim() || "";
    const address = document.getElementById('address')?.value.trim() || "";
    const email = document.getElementById('email')?.value.trim() || "";
    const phone = document.getElementById('phone')?.value.trim() || "";
    const dateInput = document.getElementById('date')?.value || "";
    const orderSummary = document.getElementById('orderSummary')?.innerText || "";
    const orderNotes = document.getElementById('orderDescription')?.value || "";
    const uploadedImageUrls = document.getElementById('uploadedImageUrls')?.value || "";

    console.log("📦 Order Details:");
    console.log("👤 Name:", name);
    console.log("🏠 Address:", address);
    console.log("📧 Email:", email);
    console.log("📞 Phone:", phone);
    console.log("📆 Date:", dateInput);
    console.log("🛍 Order Summary:", orderSummary);
    console.log("📝 Notes:", orderNotes);
    console.log("🖼 Image URLs:", uploadedImageUrls);

    if (!name || !address || !email || !phone || !dateInput) {
        console.error("⚠️ Missing required fields! Order will not be submitted.");
        alert("⚠️ Please fill in all required fields: Name, Address, Email, and Phone.");
        return;
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

    // Ensure the date is not in the past
    const today = new Date().toISOString().split("T")[0];
    if (dateInput < today) {
        alert("⚠️ You cannot select a past date. Please pick a valid date.");
        return;
    }

    // Order Number
    const orderNumber = 'ORD' + Math.floor(Math.random() * 1000000);
    document.getElementById('orderNumber').textContent = orderNumber;

    // Formspree Endpoint
    const FORMSPREE_URL = "https://formspree.io/f/mjkgrljl"; // Replace with your Formspree ID

    // Prepare Data
    const formData = {
        name,
        address,
        email,
        phone,
        date: dateInput,
        orderSummary,
        orderNotes,
        orderNumber,
        imageURLs: uploadedImageUrls // Send image URLs correctly
    };

    console.log("📤 Sending order to Formspree...");
    
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

            // Hide all sections except the order confirmation
            document.getElementById('checkoutForm').style.display = 'none';
            document.getElementById('uploadForm').style.display = 'none';
            document.getElementById('orderSummary').style.display = 'none';
            document.getElementById('reviewOrder').style.display = 'none';
            document.getElementById('checkoutSection').style.display = 'none';

            // Clear uploaded images
            document.getElementById('preview').innerHTML = ''; 
            document.getElementById('imageUpload').value = '';  
            document.getElementById('uploadedImageUrls').value = ''; 

            // Show confirmation
            document.getElementById('orderConfirmation').style.display = 'block';
        } else {
            console.error("❌ Formspree submission failed:", response.statusText);
            alert("There was an error submitting your order. Please try again.");
        }
    } catch (error) {
        console.error("❌ Order submission error:", error);
        alert("There was an error sending your order. Please check your connection and try again.");
    }
}

async function uploadImages() {
    const fileInput = document.getElementById('imageUpload');
    const preview = document.getElementById("preview");
    const uploadedImageUrls = document.getElementById('uploadedImageUrls');
    const uploadStatus = document.getElementById("uploadStatus"); // Display upload messages

    const files = fileInput.files;
    if (!files.length) {
        alert("Please select at least one image to upload.");
        return;
    }

    const IMGUR_CLIENT_ID = "dc57a895f590af6"; // Replace with your Imgur Client ID
    const IMGUR_UPLOAD_URL = "https://api.imgur.com/3/image";
    const validTypes = ['image/jpeg', 'image/png', 'image/gif'];

    let existingUrls = uploadedImageUrls.value ? uploadedImageUrls.value.split(",") : [];
    let newUrls = [];

    // Keep track of already displayed images to prevent duplication
    let existingPreviewImages = new Set();
    preview.querySelectorAll("img").forEach(img => existingPreviewImages.add(img.src));

    uploadStatus.innerHTML = ""; // Clear previous upload messages

    for (let i = 0; i < files.length; i++) {
        let file = files[i];

        // Validate file type
        if (!validTypes.includes(file.type)) {
            alert(`Invalid file type: ${file.name}. Only JPG, PNG, and GIF are allowed.`);
            continue;
        }

        // Display selected image immediately before upload
        let reader = new FileReader();
        reader.onload = function(e) {
            if (!existingPreviewImages.has(e.target.result)) {
                let imgElement = document.createElement("img");
                imgElement.src = e.target.result;
                imgElement.alt = file.name; // Display filename as alt text
                imgElement.style.maxWidth = "150px";
                imgElement.style.maxHeight = "150px";
                imgElement.style.margin = "5px";
                imgElement.style.borderRadius = "10px";
                preview.appendChild(imgElement);

                existingPreviewImages.add(e.target.result);
            }
        };
        reader.readAsDataURL(file); // Read the file as a Data URL

        //  Upload to Imgur in the background
        const formData = new FormData();
        formData.append("image", file);

        try {
            const response = await fetch(IMGUR_UPLOAD_URL, {
                method: "POST",
                headers: {
                    "Authorization": `Client-ID ${IMGUR_CLIENT_ID}`
                },
                body: formData
            });

            if (!response.ok) {
                console.error(`❌ Imgur API Error: ${response.status} ${response.statusText}`);
                if (response.status === 503) {
                    alert(`Imgur is currently down. Please try again later.`);
                    return;
                }
            }

            const result = await response.json();

            if (result.success) {
                let imgUrl = result.data.link;
                newUrls.push(imgUrl);
                console.log(`✅ Image uploaded successfully: ${file.name} (${imgUrl})`);

                // Show success message with filename
                let successMessage = document.createElement("p");
                successMessage.textContent = `✅ Uploaded: ${file.name}`;
                successMessage.style.color = "green";
                successMessage.style.margin = "5px 0";
                uploadStatus.appendChild(successMessage);

            } else {
                console.error("❌ Upload failed:", result);
                alert(`Image upload failed for ${file.name}. Try again.`);
            }
        } catch (error) {
            console.error("❌ Upload error:", error);
            alert(`Image upload error for ${file.name}.`);
        }
    }

    // Keep previous images and append new ones without duplication
    uploadedImageUrls.value = [...new Set([...existingUrls, ...newUrls])].join(",");
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

let lastScrollY = window.scrollY;
const header = document.getElementById("header-container");
const headerHeight = header.offsetHeight; // Get the actual header height
let isScrollingDown = false;

window.addEventListener("scroll", () => {
    let currentScrollY = window.scrollY;

    if (currentScrollY > lastScrollY && currentScrollY > 50) {
        // Scroll Down: Hide Header Fully
        if (!isScrollingDown) {
            header.style.top = `-${headerHeight}px`; // Move header completely off-screen
            isScrollingDown = true;
        }
    } else {
        // Scroll Up: Show Header
        if (isScrollingDown) {
            header.style.top = "0"; // Bring header back
            isScrollingDown = false;
        }
    }

    lastScrollY = currentScrollY;
});








