import { useState } from 'react';
import Button from '../atoms/Button';
import Input from '../atoms/Input';
import Select from '../atoms/Select';

interface CountryFormData {
  id?: string;
  name: string;
  code?: string;
  currency: string;
  currencySymbol: string;
  region: string;
  status?: string;
}

interface CountryFormProps {
  initial?: CountryFormData;
  regionOptions: { value: string; label: string }[];
  onSave: (data: CountryFormData) => void;
  onCancel: () => void;
}

function defaultForm(initial?: CountryFormData, regionOptions?: { value: string; label: string }[]): CountryFormData {
  const defaultRegion = initial?.region || regionOptions?.[0]?.value || '';
  return initial || { name: '', currency: '', currencySymbol: '', region: defaultRegion };
}

export default function CountryForm({ initial, regionOptions, onSave, onCancel }: CountryFormProps) {
  const [form, setForm] = useState<CountryFormData>(defaultForm(initial, regionOptions));

  const update = (field: keyof CountryFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSave({ ...form, id: initial?.id });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>{initial ? 'Edit Country' : 'Add Country'}</h3>
      <div className="form-row">
        <Select label="Region" options={regionOptions} value={form.region} onChange={(e) => update('region', e.target.value)} />
        <Input label="Country Name" value={form.name} onChange={(e) => update('name', e.target.value)} required />
      </div>
      <div className="form-row">
        <Input label="Currency" value={form.currency} onChange={(e) => update('currency', e.target.value)} required />
        <Input label="Currency Symbol" value={form.currencySymbol} onChange={(e) => update('currencySymbol', e.target.value)} required maxLength={5} />
      </div>
      <div className="form-actions">
        <Button type="submit">{initial ? 'Update' : 'Save'}</Button>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
}
