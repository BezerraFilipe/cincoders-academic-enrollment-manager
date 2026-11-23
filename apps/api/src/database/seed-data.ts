export type CurriculumTypeName = 'MANDATORY' | 'PROFILE_ELECTIVE';
export type RecordStatusName = 'PASSED' | 'FAILED';

export interface SeedCourse {
  code: string;
  name: string;
  mandatoryHours: number;
  profileElectiveHours: number;
  freeElectiveHours: number;
  curriculum: Record<string, CurriculumTypeName>;
}

export interface SeedSubject {
  code: string;
  name: string;
  workloadHours: number;
  prerequisites?: string[];
}

export interface SeedProfessor {
  name: string;
  email: string;
}

export interface SeedSection {
  subjectCode: string;
  code: string;
  professorEmail: string;
  capacity: number;
}

export interface SeedStudent {
  name: string;
  email: string;
  registrationNumber: string;
  courseCode: string;
  history: { subjectCode: string; term: string; status: RecordStatusName }[];
  activeEnrollments: { subjectCode: string; sectionCode: string }[];
}

export const SEED_PASSWORD = 'Senha@123';

export const REGISTRAR_USER = {
  name: 'Secretaria de Graduação',
  email: 'secretaria@cin.ufpe.br',
};

export const SUBJECTS: SeedSubject[] = [
  { code: 'IF669', name: 'Introdução à Programação', workloadHours: 60 },
  { code: 'IF670', name: 'Matemática Discreta', workloadHours: 60 },
  {
    code: 'IF671',
    name: 'Algoritmos e Estruturas de Dados',
    workloadHours: 60,
    prerequisites: ['IF669'],
  },
  {
    code: 'IF672',
    name: 'Banco de Dados',
    workloadHours: 60,
    prerequisites: ['IF671'],
  },
  { code: 'IF673', name: 'Engenharia de Software', workloadHours: 60 },
  { code: 'IF674', name: 'Sistemas Digitais', workloadHours: 60 },
  {
    code: 'IF675',
    name: 'Arquitetura de Computadores',
    workloadHours: 60,
    prerequisites: ['IF674'],
  },
  {
    code: 'IF676',
    name: 'Inteligência Artificial',
    workloadHours: 60,
    prerequisites: ['IF670', 'IF671'],
  },
  { code: 'IF677', name: 'Computação Gráfica', workloadHours: 60 },
  { code: 'IF678', name: 'Redes de Computadores', workloadHours: 60 },
  { code: 'IF679', name: 'Sistemas Embarcados', workloadHours: 60 },
  { code: 'IF680', name: 'Processamento de Imagens', workloadHours: 60 },
  { code: 'LE501', name: 'Inglês Instrumental', workloadHours: 30 },
  { code: 'ET601', name: 'Empreendedorismo', workloadHours: 45 },
];

export const COURSES: SeedCourse[] = [
  {
    code: 'CC',
    name: 'Ciência da Computação',
    mandatoryHours: 300,
    profileElectiveHours: 120,
    freeElectiveHours: 60,
    curriculum: {
      IF669: 'MANDATORY',
      IF670: 'MANDATORY',
      IF671: 'MANDATORY',
      IF672: 'MANDATORY',
      IF673: 'MANDATORY',
      IF675: 'PROFILE_ELECTIVE',
      IF676: 'PROFILE_ELECTIVE',
      IF677: 'PROFILE_ELECTIVE',
      IF678: 'PROFILE_ELECTIVE',
    },
  },
  {
    code: 'EC',
    name: 'Engenharia da Computação',
    mandatoryHours: 300,
    profileElectiveHours: 120,
    freeElectiveHours: 60,
    curriculum: {
      IF669: 'MANDATORY',
      IF670: 'MANDATORY',
      IF674: 'MANDATORY',
      IF675: 'MANDATORY',
      IF678: 'MANDATORY',
      IF671: 'PROFILE_ELECTIVE',
      IF673: 'PROFILE_ELECTIVE',
      IF679: 'PROFILE_ELECTIVE',
      IF680: 'PROFILE_ELECTIVE',
    },
  },
];

export const PROFESSORS: SeedProfessor[] = [
  { name: 'Paulo Borba', email: 'paulo.borba@cin.ufpe.br' },
  { name: 'Carla Silva', email: 'carla.silva@cin.ufpe.br' },
  { name: 'Ricardo Lima', email: 'ricardo.lima@cin.ufpe.br' },
  { name: 'Fernanda Rocha', email: 'fernanda.rocha@cin.ufpe.br' },
];

