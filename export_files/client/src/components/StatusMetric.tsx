interface StatusMetricProps {
  label: string;
  value: string;
  percentage: number;
  color: string;
  textColor: string;
}

export default function StatusMetric({ 
  label, 
  value, 
  percentage, 
  color, 
  textColor 
}: StatusMetricProps) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-sm font-medium">{label}</span>
        <span className={`text-sm ${textColor}`}>{value}</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div 
          className={`${color} h-2 rounded-full`} 
          style={{ width: `${Math.min(100, Math.max(5, percentage))}%` }}
        ></div>
      </div>
    </div>
  );
}
