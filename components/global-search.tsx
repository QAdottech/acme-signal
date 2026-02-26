"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Organization } from "@/types/organization";
import { getOrganizations } from "@/lib/organizationData";
import Link from "next/link";
import { OrganizationImage } from "@/components/organization-image";
import { Badge } from "@/components/ui/badge";

export function GlobalSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [filteredOrganizations, setFilteredOrganizations] = useState<
    Organization[]
  >([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setOrganizations(getOrganizations());
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (searchTerm.length > 0) {
      const filtered = organizations.filter((org) =>
        org.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOrganizations(filtered);
      setIsDropdownOpen(true);
    } else {
      setFilteredOrganizations([]);
      setIsDropdownOpen(false);
    }
  }, [searchTerm, organizations]);

  return (
    <div className="relative w-80" ref={dropdownRef}>
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 focus:outline-none text-muted-foreground" />
        <Input
          placeholder="Search..."
          className="pl-8 bg-white/10 border-transparent text-white placeholder:text-white/70 focus-visible:ring-1 focus-visible:ring-orange-500 focus-visible:ring-offset-0"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      {isDropdownOpen && filteredOrganizations.length > 0 && (
        <div className="absolute z-10 w-full mt-2 bg-white rounded-md shadow-lg dark:bg-gray-800">
          <ul className="py-1 overflow-auto max-h-60">
            {filteredOrganizations.map((org) => (
              <li key={org.id}>
                <Link
                  href={`/organizations/${org.id}`}
                  className="flex items-center px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <div className="w-8 h-8 mr-3 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {org.logo ? (
                      <OrganizationImage
                        src={org.logo}
                        alt={org.name}
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-1">
                      <span className="font-medium text-gray-800 dark:text-white truncate">
                        {org.name}
                      </span>
                      {org.exitStatus && (
                        <Badge
                          variant={
                            org.exitStatus === "IPO" ? "ipo" : "acquired"
                          }
                          className="text-[10px] px-1.5 py-0"
                        >
                          {org.exitStatus}
                        </Badge>
                      )}
                      <span className="text-muted-foreground">•</span>
                      <span className="text-sm text-muted-foreground truncate">
                        {org.location}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                      {org.industry} • {org.assessmentStatus}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
