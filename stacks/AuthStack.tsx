import React from "react"
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import ReadyForOperations from "../screens/ReadyForOperations"

const Stack = createNativeStackNavigator()

const AuthStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={ReadyForOperations} />
    </Stack.Navigator>
  )
}

export default AuthStack

