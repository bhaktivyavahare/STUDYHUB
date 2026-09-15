import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import { fetchBranches, fetchSemesters } from '../services/authService';

export const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    roleName: 'STUDENT',
    branchId: '',
    semesterId: '',
  });

  const [branches, setBranches] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, getDashboardRoute } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const loadBranches = async () => {
      try {
        const res = await fetchBranches();
        if (res.data?.branches) setBranches(res.data.branches);
      } catch (err) {
        console.warn('Could not load academic branches:', err.message);
      }
    };
    loadBranches();
  }, []);

  useEffect(() => {
    if (!formData.branchId) { setSemesters([]); return; }
    const loadSemesters = async () => {
      try {
        const res = await fetchSemesters(formData.branchId);
        if (res.data?.semesters) setSemesters(res.data.semesters);
      } catch (err) {
        console.warn('Could not load semesters:', err.message);
      }
    };
    loadSemesters();
  }, [formData.branchId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please check and try again.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await register(formData);
      navigate(getDashboardRoute(user?.role_name));
    } catch (err) {
      setError(err.message || 'Registration failed. Please check your details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'var(--bg-page)', padding: '2rem 1rem' }}>
      <div style={{ width: '100%', maxWidth: '500px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
          <div style={{
            width: 44, height: 44, borderRadius: 10,
            background: 'var(--primary)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 800, fontSize: '1.1rem',
            marginBottom: '1rem'
          }}>SH</div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 700, marginBottom: '0.25rem', color: 'var(--text-main)' }}>Create Your Account</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Join the StudyHub academic community</p>
        </div>

        <div className="card">
          {error && <div className="alert alert-error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Full Name *</label>
              <input
                type="text"
                name="name"
                placeholder="e.g. Alex Johnson"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Email Address *</label>
              <input
                type="email"
                name="email"
                placeholder="you@college.edu"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
              <div className="form-group">
                <label>Account Role *</label>
                <select name="roleName" value={formData.roleName} onChange={handleChange}>
                  <option value="STUDENT">Student</option>
                  <option value="FACULTY">Faculty Member</option>
                </select>
              </div>

              <div className="form-group">
                <label>Academic Branch</label>
                <select name="branchId" value={formData.branchId} onChange={handleChange}>
                  <option value="">Select Branch</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>{b.name} ({b.code})</option>
                  ))}
                </select>
              </div>
            </div>

            {formData.roleName === 'STUDENT' && (
              <div className="form-group">
                <label>Current Semester</label>
                <select
                  name="semesterId"
                  value={formData.semesterId}
                  onChange={handleChange}
                  disabled={!formData.branchId}
                >
                  <option value="">{!formData.branchId ? 'Select Branch First' : 'Select Semester'}</option>
                  {semesters.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
              <div className="form-group">
                <label>Password *</label>
                <input
                  type="password"
                  name="password"
                  placeholder="Min. 6 characters"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Confirm Password *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Repeat password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-block" style={{ marginTop: '1rem' }} disabled={isSubmitting}>
              {isSubmitting ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div style={{ marginTop: '1.25rem', textAlign: 'center', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
