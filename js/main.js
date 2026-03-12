// Main JavaScript File

// Navbar Toggle
document.addEventListener('DOMContentLoaded', function() {
    // Load Navbar and Footer
    loadComponent('navbar', 'components/navbar.html');
    loadComponent('footer', 'components/footer.html');
    
    // Mobile Menu Toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }
    
    // Set active nav link
    const currentPage = window.location.pathname.split('/').pop();
    const navLinks = document.querySelectorAll('.nav-menu a');
    
    navLinks.forEach(link => {
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
    });
});

// Load HTML Components
function loadComponent(elementId, filePath) {
    fetch(filePath)
        .then(response => response.text())
        .then(data => {
            document.getElementById(elementId).innerHTML = data;
        })
        .catch(error => console.log('Error loading component:', error));
}

// Form Validation
function validateForm(formId) {
    const form = document.getElementById(formId);
    const inputs = form.querySelectorAll('input[required], select[required]');
    
    for (let input of inputs) {
        if (!input.value) {
            alert('Please fill in all required fields');
            input.focus();
            return false;
        }
    }
    return true;
}

// Show Notification
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}"></i>
        <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Driver Status Toggle
function toggleStatus() {
    const button = event.target;
    if (button.textContent === 'Go Offline') {
        button.textContent = 'Go Online';
        button.classList.remove('btn-primary');
        button.classList.add('btn-outline');
        showNotification('You are now offline', 'info');
    } else {
        button.textContent = 'Go Offline';
        button.classList.remove('btn-outline');
        button.classList.add('btn-primary');
        showNotification('You are now online', 'success');
    }
}