import type { Course, Difficulty, Flashcard, Lesson, LessonVideo, QuizQuestion } from '@/types/learning'
import { categories } from '@/data/categories'
import { validateCourses } from '@/lib/content-validation'
import { examPrepSeeds, type ExamPrepSeed } from '@/data/exam-prep-seeds'

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
    videoPlaceholder: `Watch the embedded ${title.toLowerCase()} tutorials before starting the reading and knowledge check.`,
    videos: videosForTopic(categoryId),
    knowledgeCheck: question,
    summary: [`${title} study should improve recognition and communication.`, 'Digital lessons are strongest when paired with supervised drills.', 'Local rules, SOPs, and command direction always control real incidents.'],
    quiz: enrichQuiz([question], categoryId, `${categoryId}-foundations`, `${title} Foundations`),
    flashcards: [flashcard],
    references: ['Department SOPs', 'Authority Having Jurisdiction guidance', 'Instructor-led certification materials', 'Applicable NFPA/local standards where adopted'],
    completion: { completed: false, percent: 0 },
  }
}

function makeScenarioDrillLesson(categoryId: string, title: string, difficulty: Difficulty): Lesson {
  const normalizedTitle = title.toLowerCase()
  const scenarioQuestion: QuizQuestion = {
    id: `q-${categoryId}-scenario-drill-1`,
    type: 'case-study',
    prompt: `Case study: During a ${normalizedTitle} drill, conditions change and the company officer asks for a quick risk update. What is the strongest response?`,
    options: [
      'Report the observed change, connect it to a likely hazard, and recommend a department-approved next action',
      'Wait until the drill ends before saying anything',
      'Give a tactic that ignores local SOPs because it appeared in a lesson',
      'Focus only on speed and skip the risk cue',
    ],
    correctAnswerIds: ['Report the observed change, connect it to a likely hazard, and recommend a department-approved next action'],
    explanation: 'Scenario drills should convert observations into clear communication and safe action within department procedures. The goal is decision quality, not memorized trivia.',
    topicIds: [categoryId],
    timeLimitSeconds: 120,
  }
  const multipleAnswerQuestion: QuizQuestion = {
    id: `q-${categoryId}-scenario-drill-2`,
    type: 'multiple-answer',
    prompt: `Which habits make ${normalizedTitle} training transfer better to real incidents? Select all that apply.`,
    options: [
      'Use standard radio language',
      'Connect cues to tactical priorities',
      'Debrief decisions after the scenario',
      'Ignore accountability to move faster',
      'Confirm actions against SOPs and instructor feedback',
    ],
    correctAnswerIds: ['Use standard radio language', 'Connect cues to tactical priorities', 'Debrief decisions after the scenario', 'Confirm actions against SOPs and instructor feedback'],
    explanation: 'Transfer improves when firefighters practice communication, cue recognition, debriefing, and SOP alignment. Accountability is never optional.',
    topicIds: [categoryId, 'communications'],
  }

  return {
    id: `lesson-${categoryId}-scenario-drill`,
    slug: `${categoryId}-scenario-drill`,
    title: `${title} Scenario Drill`,
    difficulty,
    estimatedMinutes: 22,
    objectives: [
      `Apply ${normalizedTitle} concepts to a realistic training scenario`,
      'Practice risk communication using concise radio language',
      'Identify which cues should trigger reassessment or command notification',
    ],
    prerequisites: ['Completion of the foundation lesson', 'Department SOP review', 'Instructor or company officer debrief process'],
    content: [
      { type: 'paragraph', text: `Scenario practice turns ${normalizedTitle} from vocabulary into judgment. The firefighter should identify cues, communicate what changed, and connect the observation to a safe next step.` },
      { type: 'paragraph', text: 'A useful drill includes a trigger event: worsening smoke, changing victim information, air consumption, radio congestion, water supply delay, structural concern, or a command update. The learner should explain what the trigger means and what they would communicate.' },
      { type: 'callout', title: 'Debrief standard', text: 'A good answer should be specific, observable, and tied to local procedures. Avoid vague statements like “be careful” when a concrete risk cue can be reported.' },
      { type: 'list', title: 'Scenario rep sequence', items: ['Observe the cue', 'Name the hazard', 'Communicate the change', 'Recommend or request the next approved action', 'Debrief what improved and what was missed'] },
    ],
    imageAlt: `Scenario-based ${normalizedTitle} training drill`,
    videoPlaceholder: `Watch the embedded ${normalizedTitle} tutorials, then run the scenario questions as a decision drill.`,
    videos: videosForTopic(categoryId),
    knowledgeCheck: scenarioQuestion,
    summary: [`${title} scenario reps build judgment under changing conditions.`, 'The strongest answers connect cues, hazards, communication, and approved actions.', 'Debriefing turns a single drill into durable learning.'],
    quiz: enrichQuiz([scenarioQuestion, multipleAnswerQuestion], categoryId, `${categoryId}-scenario-drill`, `${title} Scenario Drill`),
    flashcards: [
      card(`fc-${categoryId}-scenario-cue`, `In a ${normalizedTitle} scenario, what should you communicate first when conditions change?`, 'Report the specific observed cue, why it matters, and what action or reassessment is needed under department procedure.', [categoryId, 'communications'], difficulty),
      card(`fc-${categoryId}-debrief`, 'What makes a FireLearn scenario debrief useful?', 'It compares observed cues, decisions, communication, SOP alignment, and missed opportunities without treating the app as a certification authority.', [categoryId], difficulty),
    ],
    references: ['Department SOPs', 'Instructor-led scenario debriefs', 'Authority Having Jurisdiction guidance', 'Applicable NFPA/local standards where adopted'],
    completion: { completed: false, percent: 0 },
  }
}

