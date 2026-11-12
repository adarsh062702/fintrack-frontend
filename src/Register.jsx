
import { useState } from 'react';
import { apiRequest } from './api';
import './App.css';

export default function Register({ onRegistered, onSwitchToLogin }) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setError('');
        setSuccess('');

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (password.length < 8 || password.length > 72) {
            setError('Password must be between 8 and 72 characters.');
            return;
        }

        setLoading(true);

        try {
            await apiRequest('/auth/register', {
                method: 'POST',
                body: JSON.stringify({
                    name: name.trim(),
                    email: email.trim(),
                    password,
                }),
            });

            setSuccess('Account created successfully! Please sign in.');
            onRegistered();
        } catch (err) {
            setError(err.message || 'Registration failed. Please try again.');
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

                <h1>Create your account</h1>
                <p>Start managing your money with FinTrack.</p>

                <form onSubmit={handleSubmit}>
                    <label className="form-field">
                        <span>Full name</span>
                        <input
                            type="text"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            placeholder="Enter your full name"
                            maxLength={100}
                            autoComplete="name"
                            required
                        />
                    </label>

                    <label className="form-field">
                        <span>Email address</span>
                        <input
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="you@example.com"
                            maxLength={255}
                            autoComplete="email"
                            required
                        />
                    </label>

                    <label className="form-field">
                        <span>Password</span>
                        <input
                            type="password"
                            value={password}
                            onChange={(event) => setPassword(event.target.value)}
                            placeholder="Create a password"
                            minLength={8}
                            maxLength={72}
                            autoComplete="new-password"
                            required
                        />
                    </label>

                    <label className="form-field">
                        <span>Confirm password</span>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(event) => setConfirmPassword(event.target.value)}
                            placeholder="Confirm your password"
                            autoComplete="new-password"
                            required
                        />
                    </label>

                    {error && <p className="form-error" role="alert">{error}</p>}
                    {success && <p role="status">{success}</p>}

                    <button
                        className="primary-button login-submit"
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? 'Creating account…' : 'Create account'}
                    </button>
                </form>

                <p className="auth-switch">
                    Already have an account?{' '}
                    <button type="button" onClick={onSwitchToLogin}>
                        Sign in
                    </button>
                </p>
            </section>
        </div>
    );
}
