export const meta = {
  name: 'weekly-content-crew',
  description: 'Orchestrator + lead/worker crew: research, draft bilingual essay+journal, verify, open a PR',
  whenToUse: 'Run on-demand when you want a new weekly essay + journal piece researched, drafted, and PR-ready.',
  phases: [
    { title: 'Research' },
    { title: 'Draft' },
    { title: 'Verify' },
    { title: 'Publish' },
  ],
}

const REPO = 'C:\\Users\\muhaabubakar\\PyCharmMiscProject\\cyber-pujangga'
const SITE = REPO + '\\cyber-pujangga-site'

const RAW_TOPIC_SCHEMA = {
  type: 'object',
  properties: {
    found: { type: 'boolean' },
    title: { type: 'string' },
    summary: { type: 'string' },
    sourceUrl: { type: 'string' },
    facts: { type: 'array', items: { type: 'string' } },
  },
  required: ['found'],
}

const RESEARCH_SCHEMA = {
  type: 'object',
  properties: {
    found: { type: 'boolean' },
    reason: { type: 'string' },
    essayTopic: { type: 'object', properties: { title: { type: 'string' }, summary: { type: 'string' }, sourceUrl: { type: 'string' }, facts: { type: 'array', items: { type: 'string' } } } },
    journalTopic: { type: 'object', properties: { title: { type: 'string' }, summary: { type: 'string' }, sourceUrl: { type: 'string' }, facts: { type: 'array', items: { type: 'string' } } } },
  },
  required: ['found'],
}

const EN_DRAFT_SCHEMA = { type: 'object', properties: { filePath: { type: 'string' }, titleEn: { type: 'string' } }, required: ['filePath'] }
const BM_DRAFT_SCHEMA = { type: 'object', properties: { filePath: { type: 'string' }, enFilePath: { type: 'string' } }, required: ['filePath'] }
const DRAFT_SCHEMA = { type: 'object', properties: { success: { type: 'boolean' }, notes: { type: 'string' }, filesWritten: { type: 'array', items: { type: 'string' } } }, required: ['success'] }
const VERIFY_SCHEMA = { type: 'object', properties: { passed: { type: 'boolean' }, checkOutput: { type: 'string' }, buildOutput: { type: 'string' } }, required: ['passed'] }
const PUBLISH_SCHEMA = { type: 'object', properties: { prUrl: { type: 'string' }, branch: { type: 'string' } }, required: ['prUrl', 'branch'] }

// ── Research: 2 workers (fetch only) -> 1 lead (judgment only) ────────────
phase('Research')
const year = args.today.slice(0, 4)

const [currentEventsRaw, literatureRaw] = await parallel([
  () => agent(`You are a research WORKER for Cyber Pujangga's weekly content crew. Your ONLY job: fetch https://en.wikipedia.org/wiki/Portal:Current_events with WebFetch, identify the single most notable non-tabloid, non-graphic world event/theme from the last ~7 days, then WebFetch the SPECIFIC Wikipedia article about that event directly (not just the portal blurb) to gather verified facts. Return title, a 2-3 sentence summary, sourceUrl, and 4-6 verified facts as plain strings. Do not judge "suitability" beyond avoiding graphic content — that's the lead's job. If nothing is fetchable, return found=false.`, { phase: 'Research', label: 'worker:current-events', schema: RAW_TOPIC_SCHEMA }),
  () => agent(`You are a research WORKER for Cyber Pujangga's weekly content crew. Your ONLY job: fetch https://en.wikipedia.org/wiki/${year}_in_literature with WebFetch (if 404, instead fetch https://en.wikipedia.org/wiki/Special:Search?search=${year}+in+literature&fulltext=1 to find the right page), identify one notable current literary event (prize, translation milestone, anniversary, notable release), then WebFetch the SPECIFIC article about it directly to gather verified facts. Return title, a 2-3 sentence summary, sourceUrl, and 4-6 verified facts as plain strings. If nothing is fetchable, return found=false.

IMPORTANT exclusion: pick a topic about the literary craft/work itself, not about real-world subject matter it depicts. AVOID any book/event whose main subject is real criminal allegations, trafficking, sexual abuse, or an ongoing legal dispute involving named real people — even if it's the most prominent recent prize-winner. If the top candidate on the page has that kind of subject matter, look further down the same page for a different notable literary event instead (a translation milestone, a different prize/category, a classic-work anniversary, another notable release) rather than defaulting to it.`, { phase: 'Research', label: 'worker:literature', schema: RAW_TOPIC_SCHEMA }),
])

