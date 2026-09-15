import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadResource, getResourceTypes, getSubjects, getUnits } from '../services/resourceService';
import { fetchBranches, fetchSemesters } from '../services/authService';
import { useAuth } from '../hooks/useAuth';

const UploadResource = () => {
  const { user, getDashboardRoute } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    branch_id: '',
    semester_id: '',
    subject_id: '',
    unit_id: '',
    resource_type_id: '',
    tags: ''
  });

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Options
  const [branches, setBranches] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [units, setUnits] = useState([]);
  const [resourceTypes, setResourceTypes] = useState([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [branchesRes, typesRes] = await Promise.all([
        fetchBranches(),
        getResourceTypes()
      ]);
      setBranches(branchesRes.data.branches || []);
      setResourceTypes(typesRes.data.resourceTypes || []);
    } catch (err) {
      console.error(err);
    }
  };

  const handleChange = async (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'branch_id') {
      setSemesters([]);
      setSubjects([]);
      setUnits([]);
      setFormData(prev => ({ ...prev, semester_id: '', subject_id: '', unit_id: '' }));
      if (value) {
        try {
          const res = await fetchSemesters(value);
          setSemesters(res.data.semesters || []);
        } catch (err) { console.error(err); }
      }
    } else if (name === 'semester_id') {
      setSubjects([]);
      setUnits([]);
      setFormData(prev => ({ ...prev, subject_id: '', unit_id: '' }));
      if (value) {
        try {
          const res = await getSubjects(value);
          setSubjects(res.data.subjects || []);
        } catch (err) { console.error(err); }
      }
    } else if (name === 'subject_id') {
      setUnits([]);
      setFormData(prev => ({ ...prev, unit_id: '' }));
      if (value) {
        try {
          const res = await getUnits(value);
          setUnits(res.data.units || []);
        } catch (err) { console.error(err); }
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const selected = e.target.files[0];
      if (selected.size > 50 * 1024 * 1024) {
        setError("File size exceeds maximum limit of 50MB.");
        return;
      }
      setFile(selected);
      setError(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError("Please attach a file before submitting.");
      return;
    }

    setLoading(true);
    setError(null);

    const data = new FormData();
    data.append('file', file);
    Object.keys(formData).forEach(key => {
      if (formData[key]) data.append(key, formData[key]);
    });

    try {
      await uploadResource(data);
      alert("Resource uploaded successfully! It is pending verification.");
      navigate(getDashboardRoute(user?.role_name));
    } catch (err) {
      setError(err.message || 'Failed to upload resource');
    } finally {
      setLoading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '';
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="container" style={{ padding: '2rem 1.5rem', maxWidth: '760px', margin: '0 auto' }}>
      <div style={{ marginBottom: '1.75rem' }}>
        <h1>Upload Resource</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.3rem', fontSize: '0.9rem' }}>
          Share notes, previous year question papers, or lab manuals with your peers.
        </p>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {/* Step Indicator */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.25rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
        <button
          type="button"
          onClick={() => setStep(1)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontWeight: 600, fontSize: '0.88rem',
            color: step === 1 ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: step === 1 ? '2px solid var(--primary)' : 'none',
            paddingBottom: '0.5rem'
          }}
        >
          1. Academic Information
        </button>
        <button
          type="button"
          onClick={() => { if (formData.title && formData.subject_id && formData.resource_type_id) setStep(2); }}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontWeight: 600, fontSize: '0.88rem',
            color: step === 2 ? 'var(--primary)' : 'var(--text-muted)',
            borderBottom: step === 2 ? '2px solid var(--primary)' : 'none',
            paddingBottom: '0.5rem'
          }}
        >
          2. Attach File & Review
        </button>
      </div>

      <form onSubmit={handleSubmit} className="card">
        {step === 1 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label>Resource Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="e.g. Unit 3 DBMS Normalization Lecture Notes"
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows="3"
                placeholder="Briefly describe the contents of this document..."
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
              <div className="form-group">
                <label>Branch *</label>
                <select name="branch_id" value={formData.branch_id} onChange={handleChange} required>
                  <option value="">Select Branch</option>
                  {branches.map(b => <option key={b.id} value={b.id}>{b.name} ({b.code})</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>Semester *</label>
                <select name="semester_id" value={formData.semester_id} onChange={handleChange} required disabled={!formData.branch_id}>
                  <option value="">Select Semester</option>
                  {semesters.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>Subject *</label>
                <select name="subject_id" value={formData.subject_id} onChange={handleChange} required disabled={!formData.semester_id}>
                  <option value="">Select Subject</option>
                  {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>Unit (Optional)</label>
                <select name="unit_id" value={formData.unit_id} onChange={handleChange} disabled={!formData.subject_id}>
                  <option value="">Select Unit</option>
                  {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
              <div className="form-group">
                <label>Resource Type *</label>
                <select name="resource_type_id" value={formData.resource_type_id} onChange={handleChange} required>
                  <option value="">Select Type</option>
                  {resourceTypes.map(rt => <option key={rt.id} value={rt.id}>{rt.name}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>Tags (Comma separated)</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="e.g. Midterm, SQL, Normalization"
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  if (!formData.title || !formData.branch_id || !formData.semester_id || !formData.subject_id || !formData.resource_type_id) {
                    setError("Please fill in all required fields marked with *");
                    return;
                  }
                  setError(null);
                  setStep(2);
                }}
              >
                Next: Attach File
              </button>
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div className="form-group">
              <label>Select File *</label>
              <div style={{
                border: '1px dashed var(--border-strong)',
                borderRadius: 'var(--radius-md)',
                padding: '1.75rem 1rem',
                textAlign: 'center',
                background: '#f8fafc',
                position: 'relative'
              }}>
                <p style={{ fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.25rem', fontSize: '0.9rem' }}>
                  Choose document file to upload
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-subtle)', marginBottom: '0.85rem' }}>
                  Accepted Formats: PDF, DOC, DOCX, PPT, PPTX (Max 50MB)
                </p>

                <input
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.ppt,.pptx"
                  style={{ cursor: 'pointer', opacity: 0, position: 'absolute', inset: 0, width: '100%', height: '100%' }}
                />

                <button type="button" className="btn btn-secondary" style={{ pointerEvents: 'none', padding: '0.4rem 0.85rem', fontSize: '0.82rem' }}>
                  Browse Local Files
                </button>
              </div>
            </div>

            {file && (
              <div style={{
                background: '#eff6ff',
                border: '1px solid #bfdbfe',
                padding: '0.85rem 1rem',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.88rem', color: 'var(--text-main)' }}>{file.name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                    {formatFileSize(file.size)} • {file.type || 'Document'}
                  </div>
                </div>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setFile(null)}
                  style={{ padding: '0.25rem 0.55rem', fontSize: '0.78rem', color: 'var(--danger)' }}
                >
                  Remove
                </button>
              </div>
            )}

            <div style={{ background: '#f8fafc', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                Summary Confirmation
              </div>
              <div style={{ fontSize: '0.88rem', color: 'var(--text-main)', fontWeight: 600 }}>{formData.title}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                {branches.find(b => b.id == formData.branch_id)?.name} • {semesters.find(s => s.id == formData.semester_id)?.name} • {subjects.find(sub => sub.id == formData.subject_id)?.name}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setStep(1)}>
                Back to Details
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading || !file}>
                {loading ? 'Uploading File...' : 'Upload Resource'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
};

export default UploadResource;
