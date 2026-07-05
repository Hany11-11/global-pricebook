import CalculatorPanel from '../components/organisms/CalculatorPanel';

export default function Calculator() {
  return (
    <div>
      <div className="page-header">
        <h1>Calculator</h1>
        <p>Calculate service costs based on region, country, and service type.</p>
      </div>
      <div className="page-content">
        <CalculatorPanel />
      </div>
    </div>
  );
}
