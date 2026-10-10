import { LucideIcon } from "lucide-react";

type DashboardCardProps = {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
};

export default function DashboardCard({
  title,
  value,
  description,
  icon: Icon,
}: DashboardCardProps) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 transition duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-gray-100">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">
            {title}
          </p>

          <h3 className="mt-3 text-3xl font-bold tracking-tight text-gray-900">
            {value}
          </h3>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
          <Icon size={21} />
        </div>
      </div>

      <p className="mt-4 text-xs text-gray-400">
        {description}
      </p>
    </div>
  );
}