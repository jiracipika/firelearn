import type { Course, Difficulty, Flashcard, Lesson, QuizQuestion } from '@/types/learning'
import { categories } from '@/data/categories'
import { validateCourses } from '@/lib/content-validation'

const today = new Date().toISOString()

type RichLessonSeed = {
  categoryId: string
  courseTitle: string
  courseSlug: string
  courseDescription: string
  difficulty: Difficulty
  estimatedMinutes: number
  xp: number
  moduleTitle: string
  moduleDescription: string
  lessonSlug: string
  lessonTitle: string
  objectives: string[]
  prerequisites: string[]
  paragraphs: string[]
  callout: { title: string; text: string }
  checklistTitle: string
  checklist: string[]
  knowledgeCheck: QuizQuestion
  quiz: QuizQuestion[]
  flashcards: Flashcard[]
  summary: string[]
}

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
      { type: 'paragraph', text: `${title} knowledge improves fireground decisions when it is practiced as part of a complete training system. This lesson introduces the vocabulary, safety mindset, and decision points firefighters should recognize before moving into scenario practice.` },
      { type: 'callout', title: 'Training boundary', text: 'This material supports study. It does not authorize independent tactical action, replace certification, or override command, SOPs, AHJ requirements, or instructor-led evaluation.' },
      { type: 'list', title: 'Study pattern', items: ['Review the concept', 'Answer a knowledge check', 'Practice recall with flashcards', 'Discuss the tactic with an instructor or company officer', 'Apply only within approved practical training'] },
    ],
    imageAlt: `Firefighter training context for ${title.toLowerCase()}`,
    videoPlaceholder: `Future video placeholder: instructor-led walkthrough for ${title}.`,
    knowledgeCheck: question,
    summary: [`${title} study should improve recognition and communication.`, 'Digital lessons are strongest when paired with supervised drills.', 'Local rules, SOPs, and command direction always control real incidents.'],
    quiz: [question],
    flashcards: [flashcard],
    references: ['Department SOPs', 'Authority Having Jurisdiction guidance', 'Instructor-led certification materials', 'Applicable NFPA/local standards where adopted'],
    completion: { completed: false, percent: 0 },
  }
}

function card(id: string, front: string, back: string, topicIds: string[], difficulty: Difficulty, intervalDays = 0, reviewCount = 0): Flashcard {
  return { id, front, back, topicIds, difficulty, easeFactor: 2.5, intervalDays, nextReview: today, reviewCount }
}