export const SECTIONS: SeedSection[] = [
  {
    subjectCode: 'IF669',
    code: 'A',
    professorEmail: 'paulo.borba@cin.ufpe.br',
    capacity: 40,
  },
  {
    subjectCode: 'IF670',
    code: 'A',
    professorEmail: 'carla.silva@cin.ufpe.br',
    capacity: 40,
  },
  {
    subjectCode: 'IF671',
    code: 'A',
    professorEmail: 'paulo.borba@cin.ufpe.br',
    capacity: 35,
  },
  {
    subjectCode: 'IF672',
    code: 'A',
    professorEmail: 'ricardo.lima@cin.ufpe.br',
    capacity: 30,
  },
  {
    subjectCode: 'IF673',
    code: 'A',
    professorEmail: 'fernanda.rocha@cin.ufpe.br',
    capacity: 30,
  },
  {
    subjectCode: 'IF673',
    code: 'B',
    professorEmail: 'paulo.borba@cin.ufpe.br',
    capacity: 30,
  },
  {
    subjectCode: 'IF674',
    code: 'A',
    professorEmail: 'ricardo.lima@cin.ufpe.br',
    capacity: 30,
  },
  {
    subjectCode: 'IF675',
    code: 'A',
    professorEmail: 'ricardo.lima@cin.ufpe.br',
    capacity: 25,
  },
  {
    subjectCode: 'IF676',
    code: 'A',
    professorEmail: 'carla.silva@cin.ufpe.br',
    capacity: 25,
  },
  {
    subjectCode: 'IF677',
    code: 'A',
    professorEmail: 'fernanda.rocha@cin.ufpe.br',
    capacity: 20,
  },
  {
    subjectCode: 'IF678',
    code: 'A',
    professorEmail: 'carla.silva@cin.ufpe.br',
    capacity: 30,
  },
  {
    subjectCode: 'IF680',
    code: 'A',
    professorEmail: 'fernanda.rocha@cin.ufpe.br',
    capacity: 1,
  },
  {
    subjectCode: 'LE501',
    code: 'A',
    professorEmail: 'carla.silva@cin.ufpe.br',
    capacity: 50,
  },
  {
    subjectCode: 'ET601',
    code: 'A',
    professorEmail: 'ricardo.lima@cin.ufpe.br',
    capacity: 1,
  },
];

export const STUDENTS: SeedStudent[] = [
  {
    name: 'Ana Souza',
    email: 'ana.souza@cin.ufpe.br',
    registrationNumber: '20230001',
    courseCode: 'CC',
    history: [
      { subjectCode: 'IF669', term: '2023.1', status: 'PASSED' },
      { subjectCode: 'IF670', term: '2023.1', status: 'PASSED' },
      { subjectCode: 'IF671', term: '2023.2', status: 'FAILED' },
      { subjectCode: 'IF671', term: '2024.1', status: 'PASSED' },
      { subjectCode: 'IF676', term: '2024.2', status: 'PASSED' },
      { subjectCode: 'IF677', term: '2024.2', status: 'PASSED' },
      { subjectCode: 'IF678', term: '2025.1', status: 'PASSED' },
      { subjectCode: 'LE501', term: '2025.1', status: 'PASSED' },
    ],
    activeEnrollments: [{ subjectCode: 'IF673', sectionCode: 'A' }],
  },
  {
    name: 'Bruno Costa',
    email: 'bruno.costa@cin.ufpe.br',
    registrationNumber: '20240002',
    courseCode: 'CC',
    history: [
      { subjectCode: 'IF669', term: '2024.1', status: 'PASSED' },
      { subjectCode: 'IF670', term: '2024.1', status: 'FAILED' },
    ],
    activeEnrollments: [{ subjectCode: 'ET601', sectionCode: 'A' }],
  },
  {
    name: 'Carla Mendes',
    email: 'carla.mendes@cin.ufpe.br',
    registrationNumber: '20230003',
    courseCode: 'EC',
    history: [
      { subjectCode: 'IF669', term: '2023.1', status: 'PASSED' },
      { subjectCode: 'IF670', term: '2023.1', status: 'PASSED' },
      { subjectCode: 'IF674', term: '2023.2', status: 'PASSED' },
      { subjectCode: 'IF671', term: '2024.1', status: 'PASSED' },
      { subjectCode: 'IF672', term: '2024.2', status: 'PASSED' },
      { subjectCode: 'IF673', term: '2024.2', status: 'FAILED' },
    ],
    activeEnrollments: [{ subjectCode: 'IF675', sectionCode: 'A' }],
  },
  {
    name: 'Daniel Alves',
    email: 'daniel.alves@cin.ufpe.br',
    registrationNumber: '20250004',
    courseCode: 'EC',
    history: [],
    activeEnrollments: [],
  },
];
