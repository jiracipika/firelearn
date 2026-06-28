import type { Course, Flashcard, QuizQuestion } from '@/types/learning'
import { categories } from '@/data/categories'

const today = new Date().toISOString()

const fireBehaviorQuiz: QuizQuestion[] = [
  {
    id: 'q-reading-smoke-1',
    type: 'multiple-choice',
    prompt: 'Which combination is commonly used to read smoke conditions?',
    options: ['Volume, velocity, density, color', 'Height, odor, sound, time', 'Fuel, foam, ladder, nozzle', 'Heat, radio, hydrant, crew size'],
    correctAnswerIds: ['Volume, velocity, density, color'],
    explanation: 'Volume, velocity, density, and color help crews infer fire location, stage, and ventilation conditions.',
    topicIds: ['fire-behaviour', 'fire-dynamics'],
  },
  {
    id: 'q-reading-smoke-2',
    type: 'scenario',
    prompt: 'A small structure shows turbulent dark smoke under pressure from the eaves. What is the safest interpretation?',
    options: ['Conditions are improving', 'The fire may be ventilation-limited and worsening', 'No interior hazard exists', 'The smoke is only steam'],
    correctAnswerIds: ['The fire may be ventilation-limited and worsening'],
    explanation: 'Pressurized, turbulent smoke can indicate high heat and a ventilation-limited fire environment. Coordinate ventilation and water application.',
    topicIds: ['fire-behaviour', 'ventilation'],
    timeLimitSeconds: 90,
  },
]

const coreCards: Flashcard[] = [
  {
    id: 'fc-smoke-vvdc',
    front: 'What four smoke attributes should firefighters evaluate?',
    back: 'Volume, velocity, density, and color. Evaluate them together, not in isolation.',
    topicIds: ['fire-behaviour'],
    difficulty: 'Firefighter I',
    easeFactor: 2.5,
    intervalDays: 0,
    nextReview: today,
    reviewCount: 0,
  },
  {
    id: 'fc-flow-path',
    front: 'Why does flow path matter during interior operations?',
    back: 'Openings can move heat, smoke, and fire through predictable paths toward crews or victims.',
    topicIds: ['fire-dynamics', 'ventilation'],
    difficulty: 'Firefighter II',
    easeFactor: 2.5,
    intervalDays: 2,
    nextReview: today,
    reviewCount: 2,
  },
]

export const academyCourses: Course[] = [
  {
    id: 'course-reading-smoke',
    slug: 'reading-smoke-and-fire-growth',
    title: 'Reading Smoke & Fire Growth',
    description: 'Build pattern recognition for smoke, heat release, flow path, and early fire behavior decisions.',
    categoryId: 'fire-behaviour',
    difficulty: 'Firefighter I',
    estimatedMinutes: 95,
    progressPercent: 62,
    xp: 450,
    modules: [
      {
        id: 'module-compartment-fire',
        title: 'Compartment fire indicators',
        description: 'Recognize conditions before they become firefighter emergencies.',
        lessons: [
          {
            id: 'lesson-reading-smoke',
            slug: 'reading-smoke-indicators',
            title: 'Reading Smoke Indicators',
            difficulty: 'Firefighter I',
            estimatedMinutes: 18,
            objectives: ['Identify smoke volume, velocity, density, and color', 'Connect changing smoke to likely fire conditions', 'Choose safer tactical questions before entry'],
            prerequisites: ['Basic PPE awareness', 'Department accountability procedures'],
            content: [
              { type: 'paragraph', text: 'Smoke is information. Its movement, pressure, density, and color can help firefighters estimate fire location, growth stage, and ventilation profile before committing crews.' },
              { type: 'callout', title: 'Operational mindset', text: 'Use smoke reading to ask better questions. It supports size-up; it does not replace your department SOPs, officer judgment, or live instructor evaluation.' },
              { type: 'list', title: 'Four primary attributes', items: ['Volume: how much smoke is being produced', 'Velocity: how forcefully smoke is moving', 'Density: how much fuel is suspended in the smoke', 'Color: what stage or material clues may be present'] },
            ],
            imageAlt: 'Firefighter observing smoke conditions from a safe exterior position',
            videoPlaceholder: 'Future video: coordinated size-up of smoke indicators at a residential fire.',
            knowledgeCheck: fireBehaviorQuiz[0],
            summary: ['Smoke reading improves risk assessment.', 'The four attributes are most useful when interpreted together.', 'Changing conditions should trigger communication and tactical reassessment.'],
            quiz: fireBehaviorQuiz,
            flashcards: coreCards,
            references: ['NFPA and local standards should be consulted by instructors', 'Department SOPs and AHJ guidance', 'Instructor-led live fire training'],
            completion: { completed: false, percent: 70 },
          },
        ],
      },
    ],
  },
  {
    id: 'course-ics-foundations',
    slug: 'incident-command-foundations',
    title: 'Incident Command Foundations',
    description: 'Practice command structure, radio discipline, accountability, and tactical priorities.',
    categoryId: 'incident-command',
    difficulty: 'Company Officer',
    estimatedMinutes: 120,
    progressPercent: 35,
    xp: 520,
    modules: [],
  },
  {
    id: 'course-scba-air-management',
    slug: 'scba-air-management',
    title: 'SCBA Air Management',
    description: 'Understand air checks, work cycles, emergency procedures, and exit decision points.',
    categoryId: 'scba',
    difficulty: 'Firefighter I',
    estimatedMinutes: 80,
    progressPercent: 0,
    xp: 380,
    modules: [],
  },
]

export const educationalDisclaimer = 'FireLearn content is educational support only. It does not replace official firefighter training, department SOPs, local regulations, certification requirements, AHJ direction, or instructor-led evaluation.'

export function getCategoryTitle(categoryId: string) {
  return categories.find((category) => category.id === categoryId)?.title ?? categoryId
}

export function getFeaturedLesson() {
  return academyCourses[0].modules[0]?.lessons[0]
}
