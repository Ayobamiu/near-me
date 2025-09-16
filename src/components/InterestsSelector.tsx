import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  INTEREST_CATEGORIES,
  InterestCategory,
  getAllInterests,
} from "../services/interestsService";

interface InterestsSelectorProps {
  selectedInterests: string[];
  onInterestsChange: (interests: string[]) => void;
  maxSelections?: number;
  showSearch?: boolean;
}

export default function InterestsSelector({
  selectedInterests,
  onInterestsChange,
  maxSelections = 10,
  showSearch = true,
}: InterestsSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<
    InterestCategory | "all"
  >("all");
  const [allInterests] = useState(getAllInterests());

  // Filter interests based on search and category
  const getFilteredInterests = () => {
    let filtered = allInterests;

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = INTEREST_CATEGORIES[selectedCategory].options;
    }

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter((interest) =>
        interest.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      // Remove interest
      onInterestsChange(selectedInterests.filter((i) => i !== interest));
    } else if (selectedInterests.length < maxSelections) {
      // Add interest
      onInterestsChange([...selectedInterests, interest]);
    }
  };

  const clearAllInterests = () => {
    onInterestsChange([]);
  };

  const filteredInterests = getFilteredInterests();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Your Interests</Text>
        <Text style={styles.subtitle}>
          Help others discover you by sharing your interests. Choose up to{" "}
          {maxSelections} interests ({selectedInterests.length}/{maxSelections})
        </Text>
      </View>

      {/* Search Bar */}
      {showSearch && (
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search interests..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
        </View>
      )}

      {/* Category Filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryContainer}
        contentContainerStyle={styles.categoryContent}
      >
        <TouchableOpacity
          style={[
            styles.categoryButton,
            selectedCategory === "all" && styles.categoryButtonActive,
          ]}
          onPress={() => setSelectedCategory("all")}
        >
          <Text
            style={[
              styles.categoryButtonText,
              selectedCategory === "all" && styles.categoryButtonTextActive,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        {Object.entries(INTEREST_CATEGORIES).map(([key, category], index) => (
          <TouchableOpacity
            key={key + index}
            style={[
              styles.categoryButton,
              selectedCategory === key && styles.categoryButtonActive,
            ]}
            onPress={() => setSelectedCategory(key as InterestCategory)}
          >
            <Text
              style={[
                styles.categoryButtonText,
                selectedCategory === key && styles.categoryButtonTextActive,
              ]}
            >
              {category.icon} {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Clear All Button and Selected Count */}
      <View style={styles.clearButtonContainer}>
        {selectedInterests.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={clearAllInterests}
          >
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.selectedCountText}>
          {selectedInterests.length}/{maxSelections} selected
        </Text>
      </View>

      {/* Interests Grid */}
      <ScrollView style={styles.interestsContainer}>
        <View style={styles.interestsGrid}>
          {filteredInterests.map((interest, index) => {
            const isSelected = selectedInterests.includes(interest);
            const isDisabled =
              !isSelected && selectedInterests.length >= maxSelections;

            return (
              <TouchableOpacity
                key={interest + index}
                style={[
                  styles.interestChip,
                  isSelected && styles.interestChipSelected,
                  isDisabled && styles.interestChipDisabled,
                ]}
                onPress={() => toggleInterest(interest)}
                disabled={isDisabled}
              >
                <Text
                  style={[
                    styles.interestChipText,
                    isSelected && styles.interestChipTextSelected,
                    isDisabled && styles.interestChipTextDisabled,
                  ]}
                >
                  {interest}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Selected Interests Summary - Compact */}
      {selectedInterests.length > 0 && (
        <View style={styles.selectedContainer}>
          <Text style={styles.selectedTitle}>Selected:</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.selectedInterestsScroll}
          >
            <View style={styles.selectedInterests}>
              {selectedInterests.map((interest, index) => (
                <View key={interest + index} style={styles.selectedChip}>
                  <Text style={styles.selectedChipText}>{interest}</Text>
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => toggleInterest(interest)}
                  >
                    <Text style={styles.removeButtonText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </ScrollView>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 5,
    paddingBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  searchInput: {
    backgroundColor: "white",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    borderWidth: 1,
    borderColor: "#e1e5e9",
  },
  categoryContainer: {
    marginBottom: 10,
    maxHeight: 35,
  },
  categoryContent: {
    paddingHorizontal: 20,
  },
  categoryButton: {
    backgroundColor: "white",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "#e1e5e9",
  },
  categoryButtonActive: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  categoryButtonText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  categoryButtonTextActive: {
    color: "white",
  },
  clearButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  clearButton: {
    // Remove alignSelf and marginRight
  },
  clearButtonText: {
    color: "#FF3B30",
    fontSize: 14,
    fontWeight: "500",
  },
  selectedCountText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  interestsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  interestsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  interestChip: {
    backgroundColor: "white",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    marginBottom: 8,
    marginRight: 4,
    borderWidth: 1,
    borderColor: "#e1e5e9",
    minWidth: "30%",
    alignItems: "center",
  },
  interestChipSelected: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  interestChipDisabled: {
    backgroundColor: "#f5f5f5",
    borderColor: "#e1e5e9",
    opacity: 0.5,
  },
  interestChipText: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  interestChipTextSelected: {
    color: "white",
  },
  interestChipTextDisabled: {
    color: "#999",
  },
  selectedContainer: {
    backgroundColor: "white",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#e1e5e9",
  },
  selectedTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  selectedInterestsScroll: {
    maxHeight: 40,
  },
  selectedInterests: {
    flexDirection: "row",
    alignItems: "center",
  },
  selectedChip: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  selectedChipText: {
    color: "white",
    fontSize: 14,
    fontWeight: "500",
    marginRight: 6,
  },
  removeButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
  },
  removeButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
