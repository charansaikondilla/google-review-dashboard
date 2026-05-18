// ============================================
// GOOGLE APPS SCRIPT - REVIEW ANALYTICS API v2
// Single spreadsheet, two tabs:
//   1) Positive Reviews
//   2) Negative Reviews
// Features:
// - Fast cached responses
// - Cross-tab duplicate removal using stable row hash
// - Partial success mode (one tab can fail without full API failure)
// - Lightweight meta endpoint for frontend change detection
// ============================================

const TAB_POSITIVE = 'Positive Reviews';
const TAB_NEGATIVE = 'Negative Reviews';
const TAB_REPLY_SETTINGS = 'Reply Settings'; // New tab for auto-reply templates

const HEADER_ALIASES = {
  timestamp: ['Timestamp', 'Date', 'SubmittedAt'],
  name: ['Name', 'Reviewer Name'],
  email: ['Email'],
  product: ['Product'],
  rating: ['Rating'],
  comment: ['Comment', 'Reply Message', 'Review'],
  source: ['Source', 'Sentiment'],
  submittedAt: ['SubmittedAt', 'Date'],
  replyStatus: ['ReplyStatus', 'Status'],
  replyText: ['ReplyText', 'Automated Reply']
};

const CACHE_KEY_ANALYTICS = 'analytics_payload_v2';
const CACHE_KEY_META = 'analytics_meta_v2';
const CACHE_TTL_SECONDS = 25;

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;

    if (action === 'sendReply') {
      return jsonOutput(sendReplyToSheet(data));
    }
    
    if (action === 'saveSettings') {
      return jsonOutput(saveReplySettings(data.settings));
    }

    return jsonOutput({ status: 'error', message: 'Unknown action' });
  } catch (error) {
    return jsonOutput({ status: 'error', message: String(error) });
  }
}

function sendReplyToSheet(data) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const tab = data.type === 'positive' ? TAB_POSITIVE : TAB_NEGATIVE;
  const sheet = ss.getSheetByName(tab);
  const rows = sheet.getDataRange().getValues();
  const header = rows[0];
  
  const hashIdx = header.indexOf('Hash'); // We need a Hash/ID column in the sheet for reliability
  const replyStatusIdx = header.indexOf('ReplyStatus');
  const replyTextIdx = header.indexOf('ReplyText');

  if (replyStatusIdx === -1 || replyTextIdx === -1) {
    return { status: 'error', message: 'Sheet columns ReplyStatus or ReplyText missing' };
  }

  for (var i = 1; i < rows.length; i++) {
    const rowHash = md5Hex(rows[i].join('|')); // Fallback if no Hash column
    if (data.hash === rowHash) {
      sheet.getRange(i + 1, replyStatusIdx + 1).setValue('Replied');
      sheet.getRange(i + 1, replyTextIdx + 1).setValue(data.reply);
      return { status: 'success', message: 'Reply saved to sheet' };
    }
  }
  return { status: 'error', message: 'Review not found' };
}

function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) ? String(e.parameter.action).toLowerCase() : 'all';
  const forceRefresh = (e && e.parameter && e.parameter.forceRefresh === 'true');

  try {
    if (action === 'meta') {
      return jsonOutput(getMeta(forceRefresh));
    }

    if (action === 'positive') {
      const payload = getAnalyticsPayload(forceRefresh);
      return jsonOutput(payload.positive || []);
    }

    if (action === 'negative') {
      const payload = getAnalyticsPayload(forceRefresh);
      return jsonOutput(payload.negative || []);
    }

    return jsonOutput(getAnalyticsPayload(forceRefresh));
  } catch (error) {
    return jsonOutput({
      status: 'error',
      error: String(error),
      timestamp: new Date().toISOString(),
      positive: [],
      negative: [],
      combined: [],
      stats: getEmptyStats(),
      warnings: ['Unhandled server error in doGet']
    });
  }
}

