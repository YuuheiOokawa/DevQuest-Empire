import { Users, Store, Swords, Shield, Bot, PawPrint } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { NPCKind } from "@/components/world/parts/NPC3D";
import type { NpcRosterEntry } from "@/lib/game/npcRoster";
import { Card, CardContent } from "@/components/ui/card";

const NPC_LABEL: Record<NPCKind, string> = {
  resident: "住民",
  merchant: "商人",
  adventurer: "冒険者",
  soldier: "兵士",
  aiWorker: "AI社員",
  animal: "動物",
};

const NPC_DESCRIPTION: Record<NPCKind, string> = {
  resident: "村の暮らしを支える住民たち。",
  merchant: "市場や交易で賑わいを生む商人。",
  adventurer: "クエストに挑む冒険者たち。",
  soldier: "発展した町を守る兵士。",
  aiWorker: "AI画面でコードレビュー・学習・戦略のレポートを届けるAI社員。",
  animal: "村に暮らす動物たち。",
};

const NPC_ICON: Record<NPCKind, LucideIcon> = {
  resident: Users,
  merchant: Store,
  adventurer: Swords,
  soldier: Shield,
  aiWorker: Bot,
  animal: PawPrint,
};

export function NpcSection({ roster }: { roster: NpcRosterEntry[] }) {
  return (
    <div className="space-y-3">
      <h2 className="text-muted-foreground text-sm font-semibold">
        村のNPC
      </h2>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {roster.map((entry) => {
          const Icon = NPC_ICON[entry.kind];
          return (
            <Card key={entry.kind}>
              <CardContent className="flex items-center gap-3 py-3">
                <div className="bg-muted text-foreground flex size-10 shrink-0 items-center justify-center rounded-full">
                  <Icon className="size-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium">{NPC_LABEL[entry.kind]}</span>
                    <span className="text-muted-foreground text-xs">
                      {entry.count}体
                    </span>
                  </div>
                  <p className="text-muted-foreground text-xs">
                    {NPC_DESCRIPTION[entry.kind]}
                  </p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
