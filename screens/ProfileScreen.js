import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Avatar, Text, Button, Surface } from 'react-native-paper';
import { signOut } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

export default function ProfileScreen() {
  const handleReset = async () => {
    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        cashBalance: 10000,
      });
      Alert.alert('Balance Restored', 'Your virtual account has been replenished to $10,000.00');
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Surface style={styles.profileHeader} elevation={2}>
        <Avatar.Icon size={76} icon="account" style={styles.avatar} color="#38bdf8" />
        <Text variant="titleLarge" style={styles.emailText}>
          {auth.currentUser?.email}
        </Text>
        <Text style={styles.userRole}>Level 1 Paper Trader</Text>
      </Surface>

      <Surface style={styles.infoCard} elevation={1}>
        <Text variant="titleSmall" style={styles.infoTitle}>SIMULATION ENVIRONMENT</Text>
        <Text style={styles.infoText}>• Live CoinGecko Market API connectivity enabled.</Text>
        <Text style={styles.infoText}>• Instantaneous order execution simulation.</Text>
        <Text style={styles.infoText}>• Zero real capital exposure.</Text>
      </Surface>

      <Button
        mode="outlined"
        icon="refresh"
        textColor="#38bdf8"
        onPress={handleReset}
        style={styles.resetBtn}
      >
        Replenish Capital ($10,000)
      </Button>

      <Button
        mode="contained"
        buttonColor="#f43f5e"
        textColor="#ffffff"
        icon="logout"
        onPress={() => signOut(auth)}
        style={styles.logoutBtn}
      >
        End Terminal Session
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090d16', padding: 20 },
  profileHeader: {
    backgroundColor: '#111726',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 16,
  },
  avatar: { backgroundColor: '#1e293b', marginBottom: 12 },
  emailText: { fontWeight: '700', color: '#f8fafc' },
  userRole: { color: '#38bdf8', fontSize: 13, fontWeight: '600', marginTop: 4 },
  infoCard: {
    backgroundColor: '#111726',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 24,
  },
  infoTitle: { color: '#64748b', fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 8 },
  infoText: { color: '#94a3b8', fontSize: 13, marginBottom: 4 },
  resetBtn: { borderColor: '#38bdf855', borderRadius: 12, marginBottom: 12 },
  logoutBtn: { borderRadius: 12 },
});