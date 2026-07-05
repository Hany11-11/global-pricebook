import { useState, useEffect } from "react";
import Button from "../atoms/Button";
import Select from "../atoms/Select";
import Input from "../atoms/Input";
import {
  calculatorService,
  type CalculateResponse,
} from "../../services/calculatorService";
import { countryService } from "../../services/countryService";
import { regionService } from "../../services/regionService";
import { termService, type TermData } from "../../services/termService";
import "../../styles/calculator.css";

const SERVICES = [
  { id: "Yearly Rates", name: "Yearly Rates", icon: "📅" },
  { id: "Full Day Visit", name: "Full Day Visit", icon: "📆" },
  { id: "Half Day Visit", name: "Half Day Visit", icon: "⏱️" },
  { id: "Dispatch Rates", name: "Dispatch Rates", icon: "🚗" },
  { id: "IMAC Dispatch", name: "IMAC Dispatch", icon: "🛠️" },
  { id: "Short-Term Projects", name: "Short-Term Projects", icon: "📋" },
  { id: "Long-Term Projects", name: "Long-Term Projects", icon: "🏢" },
];

interface RegionDto {
  name: string;
}

interface CountryDto {
  id: string | number;
  name: string;
  region?: string;
  currency: string;
  currencySymbol: string;
}

