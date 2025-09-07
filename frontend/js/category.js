document.addEventListener('DOMContentLoaded', () => {
    const categoryTitleElement = document.getElementById("category-title");
    const categoryProductsContainer = document.getElementById("category-products");
    const urlParams = new URLSearchParams(window.location.search);
    const categoryName = urlParams.get("category"); // Get the category name from the URL

    if (categoryName) {
        categoryTitleElement.textContent = categoryName;
        loadCategoryProducts(categoryName);
    } else {
        categoryTitleElement.textContent = "Category Not Found";
        categoryProductsContainer.innerHTML = "<p>No category specified.</p>";
    }

    async function loadCategoryProducts(category) {
        try {
            const response = await fetch(`http://localhost:3000/api/category/${category}`);
            if (!response.ok) {
                if (response.status === 404) {
                    categoryProductsContainer.innerHTML = "<p>Category not found.</p>";
                } else {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                return;
            }
            const products = await response.json();
            displayCategoryProducts(products);
        } catch (err) {
            console.error("Error loading category products:", err);
            categoryProductsContainer.innerHTML = `<p class="error-message">Failed to load products for this category.</p>`;
        }
    }

    function displayCategoryProducts(products) {
        categoryProductsContainer.innerHTML = "";
        if (products.length === 0) {
            categoryProductsContainer.innerHTML = "<p>No products found in this category.</p>";
            return;
        }
        products.forEach(product => {
            const card = document.createElement("div");
            card.className = "product-card";
            card.innerHTML = `
                <img src="${product.ImagePath || 'images/placeholder.png'}" alt="${product.Name}" />
                <h3>${product.Name}</h3>
                <p>₹${product.Price}</p>
                <a href="product.html?id=${product.ProductID}" class="btn">View</a>
            `;
            categoryProductsContainer.appendChild(card);
        });
    }
});