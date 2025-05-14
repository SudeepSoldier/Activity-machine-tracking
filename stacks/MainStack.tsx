import { createNativeStackNavigator } from "@react-navigation/native-stack"
import OnBreak from "../screens/OnBreak"
import EndJobScreen from "../screens/EndJobScreen"
import ChangeJob from "../screens/ChangeJob"
import Logout from "../screens/Logout"
import NameOperations from "../screens/NameOperations"

const Stack = createNativeStackNavigator()

const MainStack = ({ initialRouteName = "ChangeJob" }) => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName={initialRouteName}>
      <Stack.Screen name="ChangeJob" component={ChangeJob} />
      <Stack.Screen name="nameOperation" component={NameOperations} />
      <Stack.Screen name="EndJob" component={EndJobScreen} />
      <Stack.Screen name="Logout" component={Logout} />
      <Stack.Screen name="TakeBreak" component={OnBreak} />
    </Stack.Navigator>
  )
}

export default MainStack
