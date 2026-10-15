import { Language } from '../i18n/types';
import { useTranslation } from '../i18n';

/**
 * Tự động chuẩn hóa và dịch tên Vòng đấu (Round Name) theo ngôn ngữ được chọn.
 * Hỗ trợ song phương (English standard <-> Tiếng Việt cũ/mới).
 */
export function localizeRoundName(rawName: string | undefined | null, lang: Language): string {
  if (!rawName) return '';
  const trimmed = rawName.trim();
  const isEn = lang === 'en';

  // 1. Matchday / Lượt trận
  const matchdayMatch = trimmed.match(/^(?:Matchday|Lượt)\s*(\d+)$/i);
  if (matchdayMatch) {
    const num = matchdayMatch[1];
    return isEn ? `Matchday ${num}` : `Lượt ${num}`;
  }

  // 2. Regular League Round (Vòng X / Round X)
  const roundMatch = trimmed.match(/^(?:Round|Vòng)\s*(\d+)$/i);
  if (roundMatch) {
    const num = roundMatch[1];
    return isEn ? `Round ${num}` : `Vòng ${num}`;
  }

  // 3. Round of 16 (Vòng 1/8) with legs
  if (/^Round of 16\s*-\s*1st Leg$/i.test(trimmed) || /^Vòng 1\/8\s*-\s*Lượt Đi$/i.test(trimmed)) {
    return isEn ? 'Round of 16 - 1st Leg' : 'Vòng 1/8 - Lượt Đi';
  }
  if (/^Round of 16\s*-\s*2nd Leg$/i.test(trimmed) || /^Vòng 1\/8\s*-\s*Lượt Về$/i.test(trimmed)) {
    return isEn ? 'Round of 16 - 2nd Leg' : 'Vòng 1/8 - Lượt Về';
  }
  if (/^Round of 16$/i.test(trimmed) || /^Vòng 1\/8$/i.test(trimmed) || /Vòng 6\s*\(Vòng 1\/8\)/i.test(trimmed)) {
    return isEn ? 'Round of 16' : 'Vòng 1/8';
  }

  // 4. Quarter-finals (Tứ Kết) with legs
  if (/^Quarter-finals\s*-\s*1st Leg$/i.test(trimmed) || /^Tứ Kết\s*-\s*Lượt Đi$/i.test(trimmed)) {
    return isEn ? 'Quarter-finals - 1st Leg' : 'Tứ Kết - Lượt Đi';
  }
  if (/^Quarter-finals\s*-\s*2nd Leg$/i.test(trimmed) || /^Tứ Kết\s*-\s*Lượt Về$/i.test(trimmed)) {
    return isEn ? 'Quarter-finals - 2nd Leg' : 'Tứ Kết - Lượt Về';
  }
  if (/^Quarter-finals$/i.test(trimmed) || /^Tứ Kết$/i.test(trimmed) || /Vòng 7\s*\(Tứ Kết\)/i.test(trimmed)) {
    return isEn ? 'Quarter-finals' : 'Tứ Kết';
  }

  // 5. Semi-finals (Bán Kết) with legs
  if (/^Semi-finals\s*-\s*1st Leg$/i.test(trimmed) || /^Bán Kết\s*-\s*Lượt Đi$/i.test(trimmed)) {
    return isEn ? 'Semi-finals - 1st Leg' : 'Bán Kết - Lượt Đi';
  }
  if (/^Semi-finals\s*-\s*2nd Leg$/i.test(trimmed) || /^Bán Kết\s*-\s*Lượt Về$/i.test(trimmed)) {
    return isEn ? 'Semi-finals - 2nd Leg' : 'Bán Kết - Lượt Về';
  }
  if (/^Semi-finals$/i.test(trimmed) || /^Bán Kết$/i.test(trimmed) || /Vòng 8\s*\(Bán Kết\)/i.test(trimmed)) {
    return isEn ? 'Semi-finals' : 'Bán Kết';
  }

  // 6. Finals (Chung Kết)
  if (/^Continental Cup Final$/i.test(trimmed) || /Chung Kết Cúp Châu Lục/i.test(trimmed)) {
    return isEn ? 'Continental Cup Final' : 'Chung Kết Cúp Châu Lục';
  }
  if (/^Super Cup Final$/i.test(trimmed) || /Chung Kết Siêu Cúp/i.test(trimmed)) {
    return isEn ? 'Super Cup Final' : 'Chung Kết Siêu Cúp';
  }
  if (/^Final$/i.test(trimmed) || /^Chung kết$/i.test(trimmed) || /Vòng 9\s*\(Chung Kết Cúp QG\)/i.test(trimmed)) {
    return isEn ? 'Final' : 'Chung Kết';
  }

  // 7. Domestic Cup specific knockout rounds (Tiered Entry)
  if (/^Round 1\s*\(Tier 4\)$/i.test(trimmed) || /^Vòng 1\s*\(Tier 4\)$/i.test(trimmed)) {
    return isEn ? 'Round 1 (Tier 4)' : 'Vòng 1 (Tier 4)';
  }
  if (/^Round 2\s*\(\+\s*Tier 3\)$/i.test(trimmed) || /^Vòng 2\s*\(\+\s*Tier 3\)$/i.test(trimmed)) {
    return isEn ? 'Round 2 (+ Tier 3)' : 'Vòng 2 (+ Tier 3)';
  }
  if (/^Round 3\s*\(\+\s*Tier 2\)$/i.test(trimmed) || /^Vòng 3\s*\(\+\s*Tier 2\)$/i.test(trimmed)) {
    return isEn ? 'Round 3 (+ Tier 2)' : 'Vòng 3 (+ Tier 2)';
  }
  if (/^Round 4\s*\(\+\s*Tier 1\s*-\s*Round of 64\)$/i.test(trimmed) || /Vòng 4\s*\(Tier 1 Xuất Trận - Vòng 64\)/i.test(trimmed)) {
    return isEn ? 'Round 4 (+ Tier 1 - Round of 64)' : 'Vòng 4 (Tier 1 Xuất Trận - Vòng 64)';
  }
  if (/^Round of 32$/i.test(trimmed) || /Vòng 5\s*\(Vòng 32 Đội\)/i.test(trimmed) || /Vòng 1\s*\(Vòng 32 Đội\)/i.test(trimmed)) {
    return isEn ? 'Round of 32' : 'Vòng 32 Đội';
  }

  return trimmed;
}

