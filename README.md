# 🏃‍♂️ Edge GPS Tracker - Take Home Test

Welcome to the Edge take-home test! This challenge is designed to simulate a real-world feature we might build in the
Edge app. It focuses on mobile location tracking and front-end feature implementation.

---

## 📦 Overview

This app is a **basic GPS activity tracker**. It contains the following features:

1. Start a workout session that tracks their GPS location.
   a. Forground location permisions are required from the user
     i. Error handled by alerts
3. View their route on a live map.
   a. Route is tracked uniil activty is stoped or saved
   b. Live metrics are updated throughout activity:
     i. Distance (mi)
     ii. Pace (time/mi)
     iii. Time
4. Activity overview can be viewed.
   a. Route tracked and centered within map region
   b. View 100m split times
   c. View additional metrics
     i. Calories burnt (estimation)
     ii. Average Heart rate (would require integration with external services)

Code is written with standerd React practices.
- Hierarchical grouping of folders with reusable tools and components.

---

## 🚀 Next Steps

Handling of location tracking is currently handled by a series of useEffect hooks. 
- This logic would be compartmentalised within context provider along with state management

Workout is not saved
- backend implementation needed to save to DB
- current activity would be saved in local storage

---

## 🧪 Project Setup

### 1. Frontend

```bash
cd location-tracker 
npm install
cd ios && pod install && cd ..
npm run start
npm run ios
```
