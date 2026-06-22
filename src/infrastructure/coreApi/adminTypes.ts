export type AdminPaginatedResult<T> = {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type AdminProductOwnershipItem = {
  productSlug: string;
  planSlug: string;
  entitlementStatus: string;
};

export type AdminAccountOwnerListItem = {
  id: string;
  email: string;
  ownerName: string;
  organizationsOwned: number;
  productsOwned: AdminProductOwnershipItem[];
  subscriptionStatus: string | null;
  lastLoginAt: string | null;
  createdAt: string | null;
};

export type AdminAccountOwnerOrganizationMember = {
  userId: string;
  email: string | null;
  displayName: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  membershipStatus: string;
  joinedAt: string | null;
  lastLoginAt: string | null;
};

export type AdminAccountOwnerOrganization = {
  id: string;
  name: string;
  createdAt: string | null;
  subscriptionStatus: string | null;
  products: AdminProductOwnershipItem[];
  memberCount: number;
  storageUsedBytes: number | null;
  members: AdminAccountOwnerOrganizationMember[];
};

export type AdminAccountOwnerDetail = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  displayName: string;
  createdAt: string | null;
  lastLoginAt: string | null;
  organizationsOwned: number;
  productsOwned: AdminProductOwnershipItem[];
  subscriptionSummary: string | null;
  organizations: AdminAccountOwnerOrganization[];
};

export type AdminOrganizationListItem = {
  id: string;
  name: string;
  ownerEmail: string | null;
  memberCount: number;
  products: string[];
  subscriptionStatus: string | null;
  createdAt: string | null;
};

export type AdminSubscriptionListItem = {
  id: string;
  organizationId: string;
  organizationName: string;
  productSlug: string;
  planSlug: string;
  status: string;
  billingCycle: string;
  trialEnd: string | null;
  renewalDate: string | null;
  cancelAtPeriodEnd: boolean;
};

export type AdminStaffMe = {
  userId: string;
  email: string | null;
  role: string;
};

export type AdminListQueryParams = {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  search?: string;
  product?: string;
  status?: string;
  plan?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return value != null && typeof value === 'object';
}

function parsePaginatedResult<T>(
  json: unknown,
  key: string,
  parseItem: (value: unknown) => T | null
): AdminPaginatedResult<T> | null {
  if (!isRecord(json)) return null;
  const container = json[key];
  if (!isRecord(container)) return null;
  if (!Array.isArray(container.items)) return null;
  const items = container.items.map(parseItem).filter((item): item is T => item != null);
  if (
    typeof container.total !== 'number' ||
    typeof container.page !== 'number' ||
    typeof container.pageSize !== 'number' ||
    typeof container.totalPages !== 'number'
  ) {
    return null;
  }
  return {
    items,
    total: container.total,
    page: container.page,
    pageSize: container.pageSize,
    totalPages: container.totalPages,
  };
}

export function parseAdminStaffMe(json: unknown): AdminStaffMe | null {
  if (!isRecord(json) || !isRecord(json.staff)) return null;
  if (typeof json.staff.userId !== 'string' || typeof json.staff.role !== 'string') return null;
  return {
    userId: json.staff.userId,
    email: typeof json.staff.email === 'string' ? json.staff.email : null,
    role: json.staff.role,
  };
}

function parseProductOwnershipItem(value: unknown): AdminProductOwnershipItem | null {
  if (!isRecord(value) || typeof value.productSlug !== 'string') {
    return null;
  }
  return {
    productSlug: value.productSlug,
    planSlug: typeof value.planSlug === 'string' ? value.planSlug : '',
    entitlementStatus: typeof value.entitlementStatus === 'string' ? value.entitlementStatus : '',
  };
}

export function parseAdminAccountOwnersResponse(
  json: unknown
): AdminPaginatedResult<AdminAccountOwnerListItem> | null {
  return parsePaginatedResult(json, 'accountOwners', (value) => {
    if (!isRecord(value) || typeof value.id !== 'string' || typeof value.email !== 'string') {
      return null;
    }
    const productsOwned = Array.isArray(value.productsOwned)
      ? value.productsOwned
          .map(parseProductOwnershipItem)
          .filter((item): item is AdminProductOwnershipItem => item != null)
      : [];
    return {
      id: value.id,
      email: value.email,
      ownerName: typeof value.ownerName === 'string' ? value.ownerName : value.email,
      organizationsOwned:
        typeof value.organizationsOwned === 'number' ? value.organizationsOwned : 0,
      productsOwned,
      subscriptionStatus:
        typeof value.subscriptionStatus === 'string' ? value.subscriptionStatus : null,
      lastLoginAt: typeof value.lastLoginAt === 'string' ? value.lastLoginAt : null,
      createdAt: typeof value.createdAt === 'string' ? value.createdAt : null,
    };
  });
}

