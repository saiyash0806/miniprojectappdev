import React, { useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { TextInput, Button, Text } from 'react-native-paper';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

export function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert('Error', 'Please enter email and password');
    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (err) {
      Alert.alert('Login Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineLarge" style={styles.header}>TradeForge</Text>
      <Text variant="bodyMedium" style={styles.subHeader}>Virtual Paper-Trading Terminal</Text>
      <TextInput
        label="Email"
        mode="outlined"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />
      <TextInput
        label="Password"
        mode="outlined"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />
      <Button mode="contained" loading={loading} onPress={handleLogin} style={styles.btn}>
        Sign In
      </Button>
      <Button mode="text" onPress={() => navigation.navigate('Register')}>
        Don't have an account? Sign Up
      </Button>
    </View>
  );
}

export function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !name) return Alert.alert('Error', 'All fields are required');
    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      
      // Initialize portfolio in Firestore with $10,000 virtual balance
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        name,
        email: email.trim(),
        cashBalance: 10000,
        createdAt: new Date().toISOString()
      });
    } catch (err) {
      Alert.alert('Registration Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.header}>Open Paper Account</Text>
      <Text variant="bodyMedium" style={styles.subHeader}>Get $10,000 Virtual Cash Instantly</Text>
      <TextInput
        label="Full Name"
        mode="outlined"
        value={name}
        onChangeText={setName}
        style={styles.input}
      />
      <TextInput
        label="Email"
        mode="outlined"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={styles.input}
      />
      <TextInput
        label="Password"
        mode="outlined"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={styles.input}
      />
      <Button mode="contained" loading={loading} onPress={handleRegister} style={styles.btn}>
        Register & Claim $10,000
      </Button>
      <Button mode="text" onPress={() => navigation.navigate('Login')}>
        Already have an account? Sign In
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  header: { fontWeight: 'bold', textAlign: 'center' },
  subHeader: { textAlign: 'center', marginBottom: 20, color: 'gray' },
  input: { marginBottom: 12 },
  btn: { marginVertical: 8 }
});