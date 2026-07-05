import { BrowserRouter } from 'react-router-dom';
import Sidebar from './components/organisms/Sidebar';
import AppRoutes from './routes';
import './styles/global.css';
import './styles/buttons.css';
import './styles/forms.css';
import './styles/tables.css';
import './styles/sidebar.css';

export default function App() {
  return (
    <BrowserRouter>
      <Sidebar />
      <main className="page-container">
        <AppRoutes />
      </main>
    </BrowserRouter>
  );
}
