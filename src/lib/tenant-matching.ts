/**
 * テナント照合用ユーティリティ
 * 会社名の揺らぎ（株式会社、㈱など）を吸収し、複数の属性から一致度をスコアリングします。
 */

export interface TenantMatchInput {
  dlcareId?: string;
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
 * - 法人格呼称（㈱、(株)等）を正式名称（株式会社等）に統一
 *   ※削除はせず、位置（前株・後株）を維持したまま比較する
 */
export function normalizeCompanyName(name: string): string {
  if (!name) return '';

  return name
    .normalize('NFKC') // 全角・半角を統一 (㈱ は (株) になる)
    .toLowerCase()
    .replace(/\s+/g, '') // 空白除去
    // 記号や略称を正式名称に統一
    .replace(/(㈱|（株）|\(株\))/g, '株式会社')
    .replace(/(㈲|（有）|\(有\))/g, '有限会社')
    .replace(/(㈴|（合）|\(合\))/g, '合同会社')
    .replace(/[!-/:-@[-`{-~]/g, ''); // その他の純粋な記号のみ除去
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
 * 優先順位: DLCare ID > 会社名 > 住所 > メールドメイン
 * 
 * スコア計算:
 * - DLCare ID（保守ID）が一致: 50点 (最優先)
 * - 名前（正規化後）が完全一致: 10点
 * - 住所（前方10文字）が一致: 5点
 * - メールドメインが一致: 3点 (独自ドメインのみ)
 * - 名前（正規化後）が部分一致: 2点
 * - 電話番号（数字のみ）が一致: 1点
 * 
 * 閾値: 10点以上で候補とする
 */
export function calculateMatchScore(
  input: TenantMatchInput,
  target: { 
    name: string; 
    maintenanceId?: string | null;
    address?: string | null; 
    phoneNumber?: string | null; 
    domains?: string[] 
  }
): number {
  let score = 0;

  // 1. DLCare ID チェック (最優先)
  if (input.dlcareId && target.maintenanceId) {
    const id1 = input.dlcareId.trim().toUpperCase();
    const id2 = target.maintenanceId.trim().toUpperCase();
    if (id1 === id2 && id1 !== '') {
      score += 50;
    }
  }

  const normalizedInputName = normalizeCompanyName(input.name);
  const normalizedTargetName = normalizeCompanyName(target.name);

  // 2. 名前チェック
  if (normalizedInputName === normalizedTargetName) {
    score += 10;
  } else if (
    normalizedTargetName.includes(normalizedInputName) ||
    normalizedInputName.includes(normalizedTargetName)
  ) {
    score += 2;
  }

  // 3. 住所チェック (同名企業の判別用)
  if (input.address && target.address) {
    const a1 = input.address.replace(/\s+/g, '').slice(0, 10);
    const a2 = target.address.replace(/\s+/g, '').slice(0, 10);
    if (a1 === a2) {
      score += 5;
    }
  }

  // 3. ドメインチェック (最終的な絞り込み)
  const inputDomain = getEmailDomain(input.email);
  if (inputDomain && target.domains?.includes(inputDomain)) {
    const genericDomains = ['gmail.com', 'yahoo.co.jp', 'outlook.jp', 'hotmail.com', 'icloud.com'];
    if (!genericDomains.includes(inputDomain)) {
      score += 3;
    }
  }

  // 4. 電話番号チェック (補助)
  if (input.phoneNumber && target.phoneNumber) {
    const p1 = normalizePhone(input.phoneNumber);
    const p2 = normalizePhone(target.phoneNumber);
    if (p1 === p2 && p1.length >= 10) {
      score += 1;
    }
  }

  return score;
}

export const MATCH_THRESHOLD = 10;
