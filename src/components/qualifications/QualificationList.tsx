"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLevelUp } from "@/components/levelup/LevelUpContext";

export type QualificationStatus =
  | "not_started"
  | "learning"
  | "planning"
  | "passed"
  | "failed"
  | "on_hold";

export type QualificationDifficulty = "easy" | "normal" | "hard" | "expert";

export type QualificationItem = {
  id: string;
  name: string;
  category: string;
  difficulty: QualificationDifficulty;
  expReward: number;
  status: QualificationStatus;
  examDate: string | null;
  passedDate: string | null;
};

const STATUS_LABEL: Record<QualificationStatus, string> = {
  not_started: "未着手",
  learning: "学習中",
  planning: "受験予定",
  passed: "合格",
  failed: "不合格",
  on_hold: "保留",
};

const STATUS_BADGE_VARIANT: Record<
  QualificationStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  not_started: "secondary",
  learning: "outline",
  planning: "secondary",
  passed: "default",
  failed: "destructive",
  on_hold: "outline",
};

const DIFFICULTY_LABEL: Record<QualificationDifficulty, string> = {
  easy: "易",
  normal: "普通",
  hard: "難",
  expert: "最難関",
};

export function QualificationList({
  initialQualifications,
}: {
  initialQualifications: QualificationItem[];
}) {
  const router = useRouter();
  const reportGrowthResult = useLevelUp();
  const [qualifications, setQualifications] = useState(initialQualifications);
  const [planningId, setPlanningId] = useState<string | null>(null);
  const [examDateInput, setExamDateInput] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function updateLocalStatus(
    qualificationId: string,
    status: QualificationStatus,
    extra: Partial<QualificationItem> = {}
  ) {
    setQualifications((prev) =>
      prev.map((q) => (q.id === qualificationId ? { ...q, status, ...extra } : q))
    );
  }

  async function handleStatusChange(
    qualificationId: string,
    status: "learning" | "on_hold" | "failed"
  ) {
    setPendingId(qualificationId);
    setError(null);
    try {
      const res = await fetch(`/api/qualifications/${qualificationId}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        setError("更新に失敗しました。時間をおいて再度お試しください。");
        return;
      }
      updateLocalStatus(qualificationId, status);
      router.refresh();
    } finally {
      setPendingId(null);
    }
  }

  async function handlePlan(qualificationId: string) {
    if (!examDateInput) return;
    setPendingId(qualificationId);
    setError(null);
    try {
      const res = await fetch(`/api/qualifications/${qualificationId}/plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ examDate: examDateInput }),
      });
      if (!res.ok) {
        setError("更新に失敗しました。時間をおいて再度お試しください。");
        return;
      }
      updateLocalStatus(qualificationId, "planning", { examDate: examDateInput });
      setPlanningId(null);
      setExamDateInput("");
      router.refresh();
    } finally {
      setPendingId(null);
    }
  }

  async function handleReset(qualificationId: string) {
    setPendingId(qualificationId);
    setError(null);
    try {
      const res = await fetch(`/api/qualifications/${qualificationId}/cancel`, {
        method: "POST",
      });
      if (!res.ok) {
        setError("更新に失敗しました。時間をおいて再度お試しください。");
        return;
      }
      updateLocalStatus(qualificationId, "not_started", { examDate: null });
      router.refresh();
    } finally {
      setPendingId(null);
    }
  }

  async function handlePass(qualificationId: string) {
    setPendingId(qualificationId);
    setError(null);
    try {
      const res = await fetch(`/api/qualifications/${qualificationId}/pass`, {
        method: "POST",
      });
      const result = await res.json();
      if (!res.ok) {
        setError("更新に失敗しました。時間をおいて再度お試しください。");
        return;
      }
      updateLocalStatus(qualificationId, "passed", {
        passedDate: new Date().toISOString().slice(0, 10),
      });
      reportGrowthResult(result);
      router.refresh();
    } finally {
      setPendingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {error && <p className="text-destructive text-sm">{error}</p>}
      {qualifications.map((q) => (
        <Card key={q.id}>
          <CardContent className="flex flex-col gap-2 py-4">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate font-medium">{q.name}</p>
                <p className="text-muted-foreground text-xs">
                  {q.category} ・ 難易度: {DIFFICULTY_LABEL[q.difficulty]} ・ +
                  {q.expReward}EXP
                </p>
              </div>
              <Badge variant={STATUS_BADGE_VARIANT[q.status]} className="shrink-0">
                {STATUS_LABEL[q.status]}
              </Badge>
            </div>

            {q.status === "planning" && q.examDate && (
              <p className="text-muted-foreground text-sm">
                受験予定日: {q.examDate}
              </p>
            )}
            {q.status === "passed" && q.passedDate && (
              <p className="text-muted-foreground text-sm">
                合格日: {q.passedDate}
              </p>
            )}

            {planningId === q.id && (
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={examDateInput}
                  onChange={(e) => setExamDateInput(e.target.value)}
                  className="max-w-40"
                />
                <Button
                  size="sm"
                  disabled={pendingId === q.id || !examDateInput}
                  onClick={() => handlePlan(q.id)}
                >
                  決定
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPlanningId(null)}
                >
                  キャンセル
                </Button>
              </div>
            )}

            {planningId !== q.id && (
              <div className="flex flex-wrap gap-2">
                {(q.status === "not_started" || q.status === "on_hold") && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={pendingId === q.id}
                    onClick={() => handleStatusChange(q.id, "learning")}
                  >
                    学習を始める
                  </Button>
                )}
                {q.status !== "passed" && q.status !== "planning" && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={pendingId === q.id}
                    onClick={() => setPlanningId(q.id)}
                  >
                    受験を予定する
                  </Button>
                )}
                {(q.status === "learning" || q.status === "planning") && (
                  <Button
                    size="sm"
                    disabled={pendingId === q.id}
                    onClick={() => handlePass(q.id)}
                  >
                    合格にする(+{q.expReward}EXP)
                  </Button>
                )}
                {q.status === "planning" && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={pendingId === q.id}
                    onClick={() => handleStatusChange(q.id, "failed")}
                  >
                    不合格にする
                  </Button>
                )}
                {q.status === "learning" && (
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={pendingId === q.id}
                    onClick={() => handleStatusChange(q.id, "on_hold")}
                  >
                    保留にする
                  </Button>
                )}
                {(q.status === "planning" ||
                  q.status === "learning" ||
                  q.status === "failed" ||
                  q.status === "on_hold") && (
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={pendingId === q.id}
                    onClick={() => handleReset(q.id)}
                  >
                    リセット
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
