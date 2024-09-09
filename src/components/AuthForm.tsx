import React, { useState, useEffect } from 'react';
import { signUp, signIn } from '../auth';
import './AuthForm.css';

interface AuthFormProps {
  onAuthSuccess: (user: any) => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onAuthSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    document.body.classList.add('auth-body');
    return () => {
      document.body.classList.remove('auth-body');
    };
  }, []);

  const digimonQuestLogo = require('../assets/images/digimonquest.png');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (isSignUp) {
        const { user, error } = await signUp({ email, password });
        if (error) throw new Error(error);
        if (user) onAuthSuccess(user);
      } else {
        const { user, error } = await signIn(email, password);
        if (error) throw new Error(error);
        if (user) onAuthSuccess(user);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-background"></div>
      <div className="auth-content">
        <img src={digimonQuestLogo} alt="DigimonQuest Logo" className="auth-logo" />
        <form onSubmit={handleSubmit} className="auth-form">
          <h2>{isSignUp ? 'prodigious!' : 'momentai!'}</h2>
          <div className="input-group">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && <p className="error">{error}</p>}
          <button type="submit" className="submit-btn" disabled={isLoading}>
            {isLoading ? 'Loading...' : (isSignUp ? 'Embark' : 'Login')}
          </button>
          <button type="button" className="toggle-btn" onClick={() => setIsSignUp(!isSignUp)}>
            {isSignUp ? 'Already a Tamer? Sign In' : 'New Tamer? Sign Up'}
          </button>
        </form>
      </div>
      <div className="auth-footer">
        <p>&copy; 2024 DigimonQuest. All rights reserved.</p>
      </div>
    </div>
  );
};

export default AuthForm;