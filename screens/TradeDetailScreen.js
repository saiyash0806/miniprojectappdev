import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ScrollView } from 'react-native';
import { Card, Text, TextInput, Button, SegmentedButtons } from 'react-native-paper';
import { doc, getDoc, updateDoc, setDoc, addDoc, collection } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

export default function TradeDetailScreen({ route, navigation }) {
  const { asset } = route.params;
  const [orderType, setOrderType] = useState('buy');
  const [quantity, setQuantity] = useState('1');
  const [cashBalance, setCashBalance] = useState(0);
  const [currentHolding, setCurrentHolding] = useState(0);
  const [loading, setLoading] = useState(false);

  const price = asset.current_price || 0;
  const totalCost = (parseFloat(quantity) || 0) * price;

  useEffect(() => {
    fetchUserBalanceAndHolding();
  }, []);

  const fetchUserBalanceAndHolding = async () => {
    if (!auth.currentUser) return;
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setCashBalance(userSnap.data().cashBalance || 0);
      }

      const holdingRef = doc(db, 'users', auth.currentUser.uid, 'holdings', asset.id);
      const holdingSnap = await getDoc(holdingRef);
      if (holdingSnap.exists()) {
        setCurrentHolding(holdingSnap.data().quantity || 0);
      }
    } catch (err) {
      console.error('Error fetching balances:', err);
    }
  };

  const handleOrder = async () => {
    const qty = parseFloat(quantity);
    if (!qty || qty <= 0) {
      return Alert.alert('Invalid Quantity', 'Please enter a valid amount to trade.');
    }

    if (orderType === 'buy' && totalCost > cashBalance) {
      return Alert.alert(
        'Insufficient Balance',
        `Required: $${totalCost.toFixed(2)}, Available: $${cashBalance.toFixed(2)}.`
      );
    }

    if (orderType === 'sell' && qty > currentHolding) {
      return Alert.alert(
        'Insufficient Holdings',
        `You currently only hold ${currentHolding} ${asset.symbol?.toUpperCase()}.`
      );
    }

    try {
      setLoading(true);
      const userRef = doc(db, 'users', auth.currentUser.uid);
      const holdingRef = doc(db, 'users', auth.currentUser.uid, 'holdings', asset.id);

      // 1. Update cash balance
      const newBalance = orderType === 'buy' ? cashBalance - totalCost : cashBalance + totalCost;
      await updateDoc(userRef, { cashBalance: newBalance });

      // 2. Update holdings balance
      const newHoldingQty = orderType === 'buy' ? currentHolding + qty : currentHolding - qty;
      await setDoc(holdingRef, {
        assetId: asset.id,
        name: asset.name,
        symbol: asset.symbol,
        quantity: newHoldingQty,
        avgPrice: price,
        image: asset.image || ''
      });

      // 3. Record trade log in Firestore
      await addDoc(collection(db, 'users', auth.currentUser.uid, 'transactions'), {
        assetId: asset.id,
        name: asset.name,
        symbol: asset.symbol,
        type: orderType.toUpperCase(),
        price: price,
        quantity: qty,
        total: totalCost,
        timestamp: new Date().toISOString()
      });

      Alert.alert(
        'Order Executed!',
        `Successfully ${orderType === 'buy' ? 'bought' : 'sold'} ${qty} ${asset.symbol?.toUpperCase()}`
      );
      navigation.goBack();
    } catch (err) {
      Alert.alert('Order Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Card style={styles.card}>
        <Card.Title
          title={asset.name}
          subtitle={`Current Market Price: $${price.toLocaleString()}`}
        />
        <Card.Content>
          <Text variant="bodyMedium">Available Cash: ${cashBalance.toFixed(2)}</Text>
          <Text variant="bodyMedium">
            Current Position: {currentHolding} {asset.symbol?.toUpperCase()}
          </Text>
        </Card.Content>
      </Card>

      <SegmentedButtons
        value={orderType}
        onValueChange={setOrderType}
        buttons={[
          { value: 'buy', label: 'Buy' },
          { value: 'sell', label: 'Sell' }
        ]}
        style={styles.segmented}
      />

      <TextInput
        label="Units to Trade"
        value={quantity}
        onChangeText={setQuantity}
        keyboardType="decimal-pad"
        mode="outlined"
        style={styles.input}
      />

      <Text variant="titleMedium" style={styles.totalText}>
        Order Value: ${totalCost.toFixed(2)}
      </Text>

      <Button
        mode="contained"
        loading={loading}
        onPress={handleOrder}
        buttonColor={orderType === 'buy' ? '#2e7d32' : '#d32f2f'}
        style={styles.btn}
      >
        Confirm {orderType.toUpperCase()} Order
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  card: { marginBottom: 16 },
  segmented: { marginBottom: 16 },
  input: { marginBottom: 16 },
  totalText: { marginVertical: 12, fontWeight: 'bold', textAlign: 'center' },
  btn: { paddingVertical: 4 }
});