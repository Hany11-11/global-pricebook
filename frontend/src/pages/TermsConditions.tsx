import { useState, useEffect } from 'react';
import Button from '../components/atoms/Button';
import Table from '../components/atoms/Table';
import TermForm from '../components/molecules/TermForm';
import { termService, type TermData } from '../services/termService';
import '../styles/terms.css';

export default function TermsConditions() {
  const [terms, setTerms] = useState<TermData[]>([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<TermData | null>(null);

  useEffect(() => {
    loadTerms();
  }, []);

  const loadTerms = () => {
    setLoading(true);
    termService.getAll()
      .then((res) => {
        if (res.data) {
          setTerms(res.data);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch terms from backend", err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleSave = (data: TermData) => {
    if (data.id) {
      termService.update(data.id, data)
        .then((res) => {
          const saved = res.data;
          setTerms((prev) => prev.map((t) => (t.id === data.id ? saved : t)));
        })
        .catch((err) => {
          console.error("Failed to update term", err);
        });
    } else {
      termService.create(data)
        .then((res) => {
          const saved = res.data;
          setTerms((prev) => [...prev, saved]);
        })
        .catch((err) => {
          console.error("Failed to create term", err);
        });
    }
    setShowForm(false);
    setEditing(null);
  };

  const handleDelete = (id: string | number) => {
    termService.delete(id)
      .then(() => {
        setTerms((prev) => prev.filter((t) => t.id !== id));
      })
      .catch((err) => {
        console.error("Failed to delete term", err);
      });
  };

  const columns: {
    key: string;
    header: string;
    render?: (item: TermData) => React.ReactNode;
  }[] = [
    { key: 'id', header: 'ID' },
    {
      key: 'ruleType',
      header: 'Rule Type',
      render: (item: TermData) => (
        <span className="badge-rule">
          {item.ruleType?.replace('_', ' ')}
        </span>
      )
    },
    { key: 'content', header: 'Description / Note' },
    {
      key: 'thresholdValue',
      header: 'Threshold',
      render: (item: TermData) => (
        item.thresholdValue ? `${item.thresholdValue} KM` : 'N/A'
      )
    },
    {
      key: 'chargeValue',
      header: 'Rate / Multiplier',
      render: (item: TermData) => {
        if (item.chargeValue === undefined || item.chargeValue === null || item.chargeValue === 0) return 'N/A';
        if (item.ruleType === 'PERCENTAGE_SURCHARGE') {
          return `${(item.chargeValue * 100).toFixed(0)}%`;
        }
        if (item.ruleType?.startsWith('MULTIPLIER_')) {
          return `${item.chargeValue}x`;
        }
        return `$${item.chargeValue.toFixed(2)}`;
      }
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (item: TermData) => (
        <div className="table-actions">
          <Button size="sm" variant="secondary" onClick={() => { setEditing(item); setShowForm(true); }}>Edit</Button>
          {item.id && <Button size="sm" variant="danger" onClick={() => handleDelete(item.id!)}>Delete</Button>}
        </div>
      ),
    },
  ];

  return (
    <div>
      <div className="page-header">
        <h1>Terms & Conditions</h1>
        <p>Manage pricing rules, distance thresholds, and informational clauses.</p>
      </div>

      <div className="page-content">
        <div className="toolbar" style={{ marginBottom: '16px' }}>
          <Button size="md" onClick={() => { setEditing(null); setShowForm(true); }}>+ Add Term</Button>
        </div>

        {loading ? (
          <div className="card text-center" style={{ padding: '40px' }}>
            <p>Loading terms and rules...</p>
          </div>
        ) : (
          <div className="card">
            <Table columns={columns} data={terms} emptyMessage="No terms or conditions configured." />
          </div>
        )}
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => { setShowForm(false); setEditing(null); }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => { setShowForm(false); setEditing(null); }} aria-label="Close modal">&times;</button>
            <TermForm initial={editing || undefined} onSave={handleSave} onCancel={() => { setShowForm(false); setEditing(null); }} />
          </div>
        </div>
      )}
    </div>
  );
}
