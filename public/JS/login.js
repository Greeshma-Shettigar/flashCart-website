document.getElementById('loginForm').addEventListener('submit', async function(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            if (response.status === 401) {
                alert('Invalid email or password');
            } else {
                throw new Error('Network response was not ok');
            }
        } else {
            const data = await response.json();
            alert(data.message);
            //  redirect to another page
             window.location.href = 'product.html';
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    }
});