function card(id: string, front: string, back: string, topicIds: string[], difficulty: Difficulty, intervalDays = 0, reviewCount = 0): Flashcard {
  return { id, front, back, topicIds, difficulty, easeFactor: 2.5, intervalDays, nextReview: today, reviewCount }
}

type VideoSeed = { id: string; title: string }
type QuestionTemplate = Omit<QuizQuestion, 'id' | 'topicIds'> & { topicIds?: string[] }

const topicVideoLibrary: Record<string, VideoSeed[]> = {
  'fire-behaviour': [
    { id: 'cLBtRwJ93aQ', title: 'The Art of Reading Smoke' },
    { id: 'U9HgTQsH_m4', title: 'Fire Behavior 101' },
    { id: 'fHUjG5Zt1tM', title: 'Fireground Size-Up and Reading Smoke' },
  ],
  'building-construction': [
    { id: '79rDCXSf-UM', title: 'Building Construction Collapse Indicators' },
    { id: 'A6LpkfZHTeM', title: 'Construction Risk for Firefighters' },
    { id: 'JqtMVWnblIo', title: 'Collapse Awareness Training' },
  ],
  'fire-dynamics': [
    { id: '7EKBYtRQSW4', title: 'Understanding Flow Paths' },
    { id: 'O8s3Q57TZtE', title: 'Fire Flows From High Pressure to Low Pressure' },
    { id: 'nJY688j9QT4', title: 'Modern VES and Flow Path Control' },
  ],
  'search-and-rescue': [
    { id: '0R5zSWOd_Vs', title: 'VEIS: Vent, Enter, Isolate, Search' },
    { id: '89E69lFcTmI', title: 'V.E.I.S. Rescue Technique' },
    { id: 'RHJNPe9bWyY', title: 'Vent-Enter-Search Tools' },
  ],
  'incident-command': [
    { id: '1X4JpjMnIJ8', title: 'Incident Command System Scenario Refresher' },
    { id: 'P-dPBso2xPM', title: 'Introduction to the Incident Command System' },
    { id: 'BNI5EFMCwZ8', title: 'Incident Command Scenario Training' },
  ],
  communications: [
    { id: 'VLC_AuNhDak', title: 'Radio Communications Procedures' },
    { id: 'j2f6aE69G14', title: 'Firefighter Radio Communications Training' },
    { id: 'Z5u56U-JRn8', title: 'Fireground Radio Skills' },
  ],
  ventilation: [
    { id: 'ZB2Je4C2_m4', title: 'Coordinated Ventilation' },
    { id: 'z_4bFtGoZks', title: 'Fire Department Ventilation Techniques' },
    { id: 'X7r8iSAuP4w', title: 'Fire Training Course: Ventilation' },
  ],
  ladders: [
    { id: '-ekoZjdudoQ', title: 'Ladders Basics' },
    { id: 'Vxex_rQrFNA', title: 'Ground Ladders Training' },
    { id: '5e4S2Ky34vE', title: 'Firefighter Ladder Operations' },
  ],
  ropes: [
    { id: 'ik35SXGrjsw', title: 'Firefighter Knots and Ropes' },
    { id: '3O1puuJK7E0', title: 'Rope Rescue Knot Practice' },
    { id: 'MIWtwWPCIOI', title: 'Fire Service Rope Skills' },
  ],
  'forcible-entry': [
    { id: 'u8BKpvxkhQ8', title: 'Halligan Forcible Entry Training' },
    { id: 'mnvrHBli06M', title: 'Conventional Forcible Entry' },
    { id: '98T0VRSyi98', title: 'Door Forcing Skill Drill' },
  ],
  ppe: [
    { id: 'OZsdgJFWI5E', title: 'Turnout Gear Inspection Training' },
    { id: 'D73lGG8UOv8', title: 'Firefighter PPE Inspection' },
    { id: 'lst2l7PQGOk', title: 'Structural PPE Basics' },
  ],
  scba: [
    { id: 'yVQMDtmZiLo', title: 'SCBA Breathing Techniques' },
    { id: 'Dkqf-yUyDWM', title: 'Three SCBA Breathing Techniques' },
    { id: 'oGzX95dsChk', title: 'SCBA Air Management Training' },
  ],
  medical: [
    { id: '3uj-wUYxcWA', title: 'EMR Review for First Responders' },
    { id: 'hi4aWvRxeG4', title: 'EMT Class Review' },
    { id: 'tMfFt7i66Uw', title: 'EMR Medical Assessment' },
  ],
  'vehicle-extrication': [
    { id: 'kQ4TInm55dw', title: 'Auto Extrication Dash Roll' },
    { id: 'V4ZlAjkfZtc', title: 'Eight-Minute Extrication Training' },
    { id: 'h_zVjEpgFDM', title: 'Vehicle Extrication Training' },
  ],
  'hazmat-awareness': [
    { id: '3v4QUaTAKY8', title: 'How To Use the ERG' },
    { id: 'pDi5okZiYM4', title: 'Hazardous Materials Awareness' },
    { id: 'BTVNQ3H9tjo', title: 'ERG Scenario-Based Practice' },
  ],
  'wildland-firefighting': [
    { id: 'CoHCVC8DI6Y', title: 'Preparing for Wildland Firefighting' },
    { id: 'vxSI1uXuBsk', title: 'Wildland Firefighter Basics' },
    { id: 'qCrbeXsDPp0', title: 'Wildland Fire Training' },
  ],
  'fire-prevention': [
    { id: 'oKBVDJMnpW0', title: 'Fire Inspection Ride-Along' },
    { id: 'yodLMfOZNvA', title: 'Fire Extinguisher Training' },
    { id: 'IIdG4Em92Hc', title: 'Follow Along With a Fire Inspection' },
  ],
  'fire-investigation': [
    { id: 'KsrvvZ3DsN4', title: 'Fire Investigation Techniques' },
    { id: 'U9HgTQsH_m4', title: 'Fire Behavior 101' },
    { id: 'rmFMdrPuV5Y', title: 'Fire Investigation Training Video' },
  ],
  'emergency-driving': [
    { id: 'wqQIQMRCCiU', title: 'Emergency Vehicle Operations' },
    { id: 'Gaj_n3rXN6o', title: 'Driver Operator Safety' },
    { id: 'gvl_QqzElX4', title: 'Fire Apparatus Driving Training' },
  ],
  'water-supply': [
    { id: '7j8SYZEE-1A', title: 'Forward Lay and Hydrant Water Supply' },
    { id: 'BpZJkNu5rSU', title: 'Obtaining a Water Supply' },
    { id: '7jg_BY4qpRo', title: 'Hydrant Operations Training' },
  ],
  'pump-operations': [
    { id: 'BpZJkNu5rSU', title: 'Basic Pump Operations' },
    { id: 'l5S_AmGLFvk', title: 'Basic Pumper Operations' },
    { id: 'Mnjdh5CCH40', title: 'Pump Operations Training' },
  ],
  hydraulics: [
    { id: 'tOdO39TmB8M', title: 'Calculating Friction Loss' },
    { id: 'McUG7CxR-08', title: 'Modern Friction Loss Formula' },
    { id: 'bic2cAt7Das', title: 'Hand Method for Friction Loss' },
  ],
  'fire-streams': [
    { id: '-sQUDqvEtAY', title: 'Fire Stream and Nozzle Basics' },
    { id: '0Epyqi0ISGk', title: 'Fire Streams and Nozzles' },
    { id: 'W1I_6ELDojg', title: 'Fire Streams' },
  ],
  'thermal-imaging': [
    { id: 's2nRd7FpVX8', title: 'Thermal Imaging Camera Training' },
    { id: 'NUrgHtwr3VI', title: 'TIC Search and Fire Attack' },
    { id: 'AvDpCyPP0gc', title: 'Firefighter TIC Skills' },
  ],
  leadership: [
    { id: 'S1lwPMTBhOI', title: 'What Makes a Great Fire Service Officer' },
    { id: 'XZPW0EMOthM', title: 'Rules for a New Company Officer' },
    { id: 'dypmM1LDa-M', title: 'Passionate Leadership in the Fire Service' },
  ],
  'mental-health': [
    { id: 'pfLu1mUNL7Y', title: 'Firefighters Mental Wellness' },
    { id: '_gDaHeoRx6Q', title: 'Mindfulness and Mental Rehearsal' },
    { id: 'aOmkJ5OCorE', title: 'Firefighter Behavioral Health Seminar' },
  ],
  'mayday-procedures': [
    { id: 'pRjVXLC-MW8', title: 'Calling the Mayday' },
    { id: 'Q3FSsOSw1tY', title: 'Firefighter Mayday Training' },
    { id: 'J_rhTqaTn7k', title: 'Initiating a Mayday' },
  ],
  'canadian-fire-codes': [
    { id: 'JXBsCh3_9HU', title: 'Toronto Fire Code Updates Webinar' },
    { id: 'IdjJRDEFu0k', title: 'Fire Code Compliance and Enforcement' },
    { id: 'n3WgTA8-jug', title: 'NFPA Codes and Standards in Canada' },
  ],
  'nfpa-standards': [
    { id: 'GY_IRRel32Q', title: 'NFPA 1001 Firefighter Knots' },
    { id: 'tO-owtWD924', title: 'NFPA Standards for the Fire Service' },
    { id: '-WPTy2HwMxY', title: 'Fire Service Knots: NFPA 1001 Edition' },
  ],
  'electric-vehicle-incidents': [
    { id: 'K9Ksrth5B1g', title: 'Electric Vehicle Emergency Response Awareness' },
    { id: 'kHkY3mGpFJk', title: 'Electric Vehicle Fire Safety Training' },
    { id: 'EaPOhYhToH4', title: 'Lithium-Ion Battery Fire Response' },
  ],
  'firefighter-rehab': [
    { id: 'BQ_6W8eW1sM', title: 'Firefighter Rehab and Heat Stress' },
    { id: 'DDf9yFjKxLc', title: 'Emergency Incident Rehabilitation' },
    { id: 'H8PNqWmNwq0', title: 'Firefighter Heat Stress Prevention' },
  ],
  'cancer-prevention-and-decon': [
    { id: 'OtKlrTc7H3M', title: 'Firefighter Gross Decontamination' },
    { id: '8eD3ug9nWRs', title: 'Firefighter Cancer Prevention' },
    { id: 'E9p3nTVcP9A', title: 'PPE Decon and Exposure Reduction' },
  ],
}

