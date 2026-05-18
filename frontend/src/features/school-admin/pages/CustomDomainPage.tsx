import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  listDomainsApi, registerDomainApi, verifyDomainApi, deleteDomainApi,
  type DomainResponse,
} from '../api/domainApi';

const STATUS_COLOR: Record<string, string> = {
  PENDING:  'bg-yellow-100 text-yellow-800',
  VERIFIED: 'bg-green-100  text-green-800',
  FAILED:   'bg-red-100    text-red-800',
};

function errorMessage(error: unknown, fallback: string) {
  const candidate = error as { response?: { data?: { error?: { message?: string } } } };
  return candidate.response?.data?.error?.message ?? fallback;
}

export function CustomDomainPage() {
  const qc = useQueryClient();
  const [domain, setDomain] = useState('');
  const [error, setError]   = useState('');

  const { data: domains = [], isLoading } = useQuery({
    queryKey: ['custom-domains'],
    queryFn:  listDomainsApi,
  });

  const register = useMutation({
    mutationFn: () => registerDomainApi(domain),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['custom-domains'] }); setDomain(''); setError(''); },
    onError: (e: unknown) => setError(errorMessage(e, 'Registration failed')),
  });

  const verify = useMutation({
    mutationFn: (id: string) => verifyDomainApi(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['custom-domains'] }),
  });

  const remove = useMutation({
    mutationFn: (id: string) => deleteDomainApi(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['custom-domains'] }),
  });

  return (
    <div className="p-6 max-w-3xl">
      <h1 className="text-xl font-bold text-gray-900 mb-1">Custom Domain</h1>
      <p className="text-sm text-gray-500 mb-6">
        Map your own domain (e.g. <code>erp.myschool.edu</code>) to your CloudCampus portal.
        Verify ownership by adding a DNS TXT record.
      </p>

      {/* Register form */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 mb-6">
        <h2 className="text-sm font-semibold text-gray-700 mb-3">Register a domain</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="erp.myschool.edu"
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => register.mutate()}
            disabled={!domain.trim() || register.isPending}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {register.isPending ? 'Registering…' : 'Register'}
          </button>
        </div>
        {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
      </div>

      {/* Domain list */}
      {isLoading ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : domains.length === 0 ? (
        <p className="text-sm text-gray-500">No domains registered yet.</p>
      ) : (
        <div className="space-y-4">
          {domains.map((d: DomainResponse) => (
            <div key={d.id} className="rounded-lg border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-900">{d.domain}</span>
                <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_COLOR[d.status]}`}>
                  {d.status}
                </span>
              </div>

              {d.status !== 'VERIFIED' && (
                <div className="mb-3 rounded-md bg-gray-50 border border-gray-200 p-3">
                  <p className="text-xs font-semibold text-gray-600 mb-1">
                    Add this DNS TXT record to verify ownership:
                  </p>
                  <code className="block text-xs text-blue-700 break-all">{d.dnsRecord}</code>
                </div>
              )}

              {d.failureReason && (
                <p className="mb-2 text-xs text-red-600">{d.failureReason}</p>
              )}

              {d.verifiedAt && (
                <p className="text-xs text-gray-400 mb-2">
                  Verified {new Date(d.verifiedAt).toLocaleDateString()}
                </p>
              )}

              <div className="flex gap-2">
                {d.status !== 'VERIFIED' && (
                  <button
                    onClick={() => verify.mutate(d.id)}
                    disabled={verify.isPending}
                    className="rounded-lg border border-blue-600 px-3 py-1.5 text-xs font-medium text-blue-600 hover:bg-blue-50 disabled:opacity-50"
                  >
                    {verify.isPending ? 'Checking DNS…' : 'Verify Now'}
                  </button>
                )}
                <button
                  onClick={() => remove.mutate(d.id)}
                  disabled={remove.isPending}
                  className="rounded-lg border border-red-300 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
