/**
 * Speakmate API contract (analysis) — strict, dependency-free.
 * This file is the single source of truth for the client-side shapes.
 *
 * Contract (frozen):
 *  - scores:  { vocabulary, filler_control, clarity_structure, idea_quality, pacing, overall } 0–100
 *  - feedback:{ vocabulary, filler, clarity, idea, actions[] }
 *  - assets:  { transcript_key }
 *  - AnalyzeResponse: { scores; feedback; assets }
 */

//////////////////////////
// Primitive validators //
//////////////////////////

/** Narrow to a plain object (not null, not array). */
function isRecord(v: unknown): v is Record<string, unknown> {
    return typeof v === "object" && v !== null && !Array.isArray(v);
  }
  
  /** Runtime guard: number within inclusive range. */
  function isNumberInRange(v: unknown, min: number, max: number): v is number {
    return typeof v === "number" && Number.isFinite(v) && v >= min && v <= max;
  }
  
  /** Runtime guard: string */
  function isString(v: unknown): v is string {
    return typeof v === "string";
  }
  
  /** Runtime guard: string[] */
  function isStringArray(v: unknown): v is string[] {
    return Array.isArray(v) && v.every(isString);
  }
  
  /////////////////////////
  // Contract: type defs //
  /////////////////////////
  
  export type Score0to100 = number; // TS cannot enforce ranges; validated at runtime.
  
  /** Exact score keys in this system (stable API surface). */
  export const scoreKeys = [
    "vocabulary",
    "filler_control",
    "clarity_structure",
    "idea_quality",
    "pacing",
    "overall",
  ] as const;
  export type ScoreKey = typeof scoreKeys[number];
  
  export interface Scores {
    vocabulary: Score0to100;
    filler_control: Score0to100;
    clarity_structure: Score0to100;
    idea_quality: Score0to100;
    pacing: Score0to100;
    overall: Score0to100;
  }
  
  export interface Feedback {
    vocabulary: string;
    filler: string;
    clarity: string;
    idea: string;
    actions: string[];
  }
  
  export interface Assets {
    /** Storage reference to the full transcript blob/object. */
    transcript_key: string;
  }
  
  export interface AnalyzeResponse {
    scores: Scores;
    feedback: Feedback;
    assets: Assets;
  }
  
  ///////////////////////////
  // Parse / validate utils //
  ///////////////////////////
  
  export class SchemaError extends Error {
    constructor(message: string, public readonly path: string[] = []) {
      super(path.length ? `${message} @ ${path.join(".")}` : message);
      this.name = "SchemaError";
    }
  }
  
  /** Validate Scores object at runtime (throws SchemaError on failure). */
  export function parseScores(input: unknown, path: string[] = ["scores"]): Scores {
    if (!isRecord(input)) throw new SchemaError("Expected object", path);
  
    const out: Partial<Scores> = {};
    for (const key of scoreKeys) {
      const v = input[key];
      if (!isNumberInRange(v, 0, 100)) {
        throw new SchemaError("Expected number in [0,100]", [...path, key]);
      }
      out[key] = v as Score0to100;
    }
    return out as Scores;
  }
  
  /** Validate Feedback object at runtime (throws on failure). */
  export function parseFeedback(input: unknown, path: string[] = ["feedback"]): Feedback {
    if (!isRecord(input)) throw new SchemaError("Expected object", path);
  
    const vocabulary = input["vocabulary"];
    const filler = input["filler"];
    const clarity = input["clarity"];
    const idea = input["idea"];
    const actions = input["actions"];
  
    if (!isString(vocabulary)) throw new SchemaError("Expected string", [...path, "vocabulary"]);
    if (!isString(filler)) throw new SchemaError("Expected string", [...path, "filler"]);
    if (!isString(clarity)) throw new SchemaError("Expected string", [...path, "clarity"]);
    if (!isString(idea)) throw new SchemaError("Expected string", [...path, "idea"]);
    if (!isStringArray(actions)) throw new SchemaError("Expected string[]", [...path, "actions"]);
  
    return { vocabulary, filler, clarity, idea, actions };
  }
  
  /** Validate Assets object at runtime (throws on failure). */
  export function parseAssets(input: unknown, path: string[] = ["assets"]): Assets {
    if (!isRecord(input)) throw new SchemaError("Expected object", path);
  
    const transcript_key = input["transcript_key"];
    if (!isString(transcript_key)) {
      throw new SchemaError("Expected string", [...path, "transcript_key"]);
    }
    return { transcript_key };
  }
  
  /** Validate full AnalyzeResponse at runtime (throws on failure). */
  export function parseAnalyzeResponse(input: unknown): AnalyzeResponse {
    if (!isRecord(input)) throw new SchemaError("Expected object at root");
  
    return {
      scores: parseScores(input["scores"]),
      feedback: parseFeedback(input["feedback"]),
      assets: parseAssets(input["assets"]),
    };
  }
  
  //////////////////////
  // Safe constructors //
  //////////////////////
  
  /** Produce a typed, empty-but-valid AnalyzeResponse for UI placeholders and tests. */
  export function makeEmptyAnalyzeResponse(): AnalyzeResponse {
    const zero = 0 as Score0to100;
    const scores: Scores = {
      vocabulary: zero,
      filler_control: zero,
      clarity_structure: zero,
      idea_quality: zero,
      pacing: zero,
      overall: zero,
    };
    const feedback: Feedback = {
      vocabulary: "",
      filler: "",
      clarity: "",
      idea: "",
      actions: [],
    };
    const assets: Assets = { transcript_key: "" };
    return { scores, feedback, assets };
  }
  
  /**
   * Narrow unknown at runtime without throwing.
   * Returns [value, error], where value is defined only on success.
   */
  export function tryParseAnalyzeResponse(input: unknown): [AnalyzeResponse | undefined, SchemaError | undefined] {
    try {
      return [parseAnalyzeResponse(input), undefined];
    } catch (err) {
      return [undefined, err as SchemaError];
    }
  }
  
  ////////////////////////////
  // Compile-time invariants //
  ////////////////////////////
  
  // Ensure scoreKeys enumerate exactly the keys of Scores.
  type _ScoreKeysMatch = Exclude<keyof Scores, ScoreKey> extends never ? true : never;
  // If the next line errors, scoreKeys and Scores are out of sync:
  const _SCORE_KEYS_MATCH: _ScoreKeysMatch = true;
  