const fallbackVideos: VideoSeed[] = [
  { id: 'U9HgTQsH_m4', title: 'Fire Behavior 101' },
  { id: 'P-dPBso2xPM', title: 'Introduction to Incident Command' },
  { id: 'VLC_AuNhDak', title: 'Fireground Radio Communications' },
]

function videosForTopic(categoryId: string): LessonVideo[] {
  return (topicVideoLibrary[categoryId] ?? fallbackVideos).map((video) => ({
    id: `yt-${categoryId}-${video.id}`,
    title: video.title,
    source: 'YouTube',
    url: `https://www.youtube.com/watch?v=${video.id}`,
    embedUrl: `https://www.youtube-nocookie.com/embed/${video.id}`,
  }))
}

const genericQuestionTemplates: QuestionTemplate[] = [
  {
    type: 'scenario',
    prompt: 'A training evolution starts to drift from the department plan. What should the learner do first?',
    options: ['Pause and confirm the approved objective with the instructor or officer', 'Continue because speed matters most', 'Change tactics without telling anyone', 'Treat the app as command authority'],
    correctAnswerIds: ['Pause and confirm the approved objective with the instructor or officer'],
    explanation: 'Digital learning supports preparation. Practical work must stay aligned with the instructor, company officer, SOPs, and the authority having jurisdiction.',
    timeLimitSeconds: 90,
  },
  {
    type: 'multiple-answer',
    prompt: 'Which habits improve transfer from lesson study to supervised fire service training? Select all that apply.',
    options: ['Name observable cues', 'Use standard terminology', 'Debrief errors after the rep', 'Ignore PPE checks', 'Connect decisions to local SOPs'],
    correctAnswerIds: ['Name observable cues', 'Use standard terminology', 'Debrief errors after the rep', 'Connect decisions to local SOPs'],
    explanation: 'Good study becomes operationally useful when firefighters can identify cues, communicate clearly, debrief honestly, and connect decisions to local procedure.',
  },
]

