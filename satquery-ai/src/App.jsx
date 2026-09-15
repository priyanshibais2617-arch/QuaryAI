import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { AnalysisProvider } from './context/AnalysisContext';
import { ToastProvider } from './hooks/useToast';
import ToastContainer from './components/ui/Toast';
import DashboardLayout from './components/layout/DashboardLayout';

// Pages
import Landing from './pages/Landing';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import NewAnalysis from './pages/NewAnalysis';
import Processing from './pages/Processing';
import Results from './pages/Results';
import Images from './pages/Images';
import History from './pages/History';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';
import AgentPlayground from './components/demo/AgentPlayground';

// Map pathnames to internal route keys
function getRouteFromPath(pathname) {
  const path = pathname.replace(/\/$/, '') || '/';
  if (path === '/landing' || path === '/' || path === '') return 'landing';
  if (path === '/signin') return 'signin';
  if (path === '/signup') return 'signup';
  if (path === '/dashboard') return 'workflow-single-vqa';
  if (path === '/workflows/single-vqa' || path === '/single-vqa') return 'workflow-single-vqa';
  if (path === '/workflows/captioning' || path === '/captioning') return 'workflow-captioning';
  if (path === '/workflows/grounding' || path === '/grounding') return 'workflow-grounding';
  if (path === '/workflows/bitemporal' || path === '/bitemporal') return 'workflow-bitemporal';
  if (path === '/workflows/optical-sar' || path === '/optical-sar') return 'workflow-optical-sar';
  if (path === '/analysis' || path === '/dashboard/analysis') return 'analysis';
  if (path === '/processing') return 'processing';
  if (path === '/results') return 'results';
  if (path === '/images') return 'images';
  if (path === '/history') return 'history';
  if (path === '/reports') return 'reports';
  if (path === '/settings') return 'settings';
  if (path === '/agent-demo') return 'agent-demo';
  return 'landing';
}

function getPathFromRoute(routeKey) {
  switch (routeKey) {
    case 'landing': return '/';
    case 'signin': return '/signin';
    case 'signup': return '/signup';
    case 'dashboard': return '/dashboard';
    case 'workflow-single-vqa': return '/workflows/single-vqa';
    case 'workflow-captioning': return '/workflows/captioning';
    case 'workflow-grounding': return '/workflows/grounding';
    case 'workflow-bitemporal': return '/workflows/bitemporal';
    case 'workflow-optical-sar': return '/workflows/optical-sar';
    case 'analysis': return '/analysis';
    case 'processing': return '/processing';
    case 'results': return '/results';
    case 'images': return '/images';
    case 'history': return '/history';
    case 'reports': return '/reports';
    case 'settings': return '/settings';
    case 'agent-demo': return '/agent-demo';
    default: return '/';
  }
}

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [currentRoute, setCurrentRoute] = useState(() => {
    return getRouteFromPath(window.location.pathname);
  });

  // Sync with browser URL & history
  useEffect(() => {
    const handlePopState = () => {
      setCurrentRoute(getRouteFromPath(window.location.pathname));
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (routeKey) => {
    const newPath = getPathFromRoute(routeKey);
    if (window.location.pathname !== newPath) {
      window.history.pushState({}, '', newPath);
    }
    setCurrentRoute(routeKey);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Standalone Marketing / Auth / 404 pages
  if (currentRoute === 'landing') {
    return <Landing onNavigate={navigate} />;
  }
  if (currentRoute === 'signin') {
    return <SignIn onNavigate={navigate} />;
  }
  if (currentRoute === 'signup') {
    return <SignUp onNavigate={navigate} />;
  }
  if (currentRoute === '404') {
    return <NotFound onNavigate={navigate} />;
  }

  // Strict Protected Routes Guard: Bar unauthenticated access to dashboard/workstation
  if (!isAuthenticated) {
    return <SignIn onNavigate={navigate} />;
  }

  // Breadcrumbs generator
  const getBreadcrumbs = () => {
    switch (currentRoute) {
      case 'workflow-single-vqa':
        return [{ label: 'Workflows', page: 'dashboard' }, { label: 'Single-Image VQA' }];
      case 'workflow-captioning':
        return [{ label: 'Workflows', page: 'dashboard' }, { label: 'Scene Captioning' }];
      case 'workflow-grounding':
        return [{ label: 'Workflows', page: 'dashboard' }, { label: 'Visual Grounding' }];
      case 'workflow-bitemporal':
        return [{ label: 'Workflows', page: 'dashboard' }, { label: 'Bi-Temporal Change' }];
      case 'workflow-optical-sar':
        return [{ label: 'Workflows', page: 'dashboard' }, { label: 'Optical + SAR Fusion' }];
      case 'analysis':
        return [{ label: 'New Analysis' }];
      case 'agent-demo':
        return [{ label: 'Agentic AI Playground' }];
      case 'processing':
        return [{ label: 'New Analysis', page: 'analysis' }, { label: 'Agent Processing' }];
      case 'results':
        return [{ label: 'New Analysis', page: 'analysis' }, { label: 'Results & Evidence' }];
      case 'images':
        return [{ label: 'Satellite Catalog' }];
      case 'history':
        return [{ label: 'Analysis Archive' }];
      case 'reports':
        return [{ label: 'Executive Reports' }];
      case 'settings':
        return [{ label: 'Workstation Settings' }];
      default:
        return [{ label: 'Analysis Workspace' }];
    }
  };

  const renderDashboardContent = () => {
    switch (currentRoute) {
      case 'workflow-single-vqa':
        return <Dashboard key="single_vqa" onNavigate={navigate} activeTaskKey="single_vqa" />;
      case 'workflow-captioning':
        return <Dashboard key="captioning" onNavigate={navigate} activeTaskKey="captioning" />;
      case 'workflow-grounding':
        return <Dashboard key="grounding" onNavigate={navigate} activeTaskKey="grounding" />;
      case 'workflow-bitemporal':
        return <Dashboard key="bitemporal_change" onNavigate={navigate} activeTaskKey="bitemporal_change" />;
      case 'workflow-optical-sar':
        return <Dashboard key="optical_sar" onNavigate={navigate} activeTaskKey="optical_sar" />;
      case 'analysis':
        return <NewAnalysis onNavigate={navigate} />;
      case 'processing':
        return <Processing onNavigate={navigate} />;
      case 'results':
        return <Results onNavigate={navigate} />;
      case 'images':
        return <Images onNavigate={navigate} />;
      case 'history':
        return <History onNavigate={navigate} />;
      case 'reports':
        return <Reports onNavigate={navigate} />;
      case 'settings':
        return <Settings onNavigate={navigate} />;
      case 'agent-demo':
        return <AgentPlayground onNavigate={navigate} />;
      case 'dashboard':
      default:
        return <Dashboard onNavigate={navigate} activeTaskKey="single_vqa" />;
    }
  };

  return (
    <DashboardLayout
      currentPage={currentRoute}
      onNavigate={navigate}
      breadcrumbItems={getBreadcrumbs()}
    >
      {renderDashboardContent()}
    </DashboardLayout>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AnalysisProvider>
          <ToastProvider>
            <AppContent />
            <ToastContainer />
          </ToastProvider>
        </AnalysisProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
