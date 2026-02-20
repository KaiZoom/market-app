import React from 'react';
import { View, TextInput, TouchableOpacity, Pressable, StyleSheet, Dimensions } from 'react-native';
import { Search } from 'lucide-react-native';
import { ProductWithFinalPrice } from '../../models';
import { SearchSuggestionsDropdown } from '../SearchSuggestionsDropdown';
import { useSearchBarWithSuggestions } from './hooks/useSearchBarWithSuggestions';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface SearchBarWithSuggestionsProps {
  products: ProductWithFinalPrice[];
  onSearchSubmit: (query: string) => void;
  placeholder?: string;
}

/**
 * Barra de busca com sugestões que mantém o estado internamente.
 * Fecha ao clicar fora: na web usa listener no document (sem overlay, hovers normais);
 * no mobile usa overlay transparente.
 */
export const SearchBarWithSuggestions: React.FC<SearchBarWithSuggestionsProps> = ({
  products,
  onSearchSubmit,
  placeholder = 'Buscar produtos...',
}) => {
  const {
    searchText,
    setSearchText,
    isFocused,
    showDropdown,
    wrapperWidth,
    overlayOffset,
    wrapperRef,
    wrapperIdRef,
    debouncedSearchText,
    searchResults,
    handleFocus,
    handleBlur,
    closeDropdown,
    handleSubmit,
    setWrapperWidthFromLayout,
    IS_WEB,
  } = useSearchBarWithSuggestions({ products, onSearchSubmit });

  return (
    <View
      ref={wrapperRef}
      nativeID={wrapperIdRef.current}
      style={styles.wrapper}
      onLayout={(e) => setWrapperWidthFromLayout(e.nativeEvent.layout.width)}
      collapsable={false}
    >
      {!IS_WEB && showDropdown && (
        <Pressable
          style={[
            styles.overlay,
            {
              top: -overlayOffset.y,
              left: -overlayOffset.x,
              width: SCREEN_WIDTH + overlayOffset.x,
              height: SCREEN_HEIGHT + overlayOffset.y,
            },
          ]}
          onPress={closeDropdown}
        />
      )}
      <View style={styles.contentAboveOverlay}>
        <View style={[styles.inputRow, isFocused && styles.inputRowFocused]}>
          <TouchableOpacity
            onPress={handleSubmit}
            style={styles.searchIconTouchable}
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Search
              size={18}
              color={isFocused ? '#2196F3' : '#888'}
              style={styles.searchIcon}
            />
          </TouchableOpacity>
          <TextInput
            style={[styles.input, styles.inputOutlineReset]}
            placeholder={placeholder}
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor="#888"
            onFocus={handleFocus}
            onBlur={handleBlur}
            onSubmitEditing={handleSubmit}
            returnKeyType="search"
            autoCorrect={false}
            autoCapitalize="none"
            selectionColor="#2196F3"
            editable
          />
        </View>
        {showDropdown && (
          <View style={styles.dropdownWrap} pointerEvents="box-none">
            <View style={[styles.dropdownInner, wrapperWidth != null && { width: wrapperWidth }]}>
              <SearchSuggestionsDropdown
                searchTerm={debouncedSearchText.trim()}
                results={searchResults}
              />
            </View>
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    minWidth: 0,
    overflow: 'visible' as const,
  },
  overlay: {
    position: 'absolute',
    zIndex: 998,
    elevation: 998,
    cursor: 'default' as const,
  },
  contentAboveOverlay: {
    position: 'relative',
    zIndex: 1000,
    elevation: 1000,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 52,
    width: '100%',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputRowFocused: {
    borderColor: '#2196F3',
    backgroundColor: '#fff',
  },
  searchIconTouchable: {
    marginRight: 8,
    padding: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchIcon: {
    outlineStyle: 'none',
    outlineWidth: 0,
  },
  input: {
    flex: 1,
    paddingVertical: 0,
    fontSize: 16,
    minWidth: 0,
    height: '100%',
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  inputOutlineReset: {
    outlineStyle: 'none',
    outlineWidth: 0,
    outlineColor: 'transparent',
  } as any,
  dropdownWrap: {
    position: 'absolute',
    top: 56,
    left: 0,
    right: 0,
    zIndex: 1000,
    elevation: 1000,
  },
  dropdownInner: {
    width: '100%',
  },
});
