"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collection, Organization } from "@/types/organization";
import { getCollections, getOrganizations } from "@/lib/organizationData";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit, MapPin, Users, Building2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function CollectionDetailClient({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [collectionOrgs, setCollectionOrgs] = useState<Organization[]>([]);

  useEffect(() => {
    const collections = getCollections() || [];
    const found = collections.find((c) => c.id === params.id);
    setCollection(found || null);

    const allOrgs = getOrganizations() || [];
    setOrganizations(allOrgs);

    if (found) {
      const orgsInCollection = allOrgs.filter((org) =>
        found.organizationIds?.includes(org.id)
      );
      setCollectionOrgs(orgsInCollection);
    }
  }, [params.id]);

  if (!collection) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
        <main className="flex-1 container py-16 max-w-[1400px] mx-auto px-6">
          <p>Collection not found</p>
        </main>
      </div>
    );
  }

  const geos = new Set(
    collectionOrgs.map((org) => org.location).filter(Boolean)
  );
  const industries = new Set(
    collectionOrgs.map((org) => org.industry).filter(Boolean)
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <main className="flex-1 container py-8 max-w-[1400px] mx-auto px-6">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push("/collections")}
            className="mb-4 -ml-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Collections
          </Button>

          <div className="bg-[#2D1A45] rounded-lg p-8 text-white">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-3xl font-bold mb-3">{collection.name}</h1>
                <p className="text-white/80 text-lg max-w-3xl">
                  {collection.description}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </div>

            {/* Stats */}
            <div className="flex gap-6 mt-6">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <span className="text-lg font-bold">
                    {collectionOrgs.length}
                  </span>
                </div>
                <span className="text-sm font-medium">companies</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <span className="text-lg font-bold">{geos.size}</span>
                </div>
                <span className="text-sm font-medium">geos</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <span className="text-lg font-bold">{industries.size}</span>
                </div>
                <span className="text-sm font-medium">industries</span>
              </div>
            </div>

            {/* Tags */}
            {collection.tags && collection.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6">
                {collection.tags.map((tag) => (
                  <span
                    key={tag}
                    className="bg-white/20 backdrop-blur-sm text-white text-sm font-medium px-3 py-1.5 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Companies Grid */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Companies</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {collectionOrgs.map((org) => (
              <Link key={org.id} href={`/organizations/${org.id}`}>
                <Card className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1 cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 relative rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-white flex-shrink-0">
                        <Image
                          src={org.logo || "/placeholder.svg"}
                          alt={`${org.name} logo`}
                          layout="fill"
                          objectFit="cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base font-semibold mb-1 group-hover:text-[#2D1A45] transition-colors">
                          {org.name}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {org.description}
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        <span>{org.location}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        <span>{org.industry}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        <span>{org.employees}</span>
                      </div>
                    </div>
                    <div className="mt-3">
                      <Badge variant="secondary" className="text-xs">
                        {org.assessmentStatus}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
