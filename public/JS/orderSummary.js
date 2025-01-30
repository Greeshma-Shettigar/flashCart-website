// js/orderSummary.js
window.onload = function() {
    const customerID = 1; // Change to dynamically fetch the logged-in customer ID
    fetch(`/api/orderSummary?customerID=${customerID}`)
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
            const orderSummary = document.getElementById('orderSummary');
            orderSummary.innerHTML = ''; // Clear any existing content
            data.forEach(order => {
                const orderItem = document.createElement('div');
                orderItem.className = 'order-item';
                orderItem.innerHTML = `
                    <h2>Order ID: ${order.OrderID}</h2>
                   
                    <p>Product: ${order.ProductName}</p>
                    <p>Quantity: ${order.Quantity}</p>
                    <p>Price: ₹${order.Price}</p>
                `;
                orderSummary.appendChild(orderItem);
            });
        })
        .catch(error => {
            console.error('Error:', error);
        });
};
//   <p>Customer: ${order.CustomerName}</p>