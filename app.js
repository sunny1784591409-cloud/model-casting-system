const storageKey = "casting-system-models";
const briefKey = "casting-system-brief";
const shortlistKey = "casting-system-shortlist";
const postsKey = "casting-system-xhs-posts";
const brokerContact = "经纪人：王经理｜微信：modelbook888｜电话：138-0000-8888";
const isAdminMode = new URLSearchParams(window.location.search).get("admin") === "1";
const memoryStore = {};

const sampleModels = [
  {
    id: createId(),
    code: "MDL-001",
    name: "林安娜",
    gender: "女",
    ageGroup: "成人",
    age: 23,
    height: 172,
    shoeSize: "38",
    measurements: "82/60/88",
    skinTone: "白皙",
    hairColor: "黑发",
    city: "上海",
    fee: 500,
    availability: "6月可约，周中优先",
    tags: ["气质", "画册", "轻奢", "美妆"],
    works: ["气质护肤品棚拍", "美妆手部特写", "轻奢女装画册"],
    photo: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80",
    cardOrientation: "portrait",
    portfolio: "https://example.com/lin-anna",
    notes: "镜头表现稳定，适合精致商业片。",
    updatedAt: "2026-05-28",
  },
  {
    id: createId(),
    code: "MDL-002",
    name: "周予白",
    gender: "男",
    ageGroup: "成人",
    age: 27,
    height: 186,
    shoeSize: "43",
    measurements: "西装版型好",
    skinTone: "自然",
    hairColor: "黑发",
    city: "杭州",
    fee: 650,
    availability: "6月下旬可约",
    tags: ["成熟", "商务", "西装", "室内平面"],
    works: ["成熟商务西装棚拍", "男装详情页", "腕表静态广告"],
    photo: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=80",
    cardOrientation: "landscape",
    portfolio: "https://example.com/zhou-yubai",
    notes: "商务正装、汽车、腕表类客户反馈好。",
    updatedAt: "2026-05-30",
  },
  {
    id: createId(),
    code: "MDL-003",
    name: "陈洛",
    gender: "女",
    ageGroup: "成人",
    age: 21,
    height: 168,
    shoeSize: "37",
    measurements: "80/58/86",
    skinTone: "自然",
    hairColor: "棕发",
    city: "广州",
    fee: 400,
    availability: "周末可约",
    tags: ["甜美", "短视频", "潮牌", "阳光"],
    works: ["甜美饮品户外视频", "潮牌短视频", "阳光生活方式外景"],
    photo: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=80",
    cardOrientation: "portrait",
    portfolio: "https://example.com/chen-luo",
    notes: "短视频节奏感好，可配合轻运动内容。",
    updatedAt: "2026-05-22",
  },
  {
    id: createId(),
    code: "MDL-004",
    name: "孟岚",
    gender: "女",
    ageGroup: "成人",
    age: 29,
    height: 175,
    shoeSize: "39",
    measurements: "84/62/90",
    skinTone: "白皙",
    hairColor: "黑发",
    city: "北京",
    fee: 800,
    availability: "需提前一周锁档",
    tags: ["气质", "珠宝", "礼服", "成熟"],
    works: ["气质珠宝棚拍", "礼服平面大片", "成熟护肤品广告"],
    photo: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=80",
    cardOrientation: "portrait",
    portfolio: "https://example.com/meng-lan",
    notes: "气质强，适合预算较充足的品牌大片。",
    updatedAt: "2026-05-24",
  },
  {
    id: createId(),
    code: "MDL-005",
    name: "秦野",
    gender: "男",
    ageGroup: "成人",
    age: 24,
    height: 181,
    shoeSize: "42",
    measurements: "健身型",
    skinTone: "小麦",
    hairColor: "黑发",
    city: "上海",
    fee: 450,
    availability: "6月可约",
    tags: ["阳光", "户外", "运动", "室外视频"],
    works: ["阳光运动外景视频", "户外装备平面", "生活方式短视频"],
    photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=900&q=80",
    cardOrientation: "landscape",
    portfolio: "https://example.com/qin-ye",
    notes: "适合运动、户外生活方式、电商短视频。",
    updatedAt: "2026-05-26",
  },
];

const sampleDefaultsByName = new Map(sampleModels.map((model) => [model.name, model]));

let models = loadModels();
let shortlist = loadJson(shortlistKey, []);
let currentMatches = [];
let hasSubmittedBrief = false;
let pendingMatchButton = null;
let clientInfo = loadJson("casting-system-client-info", {});

const fields = {
  shootProduct: document.querySelector("#shootProduct"),
  shootType: document.querySelector("#shootType"),
  ageGroup: document.querySelector("#ageGroup"),
  gender: document.querySelector("#gender"),
  skinTone: document.querySelector("#skinTone"),
  hairColor: document.querySelector("#hairColor"),
  heightMin: document.querySelector("#heightMin"),
  heightMax: document.querySelector("#heightMax"),
  bustMin: document.querySelector("#bustMin"),
  bustMax: document.querySelector("#bustMax"),
  waistMin: document.querySelector("#waistMin"),
  waistMax: document.querySelector("#waistMax"),
  hipsMin: document.querySelector("#hipsMin"),
  hipsMax: document.querySelector("#hipsMax"),
  city: document.querySelector("#city"),
  budgetMax: document.querySelector("#budgetMax"),
  shootDate: document.querySelector("#shootDate"),
  styleTags: document.querySelector("#styleTags"),
};

const styleCheckboxes = [...document.querySelectorAll('input[name="styleTags"]')];
const briefInputs = [...Object.values(fields), ...styleCheckboxes];

const modelFields = {
  id: document.querySelector("#modelId"),
  name: document.querySelector("#modelName"),
  gender: document.querySelector("#modelGender"),
  age: document.querySelector("#modelAge"),
  height: document.querySelector("#modelHeight"),
  measurements: document.querySelector("#modelMeasurements"),
  city: document.querySelector("#modelCity"),
  fee: document.querySelector("#modelFee"),
  availability: document.querySelector("#modelAvailability"),
  tags: document.querySelector("#modelTags"),
  photo: document.querySelector("#modelPhoto"),
  cardOrientation: document.querySelector("#modelCardOrientation"),
  portfolio: document.querySelector("#modelPortfolio"),
  notes: document.querySelector("#modelNotes"),
};

const resultsGrid = document.querySelector("#resultsGrid");
const databaseGrid = document.querySelector("#databaseGrid");
const postGrid = document.querySelector("#postGrid");
const shortlistEl = document.querySelector("#shortlist");
const toast = document.querySelector("#toast");