const research = await agent(`You are the LEAD for the Research phase of Cyber Pujangga's weekly content crew. Two workers already fetched raw candidates from Wikipedia — you fetched nothing yourself. Your job is judgment, not research.

Worker A (current events) raw output: ${JSON.stringify(currentEventsRaw)}
Worker B (literature) raw output: ${JSON.stringify(literatureRaw)}

Before deciding anything else, check for DUPLICATE COVERAGE: use Glob to list ${SITE}\\src\\content\\essays\\en\\*.md and ${SITE}\\src\\content\\journal\\en\\*.md, then read each file's frontmatter "title" (skimming the first ~10 lines is enough). Reject a candidate (found=false, reason naming which one and why) if it covers substantially the same real-world event/book/topic as anything already published — even under a different title or angle. Use judgment, not exact string matching: two pieces about the same prize-winning book are a duplicate even with different titles.

If it passes the duplicate check, also decide: is Worker A's topic fit for a quiet, contemplative PERSONAL JOURNAL reflection (reject if graphic, inflammatory, or too thin on facts)? Is Worker B's topic fit for a reflective LITERARY ESSAY about reading/language/literature?

If both pass both checks, return found=true with essayTopic = Worker B's candidate and journalTopic = Worker A's candidate (you may tighten wording, but never invent facts beyond what the workers gathered). If either fails any check, return found=false with a clear reason — do not force a bad or duplicate topic through.`, { phase: 'Research', label: 'lead:research', schema: RESEARCH_SCHEMA })

if (!research || !research.found) return { status: 'no_topic', reason: research?.reason }
log(`Lead approved — essay: "${research.essayTopic.title}" / journal: "${research.journalTopic.title}"`)

// ── Draft: per piece, worker:en -> worker:bm -> lead:draft (validate only) ─
phase('Draft')
function enWorkerPrompt(kind, topic) {
  const isEssay = kind === 'essay'
  const dir = isEssay ? 'essays' : 'journal'
  return `You are a drafting WORKER for Cyber Pujangga. Your ONLY job: write the ENGLISH ${isEssay ? 'essay' : 'journal entry'} file. A separate worker handles the Bahasa Melayu adaptation from what you write — don't write BM yourself.

Topic: ${topic.title}. Summary: ${topic.summary}
Verified facts (use only these, synthesize in your own words, never quote verbatim): ${(topic.facts || []).map(f => '- ' + f).join(' ')}

First read ${REPO}\\STYLE.md (voice) and ${SITE}\\src\\content.config.ts (exact frontmatter schema for '${dir}'), and one existing file under ${SITE}\\src\\content\\${dir}\\en\\ for tone/formatting.

Target path: ${SITE}\\src\\content\\${dir}\\en\\${isEssay ? '<slug>.md' : args.today + '-<slug>.md'}
Before writing, check whether a file already exists at that exact path. If it does, pick a different, more specific slug instead — NEVER overwrite an existing file, even if the content would differ.
Length: ${isEssay ? '600-900' : '300-500'} words. ${isEssay ? 'Pick quiet-personal or literary-critical register from STYLE.md, whichever fits.' : 'Quiet-personal register always; include a mood field.'}
pubDate: ${isEssay ? args.today + 'T09:00:00Z' : args.today}${isEssay ? '' : ' (and date field, same value)'}. author: "Cyber Pujangga". 3 English tags.

Return the exact file path you wrote, plus the title.`
}
function bmWorkerPrompt(kind, enResult) {
  const isEssay = kind === 'essay'
  const dir = isEssay ? 'essays' : 'journal'
  return `You are a drafting WORKER for Cyber Pujangga. Your ONLY job: write the BAHASA MELAYU adaptation of an English piece another worker already wrote — no research needed.

Read the English file at: ${enResult?.filePath}
Write a NATURAL adaptation, not a literal translation — same reflection and structure, phrased as a native Malay writer would.

First read ${SITE}\\src\\content.config.ts (exact frontmatter schema for '${dir}') and one existing file under ${SITE}\\src\\content\\${dir}\\ms\\ for tone/formatting.

Target path: ${SITE}\\src\\content\\${dir}\\ms\\${isEssay ? '<bm-slug>.md' : args.today + '-<bm-slug>.md'}
Before writing, check whether a file already exists at that exact path. If it does, pick a different, more specific slug instead — NEVER overwrite an existing file.
Same length range and frontmatter shape, Malay tags and description.

Return the exact file path you wrote, plus the English file path you adapted from.`
}
function draftLeadPrompt(kind, bmResult) {
  return `You are the LEAD for the Draft phase (${kind}) of Cyber Pujangga's weekly content crew. Two workers already wrote an English file and a Bahasa Melayu adaptation — you wrote neither. Your job is validation, not creation.

BM worker reported: ${JSON.stringify(bmResult)}

Read both files (the EN path it adapted from, and the BM path it wrote). Check: both exist, both have complete required frontmatter per ${SITE}\\src\\content.config.ts, both fall within ${kind === 'essay' ? '600-900 words' : '300-500 words'}, and the BM version reads as a natural adaptation, not a literal translation or leftover English.

Also run "git status" (PowerShell, from ${REPO}) and confirm both files show as untracked/new (not "modified") — if either shows as a modification to a pre-existing tracked file, that means a worker overwrote existing content. Treat that as a failure regardless of content quality.

Return success=true with filesWritten=[enPath, bmPath] if everything checks out. If something's broken (including an overwrite), return success=false with notes explaining exactly what — don't fix it yourself.`
}

