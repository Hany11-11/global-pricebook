import Input from '../atoms/Input';

const LEVELS = ['L1', 'L2', 'L3', 'L4', 'L5'];

interface YearlyRatesFormProps {
  rates: Record<string, { withBackfill: string; withoutBackfill: string }>;
  onChange: (level: string, field: 'withBackfill' | 'withoutBackfill', value: string) => void;
  onBlur?: () => void;
}

export default function YearlyRatesForm({ rates, onChange, onBlur }: YearlyRatesFormProps) {
  return (
    <div className="pricebook-section">
      <h3>1. Yearly Rates</h3>
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th className="col-level">Level</th>
              <th>With Backfill</th>
              <th>Without Backfill</th>
            </tr>
          </thead>
          <tbody>
            {LEVELS.map((level) => (
              <tr key={level}>
                <td className="level-label">{level}</td>
                <td className="input-cell">
                  {level === 'L1' ? (
                    <Input
                      type="number"
                      value={rates[level]?.withBackfill || ''}
                      onChange={(e) => onChange(level, 'withBackfill', e.target.value)}
                      placeholder="Enter rate"
                      onBlur={onBlur}
                    />
                  ) : (
                    <span className="autogen-value">
                      {rates[level]?.withBackfill ? Number(rates[level].withBackfill).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '—'}
                    </span>
                  )}
                </td>
                <td className="input-cell">
                  <span className="autogen-value">
                    {rates[level]?.withoutBackfill ? Number(rates[level].withoutBackfill).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '—'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
