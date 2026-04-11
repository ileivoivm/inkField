# LACMA Art + Technology Lab Grant — 2026 Application

> Deadline: April 22, 2026, 11:59 PM PST
> Source: https://www.lacma.org/art/lab/grants
> Applicants: Open to individuals and collectives worldwide
> Grant period: Typically two years
> Max funding: $50,000 per project (artist fees + direct costs including materials)
> Selection: 3–5 projects via open call, plus up to 2 invited projects
> Partners: Hyundai, Snap Inc., **Anthropic**, MIT Media Lab Space Exploration Initiative, NASA JPL, etc.

---

## Review Context & Evaluation Criteria (for reviewer reference)

### LACMA Art + Technology Lab Mission

The Lab is a "permission to fail" rapid-prototyping environment. Art outcomes are deliberately de-emphasized — instead, artists are encouraged to explore the boundaries of art and technology. The program supports projects that explore new tools and concepts relevant to technology and culture in artistic applications.

### What They Prioritize

1. **Exploratory proposals** that can be further refined through collaboration with technology experts and the museum
2. **Alignment with LACMA's mission** — projects that can be publicly presented
3. **Open outputs** — models, prototypes, data, code, or other materials that can be broadly shared
4. **Public engagement** — projects with public presentation or museum audience interaction components (budget may include travel for this purpose)
5. **Use of museum resources** — data, archives, collection information, digital platforms as project medium
6. **Beyond the gallery** — proposals not limited to museum campus, including conceptual projects, virtual/online spaces, even outer space

### Official Evaluation Criteria (from LACMA)

Projects are evaluated according to these four criteria:

1. **Is the project artist-led and does it have artistic merit?**
   該計畫是否由藝術家主導且具備藝術價值？

2. **Does the project explore emerging technology?**
   該計畫是否探索新興科技？

3. **Does the project suggest models, methods, and/or data that may be of interest to other artists and technologists?**
   該計畫是否提出可能引起其他藝術家與科技專家興趣的模式、方法及／或數據？

4. **Does the process proposed by the artist include opportunities to present demos, prototypes, or collaborative opportunities for the public during the development period?**
   藝術家提出的流程是否包含在開發期間向公眾展示演示、原型或提供合作機會？

### What They Are NOT Looking For

- Finished art objects or polished exhibitions
- Projects that only produce a single artwork
- Proposals without experimental or research components
- Projects that cannot share their findings publicly

### Why This Application Should Work (Self-Assessment against the 4 Criteria)

| Official Criterion | InkField's Match |
|-------------------|-----------------|
| **① Artist-led + artistic merit** | Led by Aluan Wang — 15+ years as pioneer of Taiwan's generative art scene, first Taiwanese artist on Art Blocks, solo at National Taiwan Museum of Fine Arts, Art Basel HK, Singapore ArtScience Museum. InkField is rooted in Eastern ink painting philosophy (qi, breath, emptiness) — not a tech demo but a deeply personal artistic practice. 6-stage shader pipeline with 7 brush physics modes, spectral color mixing, all hand-built by the artist. |
| **② Explores emerging technology** | Human-AI co-creation documented in 6+ months of daily git commits. Custom WebGL shader pipeline, seeded PRNG for deterministic replay, emotion-intention annotation schema in a relatively under-documented area between art history and AI training. |
| **③ Models, methods, data for others** | Open Creative License (free to use, full copyright to creator). Open gallery (36+ works). An open dataset pairing human painting intention with gesture data — still rare in publicly accessible art historical and AI-oriented corpora. Bilingual technical documentation. Fork system as a new model for creative inheritance. All tools and recordings published as open resources. |
| **④ Public demos & collaboration** | Fork system lets museum visitors continue painting from where any artist stopped. Live human-AI collaborative painting sessions with real-time JSON visualization. PWA works offline on iPad for on-site demos. 8 invited artists creating 40-64 annotated recordings. 3 public sessions at LACMA + 2 online workshops. Browser-based — works on any device worldwide. |

