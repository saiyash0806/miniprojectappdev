import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View, RefreshControl } from 'react-native';
import { List, Avatar, Text, Searchbar, ActivityIndicator } from 'react-native-paper';

export default function MarketScreen({ navigation }) {
  const [marketData, setMarketData] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLivePrices = async () => {
    try {
      const res = await fetch(
        'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=25&page=1&sparkline=false'
      );
      const data = await res.json();
      if (Array.isArray(data)) {
        setMarketData(data);
      }
    } catch (err) {
      console.error('API Error: ', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLivePrices();
  }, []);

  const filtered = marketData.filter(item =>
    item.name?.toLowerCase().includes(search.toLowerCase()) ||
    item.symbol?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
        <Text style={{ marginTop: 10 }}>Fetching Live Market Data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search Assets (e.g. BTC, ETH)"
        value={search}
        onChangeText={setSearch}
        style={styles.search}
      />
      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchLivePrices();
            }}
          />
        }
        renderItem={({ item }) => {
          const isPositive = item.price_change_percentage_24h >= 0;
          return (
            <List.Item
              title={`${item.name} (${item.symbol?.toUpperCase()})`}
              description={`24h Vol: $${(item.total_volume / 1e6).toFixed(2)}M`}
              left={() => <Avatar.Image size={40} source={{ uri: item.image }} style={styles.avatar} />}
              right={() => (
                <View style={styles.rightCol}>
                  <Text variant="titleMedium">${item.current_price?.toLocaleString()}</Text>
                  <Text style={{ color: isPositive ? '#2e7d32' : '#d32f2f', fontWeight: 'bold' }}>
                    {isPositive ? '+' : ''}{item.price_change_percentage_24h?.toFixed(2)}%
                  </Text>
                </View>
              )}
              onPress={() => navigation.navigate('TradeDetail', { asset: item })}
            />
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 8 },
  search: { marginBottom: 8 },
  avatar: { alignSelf: 'center', backgroundColor: 'transparent' },
  rightCol: { justifyContent: 'center', alignItems: 'flex-end' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' }
});