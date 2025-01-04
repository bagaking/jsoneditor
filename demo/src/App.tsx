import { HashRouter, Routes, Route } from 'react-router-dom';
import { NavMenu } from './components/NavMenu';
import { BasicDemo } from './pages/BasicDemo';
import { LinkDemo } from './pages/LinkDemo';

function App() {
  return (
    <HashRouter>
      <div className="bg-gray-50 dark:bg-gray-900 min-h-screen">
        <NavMenu />
        <div className="max-w-screen-2xl mx-auto px-4 p-4">
          <Routes>
            <Route path="/" element={<BasicDemo />} />
            <Route path="/link" element={<LinkDemo />} />
          </Routes>
        </div>
      </div>
    </HashRouter>
  );
}

export default App; 