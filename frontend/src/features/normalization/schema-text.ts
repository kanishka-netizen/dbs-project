/**
 * Parses the textual schema the user types into the visualizer.
 *
 * The format is deliberately forgiving, because typing a schema by hand is the
 * first thing that goes wrong in a live demo. Accepted syntax:
 *
 *   attributes: A, B, C        # explicit declaration
 *   A, B, C                    # a bare first line is also taken as attributes
 *   A, B -> C                  # functional dependency
 *   A ->> B                    # multivalued dependency (4NF / 5NF)
 *
 * `→` and `↠` are accepted in place of `->` and `->>`, and `#`, `--` and `//`
 * start a comment. Blank lines are ignored.
 */

export interface ParsedFunctionalDependency {
  left: string[];
  right: string[];
}

export const DEPENDENCY_ARROW = '->';
export const MULTIVALUED_ARROW: string = '->>';

export interface ParsedSchema {
  attributes: string[];
  functionalDependencies: ParsedFunctionalDependency[];
  multivaluedDependencies: ParsedFunctionalDependency[];
}

export interface ParseIssue {
  /** 1-indexed line number in the original text. */
  line: number;
  message: string;
}

export interface ParseResult {
  schema: ParsedSchema;
  issues: ParseIssue[];
}

const ATTRIBUTES_PREFIX = /^attributes?\s*[:=]\s*/i;

function stripComment(line: string): string {
  const markers = ['#', '--', '//'];
  let cut = line.length;

  for (const marker of markers) {
    const index = line.indexOf(marker);

    if (index !== -1 && index < cut) {
      cut = index;
    }
  }

  return line.slice(0, cut);
}

/** Normalises the unicode arrows so the rest of the parser sees `->`/`->>`. */
function normaliseArrows(line: string): string {
  return line.replace(/↠/g, '->>').replace(/→/g, '->');
}

function splitAttributeList(text: string): string[] {
  return text
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

/** Finds the index of the dependency arrow, preferring `->>` over `->`. */
function findArrow(line: string): { index: number; width: number } | null {
  const multi = line.indexOf('->>');

  if (multi !== -1) {
    return { index: multi, width: 3 };
  }

  const single = line.indexOf('->');

  if (single !== -1) {
    return { index: single, width: 2 };
  }

  return null;
}

export function parseSchema(text: string): ParseResult {
  const issues: ParseIssue[] = [];

  const declaredAttributes: string[] = [];
  const functionalDependencies: ParsedFunctionalDependency[] = [];
  const multivaluedDependencies: ParsedFunctionalDependency[] = [];

  let sawBareAttributeLine = false;

  text.split(/\r?\n/).forEach((rawLine, index) => {
    const lineNumber = index + 1;
    const line = stripComment(normaliseArrows(rawLine)).trim();

    if (line.length === 0) {
      return;
    }

    const arrow = findArrow(line);

    if (!arrow) {
      const isDeclared = ATTRIBUTES_PREFIX.test(line);

      // Only the first bare line is treated as the attribute list, so a stray
      // word further down is reported instead of silently swallowed.
      if (isDeclared || !sawBareAttributeLine) {
        sawBareAttributeLine = true;

        const list = splitAttributeList(
          isDeclared ? line.replace(ATTRIBUTES_PREFIX, '') : line,
        );

        if (list.length === 0) {
          issues.push({
            line: lineNumber,
            message: 'Expected a comma-separated list of attributes.',
          });
          return;
        }

        declaredAttributes.push(...list);
        return;
      }

      issues.push({
        line: lineNumber,
        message: `Could not read "${line}". Use "A, B -> C" for a functional dependency.`,
      });
      return;
    }

    const left = splitAttributeList(line.slice(0, arrow.index));
    const right = splitAttributeList(line.slice(arrow.index + arrow.width));
    const isMultivalued = arrow.width === 3;

    if (left.length === 0 || right.length === 0) {
      issues.push({
        line: lineNumber,
        message: `Both sides of ${isMultivalued ? '->>' : '->'} are required.`,
      });
      return;
    }

    const dependency = { left, right };

    if (isMultivalued) {
      multivaluedDependencies.push(dependency);
    } else {
      functionalDependencies.push(dependency);
    }
  });

  // If nothing was declared, fall back to every attribute named in a
  // dependency — that is almost always what the user meant.
  const attributes =
    declaredAttributes.length > 0
      ? dedupe(declaredAttributes)
      : dedupe([
          ...functionalDependencies.flatMap((d) => [...d.left, ...d.right]),
          ...multivaluedDependencies.flatMap((d) => [...d.left, ...d.right]),
        ]);

  return {
    schema: {
      attributes,
      functionalDependencies,
      multivaluedDependencies,
    },
    issues,
  };
}

function dedupe(values: string[]): string[] {
  return [...new Set(values)];
}

export function formatDependency(
  dependency: ParsedFunctionalDependency,
): string {
  return `${dependency.left.join(', ')} ${DEPENDENCY_ARROW} ${dependency.right.join(', ')}`;
}

export function formatMultivaluedDependency(
  dependency: ParsedFunctionalDependency,
): string {
  return `${dependency.left.join(', ')} ${MULTIVALUED_ARROW} ${dependency.right.join(', ')}`;
}
