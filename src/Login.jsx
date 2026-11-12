
import { useState } from 'react';
import { apiRequest, saveToken } from './api';
import './App.css';

export default function Login({ onLogin, onSwitchToRegister }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setError('');
        setLoading(true);

        try {
            const data = await apiRequest('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, password }),
            });

            const token =
                data?.accessToken ??
                data?.token ??
                data?.jwt;

            if (typeof token !== 'string' || !token.trim()) {
                throw new Error(
                    'Login succeeded, but no token was found in the response. Check the backend login response.'
                );
            }

            saveToken(token);
            onLogin(data.user);
        } catch (err) {
            setError(err.message || 'Login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="app login-screen">
            <section className="panel login-panel">
                <div className="brand login-brand">
                    <div className="brand-icon">₹</div>
                    <span>Fin<span className="brand-accent">Track</span></span>
                </div>

                <h1>Welcome back</h1>
                <p>Sign in to view your financial overview.</p>

                <form onSubmit={handleSubmit}>
                    <label className="form-field">
                        <span>Email address</span>
                        <input
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="you@example.com"
                            autoComplete="username"
                            required
                        />
                    </label>

                    <label className="form-field">
                        <span>Password</span>
                        <input
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            placeholder="Enter your password"
                            autoComplete="current-password"
                            required
                        />
                    </label>

                    {error && <p className="form-error" role="alert">{error}</p>}

                    <button className="primary-button login-submit" type="submit" disabled={loading}>
                        {loading ? 'Signing in…' : 'Sign in'}
                    </button>
                </form>
                <p className="auth-switch">
                    Don't have an account?{' '}
                    <button type="button" onClick={onSwitchToRegister}>
                        Create account
                    </button>
                </p>
            </section>
        </div>
    );
}
