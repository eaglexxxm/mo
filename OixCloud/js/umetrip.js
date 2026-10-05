// UmetripAds v3: native Surge response script.
// Mine-only: remove protobuf parent fields emptied by confirmed promotion removal.
(function () {
const EMPTY_RPIDS=new Set(["1000019","1420002","1120000"]),HOME_RPID="1000002",WATERFALL_RPID="1000029",TRIP_BANNER_RPID="1370126",FAMILY_RPID="1370279",HISTORY_RPID="1011058",MINE_RPID="1100001",FLIGHT_RPID="1060060",EMPTY_PAYLOAD=new Uint8Array([10,0,16,0,32,0]),MINE_PROMOTION_NAMES=["我的页面-会员卡片V3","我的页-腰部banner第四帧","礼金中心","票券权益","特价专区-个人中心","机票-31-推荐管",],MINE_PROMOTION_GROUP_IDS=new Set([111402,111403,111404]);function readVarint(e,t){let r=0,n=0;for(;t<e.length&&n<=56;){let o=e[t++];if(r+=(127&o)*Math.pow(2,n),(128&o)==0)return{value:r,pos:t};n+=7}return null}function encodeVarint(e){let t=[],r=e;for(;r>=128;)t.push(r%128|128),r=Math.floor(r/128);return t.push(r),new Uint8Array(t)}function concatBytes(e){let t=0;for(let r of e)t+=r.length;let n=new Uint8Array(t),o=0;for(let i of e)n.set(i,o),o+=i.length;return n}function parseMessage(e){try{let t=0,r=[];for(;t<e.length;){let n=t,o=readVarint(e,t);if(!o)return null;let i=o.value;t=o.pos;let a=Math.floor(i/8),s=7&i;if(0===a||![0,1,2,5].includes(s))return null;if(0===s){let l=readVarint(e,t);if(!l)return null;t=l.pos,r.push({field:a,wire:s,raw:e.slice(n,t)});continue}if(1===s){if(t+8>e.length)return null;t+=8,r.push({field:a,wire:s,raw:e.slice(n,t)});continue}if(5===s){if(t+4>e.length)return null;t+=4,r.push({field:a,wire:s,raw:e.slice(n,t)});continue}let c=readVarint(e,t);if(!c)return null;let u=c.value;if(t=c.pos,u<0||t+u>e.length)return null;let d=e.slice(t,t+u);t+=u,r.push({field:a,wire:s,raw:e.slice(n,t),data:d,dirty:!1})}return r}catch(f){return null}}function encodeMessage(e){let t=[];for(let r of e)2===r.wire&&r.dirty?(t.push(encodeVarint(8*r.field+2)),t.push(encodeVarint(r.data.length)),t.push(r.data)):t.push(r.raw);return concatBytes(t)}function utf8Bytes(e){let t=[];for(let r=0;r<e.length;r++){let n=e.charCodeAt(r);n<128?t.push(n):n<2048?(t.push(192|n>>6),t.push(128|63&n)):n>=55296&&n<=56319&&r+1<e.length?(n=65536+(n-55296<<10)+(e.charCodeAt(++r)-56320),t.push(240|n>>18),t.push(128|n>>12&63),t.push(128|n>>6&63),t.push(128|63&n)):(t.push(224|n>>12),t.push(128|n>>6&63),t.push(128|63&n))}return new Uint8Array(t)}function bytesContains(e,t){let r="string"==typeof t?utf8Bytes(t):t;if(!r.length||r.length>e.length)return!1;outer:for(let n=0;n<=e.length-r.length;n++){for(let o=0;o<r.length;o++)if(e[n+o]!==r[o])continue outer;return!0}return!1}function containsAny(e,t){for(let r of t)if(bytesContains(e,r))return!0;return!1}function bytesEqualAscii(e,t){if(!e||e.length!==t.length)return!1;for(let r=0;r<t.length;r++)if(e[r]!==t.charCodeAt(r))return!1;return!0}function directFieldEqualsAscii(e,t,r){return!!e&&e.some(e=>e.field===t&&2===e.wire&&bytesEqualAscii(e.data,r))}function directFieldAscii(e,t){if(!e)return null;for(let r of e){if(r.field!==t||2!==r.wire)continue;let n="";for(let o of r.data){if(o<32||o>126)return null;n+=String.fromCharCode(o)}return n}return null}function bytesToUtf8(e){if("undefined"!=typeof TextDecoder)try{return new TextDecoder("utf-8").decode(e)}catch(t){}let r="",n=0;for(;n<e.length;){let o=e[n++];if(o<128)r+=String.fromCharCode(o);else if((224&o)==192){if(n>=e.length)return null;r+=String.fromCharCode((31&o)<<6|63&e[n++])}else if((240&o)==224){if(n+1>=e.length)return null;let i;r+=String.fromCharCode((15&o)<<12|(63&e[n++])<<6|63&e[n++])}else{if((248&o)!=240||n+2>=e.length)return null;let a=e[n++],s,l=(7&o)<<18|(63&a)<<12|(63&e[n++])<<6|63&e[n++];l-=65536,r+=String.fromCharCode(55296+(l>>10),56320+(1023&l))}}return r}function replaceTopField7(e,t){let r=parseMessage(e);if(!r)return{bytes:e,count:0};let n=!1;for(let o of r)7===o.field&&2===o.wire&&(o.data=t,o.dirty=!0,n=!0);return{bytes:n?encodeMessage(r):e,count:n?1:0}}function removeMatchingNodes(bytes, predicate, depth = 0, options = null, path = '7') {
  if (depth > 12) return {bytes, count: 0};
  const nodes = parseMessage(bytes);
  if (!nodes) return {bytes, count: 0};
  const retained = [];
  const occurrence = {};
  let count = 0;
  let changed = false;
  for (const original of nodes) {
    let node = original;
    const index = occurrence[node.field] || 0;
    occurrence[node.field] = index + 1;
    const location = `${path}.${node.field}[${index}]`;
    if (node.wire === 2) {
      const nested = parseMessage(node.data);
      if (predicate(node.field, node.data, nested)) {
        count += 1;
        changed = true;
        if (options) {
          options.adNodesRemoved += 1;
          if (options.changes.length < 12) options.changes.push({path: location, kind: 'matched-promotion'});
        }
        continue;
      }
      if (nested) {
        const child = removeMatchingNodes(node.data, predicate, depth + 1, options, location);
        if (child.count > 0) {
          count += child.count;
          changed = true;
          // Only the mine branch opts in. Preserve originally empty fields,
          // all parents with any remaining bytes, and the outer protocol field7.
          if (options && options.pruneNewlyEmptyParents && child.bytes.length === 0) {
            count += 1;
            options.emptyParentsRemoved += 1;
            if (options.changes.length < 12) options.changes.push({path: location, kind: 'newly-empty-parent', fieldsBefore: nested.length, fieldsAfter: 0});
            continue;
          }
          node = {...node, data: child.bytes, dirty: true};
        }
      }
    }
    retained.push(node);
  }
  return {bytes: changed ? encodeMessage(retained) : bytes, count};
}
function transformTopField7(e,t){let r=parseMessage(e);if(!r)return{bytes:e,count:0};let n=!1,o=0;for(let i of r){if(7!==i.field||2!==i.wire)continue;let a=t(i.data);(a.count>0||a.bytes!==i.data)&&(i.data=a.bytes,i.dirty=!0,o+=a.count,n=!0)}return{bytes:n?encodeMessage(r):e,count:o}}function jsonFromBytes(e){let t=bytesToUtf8(e);if(!t||"{"!==t[0]&&"["!==t[0])return null;try{return JSON.parse(t)}catch(r){return null}}function directCardNameMatches(e,t){if(!e)return!1;for(let r of e){if(8!==r.field||2!==r.wire)continue;let n=parseMessage(r.data);if(n)for(let o of n){if(3!==o.field||2!==o.wire)continue;let i=bytesToUtf8(o.data);if(i&&-1!==t.indexOf(i))return!0}}return!1}function directCardJsonMatches(e,t){if(!e)return!1;for(let r of e){if(8!==r.field||2!==r.wire)continue;let n=parseMessage(r.data);if(n)for(let o of n){if(7!==o.field||2!==o.wire)continue;let i=jsonFromBytes(o.data);if(i&&t(i))return!0}}return!1}function rewriteJsonFields(e,t,r=0){if(r>12)return{bytes:e,count:0};let n=parseMessage(e);if(!n)return{bytes:e,count:0};let o=!1,i=0;for(let a of n){if(2!==a.wire)continue;let s=!1;if(a.data.length>=2&&(123===a.data[0]||91===a.data[0])){let l=bytesToUtf8(a.data);if(l)try{let c=JSON.parse(l);t(c)&&(a.data=utf8Bytes(JSON.stringify(c)),a.dirty=!0,o=!0,i++,s=!0)}catch(u){}}if(!s&&parseMessage(a.data)){let d=rewriteJsonFields(a.data,t,r+1);d.count>0&&(a.data=d.bytes,a.dirty=!0,o=!0,i+=d.count)}}return{bytes:o?encodeMessage(n):e,count:i}}function cleanHomePayload(e){let t=["机上闭门购虚拟卡片","机上内购-weex包更新虚拟卡片","无行程机票直销卡片8.4.7","中秋国庆活动","回归礼包_无行程首页底部条",],r=removeMatchingNodes(e,(e,r,n)=>5===e&&!!n&&(!!(directFieldEqualsAscii(n,37,"ADVERT")||directCardNameMatches(n,t))||directCardJsonMatches(n,e=>e&&-1!==[111450,111353].indexOf(Number(e.groupId)))));return r}function cleanWaterfallPayload(e){let t=["瀑布流_特价机票","瀑布流_酒店","瀑布流_租车卡片","瀑布流_权益","瀑布流_今日热议","瀑布流_城市攻略","瀑布流_景点攻略","瀑布流_附近底部跳转",];return removeMatchingNodes(e,(e,r)=>8===e&&containsAny(r,t))}function cleanTripBannerPayload(e){return removeMatchingNodes(e,(e,t)=>8===e&&(bytesContains(t,"付费会员")||bytesContains(t,"更早历史行程待解锁")))}function cleanHistoryPayload(e){return removeMatchingNodes(e,(e,t)=>11===e&&bytesContains(t,"历史行程容量剩余")&&bytesContains(t,"付费会员"))}function cleanFlightPayload(e){return removeMatchingNodes(e,(e,t)=>12===e&&bytesContains(t,"付费会员"))}function cleanFamilyMessage(e,t=0){if(t>12)return{bytes:e,count:0};let r=parseMessage(e);if(!r)return{bytes:e,count:0};let n=r.some(e=>1===e.field&&2===e.wire&&bytesContains(e.data,"可免费试用30天")&&bytesContains(e.data,"payMember")),o=r.some(e=>2===e.field&&2===e.wire&&bytesContains(e.data,"添加家人并开启守护")&&bytesContains(e.data,"payMember"));if(n&&o){let i=[],a=0;for(let s of r){let l=1===s.field&&2===s.wire&&bytesContains(s.data,"可免费试用30天")&&bytesContains(s.data,"payMember"),c=2===s.field&&2===s.wire&&bytesContains(s.data,"添加家人并开启守护")&&bytesContains(s.data,"payMember");if(l||c){a++;continue}i.push(s)}return{bytes:encodeMessage(i),count:a}}let u=!1,d=0;for(let f of r){if(2!==f.wire||!parseMessage(f.data))continue;let p=cleanFamilyMessage(f.data,t+1);p.count>0&&(f.data=p.bytes,f.dirty=!0,d+=p.count,u=!0)}return{bytes:u?encodeMessage(r):e,count:d}}function isMinePromotionGroup(e){return!!e&&(!!directCardNameMatches(e,MINE_PROMOTION_NAMES)||directCardJsonMatches(e,e=>{if(!e||"object"!=typeof e)return!1;let t=Number(e.groupId);return!!MINE_PROMOTION_GROUP_IDS.has(t)||"advert"===String((e.trackParam&&"object"==typeof e.trackParam?e.trackParam:{}).department||"").toLowerCase()}))}function mineRemainingField5Shapes(bytes, depth = 0, path = '7', rows = []) {
  if (depth > 6 || rows.length >= 12) return rows;
  const nodes = parseMessage(bytes);
  if (!nodes) return rows;
  const occurrence = {};
  for (const node of nodes) {
    const index = occurrence[node.field] || 0;
    occurrence[node.field] = index + 1;
    if (node.wire !== 2) continue;
    const location = `${path}.${node.field}[${index}]`;
    const child = parseMessage(node.data);
    if (node.field === 5 && child && rows.length < 12) {
      rows.push({path: location, empty: node.data.length === 0,
        fields: child.slice(0, 16).map(field => `${field.field}:${field.wire}`), fieldsTruncated: child.length > 16});
    }
    if (child) mineRemainingField5Shapes(node.data, depth + 1, location, rows);
  }
  return rows;
}
function cleanMinePayload(bytes) {
  const options = {pruneNewlyEmptyParents: true, adNodesRemoved: 0, emptyParentsRemoved: 0, changes: []};
  const result = removeMatchingNodes(bytes, (field, data, nodes) => field === 5 && isMinePromotionGroup(nodes), 0, options);
  // Structural diagnostics only: no URLs, strings, account fields or body dump.
  console.log(`[UmetripAds v3] mine-protobuf=${JSON.stringify({adNodesRemoved: options.adNodesRemoved,
    emptyParentsRemoved: options.emptyParentsRemoved, changes: options.changes,
    changesTruncated: options.adNodesRemoved + options.emptyParentsRemoved > options.changes.length,
    remainingField5: mineRemainingField5Shapes(result.bytes)})}`);
  return result;
}


// Scoped JSON cleanup; unknown business data and originally empty lists pass through.
function cleanUmetripJson(document, rpid) {
  const stats = {
    advertItemsRemoved: 0, promotionItemsRemoved: 0, mineItemsRemoved: 0,
    emptyAdContainersRemoved: 0, popupFlagsCleared: 0, advertTimeoutsCleared: 0
  };
  const displayArrays = new Set(['groupList', 'subGroupList', 'cardList', 'cardCollections', 'children', 'medias']);
  const contentArrays = ['groupList', 'subGroupList', 'cardList', 'cardCollections', 'children', 'medias'];
  const mine = String(rpid || '') === '1100001';
  let changed = false;

  function object(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }
  function owns(value, key) {
    return Object.prototype.hasOwnProperty.call(value, key);
  }
  function nonemptyId(value) {
    return value !== undefined && value !== null && String(value) !== '' && String(value) !== '0';
  }
  function explicitPromotion(value) {
    if (!object(value)) return false;
    if (String(value.dataSource || '').toUpperCase() === 'ADVERT') return true;
    if (Number(value.groupStyle) === 1009) return true;
    if (/^advert_/i.test(String(value.serviceTrack || ''))) return true;
    if (value.trackParam && String(value.trackParam.department || '').toLowerCase() === 'advert') return true;
    if (owns(value, 'advertId') && nonemptyId(value.advertId)) return true;
    if (owns(value, 'advertiser') && nonemptyId(value.advertiser)) return true;
    if (String(value.serviceName || '').includes('广告位-')) return true;
    if (String(value.serviceName || '').includes('娱乐运营活动')) return true;
    if (String(value.groupTitle || value.title || '') === '中秋国庆活动') return true;
    const payload = value.cardResult;
    if (object(payload) && explicitPromotion(payload)) return true;
    if (typeof payload === 'string') {
      if (payload.includes('/fs/advert/')) return true;
      try { if (explicitPromotion(JSON.parse(payload))) return true; } catch (_) {}
    }
    return false;
  }
  function pageHasAds(page) {
    if (!object(page) || !Array.isArray(page.groupList)) return false;
    return page.groupList.some(group => explicitPromotion(group) ||
      (object(group) && Array.isArray(group.cardList) && group.cardList.some(explicitPromotion)));
  }
  function mineChildPromotion(child, groupId) {
    if (!object(child)) return false;
    if (groupId === 111402) {
      const sensor = object(child.sensorParam) ? child.sensorParam : {};
      return String(child.title || '').includes('会员月卡') ||
        String(sensor.service_label || '').includes('会员月卡') ||
        /^商品\d+$/.test(String(sensor.service_name || ''));
    }
    return groupId === 111403 && String(child.cardType || '') === 'PRODUCT';
  }
  function mineMediaPromotion(media) {
    if (!object(media)) return false;
    const caption = String(media.caption || '');
    const subCaption = String(media.subCaption || '');
    return caption === '买三送一' || caption === '全民推荐官' ||
      subCaption.includes('视频会员') || subCaption.includes('返现');
  }
  function hasRemainingContent(value) {
    return contentArrays.some(key => Array.isArray(value[key]) && value[key].length > 0);
  }
  function refreshIndex(value) {
    if (!Array.isArray(value.children) || !owns(value, 'childrenIndex')) return;
    const index = {};
    value.children.forEach((child, position) => {
      if (object(child) && child.cardId !== undefined && child.cardId !== null) {
        index[String(child.cardId)] = position;
      }
    });
    value.childrenIndex = index;
  }

  function visit(value, arrayKey, groupId, depth) {
    if (depth > 20) return { prune: false, modified: false };
    if (Array.isArray(value)) {
      let modified = false;
      const retained = [];
      for (const item of value) {
        let identifiedAd = displayArrays.has(arrayKey) && explicitPromotion(item);
        let identifiedMine = mine && arrayKey === 'children' && mineChildPromotion(item, groupId);
        let identifiedMedia = mine && groupId === 111404 && arrayKey === 'medias' && mineMediaPromotion(item);
        if (identifiedAd || identifiedMine || identifiedMedia) {
          if (identifiedMine || identifiedMedia) stats.mineItemsRemoved += 1;
          else stats.promotionItemsRemoved += 1;
          changed = modified = true;
          continue;
        }
        const child = visit(item, '', groupId, depth + 1);
        if (displayArrays.has(arrayKey) && child.prune) {
          stats.emptyAdContainersRemoved += 1;
          changed = modified = true;
          continue;
        }
        modified = child.modified || modified;
        retained.push(item);
      }
      if (retained.length !== value.length) {
        value.length = 0;
        for (const item of retained) value.push(item);
      }
      return { prune: false, modified };
    }
    if (!object(value)) return { prune: false, modified: false };

    const localGroup = mine && [111402, 111403, 111404].includes(Number(value.groupId))
      ? Number(value.groupId) : groupId;
    const knownMineGroup = mine && [111402, 111403, 111404].includes(Number(value.groupId));
    const beforeChildren = Array.isArray(value.children) ? value.children.length : 0;
    const beforeMedias = Array.isArray(value.medias) ? value.medias.length : 0;
    const beforeContentCount = contentArrays.reduce((count, key) =>
      count + (Array.isArray(value[key]) ? value[key].length : 0), 0);
    const removableMineMediaCard = mine && localGroup === 111404 && beforeMedias > 0 &&
      value.medias.some(mineMediaPromotion);
    const adPopup = (Array.isArray(value.advertPageInfo) && value.advertPageInfo.length > 0) ||
      (Array.isArray(value.advertDataList) && value.advertDataList.length > 0) || pageHasAds(value.page);
    let modified = false;

    for (const key of ['advertPageInfo', 'advertDataList']) {
      if (Array.isArray(value[key]) && value[key].length > 0) {
        stats.advertItemsRemoved += value[key].length;
        value[key] = [];
        changed = modified = true;
      }
    }
    if (adPopup && owns(value, 'advertTotalTimeout') && typeof value.advertTotalTimeout === 'number' && value.advertTotalTimeout !== 0) {
      value.advertTotalTimeout = 0;
      stats.advertTimeoutsCleared += 1;
      changed = modified = true;
    }
    if (adPopup && owns(value, 'isShowPop') && value.isShowPop !== 0) {
      value.isShowPop = 0;
      stats.popupFlagsCleared += 1;
      changed = modified = true;
    }

    for (const key of Object.keys(value)) {
      const child = visit(value[key], key, localGroup, depth + 1);
      modified = child.modified || modified;
    }
    if (Array.isArray(value.children) && value.children.length !== beforeChildren) refreshIndex(value);

    // Remove only display shells that became empty while this pass removed
    // identified ads. The caller applies pruning only within display arrays.
    // Originally empty groups and containers with business siblings stay.
    const emptiedMineGroup = knownMineGroup && beforeChildren > 0 &&
      Array.isArray(value.children) && value.children.length === 0;
    const emptiedMineMedia = removableMineMediaCard &&
      Array.isArray(value.medias) && value.medias.length === 0;
    const emptiedAdDisplay = beforeContentCount > 0 && !hasRemainingContent(value);
    return { prune: modified && (emptiedMineGroup || emptiedMineMedia || emptiedAdDisplay) && !hasRemainingContent(value), modified };
  }

  visit(document, '', 0, 0);
  return { changed, stats };
}

// One native Surge completion path. Both formats share the same scoped cleanup.
function umetripToBytes(value) {
  if (value instanceof Uint8Array) return value;
  if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
    return new Uint8Array(value);
  }
  if (typeof ArrayBuffer !== 'undefined' && ArrayBuffer.isView(value)) {
    return new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
  }
  return null;
}

function umetripHeader(headers, name) {
  if (!headers || typeof headers !== 'object') return '';
  const key = Object.keys(headers).find(key => key.toLowerCase() === name.toLowerCase());
  return key ? String(headers[key] == null ? '' : headers[key]).trim() : '';
}

function umetripRpid(request, bytes) {
  const header = umetripHeader(request.headers, 'rpid');
  if (header) return { value: header, source: 'header' };
  const match = /(?:[?&])rpid=([^&#]*)/i.exec(String(request.url || ''));
  if (match) {
    try {
      const value = decodeURIComponent(match[1]).trim();
      if (value) return { value, source: 'query' };
    } catch (_) {}
  }
  const field = bytes ? directFieldAscii(parseMessage(bytes), 5) : null;
  return { value: field || '', source: field ? 'protobuf-field-5' : 'missing' };
}

function umetripJsonCandidate(value, bytes) {
  let text;
  if (typeof value === 'string') text = value;
  else if (bytes) text = bytesToUtf8(bytes);
  else return null;
  if (typeof text !== 'string') return null;
  text = text.replace(/^\uFEFF/, '').trim();
  if (!text.startsWith('{') && !text.startsWith('[')) return null;
  try {
    const parsed = JSON.parse(text);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch (_) {
    return null;
  }
}

function umetripRewriteJsonFields(bytes, rpid) {
  return rewriteJsonFields(bytes, document => cleanUmetripJson(document, rpid).changed);
}

function umetripCleanProtobuf(bytes, rpid) {
  let result = { bytes, count: 0 };
  if (EMPTY_RPIDS.has(rpid)) {
    result = replaceTopField7(bytes, EMPTY_PAYLOAD);
  } else if (rpid === HOME_RPID) {
    result = transformTopField7(bytes, cleanHomePayload);
  } else if (rpid === WATERFALL_RPID) {
    result = transformTopField7(bytes, cleanWaterfallPayload);
  } else if (rpid === TRIP_BANNER_RPID) {
    result = transformTopField7(bytes, cleanTripBannerPayload);
  } else if (rpid === FAMILY_RPID) {
    result = transformTopField7(bytes, cleanFamilyMessage);
  } else if (rpid === HISTORY_RPID) {
    result = transformTopField7(bytes, cleanHistoryPayload);
  } else if (rpid === MINE_RPID) {
    result = transformTopField7(bytes, cleanMinePayload);
  } else if (rpid === FLIGHT_RPID) {
    result = transformTopField7(bytes, cleanFlightPayload);
  }

  // Clean explicitly identified ad JSON embedded in protobuf, including the
  // mine child/media branches that the previous dispatcher never reached.
  const nested = umetripRewriteJsonFields(result.bytes, rpid);
  return { bytes: nested.bytes, count: result.count + nested.count };
}

let umetripCompleted = false;
function umetripFinish(result) {
  if (umetripCompleted) return;
  umetripCompleted = true;
  $done(result || {});
}

try {
  const request = typeof $request === 'undefined' ? {} : $request;
  const response = typeof $response === 'undefined' ? {} : $response;
  const body = response.body;
  const bytes = umetripToBytes(body) || umetripToBytes(response.bodyBytes);
  const identity = umetripRpid(request, bytes);
  const label = identity.value || 'missing';
  const json = umetripJsonCandidate(body, bytes);

  if (json) {
    const result = cleanUmetripJson(json, identity.value);
    console.log(`[UmetripAds v3] format=json rpid=${label} source=${identity.source} changed=${result.changed} stats=${JSON.stringify(result.stats)}`);
    umetripFinish(result.changed ? { body: utf8Bytes(JSON.stringify(json)) } : {});
  } else if (bytes && parseMessage(bytes)) {
    const result = umetripCleanProtobuf(bytes, identity.value);
    console.log(`[UmetripAds v3] format=protobuf rpid=${label} source=${identity.source} removed/rewritten=${result.count}`);
    umetripFinish(result.count > 0 ? { body: result.bytes } : {});
  } else {
    console.log(`[UmetripAds v3] skipped: format=unknown rpid=${label} source=${identity.source} bytes=${bytes ? bytes.byteLength : 0}`);
    umetripFinish({});
  }
} catch (error) {
  console.log(`[UmetripAds v3] error: ${String(error)}`);
  umetripFinish({});
}

})();
