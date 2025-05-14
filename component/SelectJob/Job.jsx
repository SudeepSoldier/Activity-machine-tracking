import { View, Text, StyleSheet, TouchableOpacity } from "react-native"
import colors from "../../utils/Colors"
import Ionicons from "react-native-vector-icons/Ionicons"

export default function Job({ title, description, level, time, onPress }) {
  // Determine the priority icon and color based on level
  const getPriorityDetails = () => {
    const priorityLevel = level?.toLowerCase() || "normal"

    switch (priorityLevel) {
      case "high":
        return { icon: "alert-circle", color: colors.red }
      case "medium":
        return { icon: "alert", color: colors.orange }
      default:
        return { icon: "information-circle", color: colors.blue }
    }
  }

  const { icon, color } = getPriorityDetails()

  return (
    <TouchableOpacity style={styles.root} onPress={onPress}>
      <View style={styles.leftContainer}>
        <Text style={styles.title}>{title || "Unnamed Job"}</Text>
        <Text style={styles.description}>{description || "No description available"}</Text>
      </View>

      <View style={styles.rightContainer}>
        <View style={styles.priorityContainer}>
          <Ionicons name={icon} size={24} color={color} />
          <Text style={[styles.priorityText, { color }]}>{level || "Normal"}</Text>
        </View>

        {/* <View style={styles.timeContainer}>
          <Ionicons name="time-outline" size={24} color={colors.grey} />
          <Text style={styles.timeText}>{time ? `${time} hours` : "Time N/A"}</Text>
        </View> */}
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  root: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: colors.white,
    padding: 16,
    height: 90,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  leftContainer: {
    flex: 1,
    justifyContent: "center",
  },
  rightContainer: {
    alignItems: "flex-end",
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: colors.grey,
  },
  priorityContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  priorityText: {
    marginLeft: 4,
    fontWeight: "500",
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  timeText: {
    marginLeft: 4,
    color: colors.grey,
  },
})
