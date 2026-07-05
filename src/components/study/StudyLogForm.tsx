"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatGrowthNotifications } from "@/lib/game/notifications";
import { useLevelUp } from "@/components/levelup/LevelUpContext";

export function StudyLogForm() {
  const router = useRouter();
  const reportGrowthResult = useLevelUp();
  const [category, setCategory] = useState("");
  const [title, setTitle] = useState("");
  const [minutes, setMinutes] = useState("");
  const [note, setNote] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<string[]>([]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setMessage(null);
    setNotifications([]);
    try {
      const res = await fetch("/api/study-logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          title,
          minutes: Number(minutes),
          note: note || undefined,
        }),
      });
      if (!res.ok) {
        setError("記録の保存に失敗しました。入力内容をご確認ください。");
        return;
      }
      const result = await res.json();
      setMessage(`記録しました(+${result.expGained}EXP)`);
      setNotifications(formatGrowthNotifications(result));
      reportGrowthResult(result);
      setCategory("");
      setTitle("");
      setMinutes("");
      setNote("");
      router.refresh();
    } catch {
      setError("通信エラーが発生しました。ネットワーク環境をご確認ください。");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="category">カテゴリ</Label>
          <Input
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            placeholder="例: Java, AWS"
            required
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="minutes">学習時間(分)</Label>
          <Input
            id="minutes"
            type="number"
            min={1}
            max={1440}
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            required
          />
        </div>
      </div>
      <div className="space-y-1">
        <Label htmlFor="title">内容</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="例: Silver試験の模試を解いた"
          required
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="note">メモ(任意)</Label>
        <Textarea
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
        />
      </div>
      {error && <p className="text-destructive text-sm">{error}</p>}
      {message && <p className="text-muted-foreground text-sm">{message}</p>}
      {notifications.map((line) => (
        <p key={line} className="text-primary text-sm font-medium">
          {line}
        </p>
      ))}
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "記録中..." : "記録する"}
      </Button>
    </form>
  );
}
