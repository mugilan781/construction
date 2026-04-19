const api = {
    // Utility to get auth headers
    getHeaders() {
        const token = localStorage.getItem('adminToken');
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        };
    },

    // Wrapper for GET requests
    async get(url) {
        try {
            const response = await fetch(url, {
                method: 'GET',
                headers: this.getHeaders()
            });
            
            if (response.status === 401 || response.status === 403) {
                window.location.href = 'login.html';
                return null;
            }

            return await response.json();
        } catch (error) {
            console.error(`GET ${url} failed:`, error);
            throw error;
        }
    },

    // Wrapper for POST requests
    async post(url, data) {
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: this.getHeaders(),
                body: JSON.stringify(data)
            });

            if (response.status === 401 || response.status === 403) {
                window.location.href = 'login.html';
                return null;
            }

            return await response.json();
        } catch (error) {
            console.error(`POST ${url} failed:`, error);
            throw error;
        }
    },

    // Wrapper for DELETE requests
    async delete(url) {
        try {
            const response = await fetch(url, {
                method: 'DELETE',
                headers: this.getHeaders()
            });

            if (response.status === 401 || response.status === 403) {
                window.location.href = 'login.html';
                return null;
            }

            return await response.json();
        } catch (error) {
            console.error(`DELETE ${url} failed:`, error);
            throw error;
        }
    },
    
    // Wrapper for PUT requests
    async put(url, data) {
        try {
            const response = await fetch(url, {
                method: 'PUT',
                headers: this.getHeaders(),
                body: JSON.stringify(data)
            });

            if (response.status === 401 || response.status === 403) {
                window.location.href = 'login.html';
                return null;
            }

            return await response.json();
        } catch (error) {
            console.error(`PUT ${url} failed:`, error);
            throw error;
        }
    },

    // Wrapper for forms with file uploads (FormData)
    async postFormData(url, formData) {
        try {
            const token = localStorage.getItem('adminToken');
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                    // Do not set Content-Type to application/json, let browser set boundary
                },
                body: formData
            });

            if (response.status === 401 || response.status === 403) {
                window.location.href = 'login.html';
                return null;
            }

            return await response.json();
        } catch (error) {
            console.error(`POST FormData ${url} failed:`, error);
            throw error;
        }
    }
};

window.api = api;

// Global Toast Utility for Success/Error/Warning
window.showToast = function(msg, type = 'success') {
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        document.body.appendChild(toast);
    }
    
    toast.className = 'fixed bottom-4 right-4 text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-300 translate-y-20 opacity-0 flex items-center z-50';
    
    if (type === 'error') {
        toast.classList.add('bg-red-500');
        toast.innerHTML = `<i class="fas fa-exclamation-circle mr-2"></i><span>${msg}</span>`;
    } else if (type === 'warning') {
        toast.classList.add('bg-orange-500');
        toast.innerHTML = `<i class="fas fa-exclamation-triangle mr-2"></i><span>${msg}</span>`;
    } else {
        toast.classList.add('bg-green-500');
        toast.innerHTML = `<i class="fas fa-check-circle mr-2"></i><span>${msg}</span>`;
    }
    
    // Force reflow
    void toast.offsetWidth;
    
    toast.classList.remove('translate-y-20', 'opacity-0');
    setTimeout(() => {
        toast.classList.add('translate-y-20', 'opacity-0');
    }, 3000);
};
