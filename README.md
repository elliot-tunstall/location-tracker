# 🏃‍♂️ Edge GPS Tracker – Take-Home Test

Welcome to the Edge take-home test!  
This challenge simulates a real-world feature we might build in the Edge app. It focuses on mobile location tracking and front-end feature implementation.

---

## 📦 Overview

This app is a basic GPS activity tracker with the following features:

1. **Start a workout session** that tracks GPS location  
  - Requires **foreground location permissions**  
  - Errors handled via alerts  
2. **Live route tracking on a map**  
  - Route tracked until activity is stopped or saved  
  - Real-time metrics:
    - Distance (mi)  
    - Pace (time/mi)  
    - Time  
3. **Activity overview screen**  
  - Route centered in map region  
  - 100m split times shown  
  - Additional metrics:
    - Estimated calories burned  
    - Average heart rate (would require external service integration)

---

## 🧠 Code Structure

- Standard React Native practices  
- Hierarchical folder structure  
- Reusable tools and components

---

## 🚀 Next Steps

- **Refactor location tracking**
  - Currently managed with multiple `useEffect` hooks  
  - Should be moved into a `Context` provider for better state management  
- **Persist workout data**
  - Not currently saved  
  - Backend implementation needed for DB persistence  
  - Temporary local storage solution could be added

---

## 🧪 Project Setup

1. Clone and install dependencies:
   ```bash
   cd location-tracker
   npm install
   ```
2. Install iOS dependencies:
   ```bash   
   cd ios && pod install && cd ..
   ```
3. Start Metro:
   ```bash   
   npm run start
   ```
4. Run on iOS:
   ```bash   
   npm run ios
   ```
