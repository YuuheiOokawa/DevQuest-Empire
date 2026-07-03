"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatGrowthNotifications } from "@/lib/game/notifications";

export type QualificationItem = {
  id: string;
  name: string;
  category: string;
  status: "not_started" | "planning" | "passed";
  examDate: string | null;
  passedDate: string | null;
};

const STATUS_LABEL: Record<QualificationItem["status"], string> = {
  not_started: "未着手",
  planning: "受験予定",
  passed: "合格",
};

export function QualificationList({
  initialQualifications,
}: {
  initialQualifications: QualificationItem[];
}) {
  const router = useRouter();
  const [qualifications, setQualifications] = useState(initialQualifications);
  const [planningId, setPlanningId] = useState<string | null>(null);
  const [examDateInput, setExamDateInput] = useState("");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Record<string, string[]>>(
    {}
  );

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
      setQualifications((prev) =>
        prev.map((q) =>
          q.id === qualificationId
            ? { ...q, status: "planning", examDate: examDateInput }
            : q
        )
      );
      setPlanningId(null);
      setExamDateInput("");
      router.refresh();
    } finally {
      setPendingId(null);
    }
  }

  async function handleCancel(qualificationId: string) {
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
      setQualifications((prev) =>
        prev.map((q) =>
          q.id === qualificationId
            ? { ...q, status: "not_started", examDate: null }
            : q
        )
      );
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
      setQualifications((prev) =>
        prev.map((q) =>
          q.id === qualificationId
            ? {
                ...q,
                status: "passed",
                passedDate: new Date().toISOString().slice(0, 10),
              }
            : q
        )
      );
      setNotifications((prev) => ({
        ...prev,
        [qualificationId]: formatGrowthNotifications(result),
      }));
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
                <p className="text-muted-foreground text-xs">{q.category}</p>
              </div>
              <Badge
                variant={q.status === "passed" ? "default" : "secondary"}
                className="shrink-0"
              >
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

            {q.status === "not_started" && (
              <>
                {planningId === q.id ? (
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
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    className="self-start"
                    onClick={() => setPlanningId(q.id)}
                  >
                    受験を予定する
                  </Button>
                )}
              </>
            )}

            {q.status === "planning" && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  disabled={pendingId === q.id}
                  onClick={() => handlePass(q.id)}
                >
                  合格にする(+500EXP)
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pendingId === q.id}
                  onClick={() => handleCancel(q.id)}
                >
                  取り消す
                </Button>
              </div>
            )}
            {notifications[q.id]?.map((line) => (
              <p key={line} className="text-primary text-xs font-medium">
                {line}
              </p>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
