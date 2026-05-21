import { Link } from 'react-router-dom';

interface Crumb {
  label: string;
  to?: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: Crumb[];
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, breadcrumbs, actions, className = '' }: PageHeaderProps) {
  return (
    <div className={`flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between ${className}`}>
      <div className="min-w-0">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="mb-1 flex flex-wrap items-center gap-1 text-xs text-gray-400">
            {breadcrumbs.map((crumb, idx) => (
              <span key={idx} className="flex items-center gap-1">
                {idx > 0 && <span aria-hidden="true">/</span>}
                {crumb.to ? (
                  <Link to={crumb.to} className="hover:text-gray-600 hover:underline">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-gray-600" aria-current="page">
                    {crumb.label}
                  </span>
                )}
              </span>
            ))}
          </nav>
        )}
        <h1 className="truncate text-2xl font-bold text-gray-900">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>}
      </div>
      {actions && (
        <div className="flex shrink-0 flex-wrap items-center gap-2 pt-1 sm:pt-0">
          {actions}
        </div>
      )}
    </div>
  );
}