document.querySelectorAll("[data-page-target]").forEach((button) => {
  button.addEventListener("click", () => switchPage(button.dataset.pageTarget));
});
briefInputs.forEach((field) => {
  field.addEventListener("input", updateBriefProgress);
  field.addEventListener("change", updateBriefProgress);
});
document.querySelector("#matchBtn").addEventListener("click", (event) => submitBrief(event.currentTarget));
document.querySelector("#saveBriefBtn").addEventListener("click", (event) => saveBrief(event.currentTarget));
document.querySelector("#resetBriefBtn").addEventListener("click", resetBrief);
document.querySelector("#searchInput").addEventListener("input", renderResults);
document.querySelector("#sortSelect").addEventListener("change", renderResults);
document.querySelector("#databaseSearchInput").addEventListener("input", renderDatabase);
document.querySelector("#databaseSortSelect").addEventListener("change", renderDatabase);
document.querySelector("#clearFormBtn").addEventListener("click", clearModelForm);
document.querySelector("#modelForm").addEventListener("submit", saveModel);
document.querySelector("#exportCsvBtn").addEventListener("click", exportCsv);
document.querySelector("#csvInput").addEventListener("change", importCsv);
document.querySelector("#copyShortlistBtn").addEventListener("click", (event) => copyShortlist(event.currentTarget));
document.querySelector("#exportShortlistImageBtn").addEventListener("click", (event) => exportShortlistImage(event.currentTarget));
document.querySelector("#copyContactBtn").addEventListener("click", (event) => copyBrokerContact(event.currentTarget));
document.querySelector("#downloadTemplateBtn").addEventListener("click", downloadTemplate);
document.querySelector("#goImportBtn").addEventListener("click", () => switchPage("import"));
document.querySelector("#postTopicType").addEventListener("change", renderPromotionPosts);
document.querySelector("#generatePostsBtn").addEventListener("click", () => renderPromotionPosts({ regenerate: true }));
document.querySelector("#copyAllPostsBtn").addEventListener("click", (event) => copyAllPosts(event.currentTarget));
document.querySelector("#clientInfoForm").addEventListener("submit", submitClientInfo);
document.querySelectorAll("[data-modal-close]").forEach((button) => {
  button.addEventListener("click", () => closeModal(button.dataset.modalClose));
});
document.addEventListener("click", handleCardAction);

restoreBrief();
initMode();
renderDatabase();
renderPromotionPosts();
updateBriefProgress();

function initMode() {
  document.body.classList.toggle("admin-mode", isAdminMode);
  document.body.classList.toggle("customer-mode", !isAdminMode);
  if (!isAdminMode) {
    shortlist = [];
    saveJson(shortlistKey, shortlist);
    setClientPending(true);
    switchPage("client", { silent: true });
    updateStats(0);
    return;
  }
  setClientPending(false);
  runMatch();
}

