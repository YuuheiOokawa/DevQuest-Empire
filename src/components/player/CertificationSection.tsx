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
        学習状況を管理し、合格すると難易度に応じたEXPを獲得できます。
      </p>
      <QualificationList initialQualifications={qualifications} />
    </div>
  );
}
