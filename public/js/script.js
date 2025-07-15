setTimeout(() => {
    const alertEl = document.querySelector('.alert');
    if (alertEl) {
      const alert = bootstrap.Alert.getOrCreateInstance(alertEl);
      alert.close();
    }
    }, 5000); // auto-dismiss after 5 seconds


  // handling password eye button

let togglePassword = document.getElementById('togglePassword');
let passwordInput = document.getElementById('password');

togglePassword.addEventListener('click', (event) => {
  let type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
  passwordInput.setAttribute('type', type);
  togglePassword.innerHTML = type === 'password'
    ? '<i class="fa fa-eye"></i>'
    : '<i class="fa fa-eye-slash"></i>';
});


// handing password matching
let form = document.getElementById('registrationForm');
let errorDiv = document.getElementById("error-message");

form.addEventListener('submit', (event) => {
    let pass = document.getElementById("password").value;
    let cpass = document.getElementById("confirmPassword").value;

    if (pass !== cpass) {
        event.preventDefault(); // Prevent form submission
        errorDiv.textContent = "Password and Confirm Password do not match!";
    } else {
        errorDiv.textContent = "";
    }
});