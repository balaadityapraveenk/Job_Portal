import { BrowserRouter } from 'react-router-dom';
import MainNavBar from './pages/MainNavBar';
import { AuthenProvider } from './contexts/Authenticate';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <AuthenProvider>
        <MainNavBar />
      </AuthenProvider>
    </BrowserRouter>
  );
}

export default App;