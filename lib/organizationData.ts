import type { Organization, Collection } from "@/types/organization";
import { getSupabase, newId, throwIfError } from "@/lib/supabase";

interface OrganizationRow {
  id: string;
  name: string;
  industry: string;
  location: string;
  employees: number;
  logo: string;
  website_url: string;
  description: string;
  deal_stage: Organization["dealStage"];
  annual_revenue: string | null;
  owner: string | null;
  last_contacted: string | null;
}

interface CollectionRow {
  id: string;
  name: string;
  description: string;
  tags: string[] | null;
}

function mapOrganization(
  row: OrganizationRow,
  collectionIds: string[]
): Organization {
  return {
    id: row.id,
    name: row.name,
    industry: row.industry,
    location: row.location,
    employees: row.employees,
    logo: row.logo,
    website_url: row.website_url,
    description: row.description,
    dealStage: row.deal_stage,
    annualRevenue: row.annual_revenue ?? undefined,
    owner: row.owner ?? undefined,
    lastContacted: row.last_contacted ?? undefined,
    collections: collectionIds,
  };
}

function organizationRow(org: Organization): OrganizationRow {
  return {
    id: org.id,
    name: org.name,
    industry: org.industry,
    location: org.location,
    employees: org.employees,
    logo: org.logo,
    website_url: org.website_url,
    description: org.description,
    deal_stage: org.dealStage,
    annual_revenue: org.annualRevenue ?? null,
    owner: org.owner ?? null,
    last_contacted: org.lastContacted ?? null,
  };
}

async function getMemberships(): Promise<{
  byOrg: Record<string, string[]>;
  byCollection: Record<string, string[]>;
}> {
  const { data, error } = await getSupabase()
    .from("collection_organizations")
    .select("collection_id, organization_id");
  throwIfError(error, "getMemberships");
  const byOrg: Record<string, string[]> = {};
  const byCollection: Record<string, string[]> = {};
  for (const row of data ?? []) {
    (byOrg[row.organization_id] ??= []).push(row.collection_id);
    (byCollection[row.collection_id] ??= []).push(row.organization_id);
  }
  return { byOrg, byCollection };
}

export async function getOrganizations(): Promise<Organization[]> {
  const [{ data, error }, { byOrg }] = await Promise.all([
    getSupabase().from("organizations").select("*"),
    getMemberships(),
  ]);
  throwIfError(error, "getOrganizations");
  return ((data ?? []) as OrganizationRow[]).map((row) =>
    mapOrganization(row, byOrg[row.id] ?? [])
  );
}

export async function getOrganization(
  id: string
): Promise<Organization | undefined> {
  const organizations = await getOrganizations();
  return organizations.find((org) => org.id === id);
}

export async function addOrganization(
  organization: Omit<Organization, "id">
): Promise<Organization> {
  const created: Organization = {
    ...organization,
    id: newId(),
    collections: organization.collections ?? [],
  };
  const { error } = await getSupabase()
    .from("organizations")
    .insert(organizationRow(created));
  throwIfError(error, "addOrganization");
  if (created.collections.length > 0) {
    await setOrganizationCollections(created.id, created.collections);
  }
  return created;
}

export async function updateOrganization(
  organization: Organization
): Promise<Organization> {
  const { error } = await getSupabase()
    .from("organizations")
    .update(organizationRow(organization))
    .eq("id", organization.id);
  throwIfError(error, "updateOrganization");
  if (organization.collections) {
    await setOrganizationCollections(organization.id, organization.collections);
  }
  return organization;
}

export async function deleteOrganization(id: string): Promise<void> {
  const { error } = await getSupabase()
    .from("organizations")
    .delete()
    .eq("id", id);
  throwIfError(error, "deleteOrganization");
}

export async function saveOrganizations(
  organizations: Organization[]
): Promise<void> {
  const existing = await getOrganizations();
  const nextIds = new Set(organizations.map((org) => org.id));
  const toDelete = existing.filter((org) => !nextIds.has(org.id)).map((org) => org.id);
  if (toDelete.length > 0) {
    const { error } = await getSupabase()
      .from("organizations")
      .delete()
      .in("id", toDelete);
    throwIfError(error, "saveOrganizations.delete");
  }
  if (organizations.length > 0) {
    const { error } = await getSupabase()
      .from("organizations")
      .upsert(organizations.map(organizationRow));
    throwIfError(error, "saveOrganizations.upsert");
    await Promise.all(
      organizations.map((org) =>
        setOrganizationCollections(org.id, org.collections ?? [])
      )
    );
  }
}