function switchPage(pageName, options = {}) {
  if (!isAdminMode && pageName !== "client") {
    return;
  }
  document.querySelectorAll(".page").forEach((page) => {
    page.classList.toggle("active", page.dataset.page === pageName);
  });
  document.querySelectorAll("[data-page-target]").forEach((button) => {
    button.classList.toggle("active", button.dataset.pageTarget === pageName);
  });
  if (pageName === "database") {
    renderDatabase();
  }
  if (pageName === "promotion") {
    renderPromotionPosts();
  }
  if (!options.silent) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function loadModels() {
  const saved = loadJson(storageKey, null);
  if (saved?.length) {
    return saved.map(normalizeModel);
  }
  saveJson(storageKey, sampleModels);
  return sampleModels.map(normalizeModel);
}

function normalizeModel(model, index = 0) {
  const defaultModel = sampleDefaultsByName.get(model.name) || {};
  const isLegacySample = Boolean(defaultModel.name && !model.code);
  return {
    ...defaultModel,
    ...model,
    code: model.code || defaultModel.code || `MDL-${String(index + 1).padStart(3, "0")}`,
    ageGroup: model.ageGroup || defaultModel.ageGroup || inferAgeGroup(model.age),
    shoeSize: model.shoeSize || defaultModel.shoeSize || "待补充",
    skinTone: model.skinTone || defaultModel.skinTone || "自然",
    hairColor: model.hairColor || defaultModel.hairColor || "黑发",
    fee: isLegacySample ? defaultModel.fee : toNumber(model.fee) || defaultModel.fee || 0,
    tags: Array.isArray(model.tags) ? model.tags : splitTags(model.tags || defaultModel.tags),
    works: Array.isArray(model.works) ? model.works : defaultModel.works || splitTags(model.works || model.notes),
    photo:
      model.photo ||
      defaultModel.photo ||
      "https://images.unsplash.com/photo-1496440737103-cd596325d314?auto=format&fit=crop&w=900&q=80",
    cardOrientation: normalizeCardOrientation(model.cardOrientation || model["模卡版式"] || defaultModel.cardOrientation, index),
  };
}

function normalizeCardOrientation(value, index = 0) {
  const normalized = String(value || "").trim().toLowerCase();
  if (["landscape", "horizontal", "横版", "横图", "16:9"].includes(normalized)) return "landscape";
  if (["portrait", "vertical", "竖版", "竖图", "3:4"].includes(normalized)) return "portrait";
  return index % 3 === 1 ? "landscape" : "portrait";
}

function inferAgeGroup(age) {
  if (age && age < 14) return "儿童";
  if (age && age >= 55) return "老年";
  return "成人";
}

function loadJson(key, fallback) {
  try {
    const raw = globalThis.localStorage?.getItem(key) ?? memoryStore[key];
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveJson(key, value) {
  const serialized = JSON.stringify(value);
  memoryStore[key] = serialized;
  try {
    globalThis.localStorage?.setItem(key, serialized);
  } catch {
    // file:// pages may block localStorage; memory fallback keeps the app interactive.
  }
}

function removeJson(key) {
  delete memoryStore[key];
  try {
    globalThis.localStorage?.removeItem(key);
  } catch {
    // See saveJson fallback note.
  }
}

function saveModels() {
  saveJson(storageKey, models);
}

function getBrief() {
  return {
    shootProduct: fields.shootProduct.value.trim(),
    shootType: fields.shootType.value,
    ageGroup: fields.ageGroup.value,
    gender: fields.gender.value,
    skinTone: fields.skinTone.value,
    hairColor: fields.hairColor.value,
    heightMin: toNumber(fields.heightMin.value),
    heightMax: toNumber(fields.heightMax.value),
    bustMin: toNumber(fields.bustMin.value),
    bustMax: toNumber(fields.bustMax.value),
    waistMin: toNumber(fields.waistMin.value),
    waistMax: toNumber(fields.waistMax.value),
    hipsMin: toNumber(fields.hipsMin.value),
    hipsMax: toNumber(fields.hipsMax.value),
    city: fields.city.value.trim(),
    budgetMax: toNumber(fields.budgetMax.value),
    shootDate: fields.shootDate.value,
    styleTags: [...styleCheckboxes.filter((field) => field.checked).map((field) => field.value), ...splitTags(fields.styleTags.value)],
  };
}

function runMatch() {
  const brief = getBrief();
  currentMatches = models
    .map((model) => ({ ...model, match: scoreModel(model, brief) }))
    .sort((a, b) => b.match.score - a.match.score);
  renderResults();
  updateStats();
}

function submitBrief(button) {
  if (!document.querySelector("#briefForm").reportValidity()) {
    showToast("请先填写必填需求");
    return;
  }
  pendingMatchButton = button;
  document.querySelector("#brandName").value = clientInfo.brandName || "";
  document.querySelector("#clientContact").value = clientInfo.contact || "";
  openModal("clientInfoModal");
}

async function submitClientInfo(event) {
  event.preventDefault();
  const button = pendingMatchButton || document.querySelector("#matchBtn");
  clientInfo = {
    brandName: document.querySelector("#brandName").value.trim(),
    contact: document.querySelector("#clientContact").value.trim(),
  };
  saveJson("casting-system-client-info", clientInfo);
  closeModal("clientInfoModal");
  hasSubmittedBrief = true;
  setButtonBusy(button, "正在匹配...");
  await delay(420);
  setClientPending(false);
  saveJson(briefKey, getBrief());
  runMatch();
  setButtonReady(button, "提交需求，查看推荐");
  document.querySelector("#resultsTitle").scrollIntoView({ behavior: "smooth", block: "start" });
  showToast("需求已提交，已为你生成推荐清单");
}

function setClientPending(isPending) {
  document.querySelector(".client-shell").classList.toggle("client-pending", isPending);
}

function scoreModel(model, brief) {
  let score = 45;
  const reasons = [];
  const misses = [];

  if (brief.shootType) {
    if (model.tags.some((tag) => tag.includes(brief.shootType) || brief.shootType.includes(tag))) {
      score += 8;
      reasons.push("拍摄类型匹配");
    } else {
      score -= 3;
    }
  }

  if (brief.ageGroup) {
    if (model.ageGroup === brief.ageGroup) {
      score += 10;
      reasons.push("年龄类型符合");
    } else {
      score -= 12;
      misses.push("年龄类型不符");
    }
  }

  if (brief.gender) {
    if (model.gender === brief.gender) {
      score += 12;
      reasons.push("性别符合");
    } else {
      score -= 22;
      misses.push("性别不符");
    }
  }

  if (brief.skinTone) {
    if (model.skinTone === brief.skinTone) {
      score += 7;
      reasons.push("肤色符合");
    } else {
      score -= 3;
      misses.push("肤色需确认");
    }
  }

  if (brief.hairColor) {
    if (model.hairColor === brief.hairColor) {
      score += 7;
      reasons.push("发色符合");
    } else {
      score -= 3;
      misses.push("发色需确认");
    }
  }

  score += scoreRange(model.height, brief.heightMin, brief.heightMax, 14, "身高合适", "身高偏离", reasons, misses);
  const measurements = parseMeasurements(model.measurements);
  score += scoreRange(measurements.bust, brief.bustMin, brief.bustMax, 5, "胸围合适", "胸围偏离", reasons, misses);
  score += scoreRange(measurements.waist, brief.waistMin, brief.waistMax, 5, "腰围合适", "腰围偏离", reasons, misses);
  score += scoreRange(measurements.hips, brief.hipsMin, brief.hipsMax, 5, "臀围合适", "臀围偏离", reasons, misses);

  if (brief.city) {
    const cityTerms = splitTags(brief.city);
    if (cityTerms.some((city) => model.city.includes(city) || city.includes(model.city))) {
      score += 12;
      reasons.push("城市匹配");
    } else {
      score -= 5;
      misses.push("异地需确认");
    }
  }

  if (brief.budgetMax) {
    if (model.fee <= brief.budgetMax) {
      score += 13;
      reasons.push("报价在预算内");
    } else {
      const overRate = (model.fee - brief.budgetMax) / brief.budgetMax;
      score -= Math.min(18, Math.round(overRate * 24));
      misses.push("报价超预算");
    }
  }

  const tagHits = brief.styleTags.filter((tag) =>
    model.tags.some((modelTag) => modelTag.includes(tag) || tag.includes(modelTag)),
  );
  if (brief.styleTags.length) {
    const tagScore = Math.round((tagHits.length / brief.styleTags.length) * 24);
    score += tagScore;
    if (tagHits.length) {
      reasons.push(`风格命中：${tagHits.join("、")}`);
    } else {
      misses.push("风格标签未命中");
    }
  }

  score = Math.max(0, Math.min(100, score));
  return { score, reasons: reasons.slice(0, 4), misses: misses.slice(0, 3) };
}

function scoreRange(value, min, max, points, hitText, missText, reasons, misses) {
  if (!min && !max) {
    return 0;
  }
  const lowerOk = !min || value >= min;
  const upperOk = !max || value <= max;
  if (lowerOk && upperOk) {
    reasons.push(hitText);
    return points;
  }
  misses.push(missText);
  const target = min && value < min ? min : max;
  const distance = Math.abs(value - target);
  return -Math.min(points, Math.round(distance / 2));
}

function renderResults() {
  const keyword = document.querySelector("#searchInput").value.trim().toLowerCase();
  const sortBy = document.querySelector("#sortSelect").value;
  let rows = [...currentMatches];

  if (keyword) {
    rows = rows.filter((model) =>
      `${model.name} ${model.city} ${model.tags.join(" ")} ${model.notes}`.toLowerCase().includes(keyword),
    );
  }

  rows.sort((a, b) => {
    if (sortBy === "fee") return a.fee - b.fee;
    if (sortBy === "height") return b.height - a.height;
    if (sortBy === "updated") return new Date(b.updatedAt) - new Date(a.updatedAt);
    return b.match.score - a.match.score;
  });

  if (!rows.length) {
    resultsGrid.innerHTML = `<div class="empty-state">暂无匹配结果。可以放宽条件，或先新增模特资料。</div>`;
    updateStats(0);
    return;
  }

  resultsGrid.innerHTML = rows.map((model) => renderModelCard(model, { showScore: true })).join("");
  updateStats(rows.length);
}

function renderModelCard(model, options = {}) {
  const showScore = options.showScore !== false;
  const inShortlist = shortlist.includes(model.id);
  const reasons = showScore && model.match ? [...model.match.reasons, ...model.match.misses].slice(0, 5) : [];
  const detailLine = showScore
    ? `三围：${escapeHtml(normalizeMeasurementsText(model.measurements))}`
    : `${escapeHtml(model.measurements || "未填写体型")} · ${escapeHtml(model.availability || "档期待确认")} · 更新 ${escapeHtml(model.updatedAt || "未记录")}`;
  const title = showScore ? model.code : `${model.code} · ${model.name}`;
  const basicInfo = `${escapeHtml(model.gender)} / ${model.height}cm / 鞋码${escapeHtml(model.shoeSize)} / ${escapeHtml(model.city)} / ¥${model.fee}/时`;
  const orientation = model.cardOrientation === "landscape" ? "landscape" : "portrait";
  const actions = showScore
    ? `
        <button type="button" data-action="shortlist" data-id="${model.id}">${inShortlist ? "移出候选" : "加入候选"}</button>
        <button type="button" data-action="details" data-id="${model.id}">模特相关资料</button>
      `
    : `
        <button type="button" data-action="shortlist" data-id="${model.id}">${inShortlist ? "移出候选" : "加入候选"}</button>
        <button type="button" data-action="edit" data-id="${model.id}">编辑</button>
        <button type="button" data-action="details" data-id="${model.id}">模特相关资料</button>
      `;
  return `
    <article class="model-card portfolio-card orientation-${orientation} ${showScore ? "recommend-card" : "database-card"} ${inShortlist ? "is-selected" : ""}" style="--model-photo: url('${escapeAttribute(model.photo)}')">
      <button class="model-card-visual" type="button" data-action="details" data-id="${model.id}" aria-label="查看 ${escapeAttribute(model.code)} 模特相关资料">
        ${showScore && model.match ? `<span class="score-badge">${model.match.score}<small>匹配度</small></span>` : ""}
      </button>
      <div class="model-card-content">
        <div class="model-card-header">
          <div>
            <h3>${escapeHtml(title)}</h3>
            <p class="model-meta">${basicInfo}</p>
          </div>
        </div>
        <div class="tag-list">${model.tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}</div>
        ${reasons.length ? `<div class="reason-list">${reasons.map((reason) => `<span class="reason">${escapeHtml(reason)}</span>`).join("")}</div>` : ""}
        <p class="model-meta">${detailLine}</p>
        ${!showScore && model.notes ? `<p class="model-note">${escapeHtml(model.notes)}</p>` : ""}
        <div class="model-card-actions">
          ${actions}
        </div>
      </div>
    </article>
  `;
}

function handleCardAction(event) {
  const postButton = event.target.closest("[data-post-action]");
  if (postButton) {
    copyPost(Number(postButton.dataset.postIndex), postButton);
    return;
  }

  const button = event.target.closest("[data-action]");
  if (!button) return;
  const model = models.find((item) => item.id === button.dataset.id);
  if (!model) return;
  if (button.dataset.action === "shortlist") toggleShortlist(model.id);
  if (button.dataset.action === "edit") editModel(model.id);
  if (button.dataset.action === "details") openModelDetails(model);
}

function renderDatabase() {
  const keyword = document.querySelector("#databaseSearchInput").value.trim().toLowerCase();
  const sortBy = document.querySelector("#databaseSortSelect").value;
  let rows = [...models];

  if (keyword) {
    rows = rows.filter((model) =>
      `${model.name} ${model.gender} ${model.city} ${model.tags.join(" ")} ${model.notes} ${model.availability}`
        .toLowerCase()
        .includes(keyword),
    );
  }

  rows.sort((a, b) => {
    if (sortBy === "fee") return a.fee - b.fee;
    if (sortBy === "height") return b.height - a.height;
    if (sortBy === "name") return a.name.localeCompare(b.name, "zh-Hans-CN");
    return new Date(b.updatedAt) - new Date(a.updatedAt);
  });

  document.querySelector("#databaseTotal").textContent = `${rows.length} 位模特`;
  if (!rows.length) {
    databaseGrid.innerHTML = `<div class="empty-state">资料库里暂时没有符合条件的模特。</div>`;
    return;
  }
  databaseGrid.innerHTML = rows.map((model) => renderModelCard(model, { showScore: false })).join("");
}

function renderPromotionPosts(options = {}) {
  const type = document.querySelector("#postTopicType").value;
  const week = getWeekKey();
  const store = loadJson(postsKey, {});
  const cacheKey = `${week}:${type}`;
  const posts = options.regenerate || !store[cacheKey] ? generateWeeklyPosts(type, week) : store[cacheKey];

  store[cacheKey] = posts;
  saveJson(postsKey, store);
  document.querySelector("#postWeekLabel").textContent = `${week} 本周内容`;
  document.querySelector("#postCountLabel").textContent = `${posts.length} 篇`;

  if (!posts.length) {
    postGrid.innerHTML = `<div class="empty-state">资料库里还没有可用于生成推广帖的模特，请先导入或新增模特资料。</div>`;
    return;
  }

  postGrid.innerHTML = posts
    .map(
      (post, index) => `
        <article class="post-card">
          <div class="post-card-header">
            <div>
              <span class="count-pill">第 ${index + 1} 篇</span>
              <h3>${escapeHtml(post.title)}</h3>
            </div>
            <button type="button" data-post-action="copy" data-post-index="${index}">复制</button>
          </div>
          <p class="model-meta">选用：${escapeHtml(post.models.join("、"))}</p>
          <pre>${escapeHtml(formatPost(post))}</pre>
        </article>
      `,
    )
    .join("");
}

function generateWeeklyPosts(type, week) {
  if (!models.length) return [];
  return type === "collection" ? generateCollectionPosts(week) : generateSinglePosts(week);
}

function generateSinglePosts(week) {
  const selected = repeatToLength(rotateModels(week), 3);
  return selected.map((model, index) => {
    const coreTags = model.tags.slice(0, 3);
    const hook = [
      "这类气质真的很适合品牌画册",
      "最近客户问得比较多的一类模特",
      "想要稳定出片，可以重点看这一位",
    ][index];
    return {
      title: `${model.name}｜${coreTags[0] || model.city}风格模特推荐`,
      models: [model.name],
      body: [
        `${hook}：${model.name}。`,
        `基础信息：${model.gender} / ${model.age}岁 / ${model.height}cm / 常驻${model.city} / 参考报价¥${model.fee}/天。`,
        `适配方向：${coreTags.join("、") || "商业拍摄"}。${model.notes || "镜头表现自然，适合需要快速确认人选的拍摄项目。"}`,
        `适合项目：品牌画册、电商详情页、短视频种草、线下活动物料。`,
        `想看完整模卡或确认档期，可以直接联系经纪人。`,
      ].join("\n\n"),
      hashtags: buildHashtags(["模特推荐", "商业拍摄", model.city, ...coreTags]),
    };
  });
}

function generateCollectionPosts(week) {
  const tagGroups = repeatToLength(collectTagGroups(week), 3);
  return tagGroups.map((group, index) => {
    const names = group.models.map((model) => model.name);
    const scene = [
      "品牌拍摄选角可以直接参考",
      "客户做初筛时很省时间",
      "适合近期需要快速定人的项目",
    ][index];
    return {
      title: `${group.tag}类型模特合集｜${names.length}位可选`,
      models: names,
      body: [
        `${scene}：本周整理了 ${names.length} 位${group.tag}类型模特。`,
        ...group.models.map(
          (model, modelIndex) =>
            `${modelIndex + 1}. ${model.name}：${model.gender} / ${model.age}岁 / ${model.height}cm / ${model.city} / ¥${model.fee}/天，适合${model.tags.slice(0, 3).join("、") || group.tag}。`,
        ),
        `选角建议：如果客户更看重统一视觉，可以优先按城市和预算筛；如果是内容种草，可以优先看镜头表现和短视频经验。`,
        `需要完整模卡、档期和组合报价，可以直接联系经纪人。`,
      ].join("\n\n"),
      hashtags: buildHashtags(["模特合集", "选角推荐", group.tag, ...group.models.flatMap((model) => model.tags.slice(0, 1))]),
    };
  });
}

function repeatToLength(items, length) {
  if (!items.length) return [];
  return Array.from({ length }, (_, index) => items[index % items.length]);
}

function rotateModels(seedText) {
  const seed = hashText(seedText);
  return [...models].sort((a, b) => ((hashText(a.id) + seed) % 997) - ((hashText(b.id) + seed) % 997));
}

function collectTagGroups(week) {
  const groups = models.reduce((map, model) => {
    const tags = model.tags.length ? model.tags : ["商业拍摄"];
    tags.forEach((tag) => {
      if (!map.has(tag)) map.set(tag, []);
      map.get(tag).push(model);
    });
    return map;
  }, new Map());

  return [...groups.entries()]
    .map(([tag, groupModels]) => ({
      tag,
      models: rotateList(groupModels, hashText(`${week}:${tag}`)).slice(0, 4),
    }))
    .filter((group) => group.models.length)
    .sort((a, b) => b.models.length - a.models.length || a.tag.localeCompare(b.tag, "zh-Hans-CN"));
}

function rotateList(items, offset) {
  if (!items.length) return [];
  const start = offset % items.length;
  return [...items.slice(start), ...items.slice(0, start)];
}

function buildHashtags(tags) {
  return [...new Set(tags.filter(Boolean).map((tag) => tag.replace(/^#/, "")))]
    .slice(0, 8)
    .map((tag) => `#${tag}`)
    .join(" ");
}

function formatPost(post) {
  return `${post.title}\n\n${post.body}\n\n${post.hashtags}`;
}

function getCurrentPosts() {
  const type = document.querySelector("#postTopicType").value;
  const store = loadJson(postsKey, {});
  return store[`${getWeekKey()}:${type}`] || [];
}

async function copyAllPosts(button) {
  const posts = getCurrentPosts();
  if (!posts.length) {
    showToast("还没有可复制的帖子");
    return;
  }
  await writeClipboard(posts.map((post, index) => `【第 ${index + 1} 篇】\n${formatPost(post)}`).join("\n\n---\n\n"));
  if (button) flashButtonSuccess(button, "已复制全部");
  showToast("本周 3 篇帖子已复制");
}

async function copyPost(index, button) {
  const post = getCurrentPosts()[index];
  if (!post) {
    showToast("没有找到这篇帖子");
    return;
  }
  await writeClipboard(formatPost(post));
  if (button) flashButtonSuccess(button, "已复制");
  showToast("帖子草稿已复制");
}

function toggleShortlist(id) {
  shortlist = shortlist.includes(id) ? shortlist.filter((item) => item !== id) : [...shortlist, id];
  saveJson(shortlistKey, shortlist);
  renderResults();
  renderDatabase();
  renderShortlist();
  updateStats();
}

function renderShortlist() {
  const selected = shortlist.map((id) => models.find((model) => model.id === id)).filter(Boolean);
  if (!selected.length) {
    shortlistEl.innerHTML = `<div class="empty-state">从匹配结果里加入候选，给客户发名单会更快。</div>`;
    return;
  }
  shortlistEl.innerHTML = selected
    .map(
      (model) => `
        <div class="shortlist-item orientation-${model.cardOrientation === "landscape" ? "landscape" : "portrait"}">
          <button class="shortlist-thumb" type="button" data-action="details" data-id="${model.id}" style="--model-photo: url('${escapeAttribute(model.photo)}')" aria-label="查看 ${escapeAttribute(model.code)} 模卡"></button>
          <div class="shortlist-copy">
            <strong>${escapeHtml(model.code)} · ${escapeHtml(model.city)}</strong>
            <p>${escapeHtml(model.gender)} / ${model.height}cm / 鞋码${escapeHtml(model.shoeSize)} / ¥${model.fee}/时</p>
            <p>三围：${escapeHtml(normalizeMeasurementsText(model.measurements))}</p>
            <div class="tag-list">${model.tags.slice(0, 4).map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}</div>
          </div>
        </div>
      `,
    )
    .join("");
}

function updateStats(matchCount = currentMatches.length) {
  document.querySelector("#totalModels").textContent = models.length;
  document.querySelector("#matchedModels").textContent = matchCount;
  document.querySelector("#shortlistCount").textContent = shortlist.length;
  document.querySelector("#databaseTotal").textContent =
    `${document.querySelectorAll("#databaseGrid .model-card").length || models.length} 位模特`;
  renderShortlist();
}

function saveBrief(button) {
  saveJson(briefKey, getBrief());
  if (button) flashButtonSuccess(button, "已保存");
  showToast("已保存当前客户需求");
}

function restoreBrief() {
  const saved = loadJson(briefKey, null);
  if (!saved) return;
  Object.entries(saved).forEach(([key, value]) => {
    if (!fields[key]) return;
    fields[key].value = Array.isArray(value) ? value.join(", ") : value || "";
  });
}

function resetBrief() {
  Object.values(fields).forEach((field) => {
    field.value = "";
    field.classList.remove("has-value");
  });
  styleCheckboxes.forEach((field) => {
    field.checked = false;
  });
  removeJson(briefKey);
  hasSubmittedBrief = false;
  setClientPending(!isAdminMode);
  if (isAdminMode) {
    runMatch();
  } else {
    currentMatches = [];
    resultsGrid.innerHTML = "";
    updateStats(0);
  }
  showToast("已重置客户需求");
  updateBriefProgress();
}

function saveModel(event) {
  event.preventDefault();
  const id = modelFields.id.value || createId();
  const model = {
    id,
    name: modelFields.name.value.trim(),
    gender: modelFields.gender.value,
    age: toNumber(modelFields.age.value) || 0,
    height: toNumber(modelFields.height.value) || 0,
    measurements: modelFields.measurements.value.trim(),
    city: modelFields.city.value.trim(),
    fee: toNumber(modelFields.fee.value) || 0,
    availability: modelFields.availability.value.trim(),
    tags: splitTags(modelFields.tags.value),
    photo: modelFields.photo.value.trim(),
    cardOrientation: modelFields.cardOrientation.value,
    portfolio: modelFields.portfolio.value.trim(),
    notes: modelFields.notes.value.trim(),
    updatedAt: new Date().toISOString().slice(0, 10),
  };

  models = models.some((item) => item.id === id)
    ? models.map((item) => (item.id === id ? model : item))
    : [model, ...models];

  saveModels();
  clearModelForm();
  runMatch();
  renderDatabase();
  renderPromotionPosts({ regenerate: true });
  showToast("模特资料已保存");
}

function editModel(id) {
  const model = models.find((item) => item.id === id);
  if (!model) return;
  modelFields.id.value = model.id;
  modelFields.name.value = model.name;
  modelFields.gender.value = model.gender;
  modelFields.age.value = model.age;
  modelFields.height.value = model.height;
  modelFields.measurements.value = model.measurements;
  modelFields.city.value = model.city;
  modelFields.fee.value = model.fee;
  modelFields.availability.value = model.availability;
  modelFields.tags.value = model.tags.join(", ");
  modelFields.photo.value = model.photo || "";
  modelFields.cardOrientation.value = model.cardOrientation || "portrait";
  modelFields.portfolio.value = model.portfolio;
  modelFields.notes.value = model.notes;
  switchPage("import");
  document.querySelector("#editorTitle").scrollIntoView({ behavior: "smooth", block: "start" });
}

function clearModelForm() {
  document.querySelector("#modelForm").reset();
  modelFields.id.value = "";
}

function openPortfolio(model) {
  if (!model.portfolio) {
    showToast("这个模特还没有填写模卡链接");
    return;
  }
  window.open(model.portfolio, "_blank", "noopener,noreferrer");
}

function exportCsv() {
  const headers = [
    "name",
    "gender",
    "age",
    "height",
    "measurements",
    "city",
    "fee",
    "availability",
    "tags",
    "photo",
    "cardOrientation",
    "portfolio",
    "notes",
    "updatedAt",
  ];
  const rows = [headers.join(",")].concat(
    models.map((model) =>
      headers
        .map((key) => {
          const value = key === "tags" ? model.tags.join("|") : model[key] || "";
          return `"${String(value).replaceAll('"', '""')}"`;
        })
        .join(","),
    ),
  );
  downloadBlob(rows.join("\n"), `model-database-${new Date().toISOString().slice(0, 10)}.csv`, "text/csv");
}

function importCsv(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const imported = parseCsv(String(reader.result))
      .map((row, index) => normalizeModel({
        id: createId(),
        name: row.name || row["姓名"] || "",
        gender: row.gender || row["性别"] || "",
        age: toNumber(row.age || row["年龄"]) || 0,
        height: toNumber(row.height || row["身高"]) || 0,
        measurements: row.measurements || row["三围"] || row["体型"] || "",
        city: row.city || row["城市"] || "",
        fee: toNumber(row.fee || row["报价"]) || 0,
        availability: row.availability || row["档期"] || "",
        tags: splitTags(row.tags || row["标签"] || row["风格标签"] || ""),
        photo: row.photo || row["模卡图片"] || row["模卡图片链接"] || row["照片"] || "",
        cardOrientation: normalizeCardOrientation(row.cardOrientation || row["模卡版式"] || row["横竖版"]),
        portfolio: row.portfolio || row["模卡链接"] || "",
        notes: row.notes || row["备注"] || "",
        updatedAt: row.updatedAt || new Date().toISOString().slice(0, 10),
      }, index))
      .filter((row) => row.name);

    models = [...imported, ...models];
    saveModels();
    runMatch();
    renderDatabase();
    renderPromotionPosts({ regenerate: true });
    event.target.value = "";
    showToast(`已导入 ${imported.length} 位模特`);
  };
  reader.readAsText(file, "UTF-8");
}

function downloadTemplate() {
  const template = [
    "name,gender,age,height,measurements,city,fee,availability,tags,photo,cardOrientation,portfolio,notes",
    '"示例模特","女","22","170","82/60/88","上海","2000","6月可约","高级感|美妆|画册","https://example.com/model-card.jpg","portrait","https://example.com","镜头表现稳定"',
  ].join("\n");
  downloadBlob(template, "model-import-template.csv", "text/csv");
}

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  if (!lines.length) return [];
  const headers = splitCsvLine(lines[0]).map((item) => item.trim());
  return lines.slice(1).map((line) => {
    const values = splitCsvLine(line);
    return headers.reduce((row, header, index) => {
      row[header] = values[index] || "";
      return row;
    }, {});
  });
}

function splitCsvLine(line) {
  const values = [];
  let current = "";
  let inQuotes = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];
    if (char === '"' && next === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      values.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  values.push(current);
  return values;
}

async function copyShortlist(button) {
  const selected = shortlist.map((id) => models.find((model) => model.id === id)).filter(Boolean);
  if (!selected.length) {
    showToast("候选清单还是空的");
    return;
  }
  const brief = getBrief();
  const text = [
    brief.shootProduct ? `拍摄产品：${brief.shootProduct}` : "候选模特清单",
    clientInfo.brandName ? `品牌：${clientInfo.brandName}` : "",
    "",
    ...selected.map(
      (model, index) =>
        `${index + 1}. ${model.code}｜${model.gender}｜${model.height}cm｜鞋码${model.shoeSize}｜${model.city}｜¥${model.fee}/时｜三围${normalizeMeasurementsText(model.measurements)}｜${model.tags.join("、")}`,
    ),
  ]
    .filter(Boolean)
    .join("\n");
  await writeClipboard(text);
  if (button) flashButtonSuccess(button, "已复制");
  showToast("候选清单已复制");
}

async function exportShortlistImage(button) {
  const selected = shortlist.map((id) => models.find((model) => model.id === id)).filter(Boolean);
  if (!selected.length) {
    showToast("候选清单还是空的");
    return;
  }

  setButtonBusy(button, "生成中...");
  try {
    const brief = getBrief();
    const canvas = await buildShortlistCanvas(selected, brief);
    const filename = `model-shortlist-${new Date().toISOString().slice(0, 10)}.png`;
    await downloadCanvas(canvas, filename);
    setButtonReady(button, "导出图片");
    if (button) flashButtonSuccess(button, "已导出");
    showToast("已导出推荐清单图片");
  } catch (error) {
    console.error(error);
    setButtonReady(button, "导出图片");
    showToast("图片导出失败，请检查模卡图片链接是否允许跨域加载");
  }
}

async function buildShortlistCanvas(selected, brief) {
  const width = 1080;
  const padding = 52;
  const gap = 24;
  const cardWidth = width - padding * 2;
  const headerHeight = 210;
  const footerHeight = 104;
  const rows = selected.map((model) => {
    const isLandscape = model.cardOrientation === "landscape";
    return {
      model,
      imageWidth: isLandscape ? 330 : 250,
      imageHeight: isLandscape ? 210 : 330,
      cardHeight: isLandscape ? 250 : 370,
    };
  });
  const height = headerHeight + rows.reduce((sum, row) => sum + row.cardHeight + gap, 0) + footerHeight;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#f5f7f4";
  ctx.fillRect(0, 0, width, height);
  drawExportHeader(ctx, brief, selected.length, padding, width);

  let y = headerHeight;
  for (const row of rows) {
    await drawShortlistExportCard(ctx, row.model, padding, y, cardWidth, row);
    y += row.cardHeight + gap;
  }

  drawExportFooter(ctx, padding, height - footerHeight + 10, width - padding * 2);
  return canvas;
}

function drawExportHeader(ctx, brief, count, padding, width) {
  ctx.fillStyle = "#1c2521";
  ctx.font = "700 42px PingFang SC, Microsoft YaHei, sans-serif";
  ctx.fillText("已选模特推荐清单", padding, 78);

  ctx.fillStyle = "#68746d";
  ctx.font = "400 24px PingFang SC, Microsoft YaHei, sans-serif";
  const projectLine = [
    brief.shootProduct ? `拍摄产品：${brief.shootProduct}` : "",
    brief.city ? `城市：${brief.city}` : "",
    brief.budgetMax ? `预算上限：¥${brief.budgetMax}/时` : "",
  ]
    .filter(Boolean)
    .join("   ");
  ctx.fillText(projectLine || `共 ${count} 位候选模特`, padding, 122);

  ctx.fillStyle = "#0f7b6c";
  ctx.font = "700 22px PingFang SC, Microsoft YaHei, sans-serif";
  ctx.fillText(clientInfo.brandName ? `品牌：${clientInfo.brandName}` : `候选数量：${count} 位`, padding, 160);

  ctx.strokeStyle = "#d9e1da";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(padding, 190);
  ctx.lineTo(width - padding, 190);
  ctx.stroke();
}

async function drawShortlistExportCard(ctx, model, x, y, width, row) {
  drawRoundRect(ctx, x, y, width, row.cardHeight, 18, "#ffffff", "#d9e1da");
  const imageX = x + 22;
  const imageY = y + 20;
  const textX = imageX + row.imageWidth + 28;
  const textWidth = width - row.imageWidth - 78;

  const image = await loadCanvasImage(model.photo);
  if (image) {
    drawCoverImage(ctx, image, imageX, imageY, row.imageWidth, row.imageHeight, 14);
  } else {
    drawImagePlaceholder(ctx, imageX, imageY, row.imageWidth, row.imageHeight, model.code);
  }

  ctx.fillStyle = "#1c2521";
  ctx.font = "700 34px PingFang SC, Microsoft YaHei, sans-serif";
  ctx.fillText(model.code, textX, y + 62);

  ctx.fillStyle = "#435049";
  ctx.font = "400 23px PingFang SC, Microsoft YaHei, sans-serif";
  const basics = `${model.gender} / ${model.height}cm / 鞋码${model.shoeSize} / ${model.city} / ¥${model.fee}/时`;
  wrapCanvasText(ctx, basics, textX, y + 104, textWidth, 31, 2);

  ctx.fillStyle = "#68746d";
  ctx.font = "400 22px PingFang SC, Microsoft YaHei, sans-serif";
  wrapCanvasText(ctx, `三围：${normalizeMeasurementsText(model.measurements)}`, textX, y + 168, textWidth, 30, 2);

  drawExportTags(ctx, model.tags.slice(0, 5), textX, y + row.cardHeight - 72, textWidth);
}

function drawExportTags(ctx, tags, x, y, maxWidth) {
  let cursorX = x;
  let cursorY = y;
  ctx.font = "400 20px PingFang SC, Microsoft YaHei, sans-serif";
  tags.forEach((tag) => {
    const label = `#${tag}`;
    const tagWidth = Math.min(ctx.measureText(label).width + 26, maxWidth);
    if (cursorX + tagWidth > x + maxWidth) {
      cursorX = x;
      cursorY += 38;
    }
    drawRoundRect(ctx, cursorX, cursorY, tagWidth, 30, 15, "#e0f1ee", "");
    ctx.fillStyle = "#095f54";
    ctx.fillText(label, cursorX + 13, cursorY + 21);
    cursorX += tagWidth + 10;
  });
}

function drawExportFooter(ctx, x, y, width) {
  drawRoundRect(ctx, x, y, width, 68, 16, "#1c2521", "");
  ctx.fillStyle = "#ffffff";
  ctx.font = "700 24px PingFang SC, Microsoft YaHei, sans-serif";
  ctx.fillText("经纪人联系方式", x + 24, y + 42);
  ctx.font = "400 22px PingFang SC, Microsoft YaHei, sans-serif";
  ctx.fillText(brokerContact, x + 250, y + 42);
}

function loadCanvasImage(src) {
  return new Promise((resolve) => {
    if (!src) {
      resolve(null);
      return;
    }
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

function drawCoverImage(ctx, image, x, y, width, height, radius) {
  ctx.save();
  roundedClip(ctx, x, y, width, height, radius);
  const imageRatio = image.naturalWidth / image.naturalHeight;
  const boxRatio = width / height;
  const drawWidth = imageRatio > boxRatio ? height * imageRatio : width;
  const drawHeight = imageRatio > boxRatio ? height : width / imageRatio;
  ctx.drawImage(image, x + (width - drawWidth) / 2, y + (height - drawHeight) / 2, drawWidth, drawHeight);
  ctx.restore();
}

function drawImagePlaceholder(ctx, x, y, width, height, code) {
  drawRoundRect(ctx, x, y, width, height, 14, "#f0f4ef", "#d9e1da");
  ctx.fillStyle = "#68746d";
  ctx.font = "700 28px PingFang SC, Microsoft YaHei, sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(code, x + width / 2, y + height / 2);
  ctx.font = "400 20px PingFang SC, Microsoft YaHei, sans-serif";
  ctx.fillText("模卡图片待补充", x + width / 2, y + height / 2 + 36);
  ctx.textAlign = "left";
}

function drawRoundRect(ctx, x, y, width, height, radius, fill, stroke) {
  roundedPath(ctx, x, y, width, height, radius);
  if (fill) {
    ctx.fillStyle = fill;
    ctx.fill();
  }
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

function roundedClip(ctx, x, y, width, height, radius) {
  roundedPath(ctx, x, y, width, height, radius);
  ctx.clip();
}

function roundedPath(ctx, x, y, width, height, radius) {
  const r = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + width - r, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + r);
  ctx.lineTo(x + width, y + height - r);
  ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
  ctx.lineTo(x + r, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 3) {
  const chars = String(text).split("");
  let line = "";
  let lineCount = 0;
  for (const char of chars) {
    const testLine = line + char;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, y + lineCount * lineHeight);
      line = char;
      lineCount += 1;
      if (lineCount >= maxLines) return;
    } else {
      line = testLine;
    }
  }
  if (line && lineCount < maxLines) {
    ctx.fillText(line, x, y + lineCount * lineHeight);
  }
}

function downloadCanvas(canvas, filename) {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Canvas export failed"));
        return;
      }
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.click();
      URL.revokeObjectURL(url);
      resolve();
    }, "image/png");
  });
}

async function copyBrokerContact(button) {
  await writeClipboard(brokerContact);
  if (button) flashButtonSuccess(button, "已复制");
  showToast("经纪人联系方式已复制");
}

async function writeClipboard(text) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch {
      copyWithTextarea(text);
      return;
    }
  }
  copyWithTextarea(text);
}

