import { View, StyleSheet, TouchableOpacity, Text } from "react-native"
import Ionicons from "react-native-vector-icons/Ionicons"
import { useNavigation } from "@react-navigation/native"
import colors from "../../utils/Colors"

export default function BottomButtons({ jobId }) {
  const navigation = useNavigation()

  const handleTakeBreak = () => {
    navigation.navigate("TakeBreak", { jobId })
  }

  const handleEndJob = () => {
    navigation.navigate("EndJob", { jobId })
  }

  const handleChangeJob = () => {
    navigation.navigate("ChangeJob")
  }

  const handleLogout = () => {
    navigation.navigate("Logout", { jobId })
  }

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <TouchableOpacity style={styles.button} onPress={handleTakeBreak}>
          <Ionicons name="pause" size={24} color={colors.blue} />
          <Text style={styles.buttonText}>Take Break</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleChangeJob}>
          <Ionicons name="create-outline" size={24} color={colors.blue} />
          <Text style={styles.buttonText}>Change Job</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.row}>
        <TouchableOpacity style={styles.button} onPress={handleEndJob}>
          <Ionicons name="checkmark-circle-outline" size={24} color={colors.blue} />
          <Text style={styles.buttonText}>End Job</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={handleLogout}>
          <Ionicons name="log-out-outline" size={24} color={colors.red} />
          <Text style={[styles.buttonText, { color: colors.red }]}>Logout</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginTop: "auto",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 16,
    width: "48%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "500",
    color: colors.blue,
    marginLeft: 8,
  },
})
