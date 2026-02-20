import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Pressable,
  StyleSheet,
  ScrollView,
  Platform,
} from 'react-native';
import { ArrowLeft, ChevronDown, ShoppingBag, User, ShoppingCart } from 'lucide-react-native';
import { ProductWithFinalPrice, Market } from '../../models';
import { SearchBarWithSuggestions } from '../SearchBarWithSuggestions';

const IS_WEB = Platform.OS === 'web';

export interface CustomerHeaderConfig {
  navigation: any;
  isMobile: boolean;
  marketId: string;
  marketName: string;
  /** Ex.: "Loja de" ou "Loja de Mercado · Hortifruti" */
  marketNameLabel?: string;
  /** Mostrar botão voltar (desktop e mobile) */
  showBack?: boolean;
  onBackPress?: () => void;
  /** Mostrar dropdown de troca de loja (desktop) e botão Loja (mobile) */
  showMarketDropdown?: boolean;
  allMarkets?: Market[];
  onMarketSelect?: (market: Market) => void;
  /** Navegação ao tocar em "Loja" no mobile ou "Ver todos os mercados" */
  onNavigateToMarkets?: () => void;
  products: ProductWithFinalPrice[];
  onSearchSubmit: (query: string) => void;
  user: { name: string } | null;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  getTotalItems: () => number;
  openCartModal: (navigation: any) => void;
  /** Chips de categorias (mobile); se não passar, não mostra linha de categorias */
  categories?: string[];
  /** Categoria atual para highlight (ex.: CategoryProductsScreen) */
  currentCategory?: string;
  onCategoryPress?: (category: string) => void;
  /** Se definido, mostra chip "Todos" que chama isso (ex.: CategoryProductsScreen) */
  onAllProductsPress?: () => void;
}