function parseAccountOwnerOrganizationMember(value: unknown): AdminAccountOwnerOrganizationMember | null {
  if (!isRecord(value) || typeof value.userId !== 'string' || typeof value.role !== 'string') {
    return null;
  }
  return {
    userId: value.userId,
    email: typeof value.email === 'string' ? value.email : null,
    displayName: typeof value.displayName === 'string' ? value.displayName : 'Member',
    firstName: typeof value.firstName === 'string' ? value.firstName : null,
    lastName: typeof value.lastName === 'string' ? value.lastName : null,
    role: value.role,
    membershipStatus:
      typeof value.membershipStatus === 'string' ? value.membershipStatus : 'unknown',
    joinedAt: typeof value.joinedAt === 'string' ? value.joinedAt : null,
    lastLoginAt: typeof value.lastLoginAt === 'string' ? value.lastLoginAt : null,
  };
}

function parseAccountOwnerOrganization(value: unknown): AdminAccountOwnerOrganization | null {
  if (!isRecord(value) || typeof value.id !== 'string' || typeof value.name !== 'string') {
    return null;
  }
  return {
    id: value.id,
    name: value.name,
    createdAt: typeof value.createdAt === 'string' ? value.createdAt : null,
    subscriptionStatus:
      typeof value.subscriptionStatus === 'string' ? value.subscriptionStatus : null,
    products: Array.isArray(value.products)
      ? value.products.map(parseProductOwnershipItem).filter((item): item is AdminProductOwnershipItem => item != null)
      : [],
    memberCount: typeof value.memberCount === 'number' ? value.memberCount : 0,
    storageUsedBytes:
      typeof value.storageUsedBytes === 'number' ? value.storageUsedBytes : null,
    members: Array.isArray(value.members)
      ? value.members
          .map(parseAccountOwnerOrganizationMember)
          .filter((item): item is AdminAccountOwnerOrganizationMember => item != null)
      : [],
  };
}

export function parseAdminAccountOwnerDetail(json: unknown): AdminAccountOwnerDetail | null {
  if (!isRecord(json) || !isRecord(json.accountOwner) || typeof json.accountOwner.id !== 'string') {
    return null;
  }
  const value = json.accountOwner;
  if (typeof value.id !== 'string' || typeof value.email !== 'string') return null;
  return {
    id: value.id,
    email: value.email,
    firstName: typeof value.firstName === 'string' ? value.firstName : null,
    lastName: typeof value.lastName === 'string' ? value.lastName : null,
    displayName: typeof value.displayName === 'string' ? value.displayName : value.email,
    createdAt: typeof value.createdAt === 'string' ? value.createdAt : null,
    lastLoginAt: typeof value.lastLoginAt === 'string' ? value.lastLoginAt : null,
    organizationsOwned:
      typeof value.organizationsOwned === 'number' ? value.organizationsOwned : 0,
    productsOwned: Array.isArray(value.productsOwned)
      ? value.productsOwned
          .map(parseProductOwnershipItem)
          .filter((item): item is AdminProductOwnershipItem => item != null)
      : [],
    subscriptionSummary:
      typeof value.subscriptionSummary === 'string' ? value.subscriptionSummary : null,
    organizations: Array.isArray(value.organizations)
      ? value.organizations
          .map(parseAccountOwnerOrganization)
          .filter((item): item is AdminAccountOwnerOrganization => item != null)
      : [],
  };
}

export function parseAdminOrganizationsResponse(
  json: unknown
): AdminPaginatedResult<AdminOrganizationListItem> | null {
  return parsePaginatedResult(json, 'organizations', (value) => {
    if (!isRecord(value) || typeof value.id !== 'string' || typeof value.name !== 'string') {
      return null;
    }
    return {
      id: value.id,
      name: value.name,
      ownerEmail: typeof value.ownerEmail === 'string' ? value.ownerEmail : null,
      memberCount: typeof value.memberCount === 'number' ? value.memberCount : 0,
      products: Array.isArray(value.products)
        ? value.products.filter((item): item is string => typeof item === 'string')
        : [],
      subscriptionStatus:
        typeof value.subscriptionStatus === 'string' ? value.subscriptionStatus : null,
      createdAt: typeof value.createdAt === 'string' ? value.createdAt : null,
    };
  });
}

export function parseAdminSubscriptionsResponse(
  json: unknown
): AdminPaginatedResult<AdminSubscriptionListItem> | null {
  return parsePaginatedResult(json, 'subscriptions', (value) => {
    if (
      !isRecord(value) ||
      typeof value.id !== 'string' ||
      typeof value.organizationId !== 'string' ||
      typeof value.organizationName !== 'string' ||
      typeof value.productSlug !== 'string' ||
      typeof value.planSlug !== 'string' ||
      typeof value.status !== 'string' ||
      typeof value.billingCycle !== 'string' ||
      typeof value.cancelAtPeriodEnd !== 'boolean'
    ) {
      return null;
    }
    return {
      id: value.id,
      organizationId: value.organizationId,
      organizationName: value.organizationName,
      productSlug: value.productSlug,
      planSlug: value.planSlug,
      status: value.status,
      billingCycle: value.billingCycle,
      trialEnd: typeof value.trialEnd === 'string' ? value.trialEnd : null,
      renewalDate: typeof value.renewalDate === 'string' ? value.renewalDate : null,
      cancelAtPeriodEnd: value.cancelAtPeriodEnd,
    };
  });
}
