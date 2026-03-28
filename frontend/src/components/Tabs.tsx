interface TabsProps {
  tabs: string[];
  active: string;
  onChange: (tab: string) => void;
}

export default function Tabs({ tabs, active, onChange }: TabsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {tabs.map((tab) => {
        const selected = active === tab;
        return (
          <button
            key={tab}
            type="button"
            onClick={() => onChange(tab)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              selected
                ? "bg-slate-900 text-white shadow-sm"
                : "bg-white text-slate-500 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
}

