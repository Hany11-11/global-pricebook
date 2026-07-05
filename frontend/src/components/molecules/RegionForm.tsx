import { useState } from 'react';
import Button from '../atoms/Button';
import Input from '../atoms/Input';

interface RegionFormProps {
  initial?: { id?: string; name: string };
  onSave: (data: { id?: string; name: string }) => void;
  onCancel: () => void;
}

export default function RegionForm({ initial, onSave, onCancel }: RegionFormProps) {
  const [name, setName] = useState(initial?.name || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ id: initial?.id, name: name.trim() });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>{initial ? 'Edit Region' : 'Add Region'}</h3>
      <Input label="Region Name" value={name} onChange={(e) => setName(e.target.value)} required />
      <div className="form-actions">
        <Button type="submit">{initial ? 'Update' : 'Save'}</Button>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}
