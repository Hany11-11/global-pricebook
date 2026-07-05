import RegionManagement from '../components/organisms/RegionManagement';

export default function Regions() {
  return (
    <div>
      <div className="page-header">
        <h1>Regions</h1>
        <p>Manage geographic regions for pricebook configuration.</p>
      </div>
      <div className="page-content">
        <RegionManagement />
      </div>
    </div>
  );
}
