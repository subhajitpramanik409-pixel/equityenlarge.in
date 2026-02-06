// auth.js - Authentication and User Management System
// This handles login, signup, session management, and subscription access

const AuthSystem = {
    // Initialize auth system
    init() {
        this.checkSession();
    },

    // Check if user is logged in
    isLoggedIn() {
        return localStorage.getItem('currentUser') !== null;
    },

    // Get current user data
    getCurrentUser() {
        const userData = localStorage.getItem('currentUser');
        return userData ? JSON.parse(userData) : null;
    },

    // Check session on page load
    checkSession() {
        const user = this.getCurrentUser();
        if (user) {
            // Auto-login valid session
            return true;
        }
        return false;
    },

    // Sign up new user
    signup(userData) {
        const users = this.getAllUsers();
        
        // Check if email already exists
        if (users.find(u => u.email === userData.email)) {
            return { success: false, message: 'Email already registered' };
        }

        // Create new user
        const newUser = {
            id: 'user_' + Date.now(),
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            password: userData.password, // In production, this would be hashed
            subscription: 'free', // free, foundation, pro, elite
            subscriptionExpiry: null,
            coursesAccess: [], // Array of course IDs user has access to
            joinedDate: new Date().toISOString(),
            lastLogin: new Date().toISOString()
        };

        // Save user
        users.push(newUser);
        localStorage.setItem('allUsers', JSON.stringify(users));

        // Auto-login after signup
        this.login(userData.email, userData.password);

        return { success: true, message: 'Account created successfully', user: newUser };
    },

    // Login user
    login(email, password) {
        const users = this.getAllUsers();
        const user = users.find(u => u.email === email && u.password === password);

        if (user) {
            // Update last login
            user.lastLogin = new Date().toISOString();
            this.updateUser(user);

            // Set current session
            localStorage.setItem('currentUser', JSON.stringify(user));
            return { success: true, message: 'Login successful', user: user };
        }

        return { success: false, message: 'Invalid email or password' };
    },

    // Logout user
    logout() {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    },

    // Get all users
    getAllUsers() {
        const users = localStorage.getItem('allUsers');
        return users ? JSON.parse(users) : [];
    },

    // Update user data
    updateUser(userData) {
        const users = this.getAllUsers();
        const index = users.findIndex(u => u.id === userData.id);
        if (index !== -1) {
            users[index] = userData;
            localStorage.setItem('allUsers', JSON.stringify(users));
            
            // Update current session if it's the logged-in user
            const currentUser = this.getCurrentUser();
            if (currentUser && currentUser.id === userData.id) {
                localStorage.setItem('currentUser', JSON.stringify(userData));
            }
        }
    },

    // Check if user has access to a course
    hasAccess(courseId) {
        const user = this.getCurrentUser();
        if (!user) return false;

        // Check subscription level access
        const subscriptionAccess = {
            'free': [],
            'foundation': ['foundation'],
            'pro': ['foundation', 'pro'],
            'elite': ['foundation', 'pro', 'elite']
        };

        return subscriptionAccess[user.subscription]?.includes(courseId) || false;
    },

    // Purchase course/subscription
    purchaseCourse(courseId, amount) {
        const user = this.getCurrentUser();
        if (!user) {
            return { success: false, message: 'Please login first' };
        }

        // In production, this would integrate with payment gateway
        // For demo, we'll simulate successful payment
        
        // Update user subscription
        user.subscription = courseId;
        user.subscriptionExpiry = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(); // 1 year
        
        if (!user.coursesAccess.includes(courseId)) {
            user.coursesAccess.push(courseId);
        }

        this.updateUser(user);

        return { 
            success: true, 
            message: 'Course purchased successfully!',
            user: user 
        };
    },

    // Require authentication (redirect if not logged in)
    requireAuth() {
        if (!this.isLoggedIn()) {
            window.location.href = 'login.html?redirect=' + encodeURIComponent(window.location.pathname);
            return false;
        }
        return true;
    },

    // Require specific course access
    requireCourseAccess(courseId) {
        if (!this.requireAuth()) return false;
        
        if (!this.hasAccess(courseId)) {
            alert('You do not have access to this course. Please purchase it first.');
            window.location.href = 'courses.html';
            return false;
        }
        return true;
    }
};

// Initialize on page load
if (typeof window !== 'undefined') {
    AuthSystem.init();
}