export default function CalculatorPanel() {
  const [region, setRegion] = useState("");
  const [country, setCountry] = useState("");
  const [service, setService] = useState("Yearly Rates");

  const [level, setLevel] = useState("L1");
  const [backfill, setBackfill] = useState("With Backfill");
  const [sla, setSla] = useState("SBD");

  const [applyFee, setApplyFee] = useState(true);
  const [distance, setDistance] = useState("");
  const [supportTiming, setSupportTiming] = useState("");

  const [isCalculated, setIsCalculated] = useState(false);
  const [result, setResult] = useState<CalculateResponse | null>(null);

  const [regions, setRegions] = useState<string[]>([]);
  const [countriesByRegion, setCountriesByRegion] = useState<
    Record<
      string,
      { value: string; label: string; currency: string; symbol: string }[]
    >
  >({});
  const [terms, setTerms] = useState<TermData[]>([]);

  useEffect(() => {
    Promise.all([
      regionService.getAll(),
      countryService.getAll(),
      termService.getAll(),
    ])
      .then(([regionRes, countryRes, termRes]) => {
        const dbRegions =
          regionRes.data && regionRes.data.length > 0
            ? regionRes.data.map((r: RegionDto) => r.name)
            : ["APAC", "EMEA", "NAM", "LATAM"];
        setRegions(dbRegions);

        if (countryRes.data && countryRes.data.length > 0) {
          const grouped: Record<
            string,
            { value: string; label: string; currency: string; symbol: string }[]
          > = {};
          countryRes.data.forEach((c: CountryDto) => {
            const r = c.region || "APAC";
            if (!grouped[r]) grouped[r] = [];
            grouped[r].push({
              value: String(c.id),
              label: c.name,
              currency: c.currency,
              symbol: c.currencySymbol,
            });
          });
          setCountriesByRegion(grouped);

          const initialRegion = dbRegions.includes("APAC")
            ? "APAC"
            : dbRegions[0];
          setRegion(initialRegion);
          const countryList = grouped[initialRegion] || [];
          if (countryList.length > 0) {
            setCountry(countryList[0].value);
          }
        }

        if (termRes.data) {
          setTerms(termRes.data);
        }
      })
      .catch((err) => {
        console.error(
          "Failed to load regions/countries/terms from database",
          err,
        );
        setRegions(["APAC", "EMEA", "NAM", "LATAM"]);
      });
  }, []);

  const handleRegionChange = (r: string) => {
    setRegion(r);
    const countryList = countriesByRegion[r] || [];
    if (countryList.length > 0) {
      setCountry(countryList[0].value);
    } else {
      setCountry("");
    }
    setIsCalculated(false);
  };

  const handleCalculate = () => {
    if (!country) {
      alert("Please select a country first.");
      return;
    }

    const needsTiming = terms.some(
      (t) =>
        t.ruleType === "MULTIPLIER_OOH" || t.ruleType === "MULTIPLIER_WEEKEND",
    );
    if (needsTiming && !supportTiming) {
      alert("Please select a Support Timing option before calculating.");
      return;
    }

    const inputs: Record<string, string> = {};
    if (service === "Yearly Rates") {
      inputs["Level"] = level;
      inputs["Backfill Type"] = backfill;
    } else if (
      [
        "Full Day Visit",
        "Half Day Visit",
        "Short-Term Projects",
        "Long-Term Projects",
      ].includes(service)
    ) {
      inputs["Level"] = level;
    } else if (["Dispatch Rates", "IMAC Dispatch"].includes(service)) {
      inputs["SLA"] = sla;
    }
    if (hasSurcharge) {
      inputs["Apply Fee"] = applyFee ? "Yes" : "No";
    }
    if (hasTravel) {
      inputs["Travel Distance"] = distance;
    }
    if (hasTiming) {
      inputs["Support Timing"] = supportTiming;
    }

    calculatorService
      .calculate({ region, country, service, inputs })
      .then((res) => {
        setResult(res.data);
        setIsCalculated(true);
      })
      .catch((err: unknown) => {
        console.error("Backend calculation failed", err);
        const backendMessage =
          (err as { response?: { data?: { message?: string } } }).response?.data
            ?.message ||
          "Pricing calculation failed. Please ensure the backend is running and the pricebook is configured.";
        alert(backendMessage);
      });
  };

  const renderDynamicInputs = () => {
    switch (service) {
      case "Yearly Rates":
        return (
          <>
            <div className="form-group mb-2">
              <label
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  marginBottom: "8px",
                  display: "block",
                }}
              >
                Level
              </label>
              <div className="level-btn-group">
                {["L1", "L2", "L3", "L4", "L5"].map((l) => (
                  <button
                    key={l}
                    type="button"
                    className={`level-btn ${level === l ? "active" : ""}`}
                    onClick={() => {
                      setLevel(l);
                      setIsCalculated(false);
                    }}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group" style={{ marginTop: "16px" }}>
              <label
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  marginBottom: "8px",
                  display: "block",
                }}
              >
                Backfill Type
              </label>
              <div className="timing-radios">
                {["With Backfill", "Without Backfill"].map((b) => (
                  <label key={b} className="timing-label">
                    <input
                      type="radio"
                      name="backfill"
                      checked={backfill === b}
                      onChange={() => {
                        setBackfill(b);
                        setIsCalculated(false);
                      }}
                    />
                    {b}
                  </label>
                ))}
              </div>
            </div>
          </>
        );
      case "Full Day Visit":
      case "Half Day Visit":
        return (
          <div className="form-group">
            <label
              style={{
                fontSize: "13px",
                fontWeight: "600",
                marginBottom: "8px",
                display: "block",
              }}
            >
              Level
            </label>
            <div className="level-btn-group">
              {["L1", "L2", "L3"].map((l) => (
                <button
                  key={l}
                  type="button"
                  className={`level-btn ${level === l ? "active" : ""}`}
                  onClick={() => {
                    setLevel(l);
                    setIsCalculated(false);
                  }}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        );
      case "Dispatch Rates":
        return (
          <Select
            label="SLA Option"
            value={sla}
            onChange={(e) => {
              setSla(e.target.value);
              setIsCalculated(false);
            }}
            options={[
              { value: "9x5x4", label: "9x5x4" },
              { value: "24x7x4", label: "24x7x4" },
              { value: "SBD", label: "SBD (Same Business Day)" },
              { value: "NBD", label: "NBD (Next Business Day)" },
              { value: "2BD", label: "2BD (2 Business Days)" },
              { value: "3BD", label: "3BD (3 Business Days)" },
              { value: "Additional Hour Rate", label: "Additional Hour Rate" },
            ]}
          />
        );
      case "IMAC Dispatch":
        return (
          <div className="form-group">
            <label
              style={{
                fontSize: "13px",
                fontWeight: "600",
                marginBottom: "8px",
                display: "block",
              }}
            >
              SLA
            </label>
            <div className="level-btn-group">
              {["2BD", "3BD", "4BD"].map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`level-btn ${sla === s ? "active" : ""}`}
                  onClick={() => {
                    setSla(s);
                    setIsCalculated(false);
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        );
      case "Short-Term Projects":
      case "Long-Term Projects":
        return (
          <div className="form-group">
            <label
              style={{
                fontSize: "13px",
                fontWeight: "600",
                marginBottom: "8px",
                display: "block",
              }}
            >
              Level
            </label>
            <div className="level-btn-group">
              {["L1", "L2", "L3", "L4", "L5"].map((l) => (
                <button
                  key={l}
                  type="button"
                  className={`level-btn ${level === l ? "active" : ""}`}
                  onClick={() => {
                    setLevel(l);
                    setIsCalculated(false);
                  }}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const surchargeTerm = terms.find(
    (t) => t.ruleType === "PERCENTAGE_SURCHARGE",
  );
  const surchargePercent =
    surchargeTerm && surchargeTerm.chargeValue !== undefined
      ? (surchargeTerm.chargeValue * 100).toFixed(0)
      : "5";

  const travelTerm = terms.find((t) => t.ruleType === "TRAVEL_DISTANCE");
  const travelThreshold =
    travelTerm && travelTerm.thresholdValue !== undefined
      ? travelTerm.thresholdValue
      : 50;
  const travelRate =
    travelTerm && travelTerm.chargeValue !== undefined
      ? travelTerm.chargeValue.toFixed(2)
      : "0.40";
  const travelLabel = `Travel Distance (KM) (Surcharge applies after ${travelThreshold} KM at $${travelRate}/KM)`;

  const oohTerm = terms.find((t) => t.ruleType === "MULTIPLIER_OOH");
  const oohVal =
    oohTerm && oohTerm.chargeValue !== undefined ? oohTerm.chargeValue : 1.5;
  const weekendTerm = terms.find((t) => t.ruleType === "MULTIPLIER_WEEKEND");
  const weekendVal =
    weekendTerm && weekendTerm.chargeValue !== undefined
      ? weekendTerm.chargeValue
      : 2.0;

  const timingOptions = [
    { value: "Business Hours", label: "Business Hours (1.0x)" },
    { value: "Out of Hours", label: `Out of Hours (${oohVal}x)` },
    { value: "Weekend/Holiday", label: `Weekend/Holiday (${weekendVal}x)` },
  ];

  const hasSurcharge = terms.some((t) => t.ruleType === "PERCENTAGE_SURCHARGE");
  const hasTravel = terms.some((t) => t.ruleType === "TRAVEL_DISTANCE");
  const hasTiming = terms.some(
    (t) =>
      t.ruleType === "MULTIPLIER_OOH" || t.ruleType === "MULTIPLIER_WEEKEND",
  );
  const hasAnyConditions = hasSurcharge || hasTravel || hasTiming;

  const countriesOptions = countriesByRegion[region] || [];

  return (
    <div className="calculator-layout">
      {/* LEFT COLUMN: Input Form */}
      <div className="calculator-left">
        <div className="card">
          <h3 className="section-title">Calculator Inputs</h3>

          {/* Step 1: Select Region */}
          <div className="calc-step-section">
            <div className="calc-step-title">
              <span className="calc-step-number">1</span> Select Region
            </div>
            <Select
              options={regions.map((r) => ({ value: r, label: r }))}
              value={region}
              onChange={(e) => handleRegionChange(e.target.value)}
            />
          </div>

          {/* Step 2: Select Country */}
          <div className="calc-step-section">
            <div className="calc-step-title">
              <span className="calc-step-number">2</span> Select Country
            </div>
            <Select
              options={countriesOptions}
              value={country}
              onChange={(e) => {
                setCountry(e.target.value);
                setIsCalculated(false);
              }}
            />
          </div>

          <div className="calc-step-section">
            <div className="calc-step-title">
              <span className="calc-step-number">3</span> Select Service Type
            </div>
            <Select
              options={SERVICES.map((srv) => ({
                value: srv.id,
                label: srv.name,
              }))}
              value={service}
              onChange={(e) => {
                const val = e.target.value;
                setService(val);
                setIsCalculated(false);
                if (["Dispatch Rates", "IMAC Dispatch"].includes(val)) {
                  setSla(val === "IMAC Dispatch" ? "2BD" : "SBD");
                } else {
                  setLevel("L1");
                }
              }}
            />
          </div>

          <div
            className="calc-step-section"
            style={{
              borderTop: "1px solid var(--color-border)",
              paddingTop: "20px",
            }}
          >
            {renderDynamicInputs()}
          </div>

          {hasAnyConditions && (
            <div
              className="calc-step-section"
              style={{
                borderTop: "1px solid var(--color-border)",
                paddingTop: "20px",
              }}
            >
              <div className="calc-step-title">Additional Conditions</div>

              {hasSurcharge && (
                <div className="form-group mb-2">
                  <label className="calc-checkbox-label">
                    <input
                      type="checkbox"
                      checked={applyFee}
                      onChange={(e) => {
                        setApplyFee(e.target.checked);
                        setIsCalculated(false);
                      }}
                    />
                    Apply {surchargePercent}% Service Management Fee
                  </label>
                </div>
              )}

              {hasTravel && (
                <Input
                  label={travelLabel}
                  type="number"
                  placeholder="e.g. 75"
                  value={distance}
                  onChange={(e) => {
                    setDistance(e.target.value);
                    setIsCalculated(false);
                  }}
                />
              )}

              {hasTiming && (
                <div className="form-group">
                  <label
                    style={{
                      fontSize: "13px",
                      fontWeight: "600",
                      marginBottom: "8px",
                      display: "block",
                    }}
                  >
                    Support Timing
                  </label>
                  <div className="timing-radios">
                    {timingOptions.map((opt) => (
                      <label key={opt.value} className="timing-label">
                        <input
                          type="radio"
                          name="timing"
                          checked={supportTiming === opt.value}
                          onChange={() => {
                            setSupportTiming(opt.value);
                            setIsCalculated(false);
                          }}
                        />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          <div style={{ marginTop: "24px" }}>
            <Button
              size="md"
              style={{
                width: "100%",
                padding: "12px",
                fontSize: "15px",
                fontWeight: "700",
              }}
              onClick={handleCalculate}
            >
              Calculate Price
            </Button>
          </div>
        </div>
      </div>

      <div className="calculator-right">
        <div className="sticky-sidebar">
          {isCalculated && result ? (
            <>
              <div className="summary-card">
                <h3 className="summary-title">Calculation Summary</h3>
                <div className="summary-row">
                  <span className="label">Region</span>
                  <span className="value">{result.region}</span>
                </div>
                <div className="summary-row">
                  <span className="label">Country</span>
                  <span className="value">{result.country}</span>
                </div>
                <div className="summary-row">
                  <span className="label">Service</span>
                  <span className="value">{result.service}</span>
                </div>
                <div className="summary-row">
                  <span className="label">Selection</span>
                  <span className="value">{result.selection}</span>
                </div>
                <div className="summary-row">
                  <span className="label">Currency</span>
                  <span className="value">{result.currency}</span>
                </div>
                <div className="summary-row">
                  <span className="label">Base Price</span>
                  <span className="value">
                    {result.basePrice} {result.symbol}
                  </span>
                </div>
                <div className="summary-row">
                  <span className="label">Service Fee</span>
                  <span className="value">
                    {result.serviceFee} {result.symbol}
                  </span>
                </div>
                <div className="summary-row">
                  <span className="label">Travel Charge</span>
                  <span className="value">
                    {result.travelCharge} {result.symbol}
                  </span>
                </div>
                <div className="summary-row">
                  <span className="label">Support Multiplier</span>
                  <span className="value">{result.supportMultiplier}</span>
                </div>
              </div>

              <div className="final-price-card">
                <div className="final-price-label">Final Price</div>
                <div className="final-price-value">
                  {result.finalPrice} {result.symbol}
                </div>
              </div>
            </>
          ) : (
            <div className="empty-summary-state">
              <span className="empty-summary-icon">📊</span>
              <div className="empty-summary-text">
                Select region, country, and service options on the left, then
                click <strong>Calculate Price</strong> to see details.
              </div>
            </div>
          )}

          {terms.length > 0 && (
            <div className="notes-card">
              <h4 className="notes-title">Additional Conditions</h4>
              <ul className="notes-list">
                {terms.map((t) => (
                  <li key={t.id}>{t.content}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
