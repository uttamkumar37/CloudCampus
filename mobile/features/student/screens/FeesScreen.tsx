import { useQuery } from '@tanstack/react-query';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { listMyFees, type MobileFeeRecord, type FeeStatus } from '../api/studentApi';

const STATUS_COLOR: Record<FeeStatus, { bg: string; text: string }> = {
  PENDING:  { bg: '#fef3c7', text: '#d97706' },
  PARTIAL:  { bg: '#dbeafe', text: '#2563eb' },
  PAID:     { bg: '#dcfce7', text: '#16a34a' },
  WAIVED:   { bg: '#f3f4f6', text: '#6b7280' },
  OVERDUE:  { bg: '#fee2e2', text: '#dc2626' },
};

function fmt(n: number) {
  return '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 0 });
}

function FeeRow({ item }: { item: MobileFeeRecord }) {
  const due   = new Date(item.dueDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  const color = STATUS_COLOR[item.status];

  return (
    <View style={styles.row}>
      <View style={styles.rowTop}>
        <Text style={styles.category} numberOfLines={1}>{item.categoryName}</Text>
        <View style={[styles.badge, { backgroundColor: color.bg }]}>
          <Text style={[styles.badgeText, { color: color.text }]}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.amounts}>
        <View style={styles.amtCol}>
          <Text style={styles.amtValue}>{fmt(item.amountDue)}</Text>
          <Text style={styles.amtLabel}>Due</Text>
        </View>
        <View style={styles.amtCol}>
          <Text style={[styles.amtValue, { color: '#16a34a' }]}>{fmt(item.amountPaid)}</Text>
          <Text style={styles.amtLabel}>Paid</Text>
        </View>
        {item.discount > 0 && (
          <View style={styles.amtCol}>
            <Text style={[styles.amtValue, { color: '#7c3aed' }]}>{fmt(item.discount)}</Text>
            <Text style={styles.amtLabel}>Discount</Text>
          </View>
        )}
        <View style={styles.amtCol}>
          <Text style={[styles.amtValue, { color: item.balance > 0 ? '#dc2626' : '#16a34a' }]}>
            {fmt(item.balance)}
          </Text>
          <Text style={styles.amtLabel}>Balance</Text>
        </View>
      </View>

      <Text style={styles.dueDate}>Due: {due}</Text>
      {item.notes ? <Text style={styles.notes}>{item.notes}</Text> : null}
    </View>
  );
}

export default function FeesScreen() {
  const { data = [], isLoading, isError, refetch, isFetching } = useQuery({
    queryKey: ['student-fees'],
    queryFn:  listMyFees,
  });

  if (isLoading) {
    return <View style={styles.center}><ActivityIndicator size="large" color="#1e3a5f" /></View>;
  }
  if (isError) {
    return <View style={styles.center}><Text style={styles.errText}>Failed to load fee records.</Text></View>;
  }

  const totalDue     = data.reduce((s, r) => s + r.amountDue,  0);
  const totalPaid    = data.reduce((s, r) => s + r.amountPaid, 0);
  const totalBalance = data.reduce((s, r) => s + r.balance,    0);

  return (
    <FlatList
      data={data}
      keyExtractor={(i) => i.id}
      contentContainerStyle={styles.list}
      refreshControl={<RefreshControl refreshing={isFetching} onRefresh={refetch} />}
      ListHeaderComponent={
        data.length > 0 ? (
          <View style={styles.summary}>
            {[
              { label: 'Total Due',  value: fmt(totalDue),     color: '#1e3a5f' },
              { label: 'Paid',       value: fmt(totalPaid),    color: '#16a34a' },
              { label: 'Balance',    value: fmt(totalBalance), color: totalBalance > 0 ? '#dc2626' : '#16a34a' },
            ].map(({ label, value, color }) => (
              <View key={label} style={styles.summaryCard}>
                <Text style={[styles.summaryValue, { color }]}>{value}</Text>
                <Text style={styles.summaryLabel}>{label}</Text>
              </View>
            ))}
          </View>
        ) : null
      }
      ListEmptyComponent={
        <View style={styles.center}>
          <Text style={styles.empty}>No fee records found.</Text>
        </View>
      }
      renderItem={({ item }) => <FeeRow item={item} />}
    />
  );
}

const styles = StyleSheet.create({
  list:    { padding: 16, gap: 12 },
  center:  { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  errText: { color: '#dc2626', fontSize: 14 },
  empty:   { color: '#9ca3af', fontSize: 14 },

  summary: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  summaryCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 10,
    alignItems: 'center',
  },
  summaryValue: { fontSize: 14, fontWeight: '800' },
  summaryLabel: { fontSize: 10, color: '#9ca3af', marginTop: 2 },

  row: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    padding: 14,
    gap: 8,
  },
  rowTop:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  category:  { flex: 1, fontSize: 14, fontWeight: '700', color: '#1f2937' },
  badge:     { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 11, fontWeight: '700' },

  amounts:  { flexDirection: 'row', gap: 12 },
  amtCol:   { alignItems: 'center', minWidth: 60 },
  amtValue: { fontSize: 14, fontWeight: '700', color: '#1f2937' },
  amtLabel: { fontSize: 10, color: '#9ca3af', marginTop: 2 },

  dueDate: { fontSize: 11, color: '#9ca3af' },
  notes:   { fontSize: 11, color: '#6b7280', fontStyle: 'italic' },
});