### Key Narrative Angles

- **Anthropic connection**: Anthropic sponsors the LACMA Art + Technology Lab. Claude (Anthropic's AI) is simultaneously a co-creator on InkField — documented in git commits as Co-Authored-By. This is not a pitch about using AI; it's a case where the sponsor's own technology has already become a creative partner in the applicant's practice.
- **Missing data thesis**: AI image generators know what paintings look like but not why the artist paused. InkField explores an annotation layer that remains rare in both art historical records and AI-oriented datasets.
- **Body as signature**: A signature carries the person because those few seconds of movement contain unique muscle habits. A full painting is a deeper portrait. InkField makes the invisible visible.
- **Qi as data**: In Eastern painting, qi (life-breath) > technique. InkField translates qi into vectors, acceleration, and breathing space between strokes.
- **Self-indexing**: The artist deliberately fills the system with enough data that AI can reconstruct their digital persona — a survival strategy for letting AI remember the human when the human is no longer present.
- **Fork as inheritance**: Not copying — standing on someone's path and continuing. A departure from copyright thinking toward creative genealogy.
- **Open public benefit**: Free professional-grade tool, full copyright to creators, zero economic barriers — this is not a product but a gift to the creative community.

### Reference Publication

Applicants may find it useful to read *All Impossible Deeds: LACMA's Art + Technology Lab, 2014–2025*, which examines artists, collaborations, ideas, and technological experimentation supported by the Lab over the past decade. PDF available for download from LACMA's website.

---

## Application Fields Below

---

## 1. Name of your project

InkField — Body Memory as Data, Gesture as Inheritance

InkField — 身體記憶作為數據，手勢作為繼承

---

## 2. List three words that describe your proposal

Qi, Process, Inheritance

氣、過程、繼承

---

## 3. One-sentence description

InkField turns the act of painting into a fossil of intention — preserving the body's hesitation, acceleration, and breath as replayable data — then lets each replay inject enough randomness to make that fossil breathe again, opening the work to inheritance and transformation by future artists, collaborators, and creative agents.

InkField 將繪畫行為轉化為意圖的化石 — 保存身體的猶豫、加速與呼吸為可重播的數據 — 再讓每次重播注入足夠的亂數使化石重新呼吸，將作品開放給未來的藝術家、協作者與創作型 agent 去繼承與轉化。

---

## 4. Full description of the proposed project (500 word maximum)

AI image generators know what paintings look like. They do not know why the artist paused before the third stroke. This is the missing data — not pixels, but the body's record of intention in time.

InkField is a WebGL digital ink painting system that captures every brushstroke's dynamics — coordinates, timestamps, velocity, pressure, ink diffusion — as replayable JSON. Each painting is a time-based event sequence: a fossil of intention that replays with enough randomness to breathe differently each time. The system includes 36 works in an open gallery, a 6-stage shader pipeline, 7 brush physics modes, and bilingual documentation — developed over six months as a functioning prototype.

What the JSON preserves is not just coordinates — it is a body. A signature carries the person because those seconds of movement contain unique muscle habits. InkField makes visible what was always invisible: mid-stroke hesitation when the artist changes their mind, acceleration that reveals urgency, breathing rhythm encoded in timestamp gaps. In hundreds of recordings, the system revealed the artist habitually begins from the left — a bodily opening move he never consciously knew.

In Eastern painting, qi — the life-breath of a work — matters more than technique. InkField translates qi into data: vectors and acceleration are its manifestation; breathing space is its spirit. Each replay preserves the skeleton while ink bleeds shift and dry-brush breaks differently. The skeleton stays, but qi flows anew each time.

The Fork system enables creative inheritance. Any artist can take an existing recording, continue painting from where the creator stopped, and generate new data with full lineage tracking — transforming paintings from finished objects into living branches of an evolving creative genealogy.

An AI co-developer has been part of the process from the beginning, growing from code assistant to research partner to apprentice painter. This human-AI co-creation is a core method, not an add-on.

The artist has tested this museum-public model: collaborating with botanists at the National Taiwan Museum to resurrect the extinct Bruguiera gymnorrhiza through generative algorithms, and currently presenting Polypaths at New Taipei City Art Museum (April–July 2026) where visitors draw growth paths on-site and elementary school students learn generative logic through hands-on workshops.

With support from the Art + Technology Lab, InkField proposes to expand from one artist's practice to a multi-artist research platform: inviting 8 diverse artists to create annotated recordings, building an open dataset pairing painting intention with gesture data — a resource still rare in art historical archives and AI training corpora. The Fork system would become a public tool tested with LACMA visitors, whose on-site gestural responses provide a research dimension unavailable online. The Lab's mentor network would help refine the emotion-intention annotation schema into a rigorous, reusable method. All tools, recordings, and documentation will be published as open resources.

Computing power can be faked. The real time a person spent cannot. InkField asks: in the age of AI, what can an artist still leave behind? Perhaps only process. Perhaps only qi.

(497 words)

---

**中文翻譯：**

AI 圖像生成器知道畫看起來像什麼。但它們不知道畫家為什麼在第三筆前停下來。這就是缺失的數據——不是像素，而是身體在時間中記錄的意圖。

InkField 是一套 WebGL 數位水墨繪畫系統，將每一筆的動態——座標、時間戳、速度、壓力、墨水擴散——記錄為可重播的 JSON。每幅畫是時間事件序列：一塊意圖的化石，在每次重播時注入足夠的亂數重新呼吸。系統包含 36 件作品的開放藝廊、6 階段 shader 管線、7 種筆刷物理模式與中英雙語技術文件——歷經六個月開發，已是運作中的成熟原型。

JSON 保存的不只是座標——是一個人的身體。簽名之所以能代表一個人，是因為那幾秒鐘的運筆包含了獨一無二的肌肉習慣。完整的繪畫是更深層的肖像。InkField 使不可見的事物變得可見：筆畫中途的猶豫——當藝術家改變主意時；揭示急切的加速度；編碼在時間戳間隔中的呼吸節奏。在數百次錄製中，系統揭示了藝術家習慣性地從左邊開始——一個他從未有意識察覺的身體起手式。

在東方繪畫中，氣——作品的生命呼吸——比技巧更重要。InkField 將氣轉譯為數據：向量與加速度是其表徵；呼吸空間是其精神。每次重播保留骨架，但墨水暈染的邊緣會移動，飛白在不同角度斷裂。骨架不變，氣的流動每次不同。

Fork 系統實現了創作繼承。任何藝術家都可以取一份現有錄製，從原創者停下的地方繼續畫，並產生帶有完整血脈追蹤的新數據。這將繪畫從完成的物件轉化為創作族譜的活枝幹——公開分享、公開繼承。

一位 AI 共同開發者從一開始就參與了過程，從程式助手成長為研究夥伴，再成為學徒畫家。這種人機共創是專案的核心方法，不是附加功能。

藝術家已有博物館合作的實際經驗：與國立臺灣博物館的植物學家合作，以生成演算法重現已滅絕的紅茄苳；目前正在新北市美術館展出《植徑集》（2026 年 4 月 25 日至 7 月 5 日），觀眾在現場繪製生長路徑，國小學生透過實作工作坊以尺規模擬程式運行，學習生成邏輯。

在 Art + Technology Lab 的支持下，InkField 提議從單一藝術家的實踐擴展為多藝術家研究平台：邀請 8 位多元背景藝術家創作標註錄製，建立一套將繪畫意圖配對手勢數據的開放資料集——這類資源在藝術史檔案和 AI 訓練語料庫中仍然罕見。Fork 系統將成為公眾工具，在 LACMA 與訪客測試，現場觀眾的手勢反應將提供線上無法取得的研究維度。實驗室的導師網絡將協助把情緒意圖標註架構提煉為嚴謹、可複用的方法。所有工具、錄製與文件將作為開放資源發布。

算力可以造假，但消耗掉的真實時間無法造假。InkField 問：在 AI 時代，藝術家還能留下什麼？也許只有過程。也許只有氣。

---

## 5. Bio of the principal artist or collective

**Aluan Wang (王新仁 / 阿亂)** (b. 1982, Taichung, Taiwan) is a pioneer of Taiwan's digital and generative art scene — a creative coder and media artist with over 15 years of practice linking algorithmic systems, sound, and Eastern painting philosophy. He holds an MFA in New Media Art from Taipei National University of the Arts (TNUA) and currently serves as Art Director of akaSwap.

Wang uses code as his primary creative medium, building dynamic artistic systems through mathematical formulas that link sound and imagery. His practice explores chaos, unpredictability, and the invisible structures underlying natural phenomena. He is the first Taiwanese artist featured on Art Blocks (2021) and the first Asian artist to release long-form generative works on verse.works, bringing Taiwan's digital art energy onto the international stage.

**Selected Awards:**
- Taipei Digital Arts Festival — First Prize (2012, 2015)
- PdCon 2011, Bauhaus University Weimar, Germany — Selected (*Moving in Resonance*)
- New Taipei City Emerging Artist Award — Honorable Mention (2011)

**Selected Solo Exhibitions:**
- *Aluan Wang: Boundary Roaming* (王新仁：邊界漫遊), National Taiwan Museum of Fine Arts (2020)
- *Retold Memories* (重述的記憶), Liang Gallery / Tsung Tsai Art Center (2024)
- Solo debut in Berlin, Galerie Met (2025)

**Selected Group Exhibitions:**
- CES 2025, Las Vegas — invited by AUO for generative art display
- C-LAB Sound Art Festival — Taiwan-Korea collaborative performance (2025)
- Art Taipei 2024 — *Equinox* (春分), co-presented with Mercedes-Maybach
- Volume DAO *dialog* — Asian Generative Art Exhibition, Taipei & Seoul (2024)
- *Notes From the Ether: NFT to AI*, ArtScience Museum, Singapore (2023)
- *Generative Scene Taipei — Archipelago Hash 2023*, Hong-Gah Museum
- *Kuo Hsueh-Hu and Digital Generative Artists — A Century-Spanning Landscape Dialogue* (2023)
- Art Basel Hong Kong — Tezos × fxhash generative art exhibition (2022)
- *Logging Into Open Seas*, Greater Taipei Biennial of Contemporary Art (2022)

**Institutional Collections:**
- National Taiwan Museum — *Polypaths* (植徑集), generative plant series recreating Taiwan's native and extinct species
- Le Random — *Turner Light* and other works in the world's leading generative art archive

**Representative Works:**
*InkField* (墨域, 2025–), *Polypaths* (植徑集), *Equinox* (春分), *Chaos* trilogy (*ChaosResearch*, *ChaosMemory*, *ChaosCulture*), *Turner Light*, *Good Vibrations*

**Gallery representation:** Liang Gallery (尊彩藝術中心), Taipei

**Current Project:**
*InkField* (墨域) — a WebGL digital ink painting system that records the artist's hand gestures as replayable JSON, rebuilding the act of drawing algorithmically with each run. Co-developed with Claude (Anthropic) as research partner and co-author.

---

**中文翻譯：**

**王新仁（Aluan Wang / 阿亂）**（1982 年生，臺灣臺中），臺灣數位藝術與生成藝術領域的先鋒藝術家與創意編碼者，擁有超過 15 年連結演算系統、聲音與東方繪畫哲學的實踐經驗。國立臺北藝術大學新媒體藝術研究所碩士，現任 akaSwap 藝術總監。

王新仁以程式碼為主要創作媒材，透過數學公式連結聲音與影像，建構動態且不斷演化的藝術系統。其創作探索混沌、不可預測性，以及自然現象底層看不見的結構。他是臺灣首位登上 Art Blocks（2021）的藝術家，也是首位在 verse.works 發行長篇生成藝術作品的亞洲藝術家，將臺灣數位藝術的創作能量帶入國際視野。

**重要獎項：**
- 臺北數位藝術節 — 首獎（2012、2015）
- PdCon 2011，德國包浩斯大學威瑪 — 入選（《Moving in Resonance》）
- 新北市創作新人獎 — 優選（2011）

**精選個展：**
- 《王新仁：邊界漫遊》，國立臺灣美術館（2020）
- 《重述的記憶》，尊彩藝術中心（2024）
- 柏林 Galerie Met 藝廊，海外首次個展（2025）

**精選聯展：**
- CES 2025，拉斯維加斯 — 受友達 (AUO) 邀請展出生成藝術
- C-LAB 聲響藝術節 — 台韓共演（2025）
- 台北當代藝術博覽會 2024 —《春分》與 Mercedes-Maybach 合作特展
- Volume DAO《dialog》亞洲生成藝術展，臺北站 / 首爾站（2024）
- 《以太之音：從 NFT 到 AI》，新加坡藝術科學博物館（2023）
- 《台北生成現場：列島雜湊 2023》，鳳甲美術館
- 《郭雪湖與數位生成藝術家——跨越百年風景對話》（2023）
- 香港巴塞爾藝術展 — Tezos × fxhash 生成藝術特展（2022）
- 《登入公海》，大臺北當代藝術雙年展（2022）

**重要機構典藏：**
- 國立臺灣博物館 —《植徑集 Polypaths》，以演算法重現臺灣原生及已滅絕植物
- Le Random — 《Turner Light》等作品，全球最重要的生成藝術收藏機構

**代表作品：**
《墨域 InkField》（2025–）、《植徑集 Polypaths》、《春分 Equinox》、混沌三部曲（《Chaos Research》、《Chaos Memory》、《Chaos Culture》）、《Turner Light》、《Good Vibrations》

**畫廊代理：** 尊彩藝術中心，臺北

**當前專案：**
《墨域 InkField》— WebGL 數位水墨繪畫系統，以 JSON 格式記錄藝術家的手勢，在每次執行時以演算法重建繪畫行為。與 Claude（Anthropic）共同開發，作為研究夥伴與共同作者。

---

## 6. Artistic or creative merit (100 word maximum)

InkField shifts painting from image to action. It records not what was drawn but the act of drawing — the hesitation, acceleration, and breathing rhythm of the artist's body. In Eastern tradition, qi (life-breath) is the first principle: a work without qi is dead regardless of skill. InkField gives qi a data form: timestamp gaps become evidence of pause, velocity curves become traces of resolve. Each replay preserves the skeleton while letting the ink breathe differently — fossil and living thing at once.

(79 words)

---

**中文翻譯：**

InkField 將繪畫從圖像轉向行動。它記錄的不是畫了什麼，而是繪畫的行為本身——藝術家身體的猶豫、加速和呼吸節奏。在東方傳統中，氣（生命的呼吸）是第一法則：一件沒有氣的作品無論技巧多精湛都是死的。InkField 賦予氣一種數據形式：時間戳的間隔成為停頓的證據，速度曲線成為決心的軌跡。每次重播保留骨架，同時讓墨水以不同方式呼吸——同時是化石與活物。

---

## 7. Technology and culture dialogue (100 word maximum)

When AI can generate any image instantly, what remains uniquely human? InkField answers: time and the body. The system bridges Eastern ink painting philosophy — where the invisible space between strokes matters as much as the strokes themselves — with a contemporary machine learning blind spot: the limited availability of labeled human gesture data. By recording the artist's intention alongside every brushstroke, InkField helps build an annotation layer that remains rare in both art historical records and publicly accessible AI-oriented datasets, opening a new dialogue between embodied human expression and computational understanding.

(88 words)

---

**中文翻譯：**

當 AI 能即時生成任何圖像，什麼還是人類獨有的？InkField 的回答是：時間與身體。這套系統架起了東方水墨畫哲學——筆畫之間看不見的空間與筆畫本身同等重要——與當代機器學習盲點之間的橋樑：可被標註的人類手勢資料仍然十分有限。透過在每一筆旁記錄藝術家的意圖，InkField 逐步建立一層在藝術史記錄與可公開取得的 AI 導向資料集中都相當少見的標註層，開啟了身體化人類表達與計算理解之間的新對話。

---

## 8. Public engagement plan (100 word maximum)

At LACMA, visitors load an existing recording, continue painting from where the original artist stopped, and add their gestural data to a visible creative genealogy. This model is already proven: Polypaths at New Taipei City Art Museum (April–July 2026) invites visitors to draw growth paths on-site, with elementary school workshops teaching generative logic hands-on. Planned LACMA engagement includes 3 public painting sessions with live human-AI collaboration projected in real-time, plus 2 online workshops open worldwide. All tools, recordings, and documentation are published as open resources. InkField is free to use, with full copyright retained by each creator.

(97 words)

---

**中文翻譯：**

在 LACMA，訪客載入一份既有錄製，從原藝術家停下的地方繼續繪畫，並將手勢數據加入可見的創作族譜。此模式已經過驗證：《植徑集》正於新北市美術館展出（2026 年 4 月 25 日至 7 月 5 日），觀眾在現場繪製生長路徑，國小學生透過工作坊以尺規模擬程式運行，實作學習生成邏輯。LACMA 計畫包含 3 場公開繪畫活動（人機協作即時投影），以及 2 場面向全球的線上工作坊。所有工具、錄製與文件作為開放資源發布。InkField 免費使用，版權歸每位創作者所有。

---

## 9. Other sources of funding

The artist has self-funded six months of full-time development (October 2025 – present), building the complete system, open gallery (36+ works), and bilingual documentation. This in-kind contribution of time and expertise forms the foundation the LACMA project would build upon. No other institutional funding is currently committed to this project. The LACMA grant would be the primary external support enabling expansion from a single-artist practice to a multi-artist public research platform.

---

**中文翻譯：**

藝術家已自費投入六個月的全職開發（2025 年 10 月至今），建立完整系統、開放藝廊（36+ 件作品）與中英雙語技術文件。這些時間與專業知識的實質投入，構成 LACMA 計畫的基礎。目前沒有其他機構資金承諾用於本專案。LACMA 補助將是主要外部支持，使專案從個人創作實踐擴展為多藝術家公共研究平台。

---

## 10. Total amount requested

$50,000

---

## 11. Detailed project budget

| Category | Amount | Description |
|----------|--------|-------------|
| Principal Artist Fee | $23,000 | 18–24 month research, development, creation, and documentation |
| Invited Artists Stipends | $12,000 | 8 artists × $1,500 each (5–8 annotated recordings per artist) |
| Technology | $4,000 | AI API tokens ($3,000) + server hosting and CDN ($1,000) |
| Exhibition & Public Engagement | $5,000 | Installation materials, equipment rental, live demo setup |
| Travel | $4,000 | Invited artist travel support, on-site installation at LACMA |
| Documentation & Publication | $2,000 | Photography, video documentation, open-resource publication |
| **Total** | **$50,000** | |

**中文翻譯：**

| 類別 | 金額 | 說明 |
|------|------|------|
| 主要藝術家費用 | $23,000 | 18–24 個月研究、開發、創作與文件撰寫 |
| 邀請藝術家酬勞 | $12,000 | 8 位藝術家 × 每位 $1,500（每位 5–8 件標註錄製） |
| 技術費用 | $4,000 | AI API tokens ($3,000) + 伺服器與 CDN ($1,000) |
| 展覽與公眾參與 | $5,000 | 裝置材料、設備租借、現場展示設備 |
| 交通差旅 | $4,000 | 邀請藝術家差旅、LACMA 現場佈展 |
| 紀錄與出版 | $2,000 | 攝影、錄影紀錄、開放資源出版 |
| **總計** | **$50,000** | |

---

## 12. Supporting images / video

（最多 5 張圖片、示意圖、渲染圖等，JPEG 格式。影片以超連結附上，長度 < 5 分鐘。非必填 — 需要你提供）

---

## 13. Implementation plan with milestones, dates, and costs

### Phase 1: Artist Recruitment & Dataset Creation (Months 1–8) — $20,000

- **Month 1–3**: Recruit and onboard 8 diverse artists (calligraphers, abstract painters, performance artists, practitioners across cultural backgrounds). Develop onboarding documentation, recording protocol, and emotion-intention annotation schema. ($12,000 artist stipends + $2,000 artist fee)
- **Month 4–8**: Artists create annotated recordings (5–8 per artist, 40–64 total). Iterative refinement of annotation schema based on cross-cultural feedback. Consult with LACMA's cross-disciplinary mentor network to develop the schema into a more rigorous, documented, and reusable research method. ($2,000 technology + $4,000 artist fee)

### Phase 2: Fork System & Public Testing (Months 9–16) — $17,000

- **Month 9–12**: Develop the Fork system into a public-facing tool — museum visitors and online users can load any recording, continue painting from where the original artist stopped, and contribute their gestural data to the creative genealogy. Build fork tree visualization. ($2,000 technology + $5,000 artist fee)
- **Month 13–16**: On-site testing with LACMA visitors — 3 public painting sessions with live human-AI collaboration projected in real-time. 2 online workshops open worldwide. Gather on-site gestural response data (a research dimension unavailable online). Prepare exhibition materials. ($5,000 exhibition + $5,000 artist fee)

### Phase 3: Exhibition & Open Publication (Months 17–24) — $13,000

- **Month 17–20**: Present at LACMA — live collaborative painting sessions between human artists and AI agents, with full process projected and JSON data visualized in real-time. ($4,000 travel + $5,000 artist fee)
- **Month 21–24**: Publish all recordings, tools, annotation schema, technical documentation, and analysis scripts as open resources. Final project report and documentation. ($2,000 documentation + $2,000 artist fee)

**中文翻譯：**

### 第一階段：藝術家招募與資料集建立（第 1–8 月）— $20,000

- **第 1–3 月**：招募並引導 8 位多元背景藝術家（書法家、抽象畫家、行為藝術家、跨文化背景創作者）。撰寫引導文件、錄製規範與情緒意圖標註架構。（$12,000 藝術家酬勞 + $2,000 藝術家費用）
- **第 4–8 月**：藝術家創作標註錄製（每位 5–8 件，共 40–64 件）。根據跨文化回饋迭代完善標註架構。諮詢 LACMA 跨領域導師網絡，將架構發展為更嚴謹、可文件化、可重用的研究方法。（$2,000 技術費用 + $4,000 藝術家費用）

### 第二階段：Fork 系統與公眾測試（第 9–16 月）— $17,000

- **第 9–12 月**：將 Fork 系統開發為面向公眾的工具——博物館訪客與線上使用者可載入任何錄製，從原藝術家停下的地方繼續繪畫，並將手勢數據貢獻到創作族譜。建構 Fork 樹視覺化。（$2,000 技術費用 + $5,000 藝術家費用）
- **第 13–16 月**：LACMA 現場測試——3 場公開繪畫活動，人機協作即時投影。2 場面向全球的線上工作坊。蒐集現場觀眾的手勢反應數據（線上無法取得的研究維度）。準備展覽材料。（$5,000 展覽費用 + $5,000 藝術家費用）

### 第三階段：展覽與開放出版（第 17–24 月）— $13,000

- **第 17–20 月**：在 LACMA 展示——人類藝術家與 AI agent 的即時協作繪畫，完整過程投影並即時視覺化 JSON 數據。（$4,000 差旅費用 + $5,000 藝術家費用）
- **第 21–24 月**：發布所有錄製、工具、標註架構、技術文件與分析腳本作為開放資源。最終專案報告與紀錄。（$2,000 紀錄出版 + $2,000 藝術家費用）

---
