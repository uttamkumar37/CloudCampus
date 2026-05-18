import { useState } from 'react';
import ContentBlockEditor from './ContentBlockEditor';
import DemoScenarioManager from './DemoScenarioManager';
import InvestorRoomBuilder from './InvestorRoomBuilder';

type Tab = 'blocks' | 'demo' | 'investor';

const TABS: { id: Tab; label: string; icon: string; description: string }[] = [
  { id: 'blocks', label: 'Content Blocks', icon: '✏️', description: 'Edit and publish all public-facing copy' },
  { id: 'demo', label: 'Demo Scenarios', icon: '🚀', description: 'Configure self-serve interactive demos' },
  { id: 'investor', label: 'Investor Rooms', icon: '🏦', description: 'Private data rooms for investors' },
];

export default function ExperienceControlCenter() {
  const [activeTab, setActiveTab] = useState<Tab>('blocks');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="max-w-7xl mx-auto">
          <p className="text-xs text-blue-600 font-semibold uppercase tracking-widest mb-1">
            Super Admin
          </p>
          <h1 className="text-2xl font-bold text-gray-900">Experience Control Center</h1>
          <p className="text-gray-500 text-sm mt-1">
            Manage all public-facing content, demos, and investor rooms — zero code changes required.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-8">
        {/* Tab cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`text-left rounded-xl p-5 border-2 transition ${
                activeTab === tab.id
                  ? 'border-blue-600 bg-blue-50 shadow-sm'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
              }`}
            >
              <div className="text-2xl mb-2">{tab.icon}</div>
              <div className="font-semibold text-gray-900 mb-0.5">{tab.label}</div>
              <div className="text-xs text-gray-500">{tab.description}</div>
            </button>
          ))}
        </div>

        {/* Active tab content */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          {activeTab === 'blocks'   && <ContentBlockEditor />}
          {activeTab === 'demo'     && <DemoScenarioManager />}
          {activeTab === 'investor' && <InvestorRoomBuilder />}
        </div>
      </div>
    </div>
  );
}
