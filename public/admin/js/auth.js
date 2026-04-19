const auth = {
    // Check if user is logged in
    checkAuth() {
        const token = localStorage.getItem('adminToken');
        if (!token) {
            window.location.href = '/login.html';
        }
        return token;
    },

    // Login user
    async login(email, password) {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const result = await response.json();

            if (result.success && result.data.role === 'admin') {
                localStorage.setItem('adminToken', result.data.token);
                localStorage.setItem('adminUser', JSON.stringify(result.data));
                window.location.href = 'dashboard.html';
            } else {
                return { success: false, message: result.message || 'Unauthorized. Admin access required.' };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, message: 'An error occurred during login.' };
        }
    },

    // Logout user
    async logout() {
        const confirmed = await showConfirmModal('Are you sure you want to logout?', 'blue', 'Logout');
        if (confirmed) {
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = '/login.html';
        }
    },

    // Setup logout button listener
    initLogout() {
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }
    }
};

// Check auth immediately on protected pages
// We assume all admin HTML files EXCEPT login.html are protected
if (!window.location.pathname.endsWith('login.html')) {
    auth.checkAuth();
}

// BFCache Protection: Check immediately when the page is restored from browser history
window.addEventListener('pageshow', (event) => {
    if (!window.location.pathname.endsWith('login.html')) {
        auth.checkAuth();
    }
});

// Check logged in user for sidebar and topbar
document.addEventListener('DOMContentLoaded', () => {
    if (!window.location.pathname.endsWith('login.html')) {
        auth.initLogout();
        // Set user name if element exists
        const userNameSpan = document.getElementById('adminUserName');
        if (userNameSpan) {
            const userStr = localStorage.getItem('adminUser');
            if (userStr) {
                const user = JSON.parse(userStr);
                userNameSpan.textContent = user.email || 'Admin';
            }
        }
    }

    // --- Mobile Sidebar Toggle Logic ---
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const adminSidebar = document.getElementById('adminSidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    function toggleSidebar() {
        if (!adminSidebar || !sidebarOverlay) return;
        
        const isClosed = adminSidebar.classList.contains('-translate-x-full');
        
        if (isClosed) {
            // Open sidebar
            adminSidebar.classList.remove('-translate-x-full');
            sidebarOverlay.classList.remove('hidden');
            // Small delay to trigger opacity transition
            setTimeout(() => sidebarOverlay.classList.remove('opacity-0'), 10);
        } else {
            // Close sidebar
            adminSidebar.classList.add('-translate-x-full');
            sidebarOverlay.classList.add('opacity-0');
            setTimeout(() => sidebarOverlay.classList.add('hidden'), 300);
        }
    }

    if (mobileMenuBtn) {
        mobileMenuBtn.addEventListener('click', toggleSidebar);
    }
    
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', toggleSidebar);
    }
});

window.auth = auth;
