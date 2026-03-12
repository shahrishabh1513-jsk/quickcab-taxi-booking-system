// Driver API Functions

// Register driver
async function registerDriver(driverData) {
    try {
        const response = await fetch(`${API_BASE_URL}/drivers/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(driverData)
        });
        
        return await response.json();
    } catch (error) {
        console.error('Error registering driver:', error);
        throw error;
    }
}

// Get available ride requests
async function getRideRequests() {
    try {
        const response = await fetch(`${API_BASE_URL}/drivers/requests`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching ride requests:', error);
        throw error;
    }
}

// Accept ride request
async function acceptRide(rideId) {
    try {
        const response = await fetch(`${API_BASE_URL}/drivers/accept/${rideId}`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        return await response.json();
    } catch (error) {
        console.error('Error accepting ride:', error);
        throw error;
    }
}

// Update ride status
async function updateRideStatus(rideId, status) {
    try {
        const response = await fetch(`${API_BASE_URL}/drivers/ride/${rideId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({ status })
        });
        
        return await response.json();
    } catch (error) {
        console.error('Error updating ride status:', error);
        throw error;
    }
}

// Get driver earnings
async function getDriverEarnings(driverId, period = 'month') {
    try {
        const response = await fetch(`${API_BASE_URL}/drivers/${driverId}/earnings?period=${period}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
        
        return await response.json();
    } catch (error) {
        console.error('Error fetching earnings:', error);
        throw error;
    }
}