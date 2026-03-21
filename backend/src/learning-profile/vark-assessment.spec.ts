import {
  processVarkAssessment,
  VARK_QUESTIONS,
  type VarkAssessmentAnswer,
} from './vark-assessment';

describe('processVarkAssessment', () => {
  it('should compute scores as percentage of selected modalities', () => {
    const answers: VarkAssessmentAnswer[] = [
      { questionId: 'q1', selectedOptionKey: 'a' }, // visual
      { questionId: 'q2', selectedOptionKey: 'a' }, // visual
      { questionId: 'q3', selectedOptionKey: 'b' }, // auditory
      { questionId: 'q4', selectedOptionKey: 'c' }, // reading
    ];

    const result = processVarkAssessment(answers);

    expect(result.totalAnswers).toBe(4);
    expect(result.scores.visual).toBe(50);
    expect(result.scores.auditory).toBe(25);
    expect(result.scores.reading).toBe(25);
    expect(result.scores.kinesthetic).toBe(0);
    expect(result.dominantStyle).toBe('visual');
  });

  it('should ignore invalid question/option pairs', () => {
    const answers: VarkAssessmentAnswer[] = [
      { questionId: 'q1', selectedOptionKey: 'a' },
      { questionId: 'q999', selectedOptionKey: 'a' },
      { questionId: 'q2', selectedOptionKey: 'x' },
    ];

    const result = processVarkAssessment(answers);

    expect(result.totalAnswers).toBe(1);
    expect(result.scores.visual).toBe(100);
  });

  it('should return zero scores when there are no valid answers', () => {
    const result = processVarkAssessment([]);

    expect(result.totalAnswers).toBe(0);
    expect(result.scores.visual).toBe(0);
    expect(result.scores.auditory).toBe(0);
    expect(result.scores.reading).toBe(0);
    expect(result.scores.kinesthetic).toBe(0);
  });

  it('should expose 8 assessment questions', () => {
    expect(VARK_QUESTIONS).toHaveLength(8);
  });
});
