document.addEventListener('DOMContentLoaded', () => {
    // SIGNUP (No changes needed)
    const signupForm = document.getElementById("signup-form");
    if (signupForm) {
        signupForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const username = document.getElementById("signup-username").value;
            const email = document.getElementById("signup-email").value;
            const password = document.getElementById("signup-password").value;

            try {
                const response = await fetch("http://localhost:3000/api/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    alert("Signup successful! Please login.");
                    signupForm.reset();
                } else {
                    alert(data.message || "Signup failed.");
                }
            } catch (error) {
                console.error("Signup error:", error);
                alert("Signup failed.");
            }
        });
    }

    // LOGIN (No changes needed)
    const loginForm = document.getElementById("login-form");
    if (loginForm) {
        loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const email = document.getElementById("login-email").value;
            const password = document.getElementById("login-password").value;

            try {
                const response = await fetch("http://localhost:3000/api/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    alert(`Welcome ${data.username}! Login successful.`);
                    localStorage.setItem("loggedInUser", JSON.stringify(data));
                    window.location.href = "index.html";
                } else {
                    alert(data.message || "Login failed.");
                }
            } catch (error) {
                console.error("Login error:", error);
                alert("Login failed.");
            }
        });
    }

    // TODAY'S DEALS ON HOMEPAGE (Updated image rendering)
    const todayDealsContainer = document.getElementById('today-deals');
    if (todayDealsContainer) {
        async function fetchTodayDeals() {
            try {
                const response = await fetch("http://localhost:3000/api/today-deals");
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const deals = await response.json();
                displayTodayDeals(deals.slice(0, 3)); // Display the first 3 deals
            } catch (error) {
                console.error("Failed to fetch today's deals:", error);
                todayDealsContainer.innerHTML = `<p class="error-message">Failed to load today's deals.</p>`;
            }
        }

        function displayTodayDeals(deals) {
            todayDealsContainer.innerHTML = "";
            if (deals.length === 0) {
                todayDealsContainer.innerHTML = "<p>No today's deals available.</p>";
                return;
            }
            deals.forEach(deal => {
                const productCard = document.createElement("div");
                productCard.classList.add("product-card");
                productCard.innerHTML = `
                    <img src="${deal.ImagePath || 'images/placeholder.png'}" alt="${deal.Name}">
                    <h3>${deal.Name}</h3>
                    <p class="price">₹${deal.Price}</p>
                    <a href="product.html?id=${deal.ProductID}" class="view-button">View</a>
                `;
                todayDealsContainer.appendChild(productCard);
            });
        }

        fetchTodayDeals();
    }

    // FEATURED PRODUCTS (Updated image rendering)
    const featuredContainer = document.getElementById('featured-products');
    if (featuredContainer) {
        async function loadFeaturedProducts() {
            try {
                const res = await fetch("http://localhost:3000/api/products");
                const products = await res.json();
                const featured = products.slice(-4); // show last 4 products
                displayFeatured(featured);
            } catch (err) {
                console.error("Error loading featured products:", err);
            }
        }

        function displayFeatured(products) {
            featuredContainer.innerHTML = "";
            products.forEach(product => {
                const card = document.createElement("div");
                card.className = "product-card";
                card.innerHTML = `
                    <img src="${product.ImagePath || 'images/placeholder.png'}" alt="${product.Name}" />
                    <h3>${product.Name}</h3>
                    <p>₹${product.Price}</p>
                    <a href="product.html?id=${product.ProductID}" class="btn">View</a>
                `;
                featuredContainer.appendChild(card);
            });
        }

        loadFeaturedProducts();
    }

    // PRODUCT LIST (Updated image rendering and Add to Cart button)
    const productList = document.getElementById('product-list');
    if (productList) {
        async function fetchProducts() {
            try {
                const response = await fetch("http://localhost:3000/api/products");
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const products = await response.json();
                displayProducts(products);
            } catch (error) {
                console.error("Failed to fetch products:", error);
                productList.innerHTML = `<p class="error-message">Failed to load products.</p>`;
            }
        }

        function displayProducts(products) {
            productList.innerHTML = "";
            products.forEach(product => {
                const productCard = document.createElement("div");
                productCard.classList.add("product-card");
                productCard.innerHTML = `
                    <img src="${product.ImagePath || 'images/placeholder.png'}" alt="${product.Name}">
                    <h3>${product.Name}</h3>
                    <p class="price">₹${product.Price}</p>
                    <button
                        data-product-id="${product.ProductID}"
                        data-product-name="${product.Name}"
                        data-product-price="${product.Price}"
                        data-product-image="${product.ImagePath}"
                        class="add-to-cart-btn">Add to Cart</button>
                `;
                productList.appendChild(productCard);
            });

            document.querySelectorAll('.add-to-cart-btn').forEach(button =>
                button.addEventListener('click', addToCart)
            );
        }

        // fetchProducts(); // Keep this commented out if you only want Today's Deals on the homepage
    }

    // ADD TO CART FUNCTION (No changes needed - assuming it's in utils.js now)
    function addToCart(event) {
        const button = event.target;
        const productId = parseInt(button.dataset.productId);
        const productName = button.dataset.productName;
        const productPrice = parseFloat(button.dataset.productPrice);
        const productImage = button.dataset.productImage;

        if (!productId || !productName || !productImage || isNaN(productPrice)) {
            alert("Invalid product data. Please try again.");
            return;
        }

        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        const existingItem = cart.find(item => item.id === productId);

        if (existingItem) {
            existingItem.quantity++;
        } else {
            cart.push({
                id: productId,
                name: productName,
                price: productPrice,
                image: productImage,
                quantity: 1
            });
        }

        localStorage.setItem('cart', JSON.stringify(cart));
        alert(`${productName} added to cart!`);
    }

    // DISPLAY CART (No changes needed)
    const cartItemsContainer = document.getElementById('cart-items');
    if (cartItemsContainer) {
        function displayCart() {
            const cart = JSON.parse(localStorage.getItem('cart')) || [];
            cartItemsContainer.innerHTML = '';

            const validCart = cart.filter(item =>
                item.id && item.name && item.image && item.price > 0 && item.quantity > 0
            );
            localStorage.setItem('cart', JSON.stringify(validCart));

            if (validCart.length === 0) {
                cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
                return;
            }

            validCart.forEach(item => {
                const cartItem = document.createElement('div');
                cartItem.classList.add('cart-item');
                cartItem.innerHTML = `
                    <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px;">
                    <p>${item.name} (x${item.quantity})</p>
                    <p>Price: ₹${item.price * item.quantity}</p>
                    <button class="remove-from-cart-btn" data-product-id="${item.id}">Remove</button>
                `;
                cartItemsContainer.appendChild(cartItem);
            });

            document.querySelectorAll('.remove-from-cart-btn').forEach(button =>
                button.addEventListener('click', removeFromCart)
            );
        }

        function removeFromCart(event) {
            const productIdToRemove = parseInt(event.target.dataset.productId);
            if (!productIdToRemove) {
                alert("Invalid product ID.");
                return;
            }

            let cart = JSON.parse(localStorage.getItem('cart')) || [];
            cart = cart.filter(item => item.id !== productIdToRemove);
            localStorage.setItem('cart', JSON.stringify(cart));
            displayCart();
        }

        displayCart();
    }

    // SEARCH FUNCTIONALITY
    const searchInput = document.getElementById('search-input');
    const productDisplayContainer = document.getElementById('today-deals'); // Or the container where you display products

    if (searchInput && productDisplayContainer) {
        searchInput.addEventListener('input', handleSearch);

        async function handleSearch(event) {
            const searchTerm = event.target.value.trim();

            if (searchTerm.length >= 2) {
                try {
                    const response = await fetch(`http://localhost:3000/api/search?query=${encodeURIComponent(searchTerm)}`);
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const results = await response.json();
                    displaySearchResults(results);
                } catch (error) {
                    console.error("Search failed:", error);
                    productDisplayContainer.innerHTML = `<p class="error-message">Search failed.</p>`;
                }
            } else if (searchTerm.length === 0) {
                // Optionally reload the default product list (e.g., today's deals)
                fetchTodayDeals(); // Assuming you have this function
            }
        }

        function displaySearchResults(results) {
            productDisplayContainer.innerHTML = ""; // Clear previous results
            if (results && results.length > 0) {
                results.forEach(product => {
                    const productCard = document.createElement("div");
                    productCard.classList.add("product-card");
                    productCard.innerHTML = `
                        <img src="${product.ImagePath || 'images/placeholder.png'}" alt="${product.Name}">
                        <h3>${product.Name}</h3>
                        <p class="price">₹${product.Price}</p>
                        <a href="product.html?id=${product.ProductID}" class="view-button">View</a>
                        <button
                            data-product-id="${product.ProductID}"
                            data-product-name="${product.Name}"
                            data-product-price="${product.Price}"
                            data-product-image="${product.ImagePath}"
                            class="add-to-cart-btn">Add to Cart</button>
                    `;
                    productDisplayContainer.appendChild(productCard);
                });
                // Re-attach event listeners for "Add to Cart" buttons if needed
                document.querySelectorAll('.add-to-cart-btn').forEach(button =>
                    button.addEventListener('click', addToCart)
                );
            } else {
                productDisplayContainer.innerHTML = "<p>No products found matching your search.</p>";
            }
        }
    }
});