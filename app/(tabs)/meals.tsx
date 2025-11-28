import AIFoodRecommendation from '@/components/AIFoodRecommendation';
import { useMealPlan } from '@/components/MealPlanContext';
import { useTheme } from '@/components/ThemeContext';
import StorageService from '@/services/StorageService';
import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';

const MealsScreen = () => {
  const [showAIRecommendations, setShowAIRecommendations] = useState(false);
  const [showCustomMealModal, setShowCustomMealModal] = useState(false);
  const [selectedMealId, setSelectedMealId] = useState<string | null>(null);
  const [customMealData, setCustomMealData] = useState({
    name: '',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [hasCompletedSetup, setHasCompletedSetup] = useState(false);
  const [hasApiKey, setHasApiKey] = useState(false);
  
  const { 
    meals, 
    updateMeal, 
    removeMeal, 
    getTotalNutrition, 
    addCustomMeal, 
    clearAllMeals,
    personalInfo,
    isLoading: contextLoading 
  } = useMealPlan();
  const { theme, colors } = useTheme();
  const totalNutrition = getTotalNutrition();

  useEffect(() => {
    checkSetupStatus();
  }, []);

  const checkSetupStatus = async () => {
    try {
      const [hasSetup, apiKey] = await Promise.all([
        StorageService.hasCompletedSetup(),
        StorageService.getGeminiApiKey(),
      ]);
      setHasCompletedSetup(hasSetup);
      setHasApiKey(!!apiKey);
    } catch (error) {
      console.error('Error checking setup status:', error);
    }
  };

  const handleSelectFood = (food: any) => {
    if (selectedMealId) {
      updateMeal(selectedMealId, food);
    }
    setShowAIRecommendations(false);
    setSelectedMealId(null);
  };

  const handleRemoveMeal = (mealId: string) => {
    Alert.alert(
      'Remove Meal',
      'Are you sure you want to remove this meal?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeMeal(mealId) },
      ]
    );
  };

  const handleClearAllMeals = () => {
    Alert.alert(
      'Clear All Meals',
      'Are you sure you want to clear all meals? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Clear All', style: 'destructive', onPress: clearAllMeals },
      ]
    );
  };

  const handleAddCustomMeal = () => {
    if (!customMealData.name || !customMealData.calories) {
      Alert.alert('Error', 'Please enter at least a meal name and calories.');
      return;
    }

    const calories = parseInt(customMealData.calories) || 0;
    const protein = parseInt(customMealData.protein) || 0;
    const carbs = parseInt(customMealData.carbs) || 0;
    const fat = parseInt(customMealData.fat) || 0;

    if (selectedMealId) {
      addCustomMeal(selectedMealId, customMealData.name, calories, protein, carbs, fat);
      setShowCustomMealModal(false);
      setSelectedMealId(null);
      setCustomMealData({ name: '', calories: '', protein: '', carbs: '', fat: '' });
    }
  };

  const handleAIRecommendations = () => {
    if (!hasCompletedSetup) {
      Alert.alert(
        'Profile Setup Required',
        'Please complete your profile setup to get personalized AI recommendations. We need your age, gender, height, weight, activity level, and goals.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Complete Setup', onPress: () => setShowAIRecommendations(true) },
        ]
      );
      return;
    }

    if (!hasApiKey) {
      Alert.alert(
        'API Key Required',
        'Please set your Gemini API key in Settings to use AI recommendations.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Go to Settings', onPress: () => {
          }},
        ]
      );
      return;
    }

    setShowAIRecommendations(true);
  };

  const MealItem = ({ meal }: { meal: any }) => (
    <View style={styles.mealItem}>
      <View style={styles.mealHeader}>
        <View style={styles.mealInfo}>
          <Text style={styles.mealTitle}>{meal.title}</Text>
          <Text style={styles.mealTime}>{meal.time}</Text>
        </View>
        <View style={styles.mealActions}>
          {meal.hasFood && (
            <TouchableOpacity
              style={styles.removeButton}
              onPress={() => handleRemoveMeal(meal.id)}
            >
              <Ionicons name="trash-outline" size={20} color="#FF5722" />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => {
              setSelectedMealId(meal.id);
              setShowAIRecommendations(true);
            }}
          >
            <Ionicons name="add-circle-outline" size={24} color="#4CAF50" />
          </TouchableOpacity>
        </View>
      </View>
      
      {meal.food ? (
        <View style={styles.foodInfo}>
          <Text style={styles.foodName}>{meal.food.name}</Text>
          <View style={styles.nutritionRow}>
            <Text style={styles.nutritionText}>
              {meal.food.calories} kcal
            </Text>
            <Text style={styles.nutritionText}>
              {meal.food.protein}g protein
            </Text>
            <Text style={styles.nutritionText}>
              {meal.food.carbs}g carbs
            </Text>
            <Text style={styles.nutritionText}>
              {meal.food.fat}g fat
            </Text>
          </View>
        </View>
      ) : (
        <View style={styles.emptyMeal}>
          <Text style={styles.emptyText}>No meal planned</Text>
          <Text style={styles.emptySubtext}>Tap + to add a meal</Text>
        </View>
      )}
    </View>
  );

  const NutritionSummary = () => (
    <View style={styles.nutritionSummary}>
      <Text style={styles.summaryTitle}>Today's Nutrition</Text>
      <View style={styles.summaryGrid}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Calories</Text>
          <Text style={styles.summaryValue}>{totalNutrition.calories} kcal</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Protein</Text>
          <Text style={styles.summaryValue}>{totalNutrition.protein}g</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Carbs</Text>
          <Text style={styles.summaryValue}>{totalNutrition.carbs}g</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryLabel}>Fat</Text>
          <Text style={styles.summaryValue}>{totalNutrition.fat}g</Text>
        </View>
      </View>
      
      {personalInfo && (
        <View style={styles.targetInfo}>
          <Text style={styles.targetLabel}>Target: {personalInfo.targetCalories} kcal</Text>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill, 
                { width: `${Math.min((totalNutrition.calories / parseInt(personalInfo.targetCalories)) * 100, 100)}%` }
              ]} 
            />
          </View>
        </View>
      )}
    </View>
  );

  const CustomMealModal = () => (
    <Modal
      visible={showCustomMealModal}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setShowCustomMealModal(false)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => setShowCustomMealModal(false)}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>Add Custom Meal</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.modalContent}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Meal Name</Text>
            <TextInput
              style={styles.textInput}
              value={customMealData.name}
              onChangeText={(text) => setCustomMealData(prev => ({ ...prev, name: text }))}
              placeholder="Enter meal name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Calories</Text>
            <TextInput
              style={styles.textInput}
              value={customMealData.calories}
              onChangeText={(text) => setCustomMealData(prev => ({ ...prev, calories: text }))}
              placeholder="Enter calories"
              keyboardType="numeric"
            />
          </View>

          <View style={styles.nutritionInputs}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Protein (g)</Text>
              <TextInput
                style={styles.textInput}
                value={customMealData.protein}
                onChangeText={(text) => setCustomMealData(prev => ({ ...prev, protein: text }))}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Carbs (g)</Text>
              <TextInput
                style={styles.textInput}
                value={customMealData.carbs}
                onChangeText={(text) => setCustomMealData(prev => ({ ...prev, carbs: text }))}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Fat (g)</Text>
              <TextInput
                style={styles.textInput}
                value={customMealData.fat}
                onChangeText={(text) => setCustomMealData(prev => ({ ...prev, fat: text }))}
                placeholder="0"
                keyboardType="numeric"
              />
            </View>
          </View>

          <TouchableOpacity style={styles.addCustomButton} onPress={handleAddCustomMeal}>
            <Text style={styles.addCustomButtonText}>Add Meal</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  if (contextLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Loading your meals...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>My Meals</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.headerButton} onPress={handleClearAllMeals}>
              <Ionicons name="trash-outline" size={20} color="#FF5722" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.headerButton}>
              <Ionicons name="calendar-outline" size={24} color="#333" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Nutrition Summary */}
        <NutritionSummary />

        {/* Meals List */}
        <View style={styles.mealsContainer}>
          <Text style={styles.sectionTitle}>Today's Meals</Text>
          {meals.map((meal) => (
            <MealItem key={meal.id} meal={meal} />
          ))}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleAIRecommendations}
          >
            <Ionicons name="bulb" size={20} color="#4CAF50" />
            <Text style={styles.actionText}>
              {!hasCompletedSetup ? 'Complete Setup' : 'AI Recommendations'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {
              setSelectedMealId('breakfast'); // Default to breakfast
              setShowCustomMealModal(true);
            }}
          >
            <Ionicons name="add" size={20} color="#4CAF50" />
            <Text style={styles.actionText}>Add Custom Meal</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* AI Food Recommendation Modal */}
      <AIFoodRecommendation
        visible={showAIRecommendations}
        onClose={() => {
          setShowAIRecommendations(false);
          setSelectedMealId(null);
        }}
        onSelectFood={handleSelectFood}
        selectedMealType={selectedMealId || 'breakfast'}
      />

      {/* Custom Meal Modal */}
      <CustomMealModal />
    </SafeAreaView>
  );
};

