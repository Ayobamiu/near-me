import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";
import { useConnections } from "../contexts/ConnectionsContext";

export default function TabBarWithBadge({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const { user } = useAuth();
  const { connections } = useConnections();

  // Count incoming connection requests
  const incomingRequestsCount = connections.filter(
    (conn) => conn.toUserId === user?.uid && conn.status === "pending"
  ).length;

  return (
    <View style={styles.tabBar}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label =
          options.tabBarLabel !== undefined
            ? options.tabBarLabel
            : options.title !== undefined
            ? options.title
            : route.name;

        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        const onLongPress = () => {
          navigation.emit({
            type: "tabLongPress",
            target: route.key,
          });
        };

        let iconName: keyof typeof Ionicons.glyphMap;
        if (route.name === "Home") {
          iconName = isFocused ? "people" : "people-outline";
        } else if (route.name === "Connections") {
          iconName = isFocused ? "link" : "link-outline";
        } else if (route.name === "Profile") {
          iconName = isFocused ? "person" : "person-outline";
        } else if (route.name === "Settings") {
          iconName = isFocused ? "settings" : "settings-outline";
        } else {
          iconName = "help-outline";
        }

        const showBadge =
          route.name === "Connections" && incomingRequestsCount > 0;

        return (
          <View key={route.key} style={styles.tabItem}>
            <View style={styles.iconContainer}>
              <Ionicons
                name={iconName}
                size={24}
                color={isFocused ? "#007AFF" : "gray"}
                onPress={onPress}
                onLongPress={onLongPress}
              />
              {showBadge && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>
                    {incomingRequestsCount > 9 ? "9+" : incomingRequestsCount}
                  </Text>
                </View>
              )}
            </View>
            <Text
              style={[styles.label, { color: isFocused ? "#007AFF" : "gray" }]}
              onPress={onPress}
              onLongPress={onLongPress}
            >
              {label}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#e1e5e9",
    paddingBottom: 8,
    paddingTop: 8,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    position: "relative",
    marginBottom: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: "500",
  },
  badge: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "#FF3B30",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "white",
  },
  badgeText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
});
