# BrightThanks domain model

## Roles

- **Administrator** manages employees, roles, occasions, company values, and award revocations. Administrators can recognize any active employee.
- **Manager** reads employee data and recognizes direct reports.
- **Employee** signs in, reads the appreciation board, and views their points balance.

Roles use the `roles` and `role_user` tables, allowing a user to hold multiple roles without changing the user schema.

## Entities

| Entity         | Purpose                                          | Important attributes                                                                               |
| -------------- | ------------------------------------------------ | -------------------------------------------------------------------------------------------------- |
| `User`         | Authentication identity                          | name, email, password                                                                              |
| `Role`         | Authorization group                              | name, label                                                                                        |
| `Employee`     | HR profile and reporting hierarchy               | user, manager, employee number, department, job title, joined date, active flag                    |
| `Occasion`     | Reusable recognition event                       | name, description, default points, active flag                                                     |
| `CompanyValue` | Behaviors attached to occasions and recognitions | name, description, color, active flag                                                              |
| `Recognition`  | Immutable award record                           | recipient, awarder, occasion, type, message, points, SGD amount, request key, revocation data      |
| `Wallet`       | Current materialized point balance               | user, balance, optimistic version                                                                  |
| `LedgerEntry`  | Append-only financial audit trail                | wallet, recognition, credit/reversal type, amount, resulting balance, unique request key, metadata |

## Relationships

- Users and roles are many-to-many.
- A user has one employee profile and one wallet.
- An employee optionally belongs to a manager and a manager has many direct reports.
- Occasions and company values are many-to-many.
- Recognitions and company values are many-to-many.
- A user has many recognitions received and many recognitions awarded.
- A wallet has many ledger entries; each entry belongs to one recognition.

## Security and consistency

Laravel policies are the primary application authorization boundary. Supabase/PostgreSQL RLS additionally blocks `anon` and `authenticated` Data API roles from sensitive tables; only active occasion/value reference data is publicly selectable. The Laravel database connection should remain a server-only credential.

The user interface is a standalone Vite/React client in `frontend/`. It communicates only through the versioned `/api/v1` JSON API and uses Sanctum's CSRF-protected stateful session cookies. No Inertia page routes are part of the active application flow.

Award processing runs in one database transaction, locks the wallet row, and uses a unique client request key. Repeating the same request returns the original recognition without applying a second credit. Revocation creates a reversal entry and never deletes ledger history.
