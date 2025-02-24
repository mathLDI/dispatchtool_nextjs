// Define the data tables
export function findMaxFlightLevel(weight, temperature) {
    const weights = [29000, 31000, 33000, 35000, 37000, 39000, 41000, 43000, 45000, 47000, 48500, 49600];
    const temperatures = [-10, -5, 0, 5, 10, 15, 20];
    const flightLevels = [
        [250, 250, 250, 250, 250, 250, 250], // 29000
        [250, 250, 250, 250, 250, 250, 250], // 31000
        [250, 250, 250, 250, 250, 250, 240], // 33000
        [250, 250, 250, 250, 240, 240, 220], // 35000
        [250, 250, 250, 240, 220, 220, 200], // 37000
        [250, 250, 240, 220, 220, 200, 200], // 39000
        [240, 240, 220, 220, 200, 200, 180], // 41000
        [220, 220, 220, 200, 200, 180, 160], // 43000
        [220, 200, 200, 200, 180, 160, 160], // 45000
        [200, 200, 180, 180, 160, 160, 140], // 47000
        [200, 180, 180, 180, 160, 140, 120], // 48500
        [200, 180, 180, 160, 160, 140, 120]  // 49600
    ];

    // Input validation
    if (weight < weights[0] || weight > weights[weights.length - 1]) {
        return "Weight out of range";
    }
    if (temperature < temperatures[0] || temperature > temperatures[temperatures.length - 1]) {
        return "Temperature out of range";
    }

    // Find the next higher weight index for interpolation
    let weightIndex = weights.findIndex(w => w > weight);
    if (weightIndex === -1) {
        weightIndex = weights.length - 1;
    }
    
    // If weight matches exactly, use that index
    const exactWeightIndex = weights.findIndex(w => w === weight);
    if (exactWeightIndex !== -1) {
        weightIndex = exactWeightIndex;
    }

    // Find temperature index
    let tempIndex = temperatures.findIndex(t => t >= temperature);
    if (tempIndex === -1) {
        tempIndex = temperatures.length - 1;
    }

    return flightLevels[weightIndex][tempIndex];
}

// Verify the test cases:
console.log(findMaxFlightLevel(48500, 15));  // Should return 140
console.log(findMaxFlightLevel(43000, 10));  // Should return 200
console.log(findMaxFlightLevel(44000, 10));  // Should now return 180