/**
 * Tự động chuẩn hóa và dịch tên Bảng đấu (Group Name).
 */
export function localizeGroupName(rawName: string | undefined | null, lang: Language): string {
  if (!rawName) return '';
  const trimmed = rawName.trim();
  const isEn = lang === 'en';

  const groupMatch = trimmed.match(/^(?:Group|Bảng)\s*([A-Za-z0-9]+)$/i);
  if (groupMatch) {
    const letter = groupMatch[1].toUpperCase();
    return isEn ? `Group ${letter}` : `Bảng ${letter}`;
  }

  if (/^Main Table$/i.test(trimmed) || /^Bảng Tổng Sắp$/i.test(trimmed)) {
    return isEn ? 'Main Table' : 'Bảng Tổng Sắp';
  }
  if (/^Main Bracket$/i.test(trimmed) || /^Nhánh Đấu Chính$/i.test(trimmed)) {
    return isEn ? 'Main Bracket' : 'Nhánh Đấu Chính';
  }

  return trimmed;
}

/**
 * Tự động chuẩn hóa và dịch tên Giai đoạn (Stage Name).
 */
export function localizeStageName(rawName: string | undefined | null, lang: Language): string {
  if (!rawName) return '';
  const trimmed = rawName.trim();
  const isEn = lang === 'en';

  if (/^Regular Season$/i.test(trimmed) || /^Mùa Giải Chính$/i.test(trimmed)) {
    return isEn ? 'Regular Season' : 'Mùa Giải Chính';
  }
  if (/^Group Stage$/i.test(trimmed) || /^Vòng Bảng$/i.test(trimmed)) {
    return isEn ? 'Group Stage' : 'Vòng Bảng';
  }
  if (/^Knockout Stage$/i.test(trimmed) || /^Vòng Loại Trực Tiếp$/i.test(trimmed)) {
    return isEn ? 'Knockout Stage' : 'Vòng Loại Trực Tiếp';
  }
  if (/^National Cup \(Knockout Stage\)$/i.test(trimmed) || /Cúp Quốc Gia \(Knockout Stage\)/i.test(trimmed)) {
    return isEn ? 'National Cup (Knockout)' : 'Cúp Quốc Gia (Vòng Knockout)';
  }
  if (/^Super Cup Final$/i.test(trimmed) || /^Chung Kết Siêu Cúp$/i.test(trimmed)) {
    return isEn ? 'Super Cup Final' : 'Chung Kết Siêu Cúp';
  }
  if (/^Youth Cup \(Round of 32\)$/i.test(trimmed) || /Vòng 1 \(Vòng 32 Đội Trẻ\)/i.test(trimmed)) {
    return isEn ? 'Youth Cup (Round of 32)' : 'Cúp Trẻ (Vòng 32 Đội)';
  }
  if (/^Youth Cup Final$/i.test(trimmed) || /Chung Kết Cúp Trẻ/i.test(trimmed)) {
    return isEn ? 'Youth Cup Final' : 'Chung Kết Cúp Trẻ U21';
  }
  if (/^Upcoming$/i.test(trimmed) || /^Chưa diễn ra$/i.test(trimmed)) {
    return isEn ? 'Upcoming' : 'Chưa diễn ra';
  }

  return trimmed;
}

