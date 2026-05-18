package com.cloudcampus.experience.audit;

public enum InvestorRoomAccessEvent {
    /** Public page load — metadata only returned (PASSWORD-mode room). */
    METADATA_ACCESS,
    /** Full content returned without a password (LINK_ONLY room). */
    CONTENT_ACCESS,
    /** Password submitted and accepted — full content returned. */
    UNLOCK_SUCCESS,
    /** Password submitted but rejected — empty response returned. */
    UNLOCK_FAILURE,
    /** Access attempt on a room whose expiresAt has passed. */
    EXPIRED
}