function copyWithTextarea(text) {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.left = "-9999px";
  textarea.style.top = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  textarea.remove();
}

function openModelDetails(model) {
  const briefTags = getBrief().styleTags;
  const works = getRelatedWorks(model, briefTags);
  document.querySelector("#modelDetailTitle").textContent = `${model.code} 模特相关资料`;
  document.querySelector("#modelDetailContent").innerHTML = `
    <div class="model-detail-layout">
      <div class="model-detail-photo" style="background-image: url('${escapeAttribute(model.photo)}')"></div>
      <div class="model-detail-info">
        <h3>${escapeHtml(model.code)}</h3>
        <p>${escapeHtml(model.gender)} / ${model.height}cm / 鞋码${escapeHtml(model.shoeSize)} / ${escapeHtml(model.city)} / ¥${model.fee}/时</p>
        <p>肤色：${escapeHtml(model.skinTone)}｜发色：${escapeHtml(model.hairColor)}｜三围：${escapeHtml(normalizeMeasurementsText(model.measurements))}</p>
        <div class="tag-list">${model.tags.map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join("")}</div>
      </div>
    </div>
    <div class="work-list">
      ${works
        .map(
          (work) => `
            <div class="work-item">
              <strong>${escapeHtml(work)}</strong>
              <p>${briefTags.length ? "根据当前需求关键词筛选" : "默认资料展示"}</p>
            </div>
          `,
        )
        .join("")}
    </div>
  `;
  openModal("modelDetailModal");
}

