import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
}

const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  breadcrumbs,
  actions,
}) => {
  return (
    <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
          {title}
        </h1>
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="mt-2">
            <ol className="flex items-center gap-1.5 text-sm">
              {breadcrumbs.map((item, index) => (
                <li key={index} className="flex items-center gap-1.5">
                  {index > 0 && (
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  )}
                  {item.href ? (
                    <Link
                      href={item.href}
                      className="text-gray-500 hover:text-brand-500 dark:text-gray-400"
                    >
                      {item.label}
                    </Link>
                  ) : (
                    <span className="text-gray-800 dark:text-white/90">
                      {item.label}
                    </span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
};

export default PageHeader;
