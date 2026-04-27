import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  LogOut, 
  LayoutDashboard, 
  CreditCard, 
  BarChart3,
  Building2,
  User,
  Menu,
  X,
  History,
  Settings
} from "lucide-react";

const Layout = ({ user, onLogout, children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  const getRoleColor = (role) => {
    const colors = {
      super_admin: "bg-red-100 text-red-800 border-red-300",
      admin: "bg-purple-100 text-purple-800 border-purple-300",
      finance: "bg-green-100 text-green-800 border-green-300",
      support: "bg-blue-100 text-blue-800 border-blue-300",
      auditor: "bg-yellow-100 text-yellow-800 border-yellow-300",
      viewer: "bg-gray-100 text-gray-800 border-gray-300"
    };
    return colors[role] || "bg-gray-100 text-gray-800 border-gray-300";
  };

  // Navigation items - Settings only visible to admins
  const navigation = [
    { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard, roles: ["admin", "super_admin", "finance", "support", "auditor", "viewer"] },
    { name: "Submit Payment", path: "/submit-payment", icon: CreditCard, roles: ["admin", "super_admin", "finance"] },
    { name: "Analytics", path: "/analytics", icon: BarChart3, roles: ["admin", "super_admin", "finance", "auditor"] },
    { name: "Activity Logs", path: "/activity-logs", icon: History, roles: ["admin", "super_admin", "finance", "support", "auditor", "viewer"] },
    { name: "Settings", path: "/settings", icon: Settings, roles: ["admin", "super_admin"] },
    { name: "Clients", path: "/clients", icon: Building2, roles: ["super_admin"] },
  ];

  // Filter navigation based on user role
  const visibleNavigation = navigation.filter(item => 
    item.roles.includes(user?.role)
  );

  const isActivePath = (path) => location.pathname === path;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
                  Pesapal
                </h1>
              </div>
              
              {/* Desktop Navigation */}
              <div className="hidden md:ml-10 md:flex md:space-x-4">
                {visibleNavigation.map((item) => {
                  const Icon = item.icon;
                  const active = isActivePath(item.path);
                  return (
                    <button
                      key={item.name}
                      onClick={() => navigate(item.path)}
                      className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        active
                          ? "bg-blue-50 text-blue-700"
                          : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {item.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* User Info and Logout */}
            <div className="flex items-center space-x-4">
              {/* User Badge */}
              <div className="hidden md:flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getRoleColor(user?.role)}`}>
                    {user?.role?.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                  <User className="w-6 h-6 text-white" />
                </div>
              </div>

              {/* Logout Button - Desktop */}
              <button
                onClick={onLogout}
                className="hidden md:flex items-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-sm font-medium"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </button>

              {/* Mobile menu button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-md text-gray-700 hover:bg-gray-100"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
              </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {visibleNavigation.map((item) => {
                const Icon = item.icon;
                const active = isActivePath(item.path);
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      navigate(item.path);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center w-full px-3 py-2 rounded-md text-base font-medium ${
                      active
                        ? "bg-blue-50 text-blue-700"
                        : "text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </button>
                );
              })}
              
              {/* Mobile User Info */}
              <div className="px-3 py-4 border-t border-gray-200 mt-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{user?.email}</p>
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${getRoleColor(user?.role)}`}>
                      {user?.role?.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  className="flex items-center w-full px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm font-medium"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-sm text-gray-500">
            © 2024 Pesapal Payment Dashboard. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;