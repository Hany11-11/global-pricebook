import Input from '../atoms/Input';

const DISPATCH_FIELDS = ['9x5x4', '24x7x4', 'SBD', 'NBD', '2BD', '3BD', 'Additional Hour Rate'];
const IMAC_FIELDS = ['2BD', '3BD', '4BD'];
const FULL_DAY_LEVELS = ['L1', 'L2', 'L3'];
const PROJECT_LEVELS = ['L1', 'L2', 'L3', 'L4', 'L5'];

interface DispatchRatesFormProps {
  type: 'full-day' | 'half-day' | 'dispatch' | 'imac' | 'short-term' | 'long-term';
  data: Record<string, string>;
  onChange: (field: string, value: string) => void;
  onBlur?: () => void;
}

export default function DispatchRatesForm({ type, data, onChange, onBlur }: DispatchRatesFormProps) {
  const titles: Record<string, string> = {
    'full-day': '2. Full Day Visit',
    'half-day': '3. Half Day Visit',
    'dispatch': '4. Dispatch Rates',
    'imac': '5. IMAC Dispatch',
    'short-term': '6. Short-Term Projects',
    'long-term': '7. Long-Term Projects',
  };

  const fields = type === 'dispatch' ? DISPATCH_FIELDS
    : type === 'imac' ? IMAC_FIELDS
    : (type === 'full-day' || type === 'half-day') ? FULL_DAY_LEVELS
    : PROJECT_LEVELS;

  return (
    <div className="pricebook-section">
      <h3>{titles[type]}</h3>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th className="col-field">{type === 'dispatch' || type === 'imac' ? 'Field' : 'Level'}</th>
              <th>Rate</th>
            </tr>
          </thead>
          <tbody>
            {fields.map((field) => {
              const isDisabled =
                type === 'half-day' ||
                type === 'short-term' ||
                type === 'long-term' ||
                (type === 'full-day' && field === 'L3') ||
                (type === 'dispatch' && !['SBD', 'Additional Hour Rate'].includes(field)) ||
                (type === 'imac' && field !== '2BD');

              return (
                <tr key={field}>
                  <td className="level-label">{field}</td>
                  <td className="input-cell">
                    {isDisabled ? (
                      <span className="autogen-value">
                        {data[field] ? Number(data[field]).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '—'}
                      </span>
                    ) : (
                      <Input
                        type="number"
                        value={data[field] || ''}
                        onChange={(e) => onChange(field, e.target.value)}
                        placeholder="Enter rate"
                        onBlur={onBlur}
                      />
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
