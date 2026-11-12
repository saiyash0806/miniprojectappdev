import React, { useState } from 'react';
import { View, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { TextInput, Button, Text, Surface } from 'react-native-paper';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

export function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert('Error', 'Please fill in both email and password.');
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
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.keyboardContainer}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerBox}>
          <View style={styles.logoBadge}>
            <Text style={styles.logoIcon}>⚡</Text>
          </View>
          <Text variant="headlineLarge" style={styles.title}>TradeForge</Text>
          <Text variant="bodyMedium" style={styles.subtitle}>Institutional Grade Paper Trading</Text>
        </View>

        <Surface style={styles.card} elevation={2}>
          <Text variant="titleMedium" style={styles.cardHeader}>Sign In to Terminal</Text>
          <TextInput
            label="Email address"
            mode="outlined"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            outlineColor="#2a374f"
            activeOutlineColor="#38bdf8"
            textColor="#f8fafc"
            style={styles.input}
          />
          <TextInput
            label="Password"
            mode="outlined"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            outlineColor="#2a374f"
            activeOutlineColor="#38bdf8"
            textColor="#f8fafc"
            style={styles.input}
          />
          <Button
            mode="contained"
            loading={loading}
            onPress={handleLogin}
            buttonColor="#38bdf8"
            textColor="#090d16"
            contentStyle={styles.btnContent}
            style={styles.actionBtn}
          >
            Access Terminal
          </Button>

          <Button
            mode="text"
            textColor="#94a3b8"
            onPress={() => navigation.navigate('Register')}
            style={styles.switchBtn}
          >
            New trader? <Text style={{ color: '#38bdf8', fontWeight: 'bold' }}>Create Account</Text>
          </Button>
        </Surface>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

export function RegisterScreen({ navigation }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password || !name) return Alert.alert('Error', 'Please fill in all fields.');
    try {
      setLoading(true);
      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        name,
        email: email.trim(),
        cashBalance: 10000,
        createdAt: new Date().toISOString(),
      });
    } catch (err) {
      Alert.alert('Registration Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} 
      style={styles.keyboardContainer}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerBox}>
          <Text variant="headlineMedium" style={styles.title}>Open Demo Account</Text>
          <Text variant="bodyMedium" style={styles.promoTag}>
            Includes $10,000.00 Instant Virtual Capital
          </Text>
        </View>

        <Surface style={styles.card} elevation={2}>
          <TextInput
            label="Full Name"
            mode="outlined"
            value={name}
            onChangeText={setName}
            outlineColor="#2a374f"
            activeOutlineColor="#38bdf8"
            textColor="#f8fafc"
            style={styles.input}
          />
          <TextInput
            label="Email Address"
            mode="outlined"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            outlineColor="#2a374f"
            activeOutlineColor="#38bdf8"
            textColor="#f8fafc"
            style={styles.input}
          />
          <TextInput
            label="Password (min. 6 characters)"
            mode="outlined"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            outlineColor="#2a374f"
            activeOutlineColor="#38bdf8"
            textColor="#f8fafc"
            style={styles.input}
          />

          <Button
            mode="contained"
            loading={loading}
            onPress={handleRegister}
            buttonColor="#10b981"
            textColor="#090d16"
            contentStyle={styles.btnContent}
            style={styles.actionBtn}
          >
            Claim $10k & Register
          </Button>

          <Button
            mode="text"
            textColor="#94a3b8"
            onPress={() => navigation.navigate('Login')}
            style={styles.switchBtn}
          >
            Already an account? <Text style={{ color: '#38bdf8', fontWeight: 'bold' }}>Sign In</Text>
          </Button>
        </Surface>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: { flex: 1, backgroundColor: '#090d16' },
  container: { flexGrow: 1, justifyContent: 'center', padding: 22 },
  headerBox: { alignItems: 'center', marginBottom: 28 },
  logoBadge: {
    width: 60,
    height: 60,
    borderRadius: 20,
    backgroundColor: '#131e36',
    borderWidth: 1,
    borderColor: '#38bdf855',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  logoIcon: { fontSize: 28 },
  title: { fontWeight: '800', color: '#f8fafc', letterSpacing: 0.5 },
  subtitle: { color: '#64748b', marginTop: 4, fontSize: 14 },
  promoTag: { color: '#10b981', fontWeight: '600', marginTop: 4 },
  card: {
    backgroundColor: '#111726',
    borderRadius: 20,
    padding: 24,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  cardHeader: { color: '#94a3b8', marginBottom: 18, fontWeight: '600' },
  input: { marginBottom: 14, backgroundColor: '#090d16' },
  actionBtn: { marginTop: 10, borderRadius: 12 },
  btnContent: { height: 48 },
  switchBtn: { marginTop: 8 },
});