const topicQuestionTemplates: Record<string, QuestionTemplate[]> = {
  'fire-behaviour': [
    {
      type: 'scenario',
      prompt: 'Smoke changes from lazy gray to turbulent, dark, pressurized movement. What should this trigger?',
      options: ['A radio update and reassessment of fire conditions', 'A decision to ignore ventilation timing', 'Removal of SCBA facepieces', 'Freelancing by the nearest crew'],
      correctAnswerIds: ['A radio update and reassessment of fire conditions'],
      explanation: 'Changing smoke pressure, density, and velocity can indicate worsening compartment conditions and should be communicated before tactics continue.',
      topicIds: ['fire-dynamics', 'ventilation'],
      timeLimitSeconds: 75,
    },
    {
      type: 'multiple-choice',
      prompt: 'Which smoke-reading attribute most directly describes how forcefully smoke is moving?',
      options: ['Velocity', 'Color', 'Volume', 'Occupancy'],
      correctAnswerIds: ['Velocity'],
      explanation: 'Velocity describes smoke movement and pressure. It should be read with volume, density, and color rather than as a standalone answer.',
      topicIds: ['fire-dynamics'],
    },
  ],
  scba: [
    {
      type: 'scenario',
      prompt: 'A crew member reports the lowest air pressure and a longer-than-expected exit path. What is the best next step?',
      options: ['Begin crew-level exit planning immediately', 'Split the low-air member from the crew', 'Wait for the low-air alarm', 'Turn off PASS devices to reduce stress'],
      correctAnswerIds: ['Begin crew-level exit planning immediately'],
      explanation: 'Air management is a crew decision. Lowest member air, route complexity, work rate, and conditions should drive early exit decisions.',
      topicIds: ['mayday-procedures'],
      timeLimitSeconds: 75,
    },
    {
      type: 'multiple-answer',
      prompt: 'Which items belong in an SCBA status update? Select all that apply.',
      options: ['Lowest cylinder pressure', 'Crew location', 'Assignment progress', 'Exit route complexity', 'Preferred helmet sticker'],
      correctAnswerIds: ['Lowest cylinder pressure', 'Crew location', 'Assignment progress', 'Exit route complexity'],
      explanation: 'Useful air updates connect the pressure number to location, task progress, and the path back to a safer atmosphere.',
    },
  ],
  ventilation: [
    {
      type: 'scenario',
      prompt: 'A window can be taken before the attack line is ready. What is the safest training answer?',
      options: ['Coordinate timing with command and fire attack before opening', 'Vent immediately because any air movement helps', 'Create every possible opening', 'Ignore interior crew location'],
      correctAnswerIds: ['Coordinate timing with command and fire attack before opening'],
      explanation: 'Ventilation changes the flow path and fire growth. It must be coordinated with command, water application, and interior crew position.',
      topicIds: ['fire-behaviour'],
      timeLimitSeconds: 75,
    },
    {
      type: 'multiple-answer',
      prompt: 'What should be confirmed before tactical ventilation? Select all that apply.',
      options: ['Command approval', 'Attack coordination', 'Interior crew awareness', 'Likely flow path', 'That no one has a radio'],
      correctAnswerIds: ['Command approval', 'Attack coordination', 'Interior crew awareness', 'Likely flow path'],
      explanation: 'Command, attack, crew location, and flow path all matter before making a ventilation opening.',
    },
  ],
  'hazmat-awareness': [
    {
      type: 'multiple-choice',
      prompt: 'What is the awareness-level responder priority at a suspected hazmat release?',
      options: ['Recognize, isolate, protect, and request trained resources', 'Patch the leak immediately', 'Enter the hot zone for samples', 'Move containers by hand'],
      correctAnswerIds: ['Recognize, isolate, protect, and request trained resources'],
      explanation: 'Awareness-level responders focus on recognition and protective actions from a safe position.',
    },
    {
      type: 'multiple-answer',
      prompt: 'Which clues can identify a hazardous material? Select all that apply.',
      options: ['Placards', 'Container shape', 'Shipping papers', 'Odor or vapor cloud from a safe distance', 'The newest apparatus on scene'],
      correctAnswerIds: ['Placards', 'Container shape', 'Shipping papers', 'Odor or vapor cloud from a safe distance'],
      explanation: 'Identification may come from placards, labels, papers, container type, and scene clues while maintaining responder safety.',
    },
  ],
  'incident-command': [
    {
      type: 'scenario',
      prompt: 'Command is tracking too many assignments directly. What should happen before span of control breaks?',
      options: ['Expand the organization using divisions, groups, or supervisors', 'Stop accountability tracking', 'Move tactical traffic to private phones', 'Let every company self-assign'],
      correctAnswerIds: ['Expand the organization using divisions, groups, or supervisors'],
      explanation: 'ICS should expand before one supervisor loses control of assignments, resources, and accountability.',
      topicIds: ['communications'],
    },
    {
      type: 'multiple-choice',
      prompt: 'What should the initial incident action plan give operating crews?',
      options: ['Strategy, objectives, hazards, and assignments', 'Permission to freelance', 'A replacement for size-up', 'Only the incident address'],
      correctAnswerIds: ['Strategy, objectives, hazards, and assignments'],
      explanation: 'A useful initial IAP creates shared direction while command continues to update for changing conditions.',
    },
  ],
  'mayday-procedures': [
    {
      type: 'scenario',
      prompt: 'A firefighter is disoriented, separated, and low on air. What is the strongest action?',
      options: ['Transmit a Mayday according to department procedure', 'Keep searching silently', 'Wait until air is gone', 'Remove PPE to move faster'],
      correctAnswerIds: ['Transmit a Mayday according to department procedure'],
      explanation: 'Early Mayday communication gives command and rescue crews time and information to act.',
      topicIds: ['scba', 'communications'],
      timeLimitSeconds: 60,
    },
    {
      type: 'multiple-answer',
      prompt: 'Which details are commonly useful in a Mayday report? Select all that apply.',
      options: ['Location', 'Unit or identity', 'Air status', 'Resources needed', 'Lunch preference'],
      correctAnswerIds: ['Location', 'Unit or identity', 'Air status', 'Resources needed'],
      explanation: 'The exact acronym varies, but actionable Mayday reports prioritize location, identity, air, assignment/problem, and needed resources.',
      topicIds: ['communications'],
    },
  ],
}

