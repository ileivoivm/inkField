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
- **Projects that look already complete** — the Lab wants "half-baked" proposals where the collaboration with technology partners and the museum itself shapes the outcome

### Why This Application Should Work (Self-Assessment against the 4 Criteria)

| Official Criterion | InkField's Match |
|-------------------|-----------------|
| **① Artist-led + artistic merit** | Led by Aluan Wang — 15+ years as pioneer of Taiwan's generative art scene, first Taiwanese artist on Art Blocks, solo at National Taiwan Museum of Fine Arts, Art Basel HK, Singapore ArtScience Museum. InkField is rooted in Eastern ink painting philosophy (qi, breath, emptiness) — not a tech demo but a deeply personal artistic practice. |
| **② Explores emerging technology** | Human-AI co-creation documented in 6+ months of git commits. The open research questions — whether the annotation schema survives cross-cultural stress, whether JSON can capture the difference between a Zen circle and an Abstract Expressionist splash — require dialogue with AI alignment researchers and embodied cognition scientists. The Lab's bridge to technology partners (including Anthropic) makes this possible. |
| **③ Models, methods, data for others** | Open Creative License (free to use, full copyright to creator). An open dataset pairing human painting intention with gesture data — still rare in both art historical and AI-oriented corpora. Fork system as a new model for creative inheritance. Annotation schema published with its documented failure points — what didn't work is as valuable as what did. Dialogue with LACMA conservation on archiving time-based gesture works. |
| **④ Public demos & collaboration** | LACMA as live laboratory: visitors paint into a system that may surprise or fail. Fork system lets anyone continue from where any artist stopped. 3 on-site experiment sessions + 2 online workshops. PWA works offline on iPad. Browser-based — works on any device worldwide. Outcomes genuinely unknown; system failures documented as findings. |

### Key Narrative Angles

