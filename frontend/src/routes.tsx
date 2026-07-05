import { Routes, Route } from 'react-router-dom';
import Regions from './pages/Regions';
import Countries from './pages/Countries';
import Pricebooks from './pages/Pricebooks';
import Calculator from './pages/Calculator';
import TermsConditions from './pages/TermsConditions';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Calculator />} />
      <Route path="/regions" element={<Regions />} />
      <Route path="/countries" element={<Countries />} />
      <Route path="/pricebooks" element={<Pricebooks />} />
      <Route path="/terms" element={<TermsConditions />} />
    </Routes>
  );
}
