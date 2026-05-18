import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/shared/api/axiosInstance';

interface InvestorRoom {
  id: string;
  roomCode: string;
  title: string;
  accessMode: string;
  expiresAt: string | null;
  status: string;
}

const SA_BASE = '/v1/super-admin/experience';

async function fetchRooms(): Promise<InvestorRoom[]> {
  const res = await api.get<{ data: InvestorRoom[] }>(`${SA_BASE}/investor-rooms`);
  return res.data.data;
}

async function createRoom(payload: {
  title: string;
  accessMode: string;
  accessPassword?: string;
  expiresInDays: number;
}): Promise<InvestorRoom> {
  const res = await api.post<{ data: InvestorRoom }>(`${SA_BASE}/investor-rooms`, payload);
  return res.data.data;
}

export default function InvestorRoomBuilder() {
  const qc = useQueryClient();
  const { data: rooms = [], isLoading } = useQuery({
    queryKey: ['sa:exp:rooms'],
    queryFn: fetchRooms,
  });

  const { mutate: doCreate, isPending } = useMutation({
    mutationFn: createRoom,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sa:exp:rooms'] });
      setShowCreate(false);
    },
  });

  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    title: '',
    accessMode: 'LINK_ONLY',
    accessPassword: '',
    expiresInDays: 30,
  });

  const roomLink = (code: string) => `${window.location.origin}/investor/${code}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Investor Rooms</h2>
          <p className="text-sm text-gray-400 mt-0.5">{rooms.length} active rooms</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
        >
          + Create Room
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {rooms.length === 0 ? (
            <div className="text-center text-gray-400 py-12 bg-gray-50 rounded-xl">
              <p className="text-3xl mb-2">🏦</p>
              <p>No investor rooms yet.</p>
            </div>
          ) : (
            rooms.map((room) => (
              <div key={room.id} className="bg-white rounded-xl border border-gray-200 px-5 py-4 flex items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold text-gray-900">{room.title}</h3>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      room.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                    }`}>{room.status}</span>
                    <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full">
                      {room.accessMode.replace('_', ' ')}
                    </span>
                    {room.expiresAt && (
                      <span className="text-xs text-gray-400">
                        Expires {new Date(room.expiresAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 font-mono mt-0.5 truncate">{roomLink(room.roomCode)}</p>
                </div>
                <a
                  href={`/investor/${room.roomCode}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline whitespace-nowrap"
                >
                  Open ↗
                </a>
                <button
                  onClick={() => navigator.clipboard.writeText(roomLink(room.roomCode))}
                  className="text-sm text-gray-500 hover:text-gray-700 whitespace-nowrap"
                >
                  Copy Link
                </button>
              </div>
            ))
          )}
        </div>
      )}

      {showCreate && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
              <h3 className="text-lg font-semibold">New Investor Room</h3>
              <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Room Title</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="Series A Data Room"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Access Mode</label>
                <select
                  value={form.accessMode}
                  onChange={(e) => setForm({ ...form, accessMode: e.target.value })}
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="LINK_ONLY">Link Only (anyone with link)</option>
                  <option value="PASSWORD">Password Protected</option>
                  <option value="EMAIL_GATE">Email Gate</option>
                </select>
              </div>
              {form.accessMode === 'PASSWORD' && (
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Access Password</label>
                  <input
                    type="text"
                    value={form.accessPassword}
                    onChange={(e) => setForm({ ...form, accessPassword: e.target.value })}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Expires in (days)</label>
                <input
                  type="number"
                  value={form.expiresInDays}
                  onChange={(e) => setForm({ ...form, expiresInDays: Number(e.target.value) })}
                  min={1}
                  max={365}
                  className="w-32 border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 pb-6">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 text-sm text-gray-600">Cancel</button>
              <button
                onClick={() => doCreate(form)}
                disabled={isPending || !form.title}
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-50"
              >
                {isPending ? 'Creating…' : 'Create Room'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
