export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced'

export type Lesson = {
  id: string
  title: string
  duration: string
  summary: string
}

export type Course = {
  id: string
  title: string
  topic: string
  description: string
  difficulty: Difficulty
  estimatedTime: string
  progress: number // 0-1
  lessonsCount: number
}

export type Topic = {
  id: string
  name: string
  blurb: string
}

export const topics: Topic[] = [
  { id: 'fire-behavior', name: 'Fire Behavior', blurb: 'Read fire, predict flashover, and stay ahead of the burn.' },
  { id: 'building-construction', name: 'Building Construction', blurb: 'Know how structures fail before you go in.' },
  { id: 'incident-command', name: 'Incident Command', blurb: 'Run a coordinated, accountable fireground.' },
  { id: 'hazmat', name: 'Hazmat Awareness', blurb: 'Recognize, isolate, and protect against hazards.' },
  { id: 'medical', name: 'Medical Response', blurb: 'Deliver fast, confident patient care.' },
  { id: 'tools', name: 'Tools & Equipment', blurb: 'Master the gear that keeps you effective and safe.' },
]

export const courses: Course[] = [
  {
    id: 'fire-dynamics-101',
    title: 'Fire Dynamics & Flashover',
    topic: 'fire-behavior',
    description: 'How heat, fuel, and oxygen drive fire growth, rollover, and flashover.',
    difficulty: 'Intermediate',
    estimatedTime: '2h 10m',
    progress: 0.62,
    lessonsCount: 8,
  },
  {
    id: 'reading-smoke',
    title: 'Reading Smoke',
    topic: 'fire-behavior',
    description: 'Use smoke volume, velocity, density, and color to predict fire behavior.',
    difficulty: 'Beginner',
    estimatedTime: '55m',
    progress: 1,
    lessonsCount: 5,
  },
  {
    id: 'building-collapse',
    title: 'Construction & Collapse',
    topic: 'building-construction',
    description: 'Five building types, lightweight construction, and collapse warning signs.',
    difficulty: 'Advanced',
    estimatedTime: '3h 05m',
    progress: 0.28,
    lessonsCount: 11,
  },
  {
    id: 'forcible-entry',
    title: 'Forcible Entry Basics',
    topic: 'building-construction',
    description: 'Conventional and through-the-lock entry on common door assemblies.',
    difficulty: 'Beginner',
    estimatedTime: '1h 20m',
    progress: 0,
    lessonsCount: 6,
  },
  {
    id: 'ics-foundations',
    title: 'ICS Foundations',
    topic: 'incident-command',
    description: 'Command structure, span of control, and the incident action plan.',
    difficulty: 'Intermediate',
    estimatedTime: '1h 45m',
    progress: 0.4,
    lessonsCount: 7,
  },
  {
    id: 'mayday-management',
    title: 'Mayday Management',
    topic: 'incident-command',
    description: 'RIT activation, air management, and the LUNAR report.',
    difficulty: 'Advanced',
    estimatedTime: '2h 30m',
    progress: 0,
    lessonsCount: 9,
  },
  {
    id: 'hazmat-awareness',
    title: 'Hazmat First Responder Awareness',
    topic: 'hazmat',
    description: 'Identify placards, use the ERG, and establish isolation zones.',
    difficulty: 'Beginner',
    estimatedTime: '1h 30m',
    progress: 0.85,
    lessonsCount: 6,
  },
  {
    id: 'medical-trauma',
    title: 'Trauma Assessment',
    topic: 'medical',
    description: 'Rapid trauma survey, bleeding control, and patient packaging.',
    difficulty: 'Intermediate',
    estimatedTime: '2h 00m',
    progress: 0.5,
    lessonsCount: 8,
  },
  {
    id: 'medical-airway',
    title: 'Airway Management',
    topic: 'medical',
    description: 'Manual maneuvers, adjuncts, and ventilation fundamentals.',
    difficulty: 'Beginner',
    estimatedTime: '1h 10m',
    progress: 0,
    lessonsCount: 5,
  },
  {
    id: 'scba-mastery',
    title: 'SCBA Mastery',
    topic: 'tools',
    description: 'Donning, air management, emergency procedures, and confined egress.',
    difficulty: 'Intermediate',
    estimatedTime: '1h 40m',
    progress: 0.15,
    lessonsCount: 7,
  },
  {
    id: 'hose-nozzles',
    title: 'Hose & Nozzle Operations',
    topic: 'tools',
    description: 'Hand line selection, stream patterns, and friction loss basics.',
    difficulty: 'Beginner',
    estimatedTime: '1h 25m',
    progress: 0,
    lessonsCount: 6,
  },
]

export function topicName(id: string): string {
  return topics.find((t) => t.id === id)?.name ?? id
}

export function courseById(id: string): Course | undefined {
  return courses.find((c) => c.id === id)
}

export const lessons: Record<string, Lesson[]> = {
  'fire-dynamics-101': [
    { id: 'l1', title: 'The Fire Tetrahedron', duration: '12m', summary: 'Fuel, heat, oxygen, and the chemical chain reaction.' },
    { id: 'l2', title: 'Stages of Fire Development', duration: '16m', summary: 'Incipient, growth, fully developed, and decay.' },
    { id: 'l3', title: 'Recognizing Flashover', duration: '18m', summary: 'Thermal layering, rollover, and flashover warning signs.' },
    { id: 'l4', title: 'Backdraft Indicators', duration: '14m', summary: 'Ventilation-controlled fires and explosive conditions.' },
  ],
}

