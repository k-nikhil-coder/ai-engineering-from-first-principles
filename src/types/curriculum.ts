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

export interface Chapter {
  id: string;
  number: string;
  title: string;
  moduleId: string;
  moduleName: string;
  readTime: string;
  motto: string;
  problemStatement: string;
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
}

export interface Module {
  id: string;
  numberRange: string;
  title: string;
  description: string;
  icon: string;
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
