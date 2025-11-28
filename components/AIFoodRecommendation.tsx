import GeminiService from "@/services/GeminiService";
import StorageService from "@/services/StorageService";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useMealPlan } from "./MealPlanContext";
import PersonalInfoModal from "./PersonalInfoModal";

interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  category: string;
}

interface PersonalInfo {
  name: string;
  age: string;
  gender: string;
  weight: string;
  height: string;
  activityLevel: string;
  goal: string;
  dietaryRestrictions: string[];
  allergies: string[];
  targetCalories: string; // Calculated automatically based on user data
}

interface AIFoodRecommendationProps {
  visible: boolean;
  onClose: () => void;
  onSelectFood: (food: FoodItem) => void;
  selectedMealType?: string;
}

const AIFoodRecommendation: React.FC<AIFoodRecommendationProps> = ({
  visible,
  onClose,
  onSelectFood,
  selectedMealType = "breakfast",
}) => {
  const [showPersonalInfoModal, setShowPersonalInfoModal] = useState(false);
  const [recommendations, setRecommendations] = useState<FoodItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo | null>(null);
  const [hasApiKey, setHasApiKey] = useState(false);
  const [hasCompletedSetup, setHasCompletedSetup] = useState(false);

  const { meals, personalInfo: contextPersonalInfo } = useMealPlan();

  useEffect(() => {
    if (visible) {
      checkSetupStatus();
      checkApiKey();
      loadPersonalInfo();
    }
  }, [visible]);

  const checkSetupStatus = async () => {
    const hasSetup = await StorageService.hasCompletedSetup();
    setHasCompletedSetup(hasSetup);
  };

  const checkApiKey = async () => {
    const apiKey = await StorageService.getGeminiApiKey();
    setHasApiKey(!!apiKey);

    // If we have an API key, configure the service
    if (apiKey) {
      try {
        GeminiService.setApiKey(apiKey);
      } catch (error) {
        console.error("Error setting API key:", error);
        setHasApiKey(false);
      }
    }
  };

  const loadPersonalInfo = async () => {
    const info = await StorageService.getPersonalInfo();
    setPersonalInfo(info);
  };

  const handleGenerateRecommendations = async () => {
    // First check if user has completed setup
    if (!hasCompletedSetup || !personalInfo) {
      Alert.alert(
        "Profile Setup Required",
        "Please complete your profile setup to get personalized AI recommendations.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Complete Setup",
            onPress: () => setShowPersonalInfoModal(true),
          },
        ]
      );
      return;
    }

    // Then check if API key is set
    if (!hasApiKey) {
      Alert.alert(
        "API Key Required",
        "Please set your Gemini API key in Settings to use AI recommendations.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Go to Settings",
            onPress: () => {
              onClose();
              // Navigate to settings (you'll need to implement this)
            },
          },
        ]
      );
      return;
    }

    // Generate recommendations
    await generateRecommendations();
  };

  const handlePersonalInfoComplete = async (info: PersonalInfo) => {
    try {
      // Save personal info
      await StorageService.savePersonalInfo(info);
      setPersonalInfo(info);
      setHasCompletedSetup(true);
      setShowPersonalInfoModal(false);

      // Check API key again
      await checkApiKey();

      if (!hasApiKey) {
        Alert.alert(
          "API Key Required",
          "Great! Your profile is set up. Now please set your Gemini API key in Settings to get AI recommendations.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Go to Settings",
              onPress: () => {
                onClose();
                // Navigate to settings
              },
            },
          ]
        );
        return;
      }

      // Generate recommendations automatically after setup
      await generateRecommendations();
    } catch (error) {
      console.error("Error saving personal info:", error);
      Alert.alert("Error", "Failed to save personal information.");
    }
  };

  const generateRecommendations = async () => {
    if (!personalInfo) {
      Alert.alert(
        "Error",
        "Personal information is required for AI recommendations."
      );
      return;
    }

    setIsLoading(true);
    try {
      const recommendations = await GeminiService.generateMealRecommendations(
        personalInfo,
        selectedMealType,
        meals
      );

      setRecommendations(recommendations);
    } catch (error) {
      console.error("Error generating recommendations:", error);

      if (error instanceof Error) {
        if (error.message.includes("API key")) {
          Alert.alert(
            "API Key Error",
            "Please check your Gemini API key in Settings and try again.",
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Go to Settings",
                onPress: () => {
                  onClose();
                  // Navigate to settings
                },
              },
            ]
          );
          return;
        }

        if (
          error.message.includes("busy") ||
          error.message.includes("overloaded")
        ) {
          Alert.alert(
            "Service Temporarily Unavailable",
            "The AI service is currently busy. You can try again in a few minutes, or use the fallback recommendations below.",
            [
              {
                text: "Use Fallback",
                onPress: () => {
                  // Show fallback recommendations based on meal type
                  const fallbackRecommendations =
                    getFallbackRecommendations(selectedMealType);
                  setRecommendations(fallbackRecommendations);
                },
              },
              { text: "Try Again Later", style: "cancel" },
            ]
          );
          return;
        }
      }

      Alert.alert(
        "Error",
        "Failed to generate AI recommendations. Using fallback options instead."
      );
      // Show fallback recommendations based on meal type
      const fallbackRecommendations =
        getFallbackRecommendations(selectedMealType);
      setRecommendations(fallbackRecommendations);
    } finally {
      setIsLoading(false);
    }
  };

  const getFallbackRecommendations = (mealType: string) => {
    const fallbackMeals = {
      breakfast: [
        {
          id: "fallback_breakfast_1",
          name: "Oatmeal with Berries and Almonds",
          calories: 280,
          protein: 8,
          carbs: 45,
          fat: 6,
          category: "breakfast",
        },
        {
          id: "fallback_breakfast_2",
          name: "Greek Yogurt with Honey and Granola",
          calories: 200,
          protein: 15,
          carbs: 20,
          fat: 8,
          category: "breakfast",
        },
        {
          id: "fallback_breakfast_3",
          name: "Whole Grain Toast with Avocado and Eggs",
          calories: 320,
          protein: 10,
          carbs: 35,
          fat: 18,
          category: "breakfast",
        },
        {
          id: "fallback_breakfast_4",
          name: "Smoothie Bowl with Banana and Berries",
          calories: 250,
          protein: 12,
          carbs: 30,
          fat: 8,
          category: "breakfast",
        },
        {
          id: "fallback_breakfast_5",
          name: "Scrambled Eggs with Spinach and Toast",
          calories: 220,
          protein: 18,
          carbs: 5,
          fat: 12,
          category: "breakfast",
        },
      ],
      lunch: [
        {
          id: "fallback_lunch_1",
          name: "Grilled Chicken Salad with Mixed Greens",
          calories: 350,
          protein: 25,
          carbs: 15,
          fat: 18,
          category: "lunch",
        },
        {
          id: "fallback_lunch_2",
          name: "Quinoa Bowl with Roasted Vegetables",
          calories: 380,
          protein: 12,
          carbs: 45,
          fat: 14,
          category: "lunch",
        },
        {
          id: "fallback_lunch_3",
          name: "Turkey Sandwich on Whole Grain Bread",
          calories: 320,
          protein: 20,
          carbs: 35,
          fat: 12,
          category: "lunch",
        },
        {
          id: "fallback_lunch_4",
          name: "Vegetable Soup with Grilled Cheese",
          calories: 200,
          protein: 8,
          carbs: 25,
          fat: 8,
          category: "lunch",
        },
        {
          id: "fallback_lunch_5",
          name: "Tuna Salad with Crackers",
          calories: 280,
          protein: 22,
          carbs: 10,
          fat: 16,
          category: "lunch",
        },
      ],
      dinner: [
        {
          id: "fallback_dinner_1",
          name: "Salmon with Roasted Vegetables",
          calories: 420,
          protein: 28,
          carbs: 20,
          fat: 22,
          category: "dinner",
        },
        {
          id: "fallback_dinner_2",
          name: "Lean Beef Stir Fry with Brown Rice",
          calories: 380,
          protein: 25,
          carbs: 25,
          fat: 18,
          category: "dinner",
        },
        {
          id: "fallback_dinner_3",
          name: "Vegetarian Pasta with Marinara Sauce",
          calories: 350,
          protein: 12,
          carbs: 45,
          fat: 12,
          category: "dinner",
        },
        {
          id: "fallback_dinner_4",
          name: "Chicken Breast with Quinoa and Broccoli",
          calories: 400,
          protein: 30,
          carbs: 35,
          fat: 14,
          category: "dinner",
        },
        {
          id: "fallback_dinner_5",
          name: "Tofu Curry with Basmati Rice",
          calories: 320,
          protein: 15,
          carbs: 30,
          fat: 16,
          category: "dinner",
        },
      ],
      snacks: [
        {
          id: "fallback_snacks_1",
          name: "Apple Slices with Almond Butter",
          calories: 180,
          protein: 4,
          carbs: 20,
          fat: 10,
          category: "snacks",
        },
        {
          id: "fallback_snacks_2",
          name: "Hummus with Carrot and Celery Sticks",
          calories: 150,
          protein: 6,
          carbs: 18,
          fat: 8,
          category: "snacks",
        },
        {
          id: "fallback_snacks_3",
          name: "Greek Yogurt with Mixed Berries",
          calories: 120,
          protein: 12,
          carbs: 8,
          fat: 4,
          category: "snacks",
        },
        {
          id: "fallback_snacks_4",
          name: "Mixed Nuts and Dried Cranberries",
          calories: 200,
          protein: 6,
          carbs: 8,
          fat: 18,
          category: "snacks",
        },
        {
          id: "fallback_snacks_5",
          name: "Banana with Peanut Butter",
          calories: 220,
          protein: 6,
          carbs: 25,
          fat: 12,
          category: "snacks",
        },
      ],
    };

    return (
      fallbackMeals[mealType as keyof typeof fallbackMeals] ||
      fallbackMeals.breakfast
    );
  };

  const handleSelectFood = (food: FoodItem) => {
    onSelectFood(food);
    onClose();
  };

  const FoodCard = ({ food }: { food: FoodItem }) => (
    <TouchableOpacity
      style={styles.foodCard}
      onPress={() => handleSelectFood(food)}
    >
      <View style={styles.foodHeader}>
        <Text style={styles.foodName}>{food.name}</Text>
        <Text style={styles.foodCalories}>{food.calories} kcal</Text>
      </View>

      <View style={styles.nutritionInfo}>
        <View style={styles.nutritionItem}>
          <Text style={styles.nutritionLabel}>Protein</Text>
          <Text style={styles.nutritionValue}>{food.protein}g</Text>
        </View>
        <View style={styles.nutritionItem}>
          <Text style={styles.nutritionLabel}>Carbs</Text>
          <Text style={styles.nutritionValue}>{food.carbs}g</Text>
        </View>
        <View style={styles.nutritionItem}>
          <Text style={styles.nutritionLabel}>Fat</Text>
          <Text style={styles.nutritionValue}>{food.fat}g</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderContent = () => {
    if (showPersonalInfoModal) {
      return (
        <PersonalInfoModal
          visible={showPersonalInfoModal}
          onClose={() => setShowPersonalInfoModal(false)}
          onComplete={handlePersonalInfoComplete}
        />
      );
    }

    if (isLoading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>
            Generating personalized recommendations...
          </Text>
        </View>
      );
    }

    if (recommendations.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="restaurant-outline" size={64} color="#CCC" />
          <Text style={styles.emptyTitle}>AI Recommendations</Text>
          <Text style={styles.emptyDescription}>
            Get personalized meal suggestions based on your profile and goals.
          </Text>

          {!hasCompletedSetup && (
            <View style={styles.setupSection}>
              <Text style={styles.setupTitle}>Complete Your Profile</Text>
              <Text style={styles.setupDescription}>
                We need your age, gender, height, weight, activity level, and
                goals to provide personalized recommendations.
              </Text>
              <TouchableOpacity
                style={styles.setupButton}
                onPress={() => setShowPersonalInfoModal(true)}
              >
                <Ionicons name="person-add" size={20} color="white" />
                <Text style={styles.setupButtonText}>
                  Complete Profile Setup
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {hasCompletedSetup && !hasApiKey && (
            <View style={styles.setupSection}>
              <Text style={styles.setupTitle}>Set Up AI Recommendations</Text>
              <Text style={styles.setupDescription}>
                Add your Gemini API key to get personalized AI-powered meal
                suggestions.
              </Text>
              <TouchableOpacity
                style={styles.setupButton}
                onPress={() => {
                  onClose();
                  // Navigate to settings
                }}
              >
                <Ionicons name="key" size={20} color="white" />
                <Text style={styles.setupButtonText}>Add API Key</Text>
              </TouchableOpacity>
            </View>
          )}

          {hasCompletedSetup && hasApiKey && (
            <View style={styles.setupSection}>
              <Text style={styles.setupTitle}>
                Ready for AI Recommendations
              </Text>
              <Text style={styles.setupDescription}>
                Your profile is complete and API key is configured. Generate
                personalized meal suggestions.
              </Text>
              <TouchableOpacity
                style={styles.generateButton}
                onPress={generateRecommendations}
              >
                <Ionicons name="bulb" size={20} color="white" />
                <Text style={styles.generateButtonText}>
                  Generate AI Recommendations
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      );
    }

    return (
      <ScrollView
        style={styles.recommendationsContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>AI Recommendations</Text>
          <Text style={styles.headerSubtitle}>
            Personalized for {personalInfo?.name || "you"}
          </Text>
          {personalInfo && (
            <View style={styles.profileInfo}>
              <Text style={styles.profileText}>
                {personalInfo.age} years old • {personalInfo.gender} •{" "}
                {personalInfo.weight}kg • {personalInfo.height}cm
              </Text>
              <Text style={styles.profileText}>
                Goal: {personalInfo.goal.replace("_", " ")} • Target:{" "}
                {personalInfo.targetCalories} kcal
              </Text>
            </View>
          )}
        </View>

        <View style={styles.recommendationsList}>
          {recommendations.map((food) => (
            <FoodCard key={food.id} food={food} />
          ))}
        </View>

        <TouchableOpacity
          style={styles.regenerateButton}
          onPress={generateRecommendations}
        >
          <Ionicons name="refresh" size={20} color="#4CAF50" />
          <Text style={styles.regenerateButtonText}>
            Generate New Recommendations
          </Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={onClose}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
          <Text>AI Food Recommendations</Text>
          <View />
        </View>

        {/* Content */}
        {renderContent()}
      </SafeAreaView>
    </Modal>
  );
};

export default AIFoodRecommendation;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f1e3ec",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  loadingText: {
    fontSize: 16,
    color: "#666",
    marginTop: 16,
    textAlign: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginBottom: 32,
  },
  setupSection: {
    alignItems: "center",
    marginTop: 20,
  },
  setupTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  setupDescription: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 20,
  },
  setupButton: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  setupButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  generateButton: {
    backgroundColor: "#2196F3",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  generateButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  recommendationsContainer: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#666",
    marginBottom: 12,
  },
  profileInfo: {
    backgroundColor: "#E8F5E8",
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  profileText: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "500",
  },
  recommendationsList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  foodCard: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  foodHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  foodName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    flex: 1,
  },
  foodCalories: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "600",
  },
  nutritionInfo: {
    flexDirection: "row",
    gap: 16,
  },
  nutritionItem: {
    flex: 1,
  },
  nutritionLabel: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  nutritionValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  regenerateButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    backgroundColor: "#E8F5E8",
    borderRadius: 12,
    gap: 8,
  },
  regenerateButtonText: {
    fontSize: 16,
    color: "#4CAF50",
    fontWeight: "600",
  },
});
