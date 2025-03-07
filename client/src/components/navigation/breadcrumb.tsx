
import * as React from "react";
import { useLocation } from "wouter";
import { ChevronRight, Home } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface BreadcrumbProps {
  items?: { label: string; href?: string }[];
}

export function BreadcrumbNav({ items = [] }: BreadcrumbProps) {
  const [location] = useLocation();
  
  // Generate custom breadcrumb items based on current path if none provided
  let breadcrumbItems = items.length > 0 ? items : [];
  
  if (breadcrumbItems.length === 0) {
    if (location.includes('departments')) {
      breadcrumbItems = [{ label: 'Departamentos' }];
    } else if (location.includes('profiles')) {
      breadcrumbItems = [{ label: 'Perfiles' }];
    } else if (location.includes('users')) {
      breadcrumbItems = [{ label: 'Usuarios' }];
    } else if (location.includes('projects')) {
      breadcrumbItems = [{ label: 'Proyectos' }];
    } else {
      breadcrumbItems = generateBreadcrumbItems(location);
    }
  }

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">
            <Home className="h-4 w-4 mr-1" />
            Home
          </BreadcrumbLink>
        </BreadcrumbItem>
        
        {breadcrumbItems.map((item, index) => (
          <React.Fragment key={index}>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              {index === breadcrumbItems.length - 1 || !item.href ? (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
              )}
            </BreadcrumbItem>
          </React.Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

// Helper function to generate breadcrumb items from URL path
function generateBreadcrumbItems(path: string) {
  if (path === "/") return [];

  const segments = path.split("/").filter(Boolean);
  const breadcrumbItems = [];
  
  let currentPath = "";
  
  for (let i = 0; i < segments.length; i++) {
    const segment = segments[i];
    currentPath += `/${segment}`;
    
    // Format the label (capitalize and replace hyphens with spaces)
    const label = segment
      .split("-")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
    
    // Last item doesn't get a link
    const isLastItem = i === segments.length - 1;
    
    breadcrumbItems.push({
      label,
      href: isLastItem ? undefined : currentPath,
    });
  }
  
  return breadcrumbItems;
}
