import type { Course, Difficulty, Flashcard, Lesson, QuizQuestion } from '@/types/learning'
import { categories } from '@/data/categories'

const today = new Date().toISOString()

function makeQuestion(categoryId: string, title: string): QuizQuestion {
  return {
    id: `q-${categoryId}-size-up`,
    type: 'scenario',
    prompt: `During ${title.toLowerCase()} training, what should a firefighter do before applying a tactic learned in a digital lesson?`,
    options: [
      'Confirm department SOPs, instructor guidance, and local conditions',
      'Use the app as a replacement for certification training',
      'Ignore command direction if the lesson seems clearer',
      'Assume every jurisdiction uses the same procedure',
    ],
    correctAnswerIds: ['Confirm department SOPs, instructor guidance, and local conditions'],
    explanation: 'FireLearn supports study and pattern recognition. Tactical action must follow official training, local SOPs, command direction, and applicable regulations.',
    topicIds: [categoryId],
    timeLimitSeconds: 90,
  }
}

function makeFlashcard(categoryId: string, title: string, difficulty: Difficulty): Flashcard {
  return {
    id: `fc-${categoryId}-operational-check`,
    front: `What is the safest way to use FireLearn content for ${title.toLowerCase()}?`,
    back: 'Use it for preparation and review, then validate tactics through official instruction, SOPs, AHJ requirements, and supervised practical training.',
    topicIds: [categoryId],
    difficulty,
    easeFactor: 2.5,
    intervalDays: 0,
    nextReview: today,
    reviewCount: 0,
  }
}

function makeLesson(categoryId: string, title: string, difficulty: Difficulty): Lesson {
  const question = makeQuestion(categoryId, title)
  const flashcard = makeFlashcard(categoryId, title, difficulty)

  return {
    id: `lesson-${categoryId}-foundations`,
    slug: `${categoryId}-foundations`,
    title: `${title} Foundations`,
    difficulty,
    estimatedMinutes: 18,
    objectives: [
      `Define the operational purpose of ${title.toLowerCase()}`,
      'Identify risk cues that should trigger communication or reassessment',
      'Connect digital study to department-approved hands-on training',
    ],
    prerequisites: ['Current department training plan', 'Applicable PPE and safety expectations', 'Local SOP review'],
    content: [
      {
        type: 'paragraph',
        text: `${title} knowledge improves fireground decisions when it is practiced as part of a complete training system. This lesson introduces the vocabulary, safety mindset, and decision points firefighters should recognize before moving into scenario practice.`,
      },
      {
        type: 'callout',
        title: 'Training boundary',
        text: 'This material supports study. It does not authorize independent tactical action, replace certification, or override command, SOPs, AHJ requirements, or instructor-led evaluation.',
      },
      {
        type: 'list',
        title: 'Study pattern',
        items: ['Review the concept', 'Answer a knowledge check', 'Practice recall with flashcards', 'Discuss the tactic with an instructor or company officer', 'Apply only within approved practical training'],
      },
    ],
    imageAlt: `Firefighter training context for ${title.toLowerCase()}`,
    videoPlaceholder: `Future video placeholder: instructor-led walkthrough for ${title}.`,
    knowledgeCheck: question,
    summary: [
      `${title} study should improve recognition and communication.`,
      'Digital lessons are strongest when paired with supervised drills.',
      'Local rules, SOPs, and command direction always control real incidents.',
    ],
    quiz: [question],
    flashcards: [flashcard],
    references: ['Department SOPs', 'Authority Having Jurisdiction guidance', 'Instructor-led certification materials', 'Applicable NFPA/local standards where adopted'],
    completion: { completed: false, percent: 0 },
  }
}

const difficultyCycle: Difficulty[] = ['Recruit', 'Firefighter I', 'Firefighter II', 'Company Officer', 'Advanced']

