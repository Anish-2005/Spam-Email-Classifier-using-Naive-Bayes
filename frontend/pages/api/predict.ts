import type { NextApiRequest, NextApiResponse } from 'next'
import fs from 'fs'
import path from 'path'

type ModelJson = {
  vocabulary: Record<string, number>
  idf: number[]
  feature_log_prob: number[][]
  class_log_prior: number[]
  classes: string[]
}

const STOPWORDS = new Set([
  'a','about','above','after','again','against','all','am','an','and','any','are','as','at','be','because','been','before','being','below','between','both','but','by','could','did','do','does','doing','down','during','each','few','for','from','further','had','has','have','having','he','her','here','hers','herself','him','himself','his','how','i','if','in','into','is','it','its','itself','just','me','more','most','my','myself','no','nor','not','now','of','off','on','once','only','or','other','our','ours','ourselves','out','over','own','same','she','should','so','some','such','than','that','the','their','theirs','them','themselves','then','there','these','they','this','those','through','to','too','under','until','up','very','was','we','were','what','when','where','which','while','who','whom','why','with','you','your','yours','yourself','yourselves'
])

let modelCache: ModelJson | null = null

function loadModel(): ModelJson {
  if (modelCache) return modelCache
  const p = path.join(process.cwd(), 'public', 'model', 'model.json')
  if (!fs.existsSync(p)) throw new Error('Model JSON not found. Run export_model_json.py to create public/model/model.json')
  const raw = fs.readFileSync(p, 'utf8')
  modelCache = JSON.parse(raw) as ModelJson
  return modelCache!
}

function tokenize(text: string) {
  return text
    .toLowerCase()
    .split(/\W+/)
    .filter(Boolean)
    .filter((t) => !STOPWORDS.has(t))
}

function vectorize(tokens: string[], vocab: Record<string, number>, idf: number[]) {
  const V = Object.keys(vocab).length
  const vec = new Array<number>(V).fill(0)
  for (const t of tokens) {
    const idx = (vocab as any)[t]
    if (idx !== undefined) vec[idx] += 1
  }
  // apply idf
  for (let i = 0; i < V; i++) {
    vec[i] = vec[i] * (idf[i] || 1)
  }
  // L2 normalize
  const norm = Math.sqrt(vec.reduce((s, v) => s + v * v, 0))
  if (norm > 0) {
    for (let i = 0; i < V; i++) vec[i] = vec[i] / norm
  }
  return vec
}

function dot(a: number[], b: number[]) {
  let s = 0
  for (let i = 0; i < a.length; i++) s += a[i] * b[i]
  return s
}

function softmax(arr: number[]) {
  const max = Math.max(...arr)
  const exps = arr.map((v) => Math.exp(v - max))
  const sum = exps.reduce((s, v) => s + v, 0)
  return exps.map((e) => e / sum)
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()
  const body = req.body
  if (!body || typeof body.text !== 'string') return res.status(400).json({ error: 'missing text' })

  let m: ModelJson
  try {
    m = loadModel()
  } catch (err: any) {
    return res.status(500).json({ error: 'model_not_loaded', detail: String(err) })
  }

  const tokens = tokenize(body.text)
  const x = vectorize(tokens, m.vocabulary, m.idf)

  // compute class scores: class_log_prior + x dot feature_log_prob[class]
  const scores = m.class_log_prior.map((prior, ci) => {
    const flp = m.feature_log_prob[ci]
    return prior + dot(x, flp)
  })
  const probs = softmax(scores)
  // find index of "spam"
  const spamIndex = m.classes.findIndex((c) => c.toLowerCase() === 'spam')
  const spamProb = spamIndex >= 0 ? probs[spamIndex] : probs[probs.length - 1]
  const label = spamProb >= 0.5 ? 'spam' : 'ham'

  return res.json({ label, probability: Number(spamProb) })
}
