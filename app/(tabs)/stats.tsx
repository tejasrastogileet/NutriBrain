import { useMealPlan } from '@/components/MealPlanContext';
import { useTheme } from '@/components/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Dimensions,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';

const { width } = Dimensions.get('window');

const StatsScreen = () => {
  const [selectedView, setSelectedView] = useState('Grid');
  const { nutritionalData, getTotalNutrition } = useMealPlan();
  const { theme, colors } = useTheme();
  const totalNutrition = getTotalNutrition();

  const chartData = {
    labels: ['22 Mar', '23 Mar', '24 Mar', '25 Mar', '26 Mar'],
    datasets: [
      {
        data: [72, 64, 58, 98, 80],
        strokeWidth: 3,
        color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
      },
    ],
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    decimalPlaces: 0,
    color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
    labelColor: (opacity = 1) => `rgba(102, 102, 102, ${opacity})`,
    style: {
      borderRadius: 16,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: '#4CAF50',
    },
  };

  const StatCard = ({ 
    icon, 
    color, 
    title, 
    value,
    target
  }: { 
    icon: string; 
    color: string; 
    title: string; 
    value: number;
    target: number;
  }) => (
    <View style={[styles.statCard, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
      <View style={styles.statCardHeader}>
        <View style={[styles.statIcon, { backgroundColor: color }]}>
          <Ionicons name={icon as any} size={16} color="white" />
        </View>
        <Ionicons name="expand-outline" size={16} color={colors.textTertiary} />
      </View>
      <Text style={[styles.statTitle, { color: colors.textSecondary }]}>{title}</Text>
      <Text style={[styles.statValue, { color: colors.text }]}>{value}/{target}{title === 'Calorie' ? ' kcal' : 'g'}</Text>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Your Stats</Text>
          </View>
          <TouchableOpacity>
            <Ionicons name="person-outline" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        {/* Smiley Icon */}
        <View style={styles.smileyContainer}>
          <View style={[styles.smileyIcon, { backgroundColor: colors.accent + '20' }]}>
            <Text style={styles.smileyText}>😊</Text>
          </View>
        </View>

        {/* Chart */}
        <View style={[styles.chartContainer, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <LineChart
            data={chartData}
            width={width - 40}
            height={200}
            chartConfig={{
              ...chartConfig,
              backgroundColor: colors.card,
              backgroundGradientFrom: colors.card,
              backgroundGradientTo: colors.card,
              color: () => colors.text,
              labelColor: () => colors.textSecondary,
              strokeColor: () => colors.accent,
              gridColor: () => colors.cardBorder,
            }}
            bezier
            style={styles.chart}
          />
        </View>

        {/* View Toggle */}
        <View style={[styles.toggleContainer, { backgroundColor: colors.card, borderColor: colors.cardBorder }]}>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              selectedView === 'Grid' && [styles.toggleButtonActive, { backgroundColor: colors.accent }]
            ]}
            onPress={() => setSelectedView('Grid')}
          >
            <Ionicons name="grid" size={16} color={selectedView === 'Grid' ? '#FFFFFF' : colors.textSecondary} />
            <Text style={[
              styles.toggleText,
              { color: selectedView === 'Grid' ? '#FFFFFF' : colors.textSecondary },
              selectedView === 'Grid' && styles.toggleTextActive
            ]}>Grid</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.toggleButton,
              selectedView === 'Compact' && [styles.toggleButtonActive, { backgroundColor: colors.accent }]
            ]}
            onPress={() => setSelectedView('Compact')}
          >
            <Ionicons name="list" size={16} color={selectedView === 'Compact' ? '#FFFFFF' : colors.textSecondary} />
            <Text style={[
              styles.toggleText,
              { color: selectedView === 'Compact' ? '#FFFFFF' : colors.textSecondary },
              selectedView === 'Compact' && styles.toggleTextActive
            ]}>Compact</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <StatCard
              icon="flame"
              color="#FFC107"
              title="Calorie"
              value={totalNutrition.calories}
              target={nutritionalData.calories}
            />
            <StatCard
              icon="water"
              color="#2196F3"
              title="Protein"
              value={totalNutrition.protein}
              target={nutritionalData.protein}
            />
          </View>
          <View style={styles.statsRow}>
            <StatCard
              icon="leaf"
              color="#4CAF50"
              title="Carbs"
              value={totalNutrition.carbs}
              target={nutritionalData.carbs}
            />
            <StatCard
              icon="fitness"
              color="#FF5722"
              title="Fat"
              value={totalNutrition.fat}
              target={nutritionalData.fat}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default StatsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  smileyContainer: {
    alignItems: 'center',
    marginVertical: 26,
  },
  smileyIcon: {
    width: 64,
    height: 64,
    backgroundColor: '#A8E6CF',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: 'rgba(0,0,0,0.05)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 12,
    elevation: 3,
  },
  smileyText: {
    fontSize: 28,
  },
  chartContainer: {
    alignItems: 'center',
    marginVertical: 26,
    paddingHorizontal: 24,
  },
  chart: {
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  toggleContainer: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 28,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 24,
    borderRadius: 18,
    padding: 8,
    borderWidth: 1,
    borderColor: '#EDEDED',
    shadowColor: 'rgba(0,0,0,0.05)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  toggleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
  },
  toggleButtonActive: {
    backgroundColor: '#4A6CF7',
  },
  toggleText: {
    fontSize: 14,
    color: '#707070',
    fontWeight: '600',
  },
  toggleTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  statsContainer: {
    paddingHorizontal: 24,
    gap: 14,
    marginBottom: 100,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 14,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    minHeight: 128,
    borderWidth: 1,
    borderColor: '#EDEDED',
    shadowColor: 'rgba(0,0,0,0.05)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  statCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statTitle: {
    fontSize: 13,
    color: '#707070',
    marginBottom: 8,
    fontWeight: '500',
  },
  statValue: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '700',
  },
}); 