const starterCourses: Course[] = categories.map((category, index) => {
  const difficulty = difficultyCycle[index % difficultyCycle.length]
  return {
    id: `course-${category.id}`,
    slug: category.slug,
    title: `${category.title} Essentials`,
    description: `A structured FireLearn path for ${category.title.toLowerCase()} with reading, knowledge checks, quizzes, flashcards, references, and completion tracking.`,
    categoryId: category.id,
    difficulty,
    estimatedMinutes: 45 + (index % 4) * 15,
    progressPercent: index < 4 ? [62, 35, 15, 8][index] : 0,
    xp: 300 + index * 20,
    modules: [
      {
        id: `module-${category.id}-core`,
        title: 'Core concepts',
        description: `Foundational concepts and decision points for ${category.title.toLowerCase()}.`,
        lessons: [makeLesson(category.id, category.title, difficulty)],
      },
    ],
  }
})

const readingSmokeQuestion: QuizQuestion = {
  id: 'q-reading-smoke-1',
  type: 'multiple-choice',
  prompt: 'Which combination is commonly used to read smoke conditions?',
  options: ['Volume, velocity, density, color', 'Height, odor, sound, time', 'Fuel, foam, ladder, nozzle', 'Heat, radio, hydrant, crew size'],
  correctAnswerIds: ['Volume, velocity, density, color'],
  explanation: 'Volume, velocity, density, and color help crews infer fire location, stage, and ventilation conditions.',
  topicIds: ['fire-behaviour', 'fire-dynamics'],
}

const readingSmokeScenario: QuizQuestion = {
  id: 'q-reading-smoke-2',
  type: 'scenario',
  prompt: 'A small structure shows turbulent dark smoke under pressure from the eaves. What is the safest interpretation?',
  options: ['Conditions are improving', 'The fire may be ventilation-limited and worsening', 'No interior hazard exists', 'The smoke is only steam'],
  correctAnswerIds: ['The fire may be ventilation-limited and worsening'],
  explanation: 'Pressurized, turbulent smoke can indicate high heat and a ventilation-limited fire environment. Coordinate ventilation and water application.',
  topicIds: ['fire-behaviour', 'ventilation'],
  timeLimitSeconds: 90,
}

const readingSmokeCards: Flashcard[] = [
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

starterCourses[0] = {
  ...starterCourses[0],
  title: 'Reading Smoke & Fire Growth',
  slug: 'reading-smoke-and-fire-growth',
  description: 'Build pattern recognition for smoke, heat release, flow path, and early fire behavior decisions.',
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
          ...makeLesson('fire-behaviour', 'Fire Behaviour', 'Firefighter I'),
          id: 'lesson-reading-smoke',
          slug: 'reading-smoke-indicators',
          title: 'Reading Smoke Indicators',
          estimatedMinutes: 18,
          objectives: ['Identify smoke volume, velocity, density, and color', 'Connect changing smoke to likely fire conditions', 'Choose safer tactical questions before entry'],
          content: [
            { type: 'paragraph', text: 'Smoke is information. Its movement, pressure, density, and color can help firefighters estimate fire location, growth stage, and ventilation profile before committing crews.' },
            { type: 'callout', title: 'Operational mindset', text: 'Use smoke reading to ask better questions. It supports size-up; it does not replace your department SOPs, officer judgment, or live instructor evaluation.' },
            { type: 'list', title: 'Four primary attributes', items: ['Volume: how much smoke is being produced', 'Velocity: how forcefully smoke is moving', 'Density: how much fuel is suspended in the smoke', 'Color: what stage or material clues may be present'] },
          ],
          videoPlaceholder: 'Future video: coordinated size-up of smoke indicators at a residential fire.',
          knowledgeCheck: readingSmokeQuestion,
          summary: ['Smoke reading improves risk assessment.', 'The four attributes are most useful when interpreted together.', 'Changing conditions should trigger communication and tactical reassessment.'],
          quiz: [readingSmokeQuestion, readingSmokeScenario],
          flashcards: readingSmokeCards,
          completion: { completed: false, percent: 70 },
        },
      ],
    },
  ],
}

export const academyCourses: Course[] = starterCourses

export const educationalDisclaimer = 'FireLearn content is educational support only. It does not replace official firefighter training, department SOPs, local regulations, certification requirements, AHJ direction, or instructor-led evaluation.'

export function getCategoryTitle(categoryId: string) {
  return categories.find((category) => category.id === categoryId)?.title ?? categoryId
}

export function getFeaturedLesson() {
  return academyCourses[0].modules[0]?.lessons[0]
}