/**
 * Tự động chuẩn hóa và dịch Thể thức thi đấu (Format Label).
 */
export function localizeFormatLabel(rawLabel: string | undefined | null, lang: Language): string {
  if (!rawLabel) return '';
  const trimmed = rawLabel.trim();
  const isEn = lang === 'en';

  if (/Round-Robin \(League\)/i.test(trimmed) || /Vòng tròn tính điểm \(League\)/i.test(trimmed)) {
    return isEn ? 'Round-Robin (League)' : 'Vòng tròn tính điểm (League)';
  }
  if (/Single Elimination \(Knockout\)/i.test(trimmed) || /Cúp Loại Trực Tiếp \(Knockout\)/i.test(trimmed)) {
    return isEn ? 'Single Elimination (Knockout)' : 'Cúp Loại Trực Tiếp (Knockout)';
  }
  if (/Youth Cup/i.test(trimmed) || /Cúp Trẻ/i.test(trimmed)) {
    return isEn ? 'Youth Cup (Group & Knockout)' : 'Cúp Trẻ U21 (Vòng Bảng & Knockout 16 Đội)';
  }
  if (/Group Stage & Knockout/i.test(trimmed) || /Vòng Bảng & Loại Trực Tiếp/i.test(trimmed)) {
    return isEn ? 'Group Stage & Knockout' : 'Vòng Bảng & Loại Trực Tiếp';
  }
  if (/Super Cup \(Single Match\)/i.test(trimmed) || /Tranh Siêu Cúp/i.test(trimmed)) {
    return isEn ? 'Super Cup (Single Match)' : 'Tranh Siêu Cúp (Một Trận)';
  }

  return trimmed;
}

/**
 * Tự động chuẩn hóa và dịch Tên giải đấu (Competition Name).
 */
export function localizeCompetitionName(rawName: string | undefined | null, lang: Language): string {
  if (!rawName) return '';
  const trimmed = rawName.trim();
  const isEn = lang === 'en';

  // League 1..4 (ví dụ "England League 1", "Vietnam League 2")
  const leagueMatch = trimmed.match(/^(.+?)\s+League\s+([1-4])$/i);
  if (leagueMatch) {
    const nation = leagueMatch[1];
    const tier = leagueMatch[2];
    return isEn ? `${nation} League ${tier}` : `Giải VĐQG ${nation} - Hạng ${tier}`;
  }

  // Super Cup
  const superCupMatch = trimmed.match(/^(.+?)\s+Super\s+Cup$/i);
  if (superCupMatch) {
    const nation = superCupMatch[1];
    return isEn ? `${nation} Super Cup` : `Siêu Cúp Quốc Gia ${nation}`;
  }

  // U21 Cup
  const u21Match = trimmed.match(/^(.+?)\s+U21\s+Cup$/i);
  if (u21Match) {
    const nation = u21Match[1];
    return isEn ? `${nation} U21 Cup` : `Cúp Trẻ U21 ${nation}`;
  }

  // National Cup
  const cupMatch = trimmed.match(/^(.+?)\s+Cup$/i);
  if (cupMatch && !trimmed.toLowerCase().includes('champions') && !trimmed.toLowerCase().includes('world')) {
    const nation = cupMatch[1];
    return isEn ? `${nation} Cup` : `Cúp Quốc Gia ${nation}`;
  }

  // Champions League
  const clMatch = trimmed.match(/^(.+?)\s+Champions\s+League$/i);
  if (clMatch) {
    const confed = clMatch[1];
    return isEn ? `${confed} Champions League` : `Cúp C1 Châu Lục (${confed})`;
  }

  return trimmed;
}

/**
 * React Hook tiện ích cho UI component để tự động định dạng tên giải, vòng, bảng
 */
export function useTournamentLocale() {
  const { language } = useTranslation();
  return {
    round: (name: string | undefined | null) => localizeRoundName(name, language),
    group: (name: string | undefined | null) => localizeGroupName(name, language),
    stage: (name: string | undefined | null) => localizeStageName(name, language),
    format: (label: string | undefined | null) => localizeFormatLabel(label, language),
    comp: (name: string | undefined | null) => localizeCompetitionName(name, language),
    language,
  };
}
