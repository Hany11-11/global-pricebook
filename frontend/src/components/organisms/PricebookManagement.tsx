import { useState, useEffect } from 'react';
import Select from '../atoms/Select';
import Button from '../atoms/Button';
import YearlyRatesForm from '../molecules/YearlyRatesForm';
import DispatchRatesForm from '../molecules/DispatchRatesForm';
import { countryService } from '../../services/countryService';
import { regionService } from '../../services/regionService';
import { pricebookService } from '../../services/pricebookService';
import '../../styles/pricebooks.css';


const SERVICES = [
  { id: 'yearly-rates', name: 'Yearly Rates', icon: '📅' },
  { id: 'full-day', name: 'Full Day Visit', icon: '📆' },
  { id: 'half-day', name: 'Half Day Visit', icon: '⏱️' },
  { id: 'dispatch', name: 'Dispatch Rates', icon: '🚗' },
  { id: 'imac', name: 'IMAC Dispatch', icon: '🛠️' },
  { id: 'short-term', name: 'Short-Term Projects', icon: '📋' },
  { id: 'long-term', name: 'Long-Term Projects', icon: '🏢' },
];

interface AlertState {
  type: 'success' | 'error';
  message: string;
}

export default function PricebookManagement() {
  const [regions, setRegions] = useState<string[]>([]);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [allCountries, setAllCountries] = useState<{ value: string; label: string; region: string }[]>([]);
  const [selectedCountry, setSelectedCountry] = useState('');
  const [activeService, setActiveService] = useState('yearly-rates');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<AlertState | null>(null);

  // Pricebook form states
  const [yearlyRates, setYearlyRates] = useState<Record<string, { withBackfill: string; withoutBackfill: string }>>({});
  const [fullDay, setFullDay] = useState<Record<string, string>>({});
  const [halfDay, setHalfDay] = useState<Record<string, string>>({});
  const [dispatchRates, setDispatchRates] = useState<Record<string, string>>({});
  const [imacRates, setImacRates] = useState<Record<string, string>>({});
  const [shortTerm, setShortTerm] = useState<Record<string, string>>({});
  const [longTerm, setLongTerm] = useState<Record<string, string>>({});

  useEffect(() => {
    Promise.all([
      regionService.getAll(),
      countryService.getAll()
    ])
      .then(([regionRes, countryRes]) => {
        if (regionRes.data && regionRes.data.length > 0) {
          const regionNames = regionRes.data.map((r: any) => r.name || r);
          setRegions(regionNames);
        }
        if (countryRes.data && countryRes.data.length > 0) {
          setAllCountries(countryRes.data.map((c: any) => ({
            value: String(c.id),
            label: c.name,
            region: c.region || ''
          })));
        } else {
          setAllCountries([]);
        }
      })
      .catch((err) => {
        console.error("Failed to load regions/countries from backend", err);
      });
  }, []);

  const filteredCountries = selectedRegion
    ? allCountries.filter((c) => c.region === selectedRegion)
    : allCountries;

  useEffect(() => {
    if (selectedCountry) {
      loadPricebook(selectedCountry);
    }
  }, [selectedCountry]);

  useEffect(() => {
    const l1Backfill = yearlyRates['L1']?.withBackfill;
    const fdL1 = fullDay['L1'];
    const fdL2 = fullDay['L2'];
    const sbd = dispatchRates['SBD'];
    const addHour = dispatchRates['Additional Hour Rate'];
    const imac2bd = imacRates['2BD'];

    if (!l1Backfill && !fdL1 && !fdL2 && !sbd && !addHour && !imac2bd) {
      return;
    }

    const timer = setTimeout(() => {
      const savedYearlyRates = Object.entries(yearlyRates).map(([level, rates]) => ({
        level,
        withBackfill: parseFloat(rates.withBackfill) || 0,
        withoutBackfill: parseFloat(rates.withoutBackfill) || 0,
      }));

      if (l1Backfill && !savedYearlyRates.some(r => r.level === 'L1')) {
        savedYearlyRates.push({
          level: 'L1',
          withBackfill: parseFloat(l1Backfill) || 0,
          withoutBackfill: 0
        });
      }

      const mapToNumberRecord = (stateObj: Record<string, string>) => {
        const record: Record<string, number> = {};
        Object.entries(stateObj).forEach(([k, v]) => {
          if (v !== '') {
            record[k] = parseFloat(v) || 0;
          }
        });
        return record;
      };

      const payload = {
        countryId: Number(selectedCountry) || 0,
        yearlyRates: savedYearlyRates,
        fullDayVisit: mapToNumberRecord(fullDay),
        halfDayVisit: mapToNumberRecord(halfDay),
        dispatchRates: mapToNumberRecord(dispatchRates),
        imacDispatch: mapToNumberRecord(imacRates),
        shortTermProjects: mapToNumberRecord(shortTerm),
        longTermProjects: mapToNumberRecord(longTerm),
      };

      pricebookService.calculateRates(payload)
        .then((res) => {
          if (res.data) {
            applyPricebookData(res.data, true);
          }
        })
        .catch((err) => {
          console.error("Auto calculation failed", err);
        });
    }, 400);

    return () => clearTimeout(timer);
  }, [
    yearlyRates['L1']?.withBackfill,
    fullDay['L1'],
    fullDay['L2'],
    dispatchRates['SBD'],
    dispatchRates['Additional Hour Rate'],
    imacRates['2BD']
  ]);

  const loadPricebook = (countryId: string) => {
    setLoading(true);
    setAlert(null);
    pricebookService.getByCountry(countryId)
      .then((res) => {
        if (res.data) {
          applyPricebookData(res.data);
        } else {
          setAlert({ type: 'error', message: 'No configuration found. Please enter rates below.' });
          setYearlyRates({});
          setFullDay({});
          setHalfDay({});
          setDispatchRates({});
          setImacRates({});
          setShortTerm({});
          setLongTerm({});
        }
      })
      .catch((err) => {
        console.error('Backend fetch failed', err);
        setAlert({ type: 'error', message: 'Failed to load pricebook from backend.' });
        setYearlyRates({});
        setFullDay({});
        setHalfDay({});
        setDispatchRates({});
        setImacRates({});
        setShortTerm({});
        setLongTerm({});
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const applyPricebookData = (data: any, isPreview = false) => {
    const loadedYearly: Record<string, { withBackfill: string; withoutBackfill: string }> = {};
    if (data.yearlyRates && Array.isArray(data.yearlyRates)) {
      data.yearlyRates.forEach((rate: any) => {
        const userVal = yearlyRates[rate.level]?.withBackfill;
        loadedYearly[rate.level] = {
          withBackfill: (isPreview && rate.level === 'L1' && userVal !== undefined)
            ? userVal
            : (rate.withBackfill !== undefined && rate.withBackfill !== null && rate.withBackfill !== 0 ? String(rate.withBackfill) : ''),
          withoutBackfill: rate.withoutBackfill !== undefined && rate.withoutBackfill !== null && rate.withoutBackfill !== 0 ? String(rate.withoutBackfill) : '',
        };
      });
    }
    setYearlyRates(loadedYearly);

    const mapToRecord = (sourceObj: any, localState: Record<string, string>, editableFields: string[]) => {
      const record: Record<string, string> = {};
      if (sourceObj) {
        Object.entries(sourceObj).forEach(([k, v]) => {
          if (isPreview && editableFields.includes(k) && localState[k] !== undefined) {
            record[k] = localState[k];
          } else {
            record[k] = v !== undefined && v !== null && v !== 0 ? String(v) : '';
          }
        });
      }
      return record;
    };

    setFullDay(mapToRecord(data.fullDayVisit, fullDay, ['L1', 'L2']));
    setHalfDay(mapToRecord(data.halfDayVisit, halfDay, []));
    setDispatchRates(mapToRecord(data.dispatchRates, dispatchRates, ['SBD', 'Additional Hour Rate']));
    setImacRates(mapToRecord(data.imacDispatch, imacRates, ['2BD']));
    setShortTerm(mapToRecord(data.shortTermProjects, shortTerm, []));
    setLongTerm(mapToRecord(data.longTermProjects, longTerm, []));
  };

  const updateYearly = (level: string, field: 'withBackfill' | 'withoutBackfill', value: string) => {
    setYearlyRates((prev) => ({ ...prev, [level]: { ...prev[level], [field]: value } }));
  };

  const updateRecord = (setter: React.Dispatch<React.SetStateAction<Record<string, string>>>) => {
    return (field: string, value: string) => setter((prev) => ({ ...prev, [field]: value }));
  };

  const isServiceConfigured = (serviceId: string) => {
    switch (serviceId) {
      case 'yearly-rates':
        return Object.values(yearlyRates).some(
          (rate) => rate.withBackfill || rate.withoutBackfill
        );
      case 'full-day':
        return Object.values(fullDay).some((v) => v !== '');
      case 'half-day':
        return Object.values(halfDay).some((v) => v !== '');
      case 'dispatch':
        return Object.values(dispatchRates).some((v) => v !== '');
      case 'imac':
        return Object.values(imacRates).some((v) => v !== '');
      case 'short-term':
        return Object.values(shortTerm).some((v) => v !== '');
      case 'long-term':
        return Object.values(longTerm).some((v) => v !== '');
      default:
        return false;
    }
  };

  const handleSave = () => {
    if (!selectedCountry) return;

    const savedYearlyRates = Object.entries(yearlyRates).map(([level, rates]) => ({
      level,
      withBackfill: parseFloat(rates.withBackfill) || 0,
      withoutBackfill: parseFloat(rates.withoutBackfill) || 0,
    }));

    const mapToNumberRecord = (stateObj: Record<string, string>) => {
      const record: Record<string, number> = {};
      Object.entries(stateObj).forEach(([k, v]) => {
        if (v !== '') {
          record[k] = parseFloat(v) || 0;
        }
      });
      return record;
    };

    const payload = {
      countryId: Number(selectedCountry) || 0,
      yearlyRates: savedYearlyRates,
      fullDayVisit: mapToNumberRecord(fullDay),
      halfDayVisit: mapToNumberRecord(halfDay),
      dispatchRates: mapToNumberRecord(dispatchRates),
      imacDispatch: mapToNumberRecord(imacRates),
      shortTermProjects: mapToNumberRecord(shortTerm),
      longTermProjects: mapToNumberRecord(longTerm),
    };

    setSaving(true);
    setAlert(null);

    pricebookService.save(payload)
      .then(() => {
        setAlert({ type: 'success', message: 'Pricebook configuration saved successfully!' });
        setTimeout(() => setAlert(null), 5000);
      })
      .catch((err) => {
        console.error('API save failed', err);
        setAlert({ type: 'error', message: 'Failed to save Pricebook configuration.' });
      })
      .finally(() => {
        setSaving(false);
      });
  };

  const handleCalculatePreview = () => {
    if (!selectedCountry) return;

    const savedYearlyRates = Object.entries(yearlyRates).map(([level, rates]) => ({
      level,
      withBackfill: parseFloat(rates.withBackfill) || 0,
      withoutBackfill: parseFloat(rates.withoutBackfill) || 0,
    }));

    const mapToNumberRecord = (stateObj: Record<string, string>) => {
      const record: Record<string, number> = {};
      Object.entries(stateObj).forEach(([k, v]) => {
        if (v !== '') {
          record[k] = parseFloat(v) || 0;
        }
      });
      return record;
    };

    const payload = {
      countryId: Number(selectedCountry),
      yearlyRates: savedYearlyRates,
      fullDayVisit: mapToNumberRecord(fullDay),
      halfDayVisit: mapToNumberRecord(halfDay),
      dispatchRates: mapToNumberRecord(dispatchRates),
      imacDispatch: mapToNumberRecord(imacRates),
      shortTermProjects: mapToNumberRecord(shortTerm),
      longTermProjects: mapToNumberRecord(longTerm),
    };

    pricebookService.calculateRates(payload)
      .then((res) => {
        if (res.data) {
          applyPricebookData(res.data, true);
        }
      })
      .catch((err) => {
        console.error('API calculate-rates preview failed', err);
      });
  };

  const renderActiveForm = () => {
    switch (activeService) {
      case 'yearly-rates':
        return <YearlyRatesForm rates={yearlyRates} onChange={updateYearly} onBlur={handleCalculatePreview} />;
      case 'full-day':
        return <DispatchRatesForm type="full-day" data={fullDay} onChange={updateRecord(setFullDay)} onBlur={handleCalculatePreview} />;
      case 'half-day':
        return <DispatchRatesForm type="half-day" data={halfDay} onChange={updateRecord(setHalfDay)} onBlur={handleCalculatePreview} />;
      case 'dispatch':
        return <DispatchRatesForm type="dispatch" data={dispatchRates} onChange={updateRecord(setDispatchRates)} onBlur={handleCalculatePreview} />;
      case 'imac':
        return <DispatchRatesForm type="imac" data={imacRates} onChange={updateRecord(setImacRates)} onBlur={handleCalculatePreview} />;
      case 'short-term':
        return <DispatchRatesForm type="short-term" data={shortTerm} onChange={updateRecord(setShortTerm)} onBlur={handleCalculatePreview} />;
      case 'long-term':
        return <DispatchRatesForm type="long-term" data={longTerm} onChange={updateRecord(setLongTerm)} onBlur={handleCalculatePreview} />;
      default:
        return null;
    }
  };

  if (!selectedCountry) {
    return (
      <div className="card">
        <Select
          label="Select Region"
          options={regions.map((r) => ({ value: r, label: r }))}
          placeholder="Choose a region"
          value={selectedRegion}
          onChange={(e) => {
            setSelectedRegion(e.target.value);
            setSelectedCountry('');
          }}
        />
        {selectedRegion && (
          <div style={{ marginTop: '16px' }}>
            <Select
              label="Select Country"
              options={filteredCountries}
              placeholder="Choose a country"
              value={selectedCountry}
              onChange={(e) => setSelectedCountry(e.target.value)}
            />
          </div>
        )}
        <p className="hint-text">
          {!selectedRegion ? 'Please select a region first.' : 'Please select a country to manage pricebooks.'}
        </p>
      </div>
    );
  }

  return (
    <div className="pricebook-container">
      {alert && (
        <div className={`pricebook-alert ${alert.type}`}>
          <span>{alert.type === 'success' ? '✓' : '⚠'}</span>
          <span>{alert.message}</span>
        </div>
      )}

      <div className="card">
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <Select
              label="Select Region"
              options={regions.map((r) => ({ value: r, label: r }))}
              placeholder="Choose a region"
              value={selectedRegion}
              onChange={(e) => {
                setSelectedRegion(e.target.value);
                setSelectedCountry('');
              }}
            />
          </div>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <Select
              label="Select Country"
              options={filteredCountries}
              placeholder="Choose a country"
              value={selectedCountry}
              onChange={(e) => {
                setSelectedCountry(e.target.value);
                setActiveService('yearly-rates');
              }}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="card text-center" style={{ padding: '40px' }}>
          <p style={{ color: 'var(--color-text-secondary)' }}>Loading pricing data...</p>
        </div>
      ) : (
        <>
          <div className="services-grid">
            {SERVICES.map((srv) => {
              const configured = isServiceConfigured(srv.id);
              const isActive = activeService === srv.id;
              return (
                <div
                  key={srv.id}
                  className={`service-card ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveService(srv.id)}
                >
                  <div className="service-card-header">
                    <div className="service-icon-wrapper">{srv.icon}</div>
                    <div className="service-title">{srv.name}</div>
                  </div>
                  <div className={`service-card-status ${configured ? 'configured' : 'empty'}`}>
                    {configured ? 'Configured' : 'Empty'}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="card active-form-section">
            <div style={{
              padding: '12px 16px',
              backgroundColor: 'var(--color-primary-light)',
              borderLeft: '4px solid var(--color-primary)',
              borderRadius: '4px',
              fontSize: '13px',
              color: 'var(--color-text)',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span>ℹ️</span>
              <span><strong>Note:</strong> Only fill the active inputs (labeled "Enter rate"). Auto-calculated fields will populate automatically on blur and are read-only.</span>
            </div>
            {renderActiveForm()}
          </div>

          <div className="card pricebook-save-bar">
            <div className="pricebook-save-info">
              Editing rates for <strong>{allCountries.find(c => c.value === selectedCountry)?.label || selectedCountry}</strong>
            </div>
            <div className="flex gap-2">
              <Button
                size="md"
                variant="secondary"
                onClick={() => loadPricebook(selectedCountry)}
                disabled={loading || saving}
              >
                Reset Changes
              </Button>
              <Button
                size="md"
                onClick={handleSave}
                disabled={saving || loading}
              >
                {saving ? 'Saving...' : 'Save Pricebook'}
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
