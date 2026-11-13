export type TargetRole = 
  | 'ai-engineer' 
  | 'agent-architect' 
  | 'harness-engineer' 
  | 'fde';

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface SectionContent {
  title: string;
  summary: string;
  content: string[];
  diagram?: string;
  mathFormula?: string;
}

export interface Lecture {
  title: string;
  speaker: string;
  url: string;
  youtubeId?: string;
  duration: string;
  timestampedTakeaways: {
    time: string;
    takeaway: string;
  }[];
}

export interface LabProblem {
  title: string;
  subtitle: string;
  problemStatement: string;
  constraints?: string[];
  starterCode: string;
  solutionCode: string;
  testCases: {
    input: string;
    expectedOutput: string;
    explanation?: string;
  }[];
}

export type SimulatorType = 
  | 'kv-cache' 
  | 'lora' 
  | 'vector' 
  | 'react-loop' 
  | 'rrf-fusion' 
  | 'context-compaction' 
  | 'fde-economics';

export interface Chapter {
  id: string;
  number: string;
  title: string;
  moduleId: string;
  moduleName: string;
  trackNumber: number;
  readTime: string;
  motto: string;
  problemStatement: string;
  targetRoles: TargetRole[];
  coreConcepts: SectionContent[];
  codeImplementation: {
    language: string;
    title: string;
    description: string;
    code: string;
  };
  productionPitfalls: string[];
  keyTakeaways: string[];
  quiz: QuizQuestion[];
  lectures?: Lecture[];
  simulatorType?: SimulatorType;
  labs?: {
    problemA: LabProblem;
    problemB: LabProblem;
  };
}

export interface Module {
  id: string;
  numberRange: string;
  trackNumber: number;
  title: string;
  description: string;
  icon: string;
  targetRoles: TargetRole[];
  chapterIds: string[];
}

export interface ExternalResource {
  title: string;
  url: string;
  githubUrl?: string;
  author: string;
  badge: string;
  description: string;
  highlights: string[];
  bestFor: string;
}
