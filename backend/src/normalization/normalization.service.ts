import { Injectable } from '@nestjs/common';
import { AnalyzeNormalizationDto } from './dto/analyze-normalization.dto.js';
import { CandidateKeyEngine } from './engines/candidate-key.engine.js';
import { NormalFormEngine } from './engines/nf.engine.js';
import {
  DecompositionEngine,
  DecomposedRelation,
} from './engines/decomposition.engine.js';
import { BCNFEngine } from './engines/bcnf.engine.js';

@Injectable()
export class NormalizationService {
  analyze(data: AnalyzeNormalizationDto) {
    // Step 1: Find candidate keys
    const candidateKeys = CandidateKeyEngine.findCandidateKeys(
      data.attributes,
      data.functionalDependencies,
    );

    // Step 2: Analyze normal forms
    const normalFormAnalysis = NormalFormEngine.analyze(
      data.attributes,
      data.functionalDependencies,
      candidateKeys,
    );

    // Step 3: Generate decomposition based on the highest
    // normal form that is currently violated
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

    // Step 4: Generate BCNF decomposition
    const bcnfDecomposition = BCNFEngine.decompose(
      data.attributes,
      data.functionalDependencies,
    );

    // Step 5: Return complete analysis
    return {
      relation: data.relationName,
      attributes: data.attributes,

      functionalDependencies: data.functionalDependencies,

      multivaluedDependencies:
        data.multivaluedDependencies ?? [],

      candidateKeys,

      normalForms: normalFormAnalysis.normalForms,

      highestNormalForm:
        normalFormAnalysis.highestNormalForm,

      violations:
        normalFormAnalysis.violations,

      decomposition,

      bcnfDecomposition,
    };
  }
}