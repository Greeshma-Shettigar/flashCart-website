document.getElementById('registerForm').addEventListener('submit', function(event) {
    event.preventDefault();
    console.log(" Form submitted ");
    const userData = {
        customerName: document.getElementById('customerName').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value
    };
    console.log("User Data",userData);
    
    fetch('/api/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
    }).then(response => {
        console.log("Fetch response",response);
        return response.json();
    })
      .then(data => {
          console.log("Response data :",data);
          alert('User registered successfully!');
          window.location.href= 'login.html'; // Redirect to the login page
      })
      .catch(error => {
          console.error('Error:', error);
      });
});
