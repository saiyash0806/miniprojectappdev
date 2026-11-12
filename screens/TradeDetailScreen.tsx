import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Alert, ScrollView, Image } from 'react-native';
import { Surface, Text, TextInput, Button, SegmentedButtons } from 'react-native-paper';
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
    fetchBalances();
  }, []);

  const fetchBalances = async () => {
    if (!auth.currentUser) return;
    try {
      const userRef = doc(db, 'users', auth.currentUser.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) setCashBalance(userSnap.data().cashBalance || 0);

      const holdingRef = doc(db, 'users', auth.currentUser.uid, 'holdings', asset.id);
      const holdingSnap = await getDoc(holdingRef);
      if (holdingSnap.exists()) setCurrentHolding(holdingSnap.data().quantity || 0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleOrder = async () => {
    const qty = parseFloat(quantity);
    if (!qty || qty <= 0) return Alert.alert('Invalid Units', 'Please enter a valid trade amount.');

    if (orderType === 'buy' && totalCost > cashBalance) {
      return Alert.alert('Insufficient Balance', `Order requires $${totalCost.toFixed(2)}, you have $${cashBalance.toFixed(2)}.`);
    }

    if (orderType === 'sell' && qty > currentHolding) {
      return Alert.alert('Insufficient Units', `You only hold ${currentHolding} ${asset.symbol?.toUpperCase()}.`);
    }

    try {
      setLoading(true);
      const userRef = doc(db, 'users', auth.currentUser.uid);
      const holdingRef = doc(db, 'users', auth.currentUser.uid, 'holdings', asset.id);

      const newBalance = orderType === 'buy' ? cashBalance - totalCost : cashBalance + totalCost;
      await updateDoc(userRef, { cashBalance: newBalance });

      const newHoldingQty = orderType === 'buy' ? currentHolding + qty : currentHolding - qty;
      await setDoc(holdingRef, {
        assetId: asset.id,
        name: asset.name,
        symbol: asset.symbol,
        quantity: newHoldingQty,
        avgPrice: price,
        image: asset.image || '',
      });

      await addDoc(collection(db, 'users', auth.currentUser.uid, 'transactions'), {
        assetId: asset.id,
        name: asset.name,
        symbol: asset.symbol,
        type: orderType.toUpperCase(),
        price: price,
        quantity: qty,
        total: totalCost,
        timestamp: new Date().toISOString(),
      });

      Alert.alert('Trade Filled', `Filled: ${orderType.toUpperCase()} ${qty} ${asset.symbol?.toUpperCase()} at $${price.toLocaleString()}`);
      navigation.goBack();
    } catch (err) {
      Alert.alert('Execution Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const isBuy = orderType === 'buy';

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Asset Header Banner */}
      <Surface style={styles.topCard} elevation={2}>
        <View style={styles.assetRow}>
          <Image source={{ uri: asset.image }} style={styles.coinImage} />
          <View>
            <Text variant="titleLarge" style={styles.coinTitle}>{asset.name}</Text>
            <Text style={styles.coinSub}>{asset.symbol?.toUpperCase()} / USD</Text>
          </View>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.label}>Execution Price</Text>
          <Text variant="headlineMedium" style={styles.priceNum}>
            ${price.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </Text>
        </View>
      </Surface>

      {/* Account Info Stats */}
      <View style={styles.statsGrid}>
        <Surface style={styles.statBox}>
          <Text style={styles.statLabel}>Buying Power</Text>
          <Text style={styles.statVal}>${cashBalance.toFixed(2)}</Text>
        </Surface>
        <Surface style={styles.statBox}>
          <Text style={styles.statLabel}>Owned Position</Text>
          <Text style={styles.statVal}>{currentHolding} {asset.symbol?.toUpperCase()}</Text>
        </Surface>
      </View>

      {/* Action Order Box */}
      <Surface style={styles.orderCard} elevation={2}>
        <SegmentedButtons
          value={orderType}
          onValueChange={setOrderType}
          buttons={[
            {
              value: 'buy',
              label: 'BUY / LONG',
              style: isBuy ? { backgroundColor: '#10b981' } : {},
              checkedColor: '#090d16',
            },
            {
              value: 'sell',
              label: 'SELL / SHORT',
              style: !isBuy ? { backgroundColor: '#f43f5e' } : {},
              checkedColor: '#090d16',
            },
          ]}
          style={styles.segmented}
        />

        <TextInput
          label="Order Quantity (Units)"
          value={quantity}
          onChangeText={setQuantity}
          keyboardType="decimal-pad"
          mode="outlined"
          outlineColor="#2a374f"
          activeOutlineColor={isBuy ? '#10b981' : '#f43f5e'}
          textColor="#f8fafc"
          style={styles.input}
        />

        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Total Order Cost</Text>
          <Text style={[styles.summaryVal, { color: isBuy ? '#10b981' : '#f43f5e' }]}>
            ${totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
        </View>

        <Button
          mode="contained"
          loading={loading}
          onPress={handleOrder}
          buttonColor={isBuy ? '#10b981' : '#f43f5e'}
          textColor="#090d16"
          contentStyle={styles.btnContent}
          style={styles.submitBtn}
        >
          Confirm {orderType.toUpperCase()} Order
        </Button>
      </Surface>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#090d16', padding: 16 },
  topCard: {
    backgroundColor: '#111726',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1e293b',
    marginBottom: 12,
  },
  assetRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  coinImage: { width: 44, height: 44, borderRadius: 22, marginRight: 14 },
  coinTitle: { fontWeight: '800', color: '#f8fafc' },
  coinSub: { color: '#64748b', fontSize: 13, fontWeight: '600' },
  priceRow: { borderTopWidth: 1, borderTopColor: '#1e293b', paddingTop: 12 },
  label: { color: '#64748b', fontSize: 12, textTransform: 'uppercase', letterSpacing: 1 },
  priceNum: { color: '#38bdf8', fontWeight: '800', marginTop: 2 },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14 },
  statBox: {
    flex: 0.485,
    backgroundColor: '#111726',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  statLabel: { color: '#64748b', fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
  statVal: { color: '#f8fafc', fontWeight: '700', fontSize: 14, marginTop: 4 },
  orderCard: {
    backgroundColor: '#111726',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  segmented: { marginBottom: 16 },
  input: { backgroundColor: '#090d16', marginBottom: 16 },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#1e293b',
    marginBottom: 16,
  },
  summaryLabel: { color: '#94a3b8', fontSize: 14, fontWeight: '500' },
  summaryVal: { fontSize: 18, fontWeight: '800' },
  submitBtn: { borderRadius: 12 },
  btnContent: { height: 48 },
});