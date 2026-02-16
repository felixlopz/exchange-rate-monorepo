import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "../services/api";
import { COLORS } from "../constants";

type Currency = "USD" | "EUR";

const formatter = new Intl.NumberFormat("es-VE", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatVE(value: number): string {
  return formatter.format(value);
}

function parseVE(text: string): number {
  const cleaned = text.replace(/\./g, "").replace(",", ".");
  return parseFloat(cleaned);
}

function sanitizeInput(text: string): string {
  return text.replace(/[^0-9.,]/g, "");
}

export default function ConverterScreen() {
  const [currency, setCurrency] = useState<Currency>("USD");
  const [currencyDisplay, setCurrencyDisplay] = useState("");
  const [bolivaresDisplay, setBolivaresDisplay] = useState("");
  const [rates, setRates] = useState<Record<Currency, number | null>>({
    USD: null,
    EUR: null,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const lastEdited = useRef<"currency" | "bolivares" | null>(null);

  const currentRate = rates[currency];

  const fetchRates = useCallback(async () => {
    try {
      setError(null);
      const data = await api.getLatestBCVRates();
      const newRates: Record<Currency, number | null> = {
        USD: null,
        EUR: null,
      };
      for (const rate of data) {
        if (rate.currency_from === "USD") newRates.USD = parseFloat(rate.rate);
        if (rate.currency_from === "EUR") newRates.EUR = parseFloat(rate.rate);
      }
      setRates(newRates);
    } catch (e) {
      setError("No se pudo obtener la tasa de cambio");
    }
  }, []);

  useEffect(() => {
    fetchRates().finally(() => setLoading(false));
  }, [fetchRates]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchRates();
    setRefreshing(false);
  }, [fetchRates]);

  useEffect(() => {
    if (!currentRate) return;
    if (lastEdited.current === "bolivares" && bolivaresDisplay) {
      const bs = parseVE(bolivaresDisplay);
      if (!isNaN(bs) && bs !== 0) {
        setCurrencyDisplay(formatVE(bs / currentRate));
      }
    } else if (lastEdited.current === "currency" && currencyDisplay) {
      const cv = parseVE(currencyDisplay);
      if (!isNaN(cv) && cv !== 0) {
        setBolivaresDisplay(formatVE(cv * currentRate));
      }
    }
  }, [currency, currentRate]);

  const handleCurrencyInput = (text: string) => {
    const sanitized = sanitizeInput(text);
    setCurrencyDisplay(sanitized);
    lastEdited.current = "currency";
    if (!currentRate) return;
    const value = parseVE(sanitized);
    if (sanitized === "" || isNaN(value)) {
      setBolivaresDisplay("");
      return;
    }
    setBolivaresDisplay(formatVE(value * currentRate));
  };

  const handleBolivaresInput = (text: string) => {
    const sanitized = sanitizeInput(text);
    setBolivaresDisplay(sanitized);
    lastEdited.current = "bolivares";
    if (!currentRate) return;
    const value = parseVE(sanitized);
    if (sanitized === "" || isNaN(value)) {
      setCurrencyDisplay("");
      return;
    }
    setCurrencyDisplay(formatVE(value / currentRate));
  };

  const handleCurrencyBlur = () => {
    const value = parseVE(currencyDisplay);
    if (!isNaN(value) && currencyDisplay !== "") {
      setCurrencyDisplay(formatVE(value));
    }
  };

  const handleBolivaresBlur = () => {
    const value = parseVE(bolivaresDisplay);
    if (!isNaN(value) && bolivaresDisplay !== "") {
      setBolivaresDisplay(formatVE(value));
    }
  };

  const otherCurrency: Currency = currency === "USD" ? "EUR" : "USD";
  const otherRate = rates[otherCurrency];
  const currencySymbol = currency === "USD" ? "$" : "€";
  const otherSymbol = currency === "USD" ? "€" : "$";

  const crossRateAmount = (() => {
    const cvRaw = parseVE(currencyDisplay);
    if (!cvRaw || isNaN(cvRaw) || !otherRate) return null;
    return cvRaw * otherRate;
  })();

  const crossRateReverse = (() => {
    const bsRaw = parseVE(bolivaresDisplay);
    if (!bsRaw || isNaN(bsRaw) || !otherRate) return null;
    return bsRaw / otherRate;
  })();

  const cvRaw = parseVE(currencyDisplay);
  const mainBsAmount = (() => {
    if (!cvRaw || isNaN(cvRaw) || !currentRate) return null;
    return cvRaw * currentRate;
  })();

  const crossDiffBs =
    crossRateAmount != null && mainBsAmount != null
      ? crossRateAmount - mainBsAmount
      : null;

  const crossDiffCurrency =
    crossDiffBs != null && currentRate ? crossDiffBs / currentRate : null;

  const crossDiffPct =
    crossDiffCurrency != null && cvRaw && !isNaN(cvRaw) && cvRaw !== 0
      ? (crossDiffCurrency / cvRaw) * 100
      : null;

  return (
    <ScrollView
      className="flex-1 bg-background"
      contentContainerClassName="flex-grow px-5 pt-4 pb-8"
      keyboardShouldPersistTaps="handled"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={COLORS.primary}
        />
      }
    >
      {/* Header */}
      <Text className="text-textPrimary text-2xl font-bold mb-6">
        BCV Exchange
      </Text>

      {/* Currency selector */}
      <View className="flex-row mb-6 bg-border/50 rounded-xl p-1">
        <TouchableOpacity
          className={`flex-1 py-3 rounded-lg items-center ${currency === "USD" ? "bg-primary" : ""}`}
          onPress={() => setCurrency("USD")}
        >
          <Text
            className={`text-base font-semibold ${currency === "USD" ? "text-white" : "text-textSecondary"}`}
          >
            USD
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 py-3 rounded-lg items-center ${currency === "EUR" ? "bg-primary" : ""}`}
          onPress={() => setCurrency("EUR")}
        >
          <Text
            className={`text-base font-semibold ${currency === "EUR" ? "text-white" : "text-textSecondary"}`}
          >
            EUR
          </Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View className="flex-1 items-center justify-center py-20">
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : error ? (
        <View className="flex-1 items-center justify-center py-20">
          <Text className="text-danger text-base text-center mb-4">
            {error}
          </Text>
          <TouchableOpacity
            className="bg-primary px-6 py-3 rounded-xl"
            onPress={() => {
              setLoading(true);
              fetchRates().finally(() => setLoading(false));
            }}
          >
            <Text className="text-white font-semibold">Reintentar</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Rate display */}
          <View className="items-center mb-8">
            <Text className="text-textSecondary text-sm mb-1">
              Tasa BCV {currency}/VES
            </Text>
            <Text className="text-textPrimary text-4xl font-bold">
              {currentRate != null ? formatVE(currentRate) : "—"}
            </Text>
          </View>

          {/* Currency input */}
          <View className="bg-surface rounded-2xl p-4 mb-4">
            <Text className="text-textSecondary text-sm mb-2">{currency}</Text>
            <View className="flex-row items-center">
              <Text className="text-textPrimary text-2xl mr-2">
                {currencySymbol}
              </Text>
              <TextInput
                className="flex-1 text-textPrimary text-2xl"
                value={currencyDisplay}
                onChangeText={handleCurrencyInput}
                onBlur={handleCurrencyBlur}
                placeholder="0,00"
                placeholderTextColor={COLORS.textTertiary}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          {/* Bolivares input */}
          <View className="bg-surface rounded-2xl p-4">
            <Text className="text-textSecondary text-sm mb-2">VES</Text>
            <View className="flex-row items-center">
              <Text className="text-textPrimary text-2xl mr-2">Bs</Text>
              <TextInput
                className="flex-1 text-textPrimary text-2xl"
                value={bolivaresDisplay}
                onChangeText={handleBolivaresInput}
                onBlur={handleBolivaresBlur}
                placeholder="0,00"
                placeholderTextColor={COLORS.textTertiary}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          {/* Cross-rate card */}
          {(crossRateAmount != null || crossRateReverse != null) && (
            <View
              className="bg-surface rounded-2xl p-4 mt-4"
              style={{ borderWidth: 1, borderColor: COLORS.border }}
            >
              <Text className="text-textSecondary text-sm mb-3">
                Al cambio en {otherCurrency}
              </Text>
              {crossRateAmount != null && (
                <View className="flex-row justify-between items-center mb-2">
                  <Text className="text-textSecondary text-base">
                    {currencySymbol} {currencyDisplay}
                  </Text>
                  <Text className="text-textPrimary text-base font-semibold">
                    Bs {formatVE(crossRateAmount)}
                  </Text>
                </View>
              )}
              {crossRateReverse != null && (
                <View className="flex-row justify-between items-center">
                  <Text className="text-textSecondary text-base">
                    Bs {bolivaresDisplay}
                  </Text>
                  <Text className="text-textPrimary text-base font-semibold">
                    {otherSymbol} {formatVE(crossRateReverse)}
                  </Text>
                </View>
              )}
              {crossDiffCurrency != null && crossDiffPct != null && (
                <View
                  className="flex-row justify-end items-center mt-3 pt-3"
                  style={{ borderTopWidth: 1, borderTopColor: COLORS.border }}
                >
                  <Text
                    className={`text-sm font-medium ${crossDiffCurrency >= 0 ? "text-success" : "text-danger"}`}
                  >
                    {crossDiffCurrency >= 0 ? "▲" : "▼"} {currencySymbol}{" "}
                    {formatVE(Math.abs(crossDiffCurrency))} (
                    {crossDiffCurrency >= 0 ? "+" : "-"}
                    {Math.abs(crossDiffPct).toFixed(2)}%)
                  </Text>
                </View>
              )}
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}