- **Half-baked by design**: A working prototype exists, but the core research questions are wide open. The proposal is not "fund a finished product" but "help us discover what breaks when this system meets the real world." This aligns with the Lab's preference for proposals that embrace uncertainty.
- **Anthropic as dialogue partner**: Anthropic sponsors the LACMA Art + Technology Lab. Claude (Anthropic's AI) is simultaneously a co-creator on InkField — documented in git commits as Co-Authored-By. The artist seeks to bring gesture-intention data directly to the scientists who build these models, asking: what does this look like to an alignment researcher?
- **Museum as institution, not venue**: Proposing dialogue with LACMA's conservation and collections information departments — how should a museum archive a painting that is not an image but a time-based sequence of gestures? This challenges cataloguing standards, echoing projects like Gala Porras-Kim's engagement with museum data systems.
- **Missing data thesis**: AI image generators know what paintings look like but not why the artist paused. InkField explores an annotation layer that remains rare in both art historical records and AI-oriented datasets.
- **Qi as data**: In Eastern painting, qi (life-breath) > technique. InkField translates qi into vectors, acceleration, and breathing space between strokes.
- **Fork as inheritance**: Not copying — standing on someone's path and continuing. A departure from copyright thinking toward creative genealogy.
- **Safe to fail**: The proposal explicitly embraces system breakdown, schema collapse, and unpredictable cultural variables as part of the investigation — not obstacles to overcome but findings to document.

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

InkField is a WebGL ink painting system that captures every brushstroke — coordinates, timestamps, velocity, pressure, ink diffusion — as replayable JSON. Each painting becomes a fossil of intention that replays with enough randomness to breathe differently each time. A working prototype exists. The research questions remain wide open.

What JSON preserves is not coordinates — it is a body. A signature carries the person because those seconds of movement contain unique muscle habits. InkField makes visible what was always invisible: mid-stroke hesitation, acceleration that reveals urgency, breathing rhythm in timestamp gaps. In hundreds of recordings, the system revealed the artist habitually begins from the left — a bodily opening move he never consciously knew.

But this is one artist's body. What happens when eight artists from radically different traditions enter the system? Will a calligrapher's qi register in the same data channels as a performance artist's gesture? Can JSON capture the difference between a Zen circle and an Abstract Expressionist splash — or will the annotation schema collapse under cultural variables it was never designed for? These are not rhetorical questions. We genuinely do not know.

The Fork system introduces further unknowns. Any artist can load an existing recording, continue painting from where the creator stopped, and generate new data with full lineage tracking. When a fork tree grows across cultural boundaries — when an AI agent forks a human's hesitation and a stranger forks the AI's response — what emerges may be unrecognizable. The system may break. That is part of the investigation.

An AI co-developer has been part of the process from the beginning, documented in git commits as co-author. This raises a question for the scientists who build these models: what does a dataset of human painting intention — pauses, pressure curves, breathing gaps — look like to an AI alignment researcher? How does it challenge how they think about embodied cognition? The Lab's role bridging artists and technology partners makes this dialogue possible.

There is also an institutional question: how should a museum archive a painting that is not an image but a time-based sequence of gestures? The artist proposes working with LACMA's conservation and collections information departments to test whether InkField's annotation schema can challenge or expand existing cataloguing standards — turning the project into a dialogue with the museum as institution, not just as venue.

The artist has tested museum-public engagement: collaborating with botanists at the National Taiwan Museum, and currently presenting Polypaths at New Taipei City Art Museum (April–July 2026) with on-site visitor participation and elementary school workshops. LACMA would be the site where this practice meets its hardest questions.

Computing power can be faked. The real time a person spent cannot.

(486 words)

---

**中文翻譯：**

AI 圖像生成器知道畫看起來像什麼。但它們不知道畫家為什麼在第三筆前停下來。這就是缺失的數據——不是像素，而是身體在時間中記錄的意圖。

InkField 是一套 WebGL 水墨繪畫系統，將每一筆——座標、時間戳、速度、壓力、墨水擴散——記錄為可重播的 JSON。每幅畫成為一塊意圖的化石，在每次重播時注入足夠的亂數重新呼吸。原型已在運作。研究問題仍然完全敞開。

JSON 保存的不只是座標——是一個人的身體。簽名之所以能代表一個人，是因為那幾秒鐘的運筆包含了獨一無二的肌肉習慣。InkField 使不可見的事物變得可見：筆畫中途的猶豫、揭示急切的加速度、編碼在時間戳間隔中的呼吸節奏。在數百次錄製中，系統揭示了藝術家習慣性地從左邊開始——一個他從未有意識察覺的身體起手式。

但這是一個藝術家的身體。當八位來自截然不同傳統的藝術家進入系統時會發生什麼？書法家的「氣」會在同樣的數據通道中顯現嗎？JSON 能捕捉禪圓與抽象表現主義潑墨之間的根本差異嗎——還是標註架構會在它從未被設計來處理的文化變數下崩潰？這些不是修辭問題。我們真的不知道。

Fork 系統帶來更多未知。任何藝術家都可以載入一份現有錄製，從原創者停下的地方繼續畫，並產生帶有完整血脈追蹤的新數據。當 Fork 樹跨越文化邊界生長——當 AI agent fork 了人類的猶豫、而一位陌生人又 fork 了 AI 的回應——產生的東西可能面目全非。系統可能會崩潰。這本身就是研究的一部分。

一位 AI 共同開發者從一開始就參與過程，在 git commits 中以共同作者記錄。這引發一個藝術家想直接帶給模型建造者的問題：一份人類繪畫意圖的數據集——停頓、壓力曲線、呼吸間隔——在 AI alignment 研究者眼中是什麼？它如何挑戰他們對具身認知的思考方式？實驗室作為藝術家與科技夥伴之間的橋樑，使這場對話成為可能。

還有一個體制性問題：博物館應該如何典藏一幅不是圖像、而是時間性手勢序列的繪畫？藝術家提議與 LACMA 的修復部門和典藏資訊部門合作，測試 InkField 的標註架構能否挑戰或擴充現有的建檔標準——將計畫從在博物館「展出」，轉化為與博物館「體制」的深度對話。

藝術家已有博物館公眾參與的實際經驗：與國立臺灣博物館的植物學家合作，以及目前在新北市美術館展出《植徑集》（2026 年 4 月至 7 月），觀眾在現場參與創作，國小學生透過工作坊學習生成邏輯。LACMA 將是這個實踐遇見最困難問題的場域。

算力可以造假，但消耗掉的真實時間無法造假。

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

When AI can generate any image instantly, what remains uniquely human? InkField answers: time and the body. The system bridges Eastern ink painting philosophy — where space between strokes matters as much as the strokes — with a question for AI researchers: what does a dataset of human painting intention look like to an alignment scientist? The gesture data InkField collects — pauses, pressure curves, breathing gaps — sits in a blind spot between art history and machine learning. The artist seeks to bring this data into direct dialogue with the scientists who shape these models.

(96 words)

---

**中文翻譯：**

當 AI 能即時生成任何圖像，什麼還是人類獨有的？InkField 的回答是：時間與身體。這套系統架起了東方水墨畫哲學——筆畫之間的空間與筆畫本身同等重要——與一個拋給 AI 研究者的問題之間的橋樑：一份人類繪畫意圖的數據集，在 alignment 科學家眼中是什麼？InkField 收集的手勢數據——停頓、壓力曲線、呼吸間隔——正處於藝術史與機器學習之間的盲區。藝術家要把這份數據帶入與塑造這些模型的科學家的直接對話。

---

## 8. Public engagement plan (100 word maximum)

LACMA becomes a temporary laboratory. Visitors load an existing recording, continue painting from where the artist stopped, and feed gestural data into a system that may surprise or fail — testing whether the annotation schema holds across untrained hands. Three on-site sessions run as live experiments, not demonstrations: human-AI collaboration projected in real-time, outcomes genuinely unknown. Two online workshops extend worldwide. This model is proven: Polypaths at New Taipei City Art Museum (April–July 2026) runs visitor participation and elementary workshops. All tools, recordings, and findings are published as open resources. InkField is free to use, copyright retained by each creator.

(100 words)

---

**中文翻譯：**

LACMA 化身臨時實驗室。訪客載入一份既有錄製，從原藝術家停下的地方繼續繪畫，將手勢數據餵入一個可能帶來驚喜、也可能失敗的系統——測試標註架構能否承受未經訓練的雙手。三場現場活動以「活體實驗」而非「展示」的形式進行：人機協作即時投影，結果真正未知。兩場線上工作坊向全球開放。此模式已經驗證：《植徑集》正於新北市美術館展出（2026 年 4 月至 7 月），觀眾直接參與，國小學生透過工作坊學習生成邏輯。所有工具、錄製與研究發現作為開放資源發布。InkField 免費使用，版權歸每位創作者所有。

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

### Phase 1: Artist Recruitment & Open Questions (Months 1–8) — $20,000

- **Month 1–3**: Recruit and onboard 8 diverse artists (calligraphers, abstract painters, performance artists, practitioners across cultural backgrounds). Develop recording protocol and emotion-intention annotation schema — with the explicit expectation that it will need to be broken and rebuilt as cross-cultural edge cases emerge. ($12,000 artist stipends + $2,000 artist fee)
- **Month 4–8**: Artists create annotated recordings (5–8 per artist, 40–64 total). Iterative stress-testing of annotation schema against cross-cultural feedback. Consult with LACMA's mentor network and technology partners to identify where the schema fails — which gestures, pauses, or cultural contexts resist capture. ($2,000 technology + $4,000 artist fee)

### Phase 2: Fork System & Public Stress-Testing (Months 9–16) — $17,000

- **Month 9–12**: Develop Fork system into a public-facing tool. Begin dialogue with LACMA's conservation and collections information departments: how should a museum archive a painting that is not an image but a time-based gesture sequence? Can InkField's annotation schema challenge or expand existing cataloguing standards? ($2,000 technology + $5,000 artist fee)
- **Month 13–16**: LACMA as live laboratory — 3 public sessions where visitors paint into the system, generating data that may break assumptions built during Phase 1. 2 online workshops extend worldwide. Outcomes are genuinely unknown; system failures are documented as findings, not hidden. ($5,000 exhibition + $5,000 artist fee)

### Phase 3: Live Experiment & Open Publication (Months 17–24) — $13,000

- **Month 17–20**: Large-scale live experiment at LACMA — human artists and AI agents paint collaboratively in real-time, with full process projected and JSON data visualized. The audience sees not a finished work but a system under stress, responding to inputs it was not designed for. ($4,000 travel + $5,000 artist fee)
- **Month 21–24**: Publish all recordings, tools, annotation schema (including its documented failure points), technical findings, and analysis scripts as open resources. Final report emphasizes what was learned from what did not work. ($2,000 documentation + $2,000 artist fee)

**中文翻譯：**

### 第一階段：藝術家招募與開放問題（第 1–8 月）— $20,000

- **第 1–3 月**：招募並引導 8 位多元背景藝術家（書法家、抽象畫家、行為藝術家、跨文化背景創作者）。制定錄製規範與情緒意圖標註架構——明確預期架構將在跨文化邊界案例出現時被打破並重建。（$12,000 藝術家酬勞 + $2,000 藝術家費用）
- **第 4–8 月**：藝術家創作標註錄製（每位 5–8 件，共 40–64 件）。以跨文化回饋對標註架構進行壓力測試。諮詢 LACMA 導師網絡與科技夥伴，找出架構失敗的環節——哪些手勢、停頓或文化語境抵抗捕捉。（$2,000 技術費用 + $4,000 藝術家費用）

### 第二階段：Fork 系統與公眾壓力測試（第 9–16 月）— $17,000

- **第 9–12 月**：將 Fork 系統開發為面向公眾的工具。啟動與 LACMA 修復部門及典藏資訊部門的對話：博物館應如何典藏一幅不是圖像、而是時間性手勢序列的繪畫？InkField 的標註架構能否挑戰或擴充現有的建檔標準？（$2,000 技術費用 + $5,000 藝術家費用）
- **第 13–16 月**：LACMA 作為活體實驗室——3 場公開活動，訪客直接在系統中繪畫，產生的數據可能推翻第一階段建立的假設。2 場線上工作坊向全球開放。結果真正未知；系統失敗被記錄為研究發現，而非隱藏。（$5,000 展覽費用 + $5,000 藝術家費用）

### 第三階段：活體實驗與開放出版（第 17–24 月）— $13,000

- **第 17–20 月**：在 LACMA 進行大規模活體實驗——人類藝術家與 AI agent 即時協作繪畫，完整過程投影並視覺化 JSON 數據。觀眾看到的不是完成的作品，而是一個正在承受壓力的系統，回應它並非為之設計的輸入。（$4,000 差旅費用 + $5,000 藝術家費用）
- **第 21–24 月**：發布所有錄製、工具、標註架構（包括其記錄在案的失敗點）、技術發現與分析腳本作為開放資源。最終報告強調從失敗中學到了什麼。（$2,000 紀錄出版 + $2,000 藝術家費用）

---
