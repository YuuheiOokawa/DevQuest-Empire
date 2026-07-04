// 検証用の一時的な管理者機能。tierの見た目確認が終わり次第、
// このファイル・src/app/api/debug/・src/components/debug/・
// Player.debugTierOverrideフィールドをまとめて削除する予定。

const DEBUG_ADMIN_EMAIL = "yuuheiookawa@gmail.com";

export function isDebugAdmin(email: string | null | undefined): boolean {
  return email === DEBUG_ADMIN_EMAIL;
}
