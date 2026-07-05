import { GENERIC_TALKS, MEETING_TOPICS, TALK_TEMPLATES } from "@/data/personaTemplates";
import type { AiEmployee, Meeting, MeetingCategory, PhaseId } from "@/services/aiCompanyTypes";

// AI社員の「会話」と「会議」のルールベース生成。
// 台詞テンプレートの職種に一致する社員を探して発言者を決める。
// 将来AI APIに置き換える場合はこのファイルの生成関数を差し替える。

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function speakerFor(role: string, employees: AiEmployee[]): AiEmployee | undefined {
  const matches = employees.filter((e) => e.role === role);
  if (matches.length > 0) return pick(matches);
  return undefined;
}

// 現在の工程に応じた社員同士の会話を生成する(0〜1組/ターン)
export function generateConversation(
  phaseId: PhaseId | null,
  employees: AiEmployee[]
): string[] {
  if (employees.length < 2 || Math.random() < 0.35) return [];

  const pool = (phaseId && TALK_TEMPLATES[phaseId]) || GENERIC_TALKS;
  const template = pick(pool);

  const lines: string[] = [];
  for (const utterance of template) {
    const speaker = speakerFor(utterance.role, employees);
    if (!speaker) continue;
    const line = utterance.line.replace("{likes}", speaker.likes);
    lines.push(`${speaker.name}「${line}」`);
  }
  return lines.length >= 2 ? lines : [];
}

// AI会議を開催する。参加者3〜4人がランダムな議題について発言し、結論を出す。
export function holdMeeting(employees: AiEmployee[], turn: number): Meeting {
  const categories = Object.keys(MEETING_TOPICS) as MeetingCategory[];
  const category = pick(categories);
  const agenda = pick(MEETING_TOPICS[category]);

  const participants = [...employees].sort(() => Math.random() - 0.5).slice(0, Math.min(4, employees.length));
  const opinions = [...agenda.opinions].sort(() => Math.random() - 0.5);

  const utterances = participants.map((p, i) => ({
    name: p.name,
    line: opinions[i % opinions.length],
  }));

  return {
    id: `mtg-${turn}-${Math.floor(Math.random() * 1000)}`,
    turn,
    category,
    topic: agenda.topic,
    utterances,
    conclusion: pick(agenda.conclusions),
  };
}
