import { Injectable } from '@nestjs/common';
import { AnalyzeNormalizationDto } from './dto/analyze-normalization.dto.js';
import { CandidateKeyEngine } from './engines/candidate-key.engine.js';
import { NormalFormEngine } from './engines/nf.engine.js';
import {
  DecompositionEngine,
  DecomposedRelation,
} from './engines/decomposition.engine.js';
import { BCNFEngine } from './engines/bcnf.engine.js';
import { StepsEngine } from './engines/steps.engine.js';
import { ValidationEngine } from './engines/validation.engine.js';
import { HigherNormalFormEngine } from './engines/higher-nf.engine.js';
import { HigherNormalFormResult } from './engines/higher-nf.types.js';

@Injectable()
export class NormalizationService {
  analyze(data: AnalyzeNormalizationDto) {
    const validation = ValidationEngine.validate(
      data.attributes,
      data.functionalDependencies,
    );

    if (!validation.valid) {
      return {
        relation: data.relationName,
        valid: false,
        errors: validation.errors,
        warnings: validation.warnings,
      };
    }

    const multivaluedDependencies =
      data.multivaluedDependencies ?? [];

    // Step 1: Find candidate keys
    const candidateKeys = CandidateKeyEngine.findCandidateKeys(
      data.attributes,
      data.functionalDependencies,
    );

    // Step 2: Analyse 1NF, 2NF, 3NF and BCNF
    const normalFormAnalysis = NormalFormEngine.analyze(
      data.attributes,
      data.functionalDependencies,
      candidateKeys,
    );

    // Step 3: Generate a decomposition based on the weakest normal form that
    // is currently violated
    let decomposition: DecomposedRelation[] = [];

    if (!normalFormAnalysis.normalForms['2NF']) {
      decomposition = DecompositionEngine.decomposeTo2NF(
        data.attributes,
        data.functionalDependencies,
        candidateKeys,
      );
    } else if (!normalFormAnalysis.normalForms['3NF']) {
      decomposition = DecompositionEngine.decomposeTo3NF(
        data.functionalDependencies,
        candidateKeys,
      );
    }

    // Step 4: Generate the BCNF decomposition
    const bcnfDecomposition = BCNFEngine.decompose(
      data.attributes,
      data.functionalDependencies,
    );

    // Step 5: Analyse 4NF and 5NF from the multivalued dependencies. The BCNF
    // verdict is passed in because 4NF implies BCNF, so a relation that has not
    // reached BCNF cannot reach 4NF or 5NF however its MVDs look.
    const higherNormalForms = HigherNormalFormEngine.analyze(
      data.attributes,
      data.functionalDependencies,
      multivaluedDependencies,
      data.joinDependencies ?? [],
      normalFormAnalysis.normalForms.BCNF,
    );

    // Step 6: Build the walkthrough
    const steps = StepsEngine.generateSteps(
      data.attributes,
      data.functionalDependencies,
      candidateKeys,
      normalFormAnalysis.normalForms,
      normalFormAnalysis.highestNormalForm,
      normalFormAnalysis.violations,
      higherNormalForms,
    );

    // Step 7: Return the complete analysis
    return {
      relation: data.relationName,
      valid: true,

      attributes: data.attributes,

      functionalDependencies: data.functionalDependencies,

      multivaluedDependencies,

      candidateKeys,

      normalForms: normalFormAnalysis.normalForms,

      highestNormalForm: this.resolveHighestNormalForm(
        normalFormAnalysis.highestNormalForm,
        higherNormalForms,
      ),

      violations: normalFormAnalysis.violations,

      decomposition,

      bcnfDecomposition,

      higherNormalForms,

      steps,

      warnings: validation.warnings,
    };
  }

  /**
   * The 1NF–BCNF verdicts and the 4NF/5NF verdicts are computed separately, so
   * the reported highest form has to be reconciled. A relation only reaches 4NF
   * or 5NF once every lower form already holds, which is exactly what
   * `HigherNormalFormEngine` encodes in its own `highestNormalForm`.
   */
  private resolveHighestNormalForm(
    base: string,
    higherNormalForms: HigherNormalFormResult,
  ): string {
    return higherNormalForms.highestNormalForm ?? base;
  }
}