function getAnalyticsPayload(forceRefresh) {
  if (!forceRefresh) {
    const cachedPayload = readCacheJson(CACHE_KEY_ANALYTICS);
    if (cachedPayload) {
      return cachedPayload;
    }
  }

  const positiveResult = readTabSafe(TAB_POSITIVE, 'positive');
  const negativeResult = readTabSafe(TAB_NEGATIVE, 'negative');

  const warnings = [];
  const errors = [];

  if (positiveResult.warnings.length) {
    warnings.push.apply(warnings, positiveResult.warnings);
  }
  if (negativeResult.warnings.length) {
    warnings.push.apply(warnings, negativeResult.warnings);
  }

  if (positiveResult.error) {
    errors.push('Positive tab error: ' + positiveResult.error);
  }
  if (negativeResult.error) {
    errors.push('Negative tab error: ' + negativeResult.error);
  }

  const dedupe = dedupeReviews(positiveResult.reviews, negativeResult.reviews);
  const stats = buildStats(dedupe.positive, dedupe.negative, dedupe.combined);
  const fingerprint = buildFingerprint(dedupe.combined, stats);

  const hasAnyData = dedupe.combined.length > 0;
  let status = 'ok';
  if (errors.length > 0 && hasAnyData) {
    status = 'partial';
  } else if (errors.length > 0 && !hasAnyData) {
    status = 'error';
  }

  const payload = {
    status: status,
    timestamp: new Date().toISOString(),
    warnings: warnings,
    errors: errors,
    meta: {
      fingerprint: fingerprint,
      duplicateCount: dedupe.duplicateCount,
      sourceRowCounts: {
        positiveRows: positiveResult.sourceRows,
        negativeRows: negativeResult.sourceRows
      },
      returnedRowCounts: {
        positiveRows: dedupe.positive.length,
        negativeRows: dedupe.negative.length,
        combinedRows: dedupe.combined.length
      }
    },
    stats: stats,
    positive: dedupe.positive,
    negative: dedupe.negative,
    combined: dedupe.combined
  };

  writeCacheJson(CACHE_KEY_ANALYTICS, payload, CACHE_TTL_SECONDS);
  writeCacheJson(CACHE_KEY_META, {
    status: payload.status,
    timestamp: payload.timestamp,
    fingerprint: payload.meta.fingerprint,
    totalReviews: payload.stats.totalReviews,
    duplicateCount: payload.meta.duplicateCount,
    warnings: payload.warnings,
    errors: payload.errors
  }, CACHE_TTL_SECONDS);

  return payload;
}

function getMeta(forceRefresh) {
  if (!forceRefresh) {
    const cachedMeta = readCacheJson(CACHE_KEY_META);
    if (cachedMeta) {
      return cachedMeta;
    }
  }

  const payload = getAnalyticsPayload(forceRefresh);
  return {
    status: payload.status,
    timestamp: payload.timestamp,
    fingerprint: payload.meta.fingerprint,
    totalReviews: payload.stats.totalReviews,
    duplicateCount: payload.meta.duplicateCount,
    warnings: payload.warnings,
    errors: payload.errors
  };
}

function readTabSafe(tabName, type) {
  const result = {
    reviews: [],
    warnings: [],
    sourceRows: 0,
    error: null
  };

  try {
    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    if (!spreadsheet) {
      throw new Error('No active spreadsheet found. Bind this script to your sheet.');
    }

    const sheet = spreadsheet.getSheetByName(tabName);
    if (!sheet) {
      throw new Error('Sheet not found: ' + tabName);
    }

    const values = sheet.getDataRange().getValues();
    if (!values || values.length <= 1) {
      return result;
    }

    result.sourceRows = values.length - 1;

    const header = values[0];
    const headerConfig = resolveHeaderConfig(header, tabName);
    const headerWarnings = headerConfig.warnings;
    if (headerWarnings.length) {
      result.warnings.push.apply(result.warnings, headerWarnings);
    }

    for (var i = 1; i < values.length; i++) {
      const review = toReview(values[i], type, headerConfig.columnMap);
      if (!review) {
        continue;
      }
      result.reviews.push(review);
    }

    return result;
  } catch (error) {
    result.error = String(error);
    return result;
  }
}

