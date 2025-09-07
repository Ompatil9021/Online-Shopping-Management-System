document.addEventListener('DOMContentLoaded', () => {
    const productDetailsContainer = document.getElementById('product-details');
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get("id"); // Get the product ID from the URL

    if (productId) {
        loadProductDetails(productId);
    } else {
        productDetailsContainer.innerHTML = "<p>Product ID not specified.</p>";
    }

    async function loadProductDetails(id) {
        try {
            const response = await fetch(`http://localhost:3000/api/product/${id}`);
            if (!response.ok) {
                if (response.status === 404) {
                    productDetailsContainer.innerHTML = "<p>Product not found.</p>";
                } else {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return;
            }
            const product = await response.json();
            displayProductDetails(product);
        } catch (err) {
            console.error("Error loading product details:", err);
            productDetailsContainer.innerHTML = `<p class="error-message">Failed to load product details.</p>`;
        }
    }

    function displayProductDetails(product) {
        productDetailsContainer.innerHTML = `
            <div class="product-image">
                <img src="${product.ImagePath || 'images/placeholder.png'}" alt="${product.Name}">
            </div>
            <div class="product-info">
                <h2>${product.Name}</h2>
                <p class="price">₹${product.Price}</p>
                <p class="description">${product.Description || 'No description available.'}</p>
                <p>Availability: ${product.Stock > 0 ? 'In Stock' : 'Out of Stock'}</p>
                <button class="add-to-cart-btn"
                        data-product-id="${product.ProductID}"
                        data-product-name="${product.Name}"
                        data-product-price="${product.Price}"
                        data-product-image="${product.ImagePath}">Add to Cart</button>
            </div>
        `;

        // Add event listener for the "Add to Cart" button that was just created
        const addToCartButton = productDetailsContainer.querySelector('.add-to-cart-btn');
        if (addToCartButton) {
            addToCartButton.addEventListener('click', addToCart); // Assuming your addToCart function is in script.js
        }
    }
});