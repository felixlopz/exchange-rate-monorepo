import {
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  FlatList,
} from "react-native";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useTransactionsStore } from "../store/transactions";
import { useCategoriesStore } from "../store/categories";
import { TransactionType, Transaction } from "../types";
import { COLORS } from "../constants";
import { api } from "../services/api";

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

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("es-VE", {
    day: "2-digit",
    month: "short",
  });
}

function formatMonth(date: Date): string {
  return date.toLocaleDateString("es-VE", { month: "long", year: "numeric" });
}

function sameMonth(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export default function TrackerScreen() {
  const { transactions, addTransaction, removeTransaction } =
    useTransactionsStore();
  const { getCategoriesByType, getCategoryById } = useCategoriesStore();

  const [type, setType] = useState<TransactionType>("expense");
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<"USD" | "VES">("USD");
  const [categoryId, setCategoryId] = useState<string>("");
  const [selectedMonth, setSelectedMonth] = useState(() => new Date());
  const [usdRate, setUsdRate] = useState<number | null>(null);

  useEffect(() => {
    api.getLatestBCVRates().then((data) => {
      for (const rate of data) {
        if (rate.currency_from === "USD") {
          setUsdRate(parseFloat(rate.rate));
          break;
        }
      }
    });
  }, []);

  const filteredTransactions = useMemo(
    () =>
      transactions.filter((tx) => sameMonth(new Date(tx.date), selectedMonth)),
    [transactions, selectedMonth],
  );

  /** Convert any transaction amount to USD */
  const toUSD = useCallback(
    (tx: Transaction): number => {
      if (tx.currency === "USD") return tx.amount;
      if (usdRate) return tx.amount / usdRate;
      return 0;
    },
    [usdRate],
  );

  /** Convert any transaction amount to VES */
  const toVES = useCallback(
    (tx: Transaction): number => {
      if (tx.currency === "VES") return tx.amount;
      if (usdRate) return tx.amount * usdRate;
      return 0;
    },
    [usdRate],
  );

  const monthlySummary = useMemo(() => {
    let income = 0;
    let expenses = 0;
    for (const tx of filteredTransactions) {
      const usd = toUSD(tx);
      if (tx.type === "income") income += usd;
      else expenses += usd;
    }
    return { income, expenses, balance: income - expenses };
  }, [filteredTransactions, toUSD]);

  /** Set of "YYYY-MM" keys that have at least one transaction (+ current month always included) */
  const monthsWithData = useMemo(() => {
    const set = new Set<string>();
    const now = new Date();
    set.add(`${now.getFullYear()}-${now.getMonth()}`);
    for (const tx of transactions) {
      const d = new Date(tx.date);
      set.add(`${d.getFullYear()}-${d.getMonth()}`);
    }
    return set;
  }, [transactions]);

  const monthKey = (date: Date) => `${date.getFullYear()}-${date.getMonth()}`;

  const hasAdjacentMonth = (delta: number): boolean => {
    const probe = new Date(selectedMonth);
    // Check up to 120 months (~10 years) in the given direction
    for (let i = 0; i < 120; i++) {
      probe.setMonth(probe.getMonth() + delta);
      if (monthsWithData.has(monthKey(probe))) return true;
    }
    return false;
  };

  const canGoPrev = hasAdjacentMonth(-1);
  const canGoNext = hasAdjacentMonth(1);

  const shiftMonth = (delta: number) => {
    setSelectedMonth((prev) => {
      const next = new Date(prev);
      // Jump to the next month that has data
      for (let i = 0; i < 120; i++) {
        next.setMonth(next.getMonth() + delta);
        if (monthsWithData.has(monthKey(next))) return next;
      }
      return prev;
    });
  };

  const categories = getCategoriesByType(type);

  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    setCategoryId("");
  };

  const handleAmountChange = (text: string) => {
    setAmount(sanitizeInput(text));
  };

  const handleAmountBlur = () => {
    const value = parseVE(amount);
    if (!isNaN(value) && amount !== "") {
      setAmount(formatVE(value));
    }
  };

  const handleAdd = () => {
    const parsed = parseVE(amount);
    if (!name.trim()) {
      Alert.alert("Error", "Ingresa un nombre");
      return;
    }
    if (!amount || isNaN(parsed) || parsed <= 0) {
      Alert.alert("Error", "Ingresa un monto válido");
      return;
    }
    if (!categoryId) {
      Alert.alert("Error", "Selecciona una categoría");
      return;
    }

    addTransaction({
      type,
      name: name.trim(),
      amount: parsed,
      currency: type === "income" ? "USD" : currency,
      categoryId,
    });

    setName("");
    setAmount("");
    setCategoryId("");
  };

  const handleDelete = (tx: Transaction) => {
    Alert.alert("Eliminar", `¿Eliminar "${tx.name}"?`, [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Eliminar",
        style: "destructive",
        onPress: () => removeTransaction(tx.id),
      },
    ]);
  };

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const isIncome = item.type === "income";
    const usdAmount = toUSD(item);
    const vesAmount = toVES(item);
    const cat = getCategoryById(item.categoryId);
    const categoryName = cat?.name ?? (item as any).category ?? "—";
    const categoryColor = cat?.color;
    return (
      <View className="flex-row items-center bg-surface rounded-xl px-4 py-3 mb-2">
        <View
          className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${isIncome ? "bg-success/20" : "bg-danger/20"}`}
        >
          <Ionicons
            name={isIncome ? "arrow-down" : "arrow-up"}
            size={16}
            color={isIncome ? COLORS.success : COLORS.danger}
          />
        </View>
        <View className="flex-1">
          <Text className="text-textPrimary text-base font-medium">
            {item.name}
          </Text>
          <View className="flex-row items-center">
            {categoryColor && (
              <View
                className="w-2 h-2 rounded-full mr-1.5"
                style={{ backgroundColor: categoryColor }}
              />
            )}
            <Text className="text-textSecondary text-xs">
              {categoryName} · {formatDate(item.date)}
            </Text>
          </View>
        </View>
        <View className="items-end mr-3">
          <Text
            className={`text-base font-semibold ${isIncome ? "text-success" : "text-danger"}`}
          >
            {isIncome ? "+" : "-"}$ {formatVE(usdAmount)}
          </Text>
          <Text className="text-textSecondary text-xs">
            Bs {formatVE(vesAmount)}
          </Text>
        </View>
        <TouchableOpacity onPress={() => handleDelete(item)} hitSlop={8}>
          <Ionicons
            name="trash-outline"
            size={18}
            color={COLORS.textTertiary}
          />
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-background px-5 pt-4">
      {/* Header */}
      <Text className="text-textPrimary text-2xl font-bold mb-4">Tracker</Text>

      {/* Income / Expense toggle */}
      <View className="flex-row mb-4 bg-border/50 rounded-xl p-1">
        <TouchableOpacity
          className={`flex-1 py-3 rounded-lg items-center ${type === "expense" ? "bg-danger" : ""}`}
          onPress={() => handleTypeChange("expense")}
        >
          <Text
            className={`text-base font-semibold ${type === "expense" ? "text-white" : "text-textSecondary"}`}
          >
            Gasto
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          className={`flex-1 py-3 rounded-lg items-center ${type === "income" ? "bg-success" : ""}`}
          onPress={() => handleTypeChange("income")}
        >
          <Text
            className={`text-base font-semibold ${type === "income" ? "text-white" : "text-textSecondary"}`}
          >
            Ingreso
          </Text>
        </TouchableOpacity>
      </View>

      {/* Name input */}
      <TextInput
        className="bg-surface rounded-xl px-4 py-3 text-textPrimary text-base mb-3"
        value={name}
        onChangeText={setName}
        placeholder="Nombre / descripción"
        placeholderTextColor={COLORS.textTertiary}
      />

      {/* Amount + currency */}
      <View className="flex-row mb-3">
        <TextInput
          className="flex-1 bg-surface rounded-xl px-4 py-3 text-textPrimary text-base mr-2"
          value={amount}
          onChangeText={handleAmountChange}
          onBlur={handleAmountBlur}
          placeholder="0,00"
          placeholderTextColor={COLORS.textTertiary}
          keyboardType="decimal-pad"
        />
        {type === "expense" ? (
          <TouchableOpacity
            className="bg-surface rounded-xl px-4 py-3 items-center justify-center"
            onPress={() => setCurrency(currency === "USD" ? "VES" : "USD")}
          >
            <Text className="text-primary text-base font-semibold">
              {currency}
            </Text>
          </TouchableOpacity>
        ) : (
          <View className="bg-surface rounded-xl px-4 py-3 items-center justify-center">
            <Text className="text-textSecondary text-base font-semibold">
              USD
            </Text>
          </View>
        )}
      </View>

      {/* Categories */}
      <View className="mb-4" style={{ height: 36 }}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerClassName="gap-2"
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              className={`px-4 rounded-full justify-center flex-row items-center ${categoryId === cat.id ? (type === "expense" ? "bg-danger" : "bg-success") : "bg-border/50"}`}
              style={{ height: 36 }}
              onPress={() => setCategoryId(cat.id)}
            >
              <View
                className="w-2.5 h-2.5 rounded-full mr-1.5"
                style={{ backgroundColor: cat.color }}
              />
              <Text
                className={`text-sm font-medium ${categoryId === cat.id ? "text-white" : "text-textSecondary"}`}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Add button */}
      <TouchableOpacity
        className={`py-3 rounded-xl items-center mb-4 ${type === "expense" ? "bg-danger" : "bg-success"}`}
        onPress={handleAdd}
      >
        <Text className="text-white text-base font-semibold">Agregar</Text>
      </TouchableOpacity>

      {/* Month filter */}
      <View className="flex-row items-center justify-between mb-3">
        <TouchableOpacity
          onPress={() => shiftMonth(-1)}
          hitSlop={8}
          disabled={!canGoPrev}
          style={{ opacity: canGoPrev ? 1 : 0.25 }}
        >
          <Ionicons
            name="chevron-back"
            size={22}
            color={COLORS.textSecondary}
          />
        </TouchableOpacity>
        <Text className="text-textPrimary text-base font-medium capitalize">
          {formatMonth(selectedMonth)}
        </Text>
        <TouchableOpacity
          onPress={() => shiftMonth(1)}
          hitSlop={8}
          disabled={!canGoNext}
          style={{ opacity: canGoNext ? 1 : 0.25 }}
        >
          <Ionicons
            name="chevron-forward"
            size={22}
            color={COLORS.textSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Monthly summary */}
      <View className="bg-surface rounded-xl p-4 mb-3">
        <View className="flex-row justify-between mb-2">
          <Text className="text-textSecondary text-sm">Ingresos</Text>
          <Text className="text-success text-sm font-semibold">
            $ {formatVE(monthlySummary.income)}
          </Text>
        </View>
        <View className="flex-row justify-between mb-2">
          <Text className="text-textSecondary text-sm">Gastos</Text>
          <Text className="text-danger text-sm font-semibold">
            $ {formatVE(monthlySummary.expenses)}
          </Text>
        </View>
        <View
          className="pt-2 flex-row justify-between"
          style={{ borderTopWidth: 1, borderTopColor: COLORS.border }}
        >
          <Text className="text-textSecondary text-sm">Balance</Text>
          <Text
            className={`text-sm font-bold ${monthlySummary.balance >= 0 ? "text-success" : "text-danger"}`}
          >
            {monthlySummary.balance >= 0 ? "+" : "-"}${" "}
            {formatVE(Math.abs(monthlySummary.balance))}
          </Text>
        </View>
      </View>

      {/* Transaction list */}
      <FlatList
        data={filteredTransactions}
        keyExtractor={(item) => item.id}
        renderItem={renderTransaction}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text className="text-textSecondary text-center mt-8">
            No hay transacciones
          </Text>
        }
      />
    </View>
  );
}