function resolveHeaderConfig(header, tabName) {
  const columnMap = {};
  const warnings = [];

  const headerIndex = {};
  for (var i = 0; i < header.length; i++) {
    const key = String(header[i] || '').trim().toLowerCase();
    if (key) {
      headerIndex[key] = i;
    }
  }

  const fields = Object.keys(HEADER_ALIASES);
  for (var j = 0; j < fields.length; j++) {
    const field = fields[j];
    const aliases = HEADER_ALIASES[field];
    columnMap[field] = -1;

    for (var a = 0; a < aliases.length; a++) {
      const aliasKey = String(aliases[a]).toLowerCase();
      if (headerIndex.hasOwnProperty(aliasKey)) {
        columnMap[field] = headerIndex[aliasKey];
        break;
      }
    }
  }

  if (columnMap.rating === -1) {
    warnings.push('Missing Rating column in ' + tabName + '.');
  }
  if (columnMap.comment === -1 && columnMap.name === -1) {
    warnings.push('Missing key text columns in ' + tabName + ' (Comment/Reviewer Name).');
  }

  return {
    columnMap: columnMap,
    warnings: warnings
  };
}

function toReview(row, type, columnMap) {
  const timestamp = getMappedCell(row, columnMap.timestamp);
  const name = getMappedCell(row, columnMap.name);
  const email = getMappedCell(row, columnMap.email);
  const product = getMappedCell(row, columnMap.product);
  const rating = normalizeRating(getMappedCell(row, columnMap.rating));
  const comment = getMappedCell(row, columnMap.comment);
  const source = normalizeSentiment(getMappedCell(row, columnMap.source));
  const submittedAtRaw = getMappedCell(row, columnMap.submittedAt);
  const submittedAt = submittedAtRaw || timestamp;
  const replyStatus = getMappedCell(row, columnMap.replyStatus);
  const replyText = getMappedCell(row, columnMap.replyText);

  const isRowEmpty = !timestamp && !name && !email && !product && !rating && !comment && !source && !submittedAt;
  if (isRowEmpty) {
    return null;
  }

  const review = {
    timestamp: timestamp,
    name: name,
    email: email,
    product: product,
    rating: rating,
    comment: comment,
    source: source,
    submittedAt: submittedAt,
    type: type,
    replyStatus: replyStatus,
    replyText: replyText
  };

  review.hash = buildReviewHash(review);
  return review;
}

function dedupeReviews(positiveReviews, negativeReviews) {
  const positiveResult = dedupeListByHash(positiveReviews);
  const negativeResult = dedupeListByHash(negativeReviews);

  const positive = positiveResult.items;
  const negative = negativeResult.items;

  const seenCombined = {};
  const combined = [];
  var crossTabDuplicateCount = 0;

  for (var i = 0; i < positive.length; i++) {
    const reviewP = positive[i];
    if (seenCombined[reviewP.hash]) {
      crossTabDuplicateCount++;
      continue;
    }
    seenCombined[reviewP.hash] = true;
    combined.push(reviewP);
  }

  for (var j = 0; j < negative.length; j++) {
    const reviewN = negative[j];
    if (seenCombined[reviewN.hash]) {
      crossTabDuplicateCount++;
      continue;
    }
    seenCombined[reviewN.hash] = true;
    combined.push(reviewN);
  }

  combined.sort(function(a, b) {
    return String(b.timestamp).localeCompare(String(a.timestamp));
  });

  return {
    positive: positive,
    negative: negative,
    combined: combined,
    duplicateCount: positiveResult.duplicateCount + negativeResult.duplicateCount + crossTabDuplicateCount
  };
}

function dedupeListByHash(items) {
  const seen = {};
  const unique = [];
  let duplicateCount = 0;

  for (var i = 0; i < items.length; i++) {
    const item = items[i];
    if (seen[item.hash]) {
      duplicateCount++;
      continue;
    }
    seen[item.hash] = true;
    unique.push(item);
  }

  return {
    items: unique,
    duplicateCount: duplicateCount
  };
}

