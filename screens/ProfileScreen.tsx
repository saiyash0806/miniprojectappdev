import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Text, Surface, Button, Divider } from 'react-native-paper';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebaseConfig';

export default function ProfileScreen() {
  const [name, setName] = useState<string>('Trader');
  const [cashBalance, setCashBalance] = useState<number>(0);
  const [resetting, setResetting] = useState<boolean>(false);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user?.uid) return;
    const unsub = onSnapshot(doc(db, 'users', user.uid), (snap) => {
      if (snap.exists()) {
        setName(snap.data().name ?? 'Trader');
        setCashBalance(snap.data().cashBalance ?? 0);
      }
    });
    return unsub;
  }, [user?.uid]);

  const handleReset = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    setResetting(true);
    try {
      await updateDoc(doc(db, 'users', uid), {
        cashBalance: 10000,
      });
      Alert.alert('Balance Restored', 'Your virtual account has been replenished to $10,000.00');
    } catch (err) {
      Alert.alert('Error', err instanceof Error ? err.message : 'Failed to replenish balance');
    } finally {
      setResetting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Surface style={styles.card} elevation={2}>
        <Text variant="headlineSmall" style={styles.name}>{name}</Text>
        <Text style={styles.email}>{user?.email}</Text>
        <Divider style={styles.divider} />

        <Text style={styles.label}>Current Liquid Cash</Text>
        <Text style={styles.balance}>${cashBalance.toFixed(2)}</Text>

        <Button
          mode="outlined"
          onPress={handleReset}
          loading={resetting}
          disabled={resetting}
          style={styles.btn}
        >
          Replenish Cash to $10,000.00
        </Button>

        <Button
          mode="contained"
          buttonColor="#f43f5e"
          onPress={() => signOut(auth)}
          style={styles.btn}
        >
          Sign Out
        </Button>
      </Surface>

      <Text style={styles.disclaimer}>
        Disclaimer: TradeForge is an educational paper-trading simulator powered by CoinGecko public market data. No real funds are traded.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090d16', padding: 16 },
  card: { padding: 20, borderRadius: 16, backgroundColor: '#131b2e' },
  name: { color: '#f8fafc', fontWeight: '800' },
  email: { color: '#94a3b8', marginTop: 2 },
  divider: { marginVertical: 16, backgroundColor: '#1e293b' },
  label: { color: '#64748b', fontSize: 12 },
  balance: { color: '#10b981', fontSize: 24, fontWeight: '800', marginBottom: 16 },
  btn: { marginTop: 10, borderRadius: 8 },
  disclaimer: { color: '#64748b', fontSize: 12, textAlign: 'center', marginTop: 24 },
});