import React, { useState, useEffect } from 'react';
import { getResources, getResourceTypes, getSubjects, getUnits } from '../services/resourceService';
import { fetchBranches, fetchSemesters } from '../services/authService';
import ResourceCard from '../components/ResourceCard';

const ExploreResources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  // Dropdown options
  const [branches, setBranches] = useState([]);
  const [semesters, setSemesters] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [units, setUnits] = useState([]);
  const [resourceTypes, setResourceTypes] = useState([]);

  // Selected filters
  const [selectedBranch, setSelectedBranch] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [selectedResourceType, setSelectedResourceType] = useState('');
  const [sort, setSort] = useState('newest');

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadInitialFilterData();
  }, []);

  useEffect(() => {
    loadResources();
  }, [page, sort, selectedBranch, selectedSemester, selectedSubject, selectedUnit, selectedResourceType]);

  const loadInitialFilterData = async () => {
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

  const handleBranchChange = async (e) => {
    const bId = e.target.value;
    setSelectedBranch(bId);
    setSelectedSemester('');
    setSelectedSubject('');
    setSelectedUnit('');
    setSemesters([]);
    setSubjects([]);
    setUnits([]);
    setPage(1);

    if (bId) {
      try {
        const res = await fetchSemesters(bId);
        setSemesters(res.data.semesters || []);
      } catch (err) { console.error(err); }
    }
  };

  const handleSemesterChange = async (e) => {
    const sId = e.target.value;
    setSelectedSemester(sId);
    setSelectedSubject('');
    setSelectedUnit('');
    setSubjects([]);
    setUnits([]);
    setPage(1);

    if (sId) {
      try {
        const res = await getSubjects(sId);
        setSubjects(res.data.subjects || []);
      } catch (err) { console.error(err); }
    }
  };

  const handleSubjectChange = async (e) => {
    const subId = e.target.value;
    setSelectedSubject(subId);
    setSelectedUnit('');
    setUnits([]);
    setPage(1);

    if (subId) {
      try {
        const res = await getUnits(subId);
        setUnits(res.data.units || []);
      } catch (err) { console.error(err); }
    }
  };

  const loadResources = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {
        page,
        limit: 12,
        q: search,
        sort,
        branch_id: selectedBranch || undefined,
        semester_id: selectedSemester || undefined,
        subject_id: selectedSubject || undefined,
        unit_id: selectedUnit || undefined,
        resource_type_id: selectedResourceType || undefined,
      };
      const res = await getResources(params);
      setResources(res.data.data);
      setTotalPages(res.data.pagination.totalPages);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadResources();
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedBranch('');
    setSelectedSemester('');
    setSelectedSubject('');
    setSelectedUnit('');
    setSelectedResourceType('');
    setSort('newest');
    setSemesters([]);
    setSubjects([]);
    setUnits([]);
    setPage(1);
  };

  return (
    <div className="container" style={{ padding: '2rem 1.5rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1>Explore Academic Resources</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.3rem', fontSize: '0.9rem' }}>
          Browse course notes, question papers, and study guides across all engineering branches and semesters.
        </p>
      </div>

      {/* Filter Control Surface */}
      <div className="card" style={{ marginBottom: '1.75rem', padding: '1.25rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
          <input
            type="text"
            placeholder="Search notes, question papers, subjects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn btn-primary">Search</button>
          {(search || selectedBranch || selectedResourceType) && (
            <button type="button" className="btn btn-secondary" onClick={handleResetFilters}>
              Reset Filters
            </button>
          )}
        </form>

        {/* Cascading Filter Controls */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.75rem' }}>
          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>BRANCH</label>
            <select value={selectedBranch} onChange={handleBranchChange} style={{ width: '100%', fontSize: '0.85rem' }}>
              <option value="">All Branches</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.name} ({b.code})</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>SEMESTER</label>
            <select value={selectedSemester} onChange={handleSemesterChange} disabled={!selectedBranch} style={{ width: '100%', fontSize: '0.85rem' }}>
              <option value="">All Semesters</option>
              {semesters.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>SUBJECT</label>
            <select value={selectedSubject} onChange={handleSubjectChange} disabled={!selectedSemester} style={{ width: '100%', fontSize: '0.85rem' }}>
              <option value="">All Subjects</option>
              {subjects.map(s => <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>UNIT</label>
            <select value={selectedUnit} onChange={(e) => { setSelectedUnit(e.target.value); setPage(1); }} disabled={!selectedSubject} style={{ width: '100%', fontSize: '0.85rem' }}>
              <option value="">All Units</option>
              {units.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>TYPE</label>
            <select value={selectedResourceType} onChange={(e) => { setSelectedResourceType(e.target.value); setPage(1); }} style={{ width: '100%', fontSize: '0.85rem' }}>
              <option value="">All Types</option>
              {resourceTypes.map(rt => <option key={rt.id} value={rt.id}>{rt.name}</option>)}
            </select>
          </div>

          <div>
            <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem', fontWeight: 600 }}>SORT BY</label>
            <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }} style={{ width: '100%', fontSize: '0.85rem' }}>
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="downloads">Most Downloaded</option>
              <option value="views">Most Viewed</option>
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '3rem 0', fontSize: '0.9rem' }}>
          Loading resources...
        </p>
      ) : error ? (
        <div className="alert alert-error">{error}</div>
      ) : resources.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <h3 style={{ marginBottom: '0.5rem' }}>No matching resources found</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.25rem', fontSize: '0.88rem' }}>
            Try adjusting your search criteria or clearing selected filters.
          </p>
          <button className="btn btn-secondary" onClick={handleResetFilters}>Reset All Filters</button>
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: '1.25rem' }}>
            {resources.map(res => (
              <ResourceCard key={res.id} resource={res} />
            ))}
          </div>

          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', marginTop: '2rem' }}>
              <button
                className="btn btn-secondary"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                Previous
              </button>
              <span style={{ alignSelf: 'center', color: 'var(--text-muted)', fontSize: '0.88rem' }}>
                Page {page} of {totalPages}
              </span>
              <button
                className="btn btn-secondary"
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default ExploreResources;
