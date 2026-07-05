import { useState, useEffect } from 'react';
import Button from '../atoms/Button';
import Table from '../atoms/Table';
import RegionForm from '../molecules/RegionForm';
import { regionService } from '../../services/regionService';

interface Region {
  id: string;
  name: string;
}

export default function RegionManagement() {
  const [regions, setRegions] = useState<Region[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Region | null>(null);

  useEffect(() => {
    regionService.getAll()
      .then((res) => {
        if (res.data) {
          setRegions(res.data);
        }
      })
      .catch((err) => {
        console.error("Failed to load regions from backend", err);
      });
  }, []);

  const handleSave = (data: { id?: string; name: string }) => {
    const fullData = { ...data } as Region;

    if (data.id) {
      regionService.update(data.id, fullData)
        .then((res) => {
          const saved = res.data;
          setRegions((prev) => prev.map((r) => (r.id === data.id ? saved : r)));
        })
        .catch((err) => {
          console.error("Failed to update region", err);
        });
    } else {
      regionService.create(fullData)
        .then((res) => {
          const saved = res.data;
          setRegions((prev) => [...prev, saved]);
        })
        .catch((err) => {
          console.error("Failed to create region", err);
        });
    }
    setShowForm(false);
    setEditing(null);
  };

  const handleEdit = (region: Region) => {
    setEditing(region);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    regionService.delete(id)
      .then(() => {
        setRegions((prev) => prev.filter((r) => r.id !== id));
      })
      .catch((err) => {
        console.error("Failed to delete region", err);
      });
  };

  const columns = [
    { key: 'id', header: 'ID' },
    { key: 'name', header: 'Region Name' },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: Region) => (
        <div className="table-actions">
          <Button size="sm" variant="secondary" onClick={() => handleEdit(item)}>Edit</Button>
          <Button size="sm" variant="danger" onClick={() => handleDelete(item.id)}>Delete</Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="toolbar">
        <Button size="md" onClick={() => { setEditing(null); setShowForm(true); }}>+ Add Region</Button>
      </div>
      <div className="card">
        <Table columns={columns} data={regions} emptyMessage="No regions found." />
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => { setShowForm(false); setEditing(null); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => { setShowForm(false); setEditing(null); }} aria-label="Close modal">&times;</button>
            <RegionForm initial={editing || undefined} onSave={handleSave} onCancel={() => { setShowForm(false); setEditing(null); }} />
          </div>
        </div>
      )}
    </div>
  );
}
