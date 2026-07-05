import CountryManagement from '../components/organisms/CountryManagement';

export default function Countries() {
  return (
    <div>
      <div className="page-header">
        <h1>Countries</h1>
        <p>Manage countries and their currency configuration.</p>
      </div>
      <div className="page-content">
        <CountryManagement />
      </div>
    </div>
  );
}
