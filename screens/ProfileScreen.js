import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { Avatar, Text, Button, Card } from 'react-native-paper';
import { signOut } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

export default function ProfileScreen() {
  const handleReset = async () => {
    try {
      await updateDoc(doc(db, 'users', auth.currentUser.uid), {
        cashBalance: 10000
      });
      Alert.alert('Reset Complete', 'Your virtual cash balance has been reset to $10,000.');
    } catch (err) {
      Alert.alert('Error', err.message);
    }
  };

  return (
    <View style={styles.container}>
      <Avatar.Icon size={84} icon="finance" style={styles.avatar} />
      <Text variant="headlineSmall" style={styles.email}>
        {auth.currentUser?.email}
      </Text>

      <Card style={styles.card}>
        <Card.Title title="Paper Trading Rules" subtitle="Experiment 14 Simulation Mode" />
        <Card.Content>
          <Text variant="bodySmall">
            • Orders fill instantaneously at current market rate.
          </Text>
          <Text variant="bodySmall">
            • Real money is never wagered or required.
          </Text>
        </Card.Content>
      </Card>

      <Button
        mode="outlined"
        icon="restart"
        onPress={handleReset}
        style={styles.btn}
      >
        Reset Paper Balance ($10,000)
      </Button>

      <Button
        mode="contained"
        buttonColor="#d32f2f"
        icon="logout"
        onPress={() => signOut(auth)}
        style={styles.btn}
      >
        Sign Out
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, alignItems: 'center', justifyContent: 'center' },
  avatar: { marginBottom: 12, backgroundColor: '#0284c7' },
  email: { marginBottom: 16, fontWeight: 'bold' },
  card: { width: '100%', marginBottom: 20 },
  btn: { width: '100%', marginVertical: 6 }
});