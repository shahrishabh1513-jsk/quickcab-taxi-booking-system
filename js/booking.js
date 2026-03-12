// Booking JavaScript

// Fare Calculation
function calculateFare() {
    const carType = document.getElementById('car-type')?.value;
    const distance = parseFloat(document.getElementById('distance')?.value) || 0;
    
    const rates = {
        mini: 10,
        sedan: 14,
        suv: 18,
        luxury: 25
    };
    
    const rate = rates[carType] || 0;
    const totalFare = distance * rate;
    const baseFare = 50; // Minimum fare
    
    document.getElementById('base-fare').textContent = `₹${baseFare}`;
    document.getElementById('distance-fare').textContent = `₹${distance * rate}`;
    document.getElementById('total-fare').textContent = `₹${baseFare + totalFare}`;
}

// Booking Form Submission
document.addEventListener('DOMContentLoaded', function() {
    const bookingForm = document.getElementById('booking-form');
    
    if (bookingForm) {
        bookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Validate form
            if (!validateForm('booking-form')) return;
            
            // Show booking confirmation modal
            document.getElementById('booking-modal').classList.add('active');
            
            // Simulate booking process
            setTimeout(() => {
                showNotification('Driver assigned successfully!', 'success');
            }, 2000);
        });
    }
    
    // Home page booking form
    const homeBookingForm = document.getElementById('home-booking-form');
    if (homeBookingForm) {
        homeBookingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            window.location.href = 'book-ride.html';
        });
    }
});

// Close Modal
function closeModal() {
    document.getElementById('booking-modal').classList.remove('active');
    window.location.href = 'dashboard/ride-tracking.html';
}

// Load Google Maps (Placeholder - Replace with actual API key)
function initMap() {
    console.log('Google Maps would initialize here');
    // Actual Google Maps implementation would go here
    // You would need to include the Google Maps API script
}

// Get User Location
function getUserLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            position => {
                console.log('User location:', position.coords);
                // Use coordinates to show on map
            },
            error => {
                console.error('Error getting location:', error);
                showNotification('Please enable location services', 'error');
            }
        );
    } else {
        showNotification('Geolocation is not supported', 'error');
    }
}