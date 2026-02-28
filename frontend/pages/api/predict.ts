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
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'as', 'at', 'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'could', 'did', 'do', 'does', 'doing', 'down', 'during', 'each', 'few', 'for', 'from', 'further', 'had', 'has', 'have', 'having', 'he', 'her', 'here', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'i', 'if', 'in', 'into', 'is', 'it', 'its', 'itself', 'just', 'me', 'more', 'most', 'my', 'myself', 'no', 'nor', 'not', 'now', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'our', 'ours', 'ourselves', 'out', 'over', 'own', 'same', 'she', 'should', 'so', 'some', 'such', 'than', 'that', 'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'these', 'they', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'we', 'were', 'what', 'when', 'where', 'which', 'while', 'who', 'whom', 'why', 'with', 'you', 'your', 'yours', 'yourself', 'yourselves'
])

const MAX_TEXT_LENGTH = 50_000 // 50KB max input

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
  const vec = new Float64Array(V) // Use typed array for better performance
  for (const t of tokens) {
    const idx = vocab[t]
    if (idx !== undefined) vec[idx] += 1
  }
  // Apply IDF weights
  for (let i = 0; i < V; i++) {
    vec[i] *= (idf[i] || 1)
  }
  // L2 normalize
  let norm = 0
  for (let i = 0; i < V; i++) norm += vec[i] * vec[i]
  norm = Math.sqrt(norm)
  if (norm > 0) {
    for (let i = 0; i < V; i++) vec[i] /= norm
  }
  return vec
}

function dot(a: Float64Array | number[], b: number[]) {
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
  // Only allow POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST')
    return res.status(405).json({ error: 'method_not_allowed', detail: 'Only POST requests are accepted' })
  }

  const startTime = performance.now()
  const body = req.body

  // Input validation
  if (!body || typeof body.text !== 'string') {
    return res.status(400).json({ error: 'invalid_input', detail: 'Request body must contain a "text" string field' })
  }

  const text = body.text.trim()
  if (text.length === 0) {
    return res.status(400).json({ error: 'empty_input', detail: 'Text cannot be empty' })
  }
  if (text.length > MAX_TEXT_LENGTH) {
    return res.status(400).json({ error: 'input_too_large', detail: `Text exceeds maximum length of ${MAX_TEXT_LENGTH} characters` })
  }

  // Load model
  let m: ModelJson
  try {
    m = loadModel()
  } catch (err: any) {
    return res.status(500).json({ error: 'model_not_loaded', detail: String(err) })
  }

  // Classify
  const tokens = tokenize(text)
  const x = vectorize(tokens, m.vocabulary, m.idf)

  const scores = m.class_log_prior.map((prior, ci) => {
    return prior + dot(x, m.feature_log_prob[ci])
  })
  const probs = softmax(scores)

  const spamIndex = m.classes.findIndex((c) => c.toLowerCase() === 'spam')
  const spamProb = spamIndex >= 0 ? probs[spamIndex] : probs[probs.length - 1]
  const label = spamProb >= 0.5 ? 'spam' : 'ham'

  const elapsed = Math.round((performance.now() - startTime) * 100) / 100

  // Set performance & caching headers
  res.setHeader('X-Response-Time', `${elapsed}ms`)
  res.setHeader('Cache-Control', 'no-store') // Don't cache predictions

  return res.json({
    label,
    probability: Number(spamProb),
    meta: {
      tokens: tokens.length,
      elapsed_ms: elapsed,
      model_version: '2.0',
    },
  })
}
