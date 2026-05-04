'use client'; 
import { useState } from 'react'; 
import styles from './login.module.css';
import { login } from '../services/authService'; 

export default function Login() {

    const [email, setEmail] = useState(''); 
    const [password, setPassword] = useState(''); 
    const [error, setError] = useState(''); 
    const [isLoading, setIsLoading] = useState(false); 


    const handleLogin = async (e) => {
        e.preventDefault(); 
        setIsLoading(true); 
        setError(''); 

        const result = await login(email, password); 

        setIsLoading(false); // Hide the loader.

        if (result.success) {
            alert('Login successful!'); // Notify the user about success.
            // Optionally, navigate to a dashboard page.
        } else {
            setError(result.message); // Show the error message from the backend.
        }
    };
 
    return (
        <main>
            <div className={styles.login}>
                <div className={styles.loginCard}>
                    <label className={styles.headLabel}>Sign In</label>

                    {error && <p className={styles.error}>{error}</p>} {/* Display errors dynamically */}

                    <form onSubmit={handleLogin}>
                        <div>
                            <label className={styles.inputLabel}>Email</label>
                            <div></div>
                            <input
                                type="email"
                                placeholder="example@domain.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)} // Update email state.
                                required
                            />
                        </div>

                        <div className={styles.passwordContainer}>
                            <label>Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)} // Update password state.
                                required
                            />
                        </div>

                       <div>
                       <center><button type="submit" disabled={isLoading}>
                            {isLoading ? 'Signing In...' : 'Sign In'} 
                        </button></center>
                       </div>
                    </form>
                </div>
            </div>
        </main>
    );
}
