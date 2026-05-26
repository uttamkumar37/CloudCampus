import { SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';

import { mobileShellPortals } from './src/app/mobileShellModel';

export default function App() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.eyebrow}>CloudCampus STRUCT-002</Text>
        <Text style={styles.title}>Mobile baseline shell</Text>
        <Text style={styles.summary}>
          The mobile app is ready for future parent, teacher, student, and school admin
          flows after the approved backend onboarding foundation exists.
        </Text>

        <View style={styles.cardList}>
          {mobileShellPortals.map((portal) => (
            <View key={portal.role} style={styles.card}>
              <Text style={styles.cardTitle}>{portal.role}</Text>
              <Text style={styles.cardText}>{portal.initialScope}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f7fb',
  },
  container: {
    padding: 24,
    gap: 16,
  },
  eyebrow: {
    color: '#2f6b4f',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  title: {
    color: '#17202a',
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: 0,
  },
  summary: {
    color: '#4b5563',
    fontSize: 16,
    lineHeight: 24,
  },
  cardList: {
    gap: 12,
    marginTop: 8,
  },
  card: {
    borderColor: '#d9e2ec',
    borderRadius: 8,
    borderWidth: 1,
    backgroundColor: '#ffffff',
    padding: 16,
  },
  cardTitle: {
    color: '#243b53',
    fontSize: 16,
    fontWeight: '700',
  },
  cardText: {
    color: '#52616b',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6,
  },
});
