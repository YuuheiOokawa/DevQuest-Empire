import {
  QualificationList,
  type QualificationItem,
} from "@/components/qualifications/QualificationList";

export function CertificationSection({
  qualifications,
}: {
  qualifications: QualificationItem[] | null;
}) {
  if (!qualifications) {
    return (
      <p className="text-destructive text-sm">資格情報を取得できませんでした。</p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-muted-foreground text-sm">
        受験予定を管理し、合格すると+500EXPを獲得できます。
      </p>
      <QualificationList initialQualifications={qualifications} />
    </div>
  );
}
