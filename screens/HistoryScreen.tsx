import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Surface, Text } from 'react-native-paper';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

export default function HistoryScreen() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    if (!auth.currentUser) return;

    const q = query(
      collection(db, 'users', auth.currentUser.uid, 'transactions'),
      orderBy('timestamp', 'desc')
    );

    const unsub = onSnapshot(q, snap => {
      setTransactions(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return unsub;
  }, []);

  return (
    <View style={styles.container}>
      <FlatList
        data={transactions}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={{ fontSize: 40, marginBottom: 10 }}>📜</Text>
            <Text style={styles.emptyText}>No transaction records found.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const isBuy = item.type === 'BUY';
          return (
            <Surface style={styles.card} elevation={1}>
              <View style={styles.leftCol}>
                <View style={[styles.badge, { backgroundColor: isBuy ? '#064e3b' : '#4c0519' }]}>
                  <Text style={[styles.badgeText, { color: isBuy ? '#34d399' : '#fb7185' }]}>
                    {item.type}
                  </Text>
                </View>
                <View>
                  <Text variant="titleMedium" style={styles.assetSymbol}>
                    {item.symbol?.toUpperCase()}
                  </Text>
                  <Text style={styles.timeText}>
                    {new Date(item.timestamp).toLocaleDateString()} • {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>
              </View>

              <View style={styles.rightCol}>
                <Text variant="titleMedium" style={[styles.totalAmount, { color: isBuy ? '#f43f5e' : '#10b981' }]}>
                  {isBuy ? '-' : '+'}${item.total?.toFixed(2)}
                </Text>
                <Text style={styles.unitDetail}>
                  {item.quantity} @ ${item.price?.toLocaleString()}
                </Text>
              </View>
            </Surface>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090d16', padding: 16 },
  card: {
    backgroundColor: '#111726',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  leftCol: { flexDirection: 'row', alignItems: 'center' },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 12,
  },
  badgeText: { fontWeight: '800', fontSize: 11 },
  assetSymbol: { fontWeight: '700', color: '#f8fafc' },
  timeText: { color: '#64748b', fontSize: 11, marginTop: 2 },
  rightCol: { alignItems: 'flex-end' },
  totalAmount: { fontWeight: '700' },
  unitDetail: { color: '#64748b', fontSize: 11, marginTop: 2 },
  emptyContainer: { alignItems: 'center', marginTop: 80 },
  emptyText: { color: '#64748b', fontSize: 15 },
});