export const calculateGapScore = (
  currentLevel: number,
  desiredLevel: number,
): number => {
  let result: number;

  if (currentLevel > desiredLevel) {
    result = Math.pow(currentLevel - desiredLevel, 2);
  } else {
    result = (currentLevel - desiredLevel) * (desiredLevel - currentLevel);
  }

  if ([-1, 0, 1].includes(result)) {
    return 1; // LOW
  } else if ([-4, 4].includes(result)) {
    return 2; // MEDIUM
  } else if ([-16, -9, 9, 16].includes(result)) {
    return 3; // HIGH
  }

  return 0; // Default case, though the logic should cover all scenarios
};