const draftItems = [
  { kind: 'essay', topic: research.essayTopic },
  { kind: 'journal', topic: research.journalTopic },
]
const draftResults = await pipeline(
  draftItems,
  (item) => agent(enWorkerPrompt(item.kind, item.topic), { phase: 'Draft', label: `worker:en:${item.kind}`, schema: EN_DRAFT_SCHEMA }),
  (enResult, item) => agent(bmWorkerPrompt(item.kind, enResult), { phase: 'Draft', label: `worker:bm:${item.kind}`, schema: BM_DRAFT_SCHEMA }),
  (bmResult, item) => agent(draftLeadPrompt(item.kind, bmResult), { phase: 'Draft', label: `lead:draft:${item.kind}`, schema: DRAFT_SCHEMA }),
)

const [essayDraft, journalDraft] = draftResults
if (!essayDraft?.success || !journalDraft?.success) return { status: 'draft_failed', essayDraft, journalDraft }
const allFiles = [...(essayDraft.filesWritten || []), ...(journalDraft.filesWritten || [])]

// ── Verify + Publish: flat, single-agent, directly under the Orchestrator ─
phase('Verify')
const verify = await agent(`From ${SITE} via PowerShell: if node_modules is missing, "npm install" first. Then "npm run check" then "npm run build". passed=true only if both exit 0 with no errors. Include error tails in checkOutput/buildOutput on failure.`, { phase: 'Verify', schema: VERIFY_SCHEMA })
if (!verify?.passed) return { status: 'build_failed', checkOutput: verify?.checkOutput, buildOutput: verify?.buildOutput }

phase('Publish')
const publish = await agent(`From ${REPO} via git + gh CLI:
1. "git status" — expect exactly these files, ALL as untracked/new (never "modified"): ${allFiles.join(', ')}. If any of them shows as "modified" instead of new, STOP and return publish_failed via an empty prUrl — do not commit, do not overwrite existing content, no exceptions. If package-lock.json or public/_redirects also show modified, "git restore" ONLY those two (incidental install/build side effects) — nothing else.
2. Branch content/weekly-${args.today} from master.
3. Commit exactly these files: ${allFiles.join(', ')}. Message: "content: weekly pieces for ${args.today} (essay + journal, EN/BM)".
4. Push, then "gh pr create" to base master with a body naming both topics + 1-sentence rationale each, noting BM versions are adaptations, and that this was produced by an orchestrator + lead/worker agent crew (Research: 2 workers + 1 lead; Draft: worker:en -> worker:bm -> lead:draft per piece). Do NOT merge.
Return the PR URL and branch name.`, { phase: 'Publish', schema: PUBLISH_SCHEMA })

if (!publish?.prUrl) return { status: 'publish_failed', publish }
return { status: 'pr_opened', prUrl: publish.prUrl, branch: publish.branch, essayTopic: research.essayTopic.title, journalTopic: research.journalTopic.title }
