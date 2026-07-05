import { Zap, Heart, Flame } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { moodOf, type AiEmployee, type Rarity } from "@/services/aiCompanyTypes";

// レアリティごとのカード装飾。高レアほど華やかにする。
const RARITY_CARD: Record<Rarity, string> = {
  N: "border-neutral-200 bg-neutral-50/60 dark:border-neutral-800 dark:bg-neutral-900/40",
  R: "border-sky-200 bg-sky-50/60 dark:border-sky-900 dark:bg-sky-950/30",
  SR: "border-violet-300 bg-violet-50/70 dark:border-violet-900 dark:bg-violet-950/30",
  SSR: "border-amber-300 bg-gradient-to-br from-amber-50 to-yellow-100/70 shadow-sm shadow-amber-200/60 dark:border-amber-800 dark:from-amber-950/40 dark:to-yellow-950/30",
  UR: "border-fuchsia-300 bg-gradient-to-br from-fuchsia-50 via-amber-50 to-sky-50 shadow-md shadow-fuchsia-200/50 dark:border-fuchsia-800 dark:from-fuchsia-950/40 dark:via-amber-950/30 dark:to-sky-950/30",
  LR: "border-rose-300 bg-gradient-to-br from-rose-50 via-orange-50 to-amber-50 shadow-md shadow-rose-200/60 dark:border-rose-800 dark:from-rose-950/40 dark:via-orange-950/30 dark:to-amber-950/30",
  神話: "border-indigo-400 bg-gradient-to-br from-indigo-50 via-violet-50 to-fuchsia-50 shadow-lg shadow-indigo-300/50 ring-1 ring-indigo-200 dark:border-indigo-700 dark:from-indigo-950/50 dark:via-violet-950/40 dark:to-fuchsia-950/40 dark:ring-indigo-900",
  伝説: "border-yellow-400 bg-gradient-to-br from-yellow-50 via-amber-100 to-yellow-50 shadow-lg shadow-yellow-300/60 ring-2 ring-yellow-300 dark:border-yellow-700 dark:from-yellow-950/50 dark:via-amber-950/40 dark:to-yellow-950/50 dark:ring-yellow-800",
};

const RARITY_BADGE: Record<Rarity, string> = {
  N: "bg-neutral-400 text-white",
  R: "bg-sky-500 text-white",
  SR: "bg-violet-500 text-white",
  SSR: "bg-gradient-to-r from-amber-400 to-yellow-500 text-white",
  UR: "bg-gradient-to-r from-fuchsia-500 via-amber-400 to-sky-500 text-white",
  LR: "bg-gradient-to-r from-rose-500 via-orange-400 to-amber-500 text-white",
  神話: "bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 text-white",
  伝説: "bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-400 text-white shadow-sm",
};

const MOOD_EMOJI: Record<string, string> = {
  絶好調: "🔥",
  好調: "😊",
  普通: "😐",
  お疲れ: "😪",
  ピリピリ: "💢",
};

function StatBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-muted-foreground w-8 shrink-0 text-[10px]">{label}</span>
      <Progress value={value} className="h-1" />
      <span className="text-muted-foreground w-6 shrink-0 text-right text-[10px]">{value}</span>
    </div>
  );
}

export function AiEmployeeCard({ employee, busy }: { employee: AiEmployee; busy: boolean }) {
  const mood = moodOf(employee);
  return (
    <div className={`rounded-2xl border p-3 ${RARITY_CARD[employee.rarity]}`}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${RARITY_BADGE[employee.rarity]}`}>
            {employee.rarity}
          </span>
          <span className="truncate text-sm font-semibold">{employee.name}</span>
          <span className="text-muted-foreground shrink-0 text-[10px]">Lv.{employee.level}</span>
          <span className="shrink-0 text-xs" title={`機嫌: ${mood}`}>
            {MOOD_EMOJI[mood]}
          </span>
        </div>
        {busy && (
          <Badge variant="outline" className="shrink-0 text-[10px]">
            作業中
          </Badge>
        )}
      </div>
      <p className="text-muted-foreground mt-0.5 text-[11px]">
        {employee.role} ・ {employee.personality} ・ 得意: {employee.specialty}
      </p>
      <p className="text-muted-foreground text-[10px]">
        ❤️ {employee.likes} / 💔 {employee.dislikes} ・ {employee.favLanguage}派
      </p>
      <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-1">
        <StatBar label="企画" value={employee.planning} />
        <StatBar label="デザ" value={employee.design} />
        <StatBar label="実装" value={employee.coding} />
        <StatBar label="テスト" value={employee.testing} />
        <StatBar label="速度" value={employee.speed} />
        <StatBar label="品質" value={employee.quality} />
      </div>
      {employee.skills.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {employee.skills.slice(0, 6).map((skill) => (
            <span key={skill} className="bg-background/80 rounded-full border px-1.5 py-0.5 text-[9px]">
              {skill}
            </span>
          ))}
          {employee.skills.length > 6 && (
            <span className="text-muted-foreground text-[9px]">+{employee.skills.length - 6}</span>
          )}
        </div>
      )}
      <div className="text-muted-foreground mt-2 flex items-center justify-between text-[10px]">
        <span className="flex items-center gap-0.5">
          <Zap className="size-3 text-amber-500" />
          体力 {employee.stamina}
        </span>
        <span className="flex items-center gap-0.5">
          <Heart className="size-3 text-rose-500" />
          モチベ {employee.motivation}
        </span>
        <span className="flex items-center gap-0.5">
          <Flame className="size-3 text-orange-500" />
          ストレス {employee.stress}
        </span>
        <span>週給 {employee.salary.toLocaleString()}円</span>
      </div>
    </div>
  );
}
