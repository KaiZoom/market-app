import { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { View, Dimensions, Platform } from 'react-native';
import { ProductWithFinalPrice } from '../../../models';
import { useDebouncedValue, SEARCH_DEBOUNCE_MS } from '../../../hooks/useDebouncedValue';

const IS_WEB = Platform.OS === 'web';

export interface UseSearchBarWithSuggestionsProps {
  products: ProductWithFinalPrice[];
  onSearchSubmit: (query: string) => void;
}

export function useSearchBarWithSuggestions({
  products,
  onSearchSubmit,
}: UseSearchBarWithSuggestionsProps) {
  const [searchText, setSearchText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [wrapperWidth, setWrapperWidth] = useState<number | null>(null);
  const [overlayOffset, setOverlayOffset] = useState({ x: 0, y: 0 });
  const wrapperRef = useRef<View>(null);
  const wrapperIdRef = useRef('search-bar-wrapper-' + Math.random().toString(36).slice(2));

  const debouncedSearchText = useDebouncedValue(searchText, SEARCH_DEBOUNCE_MS);

  const searchResults = useMemo(() => {
    const query = debouncedSearchText.trim().toLowerCase();
    if (query.length < 2) return [];
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(query) ||
        (p.category && p.category.toLowerCase().includes(query)),
    );
  }, [products, debouncedSearchText]);

  const hasEnoughText = debouncedSearchText.trim().length >= 2;
  const showDropdown = dropdownVisible && hasEnoughText;

  const handleFocus = useCallback(() => {
    setIsFocused(true);
    setDropdownVisible(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  const closeDropdown = useCallback(() => {
    setDropdownVisible(false);
  }, []);

  useEffect(() => {
    if (!IS_WEB || !showDropdown) return;
    const handleMouseDown = (e: MouseEvent) => {
      const el = document.getElementById(wrapperIdRef.current);
      if (el && !el.contains(e.target as Node)) closeDropdown();
    };
    document.addEventListener('mousedown', handleMouseDown);
    return () => document.removeEventListener('mousedown', handleMouseDown);
  }, [showDropdown, closeDropdown]);

  const measureWrapper = useCallback(() => {
    wrapperRef.current?.measureInWindow((x: number, y: number) => {
      setOverlayOffset({ x, y });
    });
  }, []);

  useEffect(() => {
    if (!IS_WEB && showDropdown) measureWrapper();
  }, [showDropdown, measureWrapper]);

  const handleSubmit = useCallback(() => {
    const q = searchText.trim();
    if (q.length >= 2) {
      onSearchSubmit(q);
      setSearchText('');
    }
  }, [searchText, onSearchSubmit]);

  const setWrapperWidthFromLayout = useCallback((width: number) => {
    setWrapperWidth(width);
  }, []);

  return {
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
  };
}
