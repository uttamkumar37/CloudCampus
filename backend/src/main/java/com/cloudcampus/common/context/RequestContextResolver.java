package com.cloudcampus.common.context;

import com.cloudcampus.identity.auth.session.AuthenticatedUserResolver;

import jakarta.servlet.http.HttpServletRequest;

import org.springframework.stereotype.Component;

@Component
public class RequestContextResolver {

    private final AuthenticatedUserResolver authenticatedUserResolver;

    public RequestContextResolver(AuthenticatedUserResolver authenticatedUserResolver) {
        this.authenticatedUserResolver = authenticatedUserResolver;
    }

    public RequestContext requireContext(HttpServletRequest request) {
        Object cachedContext = request.getAttribute(RequestContextAttributes.REQUEST_CONTEXT);
        if (cachedContext instanceof RequestContext requestContext) {
            return requestContext;
        }

        authenticatedUserResolver.requireUser(request);
        Object resolvedContext = request.getAttribute(RequestContextAttributes.REQUEST_CONTEXT);
        if (resolvedContext instanceof RequestContext requestContext) {
            return requestContext;
        }
        throw new IllegalStateException("Request context was not resolved for the authenticated request.");
    }
}
