// Booking API Functions

const API_BASE_URL = 'http://localhost:3000/api';

// Create new booking
async function createBooking(bookingData) {
    try {
        const response = await fetch(`${API_BASE_URL}/bookings`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(bookingData)
        });
        
        return await response.json();
    } catch (error) {
        console.error('Error creating booking:', error);
        throw error;
    }
}

// Get user bookings
async function getUserBookings(userId) {
    try {
        const response = await fetch(`${API_BASE_URL}/bookings/user/${userId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching bookings:', error);
        throw error;
    }
}

// Update booking status
async function updateBookingStatus(bookingId, status) {
    try {
        const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ status })
        });
        
        return await response.json();
    } catch (error) {
        console.error('Error updating booking:', error);
        throw error;
    }
}