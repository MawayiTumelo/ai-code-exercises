// Shipping cost calculator refactored with the Strategy Pattern

class StandardShippingStrategy {
  calculate(packageDetails, destinationCountry) {
    const { weight, length, width, height } = packageDetails;
    const rateMap = { USA: 2.5, Canada: 3.5, Mexico: 4.0 };
    const rate = rateMap[destinationCountry] || 4.5;
    let cost = weight * rate;

    const volume = length * width * height;
    if (weight < 2 && volume > 1000) {
      cost += 5.0; // Dimensional weight surcharge
    }
    return cost;
  }
}

class ExpressShippingStrategy {
  calculate(packageDetails, destinationCountry) {
    const { weight, length, width, height } = packageDetails;
    const rateMap = { USA: 4.5, Canada: 5.5, Mexico: 6.0 };
    const rate = rateMap[destinationCountry] || 7.5;
    let cost = weight * rate;

    const volume = length * width * height;
    if (volume > 5000) {
      cost += 15.0; // Large package surcharge
    }
    return cost;
  }
}

class OvernightShippingStrategy {
  calculate(packageDetails, destinationCountry) {
    const { weight } = packageDetails;
    const rateMap = { USA: 9.5, Canada: 12.5 };

    if (!(destinationCountry in rateMap)) {
      return "Overnight shipping not available for this destination";
    }
    return weight * rateMap[destinationCountry];
  }
}

class ShippingCalculator {
  constructor() {
    this.strategies = new Map();
    this.registerStrategy('standard', new StandardShippingStrategy());
    this.registerStrategy('express', new ExpressShippingStrategy());
    this.registerStrategy('overnight', new OvernightShippingStrategy());
  }

  registerStrategy(methodName, strategy) {
    this.strategies.set(methodName.toLowerCase(), strategy);
  }

  calculate(packageDetails, destinationCountry, shippingMethod) {
    const strategy = this.strategies.get(shippingMethod.toLowerCase());
    if (!strategy) {
      throw new Error(`Unsupported shipping method: ${shippingMethod}`);
    }

    const result = strategy.calculate(packageDetails, destinationCountry);
    if (typeof result === 'string') {
      return result;
    }
    return result.toFixed(2);
  }
}

const defaultCalculator = new ShippingCalculator();

function calculateShippingCost(packageDetails, destinationCountry, shippingMethod) {
  return defaultCalculator.calculate(packageDetails, destinationCountry, shippingMethod);
}

// Example usage
const pkg = { weight: 5, length: 10, width: 10, height: 10 };
console.log(calculateShippingCost(pkg, 'USA', 'standard'));   // "12.50"
console.log(calculateShippingCost(pkg, 'Canada', 'express'));  // "27.50"

module.exports = {
  calculateShippingCost,
  ShippingCalculator,
  StandardShippingStrategy,
  ExpressShippingStrategy,
  OvernightShippingStrategy
};