function buildStats(positive, negative, combined) {
  const total = combined.length;
  const positiveCount = positive.length;
  const negativeCount = negative.length;
  const positivePercent = total > 0 ? Math.round((positiveCount / total) * 100) : 0;
  const negativePercent = total > 0 ? 100 - positivePercent : 0;

  const positiveAvg = averageRating(positive);
  const negativeAvg = averageRating(negative);
  
  let repliedCount = 0;
  const ratingDistribution = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };

  for (var i = 0; i < combined.length; i++) {
    if (combined[i].replyStatus && combined[i].replyStatus.toLowerCase() === 'replied') {
      repliedCount++;
    }
    const ratingStr = String(combined[i].rating);
    if (ratingDistribution[ratingStr] !== undefined) {
      ratingDistribution[ratingStr]++;
    }
  }

  return {
    totalReviews: total,
    positiveCount: positiveCount,
    negativeCount: negativeCount,
    positivePercent: positivePercent,
    negativePercent: negativePercent,
    avgPositiveRating: positiveAvg,
    avgNegativeRating: negativeAvg,
    repliedCount: repliedCount,
    ratingDistribution: ratingDistribution
  };
}

function averageRating(reviews) {
  if (!reviews || reviews.length === 0) {
    return 0;
  }

  let sum = 0;
  let count = 0;

  for (var i = 0; i < reviews.length; i++) {
    const value = Number(reviews[i].rating);
    if (!isNaN(value) && value > 0) {
      sum += value;
      count++;
    }
  }

  if (count === 0) {
    return 0;
  }

  return Math.round((sum / count) * 10) / 10;
}

function buildReviewHash(review) {
  const stableRow = [
    String(review.timestamp || '').trim().toLowerCase(),
    String(review.name || '').trim().toLowerCase(),
    String(review.email || '').trim().toLowerCase(),
    String(review.product || '').trim().toLowerCase(),
    String(review.rating || '').trim().toLowerCase(),
    String(review.comment || '').trim().toLowerCase(),
    String(review.source || '').trim().toLowerCase(),
    String(review.submittedAt || '').trim().toLowerCase()
  ].join('|');

  return md5Hex(stableRow);
}

function buildFingerprint(combined, stats) {
  const tailCount = Math.min(combined.length, 200);
  const basis = {
    totalReviews: stats.totalReviews,
    positiveCount: stats.positiveCount,
    negativeCount: stats.negativeCount,
    tailHashes: combined.slice(0, tailCount).map(function(r) { return r.hash; })
  };
  return md5Hex(JSON.stringify(basis));
}

function md5Hex(text) {
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.MD5, text);
  let hex = '';
  for (var i = 0; i < bytes.length; i++) {
    const value = (bytes[i] + 256) % 256;
    const segment = value.toString(16);
    hex += segment.length === 1 ? '0' + segment : segment;
  }
  return hex;
}

function normalizeCell(value) {
  if (value === null || value === undefined) {
    return '';
  }

  if (Object.prototype.toString.call(value) === '[object Date]') {
    return value.toISOString();
  }

  return String(value).trim();
}

function normalizeRating(value) {
  const num = Number(value);
  if (isNaN(num)) {
    return 0;
  }

  if (num < 0) {
    return 0;
  }

  if (num > 5) {
    return 5;
  }

  return Math.round(num);
}

function normalizeSentiment(value) {
  const v = String(value || '').trim().toUpperCase();
  if (v === 'POSITIVE' || v === 'NEGATIVE' || v === 'NEUTRAL') {
    return v;
  }
  return String(value || '').trim();
}

function getMappedCell(row, index) {
  if (index === null || index === undefined || index < 0 || index >= row.length) {
    return '';
  }
  return normalizeCell(row[index]);
}

function readCacheJson(key) {
  try {
    const cache = CacheService.getScriptCache();
    const raw = cache.get(key);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

function writeCacheJson(key, value, ttlSeconds) {
  try {
    const cache = CacheService.getScriptCache();
    cache.put(key, JSON.stringify(value), ttlSeconds);
  } catch (error) {
    // Fail silently; cache is an optimization.
  }
}

function getEmptyStats() {
  return {
    totalReviews: 0,
    positiveCount: 0,
    negativeCount: 0,
    positivePercent: 0,
    negativePercent: 0,
    avgPositiveRating: 0,
    avgNegativeRating: 0
  };
}

function jsonOutput(payload) {
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}
