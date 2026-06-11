package com.cloudcampus.common.context;

public final class RequestContextAttributes {

    public static final String AUTHENTICATED_USER = RequestContextAttributes.class.getName() + ".AUTHENTICATED_USER";
    public static final String REQUEST_CONTEXT = RequestContextAttributes.class.getName() + ".REQUEST_CONTEXT";
    public static final String CORRELATION_ID = RequestContextAttributes.class.getName() + ".CORRELATION_ID";

    private RequestContextAttributes() {
    }
}
