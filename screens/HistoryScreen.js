import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { List, Chip, Text } from 'react-native-paper';
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
        ListEmptyComponent={
          <Text style={styles.empty}>No transaction history available.</Text>
        }
        renderItem={({ item }) => {
          const isBuy = item.type === 'BUY';
          return (
            <List.Item
              title={`${item.type} ${item.symbol?.toUpperCase()}`}
              description={`${item.quantity} units @ $${item.price} • ${new Date(item.timestamp).toLocaleDateString()}`}
              left={() => (
                <Chip
                  style={[
                    styles.chip,
                    { backgroundColor: isBuy ? '#dcfce7' : '#fee2e2' }
                  ]}
                  textStyle={{
                    color: isBuy ? '#15803d' : '#b91c1c',
                    fontWeight: 'bold'
                  }}
                >
                  {item.type}
                </Chip>
              )}
              right={() => (
                <Text style={styles.totalAmount}>
                  {isBuy ? '-' : '+'}${item.total?.toFixed(2)}
                </Text>
              )}
            />
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 8 },
  chip: { alignSelf: 'center', marginRight: 8 },
  totalAmount: { alignSelf: 'center', fontWeight: 'bold', fontSize: 15 },
  empty: { textAlign: 'center', marginTop: 40, color: 'gray' }
});