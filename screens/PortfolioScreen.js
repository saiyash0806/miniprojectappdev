import React, { useEffect, useState } from 'react';
import { View, FlatList, StyleSheet } from 'react-native';
import { Card, Text, Avatar, Divider } from 'react-native-paper';
import { collection, doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

export default function PortfolioScreen() {
  const [balance, setBalance] = useState(0);
  const [holdings, setHoldings] = useState([]);

  useEffect(() => {
    if (!auth.currentUser) return;

    // Real-time listener for user cash
    const userUnsub = onSnapshot(doc(db, 'users', auth.currentUser.uid), docSnap => {
      if (docSnap.exists()) {
        setBalance(docSnap.data().cashBalance || 0);
      }
    });

    // Real-time listener for current holdings
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
      <Card style={styles.netWorthCard}>
        <Card.Content>
          <Text variant="labelMedium" style={{ color: '#fff' }}>TOTAL PORTFOLIO VALUE</Text>
          <Text variant="headlineLarge" style={styles.netWorthText}>
            ${totalNetWorth.toFixed(2)}
          </Text>
          <Divider style={{ marginVertical: 8, backgroundColor: '#ffffff44' }} />
          <View style={styles.row}>
            <Text style={{ color: '#fff' }}>Cash: ${balance.toFixed(2)}</Text>
            <Text style={{ color: '#fff' }}>Assets: ${totalHoldingsValue.toFixed(2)}</Text>
          </View>
        </Card.Content>
      </Card>

      <Text variant="titleMedium" style={styles.sectionTitle}>Active Holdings</Text>
      <FlatList
        data={holdings}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <Text style={styles.empty}>No active investments. Buy an asset from the Market tab!</Text>
        }
        renderItem={({ item }) => (
          <Card style={styles.holdingCard}>
            <Card.Title
              title={`${item.name} (${item.symbol?.toUpperCase()})`}
              subtitle={`Units: ${item.quantity.toFixed(4)}`}
              left={() =>
                item.image ? (
                  <Avatar.Image size={36} source={{ uri: item.image }} />
                ) : (
                  <Avatar.Icon size={36} icon="wallet" />
                )
              }
              right={() => (
                <Text style={styles.holdingValue}>
                  ${(item.quantity * item.avgPrice).toFixed(2)}
                </Text>
              )}
            />
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 12 },
  netWorthCard: { backgroundColor: '#1e293b', marginBottom: 16 },
  netWorthText: { color: '#38bdf8', fontWeight: 'bold' },
  row: { flexDirection: 'row', justifyContent: 'space-between' },
  sectionTitle: { marginBottom: 8, fontWeight: 'bold' },
  holdingCard: { marginBottom: 8 },
  holdingValue: { marginRight: 16, fontWeight: 'bold', fontSize: 16 },
  empty: { textAlign: 'center', marginTop: 30, color: 'gray' }
});