function supplementalQuestions(categoryId: string, lessonKey: string, lessonTitle: string): QuizQuestion[] {
  const templates = topicQuestionTemplates[categoryId] ?? genericQuestionTemplates
  return templates.map((template, index) => ({
    id: `q-${categoryId}-${lessonKey}-supplement-${index + 1}`,
    type: template.type,
    prompt: template.prompt.replace('this topic', lessonTitle.toLowerCase()),
    options: template.options,
    correctAnswerIds: template.correctAnswerIds,
    explanation: template.explanation,
    topicIds: [...new Set([categoryId, ...(template.topicIds ?? [])])],
    timeLimitSeconds: template.timeLimitSeconds,
  }))
}

function enrichQuiz(baseQuiz: QuizQuestion[], categoryId: string, lessonKey: string, lessonTitle: string): QuizQuestion[] {
  const existing = new Set(baseQuiz.map((question) => question.id))
  return [
    ...baseQuiz,
    ...supplementalQuestions(categoryId, lessonKey, lessonTitle).filter((question) => !existing.has(question.id)),
  ]
}

const richLessonSeeds: RichLessonSeed[] = [
  {
    categoryId: 'electric-vehicle-incidents',
    courseTitle: 'Electric Vehicle & Lithium-Ion Incident Awareness',
    courseSlug: 'electric-vehicle-lithium-ion-incident-awareness',
    courseDescription: 'Recognize high-voltage hazards, thermal runaway cues, isolation priorities, and post-fire monitoring needs for EV and lithium-ion battery incidents.',
    difficulty: 'Firefighter II',
    estimatedMinutes: 120,
    xp: 560,
    moduleTitle: 'High-voltage response fundamentals',
    moduleDescription: 'Build safe recognition and communication habits for battery-powered vehicles and devices.',
    lessonSlug: 'ev-lithium-ion-size-up',
    lessonTitle: 'EV and Lithium-Ion Size-Up',
    objectives: ['Identify cues that suggest high-voltage or lithium-ion battery involvement', 'Explain why shutdown, isolation, and manufacturer guidance matter', 'Describe rekindle and off-gassing concerns that require monitoring and handoff'],
    prerequisites: ['Vehicle fire fundamentals', 'Hazmat awareness', 'Department EV response SOPs'],
    paragraphs: [
      'Electric vehicles and lithium-ion powered devices add hazards that are easy to miss during a routine vehicle, garage, or structure response. Crews should identify propulsion type, battery location, visible damage, charging equipment, smoke behavior, and occupant rescue needs before committing to a tactic.',
      'Thermal runaway can produce sustained heat, flammable or toxic gases, jetting cells, and delayed re-ignition. The incident commander may need larger isolation areas, prolonged cooling, specialty resources, manufacturer emergency response guides, and a clear plan for towing or storage handoff.',
      'The learning target is awareness and disciplined communication. FireLearn should help a firefighter ask better questions: Where is the battery? Is the vehicle powered down? Is there battery damage or off-gassing? Who is monitoring for re-ignition after knockdown?',
    ],
    callout: { title: 'Research note', text: 'NFPA and USFA materials emphasize tactical preparation for EV fires, emergency shutdown familiarity, and ongoing lithium-ion battery response training. Always apply your department SOPs and manufacturer emergency response guides.' },
    checklistTitle: 'EV incident size-up prompts',
    checklist: ['Identify EV, hybrid, e-bike, scooter, or stationary battery involvement', 'Establish isolation and deny access to damaged battery areas', 'Use emergency shutdown guidance when trained and safe to do so', 'Watch for off-gassing, popping, jetting cells, or re-ignition', 'Coordinate towing, storage, and monitoring handoff for damaged batteries'],
    knowledgeCheck: {
      id: 'q-ev-size-up-1',
      type: 'scenario',
      prompt: 'A crashed EV has smoke from the battery compartment after knockdown. What should the crew communicate?',
      options: ['Battery involvement with re-ignition risk and need for isolation/monitoring', 'That the incident is over once visible flames are gone', 'That no manufacturer guidance is needed', 'That PPE can be removed immediately beside the vehicle'],
      correctAnswerIds: ['Battery involvement with re-ignition risk and need for isolation/monitoring'],
      explanation: 'Damaged lithium-ion batteries can off-gas and re-ignite. Crews should communicate battery involvement, maintain isolation, and follow SOP/manufacturer guidance.',
      topicIds: ['electric-vehicle-incidents', 'hazmat-awareness'],
      timeLimitSeconds: 120,
    },
    quiz: [
      {
        id: 'q-ev-size-up-1',
        type: 'scenario',
        prompt: 'A crashed EV has smoke from the battery compartment after knockdown. What should the crew communicate?',
        options: ['Battery involvement with re-ignition risk and need for isolation/monitoring', 'That the incident is over once visible flames are gone', 'That no manufacturer guidance is needed', 'That PPE can be removed immediately beside the vehicle'],
        correctAnswerIds: ['Battery involvement with re-ignition risk and need for isolation/monitoring'],
        explanation: 'Damaged lithium-ion batteries can off-gas and re-ignite. Crews should communicate battery involvement, maintain isolation, and follow SOP/manufacturer guidance.',
        topicIds: ['electric-vehicle-incidents', 'hazmat-awareness'],
        timeLimitSeconds: 120,
      },
      {
        id: 'q-ev-size-up-2',
        type: 'multiple-answer',
        prompt: 'Which details belong in an EV/lithium-ion incident size-up? Select all that apply.',
        options: ['Battery damage or off-gassing', 'Charging equipment involvement', 'Emergency shutdown status', 'Towing/storage handoff needs', 'Ignoring isolation once flames darken down'],
        correctAnswerIds: ['Battery damage or off-gassing', 'Charging equipment involvement', 'Emergency shutdown status', 'Towing/storage handoff needs'],
        explanation: 'EV incidents require identifying battery involvement, shutdown status, charging equipment, isolation, and post-fire handoff needs.',
        topicIds: ['electric-vehicle-incidents'],
      },
    ],
    flashcards: [
      card('fc-ev-thermal-runaway', 'What is thermal runaway in lithium-ion batteries?', 'A self-heating chain reaction that can produce heat, flammable/toxic gases, fire, cell jetting, and delayed re-ignition.', ['electric-vehicle-incidents', 'hazmat-awareness'], 'Firefighter II'),
      card('fc-ev-post-fire', 'Why is post-fire EV battery monitoring important?', 'Damaged lithium-ion batteries can re-ignite after visible flames are out, so isolation, monitoring, and handoff instructions matter.', ['electric-vehicle-incidents'], 'Firefighter II'),
    ],
    summary: ['EV and lithium-ion incidents begin with recognition and isolation.', 'Shutdown and manufacturer guidance should be used only within training and SOPs.', 'Damaged batteries may need prolonged monitoring and clear handoff.'],
  },
  {
    categoryId: 'firefighter-rehab',
    courseTitle: 'Emergency Incident Rehabilitation',
    courseSlug: 'emergency-incident-rehabilitation',
    courseDescription: 'Practice recognizing heat/cold stress, fatigue, hydration needs, and crew rotation triggers during incidents and training evolutions.',
    difficulty: 'Company Officer',
    estimatedMinutes: 105,
    xp: 500,
    moduleTitle: 'Responder recovery and monitoring',
    moduleDescription: 'Protect crews from preventable overexertion and exposure injuries.',
    lessonSlug: 'rehab-triggers-and-monitoring',
    lessonTitle: 'Rehab Triggers and Monitoring',
    objectives: ['List conditions that should trigger rehab consideration', 'Identify signs of heat stress, cold stress, dehydration, and overexertion', 'Explain how company officers support accountability through crew rotation and medical monitoring'],
    prerequisites: ['PPE and SCBA basics', 'Incident command fundamentals', 'Department rehab SOG/SOP review'],
    paragraphs: [
      'Rehab is a safety operation, not a break from the incident. It gives responders a controlled place to cool or warm, hydrate, receive medical monitoring, report symptoms, and rotate back only when they are safe to continue.',
      'Heat, cold, work duration, repeated SCBA cylinders, high exertion, emotional stress, and contaminated PPE all affect performance. Company officers should watch the whole crew, not just individual complaints, because firefighters may under-report fatigue to stay in the fight.',
      'A strong rehab plan is scalable. A single-company training evolution still needs water, shade or warming, symptom checks, and a stop-work trigger. Larger incidents need a dedicated rehab area integrated with command, accountability, EMS, and logistics.',
    ],
    callout: { title: 'Research note', text: 'NFPA 1584 covers rehabilitation during emergency operations and training exercises; USFA rehab guidance highlights thermal stress, medical monitoring, hydration, and crew safety.' },
    checklistTitle: 'Rehab decision cues',
    checklist: ['High heat index, cold exposure, or severe weather', 'Multiple SCBA cylinders or extended work cycles', 'Dizziness, confusion, cramps, chest pain, abnormal shortness of breath, or altered behavior', 'Contaminated PPE requiring decon before rest areas', 'Crew fatigue that could affect accountability or tactical performance'],
    knowledgeCheck: {
      id: 'q-rehab-trigger-1',
      type: 'multiple-choice',
      prompt: 'What is the safest description of incident rehab?',
      options: ['A structured safety process for rest, hydration, monitoring, and recovery', 'An optional comfort area only for long incidents', 'A way to avoid accountability tracking', 'A replacement for EMS evaluation'],
      correctAnswerIds: ['A structured safety process for rest, hydration, monitoring, and recovery'],
      explanation: 'Rehab is a structured safety process during incidents and training that supports recovery, medical monitoring, and safe crew rotation.',
      topicIds: ['firefighter-rehab', 'incident-command'],
    },
    quiz: [
      {
        id: 'q-rehab-trigger-1',
        type: 'multiple-choice',
        prompt: 'What is the safest description of incident rehab?',
        options: ['A structured safety process for rest, hydration, monitoring, and recovery', 'An optional comfort area only for long incidents', 'A way to avoid accountability tracking', 'A replacement for EMS evaluation'],
        correctAnswerIds: ['A structured safety process for rest, hydration, monitoring, and recovery'],
        explanation: 'Rehab is a structured safety process during incidents and training that supports recovery, medical monitoring, and safe crew rotation.',
        topicIds: ['firefighter-rehab', 'incident-command'],
      },
      {
        id: 'q-rehab-trigger-2',
        type: 'multiple-answer',
        prompt: 'Which findings should prompt urgent rehab or medical evaluation? Select all that apply.',
        options: ['Confusion or altered behavior', 'Chest pain', 'Dizziness or fainting', 'Severe cramps after exertion', 'A firefighter saying they are fine while stumbling'],
        correctAnswerIds: ['Confusion or altered behavior', 'Chest pain', 'Dizziness or fainting', 'Severe cramps after exertion', 'A firefighter saying they are fine while stumbling'],
        explanation: 'Objective signs and serious symptoms should override pride or pressure to keep working. Officers should act early.',
        topicIds: ['firefighter-rehab', 'medical'],
        timeLimitSeconds: 90,
      },
    ],
    flashcards: [
      card('fc-rehab-purpose', 'What is the purpose of emergency incident rehab?', 'To protect responder health through rest, hydration, thermal recovery, medical monitoring, accountability, and safe crew rotation.', ['firefighter-rehab'], 'Company Officer'),
      card('fc-rehab-red-flags', 'Name four rehab red flags.', 'Altered mental status, chest pain, dizziness/fainting, severe cramps, abnormal shortness of breath, or behavior that does not match conditions.', ['firefighter-rehab', 'medical'], 'Company Officer'),
    ],
    summary: ['Rehab is a command-supported safety process.', 'Heat/cold stress, fatigue, symptoms, and work cycles should trigger early action.', 'Crew officers must watch for under-reported fatigue and objective red flags.'],
  },
  {
    categoryId: 'cancer-prevention-and-decon',
    courseTitle: 'Cancer Prevention & Fireground Decon',
    courseSlug: 'cancer-prevention-fireground-decon',
    courseDescription: 'Reduce contaminant exposure through SCBA discipline, gross decon, clean cab habits, PPE handling, and exposure documentation.',
    difficulty: 'Firefighter I',
    estimatedMinutes: 100,
    xp: 520,
    moduleTitle: 'Exposure reduction habits',
    moduleDescription: 'Make contamination control part of every fireground and station routine.',
    lessonSlug: 'gross-decon-and-clean-cab',
    lessonTitle: 'Gross Decon and Clean Cab Habits',
    objectives: ['Explain why contaminants must be controlled before leaving the scene', 'Sequence basic gross decon and bagging habits', 'Identify station and cab behaviors that reduce cross-contamination'],
    prerequisites: ['PPE fundamentals', 'SCBA use', 'Department decon policy review'],
    paragraphs: [
      'Firefighter cancer prevention starts with routine habits. Wearing SCBA through overhaul, limiting contaminated gear contact, performing gross decon, bagging dirty PPE, and showering soon after exposure all reduce the chance that fireground contaminants travel into apparatus, stations, and homes.',
      'Decon should be built into the incident plan rather than treated as an afterthought. Crews need water, brushes or wipes, bagging supplies, clean gloves, alternate hoods, and a designated path that separates dirty gear from clean areas.',
      'Documentation matters because exposure history is easy to forget. A useful learning rep asks firefighters to identify what was contaminated, what decon steps were completed, what PPE needs cleaning, and what exposure record should be filed under department policy.',
    ],
    callout: { title: 'Research note', text: 'NFPA firefighter-cancer materials report elevated cancer diagnosis and death risk, while exposure-reduction guidance emphasizes PPE discipline, decontamination, cross-contamination control, and timely cleaning.' },
    checklistTitle: 'Exposure reduction sequence',
    checklist: ['Keep SCBA on during contaminated atmospheres and overhaul as SOPs require', 'Use gross decon or wipes before entering apparatus or rehab areas', 'Bag contaminated PPE and tools for proper cleaning', 'Keep dirty gear out of living quarters and personal vehicles', 'Shower, change clothing, and document exposure according to policy'],
    knowledgeCheck: {
      id: 'q-decon-clean-cab-1',
      type: 'ordering',
      prompt: 'Place these exposure-reduction actions in a safer general order after interior firefighting.',
      options: ['Gross decon/wipe exposed areas', 'Bag contaminated PPE for cleaning', 'Shower and change clothes', 'Document exposure per policy'],
      correctAnswerIds: ['Gross decon/wipe exposed areas', 'Bag contaminated PPE for cleaning', 'Shower and change clothes', 'Document exposure per policy'],
      explanation: 'Departments differ, but a safer pattern is to reduce contamination at the scene, isolate dirty gear, clean the firefighter, and document the exposure.',
      topicIds: ['cancer-prevention-and-decon', 'ppe'],
    },
    quiz: [
      {
        id: 'q-decon-clean-cab-1',
        type: 'ordering',
        prompt: 'Place these exposure-reduction actions in a safer general order after interior firefighting.',
        options: ['Gross decon/wipe exposed areas', 'Bag contaminated PPE for cleaning', 'Shower and change clothes', 'Document exposure per policy'],
        correctAnswerIds: ['Gross decon/wipe exposed areas', 'Bag contaminated PPE for cleaning', 'Shower and change clothes', 'Document exposure per policy'],
        explanation: 'Departments differ, but a safer pattern is to reduce contamination at the scene, isolate dirty gear, clean the firefighter, and document the exposure.',
        topicIds: ['cancer-prevention-and-decon', 'ppe'],
      },
      {
        id: 'q-decon-clean-cab-2',
        type: 'multiple-answer',
        prompt: 'Which habits reduce cross-contamination? Select all that apply.',
        options: ['Bagging dirty PPE before transport', 'Keeping contaminated gear out of living areas', 'Using SCBA through overhaul when required', 'Putting dirty gloves on the cab console', 'Documenting significant exposures'],
        correctAnswerIds: ['Bagging dirty PPE before transport', 'Keeping contaminated gear out of living areas', 'Using SCBA through overhaul when required', 'Documenting significant exposures'],
        explanation: 'Exposure reduction relies on SCBA discipline, decon, separation of dirty/clean zones, and documentation.',
        topicIds: ['cancer-prevention-and-decon', 'ppe', 'scba'],
      },
    ],
    flashcards: [
      card('fc-decon-gross-purpose', 'Why perform gross decon before leaving the fireground?', 'To remove loose contamination and reduce transfer to apparatus, stations, homes, and skin before formal PPE cleaning.', ['cancer-prevention-and-decon'], 'Firefighter I'),
      card('fc-decon-clean-cab', 'What is the clean-cab goal?', 'Keep contaminated PPE, tools, gloves, and soot out of riding and living spaces by separating dirty and clean zones.', ['cancer-prevention-and-decon', 'ppe'], 'Firefighter I'),
    ],
    summary: ['Cancer prevention depends on repeatable exposure-reduction habits.', 'Gross decon, bagging, clean-cab separation, showering, and documentation reduce cross-contamination.', 'SCBA discipline during overhaul remains a critical control.'],
  },
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
    videoPlaceholder: `Watch the embedded ${seed.lessonTitle.toLowerCase()} tutorials before starting the lesson.`,
    videos: videosForTopic(seed.categoryId),
    knowledgeCheck: seed.knowledgeCheck,
    summary: seed.summary,
    quiz: enrichQuiz(seed.quiz, seed.categoryId, seed.lessonSlug, seed.lessonTitle),
    flashcards: seed.flashcards,
    references: ['Department SOPs', 'Authority Having Jurisdiction guidance', 'Instructor-led certification materials', 'Applicable NFPA/local standards where adopted'],
    completion: { completed: false, percent: seed.categoryId === 'fire-behaviour' ? 70 : 0 },
  }
}

