window.onload = function() {
    const customerID = 1; // Change to dynamically fetch the logged-in customer ID
    fetch(`/api/cartItems?customerID=${customerID}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const cartItems = document.getElementById('cartItems');
            cartItems.innerHTML = ''; // Clear existing items
            data.forEach(item => {
                const cartItemDiv = document.createElement('div');
                cartItemDiv.className = 'cart-item'; // Add class name
                cartItemDiv.dataset.productId = item.ProductID; // Store product ID in data attribute
                cartItemDiv.innerHTML = `
                    <h2>${item.ProductName}</h2>
                    <p>Price: ₹${item.Price}</p>
                    <p class="quantity">Quantity: ${item.Quantity}</p> <!-- Ensure the quantity is dynamically rendered -->
                `;
                cartItems.appendChild(cartItemDiv);
            });
        })
        .catch(error => console.error('Error fetching cart items:', error));

    // Checkout functionality
    document.getElementById('checkoutButton').addEventListener('click', function() {
        fetch('/api/currentCustomer')
            .then(response => response.json())
            .then(customer => {
                const customerID = customer.CustomerID;

                fetch('/api/placeOrder', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        customerID: customerID,
                        items: [
                            // Fetch the items dynamically from the cart
                            ...Array.from(document.querySelectorAll('#cartItems .cart-item')).map(item => ({
                                productID: item.dataset.productId,
                                quantity: item.querySelector('.quantity').textContent
                            }))
                        ]
                    })
                }).then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    alert('Order placed successfully!');
                    // Optionally, redirect to another page
                    // window.location.href = 'confirmation.html';
                })
                .catch(error => console.error('Error placing order:', error));
            })
            .catch(error => console.error('Error fetching customer ID:', error));
    });
};

