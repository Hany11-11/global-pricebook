import PricebookManagement from '../components/organisms/PricebookManagement';

export default function Pricebooks() {
  return (
    <div>
      <div className="page-header">
        <h1>Pricebooks</h1>
        <p>Configure pricing rates for each country.</p>
      </div>
      <div className="page-content">
        <PricebookManagement />
      </div>
    </div>
  );
}
