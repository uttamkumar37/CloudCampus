package com.cloudcampus.domain.service;

import com.cloudcampus.common.exception.BadRequestException;
import com.cloudcampus.common.exception.NotFoundException;
import com.cloudcampus.domain.dto.DomainResponse;
import com.cloudcampus.domain.entity.CustomDomain;
import com.cloudcampus.domain.repository.CustomDomainRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import javax.naming.directory.Attributes;
import javax.naming.directory.DirContext;
import javax.naming.directory.InitialDirContext;
import java.util.Hashtable;
import java.util.List;
import java.util.UUID;

@Service
public class CustomDomainServiceImpl implements CustomDomainService {

    private static final Logger log = LoggerFactory.getLogger(CustomDomainServiceImpl.class);

    private final CustomDomainRepository repository;

    public CustomDomainServiceImpl(CustomDomainRepository repository) {
        this.repository = repository;
    }

    @Override
    @Transactional
    public DomainResponse register(UUID tenantId, String domain) {
        String normalized = domain.toLowerCase().trim();
        if (repository.existsByTenantIdAndDomain(tenantId, normalized)) {
            throw new BadRequestException("Domain already registered for this tenant");
        }
        CustomDomain cd = CustomDomain.create(tenantId, normalized);
        return DomainResponse.from(repository.save(cd));
    }

    @Override
    @Transactional
    public DomainResponse verify(UUID tenantId, UUID domainId) {
        CustomDomain cd = repository.findByIdAndTenantId(domainId, tenantId)
                .orElseThrow(() -> new NotFoundException("Domain not found"));

        cd.recordCheck();

        boolean verified = checkDnsTxtRecord(cd.getDomain(), cd.getVerificationToken());
        if (verified) {
            cd.markVerified();
            log.info("Domain verified [tenantId={}, domain={}]", tenantId, cd.getDomain());
        } else {
            cd.markFailed("DNS TXT record not found. Add: _cloudcampus-verify."
                    + cd.getDomain() + " TXT " + cd.getVerificationToken());
            log.warn("Domain verification failed [tenantId={}, domain={}]", tenantId, cd.getDomain());
        }
        return DomainResponse.from(repository.save(cd));
    }

    @Override
    public List<DomainResponse> list(UUID tenantId) {
        return repository.findAllByTenantId(tenantId).stream()
                .map(DomainResponse::from)
                .toList();
    }

    @Override
    @Transactional
    public void delete(UUID tenantId, UUID domainId) {
        CustomDomain cd = repository.findByIdAndTenantId(domainId, tenantId)
                .orElseThrow(() -> new NotFoundException("Domain not found"));
        repository.delete(cd);
    }

    // ── DNS TXT verification ─────────────────────────────────────────────────

    private boolean checkDnsTxtRecord(String domain, String expectedToken) {
        String dnsName = "_cloudcampus-verify." + domain;
        try {
            Hashtable<String, String> env = new Hashtable<>();
            env.put("java.naming.factory.initial", "com.sun.jndi.dns.DnsContextFactory");
            env.put("java.naming.provider.url", "dns:");
            env.put("com.sun.jndi.dns.timeout.initial", "3000");
            env.put("com.sun.jndi.dns.timeout.retries", "1");

            DirContext ctx = new InitialDirContext(env);
            Attributes attrs = ctx.getAttributes(dnsName, new String[]{"TXT"});
            ctx.close();

            if (attrs == null || attrs.get("TXT") == null) return false;

            // Each TXT value may be quoted — strip quotes and compare
            var txtEnum = attrs.get("TXT").getAll();
            while (txtEnum.hasMore()) {
                String val = txtEnum.next().toString().replace("\"", "").trim();
                if (val.equals(expectedToken)) return true;
            }
        } catch (Exception e) {
            // DNS lookup failure (NXDOMAIN, timeout, etc.) — treat as not verified
            log.debug("DNS lookup failed for {}: {}", dnsName, e.getMessage());
        }
        return false;
    }
}
