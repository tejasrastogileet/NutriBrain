import { useMealPlan } from "@/components/MealPlanContext";
import { useTheme } from "@/components/ThemeContext";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

const HomeScreen = ({ onNavigate }: { onNavigate?: (tab: string) => void }) => {
  const [selectedView, setSelectedView] = useState("Daily");
  const { meals, nutritionalData, getTotalNutrition, personalInfo } =
    useMealPlan();
  const { theme, colors } = useTheme();
  const totalNutrition = getTotalNutrition();

  const MetricCard = ({
    icon,
    color,
    title,
    value,
    target,
  }: {
    icon: string;
    color: string;
    title: string;
    value: number;
    target: number;
  }) => {
    const percentage = target > 0 ? Math.min((value / target) * 100, 100) : 0;
    const isOverTarget = value > target;

    return (
      <View style={[styles.metricCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
        <View style={[styles.metricIcon, { backgroundColor: color }]}>
          <Ionicons name={icon as any} size={20} color="white" />
        </View>
        <Text style={[styles.metricTitle, { color: colors.textSecondary }]}>{title}:</Text>
        <Text style={[styles.metricValue, { color: colors.text }]}>
          {value}/{target}
          {title === "Calorie" ? " kcal" : "g"}
        </Text>
        <View style={[styles.progressBar, { backgroundColor: colors.cardBorder }]}>
          <View
            style={[
              styles.progressFill,
              {
                width: `${percentage}%`,
                backgroundColor: isOverTarget ? "#FF5722" : "#4CAF50",
              },
            ]}
          />
        </View>
        <Text
          style={[
            styles.percentageText,
            { color: isOverTarget ? "#FF5722" : "#4CAF50" },
          ]}
        >
          {percentage.toFixed(0)}%
        </Text>
      </View>
    );
  };

  const MealCard = ({ meal }: { meal: any }) => (
    <View style={[styles.mealCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      <View style={styles.mealHeader}>
        <View>
          <Text style={[styles.mealTitle, { color: colors.text }]}>{meal.title}</Text>
          <Text style={[styles.mealTime, { color: colors.textSecondary }]}>({meal.time})</Text>
        </View>
        {meal.hasFood ? (
          <Ionicons name="checkmark" size={20} color="#4CAF50" />
        ) : (
          <Ionicons name="add" size={20} color={colors.textTertiary} />
        )}
      </View>
      {meal.food && <Text style={[styles.mealFood, { color: colors.text }]}>{meal.food.name}</Text>}
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* App Title and Tagline */}
        <View style={styles.titleBar}>
          <Text style={[styles.appTitle, { color: colors.accent }]}>NutriBrain</Text>
          <Text style={[styles.tagline, { color: colors.textSecondary }]}>Nutrition Powered by Intelligence.</Text>
        </View>

        {/* Greeting */}
        <View style={styles.greetingContainer}>
          <Text style={[styles.greetingText, { color: colors.textSecondary }]}>Greetings there,</Text>
          <Text style={[styles.questionText, { color: colors.text }]}>Are You Eating Healthy?</Text>
        </View>

        {/* Metrics */}
        <View style={styles.metricsContainer}>
          {personalInfo ? (
            <>
              <MetricCard
                icon="flame"
                color="#FFC107"
                title="Calorie"
                value={totalNutrition.calories}
                target={nutritionalData.calories}
              />
              <MetricCard
                icon="water"
                color="#2196F3"
                title="Protein"
                value={totalNutrition.protein}
                target={nutritionalData.protein}
              />
              <MetricCard
                icon="leaf"
                color="#4CAF50"
                title="Carbs"
                value={totalNutrition.carbs}
                target={nutritionalData.carbs}
              />
            </>
          ) : (
            <View style={[styles.setupPrompt, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
              <Ionicons name="person-add" size={48} color={colors.textTertiary} />
              <Text style={[styles.setupPromptTitle, { color: colors.text }]}>Complete Your Profile</Text>
              <Text style={[styles.setupPromptText, { color: colors.textSecondary }]}>
                Set up your personal information to get personalized nutrition
                targets and AI recommendations.
              </Text>
              <TouchableOpacity
                style={[styles.setupButton, { backgroundColor: colors.accent }]}
                onPress={() => onNavigate?.("meals")}
              >
                <Text style={styles.setupButtonText}>Go to Meals & Setup</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* View Toggle */}
        <View style={[styles.toggleContainer, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              selectedView === "Daily" && [styles.toggleButtonActive, { backgroundColor: colors.accent }],
            ]}
            onPress={() => setSelectedView("Daily")}
          >
            <Ionicons
              name="calendar"
              size={16}
              color={selectedView === "Daily" ? "#FFFFFF" : colors.textSecondary}
            />
            <Text
              style={[
                styles.toggleText,
                { color: selectedView === "Daily" ? "#FFFFFF" : colors.textSecondary },
                selectedView === "Daily" && styles.toggleTextActive,
              ]}
            >
              Daily
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              selectedView === "Weekly" && [styles.toggleButtonActive, { backgroundColor: colors.accent }],
            ]}
            onPress={() => setSelectedView("Weekly")}
          >
            <Ionicons
              name="calendar-outline"
              size={16}
              color={selectedView === "Weekly" ? "#FFFFFF" : colors.textSecondary}
            />
            <Text
              style={[
                styles.toggleText,
                { color: selectedView === "Weekly" ? "#FFFFFF" : colors.textSecondary },
                selectedView === "Weekly" && styles.toggleTextActive,
              ]}
            >
              Weekly
            </Text>
          </TouchableOpacity>
        </View>

        {/* Meals */}
        <View style={styles.mealsContainer}>
          <View style={styles.mealRow}>
            {meals.slice(0, 2).map((meal) => (
              <MealCard key={meal.id} meal={meal} />
            ))}
          </View>
          <View style={styles.mealRow}>
            {meals.slice(2, 4).map((meal) => (
              <MealCard key={meal.id} meal={meal} />
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F8FA",
  },
  titleBar: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 8,
    alignItems: "center",
  },
  appTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#4A6CF7",
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 14,
    color: "#707070",
    fontWeight: "500",
    marginTop: 8,
    letterSpacing: 0.2,
  },
  greetingContainer: {
    paddingHorizontal: 24,
    marginBottom: 32,
    marginTop: 28,
  },
  greetingText: {
    fontSize: 16,
    color: "#707070",
    fontWeight: "400",
  },
  questionText: {
    fontSize: 32,
    color: "#1A1A1A",
    fontWeight: "700",
    marginTop: 8,
    lineHeight: 40,
  },
  metricsContainer: {
    flexDirection: "row",
    paddingHorizontal: 24,
    gap: 14,
    marginBottom: 32,
  },
  metricCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    alignItems: "center",
    minHeight: 140,
    shadowColor: "rgba(0,0,0,0.05)",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
  },
  metricIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  metricTitle: {
    fontSize: 13,
    color: "#707070",
    marginBottom: 8,
    fontWeight: "500",
  },
  metricValue: {
    fontSize: 16,
    color: "#1A1A1A",
    fontWeight: "700",
  },
  progressBar: {
    width: "100%",
    height: 6,
    backgroundColor: "#EDEDED",
    borderRadius: 3,
    marginTop: 12,
    marginBottom: 10,
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  percentageText: {
    fontSize: 13,
    fontWeight: "700",
  },
  toggleContainer: {
    flexDirection: "row",
    paddingHorizontal: 24,
    marginBottom: 28,
    backgroundColor: "#FFFFFF",
    marginHorizontal: 24,
    borderRadius: 18,
    padding: 8,
    shadowColor: "rgba(0,0,0,0.05)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  toggleButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
  },
  toggleButtonActive: {
    backgroundColor: "#4A6CF7",
  },
  toggleText: {
    fontSize: 15,
    color: "#707070",
    fontWeight: "600",
  },
  toggleTextActive: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  mealsContainer: {
    paddingHorizontal: 24,
    gap: 16,
    marginBottom: 40,
  },
  mealRow: {
    flexDirection: "row",
    gap: 16,
  },
  mealCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 18,
    minHeight: 128,
    borderWidth: 1,
    borderColor: "#EDEDED",
    shadowColor: "rgba(0,0,0,0.05)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  mealHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  mealTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  mealTime: {
    fontSize: 13,
    color: "#707070",
    marginTop: 4,
    fontWeight: "500",
  },
  mealFood: {
    fontSize: 14,
    color: "#1A1A1A",
    marginTop: 12,
    fontWeight: "600",
  },
  setupPrompt: {
    alignItems: "center",
    padding: 28,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#EDEDED",
    shadowColor: "rgba(0,0,0,0.05)",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  setupPromptTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1A1A1A",
    marginTop: 16,
    marginBottom: 12,
  },
  setupPromptText: {
    fontSize: 15,
    color: "#707070",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 22,
  },
  setupButton: {
    backgroundColor: "#4A6CF7",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 14,
  },
  setupButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
