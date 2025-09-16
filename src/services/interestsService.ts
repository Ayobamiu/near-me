// Predefined interest categories and options
export const INTEREST_CATEGORIES: Record<string, { name: string; icon: string; options: string[] }> = {
    technology: {
        name: "Technology",
        icon: "💻",
        options: [
            "Programming",
            "AI & Machine Learning",
            "Mobile Development",
            "Web Development",
            "Data Science",
            "Cybersecurity",
            "Blockchain",
            "IoT",
            "Cloud Computing",
            "DevOps",
        ],
    },
    sports: {
        name: "Sports",
        icon: "⚽",
        options: [
            "Football",
            "Basketball",
            "Tennis",
            "Swimming",
            "Running",
            "Cycling",
            "Gym",
            "Yoga",
            "Hiking",
            "Skiing",
        ],
    },
    music: {
        name: "Music",
        icon: "🎵",
        options: [
            "Rock",
            "Pop",
            "Hip Hop",
            "Electronic",
            "Jazz",
            "Classical",
            "Country",
            "R&B",
            "Indie",
            "Reggae",
        ],
    },
    arts: {
        name: "Arts & Culture",
        icon: "🎨",
        options: [
            "Painting",
            "Photography",
            "Writing",
            "Dancing",
            "Theater",
            "Museums",
            "Literature",
            "Film",
            "Design",
            "Crafts",
        ],
    },
    lifestyle: {
        name: "Lifestyle",
        icon: "🌟",
        options: [
            "Travel",
            "Cooking",
            "Fashion",
            "Fitness",
            "Meditation",
            "Reading",
            "Gaming",
            "Movies",
            "Podcasts",
            "Coffee",
        ],
    },
    business: {
        name: "Business",
        icon: "💼",
        options: [
            "Entrepreneurship",
            "Marketing",
            "Finance",
            "Sales",
            "Management",
            "Consulting",
            "Startups",
            "Investing",
            "Networking",
            "Leadership",
        ],
    },
    education: {
        name: "Education",
        icon: "📚",
        options: [
            "Learning",
            "Teaching",
            "Research",
            "Languages",
            "Online Courses",
            "Certifications",
            "Mentoring",
            "Academic",
            "Professional Development",
            "Skills",
        ],
    },
    hobbies: {
        name: "Hobbies",
        icon: "🎯",
        options: [
            "Gaming",
            "Board Games",
            "Puzzles",
            "Collecting",
            "Gardening",
            "DIY",
            "Woodworking",
            "Knitting",
            "Chess",
            "Magic",
        ],
    },
} as const;

export type InterestCategory = keyof typeof INTEREST_CATEGORIES;
export type InterestOption = string;

// Get all available interests as a flat list
export const getAllInterests = (): string[] => {
    const allInterests: string[] = [];
    Object.values(INTEREST_CATEGORIES).forEach((category) => {
        allInterests.push(...category.options);
    });
    return allInterests;
};

// Get interests by category
export const getInterestsByCategory = (category: InterestCategory): string[] => {
    return INTEREST_CATEGORIES[category].options;
};

// Find which category an interest belongs to
export const getInterestCategory = (interest: string): InterestCategory | null => {
    for (const [categoryKey, category] of Object.entries(INTEREST_CATEGORIES)) {
        if (category.options.includes(interest)) {
            return categoryKey as InterestCategory;
        }
    }
    return null;
};

// Get common interests between two users
export const getCommonInterests = (user1Interests: string[], user2Interests: string[]): string[] => {
    return user1Interests.filter(interest => user2Interests.includes(interest));
};

// Get interest suggestions based on existing interests
export const getInterestSuggestions = (currentInterests: string[], limit: number = 5): string[] => {
    const allInterests = getAllInterests();
    const suggestions = allInterests
        .filter(interest => !currentInterests.includes(interest))
        .slice(0, limit);
    return suggestions;
};
