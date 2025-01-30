document.getElementById('checkoutButton').addEventListener('click', function() {
    const customerID = 1; // Change to dynamically fetch the logged-in customer ID

    fetch('/api/cartItems?customerID=' + customerID)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(cartItems => {
            if (!Array.isArray(cartItems)) {
                throw new TypeError('Expected an array but received: ' + typeof cartItems);
            }

            const items = cartItems.map(item => {
                return {
                    productID: item.ProductID,
                    quantity: 1 // Default quantity since the Quantity column is dropped
                };
            });

            return fetch('/api/placeOrder', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ customerID, items })
            });
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            alert('Order placed successfully!');
            // Optionally, redirect to order summary page
            window.location.href = 'orderSummary.html';
        })
        .catch(error => {
            console.error('Error placing order:', error);
            alert('An error occurred while placing the order. Please try again.');
        });
});
