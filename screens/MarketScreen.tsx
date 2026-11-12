import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View, RefreshControl, TouchableOpacity, Image } from 'react-native';
import { Text, Searchbar, ActivityIndicator, Surface } from 'react-native-paper';

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
      if (Array.isArray(data)) setMarketData(data);
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
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#38bdf8" />
        <Text style={styles.loadingText}>Streaming Live Market Feeds...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Searchbar
        placeholder="Search coin or symbol..."
        value={search}
        onChangeText={setSearch}
        style={styles.search}
        inputStyle={styles.searchInput}
        iconColor="#38bdf8"
        placeholderTextColor="#64748b"
      />

      <FlatList
        data={filtered}
        keyExtractor={item => item.id}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            tintColor="#38bdf8"
            colors={['#38bdf8']}
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchLivePrices();
            }}
          />
        }
        renderItem={({ item, index }) => {
          const isPositive = item.price_change_percentage_24h >= 0;
          return (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate('TradeDetail', { asset: item })}
            >
              <Surface style={styles.assetCard} elevation={1}>
                <View style={styles.leftGroup}>
                  <Text style={styles.rankNum}>#{index + 1}</Text>
                  <Image source={{ uri: item.image }} style={styles.coinLogo} />
                  <View>
                    <Text variant="titleMedium" style={styles.coinName}>
                      {item.symbol?.toUpperCase()}
                    </Text>
                    <Text style={styles.coinFullName} numberOfLines={1}>
                      {item.name}
                    </Text>
                  </View>
                </View>

                <View style={styles.rightGroup}>
                  <Text variant="titleMedium" style={styles.priceText}>
                    ${item.current_price?.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </Text>
                  <View style={[styles.badge, { backgroundColor: isPositive ? '#064e3b' : '#4c0519' }]}>
                    <Text style={[styles.badgeText, { color: isPositive ? '#34d399' : '#fb7185' }]}>
                      {isPositive ? '▲ +' : '▼ '}
                      {item.price_change_percentage_24h?.toFixed(2)}%
                    </Text>
                  </View>
                </View>
              </Surface>
            </TouchableOpacity>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#090d16', paddingHorizontal: 16, paddingTop: 12 },
  search: {
    backgroundColor: '#111726',
    borderRadius: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  searchInput: { color: '#f8fafc', fontSize: 14 },
  centerContainer: { flex: 1, backgroundColor: '#090d16', justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 14, color: '#94a3b8', fontSize: 14, fontWeight: '500' },
  assetCard: {
    backgroundColor: '#111726',
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  leftGroup: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  rankNum: { color: '#475569', fontSize: 11, fontWeight: '700', width: 24 },
  coinLogo: { width: 38, height: 38, borderRadius: 19, marginRight: 12 },
  coinName: { fontWeight: '700', color: '#f8fafc', fontSize: 15 },
  coinFullName: { color: '#64748b', fontSize: 12, maxWidth: 100 },
  rightGroup: { alignItems: 'flex-end' },
  priceText: { fontWeight: '700', color: '#f8fafc', fontSize: 15 },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginTop: 4,
  },
  badgeText: { fontSize: 12, fontWeight: '700' },
});