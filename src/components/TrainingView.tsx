import React, { useState, useEffect } from 'react';
import { trainingApi } from '../services/api';
import { TrainingType, TrainingSession } from '../types';
import { Dumbbell, Calendar, Zap, CheckCircle2, Award, Clock } from 'lucide-react';

interface TrainingViewProps {
  currentClubId: string;
}

export const TrainingView: React.FC<TrainingViewProps> = ({ currentClubId }) => {
  const [types, setTypes] = useState<TrainingType[]>([]);
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTypeId, setSelectedTypeId] = useState<string>('');
  const [intensity, setIntensity] = useState<number>(3);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadData();
  }, [currentClubId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [typeList, sessList] = await Promise.all([
        trainingApi.getTypes(),
        trainingApi.getSessions(currentClubId).catch(() => [])
      ]);
      const list = Array.isArray(typeList) ? typeList : [];
      setTypes(list);
      if (list.length > 0) setSelectedTypeId(list[0].id);
      setSessions(Array.isArray(sessList) ? sessList : []);
    } catch (err) {
      console.error('Failed to load training:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTypeId) return;
    try {
      setSubmitting(true);
      setMessage('');
      await trainingApi.scheduleSession({
        club_id: currentClubId,
        training_type_id: selectedTypeId,
        intensity,
        session_date: new Date().toISOString()
      });
      setMessage('Training session scheduled successfully! Squad progression will apply on next match.');
      loadData();
    } catch (err: any) {
      setMessage(err.response?.data?.message || 'Failed to schedule drill.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="view-container">
      <div className="view-header">
        <div>
          <h1 className="view-title flex-center" style={{ gap: '0.75rem' }}>
            <Dumbbell className="text-primary" size={28} />
            Squad Training Ground
          </h1>
          <p className="view-subtitle">Select focus drills, calibrate training intensity, and boost player attributes</p>
        </div>
      </div>

      {message && (
        <div className="alert alert-success mb-4 flex-center" style={{ justifyContent: 'flex-start', gap: '0.5rem' }}>
          <CheckCircle2 size={18} />
          {message}
        </div>
      )}

      <div className="grid-2">
        {/* Schedule Drill Form */}
        <div className="card">
          <h3 className="card-title flex-center" style={{ justifyContent: 'flex-start', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Calendar className="text-warning" size={20} />
            Schedule New Training Session
          </h3>

          <form onSubmit={handleSchedule}>
            <div style={{ marginBottom: '1.25rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600 }}>
                Training Focus Drill
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '0.75rem' }}>
                {types.map((t) => (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTypeId(t.id)}
                    className={`drill-card ${selectedTypeId === t.id ? 'active' : ''}`}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: '0.25rem' }}>{t.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{t.attribute_focus || 'Overall'}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <div className="flex-center" style={{ justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <label style={{ fontSize: '0.875rem', fontWeight: 600 }}>Training Intensity</label>
                <span className="badge badge-primary">{intensity} / 5</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                value={intensity}
                onChange={(e) => setIntensity(Number(e.target.value))}
                style={{ width: '100%' }}
              />
              <div className="flex-center" style={{ justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                <span>Light (Low fatigue)</span>
                <span>Balanced</span>
                <span>Intense (High fatigue & risk)</span>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%' }}
              disabled={submitting || !selectedTypeId}
            >
              {submitting ? 'Scheduling Drill...' : 'Confirm & Schedule Session'}
            </button>
          </form>
        </div>

        {/* Training History */}
        <div className="card">
          <h3 className="card-title flex-center" style={{ justifyContent: 'flex-start', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Clock className="text-primary" size={20} />
            Recent Training History
          </h3>

          {sessions.length === 0 ? (
            <p className="text-muted text-center" style={{ padding: '2rem 0' }}>No previous training sessions on record.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {sessions.slice(0, 8).map((s) => (
                <div key={s.id} className="tx-item">
                  <div className="flex-center" style={{ gap: '0.75rem' }}>
                    <div className="tx-icon" style={{ background: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)' }}>
                      <Zap size={16} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>
                        {s.training_type?.name || 'Drill Session'}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        {new Date(s.session_date).toLocaleDateString()} · Intensity {s.intensity || 3}/5
                      </div>
                    </div>
                  </div>
                  <span className="badge badge-success">Completed</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
