# Coding Practices & Best Practices Guide
## Neon + Next.js + ShadCN + TanStack Query + Drizzle

A comprehensive guide for building scalable, maintainable applications with this modern tech stack.

---

## Table of Contents

1. [Stack Overview](#stack-overview)
2. [Project Structure](#project-structure)
3. [Database Layer (Neon + Drizzle)](#database-layer-neon--drizzle)
4. [API Layer (Next.js)](#api-layer-nextjs)
5. [Data Fetching (TanStack Query)](#data-fetching-tanstack-query)
6. [UI Components (ShadCN)](#ui-components-shadcn)
7. [Integration Patterns](#integration-patterns)
8. [Performance Optimization](#performance-optimization)
9. [Error Handling](#error-handling)
10. [Security Best Practices](#security-best-practices)
11. [Testing Strategies](#testing-strategies)
12. [Common Pitfalls](#common-pitfalls)

---

## Stack Overview

### Technology Responsibilities

| Technology | Role | Purpose |
|---|---|---|
| **Neon** | Database Infrastructure | Serverless PostgreSQL with auto-scaling |
| **Drizzle** | ORM/Query Builder | Type-safe database queries |
| **Next.js** | Framework & API | React framework + server-side rendering + API routes |
| **TanStack Query** | Data State Management | Server state caching, synchronization, and management |
| **ShadCN** | UI Components | Unstyled, customizable component library |

### Key Principles

- **Type Safety**: Leverage TypeScript throughout the stack
- **Server-First**: Use server components and API routes appropriately
- **Caching Strategy**: Leverage TanStack Query for client-side, Neon for edge
- **Component Composition**: Build small, reusable ShadCN components
- **Query Optimization**: Write efficient Drizzle queries with proper indexing

---

## Project Structure

### Recommended Directory Layout

```
project-root/
├── src/
│   ├── app/                          # Next.js app router
│   │   ├── (auth)/                   # Auth route group
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (dashboard)/              # Protected routes
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── api/                      # API routes
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   └── [resource]/
│   │   └── layout.tsx
│   │
│   ├── components/                   # React components
│   │   ├── ui/                       # ShadCN UI components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   └── ...
│   │   ├── forms/                    # Form components
│   │   ├── layouts/                  # Layout components
│   │   ├── shared/                   # Shared components
│   │   └── index.ts                  # Barrel exports
│   │
│   ├── lib/                          # Utility functions
│   │   ├── db/                       # Database configuration
│   │   │   ├── client.ts             # Drizzle client
│   │   │   └── schema.ts             # Database schema
│   │   ├── queries/                  # Database queries
│   │   │   ├── users.ts
│   │   │   └── index.ts
│   │   ├── api-client.ts             # API client setup
│   │   ├── utils.ts                  # Utility functions
│   │   └── constants.ts              # Constants
│   │
│   ├── hooks/                        # Custom React hooks
│   │   ├── useQueryClient.ts         # Query client hooks
│   │   ├── useAuth.ts
│   │   └── index.ts
│   │
│   ├── providers/                    # Context providers
│   │   ├── QueryProvider.tsx         # TanStack Query setup
│   │   └── Providers.tsx             # Root provider wrapper
│   │
│   ├── services/                     # Business logic
│   │   ├── auth.ts
│   │   ├── users.ts
│   │   └── index.ts
│   │
│   ├── types/                        # TypeScript types
│   │   ├── index.ts
│   │   ├── api.ts
│   │   └── db.ts
│   │
│   └── env.ts                        # Environment validation
│
├── drizzle/                          # Drizzle migrations
│   ├── migrations/
│   └── meta/
│
├── .env.local                        # Local environment
├── drizzle.config.ts                 # Drizzle configuration
├── next.config.js                    # Next.js configuration
├── tailwind.config.ts                # Tailwind configuration
├── tsconfig.json                     # TypeScript configuration
└── package.json

```

### Why This Structure?

- **Route Grouping**: Organize routes by functionality/domain
- **Separation of Concerns**: Clear boundaries between UI, API, and business logic
- **Scalability**: Easy to add new features without restructuring
- **Discoverability**: Clear naming conventions make finding code intuitive

---

## Database Layer (Neon + Drizzle)

### 1. Database Configuration

#### `lib/db/client.ts`
```typescript
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Create connection pool (reused across requests)
const client = postgres(process.env.DATABASE_URL!);

export const db = drizzle(client, { schema });
export type Database = typeof db;
```

**Best Practices:**
- Store connection string in environment variables
- Use connection pooling (Neon provides this by default)
- Never commit `.env.local` to version control
- Validate environment variables on startup

#### Environment Setup
```bash
# .env.local
DATABASE_URL="postgresql://user:password@ep-xxxxx.neon.tech/dbname?sslmode=require"
```

### 2. Schema Definition

#### `lib/db/schema.ts`
```typescript
import { 
  pgTable, 
  text, 
  serial, 
  timestamp, 
  boolean,
  varchar,
  integer,
  relations
} from 'drizzle-orm/pg-core';
import { createId } from '@paralleldrive/cuid2';

// Users table
export const users = pgTable('users', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  email: varchar('email', { length: 255 }).unique().notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  password: text('password').notNull(),
  avatar: text('avatar'),
  role: varchar('role', { length: 50 }).default('user').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Posts table with foreign key
export const posts = pgTable('posts', {
  id: text('id').primaryKey().$defaultFn(() => createId()),
  userId: text('user_id').references(() => users.id, { onDelete: 'cascade' }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  content: text('content').notNull(),
  published: boolean('published').default(false).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  posts: many(posts),
}));

export const postsRelations = relations(posts, ({ one }) => ({
  author: one(users, {
    fields: [posts.userId],
    references: [users.id],
  }),
}));
```

**Schema Best Practices:**
- Use `timestamp` with timezone for all date fields
- Add `createdAt` and `updatedAt` to all tables
- Use descriptive column names with snake_case
- Include foreign key constraints with cascade rules
- Define relations for type-safe joins
- Use CUID2 for distributed IDs instead of auto-incrementing
- Add indexes for frequently queried columns (separate file)

### 3. Query Patterns

#### `lib/queries/users.ts`
```typescript
import { db } from '@/lib/db/client';
import { users, posts } from '@/lib/db/schema';
import { eq, and, like, asc, desc } from 'drizzle-orm';

// Single query with relations
export async function getUserWithPosts(userId: string) {
  return db.query.users.findFirst({
    where: eq(users.id, userId),
    with: {
      posts: {
        orderBy: desc(posts.createdAt),
      },
    },
  });
}

// List query with filtering
export async function listUsers(filter?: { search?: string; role?: string }) {
  let query = db.select().from(users);

  if (filter?.search) {
    query = query.where(
      like(users.email, `%${filter.search}%`)
    );
  }

  if (filter?.role) {
    query = query.where(eq(users.role, filter.role));
  }

  return query.orderBy(asc(users.createdAt));
}

// Aggregation query
export async function getUserStats(userId: string) {
  return db
    .select({
      totalPosts: sql<number>`count(*)`,
      publishedPosts: sql<number>`count(*) filter (where ${posts.published} = true)`,
    })
    .from(posts)
    .where(eq(posts.userId, userId));
}

// Transaction example
export async function createUserWithProfile(
  email: string,
  name: string,
  password: string
) {
  return db.transaction(async (tx) => {
    const [user] = await tx.insert(users).values({
      email,
      name,
      password,
    }).returning();

    // Additional profile creation would happen here
    return user;
  });
}

// Batch operations
export async function updateUserStatuses(userIds: string[], isActive: boolean) {
  return db
    .update(users)
    .set({ isActive, updatedAt: new Date() })
    .where(users.id.in(userIds))
    .returning();
}
```

**Query Best Practices:**
- Always use parameterized queries (never string interpolation)
- Leverage `with` for relations instead of separate queries
- Use transactions for multi-step operations
- Add `.returning()` after mutations for immediate access to changes
- Create query functions in dedicated files organized by domain
- Use SQL type hints for aggregate queries
- Filter at the database level, not in application code
- Add pagination for large result sets

### 4. Migrations

#### Create and Run Migrations
```bash
# Generate migration from schema changes
npx drizzle-kit generate:pg

# Apply migrations
npx drizzle-kit migrate:pg

# Verify schema
npx drizzle-kit introspect:pg
```

**Migration Best Practices:**
- Generate migrations from schema changes
- Review generated migrations before applying
- Test migrations in development environment first
- Keep migrations small and focused
- Never manually edit migrations unless absolutely necessary
- Name migrations descriptively: `add_user_roles`, `create_posts_table`

### 5. Indexes and Performance

```typescript
// Add to schema.ts after table definitions
import { index } from 'drizzle-orm/pg-core';

export const userEmailIdx = index('user_email_idx').on(users.email);
export const postUserIdIdx = index('post_user_id_idx').on(posts.userId);
export const postPublishedIdx = index('post_published_idx').on(posts.published);
```

**Indexing Best Practices:**
- Index foreign keys
- Index columns used in WHERE clauses
- Index columns used in ORDER BY
- Index columns used in JOINs
- Avoid over-indexing (impacts write performance)
- Use composite indexes for multi-column filters

---

## API Layer (Next.js)

### 1. API Route Structure

#### `app/api/users/route.ts` (List & Create)
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/users?search=john&role=admin
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const role = searchParams.get('role');

    const userList = await db.query.users.findMany({
      where: and(
        search ? like(users.email, `%${search}%`) : undefined,
        role ? eq(users.role, role) : undefined
      ),
      limit: 100,
    });

    return NextResponse.json(userList);
  } catch (error) {
    console.error('Failed to fetch users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST /api/users
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    if (!body.email || !body.name || !body.password) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const [newUser] = await db
      .insert(users)
      .values(body)
      .returning();

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.includes('unique')) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 409 }
      );
    }
    console.error('Failed to create user:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}
```

#### `app/api/users/[id]/route.ts` (Get, Update, Delete)
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db/client';
import { users } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await db.query.users.findFirst({
      where: eq(users.id, params.id),
      with: {
        posts: {
          limit: 10,
          orderBy: desc(posts.createdAt),
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();

    const [updatedUser] = await db
      .update(users)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(users.id, params.id))
      .returning();

    if (!updatedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Failed to update user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const [deletedUser] = await db
      .delete(users)
      .where(eq(users.id, params.id))
      .returning();

    if (!deletedUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 }
    );
  }
}
```

### 2. API Best Practices

- **Consistent Response Format**: Always return structured responses
- **Proper HTTP Status Codes**: Use 200, 201, 400, 404, 500 appropriately
- **Input Validation**: Validate all incoming data
- **Error Logging**: Log errors server-side without exposing sensitive details
- **CORS**: Configure CORS headers if needed for cross-origin requests
- **Rate Limiting**: Implement rate limiting for public endpoints
- **Authentication**: Verify user identity before data operations
- **Query Limits**: Limit pagination size to prevent excessive queries

### 3. Response Type Definitions

#### `types/api.ts`
```typescript
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  status: number;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export type ApiError = {
  code: string;
  message: string;
  details?: Record<string, unknown>;
};
```

---

## Data Fetching (TanStack Query)

### 1. Query Client Setup

#### `providers/QueryProvider.tsx`
```typescript
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode, useState } from 'react';

export function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Remove default stale time (data is fresh by default)
            staleTime: 1000 * 60 * 5, // 5 minutes
            gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
            retry: 1,
            refetchOnWindowFocus: true,
            refetchOnReconnect: true,
          },
          mutations: {
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
```

#### `app/layout.tsx`
```typescript
import { QueryProvider } from '@/providers/QueryProvider';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  );
}
```

### 2. Query Hooks

#### `hooks/useUsers.ts`
```typescript
'use client';

import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { User } from '@/types/db';

const USERS_KEY = ['users'];

// Single user query
export function useUser(id: string | null) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: async () => {
      if (!id) return null;
      const res = await fetch(`/api/users/${id}`);
      if (!res.ok) throw new Error('Failed to fetch user');
      return res.json() as Promise<User>;
    },
    enabled: !!id, // Only run when id is provided
  });
}

// List users query with filters
export function useUsers(filters?: { search?: string; role?: string }) {
  return useQuery({
    queryKey: [USERS_KEY, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);
      if (filters?.role) params.append('role', filters.role);

      const res = await fetch(`/api/users?${params}`);
      if (!res.ok) throw new Error('Failed to fetch users');
      return res.json() as Promise<User[]>;
    },
  });
}

// Infinite query for pagination
export function useUsersInfinite() {
  return useInfiniteQuery({
    queryKey: USERS_KEY,
    queryFn: async ({ pageParam = 0 }) => {
      const res = await fetch(
        `/api/users?page=${pageParam}&limit=20`
      );
      if (!res.ok) throw new Error('Failed to fetch users');
      return res.json();
    },
    getNextPageParam: (lastPage, pages) => {
      return lastPage.hasMore ? pages.length : undefined;
    },
    initialPageParam: 0,
  });
}

// Create user mutation
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<User>) => {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create user');
      return res.json() as Promise<User>;
    },
    onSuccess: (newUser) => {
      // Invalidate and refetch user list
      queryClient.invalidateQueries({ queryKey: USERS_KEY });
      // Optionally, add to cache directly
      queryClient.setQueryData(['user', newUser.id], newUser);
    },
  });
}

// Update user mutation
export function useUpdateUser(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<User>) => {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update user');
      return res.json() as Promise<User>;
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['user', userId], updatedUser);
      queryClient.invalidateQueries({ queryKey: USERS_KEY });
    },
  });
}

// Delete user mutation
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete user');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_KEY });
    },
  });
}
```

### 3. Query Best Practices

**Stale Time Configuration:**
```typescript
// Data that rarely changes
staleTime: 1000 * 60 * 30, // 30 minutes

// Real-time data
staleTime: 0, // Always fetch fresh

// Moderate change frequency
staleTime: 1000 * 60 * 5, // 5 minutes
```

**Key Concepts:**
- **Query Keys**: Use array format `['resource', filters, id]` for consistency
- **Enabled Queries**: Use `enabled` option to control when queries run
- **Dependent Queries**: Query B depends on data from Query A (use `enabled`)
- **Optimistic Updates**: Update UI before server response
- **Cache Management**: Use `invalidateQueries` strategically
- **Refetch Strategy**: Balance between freshness and performance

**Optimistic Update Pattern:**
```typescript
export function useUpdateUserOptimistic(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Partial<User>) => {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update user');
      return res.json() as Promise<User>;
    },
    onMutate: async (newData) => {
      // Cancel any outgoing queries
      await queryClient.cancelQueries({ queryKey: ['user', userId] });

      // Get previous data
      const previousUser = queryClient.getQueryData(['user', userId]);

      // Update cache optimistically
      queryClient.setQueryData(['user', userId], (old: User) => ({
        ...old,
        ...newData,
      }));

      return { previousUser };
    },
    onError: (err, newData, context) => {
      // Revert to previous data on error
      if (context?.previousUser) {
        queryClient.setQueryData(
          ['user', userId],
          context.previousUser
        );
      }
    },
  });
}
```

### 4. Server Components + TanStack Query

**For Server Components (no client-side queries):**
```typescript
// app/(dashboard)/users/page.tsx
import { db } from '@/lib/db/client';

export default async function UsersPage() {
  // Fetch on server
  const users = await db.query.users.findMany();

  return (
    <div>
      {users.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}
```

**For Client Components (with TanStack Query):**
```typescript
// app/(dashboard)/users/client-view.tsx
'use client';

import { useUsers } from '@/hooks/useUsers';

export function UsersClientView() {
  const { data: users, isLoading, error } = useUsers();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div>
      {users?.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
    </div>
  );
}
```

---

## UI Components (ShadCN)

### 1. Component Organization

#### `components/ui/button.tsx` (ShadCN)
```typescript
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

### 2. Custom Component Patterns

#### `components/forms/UserForm.tsx`
```typescript
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useCreateUser } from '@/hooks/useUsers';
import type { User } from '@/types/db';

interface UserFormProps {
  initialData?: User;
  onSuccess?: (user: User) => void;
}

export function UserForm({ initialData, onSuccess }: UserFormProps) {
  const [formData, setFormData] = useState({
    email: initialData?.email || '',
    name: initialData?.name || '',
  });

  const createUser = useCreateUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    createUser.mutate(formData, {
      onSuccess: (user) => {
        onSuccess?.(user);
      },
    });
  };

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="text-sm font-medium">Email</label>
          <Input
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            required
          />
        </div>

        <div>
          <label className="text-sm font-medium">Name</label>
          <Input
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            required
          />
        </div>

        <Button
          type="submit"
          disabled={createUser.isPending}
          className="w-full"
        >
          {createUser.isPending ? 'Creating...' : 'Create User'}
        </Button>

        {createUser.error && (
          <div className="text-sm text-red-600">
            {createUser.error.message}
          </div>
        )}
      </form>
    </Card>
  );
}
```

### 3. ShadCN Best Practices

- **Keep Components Focused**: One responsibility per component
- **Use Compound Components**: Compose complex UIs from simple pieces
- **Leverage Slots**: Use `asChild` prop for flexible composition
- **Accessible by Default**: ShadCN components include ARIA attributes
- **Customization via Props**: Avoid modifying ShadCN source code
- **Theme Consistency**: Use CSS variables from theme configuration
- **Form Integration**: Use React Hook Form with ShadCN components

#### Form Integration Example
```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const formSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
});

type FormValues = z.infer<typeof formSchema>;

export function UserFormWithValidation() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      name: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    console.log(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="john@example.com" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit">Submit</Button>
      </form>
    </Form>
  );
}
```

---

## Integration Patterns

### 1. Full Data Flow Example

**Step 1: API Route with Drizzle**
```typescript
// app/api/users/[id]/route.ts
export async function GET(req, { params }) {
  const user = await db.query.users.findFirst({
    where: eq(users.id, params.id),
    with: { posts: { limit: 5 } },
  });
  return NextResponse.json(user);
}
```

**Step 2: React Hook with TanStack Query**
```typescript
// hooks/useUsers.ts
export function useUser(id: string) {
  return useQuery({
    queryKey: ['user', id],
    queryFn: () => fetch(`/api/users/${id}`).then(r => r.json()),
  });
}
```

**Step 3: Client Component with ShadCN**
```typescript
// components/UserProfile.tsx
'use client';

import { useUser } from '@/hooks/useUsers';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export function UserProfile({ userId }: { userId: string }) {
  const { data: user, isLoading, error } = useUser(userId);

  if (isLoading) return <Skeleton className="w-full h-32" />;
  if (error) return <div>Error loading user</div>;
  if (!user) return <div>User not found</div>;

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold">{user.name}</h2>
      <p className="text-gray-600">{user.email}</p>
      <div className="mt-4">
        <h3 className="font-semibold">Recent Posts</h3>
        {user.posts?.map(post => (
          <div key={post.id} className="mt-2">
            <p className="font-medium">{post.title}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}
```

### 2. Mutation with Side Effects

```typescript
export function usePublishPost(postId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/posts/${postId}/publish`, {
        method: 'POST',
      });
      return res.json();
    },
    // Invalidate related queries
    onSuccess: (publishedPost) => {
      // Update single post
      queryClient.setQueryData(['post', postId], publishedPost);
      // Invalidate lists that include this post
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      // Invalidate user's posts
      queryClient.invalidateQueries({ queryKey: ['userPosts'] });
    },
  });
}
```

### 3. Dependent Queries

```typescript
export function useUserWithStats(userId: string | null) {
  // First query: fetch user
  const userQuery = useQuery({
    queryKey: ['user', userId],
    queryFn: () => fetch(`/api/users/${userId}`).then(r => r.json()),
    enabled: !!userId,
  });

  // Second query: fetch stats (depends on user data)
  const statsQuery = useQuery({
    queryKey: ['userStats', userId],
    queryFn: () => fetch(`/api/users/${userId}/stats`).then(r => r.json()),
    enabled: !!userQuery.data, // Only run after user data loads
  });

  return {
    user: userQuery.data,
    stats: statsQuery.data,
    isLoading: userQuery.isLoading || statsQuery.isLoading,
  };
}
```

---

## Performance Optimization

### 1. Database Query Optimization

```typescript
// ❌ Bad: N+1 query problem
const users = await db.query.users.findMany();
for (const user of users) {
  user.posts = await db.query.posts.findMany({
    where: eq(posts.userId, user.id),
  });
}

// ✅ Good: Fetch with relations in one query
const users = await db.query.users.findMany({
  with: {
    posts: true, // Loads all posts with users
  },
});

// ✅ Good: Limit relations for performance
const users = await db.query.users.findMany({
  with: {
    posts: {
      limit: 5,
      orderBy: desc(posts.createdAt),
    },
  },
  limit: 20,
});
```

### 2. Query Caching Strategy

```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is fresh for 5 minutes
      staleTime: 1000 * 60 * 5,
      // Keep data in cache for 10 minutes
      gcTime: 1000 * 60 * 10,
      // Retry failed requests once
      retry: 1,
      // Don't refetch on every focus
      refetchOnWindowFocus: false,
      // Refetch when reconnecting
      refetchOnReconnect: true,
    },
  },
});
```

### 3. Pagination Implementation

```typescript
export function usePaginatedUsers(pageSize = 10) {
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ['users', 'paginated', page],
    queryFn: async () => {
      const offset = (page - 1) * pageSize;
      const res = await fetch(
        `/api/users?offset=${offset}&limit=${pageSize}`
      );
      return res.json();
    },
  });

  return {
    users: data?.users || [],
    total: data?.total || 0,
    page,
    pageSize,
    setPage,
    isLoading,
    error,
  };
}

// Component usage
export function UsersList() {
  const { users, page, setPage, total, pageSize } = usePaginatedUsers(20);
  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      {users.map(user => (
        <div key={user.id}>{user.name}</div>
      ))}
      <div className="flex gap-2 mt-4">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i + 1}
            onClick={() => setPage(i + 1)}
            className={page === i + 1 ? 'font-bold' : ''}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
```

### 4. Image Optimization

```typescript
import Image from 'next/image';

// ✅ Good: Next.js Image component with optimization
export function UserAvatar({ src, alt }: { src: string; alt: string }) {
  return (
    <Image
      src={src}
      alt={alt}
      width={48}
      height={48}
      className="rounded-full"
      priority={false}
    />
  );
}
```

### 5. Code Splitting

```typescript
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

// Load component only when needed
const UserStats = dynamic(() => import('./UserStats'), {
  loading: () => <Skeleton className="h-32 w-full" />,
});

export function UserPage() {
  return (
    <div>
      <h1>User Profile</h1>
      <UserStats /> {/* Loaded on demand */}
    </div>
  );
}
```

---

## Error Handling

### 1. Database Error Handling

```typescript
import { ZodError } from 'zod';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const parsed = userSchema.parse(body);

    const [user] = await db.insert(users).values(parsed).returning();
    return NextResponse.json(user, { status: 201 });

  } catch (error) {
    // Validation errors
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', issues: error.errors },
        { status: 400 }
      );
    }

    // Database errors
    if (error instanceof Error) {
      // Unique constraint violation
      if (error.message.includes('unique')) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 409 }
        );
      }

      // Foreign key violation
      if (error.message.includes('foreign key')) {
        return NextResponse.json(
          { error: 'Referenced resource not found' },
          { status: 400 }
        );
      }

      console.error('Database error:', error);
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
```

### 2. Query Error Handling

```typescript
'use client';

import { useQuery } from '@tanstack/react-query';
import { Alert, AlertDescription } from '@/components/ui/alert';

export function UserProfile({ userId }: { userId: string }) {
  const { data, error, isLoading, isError } = useQuery({
    queryKey: ['user', userId],
    queryFn: async () => {
      const res = await fetch(`/api/users/${userId}`);
      if (res.status === 404) {
        throw new Error('User not found');
      }
      if (!res.ok) {
        throw new Error('Failed to fetch user');
      }
      return res.json();
    },
    retry: (failureCount, error) => {
      // Don't retry 404s
      if (error instanceof Error && error.message === 'User not found') {
        return false;
      }
      // Retry up to 3 times
      return failureCount < 3;
    },
  });

  if (isLoading) return <div>Loading...</div>;

  if (isError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          {error?.message || 'Failed to load user'}
        </AlertDescription>
      </Alert>
    );
  }

  return <div>{data?.name}</div>;
}
```

### 3. Mutation Error Handling

```typescript
export function useUpdateUser(userId: string) {
  return useMutation({
    mutationFn: async (data: Partial<User>) => {
      const res = await fetch(`/api/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || 'Failed to update user');
      }

      return json;
    },
    onError: (error) => {
      // Show toast notification
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
}
```

### 4. Global Error Boundary

```typescript
'use client';

import { useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    // Log error to external service
    console.error('Error:', error);
  }, [error]);

  return (
    <div className="p-6">
      <Alert variant="destructive">
        <AlertDescription>
          <h2 className="font-semibold mb-2">Something went wrong</h2>
          <p className="text-sm mb-4">{error.message}</p>
          <button
            onClick={() => reset()}
            className="px-4 py-2 bg-red-600 text-white rounded"
          >
            Try again
          </button>
        </AlertDescription>
      </Alert>
    </div>
  );
}
```

---

## Security Best Practices

### 1. Environment Variables

```bash
# .env.local (NEVER commit)
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
API_KEY="your-secret-api-key"
```

### 2. SQL Injection Prevention

```typescript
// ❌ Bad: Vulnerable to SQL injection
const email = req.query.email;
const result = await db.query(`SELECT * FROM users WHERE email = '${email}'`);

// ✅ Good: Using parameterized queries (Drizzle handles this)
const result = await db.query.users.findFirst({
  where: eq(users.email, email), // email is parameterized
});
```

### 3. Authentication & Authorization

```typescript
// Middleware for protected routes
import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  const session = await getSession(request);

  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Attach user to request headers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('user-id', session.userId);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ['/api/protected/:path*', '/(dashboard)/:path*'],
};
```

### 4. CSRF Protection

```typescript
// Use built-in Next.js CSRF protection
// Forms automatically include tokens in production
import { headers } from 'next/headers';

export async function POST(request: NextRequest) {
  const headersList = headers();
  const origin = headersList.get('origin');

  // Verify origin
  if (origin !== process.env.NEXTAUTH_URL) {
    return NextResponse.json(
      { error: 'Invalid origin' },
      { status: 403 }
    );
  }

  // Process request...
}
```

### 5. Input Validation

```typescript
import { z } from 'zod';

const userCreateSchema = z.object({
  email: z.string().email('Invalid email'),
  name: z.string().min(2, 'Name too short').max(100),
  password: z.string().min(8, 'Password too short'),
  role: z.enum(['user', 'admin']).default('user'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = userCreateSchema.parse(body);

    // Use validated data safely
    const user = await db.insert(users).values(validated).returning();

    return NextResponse.json(user, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', issues: error.errors },
        { status: 400 }
      );
    }
    // ...
  }
}
```

### 6. Rate Limiting

```typescript
// Using a simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function rateLimit(ip: string, limit = 10, windowMs = 60000) {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return { allowed: true };
  }

  if (record.count < limit) {
    record.count++;
    return { allowed: true };
  }

  return { allowed: false, retryAfter: record.resetTime - now };
}