const richLessonSeeds: RichLessonSeed[] = [
  {
    categoryId: 'fire-behaviour',
    courseTitle: 'Reading Smoke & Fire Growth',
    courseSlug: 'reading-smoke-and-fire-growth',
    courseDescription: 'Build pattern recognition for smoke, heat release, flow path, and early fire behavior decisions.',
    difficulty: 'Firefighter I',
    estimatedMinutes: 95,
    xp: 450,
    moduleTitle: 'Compartment fire indicators',
    moduleDescription: 'Recognize conditions before they become firefighter emergencies.',
    lessonSlug: 'reading-smoke-indicators',
    lessonTitle: 'Reading Smoke Indicators',
    objectives: ['Identify smoke volume, velocity, density, and color', 'Connect changing smoke to likely fire conditions', 'Choose safer tactical questions before entry'],
    prerequisites: ['Basic PPE awareness', 'Department accountability procedures', 'Introductory fire dynamics vocabulary'],
    paragraphs: [
      'Smoke is information. Its movement, pressure, density, and color can help firefighters estimate fire location, growth stage, and ventilation profile before committing crews.',
      'A useful size-up does not treat smoke color as a magic answer. Volume, velocity, density, and color must be interpreted together with building type, openings, wind, reports from occupants, and time since dispatch.',
      'Rapidly increasing pressure, turbulent movement, or lowering smoke layers should trigger communication. Those changes can indicate that the interior environment is moving faster than crews can safely control without coordinated water application and ventilation.',
    ],
    callout: { title: 'Operational mindset', text: 'Use smoke reading to ask better questions. It supports size-up; it does not replace your department SOPs, officer judgment, or live instructor evaluation.' },
    checklistTitle: 'Four primary attributes',
    checklist: ['Volume: how much smoke is being produced', 'Velocity: how forcefully smoke is moving', 'Density: how much fuel is suspended in the smoke', 'Color: what stage or material clues may be present'],
    knowledgeCheck: {
      id: 'q-reading-smoke-1',
      type: 'multiple-choice',
      prompt: 'Which combination is commonly used to read smoke conditions?',
      options: ['Volume, velocity, density, color', 'Height, odor, sound, time', 'Fuel, foam, ladder, nozzle', 'Heat, radio, hydrant, crew size'],
      correctAnswerIds: ['Volume, velocity, density, color'],
      explanation: 'Volume, velocity, density, and color help crews infer fire location, stage, and ventilation conditions.',
      topicIds: ['fire-behaviour', 'fire-dynamics'],
    },
    quiz: [
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
    ],
    flashcards: [
      card('fc-smoke-vvdc', 'What four smoke attributes should firefighters evaluate?', 'Volume, velocity, density, and color. Evaluate them together, not in isolation.', ['fire-behaviour'], 'Firefighter I'),
      card('fc-flow-path', 'Why does flow path matter during interior operations?', 'Openings can move heat, smoke, and fire through predictable paths toward crews or victims.', ['fire-dynamics', 'ventilation'], 'Firefighter II', 2, 2),
    ],
    summary: ['Smoke reading improves risk assessment.', 'The four attributes are most useful when interpreted together.', 'Changing conditions should trigger communication and tactical reassessment.'],
  },
  {
    categoryId: 'scba',
    courseTitle: 'SCBA Air Management',
    courseSlug: 'scba-air-management',
    courseDescription: 'Understand air checks, work cycles, emergency procedures, and exit decision points before the low-air alarm becomes the plan.',
    difficulty: 'Firefighter I',
    estimatedMinutes: 110,
    xp: 520,
    moduleTitle: 'Air as a tactical clock',
    moduleDescription: 'Treat cylinder pressure as a shared crew resource and decision trigger.',
    lessonSlug: 'rule-of-air-management',
    lessonTitle: 'Rule of Air Management',
    objectives: ['Explain why exit decisions must happen before emergency reserve air', 'Identify radio benchmarks for crew air checks', 'Describe what changes when work rate or travel distance increases'],
    prerequisites: ['SCBA donning and doffing basics', 'Department Mayday procedure', 'Accountability system overview'],
    paragraphs: [
      'SCBA air management is not just watching a gauge. It is a crew-level decision process that connects work rate, travel distance, conditions, task progress, and exit time.',
      'The point of an air check is not to collect a number. The point is to compare that number against location, assignment, and the route back to a safer atmosphere. A crew deep inside a large structure has a different margin than a crew at the threshold.',
      'Good air discipline keeps firefighters from turning a normal assignment into a Mayday. Crews should communicate air benchmarks early, preserve team integrity, and exit with enough reserve to solve a problem on the way out.',
    ],
    callout: { title: 'Crew integrity', text: 'Air decisions should be made as a crew unless department procedures or emergency conditions dictate otherwise. Splitting a crew to stretch air is a warning sign, not a strategy.' },
    checklistTitle: 'Air check conversation',
    checklist: ['Current lowest cylinder pressure', 'Crew location and route complexity', 'Assignment progress', 'Changing heat or visibility', 'Exit decision point'],
    knowledgeCheck: {
      id: 'q-scba-air-1',
      type: 'scenario',
      prompt: 'A crew has completed part of an interior search and the lowest member reports rapidly dropping air. What is the best training principle?',
      options: ['Continue until the low-air alarm activates', 'Reassess assignment progress and exit margin immediately', 'Send only the low-air member out alone', 'Ignore air if visibility is improving'],
      correctAnswerIds: ['Reassess assignment progress and exit margin immediately'],
      explanation: 'Air is a tactical clock. The crew must reassess before reserve air becomes the only remaining plan.',
      topicIds: ['scba', 'mayday-procedures'],
      timeLimitSeconds: 90,
    },
    quiz: [
      {
        id: 'q-scba-air-1',
        type: 'scenario',
        prompt: 'A crew has completed part of an interior search and the lowest member reports rapidly dropping air. What is the best training principle?',
        options: ['Continue until the low-air alarm activates', 'Reassess assignment progress and exit margin immediately', 'Send only the low-air member out alone', 'Ignore air if visibility is improving'],
        correctAnswerIds: ['Reassess assignment progress and exit margin immediately'],
        explanation: 'Air is a tactical clock. The crew must reassess before reserve air becomes the only remaining plan.',
        topicIds: ['scba', 'mayday-procedures'],
        timeLimitSeconds: 90,
      },
      {
        id: 'q-scba-air-2',
        type: 'multiple-answer',
        prompt: 'Which factors should influence an SCBA exit decision? Select all that apply.',
        options: ['Lowest crew air pressure', 'Distance and complexity of exit path', 'Assignment progress', 'Helmet color', 'Heat and visibility changes'],
        correctAnswerIds: ['Lowest crew air pressure', 'Distance and complexity of exit path', 'Assignment progress', 'Heat and visibility changes'],
        explanation: 'Air decisions consider pressure, route, progress, work rate, and conditions. Helmet color is not an air-management factor.',
        topicIds: ['scba'],
      },
    ],
    flashcards: [
      card('fc-scba-air-clock', 'Why is SCBA air called a tactical clock?', 'Because remaining air must drive assignment progress, crew communication, and exit timing before reserve air is needed.', ['scba'], 'Firefighter I'),
      card('fc-scba-lowest-member', 'Whose air supply should guide crew exit planning?', 'The lowest-air member, considered with location, work rate, conditions, and route complexity.', ['scba'], 'Firefighter I'),
    ],
    summary: ['Air management is a crew decision process.', 'Air checks are useful only when tied to location and exit margin.', 'Exit before the emergency reserve becomes the plan.'],
  },
  {
    categoryId: 'incident-command',
    courseTitle: 'Incident Command Foundations',
    courseSlug: 'incident-command-foundations',
    courseDescription: 'Practice command structure, radio discipline, accountability, and tactical priorities for scalable fireground control.',
    difficulty: 'Company Officer',
    estimatedMinutes: 125,
    xp: 620,
    moduleTitle: 'Command presence and control',
    moduleDescription: 'Build the first-arriving command habits that make later complexity manageable.',
    lessonSlug: 'initial-incident-action-plan',
    lessonTitle: 'Initial Incident Action Plan',
    objectives: ['Name the first tactical priorities', 'Differentiate strategy from task-level tactics', 'Describe when command should expand the organization'],
    prerequisites: ['Radio communications basics', 'Accountability tags or electronic tracking overview', 'Department command terminology'],
    paragraphs: [
      'The first incident action plan does not need to be long. It needs to be clear enough that companies understand the strategy, immediate objectives, hazards, and accountability expectations.',
      'Early command often fails when task-level urgency crowds out strategic control. A strong initial report, declared strategy, resource request, and assignment structure create a foundation for later divisions, groups, or branches.',
      'Command should expand before span of control breaks. If one person is tracking attack, search, ventilation, utilities, exposures, staging, and RIT, the organization is already behind the incident.',
    ],
    callout: { title: 'Plain language matters', text: 'Use department-approved terminology, but keep radio traffic clear. The goal is shared understanding under stress, not sounding impressive.' },
    checklistTitle: 'Initial command scan',
    checklist: ['Life safety and rescue profile', 'Building and fire conditions', 'Declared strategy', 'Resource needs', 'Accountability and tactical assignments'],
    knowledgeCheck: {
      id: 'q-ics-iap-1',
      type: 'multiple-choice',
      prompt: 'What is the primary value of an initial incident action plan?',
      options: ['It gives crews clear strategy, objectives, hazards, and assignments', 'It replaces the need for accountability', 'It prevents conditions from changing', 'It allows every company to freelance'],
      correctAnswerIds: ['It gives crews clear strategy, objectives, hazards, and assignments'],
      explanation: 'The initial IAP creates shared direction and structure. It does not remove the need to monitor conditions or maintain accountability.',
      topicIds: ['incident-command'],
    },
    quiz: [
      {
        id: 'q-ics-iap-1',
        type: 'multiple-choice',
        prompt: 'What is the primary value of an initial incident action plan?',
        options: ['It gives crews clear strategy, objectives, hazards, and assignments', 'It replaces the need for accountability', 'It prevents conditions from changing', 'It allows every company to freelance'],
        correctAnswerIds: ['It gives crews clear strategy, objectives, hazards, and assignments'],
        explanation: 'The initial IAP creates shared direction and structure. It does not remove the need to monitor conditions or maintain accountability.',
        topicIds: ['incident-command'],
      },
      {
        id: 'q-ics-span-1',
        type: 'scenario',
        prompt: 'Command is directly managing attack, search, ventilation, utilities, staging, and RIT. What should command consider?',
        options: ['Expand the organization with divisions or groups', 'Stop tracking accountability', 'Move all traffic to cell phones', 'Delay resource requests until overhaul'],
        correctAnswerIds: ['Expand the organization with divisions or groups'],
        explanation: 'When span of control is exceeded, command should expand the ICS organization according to local procedures.',
        topicIds: ['incident-command', 'communications'],
      },
    ],
    flashcards: [
      card('fc-ics-iap-purpose', 'What does an initial IAP communicate?', 'Strategy, immediate objectives, hazards, resource needs, accountability expectations, and tactical assignments.', ['incident-command'], 'Company Officer'),
      card('fc-ics-span-control', 'What should command do when span of control is exceeded?', 'Expand the organization using appropriate divisions, groups, supervisors, or branches per local procedure.', ['incident-command'], 'Company Officer'),
    ],
    summary: ['A short, clear IAP is better than vague radio traffic.', 'Strategy and assignments must be understood by operating crews.', 'Command should expand before complexity overwhelms one supervisor.'],
  },
  {
    categoryId: 'mayday-procedures',
    courseTitle: 'Mayday Decision-Making',
    courseSlug: 'mayday-decision-making',
    courseDescription: 'Train early recognition, clear radio reporting, survival priorities, and command response for firefighter emergencies.',
    difficulty: 'Advanced',
    estimatedMinutes: 120,
    xp: 700,
    moduleTitle: 'Recognize and transmit early',
    moduleDescription: 'Build the habit of calling the Mayday before options disappear.',
    lessonSlug: 'early-mayday-triggers',
    lessonTitle: 'Early Mayday Triggers',
    objectives: ['Identify common Mayday trigger conditions', 'Describe why delay makes rescue harder', 'Construct a concise LUNAR-style report'],
    prerequisites: ['Department Mayday policy', 'Radio channel plan', 'SCBA emergency procedures'],
    paragraphs: [
      'A Mayday is not a personal failure. It is an emergency communication that gives command and crews the information needed to change the incident priorities and rescue a firefighter.',
      'Firefighters delay Maydays for predictable reasons: pride, uncertainty, radio congestion, or belief that the problem will resolve quickly. Training should make trigger conditions automatic enough to overcome hesitation.',
      'The exact acronym may vary by department, but the message should quickly communicate location, unit, name or identity, assignment and air, and resources needed. Brevity matters because the channel may be overloaded.',
    ],
    callout: { title: 'Call early', text: 'If you are lost, trapped, low on air with no exit solution, injured, separated, or unable to complete self-rescue, transmit according to your department procedure immediately.' },
    checklistTitle: 'Potential Mayday triggers',
    checklist: ['Lost or disoriented', 'Trapped or entangled', 'Low air without a clear exit plan', 'Separated from crew', 'Fall through floor or roof', 'SCBA failure or serious injury'],
    knowledgeCheck: {
      id: 'q-mayday-trigger-1',
      type: 'scenario',
      prompt: 'A firefighter is separated, low on air, and cannot identify the exit path. What is the best training principle?',
      options: ['Transmit a Mayday according to department procedure', 'Keep searching silently to avoid radio traffic', 'Wait until the cylinder is empty', 'Remove the facepiece to conserve air'],
      correctAnswerIds: ['Transmit a Mayday according to department procedure'],
      explanation: 'Separation, low air, and no exit solution are critical trigger conditions. Early Mayday communication improves rescue chances.',
      topicIds: ['mayday-procedures', 'scba'],
      timeLimitSeconds: 60,
    },
    quiz: [
      {
        id: 'q-mayday-trigger-1',
        type: 'scenario',
        prompt: 'A firefighter is separated, low on air, and cannot identify the exit path. What is the best training principle?',
        options: ['Transmit a Mayday according to department procedure', 'Keep searching silently to avoid radio traffic', 'Wait until the cylinder is empty', 'Remove the facepiece to conserve air'],
        correctAnswerIds: ['Transmit a Mayday according to department procedure'],
        explanation: 'Separation, low air, and no exit solution are critical trigger conditions. Early Mayday communication improves rescue chances.',
        topicIds: ['mayday-procedures', 'scba'],
        timeLimitSeconds: 60,
      },
      {
        id: 'q-mayday-lunar-1',
        type: 'multiple-answer',
        prompt: 'Which information is commonly useful in a concise Mayday report? Select all that apply.',
        options: ['Location', 'Unit or identity', 'Air status', 'Resources needed', 'Favorite tool brand'],
        correctAnswerIds: ['Location', 'Unit or identity', 'Air status', 'Resources needed'],
        explanation: 'Mayday reports should prioritize information command and rescue crews can act on immediately.',
        topicIds: ['mayday-procedures', 'communications'],
      },
    ],
    flashcards: [
      card('fc-mayday-triggers', 'Name four potential Mayday trigger conditions.', 'Lost, trapped, low air without exit, separated, serious injury, fall through, SCBA failure, or unable to self-rescue.', ['mayday-procedures'], 'Advanced'),
      card('fc-mayday-report', 'What should a concise Mayday report communicate?', 'Location, unit/identity, name if used locally, assignment/air, and resources needed according to department procedure.', ['mayday-procedures', 'communications'], 'Advanced'),
    ],
    summary: ['Mayday delay makes rescue harder.', 'Trigger conditions should be trained until recognition is automatic.', 'A concise report gives command actionable information.'],
  },
  {
    categoryId: 'building-construction',
    courseTitle: 'Building Construction & Collapse Cues',
    courseSlug: 'building-construction-collapse-cues',
    courseDescription: 'Recognize how construction type, fire load, lightweight systems, and time under fire change firefighter risk.',
    difficulty: 'Firefighter II',
    estimatedMinutes: 115,
    xp: 560,
    moduleTitle: 'Construction as risk prediction',
    moduleDescription: 'Use building features to forecast likely failure modes and tactical limits.',
    lessonSlug: 'lightweight-collapse-indicators',
    lessonTitle: 'Lightweight Collapse Indicators',
    objectives: ['Describe why lightweight assemblies can fail rapidly under fire', 'Identify visible collapse warning cues', 'Connect construction observations to tactical communication'],
    prerequisites: ['Basic building construction types', 'Fire behavior fundamentals', 'Department collapse zone procedure'],
    paragraphs: [
      'Building construction turns fire behavior into structural risk. The same fire conditions can produce very different hazards in dimensional lumber, lightweight truss, engineered I-joist, masonry, or legacy heavy timber buildings.',
      'Lightweight systems are efficient because they use less mass. That advantage for construction can become a disadvantage under fire: less material may mean less time before strength is lost, especially when fire reaches concealed spaces.',
      'Collapse prediction is imperfect. The goal is not certainty; the goal is disciplined suspicion. Sagging roofs, spongy floors, smoke pushing from concealed spaces, fire in truss voids, unusual noises, and time under fire should all be communicated.',
    ],
    callout: { title: 'Time matters', text: 'Unknown fire duration should increase caution. If crews do not know how long structural members have been heated, they should not assume normal strength remains.' },
    checklistTitle: 'Collapse cue scan',
    checklist: ['Construction type and age', 'Fire location relative to structural members', 'Visible deformation or sagging', 'Concealed-space smoke or fire', 'Unusual sounds or movement', 'Operational time under fire'],
    knowledgeCheck: {
      id: 'q-building-lightweight-1',
      type: 'multiple-choice',
      prompt: 'Why can lightweight construction create early collapse concerns?',
      options: ['Less structural mass can lose strength quickly when exposed to fire', 'It is always fireproof', 'It prevents fire spread into void spaces', 'It eliminates the need for collapse zones'],
      correctAnswerIds: ['Less structural mass can lose strength quickly when exposed to fire'],
      explanation: 'Lightweight assemblies can perform well normally but may lose strength rapidly once heated or burned through.',
      topicIds: ['building-construction'],
    },
    quiz: [
      {
        id: 'q-building-lightweight-1',
        type: 'multiple-choice',
        prompt: 'Why can lightweight construction create early collapse concerns?',
        options: ['Less structural mass can lose strength quickly when exposed to fire', 'It is always fireproof', 'It prevents fire spread into void spaces', 'It eliminates the need for collapse zones'],
        correctAnswerIds: ['Less structural mass can lose strength quickly when exposed to fire'],
        explanation: 'Lightweight assemblies can perform well normally but may lose strength rapidly once heated or burned through.',
        topicIds: ['building-construction'],
      },
      {
        id: 'q-building-cues-1',
        type: 'multiple-answer',
        prompt: 'Which are potential collapse warning cues? Select all that apply.',
        options: ['Sagging roofline', 'Spongy floor', 'Smoke from concealed spaces', 'Known fire impingement on trusses', 'Clean apparatus bay floor'],
        correctAnswerIds: ['Sagging roofline', 'Spongy floor', 'Smoke from concealed spaces', 'Known fire impingement on trusses'],
        explanation: 'Visible deformation, floor feel, concealed-space smoke, and fire contact with structural members are meaningful cues.',
        topicIds: ['building-construction', 'fire-behaviour'],
      },
    ],
    flashcards: [
      card('fc-building-lightweight-risk', 'Why should lightweight assemblies be treated with disciplined suspicion under fire?', 'They may have less mass and can lose strength quickly when fire reaches structural members or concealed spaces.', ['building-construction'], 'Firefighter II'),
      card('fc-building-collapse-cues', 'Name four collapse warning cues.', 'Sagging, spongy floors, unusual noises, concealed-space smoke/fire, fire impingement on structural members, or unknown time under fire.', ['building-construction'], 'Firefighter II'),
    ],
    summary: ['Construction observations should change tactical risk assessment.', 'Lightweight systems can fail rapidly once fire affects structural members.', 'Collapse cues must be communicated early and clearly.'],
  },
]

