import React, { useState, useEffect } from 'react';
import { authApi } from '../services/auth.service';
import { clubsApi } from '../services/clubs.service';
import { Club } from '../types';
import { Shield, User, Lock, Mail, Search, CheckCircle } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (token: string, user: any, club: Club | null) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('manager1');
  const [password, setPassword] = useState('secret123');
  const [email, setEmail] = useState('manager1@fc.com');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Claim club step if manager has no club
  const [step, setStep] = useState<'auth' | 'claim'>('auth');
  const [authToken, setAuthToken] = useState('');
  const [authUser, setAuthUser] = useState<any>(null);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [clubSearch, setClubSearch] = useState('');
  const [selectedClubId, setSelectedClubId] = useState<string>('');
  const [claiming, setClaiming] = useState(false);

  useEffect(() => {
    if (step === 'claim') {
      loadPopularClubs();
    }
  }, [step]);

  if (!isOpen) return null;

  const loadPopularClubs = async (search?: string) => {
    try {
      const data = await clubsApi.getClubs(1, 15, search);
      const list = data.items || (Array.isArray(data) ? data : []);
      setClubs(list);
      if (list.length > 0 && !selectedClubId) {
        setSelectedClubId(list[0].id);
      }
    } catch (err) {
      console.error('Failed to load clubs:', err);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let res;
      if (isRegister) {
        res = await authApi.register(username, email, password);
      } else {
        res = await authApi.login(username, password);
      }

      const token = res.access_token || res.token;
      if (!token) throw new Error('No authentication token returned.');
      localStorage.setItem('fc_token', token);
      setAuthToken(token);
      setAuthUser(res.user);

      // Check if user has an assigned club
      try {
        const myClub = await clubsApi.getMyClub();
        if (myClub && myClub.id) {
          onSuccess(token, res.user, myClub);
          onClose();
          return;
        }
      } catch (e) {
        // No club claimed yet
      }

      setStep('claim');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleClaimClub = async () => {
    if (!selectedClubId) return;
    try {
      setClaiming(true);
      setError('');
      await clubsApi.claimClub(selectedClubId);
      const claimedClub = await clubsApi.getClubById(selectedClubId);
      onSuccess(authToken, authUser, claimedClub);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to claim club.');
    } finally {
      setClaiming(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 480 }}>
        {step === 'auth' ? (
          <div>
            <div className="text-center mb-4">
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>⚽</div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-bright)' }}>
                {isRegister ? 'Register Manager License' : 'Manager Log In'}
              </h2>
              <p className="text-muted" style={{ fontSize: '0.85rem' }}>
                {isRegister ? 'Create your official manager profile' : 'Sign in to access your squad, club treasury & fixtures'}
              </p>
            </div>

            {error && (
              <div className="alert alert-danger mb-4" style={{ fontSize: '0.85rem' }}>
                {error}
              </div>
            )}

            <form onSubmit={handleAuthSubmit}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>Username</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
                  <input
                    type="text"
                    className="input-text"
                    style={{ width: '100%', paddingLeft: 36 }}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
              </div>

              {isRegister && (
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>Email</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
                    <input
                      type="email"
                      className="input-text"
                      style={{ width: '100%', paddingLeft: 36 }}
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
              )}

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, marginBottom: '0.35rem' }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
                  <input
                    type="password"
                    className="input-text"
                    style={{ width: '100%', paddingLeft: 36 }}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', padding: '0.75rem', fontWeight: 700 }}
                disabled={loading}
              >
                {loading ? 'Authenticating...' : isRegister ? 'Register & Continue' : 'Sign In'}
              </button>
            </form>

            <div className="text-center mt-4" style={{ fontSize: '0.85rem' }}>
              <button
                type="button"
                className="btn-link"
                style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer' }}
                onClick={() => setIsRegister(!isRegister)}
              >
                {isRegister ? 'Already registered? Sign In instead' : "Don't have an account? Register now"}
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="text-center mb-4">
              <Shield className="text-primary" size={40} style={{ margin: '0 auto 0.5rem auto' }} />
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-bright)' }}>
                Claim Your Club Contract
              </h2>
              <p className="text-muted" style={{ fontSize: '0.85rem' }}>
                Select a club to begin your managerial career
              </p>
            </div>

            {error && (
              <div className="alert alert-danger mb-4" style={{ fontSize: '0.85rem' }}>
                {error}
              </div>
            )}

            <div style={{ marginBottom: '1rem', position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }} />
              <input
                type="text"
                className="input-text"
                placeholder="Filter 17,000+ clubs by name..."
                style={{ width: '100%', paddingLeft: 36 }}
                value={clubSearch}
                onChange={(e) => {
                  setClubSearch(e.target.value);
                  loadPopularClubs(e.target.value);
                }}
              />
            </div>

            <div style={{ maxHeight: 260, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.5rem' }}>
              {clubs.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSelectedClubId(c.id)}
                  style={{
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    background: selectedClubId === c.id ? 'rgba(59, 130, 246, 0.2)' : 'rgba(255,255,255,0.03)',
                    border: selectedClubId === c.id ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  <div className="flex-center" style={{ gap: '0.75rem' }}>
                    <span style={{ fontSize: '1.25rem' }}>⚽</span>
                    <div>
                      <div style={{ fontWeight: 600, color: 'var(--text-bright)' }}>{c.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {c.city || 'Europe'} · Rep: {c.reputation}
                      </div>
                    </div>
                  </div>
                  {selectedClubId === c.id && <CheckCircle size={18} className="text-primary" />}
                </div>
              ))}
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%', padding: '0.75rem', fontWeight: 700 }}
              disabled={claiming || !selectedClubId}
              onClick={handleClaimClub}
            >
              {claiming ? 'Signing Contract...' : 'Sign as Head Coach'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
