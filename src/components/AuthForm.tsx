import React, { useState, useEffect } from 'react';
import { signUp, signIn } from '../auth';
import { getDigimonTemplate } from '../data/DigimonTemplate';
import DigimonSprite from './DigimonSprite';
import { Digimon } from '../shared/types';
import { v4 as uuidv4 } from 'uuid';
import './AuthForm.css';
import { createUniqueDigimon } from '../data/digimon';

interface AuthFormProps {
  onAuthSuccess: (user: any, starterDigimon?: Digimon) => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ onAuthSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedDigimon, setSelectedDigimon] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const starters = ['guilmon', 'agumon', 'veemon', 'impmon'];

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
        if (!selectedDigimon) {
          throw new Error("Please select a starter Digimon");
        }
        const { user, error } = await signUp({ email, password });
        if (error) throw new Error(error);
        if (user) {
          const starterDigimon = createUniqueDigimon(selectedDigimon);
          onAuthSuccess(user, starterDigimon);
        }
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
    const particlesContainer = document.querySelector('.dq-particles');
    if (particlesContainer) {
      for (let i = 0; i < 50; i++) {
        const particle = document.createElement('div');
        particle.classList.add('dq-particle');
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
    <div className="dq-auth-container">
      <div className="dq-auth-visual">
        <div className="dq-dynamic-background"></div>
        <div className="dq-particles"></div>
        <img src={digimonQuestLogo} alt="DigimonQuest Logo" className="dq-auth-logo" />
      </div>
      <div className="dq-auth-form-container">
        <div className="dq-grid-background"></div>
        <form onSubmit={handleSubmit} className="dq-auth-form">
          <h2>{isSignUp ? 'SERVER is INACTIVE' : 'SERVER is INACTIVE'}</h2>
          <div className="dq-input-group">
            <input
              type="email"
              placeholder="Tamer ID (Email)"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="dq-input-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {isSignUp && (
            <div className="dq-digimon-selection">
              <h3>Choose Your Partner</h3>
              <div className="dq-digimon-options">
                {starters.map((digimon) => {
                  const template = getDigimonTemplate(digimon);
                  return (
                    <div
                      key={digimon}
                      className={`dq-digimon-option ${selectedDigimon === digimon ? 'selected' : ''}`}
                      onClick={() => setSelectedDigimon(digimon)}
                    >
                      <DigimonSprite name={digimon} scale={1} />
                      <span>{template?.displayName}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
          {error && <p className="dq-error">{error}</p>}
          <button type="submit" className="dq-submit-btn" disabled={isLoading}>
            {isLoading ? 'Initializing...' : (isSignUp ? 'Initialize Tamer' : 'CONNECT')}
          </button>
          <button type="button" className="dq-toggle-btn" onClick={() => setIsSignUp(!isSignUp)}>
            {isSignUp ? 'Existing Tamer? Sign Up' : 'New Tamer? Log In'}
          </button>
        </form>
        <div className="dq-auth-footer">
          <p>DigimonQuest v0.1</p>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
