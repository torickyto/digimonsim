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
    createParticles();
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

  const createParticles = () => {
    const particlesContainer = document.querySelector('.particles');
    if (particlesContainer) {
      for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.top = `${Math.random() * 100}%`;
        particle.style.width = `${Math.random() * 3 + 1}px`;
        particle.style.height = particle.style.width;
        particle.style.animationDuration = `${Math.random() * 10 + 5}s`;
        particle.style.animationDelay = `${Math.random() * 5}s`;
        particlesContainer.appendChild(particle);
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-visual">
        <div className="dynamic-background"></div>
        <div className="particles"></div>
        <img src={digimonQuestLogo} alt="DigimonQuest Logo" className="auth-logo" />
      </div>
      <div className="auth-form-container">
        <div className="grid-background"></div>
        <form onSubmit={handleSubmit} className="auth-form">
          <h2>{isSignUp ? 'Create Tamer Profile' : 'Login'}</h2>
          <div className="input-group">
            <input
              type="email"
              placeholder="Tamer ID (Email)"
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
            {isLoading ? 'Initializing...' : (isSignUp ? 'Initialize Tamer' : 'CONNECT')}
          </button>
          <button type="button" className="toggle-btn" onClick={() => setIsSignUp(!isSignUp)}>
            {isSignUp ? 'Existing Tamer? Log In' : 'New Tamer? Sign Up'}
          </button>
        </form>
        <div className="auth-footer">
          <p>DigimonQuest v2.1 | Venture into the Digital Realm</p>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;