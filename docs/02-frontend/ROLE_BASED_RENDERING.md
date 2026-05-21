# Role Based Rendering

`ProtectedRoute` enforces client-side role navigation and feature entitlement UX:
- Missing auth redirects to `/login`.
- Wrong role redirects to `/403`.
- Missing feature redirects to `/plan-upgrade`, except `SUPER_ADMIN`.

## Rules
- Route guards must mirror backend RBAC.
- Hidden buttons are not security controls; backend must still reject unauthorized calls.
- Never rely on frontend tenant ids for ownership decisions.