export const currentLesson = {
  courseId: 'fire-dynamics-101',
  courseTitle: 'Fire Dynamics & Flashover',
  lessonId: 'l3',
  title: 'Recognizing Flashover',
  duration: '18m',
  body: [
    'Flashover is the near-simultaneous ignition of most combustible material in an enclosed space. As a compartment fire grows, radiant heat builds at the ceiling and drives the contents of the room toward their ignition temperature.',
    'Crews must recognize the transition long before it happens. Thermal layering pushes a hot gas layer downward, visibility drops, and rollover — flames dancing across the ceiling in the smoke layer — signals that unburned gases are reaching their ignition point.',
    'Controlling the environment with coordinated ventilation and an aggressive interior stream resets the conditions and buys time. When the signs stack up faster than you can act, the correct decision is to withdraw.',
  ],
  takeaways: [
    'Flashover follows predictable thermal cues — it is rarely a surprise to a trained crew.',
    'Rollover in the smoke layer is a primary pre-flashover warning sign.',
    'Coordinated ventilation plus water application resets deteriorating conditions.',
    'If conditions worsen faster than you can control them, withdraw and reassess.',
  ],
  nextLessonTitle: 'Backdraft Indicators',
}

export type QuizQuestion = {
  id: string
  prompt: string
  options: string[]
  correctIndex: number
  explanation: string
}

export const quiz: { title: string; questions: QuizQuestion[] } = {
  title: 'Fire Behavior Check',
  questions: [
    {
      id: 'q1',
      prompt: 'Which sign is the clearest pre-flashover warning during interior operations?',
      options: ['Light haze at the door', 'Rollover in the smoke layer', 'A cold floor', 'Clear windows'],
      correctIndex: 1,
      explanation: 'Rollover — flames moving through the gas layer at the ceiling — shows unburned gases are reaching ignition temperature.',
    },
    {
      id: 'q2',
      prompt: 'A backdraft is most associated with which condition?',
      options: ['A fuel-rich, ventilation-controlled fire', 'An exterior trash fire', 'A fully ventilated room', 'A wet basement'],
      correctIndex: 0,
      explanation: 'Backdraft occurs when a ventilation-controlled fire suddenly receives oxygen, igniting accumulated unburned gases.',
    },
    {
      id: 'q3',
      prompt: 'What are the four components of the fire tetrahedron?',
      options: [
        'Heat, fuel, oxygen, chemical chain reaction',
        'Smoke, heat, water, foam',
        'Fuel, water, oxygen, pressure',
        'Heat, light, smoke, fuel',
      ],
      correctIndex: 0,
      explanation: 'The fire tetrahedron is heat, fuel, oxygen, and the self-sustaining chemical chain reaction.',
    },
    {
      id: 'q4',
      prompt: 'Reading smoke uses four key attributes. Which set is correct?',
      options: [
        'Volume, velocity, density, color',
        'Color, smell, height, speed',
        'Heat, weight, color, age',
        'Density, sound, color, width',
      ],
      correctIndex: 0,
      explanation: 'Volume, velocity, density, and color together predict fire location, size, and behavior.',
    },
  ],
}

export type Flashcard = {
  id: string
  front: string
  back: string
}

export type Deck = {
  id: string
  name: string
  topic: string
  cards: Flashcard[]
}

export const decks: Deck[] = [
  {
    id: 'fire-behavior-deck',
    name: 'Fire Behavior Essentials',
    topic: 'fire-behavior',
    cards: [
      { id: 'c1', front: 'What is flashover?', back: 'Near-simultaneous ignition of most combustible materials in an enclosed space.' },
      { id: 'c2', front: 'What is rollover?', back: 'Flames moving through the gas layer at the ceiling — a pre-flashover warning sign.' },
      { id: 'c3', front: 'Name the fire tetrahedron components.', back: 'Heat, fuel, oxygen, and the chemical chain reaction.' },
      { id: 'c4', front: 'What causes a backdraft?', back: 'Sudden oxygen introduced to a ventilation-controlled, fuel-rich fire.' },
    ],
  },
  {
    id: 'hazmat-deck',
    name: 'Hazmat Placards',
    topic: 'hazmat',
    cards: [
      { id: 'h1', front: 'What does a red placard indicate?', back: 'Flammable material.' },
      { id: 'h2', front: 'What does the ERG help you determine?', back: 'Initial isolation and protective action distances.' },
      { id: 'h3', front: 'What is the purpose of a UN/NA number?', back: 'It identifies the specific hazardous material being transported.' },
    ],
  },
  {
    id: 'ics-deck',
    name: 'Incident Command Terms',
    topic: 'incident-command',
    cards: [
      { id: 'i1', front: 'What is span of control?', back: 'The number of resources one supervisor can effectively manage (3–7, ideally 5).' },
      { id: 'i2', front: 'What does LUNAR stand for in a Mayday?', back: 'Location, Unit, Name, Assignment/Air, Resources needed.' },
      { id: 'i3', front: 'What is an IAP?', back: 'Incident Action Plan — the objectives and strategy for an operational period.' },
    ],
  },
]

export function deckById(id: string): Deck | undefined {
  return decks.find((d) => d.id === id)
}

export const profile = {
  name: 'Capt. Dana Reyes',
  station: 'Station 14 · Engine Company',
  streakDays: 23,
  lessonsCompleted: 47,
  lessonsTotal: 78,
  hoursTrained: 31,
  quizScores: [
    { id: 's1', name: 'Fire Behavior Check', score: 92, date: 'Jun 24' },
    { id: 's2', name: 'Building Construction Quiz', score: 78, date: 'Jun 20' },
    { id: 's3', name: 'Hazmat Awareness Exam', score: 88, date: 'Jun 15' },
    { id: 's4', name: 'ICS Foundations Quiz', score: 71, date: 'Jun 10' },
  ],
  savedDecks: ['fire-behavior-deck', 'hazmat-deck', 'ics-deck'],
}
