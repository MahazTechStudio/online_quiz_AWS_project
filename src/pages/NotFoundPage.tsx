import { useNavigate } from 'react-router-dom';
import { Layers } from 'lucide-react';
import Button from '@/components/Button';
import Card from '@/components/Card';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50 p-4">
      <Card className="p-10 max-w-md w-full text-center">
        <Layers className="h-16 w-16 mx-auto text-slate-400 mb-4" />
        <h1 className="text-3xl font-bold text-dark-900 mb-1">404</h1>
        <h2 className="text-xl font-semibold text-dark-800 mb-2">Page not found</h2>
        <p className="text-slate-500 mb-6">
          The page you're looking for doesn't exist or you don't have permission to view it.
        </p>
        <div className="mt-6 flex gap-3 justify-center flex-wrap">
          <Button variant="secondary" onClick={() => navigate(-1 as unknown as string)}>
            Go back
          </Button>
          <Button variant="primary" onClick={() => navigate('/', { replace: true })}>
            Go home
          </Button>
        </div>
      </Card>
    </div>
  );
}
