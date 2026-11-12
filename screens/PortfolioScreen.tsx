import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet, Image } from 'react-native';
import { Surface, Text, Divider } from 'react-native-paper';
import { collection, doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

export default function PortfolioScreen() {
  const [balance, setBalance] = useState(0);
  const [holdings, setHoldings] = useState([]);

  useEffect(() => {
    if (!auth.currentUser) return;

    const userUnsub = onSnapshot(doc(db, 'users', auth.currentUser.uid), docSnap => {
      if (docSnap.exists()) setBalance(docSnap.data().cashBalance || 0);
    });

    const holdingsUnsub = onSnapshot(
      collection(db, 'users', auth.currentUser.uid, 'holdings'),
      snapshot => {
        const list = snapshot.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(item => item.quantity > 0);
        setHoldings(list);
      }
    );

    return () => {
      userUnsub();
      holdingsUnsub();
    };
  }, []);

  const totalHoldingsValue = holdings.reduce(
    (sum, item) => sum + item.quantity * (item.avgPrice || 0),
    0
  );
  const totalNetWorth = balance + totalHoldingsValue;

  return (
    <View style={styles.container}>
      {/* Hero Net Worth Card */}
      <Surface style={styles.netWorthCard} elevation={3}>
        <Text style={styles.netWorthLabel}>ESTIMATED PORTFOLIO VALUE</Text>
        <Text variant="headlineLarge" style={styles.netWorthText}>
          ${totalNetWorth.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </Text>

        <Divider style={styles.divider} />

        <View style={styles.breakdownRow}>
          <View>
            <Text style={styles.breakdownLabel}>Available Cash</Text>
            <Text style={styles.breakdownValue}>${balance.toFixed(2)}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={styles.breakdownLabel}>Invested Capital</Text>
            <Text style={[styles.breakdownValue, { color: '#38bdf8' }]}>
              ${totalHoldingsValue.toFixed(2)}
            </Text>
          </View>
        </View>
      </Surface>

      <Text variant="titleMedium" style={styles.sectionHeader}>Open Positions ({holdings.length})</Text>

      <FlatList
        data={holdings}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>💼</Text>
            <Text style={styles.emptyText}>No open positions yet.</Text>
            <Text style={styles.emptySubText}>Head over to Markets to buy crypto assets!</Text>
          </View>
        }
        renderItem={({ item }) => (
          <Surface style={styles.holdingCard} elevation={1}>
            <View style={styles.leftHolding}>
              {item.image ? (
                <Image source={{ uri: item.image }} style={styles.coinImg} />
              ) : (
                <View style={styles.placeholderImg}><Text>💰</Text></View>
              )}
              <View>
                <Text variant="titleMedium" style={styles.holdingSymbol}>
                  {item.symbol?.toUpperCase()}
                </Text>
                <Text style={styles.holdingQty}>
                  {item.quantity?.toFixed(4)} Units
                </Text>
              </View>
            </View>

            <View style={styles.rightHolding}>
              <Text variant="titleMedium" style={styles.holdingValue}>
                ${(item.quantity * item.avgPrice).toFixed(2)}
              </Text>
              <Text style={styles.holdingAvg}>
                @ ${item.avgPrice?.toLocaleString()}
              </Text>
            </View>
          </Surface>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090d16', padding: 16 },
  netWorthCard: {
    backgroundColor: '#0c1a30',
    borderRadius: 22,
    padding: 22,
    borderWidth: 1,
    borderColor: '#1d4ed833',
    marginBottom: 20,
  },
  netWorthLabel: { color: '#64748b', fontSize: 11, fontWeight: '700', letterSpacing: 1.2 },
  netWorthText: { color: '#38bdf8', fontWeight: '900', marginTop: 6 },
  divider: { backgroundColor: '#1e293b', marginVertical: 16 },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between' },
  breakdownLabel: { color: '#64748b', fontSize: 12, fontWeight: '500' },
  breakdownValue: { color: '#f8fafc', fontWeight: '700', fontSize: 15, marginTop: 2 },
  sectionHeader: { color: '#cbd5e1', fontWeight: '700', marginBottom: 12 },
  holdingCard: {
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
  leftHolding: { flexDirection: 'row', alignItems: 'center' },
  coinImg: { width: 36, height: 36, borderRadius: 18, marginRight: 12 },
  placeholderImg: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#1e293b', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  holdingSymbol: { fontWeight: '700', color: '#f8fafc' },
  holdingQty: { color: '#64748b', fontSize: 12 },
  rightHolding: { alignItems: 'flex-end' },
  holdingValue: { fontWeight: '700', color: '#f8fafc' },
  holdingAvg: { color: '#64748b', fontSize: 12 },
  emptyContainer: { alignItems: 'center', marginTop: 60 },
  emptyIcon: { fontSize: 44, marginBottom: 12 },
  emptyText: { color: '#94a3b8', fontSize: 16, fontWeight: '600' },
  emptySubText: { color: '#475569', fontSize: 13, marginTop: 4 },
});