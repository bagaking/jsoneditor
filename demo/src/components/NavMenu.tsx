import { Link, useLocation } from 'react-router-dom';

const demos = [
  { path: '/', label: '基础示例' },
  { path: '/link', label: '链接示例' },
];

export const NavMenu = () => {
  const location = useLocation();
  
  return (
    <nav className="bg-white dark:bg-gray-800 shadow mb-8">
      <div className="max-w-screen-2xl mx-auto px-4">
        <div className="flex space-x-4 h-14 items-center">
          {demos.map(({ path, label }) => (
            <Link
              key={path}
              to={path}
              className={`px-3 py-2 rounded-md text-sm font-medium ${
                location.pathname === path
                  ? 'bg-gray-900 text-white'
                  : 'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}; 