import { CATEGORY_COLORS } from "@/lib/constants";

export function CategoryPill({ name }: { name: string }) {
    const colorClass = CATEGORY_COLORS[name] || CATEGORY_COLORS["Default"];
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClass}`}>
            (name)
        </span>
    );
}