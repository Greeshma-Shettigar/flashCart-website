window.onload = function() {
    fetch('/api/product')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            if (!Array.isArray(data)) {
                throw new TypeError('Expected an array but received: ' + typeof data);
            }
            const productList = document.getElementById('productList');
            productList.innerHTML = ''; // Clear any existing content
            data.forEach(product => {
                const productCard = document.createElement('div');
                productCard.className = 'product-card';
                // Use full path for the image source
                const imagePath = `http://localhost:3000/${product.ImagePath}`;
                productCard.innerHTML = `
                    <img src="${imagePath}" alt="${product.ProductName}" class="product-image">
                    <h2>${product.ProductName}</h2>
                    <p>Category: ${product.CategoryName}</p>
                    <p>Price: ₹${product.Price}</p>
                    <p>Size: ${product.Size}</p>
                    <p>Stock: ${product.Stock}</p>
                    <button onclick="addToCart(${product.ProductID})">Add to Cart</button>
                    <button onclick="orderProduct(${product.ProductID})">Order</button>
                `;
                productList.appendChild(productCard);
            });
        })
        .catch(error => {
            console.error('Error:', error);
        });
};


function addToCart(productId) {
    const cartData = {
        customerID: 1, // Change to dynamically fetch the logged-in customer ID
        productID: productId
    };

    fetch('/api/addToCart', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(cartData)
    }).then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        alert('Product added to cart!');
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function orderProduct(productId) {
    const orderData = {
        customerID: 1, // Change to dynamically fetch the logged-in customer ID
        items: [
            {
                productID: productId,
                quantity: 1 // Default quantity
            }
        ]
    };

    fetch('/api/placeOrder', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
    }).then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        alert('Order placed successfully!');
        // Optionally, redirect to order summary page
        // window.location.href = 'orderSummary.html';
    })
    .catch(error => {
        console.error('Error placing order:', error);
    });
}