// Usage in API route
export async function POST(request: NextRequest) {
  const ip = request.ip || 'unknown';
  const { allowed, retryAfter } = rateLimit(ip);

  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    );
  }

  // Process request...
}
```

---

## Testing Strategies

### 1. Unit Testing Database Queries

```typescript
// lib/queries/__tests__/users.test.ts
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { db } from '@/lib/db/client';
import { getUserWithPosts } from '@/lib/queries/users';
import { users, posts } from '@/lib/db/schema';

describe('User Queries', () => {
  let testUserId: string;

  beforeAll(async () => {
    const [testUser] = await db.insert(users).values({
      email: 'test@example.com',
      name: 'Test User',
      password: 'hashed_password',
    }).returning();
    testUserId = testUser.id;
  });

  afterAll(async () => {
    await db.delete(users).where(eq(users.id, testUserId));
  });

  it('should fetch user with posts', async () => {
    // Create a post
    await db.insert(posts).values({
      userId: testUserId,
      title: 'Test Post',
      content: 'Test content',
    });

    const user = await getUserWithPosts(testUserId);

    expect(user).toBeDefined();
    expect(user?.posts).toHaveLength(1);
    expect(user?.posts[0].title).toBe('Test Post');
  });
});
```

### 2. API Route Testing

```typescript
// app/api/users/__tests__/route.test.ts
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GET, POST } from '../route';
import { NextRequest } from 'next/server';

