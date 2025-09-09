import { View } from "react-native";

interface ProgressBarProps {
  percentage: number;
  color: string;
}

const ProgressBar = ({ percentage, color }: ProgressBarProps) => {
  return (
    <View className="h-2 bg-gray-200 rounded-full">
      <View
        className={`h-full rounded-full ${color}`}
        style={{ width: `${percentage}%` }}
      />
    </View>
  );
};

export default ProgressBar;
