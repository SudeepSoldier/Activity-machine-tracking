import { View, Text, StyleSheet } from "react-native"
import colors from "../../utils/Colors"

export default function TopComponent({ jobNumber, job }) {
  return (
    <View style={styles.container}>
      {/* Machine Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Machine</Text>
        <Text style={styles.cardSubtitle}>Currently operating</Text>

        <View style={styles.cardContent}>
          <View>
            <Text style={styles.cardMainText}>CNC Mill 1</Text>
            <Text style={styles.cardSecondaryText}>Code: CNC-001</Text>
          </View>
          <View style={styles.activeTag}>
            <Text style={styles.activeTagText}>Active</Text>
          </View>
        </View>
      </View>

      {/* Active Job Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Active Job</Text>
        <Text style={styles.cardSubtitle}>Currently in progress</Text>

        <View style={styles.cardContent}>
          <View>
            <Text style={styles.cardMainText}>{jobNumber || "JOB-2023-001"}</Text>
            <Text style={styles.cardSecondaryText}>{job?.description || "Manufacturing of aerospace components"}</Text>
          </View>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  card: {
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
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.black,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: colors.grey,
    marginBottom: 12,
  },
  cardContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardMainText: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.black,
    marginBottom: 4,
  },
  cardSecondaryText: {
    fontSize: 14,
    color: colors.grey,
  },
  activeTag: {
    backgroundColor: colors.blue,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  activeTagText: {
    color: colors.white,
    fontSize: 14,
    fontWeight: "500",
  },
})