export async function getCollections(): Promise<Collection[]> {
  const [{ data, error }, { byCollection }] = await Promise.all([
    getSupabase().from("collections").select("*"),
    getMemberships(),
  ]);
  throwIfError(error, "getCollections");
  return ((data ?? []) as CollectionRow[]).map((row) => ({
    id: row.id,
    name: row.name,
    description: row.description,
    tags: row.tags ?? [],
    organizationIds: byCollection[row.id] ?? [],
  }));
}

export async function addCollection(
  collection: Omit<Collection, "id" | "organizationIds"> & {
    organizationIds?: string[];
  }
): Promise<Collection> {
  const created: Collection = {
    ...collection,
    id: newId(),
    organizationIds: collection.organizationIds ?? [],
    tags: collection.tags ?? [],
  };
  const { error } = await getSupabase().from("collections").insert({
    id: created.id,
    name: created.name,
    description: created.description,
    tags: created.tags,
  });
  throwIfError(error, "addCollection");
  await setCollectionOrganizations(created.id, created.organizationIds);
  return created;
}

export async function updateCollection(
  collection: Collection
): Promise<Collection> {
  const { error } = await getSupabase()
    .from("collections")
    .update({
      name: collection.name,
      description: collection.description,
      tags: collection.tags ?? [],
    })
    .eq("id", collection.id);
  throwIfError(error, "updateCollection");
  await setCollectionOrganizations(collection.id, collection.organizationIds);
  return collection;
}

export async function deleteCollection(id: string): Promise<void> {
  const { error } = await getSupabase().from("collections").delete().eq("id", id);
  throwIfError(error, "deleteCollection");
}

export async function saveCollections(collections: Collection[]): Promise<void> {
  const existing = await getCollections();
  const nextIds = new Set(collections.map((collection) => collection.id));
  const toDelete = existing
    .filter((collection) => !nextIds.has(collection.id))
    .map((collection) => collection.id);
  if (toDelete.length > 0) {
    const { error } = await getSupabase()
      .from("collections")
      .delete()
      .in("id", toDelete);
    throwIfError(error, "saveCollections.delete");
  }
  if (collections.length > 0) {
    const { error } = await getSupabase()
      .from("collections")
      .upsert(
        collections.map((collection) => ({
          id: collection.id,
          name: collection.name,
          description: collection.description,
          tags: collection.tags ?? [],
        }))
      );
    throwIfError(error, "saveCollections.upsert");
    await Promise.all(
      collections.map((collection) =>
        setCollectionOrganizations(collection.id, collection.organizationIds)
      )
    );
  }
}

export async function setOrganizationCollections(
  organizationId: string,
  collectionIds: string[]
): Promise<void> {
  const supabase = getSupabase();
  const uniqueIds = [...new Set(collectionIds)];
  const { error: deleteError } = await supabase
    .from("collection_organizations")
    .delete()
    .eq("organization_id", organizationId);
  throwIfError(deleteError, "setOrganizationCollections.delete");
  if (uniqueIds.length === 0) return;
  const { error } = await supabase.from("collection_organizations").insert(
    uniqueIds.map((collectionId) => ({
      collection_id: collectionId,
      organization_id: organizationId,
    }))
  );
  throwIfError(error, "setOrganizationCollections.insert");
}

export async function setCollectionOrganizations(
  collectionId: string,
  organizationIds: string[]
): Promise<void> {
  const supabase = getSupabase();
  const uniqueIds = [...new Set(organizationIds)];
  const { error: deleteError } = await supabase
    .from("collection_organizations")
    .delete()
    .eq("collection_id", collectionId);
  throwIfError(deleteError, "setCollectionOrganizations.delete");
  if (uniqueIds.length === 0) return;
  const { error } = await supabase.from("collection_organizations").insert(
    uniqueIds.map((organizationId) => ({
      collection_id: collectionId,
      organization_id: organizationId,
    }))
  );
  throwIfError(error, "setCollectionOrganizations.insert");
}

export async function deduplicateCollectionOrganizationIds(): Promise<void> {
  const collections = await getCollections();
  await saveCollections(
    collections.map((collection) => ({
      ...collection,
      organizationIds: [...new Set(collection.organizationIds)],
    }))
  );
}
