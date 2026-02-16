import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  SectionList,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  TextInput,
} from 'react-native';
import { Market } from '../../models';
import { db } from '../../services';
import { useCart } from '../../contexts/CartContext';

interface Props {
  navigation: any;
}

interface Section {
  title: string;
  data: Market[];
}

export const MarketSelectionScreen: React.FC<Props> = ({ navigation }) => {
  const [markets, setMarkets] = useState<Market[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { setMarket } = useCart();

  useEffect(() => {
    loadMarkets();
  }, []);

  const loadMarkets = () => {
    const data = db.getMarkets();
    setMarkets(data);
  };

  const filteredAndGroupedMarkets = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const filtered = query
      ? markets.filter(
          m =>
            m.city.toLowerCase().includes(query) ||
            m.state.toLowerCase().includes(query) ||
            m.neighborhood.toLowerCase().includes(query),
        )
      : markets;

    const byState = filtered.reduce<Record<string, Market[]>>((acc, market) => {
      const state = market.state;
      if (!acc[state]) acc[state] = [];
      acc[state].push(market);
      return acc;
    }, {});

    return Object.entries(byState).map(([title, data]) => ({ title, data }));
  }, [markets, searchQuery]);

  const handleSelectMarket = (market: Market) => {
    setMarket(market.id);
    navigation.navigate('Products', { marketId: market.id, marketName: market.name });
  };

  const renderMarket = ({ item }: { item: Market }) => (
    <TouchableOpacity
      style={styles.marketCard}
      onPress={() => handleSelectMarket(item)}
    >
      <Text style={styles.marketName}>{item.name}</Text>
      <Text style={styles.marketLocation}>{item.city} - {item.neighborhood}</Text>
      <Text style={styles.marketDescription}>{item.description}</Text>
    </TouchableOpacity>
  );

  const renderSectionHeader = ({ section }: { section: Section }) => (
    <Text style={styles.sectionHeader}>{section.title}</Text>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Selecione um Mercado</Text>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar por cidade, estado ou bairro..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <SectionList
        sections={filteredAndGroupedMarkets}
        renderItem={renderMarket}
        renderSectionHeader={renderSectionHeader}
        keyExtractor={item => item.id}
        contentContainerStyle={[
          styles.list,
          filteredAndGroupedMarkets.length === 0 && styles.listEmpty,
        ]}
        stickySectionHeadersEnabled={false}
        ListEmptyComponent={
          <Text style={styles.emptyText}>
            Nenhum mercado encontrado. Tente buscar por outra cidade, estado ou bairro.
          </Text>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 16,
    backgroundColor: '#fff',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  searchInput: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    fontSize: 16,
    color: '#333',
  },
  list: {
    padding: 16,
    paddingBottom: 32,
  },
  listEmpty: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  marketCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  marketName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  marketLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  marketDescription: {
    fontSize: 14,
    color: '#666',
  },
});
