import { useState, useEffect } from 'react';
import Button from '../atoms/Button';
import Table from '../atoms/Table';
import CountryForm from '../molecules/CountryForm';
import { countryService } from '../../services/countryService';
import { regionService } from '../../services/regionService';

interface Country {
  id: string;
  name: string;
  code: string;
  currency: string;
  currencySymbol: string;
  region: string;
  status: string;
}

export default function CountryManagement() {
  const [countries, setCountries] = useState<Country[]>([]);
  const [regionOptions, setRegionOptions] = useState<{ value: string; label: string }[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Country | null>(null);

  useEffect(() => {
    countryService.getAll()
      .then((res) => {
        if (res.data) {
          setCountries(res.data);
        }
      })
      .catch((err) => {
        console.error("Failed to load countries from backend", err);
      });

    regionService.getAll()
      .then((res) => {
        if (res.data) {
          const mapped = res.data.map((r: any) => ({ value: r.name, label: r.name }));
          setRegionOptions(mapped);
        }
      })
      .catch((err) => {
        console.error("Failed to load regions from backend", err);
      });
  }, []);

  const handleSave = (data: {
    id?: string;
    name: string;
    code?: string;
    currency: string;
    currencySymbol: string;
    region: string;
    status?: string;
  }) => {
    const code = data.code || data.name.substring(0, 2).toUpperCase();
    const status = data.status || 'Active';
    const fullData = { ...data, code, status } as Country;

    if (data.id) {
      countryService.update(data.id, fullData)
        .then((res) => {
          const saved = res.data;
          setCountries((prev) => prev.map((c) => (c.id === data.id ? saved : c)));
        })
        .catch((err) => {
          console.error("Failed to update country", err);
        });
    } else {
      countryService.create(fullData)
        .then((res) => {
          const saved = res.data;
          setCountries((prev) => [...prev, saved]);
        })
        .catch((err) => {
          console.error("Failed to create country", err);
        });
    }
    setShowForm(false);
    setEditing(null);
  };

  const handleDelete = (id: string) => {
    countryService.delete(id)
      .then(() => {
        setCountries((prev) => prev.filter((c) => c.id !== id));
      })
      .catch((err) => {
        console.error("Failed to delete country", err);
      });
  };

  const columns = [
    { key: 'id', header: 'ID' },
    { key: 'region', header: 'Region' },
    { key: 'name', header: 'Country Name' },
    { key: 'currency', header: 'Currency' },
    { key: 'currencySymbol', header: 'Symbol' },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: Country) => (
        <div className="table-actions">
          <Button size="sm" variant="secondary" onClick={() => { setEditing(item); setShowForm(true); }}>Edit</Button>
          <Button size="sm" variant="danger" onClick={() => handleDelete(item.id)}>Delete</Button>
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="toolbar">
        <Button size="md" onClick={() => { setEditing(null); setShowForm(true); }}>+ Add Country</Button>
      </div>
      <div className="card">
        <Table columns={columns} data={countries} emptyMessage="No countries found." />
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => { setShowForm(false); setEditing(null); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => { setShowForm(false); setEditing(null); }} aria-label="Close modal">&times;</button>
            <CountryForm
              initial={editing || undefined}
              regionOptions={regionOptions}
              onSave={handleSave}
              onCancel={() => { setShowForm(false); setEditing(null); }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