export function useCustomerHeader(config: CustomerHeaderConfig) {
  const {
    navigation,
    isMobile,
    marketId,
    marketName,
    marketNameLabel,
    showBack,
    onBackPress,
    showMarketDropdown = false,
    allMarkets = [],
    onMarketSelect,
    onNavigateToMarkets,
    products,
    onSearchSubmit,
    user,
    onOpenAuthModal,
    onLogout,
    getTotalItems,
    openCartModal,
    categories = [],
    currentCategory,
    onCategoryPress,
    onAllProductsPress,
  } = config;

  const [marketDropdownOpen, setMarketDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const marketDropdownWrapperIdRef = useRef('market-dd-' + Math.random().toString(36).slice(2));
  const userDropdownWrapperIdRef = useRef('user-dd-' + Math.random().toString(36).slice(2));

  useEffect(() => {
    if (!IS_WEB || !marketDropdownOpen) return;
    const handleMouseDown = (e: MouseEvent) => {
      const el = document.getElementById(marketDropdownWrapperIdRef.current);
      if (el && !el.contains(e.target as Node)) setMarketDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [marketDropdownOpen]);

  useEffect(() => {
    if (!IS_WEB || !userDropdownOpen) return;
    const handleMouseDown = (e: MouseEvent) => {
      const el = document.getElementById(userDropdownWrapperIdRef.current);
      if (el && !el.contains(e.target as Node)) setUserDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [userDropdownOpen]);

  const handleChangeMarket = useCallback(
    (market: Market) => {
      setMarketDropdownOpen(false);
      onMarketSelect?.(market);
    },
    [onMarketSelect],
  );

  const closeDropdowns = useCallback(() => {
    setMarketDropdownOpen(false);
    setUserDropdownOpen(false);
  }, []);

  const dropdownOpen = marketDropdownOpen || userDropdownOpen;

  const headerOptions = useMemo(() => {
    const label = marketNameLabel ?? marketName;

    if (isMobile) {
      return {
        headerStyle: { minHeight: 200 },
        header: () => (
          <View style={styles.mobileHeaderRoot}>
            <View style={styles.mobileHeaderRow1}>
              {showBack && (
                <TouchableOpacity
                  style={styles.mobileBackBtn}
                  onPress={onBackPress}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <ArrowLeft size={22} color="#2196F3" />
                </TouchableOpacity>
              )}
              <View style={styles.mobileLogoSmall}>
                <ShoppingBag size={22} color="#2196F3" strokeWidth={2.5} />
                <Text style={styles.mobileLogoText}>MARKET</Text>
              </View>
              <TouchableOpacity
                style={styles.mobileLojaSelector}
                onPress={showBack ? onBackPress : onNavigateToMarkets}
                activeOpacity={0.7}
              >
                <Text style={styles.mobileLojaLabel}>Loja de</Text>
                <View style={styles.mobileLojaRow}>
                  <Text style={styles.mobileLojaName} numberOfLines={1}>{label}</Text>
                  <ChevronDown size={16} color="#333" />
                </View>
              </TouchableOpacity>
              <View style={styles.mobileHeaderIcons}>
                <View style={styles.mobileUserButtonContainer}>
                  <Pressable
                    style={(s: { pressed: boolean }) => [styles.mobileIconBtn, s.pressed && styles.mobileIconBtnPressed]}
                    onPress={() => {
                      if (user) setUserDropdownOpen(!userDropdownOpen);
                      else onOpenAuthModal();
                    }}
                  >
                    <User size={22} color="#2196F3" />
                  </Pressable>
                  {user && userDropdownOpen && (
                    <View style={styles.mobileUserDropdownMenu}>
                      <Pressable
                        style={(s: { pressed: boolean }) => [styles.mobileUserDropdownItem, s.pressed && styles.mobileUserDropdownItemPressed]}
                        onPress={() => {
                          setUserDropdownOpen(false);
                          navigation.navigate('Account');
                        }}
                      >
                        <Text style={styles.mobileUserDropdownItemText}>Minha Conta</Text>
                      </Pressable>
                      <Pressable
                        style={(s: { pressed: boolean }) => [
                          styles.mobileUserDropdownItem,
                          styles.mobileUserDropdownItemDanger,
                          s.pressed && styles.mobileUserDropdownItemDangerPressed,
                        ]}
                        onPress={() => {
                          setUserDropdownOpen(false);
                          onLogout();
                        }}
                      >
                        <Text style={styles.mobileUserDropdownItemTextDanger}>Sair</Text>
                      </Pressable>
                    </View>
                  )}
                </View>
                <Pressable
                  style={(s: { pressed: boolean }) => [styles.mobileIconBtn, s.pressed && styles.mobileIconBtnPressed]}
                  onPress={() => openCartModal(navigation)}
                >
                  <ShoppingCart size={22} color="#333" />
                  <Text style={styles.mobileCartCount}>({getTotalItems()})</Text>
                </Pressable>
              </View>
            </View>
            <View style={styles.mobileSearchRow}>
              <View style={styles.mobileSearchContainer}>
                <SearchBarWithSuggestions
                  products={products}
                  onSearchSubmit={onSearchSubmit}
                  placeholder="Leite, arroz, pão, vinho, frutas..."
                />
              </View>
            </View>
            {categories.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.mobileCategoryRow}
              >
                {onAllProductsPress != null && (
                  <TouchableOpacity style={styles.mobileCategoryChip} onPress={onAllProductsPress}>
                    <Text style={styles.mobileCategoryChipText} numberOfLines={1}>Todos</Text>
                  </TouchableOpacity>
                )}
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.mobileCategoryChip,
                      currentCategory === cat && styles.mobileCategoryChipActive,
                    ]}
                    onPress={() => onCategoryPress?.(cat)}
                  >
                    <Text
                      style={[
                        styles.mobileCategoryChipText,
                        currentCategory === cat && styles.mobileCategoryChipTextActive,
                      ]}
                      numberOfLines={1}
                    >
                      {cat}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </View>
        ),
      };
    }

    return {
      headerStyle: { height: 90 },
      headerLeft: () => (
        <View style={styles.headerLeftContainer}>
          {showBack && (
            <TouchableOpacity
              style={styles.webBackButton}
              onPress={onBackPress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <ArrowLeft size={22} color="#2196F3" />
            </TouchableOpacity>
          )}
          <View style={styles.marketLogoPlaceholder}>
            <View style={styles.logoIconContainer}>
              <ShoppingBag size={32} color="#2196F3" strokeWidth={2.5} />
            </View>
            <Text style={styles.logoText}>MARKET</Text>
          </View>
          {showMarketDropdown && allMarkets.length > 0 && (
            <View nativeID={marketDropdownWrapperIdRef.current} style={styles.marketDropdownWrapper}>
              <View style={styles.marketSelectorContainer}>
                <Pressable
                  style={(state: { pressed: boolean; hovered?: boolean }) => [
                    styles.marketSelectorButton,
                    (state.hovered || state.pressed) && styles.marketSelectorButtonHover,
                  ]}
                  onPress={() => setMarketDropdownOpen(!marketDropdownOpen)}
                >
                  <Text style={styles.marketSelectorLabel}>Loja:</Text>
                  <Text style={styles.marketSelectorName} numberOfLines={1}>{marketName}</Text>
                  <ChevronDown size={18} color="#666" />
                </Pressable>
                {marketDropdownOpen && (
                  <View style={styles.marketDropdownMenu}>
                    <ScrollView style={styles.marketDropdownScroll} showsVerticalScrollIndicator>
                      {allMarkets.map((market) => (
                        <Pressable
                          key={market.id}
                          style={(state: { pressed: boolean; hovered?: boolean }) => [
                            styles.marketDropdownItem,
                            market.id === marketId && styles.marketDropdownItemActive,
                            state.hovered && styles.marketDropdownItemHover,
                          ]}
                          onPress={() => handleChangeMarket(market)}
                        >
                          <Text
                            style={[
                              styles.marketDropdownItemName,
                              market.id === marketId && styles.marketDropdownItemNameActive,
                            ]}
                          >
                            {market.name}
                          </Text>
                          <Text style={styles.marketDropdownItemLocation}>
                            {market.city} - {market.neighborhood}
                          </Text>
                        </Pressable>
                      ))}
                      <Pressable
                        style={(state: { pressed: boolean; hovered?: boolean }) => [
                          styles.marketDropdownViewAll,
                          state.hovered && styles.marketDropdownViewAllHover,
                        ]}
                        onPress={() => {
                          setMarketDropdownOpen(false);
                          onNavigateToMarkets?.();
                        }}
                      >
                        <Text style={styles.marketDropdownViewAllText}>Ver todos os mercados</Text>
                      </Pressable>
                    </ScrollView>
                  </View>
                )}
              </View>
            </View>
          )}
        </View>
      ),
      headerTitleAlign: 'center' as const,
      headerTitleContainerStyle: { flex: 1, left: 0, right: 0, justifyContent: 'center', alignItems: 'center' },
      headerTitle: () => (
        <View style={styles.headerSearchBarWrap}>
          <SearchBarWithSuggestions products={products} onSearchSubmit={onSearchSubmit} />
        </View>
      ),
      headerRight: () => (
        <View style={styles.headerRightContainer}>
          <View nativeID={userDropdownWrapperIdRef.current} style={styles.userDropdownWrapper}>
            <View style={styles.userButtonContainer}>
              <Pressable
                style={(state: { pressed: boolean; hovered?: boolean }) => [
                  styles.headerUserButton,
                  (state.hovered || state.pressed) && styles.headerUserButtonHover,
                ]}
                onPress={() => {
                  if (user) setUserDropdownOpen(!userDropdownOpen);
                  else onOpenAuthModal();
                }}
              >
                <User size={20} color="#2196F3" />
                <Text style={styles.headerUserText}>{user ? user.name.split(' ')[0] : 'Entrar'}</Text>
              </Pressable>
              {user && userDropdownOpen && (
                <View style={styles.userDropdownMenu}>
                  <Pressable
                    style={(state: { pressed: boolean; hovered?: boolean }) => [
                      styles.userDropdownItem,
                      state.hovered && styles.userDropdownItemHover,
                    ]}
                    onPress={() => {
                      setUserDropdownOpen(false);
                      navigation.navigate('Account');
                    }}
                  >
                    <Text style={styles.userDropdownItemText}>Minha Conta</Text>
                  </Pressable>
                  <Pressable
                    style={(state: { pressed: boolean; hovered?: boolean }) => [
                      styles.userDropdownItem,
                      styles.userDropdownItemDanger,
                      state.hovered && styles.userDropdownItemDangerHover,
                    ]}
                    onPress={() => {
                      setUserDropdownOpen(false);
                      onLogout();
                    }}
                  >
                    <Text style={styles.userDropdownItemTextDanger}>Sair</Text>
                  </Pressable>
                </View>
              )}
            </View>
          </View>
          <Pressable
            style={(state: { pressed: boolean; hovered?: boolean }) => [
              styles.headerCartButton,
              (state.hovered || state.pressed) && styles.headerCartButtonHover,
            ]}
            onPress={() => openCartModal(navigation)}
          >
            <ShoppingCart size={20} color="#fff" />
            <Text style={styles.cartButtonText}>({getTotalItems()})</Text>
          </Pressable>
        </View>
      ),
    };
  }, [
    isMobile,
    marketId,
    marketName,
    marketNameLabel,
    showBack,
    onBackPress,
    showMarketDropdown,
    allMarkets,
    marketDropdownOpen,
    userDropdownOpen,
    user,
    products,
    onSearchSubmit,
    onOpenAuthModal,
    onLogout,
    getTotalItems,
    openCartModal,
    navigation,
    handleChangeMarket,
    onNavigateToMarkets,
    categories,
    currentCategory,
    onCategoryPress,
    onAllProductsPress,
  ]);

  return { headerOptions, dropdownOpen, closeDropdowns };
}

const styles = StyleSheet.create({
  headerLeftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  webBackButton: { marginRight: -30, padding: 4 },
  marketLogoPlaceholder: {
    width: 185,
    height: 60,
    borderRadius: 12,
    backgroundColor: '#fff',
    marginLeft: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderWidth: 2,
    borderColor: '#2196F3',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  logoIconContainer: { marginRight: 8 },
  logoText: { fontSize: 18, fontWeight: '700', color: '#2196F3', letterSpacing: 1 },
  marketDropdownWrapper: { position: 'relative' as const },
  marketSelectorContainer: { marginLeft: 16, position: 'relative' as const },
  marketSelectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minWidth: 200,
  },
  marketSelectorButtonHover: { backgroundColor: '#f5f5f5', borderColor: '#2196F3' },
  marketSelectorLabel: { fontSize: 12, color: '#666', fontWeight: '500' },
  marketSelectorName: { fontSize: 14, color: '#333', fontWeight: '600', flex: 1 },
  marketDropdownMenu: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: 4,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    maxHeight: 400,
    zIndex: 1000,
  },
  marketDropdownScroll: { maxHeight: 400 },
  marketDropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  marketDropdownItemHover: { backgroundColor: '#f5f5f5' },
  marketDropdownItemActive: { backgroundColor: '#e3f2fd' },
  marketDropdownItemName: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 4 },
  marketDropdownItemNameActive: { color: '#2196F3' },
  marketDropdownItemLocation: { fontSize: 12, color: '#666' },
  marketDropdownViewAll: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 2,
    borderTopColor: '#e0e0e0',
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
  },
  marketDropdownViewAllHover: { backgroundColor: '#e3f2fd' },
  marketDropdownViewAllText: { fontSize: 14, fontWeight: '600', color: '#2196F3' },
  headerSearchBarWrap: { width: '100%', maxWidth: '100%', alignSelf: 'center' },
  headerRightContainer: { flexDirection: 'row', alignItems: 'center', gap: 12, marginRight: 16 },
  headerUserButton: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  headerUserButtonHover: { backgroundColor: '#e3f2fd' },
  headerUserText: { fontSize: 14, fontWeight: '600', color: '#2196F3' },
  userDropdownWrapper: { position: 'relative' as const },
  userButtonContainer: { position: 'relative' as const },
  userDropdownMenu: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    minWidth: 180,
    zIndex: 1001,
  },
  userDropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  userDropdownItemHover: { backgroundColor: '#f5f5f5' },
  userDropdownItemDanger: { borderBottomWidth: 0 },
  userDropdownItemDangerHover: { backgroundColor: '#ffebee' },
  userDropdownItemText: { fontSize: 14, fontWeight: '500', color: '#333' },
  userDropdownItemTextDanger: { fontSize: 14, fontWeight: '500', color: '#F44336' },
  headerCartButton: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  headerCartButtonHover: { backgroundColor: '#1976D2', shadowOpacity: 0.4 },
  cartButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  mobileHeaderRoot: {
    backgroundColor: '#fff',
    paddingTop: 12,
    paddingHorizontal: 12,
    paddingBottom: 12,
  },
  mobileHeaderRow1: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  mobileBackBtn: { marginRight: 4, padding: 4 },
  mobileLogoSmall: { flexDirection: 'row', alignItems: 'center', gap: 4, marginRight: 12 },
  mobileLogoText: { fontSize: 14, fontWeight: '700', color: '#2196F3' },
  mobileLojaSelector: { flex: 1 },
  mobileLojaLabel: { fontSize: 12, color: '#666' },
  mobileLojaRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  mobileLojaName: { fontSize: 15, fontWeight: '600', color: '#333' },
  mobileHeaderIcons: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  mobileIconBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, padding: 8 },
  mobileIconBtnPressed: { opacity: 0.7 },
  mobileCartCount: { fontSize: 14, color: '#333', fontWeight: '600' },
  mobileUserButtonContainer: { position: 'relative' as const },
  mobileUserDropdownMenu: {
    position: 'absolute',
    top: '100%',
    right: 0,
    marginTop: 8,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 160,
    zIndex: 1002,
  },
  mobileUserDropdownItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  mobileUserDropdownItemPressed: { backgroundColor: '#f5f5f5' },
  mobileUserDropdownItemDanger: { borderBottomWidth: 0 },
  mobileUserDropdownItemDangerPressed: { backgroundColor: '#ffebee' },
  mobileUserDropdownItemText: { fontSize: 14, fontWeight: '500', color: '#333' },
  mobileUserDropdownItemTextDanger: { fontSize: 14, fontWeight: '500', color: '#F44336' },
  mobileSearchRow: { marginBottom: 12, alignSelf: 'stretch' },
  mobileSearchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8e8e8',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 48,
    minHeight: 48,
  },
  mobileCategoryRow: { flexDirection: 'row', gap: 8, paddingVertical: 4 },
  mobileCategoryChip: { backgroundColor: '#e3f2fd', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  mobileCategoryChipActive: { backgroundColor: '#2196F3' },
  mobileCategoryChipText: { fontSize: 13, color: '#1976d2', fontWeight: '500' },
  mobileCategoryChipTextActive: { color: '#fff' },
});