function lessonFromSeed(seed: RichLessonSeed): Lesson {
  return {
    id: `lesson-${seed.categoryId}-${seed.lessonSlug}`,
    slug: seed.lessonSlug,
    title: seed.lessonTitle,
    difficulty: seed.difficulty,
    estimatedMinutes: Math.round(seed.estimatedMinutes / 4),
    objectives: seed.objectives,
    prerequisites: seed.prerequisites,
    content: [
      ...seed.paragraphs.map((text) => ({ type: 'paragraph' as const, text })),
      { type: 'callout', title: seed.callout.title, text: seed.callout.text },
      { type: 'list', title: seed.checklistTitle, items: seed.checklist },
    ],
    imageAlt: `Training visual for ${seed.lessonTitle.toLowerCase()}`,
    videoPlaceholder: `Future instructor video: ${seed.lessonTitle}.`,
    knowledgeCheck: seed.knowledgeCheck,
    summary: seed.summary,
    quiz: seed.quiz,
    flashcards: seed.flashcards,
    references: ['Department SOPs', 'Authority Having Jurisdiction guidance', 'Instructor-led certification materials', 'Applicable NFPA/local standards where adopted'],
    completion: { completed: false, percent: seed.categoryId === 'fire-behaviour' ? 70 : 0 },
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
    modules: [{ id: `module-${category.id}-core`, title: 'Core concepts', description: `Foundational concepts and decision points for ${category.title.toLowerCase()}.`, lessons: [makeLesson(category.id, category.title, difficulty)] }],
  }
})

richLessonSeeds.forEach((seed) => {
  const index = starterCourses.findIndex((course) => course.categoryId === seed.categoryId)
  if (index === -1) return
  starterCourses[index] = {
    ...starterCourses[index],
    title: seed.courseTitle,
    slug: seed.courseSlug,
    description: seed.courseDescription,
    difficulty: seed.difficulty,
    estimatedMinutes: seed.estimatedMinutes,
    xp: seed.xp,
    progressPercent: seed.categoryId === 'fire-behaviour' ? 62 : starterCourses[index].progressPercent,
    modules: [{ id: `module-${seed.categoryId}-core`, title: seed.moduleTitle, description: seed.moduleDescription, lessons: [lessonFromSeed(seed)] }],
  }
})

export const academyCourses: Course[] = validateCourses(starterCourses)

export const educationalDisclaimer = 'FireLearn content is educational support only. It does not replace official firefighter training, department SOPs, local regulations, certification requirements, AHJ direction, or instructor-led evaluation.'

export function getCategoryTitle(categoryId: string) {
  return categories.find((category) => category.id === categoryId)?.title ?? categoryId
}

export function getFeaturedLesson() {
  return academyCourses[0].modules[0]?.lessons[0]
}
