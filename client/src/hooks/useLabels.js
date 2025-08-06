import { useState, useEffect } from 'react';

function useLabels() {
  const [labels, setLabels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchLabels = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/labels.php');
      if (!response.ok) throw new Error('Failed to fetch labels');
      const data = await response.json();
      setLabels(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const addLabel = async (name, color) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/labels.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, color }),
      });
      if (!response.ok) throw new Error('Failed to create label');
      const result = await response.json();
      if (result.id) {
        const newLabel = { id: result.id, name, color };
        setLabels(prev => [...prev, newLabel]);
        return newLabel;
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateLabel = async (id, name, color) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/labels.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name, color }),
      });
      if (!response.ok) throw new Error('Failed to update label');
      setLabels(prev =>
        prev.map(label => (label.id === id ? { ...label, name, color } : label))
      );
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteLabel = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('http://localhost:8000/labels.php', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `id=${encodeURIComponent(id)}`,
      });
      if (!response.ok) throw new Error('Failed to delete label');
      setLabels(prev => prev.filter(label => label.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabels();
  }, []);

  return {
    labels,
    loading,
    error,
    fetchLabels,
    addLabel,
    updateLabel,
    deleteLabel,
  };
}

export default useLabels;
