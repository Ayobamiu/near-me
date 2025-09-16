import React from "react";
import { StyleSheet, Text, View, TouchableOpacity } from "react-native";
import {
  INTEREST_CATEGORIES,
  getInterestCategory,
} from "../services/interestsService";

interface InterestsDisplayProps {
  interests: string[];
  maxDisplay?: number;
  showCommon?: boolean;
  commonInterests?: string[];
  onInterestPress?: (interest: string) => void;
  style?: any;
}

export default function InterestsDisplay({
  interests,
  maxDisplay = 3,
  showCommon = false,
  commonInterests = [],
  onInterestPress,
  style,
}: InterestsDisplayProps) {
  const displayInterests = interests.slice(0, maxDisplay);
  const remainingCount = interests.length - maxDisplay;

  const getInterestIcon = (interest: string): string => {
    const category = getInterestCategory(interest);
    if (category) {
      return INTEREST_CATEGORIES[category].icon;
    }
    return "🎯"; // Default icon
  };

  const isCommonInterest = (interest: string): boolean => {
    return showCommon && commonInterests.includes(interest);
  };

  if (interests.length === 0) {
    return (
      <View style={[styles.container, style]}>
        <Text style={styles.noInterestsText}>No interests added</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.interestsList}>
        {displayInterests.map((interest, index) => {
          const isCommon = isCommonInterest(interest);
          const icon = getInterestIcon(interest);

          return (
            <TouchableOpacity
              key={`${interest}-${index}`}
              style={[
                styles.interestChip,
                isCommon && styles.commonInterestChip,
              ]}
              onPress={() => onInterestPress?.(interest)}
              disabled={!onInterestPress}
            >
              <Text style={styles.interestIcon}>{icon}</Text>
              <Text
                style={[
                  styles.interestText,
                  isCommon && styles.commonInterestText,
                ]}
              >
                {interest}
              </Text>
              {isCommon && <Text style={styles.commonBadge}>★</Text>}
            </TouchableOpacity>
          );
        })}
        {remainingCount > 0 && (
          <View style={styles.moreChip}>
            <Text style={styles.moreText}>+{remainingCount} more</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  interestsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center",
  },
  interestChip: {
    backgroundColor: "#f0f0f0",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  commonInterestChip: {
    backgroundColor: "#FFF3CD",
    borderWidth: 1,
    borderColor: "#FFC107",
  },
  interestIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  interestText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  commonInterestText: {
    color: "#856404",
    fontWeight: "600",
  },
  commonBadge: {
    fontSize: 10,
    color: "#FFC107",
    marginLeft: 2,
    fontWeight: "bold",
  },
  moreChip: {
    backgroundColor: "#e9ecef",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 4,
  },
  moreText: {
    fontSize: 12,
    color: "#6c757d",
    fontWeight: "500",
  },
  noInterestsText: {
    fontSize: 12,
    color: "#999",
    fontStyle: "italic",
  },
});