describe('/api/users', () => {
  it('should fetch users', async () => {
    const request = new NextRequest('http://localhost:3000/api/users');
    const response = await GET(request);

    expect(response.status).toBe(200);
    const data = await response.json();
    expect(Array.isArray(data)).toBe(true);
  });

  it('should create a user', async () => {
    const request = new NextRequest('http://localhost:3000/api/users', {
      method: 'POST',
      body: JSON.stringify({
        email: 'newuser@example.com',
        name: 'New User',
        password: 'password123',
      }),
    });

    const response = await POST(request);

    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data.email).toBe('newuser@example.com');
  });
});
```

### 3. Component Testing

```typescript
// components/__tests__/UserProfile.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { UserProfile } from '@/components/UserProfile';

describe('UserProfile', () => {
  const queryClient = new QueryClient();

  it('should display user information', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <UserProfile userId="test-id" />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
    });
  });

  it('should show error on fetch failure', async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <UserProfile userId="invalid-id" />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/error loading user/i)).toBeInTheDocument();
    });
  });
});
```

### 4. Integration Testing

```typescript
// e2e/user-flow.test.ts
import { test, expect } from '@playwright/test';

test('should create and view a user', async ({ page }) => {
  // Navigate to user creation
  await page.goto('/users/new');

  // Fill form
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="name"]', 'Test User');

  // Submit
  await page.click('button[type="submit"]');

  // Check redirect
  await expect(page).toHaveURL('/users/test-id');

  // Verify user data
  await expect(page.locator('text=Test User')).toBeVisible();
});
```

---

## Common Pitfalls

### 1. N+1 Query Problems

```typescript
// ❌ Bad: Multiple database calls in loop
const users = await db.query.users.findMany();
for (const user of users) {
  user.posts = await db.query.posts.findMany({
    where: eq(posts.userId, user.id),
  });
}