export default MealsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#707070',
    marginTop: 16,
    fontWeight: '500',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    padding: 8,
  },
  nutritionSummary: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 24,
    marginBottom: 26,
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: '#EDEDED',
    shadowColor: 'rgba(0,0,0,0.05)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  summaryItem: {
    flex: 1,
    minWidth: '45%',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#707070',
    marginBottom: 6,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  targetInfo: {
    marginTop: 18,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: '#EDEDED',
  },
  targetLabel: {
    fontSize: 14,
    color: '#707070',
    marginBottom: 10,
    fontWeight: '500',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#EDEDED',
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#4A6CF7',
    borderRadius: 3,
  },
  mealsContainer: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 16,
  },
  mealItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#EDEDED',
    shadowColor: 'rgba(0,0,0,0.05)',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 2,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  mealInfo: {
    flex: 1,
  },
  mealTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  mealTime: {
    fontSize: 13,
    color: '#707070',
    marginTop: 4,
    fontWeight: '500',
  },
  mealActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  addButton: {
    padding: 6,
  },
  removeButton: {
    padding: 6,
  },
  foodInfo: {
    borderTopWidth: 1,
    borderTopColor: '#EDEDED',
    paddingTop: 14,
  },
  foodName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 10,
  },
  nutritionRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  nutritionText: {
    fontSize: 13,
    color: '#707070',
    fontWeight: '500',
  },
  emptyMeal: {
    borderTopWidth: 1,
    borderTopColor: '#EDEDED',
    paddingTop: 14,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#707070',
    marginBottom: 4,
    fontWeight: '500',
  },
  emptySubtext: {
    fontSize: 12,
    color: '#A8A8A8',
  },
  quickActions: {
    flexDirection: 'column',
    paddingHorizontal: 24,
    gap: 12,
    marginBottom: 40,
  },
  actionButton: {
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#4A6CF7',
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 16,
    gap: 10,
    shadowColor: 'rgba(74,108,247,0.3)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  actionText: {
    flex: 1,
    textAlign: 'center',
    fontSize: 15,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#EDEDED',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  inputGroup: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 10,
  },
  textInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#EDEDED',
    color: '#1A1A1A',
  },
  nutritionInputs: {
    flexDirection: 'row',
    gap: 12,
  },
  addCustomButton: {
    backgroundColor: '#4A6CF7',
    borderRadius: 16,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 28,
    marginBottom: 20,
    shadowColor: 'rgba(74,108,247,0.3)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 8,
    elevation: 3,
  },
  addCustomButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
}); 