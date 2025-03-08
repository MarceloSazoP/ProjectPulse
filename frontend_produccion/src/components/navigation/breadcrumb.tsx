
import React from "react";
import { Link } from "wouter";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbProps {
  items: {
    label: string;
    href?: string;
  }[];
}

export function BreadcrumbNav({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground mb-4">
      <Link href="/dashboard">
        <a className="flex items-center hover:text-foreground">
          <Home className="h-4 w-4" />
        </a>
      </Link>
      
      {items.map((item, index) => (
        <React.Fragment key={index} data-replit-metadata>
          <ChevronRight className="h-4 w-4" />
          {item.href ? (
            <Link href={item.href}>
              <a className="hover:text-foreground">{item.label}</a>
            </Link>
          ) : (
            <span className="text-foreground font-medium">{item.label}</span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