function lessonFromExamSeed(seed: ExamPrepSeed): Lesson {
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
    videoPlaceholder: `Watch the embedded ${seed.lessonTitle.toLowerCase()} tutorials before starting the lesson.`,
    videos: videosForTopic(seed.categoryId),
    knowledgeCheck: seed.knowledgeCheck,
    summary: seed.summary,
    quiz: enrichQuiz(seed.quiz, seed.categoryId, seed.lessonSlug, seed.lessonTitle),
    flashcards: seed.flashcards,
    references: ['Department SOPs', 'NFPA 1001 Firefighter Professional Qualifications', 'NFPA 472 Hazardous Materials Response', 'Authority Having Jurisdiction guidance', 'Applicable provincial/Canadian standards where adopted'],
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
    modules: [{ id: `module-${category.id}-core`, title: 'Core concepts', description: `Foundational concepts and decision points for ${category.title.toLowerCase()}.`, lessons: [makeLesson(category.id, category.title, difficulty), makeScenarioDrillLesson(category.id, category.title, difficulty)] }],
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
    modules: [{ id: `module-${seed.categoryId}-core`, title: seed.moduleTitle, description: seed.moduleDescription, lessons: [lessonFromSeed(seed), makeScenarioDrillLesson(seed.categoryId, categories.find((category) => category.id === seed.categoryId)?.title ?? seed.courseTitle, seed.difficulty)] }],
  }
})

// Apply exam-prep seeds: override course metadata and add rich NFPA 1001/472 lessons
examPrepSeeds.forEach((seed) => {
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
    modules: [{ id: `module-${seed.categoryId}-core`, title: seed.moduleTitle, description: seed.moduleDescription, lessons: [lessonFromExamSeed(seed), makeScenarioDrillLesson(seed.categoryId, seed.courseTitle, seed.difficulty)] }],
  }
})

export const academyCourses: Course[] = validateCourses(starterCourses)

export const educationalDisclaimer = 'FireLearn content is educational support only. It does not replace official firefighter training, department SOPs, local regulations, certification requirements, AHJ direction, or instructor-led evaluation.'

export function getCategoryTitle(categoryId: string) {
  return categories.find((category) => category.id === categoryId)?.title ?? categoryId
}

export function getFeaturedLesson() {
  return academyCourses[0]?.modules[0]?.lessons[0]
}
