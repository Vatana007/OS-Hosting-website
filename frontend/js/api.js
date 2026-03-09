const API_BASE = '/api';

class Api {
    static getToken() {
        return localStorage.getItem('token');
    }

    static setToken(token) {
        localStorage.setItem('token', token);
    }

    static removeToken() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }

    static getUser() {
        const u = localStorage.getItem('user');
        return u ? JSON.parse(u) : null;
    }

    static setUser(user) {
        localStorage.setItem('user', JSON.stringify(user));
    }

    static isLoggedIn() {
        return !!this.getToken();
    }

    static isAdmin() {
        const u = this.getUser();
        return u && u.role === 'admin';
    }

    static async request(endpoint, options = {}) {
        const config = {
            headers: { 'Content-Type': 'application/json', ...options.headers },
            ...options
        };
        const token = this.getToken();
        if (token) config.headers['Authorization'] = `Bearer ${token}`;
        if (config.body && typeof config.body === 'object') config.body = JSON.stringify(config.body);

        try {
            const response = await fetch(`${API_BASE}${endpoint}`, config);
            const data = await response.json();
            if (!response.ok) {
                if (response.status === 401) {
                    this.removeToken();
                    if (!location.pathname.includes('login')) location.href = '/login.html';
                }
                throw new Error(data.message || 'Request failed');
            }
            return data;
        } catch (error) {
            throw error;
        }
    }

    static get(ep) { return this.request(ep); }
    static post(ep, body) { return this.request(ep, { method: 'POST', body }); }
    static put(ep, body) { return this.request(ep, { method: 'PUT', body }); }
    static delete(ep) { return this.request(ep, { method: 'DELETE' }); }
}