function getRelatedWorks(model, briefTags) {
  const works = model.works?.length ? model.works : [model.notes || "默认模卡资料", ...model.tags];
  const hits = works.filter((work) => briefTags.some((tag) => work.includes(tag)));
  return hits.length ? hits : works.slice(0, 4);
}

function openModal(id) {
  const modal = document.querySelector(`#${id}`);
  if (!modal) return;
  modal.hidden = false;
  document.body.classList.add("modal-open");
}

function closeModal(id) {
  const modal = document.querySelector(`#${id}`);
  if (!modal) return;
  modal.hidden = true;
  document.body.classList.remove("modal-open");
}

function splitTags(value) {
  if (Array.isArray(value)) return value;
  return String(value || "")
    .split(/[、,，|/\s]+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function updateBriefProgress() {
  briefInputs.forEach((field) => {
    const hasValue = field.type === "checkbox" ? field.checked : Boolean(String(field.value || "").trim());
    field.classList.toggle("has-value", hasValue);
  });
  const progressItems = getBriefProgressItems();
  const filled = progressItems.filter((item) => item).length;
  const total = progressItems.length;
  const percent = Math.round((filled / total) * 100);
  document.querySelector("#briefProgressText").textContent = `已填写 ${filled}/${total} 项`;
  document.querySelector("#briefProgressBar").style.width = `${percent}%`;
  document.querySelector("#briefHint").textContent =
    filled >= 5 ? "信息已经比较完整，可以提交查看推荐。" : "填写项目、城市、预算或风格后，推荐会更准确。";
}

function getBriefProgressItems() {
  const brief = getBrief();
  return [
    brief.shootProduct,
    brief.shootType,
    brief.ageGroup,
    brief.gender,
    brief.skinTone,
    brief.hairColor,
    brief.heightMin || brief.heightMax,
    brief.bustMin || brief.bustMax || brief.waistMin || brief.waistMax || brief.hipsMin || brief.hipsMax,
    brief.city,
    brief.budgetMax,
    brief.shootDate,
    brief.styleTags.length,
  ];
}

function setButtonBusy(button, text) {
  if (!button) return;
  button.dataset.originalText = button.textContent;
  button.textContent = text;
  button.classList.add("is-loading");
}

function setButtonReady(button, fallbackText) {
  if (!button) return;
  button.textContent = button.dataset.originalText || fallbackText;
  button.classList.remove("is-loading");
}

function flashButtonSuccess(button, text) {
  if (!button) return;
  const originalText = button.textContent;
  button.textContent = text;
  button.classList.add("is-confirmed");
  window.setTimeout(() => {
    button.textContent = originalText;
    button.classList.remove("is-confirmed");
  }, 1200);
}

function delay(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function parseMeasurements(value) {
  const [bust = 0, waist = 0, hips = 0] = String(value || "")
    .match(/\d+(\.\d+)?/g)
    ?.map(Number) || [];
  return { bust, waist, hips };
}

function normalizeMeasurementsText(value) {
  const measurements = parseMeasurements(value);
  if (!measurements.bust && !measurements.waist && !measurements.hips) {
    return value || "待补充";
  }
  return `${measurements.bust || "-"} / ${measurements.waist || "-"} / ${measurements.hips || "-"}`;
}

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
}

function getWeekKey(date = new Date()) {
  const utcDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const day = utcDate.getUTCDay() || 7;
  utcDate.setUTCDate(utcDate.getUTCDate() + 4 - day);
  const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
  const week = Math.ceil(((utcDate - yearStart) / 86400000 + 1) / 7);
  return `${utcDate.getUTCFullYear()}年第${String(week).padStart(2, "0")}周`;
}

function hashText(text) {
  return String(text)
    .split("")
    .reduce((hash, char) => (hash * 31 + char.charCodeAt(0)) % 100000, 7);
}

function createId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }
  return `model-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function downloadBlob(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function escapeAttribute(value) {
  return String(value ?? "").replaceAll("\\", "\\\\").replaceAll("'", "\\'");
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => toast.classList.remove("show"), 2200);
}
