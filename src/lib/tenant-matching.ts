/**
 * テナント照合用ユーティリティ
 * 会社名の揺らぎ（株式会社、㈱など）を吸収し、複数の属性から一致度をスコアリングします。
 */

export interface TenantMatchInput {
  name: string;
  address?: string;
  phoneNumber?: string;
  email: string;
}

/**
 * 文字列の正規化
 * - 全角・半角の統一 (NFKC)
 * - 大文字・小文字の統一
 * - 空白の除去
 * - 法人格呼称（株式会社、有限会社、㈱、(株)等）の除去
 */
export function normalizeCompanyName(name: string): string {
  if (!name) return '';

  return name
    .normalize('NFKC') // 全角・半角を統一
    .toLowerCase()
    .replace(/\s+/g, '') // 空白除去
    .replace(/(株式会社|有限会社|合同会社|（株）|\(株\)|㈱|（有）|\(有\)|㈲|（合）|\(合\)|㈴)/g, '') // 法人格呼称の除去
    .replace(/[!-/:-@[-`{-~]/g, ''); // 記号の除去
}

/**
 * 電話番号の正規化
 * - ハイフンやカッコを除去して数字のみにする
 */
export function normalizePhone(phone?: string): string {
  if (!phone) return '';
  return phone.replace(/\D/g, '');
}

/**
 * メールドメインの抽出
 */
export function getEmailDomain(email: string): string {
  if (!email || !email.includes('@')) return '';
  return email.split('@')[1].toLowerCase();
}

/**
 * スコアリングによるテナント照合
 * 
 * スコア計算:
 * - 名前（正規化後）が完全一致: 5点
 * - 名前（正規化後）が部分一致: 2点
 * - 電話番号（数字のみ）が一致: 3点
 * - メールドメインが一致: 2点
 * - 住所（都道府県・市区町村）が一致: 1点
 * 
 * 閾値: 5点以上で「一致」と判定
 */
export function calculateMatchScore(
  input: TenantMatchInput,
  target: { name: string; address?: string | null; phoneNumber?: string | null; domains?: string[] }
): number {
  let score = 0;

  const normalizedInputName = normalizeCompanyName(input.name);
  const normalizedTargetName = normalizeCompanyName(target.name);

  // 名前チェック
  if (normalizedInputName === normalizedTargetName) {
    score += 5;
  } else if (
    normalizedTargetName.includes(normalizedInputName) ||
    normalizedInputName.includes(normalizedTargetName)
  ) {
    score += 2;
  }

  // 電話番号チェック
  if (input.phoneNumber && target.phoneNumber) {
    const p1 = normalizePhone(input.phoneNumber);
    const p2 = normalizePhone(target.phoneNumber);
    if (p1 === p2 && p1.length >= 10) {
      score += 3;
    }
  }

  // ドメインチェック
  const inputDomain = getEmailDomain(input.email);
  if (inputDomain && target.domains?.includes(inputDomain)) {
    // 汎用ドメイン（gmail.com, yahoo.co.jp等）は除外するのが望ましいが、今回はシンプルに加点
    const genericDomains = ['gmail.com', 'yahoo.co.jp', 'outlook.jp', 'hotmail.com', 'icloud.com'];
    if (!genericDomains.includes(inputDomain)) {
      score += 2;
    }
  }

  // 住所チェック（簡易的な前方一致）
  if (input.address && target.address) {
    // 最初の10文字程度で比較（都道府県＋市区町村を想定）
    const a1 = input.address.replace(/\s+/g, '').slice(0, 10);
    const a2 = target.address.replace(/\s+/g, '').slice(0, 10);
    if (a1 === a2) {
      score += 1;
    }
  }

  return score;
}

export const MATCH_THRESHOLD = 5;