// ✅ Good: Single query with relations
const users = await db.query.users.findMany({
  with: {
    posts: true,
  },
});
```

### 2. Stale Query Cache

```typescript
// ❌ Bad: Cache never refreshes
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity, // Data is never stale
    },
  },
});

// ✅ Good: Appropriate stale time
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
    },
  },
});
```

### 3. Missing Query Key Invalidation

```typescript
// ❌ Bad: Cache not updated after mutation
export function useUpdateUser(userId: string) {
  return useMutation({
    mutationFn: async (data) => {
      return fetch(`/api/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }).then(r => r.json());
    },
  });
}

// ✅ Good: Invalidate relevant queries
export function useUpdateUser(userId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      return fetch(`/api/users/${userId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }).then(r => r.json());
    },
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(['user', userId], updatedUser);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
```

### 4. Server Component Data Leaks

```typescript
// ❌ Bad: Exposing sensitive data in client components
'use client';

export function UserData({ user }: { user: User }) {
  return <div>{user.password}</div>; // Never expose passwords!
}

// ✅ Good: Filter sensitive data
export function UserData({ user }: { user: Omit<User, 'password'> }) {
  return <div>{user.email}</div>;
}
```

### 5. Missing Error Boundaries

```typescript
// ❌ Bad: Unhandled errors crash the app
export function UserList() {
  const { data } = useQuery({
    queryKey: ['users'],
    queryFn: () => fetch('/api/users').then(r => r.json()),
  });

  return data.map(u => <div>{u.name}</div>); // Crashes if data is undefined
}

// ✅ Good: Handle all states
export function UserList() {
  const { data = [], isLoading, error } = useQuery({
    queryKey: ['users'],
    queryFn: () => fetch('/api/users').then(r => r.json()),
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (data.length === 0) return <div>No users found</div>;

  return data.map(u => <div key={u.id}>{u.name}</div>);
}
```

### 6. Race Conditions in Mutations

```typescript
// ❌ Bad: Multiple mutations can interfere
export function useBulkUpdateUsers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userIds: string[]) => {
      return Promise.all(
        userIds.map(id =>
          fetch(`/api/users/${id}`, { method: 'PUT' }).then(r => r.json())
        )
      );
    },
    onSuccess: () => {
      // Invalidate all queries (too broad)
      queryClient.invalidateQueries({});
    },
  });
}

// ✅ Good: Be specific about invalidation
export function useBulkUpdateUsers() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: { id: string; data: Partial<User> }[]) => {
      return Promise.all(
        updates.map(({ id, data }) =>
          fetch(`/api/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
          }).then(r => r.json())
        )
      );
    },
    onSuccess: (updatedUsers) => {
      // Update each user individually
      updatedUsers.forEach(user => {
        queryClient.setQueryData(['user', user.id], user);
      });
      // Invalidate list queries
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });
}
```

---

## Quick Reference Checklist

### Before Deploying

- [ ] Environment variables validated with `env.ts`
- [ ] Database migrations tested and reversible
- [ ] All API routes have proper error handling
- [ ] Query cache strategy defined
- [ ] Input validation on all API endpoints
- [ ] CORS headers configured if needed
- [ ] Rate limiting implemented
- [ ] Sensitive data removed from API responses
- [ ] Components have loading and error states
- [ ] Performance optimized (no N+1 queries)
- [ ] Tests written for critical paths
- [ ] TypeScript strict mode enabled
- [ ] Secrets not committed to git

### Code Organization

- [ ] Database queries in dedicated files
- [ ] API routes follow RESTful conventions
- [ ] Custom hooks for data fetching
- [ ] ShadCN components properly composed
- [ ] Middleware for cross-cutting concerns
- [ ] Types exported from centralized locations
- [ ] Constants defined in constants file
- [ ] Utility functions organized by domain

### Performance

- [ ] Pagination implemented for large lists
- [ ] Images optimized with Next.js Image
- [ ] Dynamic imports for heavy components
- [ ] Query stale time appropriately configured
- [ ] Unnecessary re-renders eliminated
- [ ] Database indexes on frequently queried columns
- [ ] Connection pooling enabled (Neon default)

---

## Resources

- [Neon Documentation](https://neon.tech/docs)
- [Drizzle ORM](https://orm.drizzle.team)
- [Next.js App Router](https://nextjs.org/docs/app)
- [TanStack Query Docs](https://tanstack.com/query)
- [ShadCN UI](https://ui.shadcn.com)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook)

---

**Version**: 1.0  
**Last Updated**: June 2026  
**Maintained By**: Development Team