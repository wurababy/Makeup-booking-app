/* Shared by the browser and the server. */
export type FeatureKey = "shape" | "eyes" | "lips" | "jaw" | "cheeks" | "proportions";
export type Confidence = "high" | "medium" | "low";
export type FeatureResult = { value: string; confidence: Confidence; note: string };
export type Assessment = {
  faceDetected: boolean;
  photoNote: string;
  features: Record<FeatureKey, FeatureResult>;
  skinObservations: string;
};

export const FEATURES: { key: FeatureKey; label: string; options: string[] }[] = [
  { key: "shape", label: "Face shape", options: ["Oval", "Round", "Heart", "Square", "Diamond", "Long"] },
  { key: "eyes", label: "Eye shape", options: ["Almond", "Round", "Hooded", "Upturned", "Downturned", "Monolid"] },
  { key: "lips", label: "Lip shape", options: ["Balanced", "Full", "Fuller lower lip", "Thinner upper lip", "Wide", "Petite"] },
  { key: "jaw", label: "Jawline", options: ["Soft", "Defined", "Angular", "Rounded"] },
  { key: "cheeks", label: "Cheekbones", options: ["High", "Soft", "Subtle", "Wide-set"] },
  { key: "proportions", label: "Facial proportions", options: ["Balanced", "Longer face", "Wider face", "Fuller forehead", "Wider jaw"] },
];
export const SKIN_FEEL = ["Not sure", "Dry", "Normal", "Oily", "Combination", "Sensitive"];
export const MAX_PHOTO_BYTES = 1_500_000;
