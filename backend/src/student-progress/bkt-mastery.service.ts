import { Injectable } from '@nestjs/common';

export interface BktParams {
  pL: number; // P(L) - probability of learned
  pT: number; // P(T) - probability of transition (learning)
  pS: number; // P(S) - probability of slip
  pG: number; // P(G) - probability of guess
}

export interface BktUpdateResult {
  pL: number;
  masteryScore: number;
}

const DEFAULT_BKT_PARAMS: BktParams = {
  pL: 0.2,
  pT: 0.1,
  pS: 0.1,
  pG: 0.25,
};

@Injectable()
export class BktMasteryService {
  /**
   * Derive BKT parameters from question metadata.
   * difficulty (1-10) and discrimination (0-1) adjust slip and guess rates.
   * Falls back to KP difficultyLevel (1-5) if no question metadata.
   */
  deriveBktParams(options?: {
    questionDifficulty?: number;
    discrimination?: number;
    kpDifficultyLevel?: number;
  }): BktParams {
    const params = { ...DEFAULT_BKT_PARAMS };

    if (options?.questionDifficulty != null && options.questionDifficulty > 0) {
      // Higher difficulty → higher slip, lower guess
      const normalizedDifficulty = Math.min(options.questionDifficulty, 10) / 10;
      params.pS = 0.05 + normalizedDifficulty * 0.15; // 0.05–0.20
      params.pG = 0.35 - normalizedDifficulty * 0.25; // 0.35–0.10
    } else if (
      options?.kpDifficultyLevel != null &&
      options.kpDifficultyLevel > 0
    ) {
      const normalizedDifficulty =
        Math.min(options.kpDifficultyLevel, 5) / 5;
      params.pS = 0.05 + normalizedDifficulty * 0.15;
      params.pG = 0.35 - normalizedDifficulty * 0.25;
    }

    if (options?.discrimination != null && options.discrimination > 0) {
      // Higher discrimination → questions better at separating learners
      // Reduce both slip and guess for high-discrimination items
      const disc = Math.min(options.discrimination, 1);
      params.pS *= 1 - disc * 0.3;
      params.pG *= 1 - disc * 0.3;
    }

    return params;
  }

  /**
   * Core BKT update: given prior P(L), response, and BKT params,
   * compute posterior P(L) after observing the response.
   */
  updateMastery(
    priorPL: number,
    isCorrect: boolean,
    params: BktParams = DEFAULT_BKT_PARAMS,
  ): BktUpdateResult {
    const { pT, pS, pG } = params;
    const pL = Math.max(0, Math.min(1, priorPL));

    // Posterior P(L|response) using Bayes' theorem
    let pLGivenResponse: number;

    if (isCorrect) {
      const pCorrectGivenL = 1 - pS;
      const pCorrectGivenNotL = pG;
      const pCorrect = pL * pCorrectGivenL + (1 - pL) * pCorrectGivenNotL;
      pLGivenResponse = pCorrect > 0 ? (pL * pCorrectGivenL) / pCorrect : pL;
    } else {
      const pIncorrectGivenL = pS;
      const pIncorrectGivenNotL = 1 - pG;
      const pIncorrect =
        pL * pIncorrectGivenL + (1 - pL) * pIncorrectGivenNotL;
      pLGivenResponse =
        pIncorrect > 0 ? (pL * pIncorrectGivenL) / pIncorrect : pL;
    }

    // Apply learning transition
    const pLNext = pLGivenResponse + (1 - pLGivenResponse) * pT;

    // Clamp to [0, 1]
    const clampedPL = Math.max(0, Math.min(1, pLNext));

    return {
      pL: clampedPL,
      masteryScore: Math.round(clampedPL * 100),
    };
  }

  /**
   * Process a sequence of responses to compute final mastery.
   * Useful for replaying history or batch processing.
   */
  processResponseSequence(
    responses: boolean[],
    params: BktParams = DEFAULT_BKT_PARAMS,
    initialPL?: number,
  ): BktUpdateResult {
    let pL = initialPL ?? params.pL;

    for (const isCorrect of responses) {
      const result = this.updateMastery(pL, isCorrect, params);
      pL = result.pL;
    }

    return {
      pL,
      masteryScore: Math.round(pL * 100),
    };
  }

  /**
   * Convert a stored masteryScore (0-100) back to P(L) for BKT updates.
   */
  masteryScoreToPL(masteryScore: number): number {
    return Math.max(0, Math.min(1, masteryScore / 100));
  }
}
