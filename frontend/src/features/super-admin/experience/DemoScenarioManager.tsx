import { useQuery } from '@tanstack/react-query';
import api from '@/shared/api/axiosInstance';

interface DemoScenario {
  id: string;
  name: string;
  slug: string;
  description: string;
  schoolProfile: Record<string, unknown>;
  features: string[];
  sessionTtlMin: number;
  displayOrder: number;
}

async function fetchScenarios(): Promise<DemoScenario[]> {
  const res = await api.get<{ data: DemoScenario[] }>('/v1/super-admin/experience/demo-scenarios');
  return res.data.data;
}

export default function DemoScenarioManager() {
  const { data: scenarios = [], isLoading } = useQuery({
    queryKey: ['sa:exp:scenarios'],
    queryFn: fetchScenarios,
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Demo Scenarios</h2>
        <span className="text-sm text-gray-400">{scenarios.length} scenarios</span>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {scenarios.map((scenario) => (
            <ScenarioCard key={scenario.id} scenario={scenario} />
          ))}
        </div>
      )}
    </div>
  );
}

function ScenarioCard({ scenario }: { scenario: DemoScenario }) {
  const profile = scenario.schoolProfile as Record<string, string>;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-gray-900">{scenario.name}</h3>
          <p className="text-xs text-gray-400 font-mono mt-0.5">{scenario.slug}</p>
        </div>
        <span className="bg-green-100 text-green-700 text-xs font-semibold px-2 py-0.5 rounded-full">
          Active
        </span>
      </div>

      <p className="text-sm text-gray-500 mb-4">{scenario.description}</p>

      <div className="grid grid-cols-2 gap-2 mb-4 text-xs text-gray-600">
        <div><span className="font-medium">Type:</span> {profile.type}</div>
        <div><span className="font-medium">Students:</span> {profile.studentCount}</div>
        <div><span className="font-medium">City:</span> {profile.city}</div>
        <div><span className="font-medium">TTL:</span> {scenario.sessionTtlMin} min</div>
      </div>

      <div className="flex flex-wrap gap-1">
        {scenario.features.slice(0, 4).map((f) => (
          <span key={f} className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
            {f.replace(/_/g, ' ')}
          </span>
        ))}
        {scenario.features.length > 4 && (
          <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
            +{scenario.features.length - 4}
          </span>
        )}
      </div>
    </div>
  );
}
