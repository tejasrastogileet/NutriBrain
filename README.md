# AI Food Planner MVP

A React Native mobile application that helps users plan their meals with AI-powered food recommendations and nutritional tracking.

## Features

### 🏠 Home Screen
- **Personalized Greeting**: Welcome message with user's name
- **Nutritional Metrics**: Real-time tracking of calories, protein, and carbs
- **Daily/Weekly Toggle**: Switch between daily and weekly meal views
- **Meal Cards**: Visual representation of breakfast, lunch, snacks, and dinner
- **AI Recommendations**: Button to access AI-powered food suggestions

### 📊 Stats Screen
- **Progress Chart**: Visual representation of nutritional progress over time
- **Nutritional Stats**: Detailed breakdown of calories, protein, carbs, and fat
- **Grid/Compact View**: Toggle between different display modes
- **Real-time Updates**: Stats update automatically as meals are added

### 🤖 AI Food Recommendations
- **Category-based Filtering**: Browse recommendations by meal type (breakfast, lunch, dinner, snacks)
- **Nutritional Information**: Each recommendation includes detailed nutritional data
- **Easy Integration**: One-tap to add recommended foods to your meal plan
- **Smart Suggestions**: AI-powered recommendations based on nutritional goals

### 📱 User Experience
- **Modern UI**: Clean, intuitive interface with smooth animations
- **Responsive Design**: Optimized for mobile devices
- **Tab Navigation**: Easy switching between home and stats screens
- **Real-time Updates**: All data updates instantly across the app

## Technical Stack

- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and tools
- **TypeScript**: Type-safe development
- **React Context**: State management for meal planning
- **React Native Chart Kit**: Data visualization
- **Expo Vector Icons**: Icon library

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ai-diet-planner
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Run on your device:
   - Scan the QR code with Expo Go app (iOS/Android)
   - Or press 'i' for iOS simulator or 'a' for Android emulator

## Project Structure

```
ai-diet-planner/
├── app/
│   ├── (tabs)/
│   │   ├── index.tsx          # Home screen
│   │   ├── stats.tsx          # Stats screen
│   │   └── _layout.tsx        # Tab navigation
│   ├── _layout.tsx            # Root layout with providers
│   └── stats.tsx              # Standalone stats screen
├── components/
│   ├── AIFoodRecommendation.tsx  # AI recommendations modal
│   ├── MealPlanContext.tsx       # State management
│   └── ...                     # Other UI components
├── assets/                     # Images and fonts
└── package.json
```

## Key Components

### MealPlanContext
Manages the global state for:
- Meal data (breakfast, lunch, snacks, dinner)
- Nutritional targets and current progress
- Functions to update and remove meals

### AIFoodRecommendation
Modal component that provides:
- AI-powered food suggestions
- Category filtering
- Nutritional information display
- Easy meal integration

### Home Screen
Main dashboard featuring:
- Nutritional metrics with real-time updates
- Meal cards with add/remove functionality
- AI recommendation access
- Daily/weekly view toggle

### Stats Screen
Analytics dashboard with:
- Progress charts
- Detailed nutritional breakdown
- Multiple view modes
- Real-time data updates

## Future Enhancements

- **Backend Integration**: Connect to real AI APIs for personalized recommendations
- **User Authentication**: User accounts and profile management
- **Meal History**: Track past meals and nutritional trends
- **Recipe Integration**: Detailed recipes for recommended meals
- **Social Features**: Share meal plans with friends
- **Notifications**: Reminders for meal times
- **Barcode Scanning**: Scan food items for automatic nutritional data
- **Dietary Restrictions**: Support for various dietary needs (vegetarian, gluten-free, etc.)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
