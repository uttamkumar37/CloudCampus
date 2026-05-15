package com.cloudcampus.common.exception;

/**
 * Thrown when a tenant-level usage limit configured in TenantConfig is exceeded (CC-0312).
 *
 * Maps to 422 Unprocessable Entity — the request is valid but cannot be fulfilled
 * because the tenant has reached a configured capacity ceiling.
 *
 * Examples:
 *   - Admitting a student when the school has reached MAX_STUDENTS_PER_SCHOOL
 *   - Creating a staff member when the school has reached MAX_STAFF_PER_SCHOOL
 *   - Creating a school when the tenant has reached MAX_SCHOOLS
 */
public class UsageLimitExceededException extends RuntimeException {

    private final String limitKey;
    private final long   current;
    private final long   limit;

    public UsageLimitExceededException(String limitKey, long current, long limit) {
        super(String.format(
                "Usage limit reached for %s: current=%d, limit=%d. "
                + "Increase the limit in tenant configuration or contact your administrator.",
                limitKey, current, limit));
        this.limitKey = limitKey;
        this.current  = current;
        this.limit    = limit;
    }

    public String getLimitKey() { return limitKey; }
    public long   getCurrent()  { return current; }
    public long   getLimit()    { return limit; }
}
