/**
 * QuizApp_Backend — AWS Lambda handler (Node.js 24, ESM)
 *
 * Configured for EXACT existing DynamoDB tables:
 *   1. Quizzes Table : QuizApp_Quizzes-Cloud  (PK: id [String])
 *   2. Results Table : QuizApp_Results        (PK: id [String])
 *
 * Safety, Validation & Security Rules:
 *   • Correct answers must be valid integers. Rejects decimal or out-of-bounds values.
 *   • Rejects POST /quizzes requests with an empty or missing questions array.
 *   • In POST /results, never defaults missing/invalid stored answer keys to 0; validates the official key.
 *   • Catches malformed URI characters in quiz IDs and returns a controlled HTTP 400.
 *   • GET /quizzes strictly hides both correctAnswer and correctOption from client responses.
 *   • DELETE /quizzes/{id} deletes ONLY from Quizzes table (historical results are preserved).
 *   • GET /results converts database records into frontend-compatible QuizAttempt models.
 *
 * Required IAM permissions on execution role:
 *   dynamodb:Scan       on arn:aws:dynamodb:*:*:table/QuizApp_Quizzes-Cloud
 *   dynamodb:GetItem    on arn:aws:dynamodb:*:*:table/QuizApp_Quizzes-Cloud
 *   dynamodb:PutItem    on arn:aws:dynamodb:*:*:table/QuizApp_Quizzes-Cloud
 *   dynamodb:DeleteItem on arn:aws:dynamodb:*:*:table/QuizApp_Quizzes-Cloud
 *   dynamodb:Scan       on arn:aws:dynamodb:*:*:table/QuizApp_Results
 *   dynamodb:PutItem    on arn:aws:dynamodb:*:*:table/QuizApp_Results
 */

import {
  DynamoDBClient,
  ScanCommand,
  PutItemCommand,
  GetItemCommand,
  DeleteItemCommand,
} from "@aws-sdk/client-dynamodb";
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb";

const client = new DynamoDBClient({});

// EXACT table names in AWS
const QUIZZES_TABLE = "QuizApp_Quizzes-Cloud";
const RESULTS_TABLE = "QuizApp_Results";

// ─── CORS headers ─────────────────────────────────────────────────────────────
const CORS_HEADERS = {
  "Content-Type": "application/json",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

function respond(statusCode, body) {
  return {
    statusCode,
    headers: CORS_HEADERS,
    body: JSON.stringify(body),
  };
}

function errorResponse(statusCode, message) {
  console.error(`[${statusCode}] ${message}`);
  return respond(statusCode, { error: message });
}

// ─── Results Schema Converter (DynamoDB -> Frontend) ─────────────────────────
/**
 * Converts existing DynamoDB QuizApp_Results records into the shape
 * expected by the frontend (QuizAttempt).
 */
function dbResultToFrontend(raw) {
  const maxScore = Number(raw.maxScore ?? raw.total ?? 0);
  const score = Number(raw.score ?? 0);
  const pct =
    typeof raw.percentage === "number"
      ? raw.percentage
      : maxScore > 0
      ? Math.round((score / maxScore) * 100)
      : 0;

  // Convert DynamoDB List of answer objects [{questionId, selectedOption, isCorrect}]
  // into frontend Record<string, number>: { [questionId]: selectedOption }
  let answersObj = {};
  if (Array.isArray(raw.answers)) {
    for (const a of raw.answers) {
      if (a && (a.questionId || a.id)) {
        const qId = String(a.questionId || a.id);
        answersObj[qId] =
          typeof a.selectedOption === "number"
            ? a.selectedOption
            : Number(a.selected ?? 0);
      }
    }
  } else if (raw.answers && typeof raw.answers === "object") {
    answersObj = raw.answers;
  }

  return {
    id: String(raw.id ?? `r-${Date.now()}`),
    userId: String(raw.user_id ?? raw.userId ?? ""),
    quizId: String(raw.quiz_id ?? raw.quizId ?? ""),
    score: score,
    total: maxScore,
    percentage: pct,
    timeTakenSecs: Number(raw.timeTakenSeconds ?? raw.timeTakenSecs ?? 0),
    answers: answersObj,
    status: String(raw.status ?? "completed"),
    submittedAt: String(raw.submittedAt ?? new Date().toISOString()),
  };
}

// ─── GET /quizzes ─────────────────────────────────────────────────────────────
async function listQuizzes() {
  try {
    const result = await client.send(
      new ScanCommand({ TableName: QUIZZES_TABLE })
    );
    const items = (result.Items || []).map((item) => unmarshall(item));

    // Ensure backwards compatibility with frontend normalizeQuiz expectations,
    // providing both `text` and `questionText`, while NEVER exposing correctAnswer or correctOption.
    const sanitizedQuizzes = items.map((q) => {
      const duration =
        typeof q.timeLimit === "number" ? q.timeLimit : q.durationMins || 30;
      return {
        ...q,
        id: String(q.id || q.quizId),
        durationMins: duration,
        timeLimit: duration,
        status: q.status || "published",
        attemptsAllowed: q.attemptsAllowed || 1,
        difficulty: q.difficulty || "Beginner",
        questionCount: Array.isArray(q.questions)
          ? q.questions.length
          : q.questionCount || 0,
        questions: Array.isArray(q.questions)
          ? q.questions.map((question) => {
              // Strictly strip both correctAnswer and correctOption before returning to browser
              const { correctAnswer, correctOption, ...safeQuestion } = question;
              const qText = String(
                safeQuestion.questionText ||
                  safeQuestion.text ||
                  safeQuestion.question ||
                  ""
              );
              return {
                ...safeQuestion,
                id: String(safeQuestion.id),
                text: qText,
                questionText: qText,
                options: Array.isArray(safeQuestion.options)
                  ? safeQuestion.options.map((opt) =>
                      typeof opt === "object" && opt !== null
                        ? String(opt.text || opt.label || opt.value || "")
                        : String(opt)
                    )
                  : [],
                points:
                  typeof safeQuestion.points === "number"
                    ? safeQuestion.points
                    : 10,
              };
            })
          : [],
      };
    });

    return respond(200, sanitizedQuizzes);
  } catch (err) {
    return errorResponse(500, `Failed to fetch quizzes: ${err.message}`);
  }
}

// ─── POST /quizzes ────────────────────────────────────────────────────────────
async function saveQuiz(body) {
  if (!body) {
    return errorResponse(400, "Request body is required");
  }

  let data;
  try {
    data = typeof body === "string" ? JSON.parse(body) : body;
  } catch {
    return errorResponse(400, "Invalid JSON in request body");
  }

  if (!data.title || !String(data.title).trim()) {
    return errorResponse(400, "Missing required field: title");
  }

  // Reject empty questions array
  if (!Array.isArray(data.questions) || data.questions.length === 0) {
    return errorResponse(400, "A quiz must contain at least one question.");
  }

  const quizId = String(data.id || `quiz-${Date.now()}`);
  const formattedQuestions = [];

  for (let idx = 0; idx < data.questions.length; idx++) {
    const q = data.questions[idx];
    const textStr = String(q.questionText || q.text || q.question || "").trim();

    if (!textStr) {
      return errorResponse(400, `Question ${idx + 1} is missing question text.`);
    }

    const optionsList = Array.isArray(q.options)
      ? q.options
          .map((opt) =>
            (typeof opt === "object" && opt !== null
              ? String(opt.text || opt.label || opt.value || "")
              : String(opt)
            ).trim()
          )
          .filter((opt) => opt.length > 0)
      : [];

    if (optionsList.length < 2) {
      return errorResponse(
        400,
        `Question ${idx + 1} ('${textStr.slice(0, 30)}...') must have at least 2 non-empty options.`
      );
    }

    // Read correctAnswer / correctOption
    const rawVal =
      typeof q.correctAnswer !== "undefined" && q.correctAnswer !== null
        ? q.correctAnswer
        : typeof q.correctOption !== "undefined" && q.correctOption !== null
        ? q.correctOption
        : null;

    if (rawVal === null || rawVal === "") {
      return errorResponse(
        400,
        `Question ${idx + 1} ('${textStr.slice(0, 30)}...') is missing a correct answer index.`
      );
    }

    const parsedNum = Number(rawVal);

    // Reject non-numbers and decimals (must be an integer)
    if (isNaN(parsedNum) || !Number.isInteger(parsedNum)) {
      return errorResponse(
        400,
        `Question ${idx + 1} correct answer index must be an integer, not a decimal (received: ${rawVal}).`
      );
    }

    // Bounds check
    if (parsedNum < 0 || parsedNum >= optionsList.length) {
      return errorResponse(
        400,
        `Question ${idx + 1} correct answer index (${parsedNum}) is out of bounds (must be between 0 and ${optionsList.length - 1}).`
      );
    }

    const pts = Number(typeof q.points === "number" && !isNaN(q.points) ? q.points : 10);

    formattedQuestions.push({
      id: String(q.id || `q-${idx + 1}`),
      questionText: textStr,
      text: textStr,
      options: optionsList,
      correctAnswer: parsedNum,
      points: pts,
    });
  }

  const duration = Number(data.timeLimit ?? data.durationMins ?? 30);

  const quizItem = {
    id: quizId,
    title: String(data.title).trim(),
    description: String(data.description || "").trim(),
    category: String(data.category || "General"),
    difficulty: String(data.difficulty || "Beginner"),
    timeLimit: duration,
    durationMins: duration,
    createdBy: String(data.createdBy || "admin"),
    createdAt: String(data.createdAt || new Date().toISOString()),
    status: String(data.status || "published"),
    questions: formattedQuestions,
  };

  try {
    await client.send(
      new PutItemCommand({
        TableName: QUIZZES_TABLE,
        Item: marshall(quizItem, { removeUndefinedValues: true }),
      })
    );
    console.log(
      `[POST /quizzes] Successfully saved quiz id=${quizId} status=${quizItem.status} questions=${formattedQuestions.length}`
    );
    return respond(201, { message: "Quiz saved", id: quizId, quiz: quizItem });
  } catch (err) {
    return errorResponse(500, `Failed to save quiz: ${err.message}`);
  }
}

// ─── DELETE /quizzes/{id} ─────────────────────────────────────────────────────
async function deleteQuiz(id) {
  if (!id) {
    return errorResponse(400, "Quiz ID is required");
  }

  const cleanId = String(id).trim();

  try {
    // Check if quiz exists
    const checkRes = await client.send(
      new GetItemCommand({
        TableName: QUIZZES_TABLE,
        Key: marshall({ id: cleanId }),
      })
    );

    if (!checkRes.Item) {
      return errorResponse(404, `Quiz not found with ID: ${cleanId}`);
    }

    // Delete ONLY from Quizzes table; historical results in RESULTS_TABLE are NOT deleted
    await client.send(
      new DeleteItemCommand({
        TableName: QUIZZES_TABLE,
        Key: marshall({ id: cleanId }),
      })
    );

    console.log(
      `[DELETE /quizzes/${cleanId}] Successfully deleted quiz (historical results preserved)`
    );
    return respond(200, { message: "Quiz deleted successfully", id: cleanId });
  } catch (err) {
    return errorResponse(500, `Failed to delete quiz: ${err.message}`);
  }
}

// ─── GET /results ─────────────────────────────────────────────────────────────
async function listResults() {
  try {
    const result = await client.send(
      new ScanCommand({ TableName: RESULTS_TABLE })
    );
    const items = (result.Items || [])
      .map((item) => unmarshall(item))
      .map(dbResultToFrontend);

    return respond(200, items);
  } catch (err) {
    return errorResponse(500, `Failed to fetch results: ${err.message}`);
  }
}

// ─── POST /results ────────────────────────────────────────────────────────────
async function saveResult(body) {
  if (!body) {
    return errorResponse(400, "Request body is required");
  }

  let data;
  try {
    data = typeof body === "string" ? JSON.parse(body) : body;
  } catch {
    return errorResponse(400, "Invalid JSON in request body");
  }

  const userId = String(data.user_id || data.userId || "");
  const quizId = String(data.quiz_id || data.quizId || "");

  if (!userId || !quizId) {
    return errorResponse(400, "Missing required fields: userId and quizId");
  }

  // 1. Fetch official quiz from DynamoDB to validate existence and get official answers
  let quizRes;
  try {
    quizRes = await client.send(
      new GetItemCommand({
        TableName: QUIZZES_TABLE,
        Key: marshall({ id: quizId }),
      })
    );
  } catch (fetchErr) {
    return errorResponse(500, `Error fetching quiz: ${fetchErr.message}`);
  }

  if (!quizRes.Item) {
    return errorResponse(404, `Quiz not found with ID: ${quizId}`);
  }

  const quiz = unmarshall(quizRes.Item);
  const quizQuestions = Array.isArray(quiz.questions) ? quiz.questions : [];

  if (quizQuestions.length === 0) {
    return errorResponse(400, `Quiz has no questions configured: ${quizId}`);
  }

  // 2. Build official question map: questionId -> { points, correctAnswer }
  // NEVER default a missing or invalid stored answer key to 0
  const questionMap = new Map();
  let totalQuizMaxScore = 0;

  for (let idx = 0; idx < quizQuestions.length; idx++) {
    const q = quizQuestions[idx];
    const qId = String(q.id || `q-${idx + 1}`);
    const pts =
      typeof q.points === "number" && !isNaN(q.points) ? q.points : 10;

    const rawStored =
      typeof q.correctAnswer === "number" && !isNaN(q.correctAnswer)
        ? q.correctAnswer
        : typeof q.correctOption === "number" && !isNaN(q.correctOption)
        ? q.correctOption
        : null;

    const optionsCount = Array.isArray(q.options) ? q.options.length : 0;

    if (rawStored === null || !Number.isInteger(rawStored)) {
      return errorResponse(
        500,
        `Quiz '${quizId}' configuration error: Question '${qId}' has a missing or non-integer stored answer key.`
      );
    }

    if (optionsCount < 2 || rawStored < 0 || rawStored >= optionsCount) {
      return errorResponse(
        500,
        `Quiz '${quizId}' configuration error: Question '${qId}' stored answer index (${rawStored}) is invalid for its ${optionsCount} options (requires at least 2 options and 0 <= index < optionsCount).`
      );
    }

    questionMap.set(qId, {
      points: pts,
      correctAnswer: rawStored,
    });

    totalQuizMaxScore += pts;
  }

  // 3. Normalize incoming answers payload
  let incomingAnswers = [];
  if (Array.isArray(data.answers)) {
    incomingAnswers = data.answers.map((a) => ({
      questionId: String(a.questionId || a.id || ""),
      selectedOption: Number(a.selectedOption ?? a.selected ?? -1),
    }));
  } else if (data.answers && typeof data.answers === "object") {
    incomingAnswers = Object.entries(data.answers).map(([qId, val]) => ({
      questionId: String(qId),
      selectedOption: Number(val),
    }));
  } else {
    return errorResponse(400, "Answers must be an object or a list");
  }

  // 4. Calculate score and correctness strictly on the server; reject invalid question IDs
  let calculatedScore = 0;
  const processedAnswersList = [];

  for (const entry of incomingAnswers) {
    const { questionId, selectedOption } = entry;

    if (!questionMap.has(questionId)) {
      return errorResponse(
        400,
        `Invalid question ID '${questionId}' for quiz '${quizId}'`
      );
    }

    const qOfficial = questionMap.get(questionId);

    // ALWAYS calculate correctness using the validated correctAnswer stored in QuizApp_Quizzes-Cloud
    const isCorrect = selectedOption === qOfficial.correctAnswer;

    if (isCorrect) {
      calculatedScore += qOfficial.points;
    }

    processedAnswersList.push({
      questionId,
      selectedOption,
      isCorrect,
    });
  }

  // 5. Build exact DynamoDB item matching QuizApp_Results schema
  const resultItem = {
    id: String(
      data.id || `res_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`
    ),
    user_id: userId,
    quiz_id: quizId,
    score: Number(calculatedScore),
    maxScore: Number(totalQuizMaxScore),
    answers: processedAnswersList,
    submittedAt: String(data.submittedAt || new Date().toISOString()),
    timeTakenSeconds: Number(data.timeTakenSeconds ?? data.timeTakenSecs ?? 0),
  };

  // 6. Save verified result into DynamoDB
  try {
    await client.send(
      new PutItemCommand({
        TableName: RESULTS_TABLE,
        Item: marshall(resultItem, { removeUndefinedValues: true }),
      })
    );

    console.log(
      `[POST /results] Saved result id=${resultItem.id} score=${calculatedScore}/${totalQuizMaxScore}`
    );

    return respond(201, {
      message: "Result saved",
      id: resultItem.id,
      score: calculatedScore,
      maxScore: totalQuizMaxScore,
      percentage:
        totalQuizMaxScore > 0
          ? Math.round((calculatedScore / totalQuizMaxScore) * 100)
          : 0,
    });
  } catch (err) {
    return errorResponse(500, `Failed to save result: ${err.message}`);
  }
}

// ─── Main Lambda Handler ──────────────────────────────────────────────────────
export const handler = async (event) => {
  const method = (
    event.requestContext?.http?.method ||
    event.httpMethod ||
    ""
  ).toUpperCase();
  const path = event.requestContext?.http?.path || event.path || "/";

  console.log(`[${method}] ${path}`);

  // CORS preflight
  if (method === "OPTIONS") {
    return { statusCode: 204, headers: CORS_HEADERS, body: "" };
  }

  // Exact /quizzes route
  if (path === "/quizzes" || path === "/quizzes/") {
    if (method === "GET") return listQuizzes();
    if (method === "POST") return saveQuiz(event.body);
    return errorResponse(405, `Method ${method} not allowed on /quizzes`);
  }

  // /quizzes/{id} route (e.g. DELETE /quizzes/quiz-101, DELETE /quizzes/q1731512...)
  const quizIdMatch = path.match(/^\/quizzes\/([^/]+?)\/?$/);
  const rawParam = event.pathParameters?.id || (quizIdMatch ? quizIdMatch[1] : null);

  if (rawParam && path.startsWith("/quizzes/")) {
    let quizIdParam = null;
    try {
      quizIdParam = decodeURIComponent(rawParam);
    } catch (decodeErr) {
      return errorResponse(400, `Malformed URI in quiz ID: ${rawParam}`);
    }

    if (method === "DELETE") return deleteQuiz(quizIdParam);
    return errorResponse(405, `Method ${method} not allowed on /quizzes/{id}`);
  }

  // /results routes
  if (path === "/results" || path === "/results/") {
    if (method === "GET") return listResults();
    if (method === "POST") return saveResult(event.body);
    return errorResponse(405, `Method ${method} not allowed on /results`);
  }

  return errorResponse(404, `Route not found: ${method} ${path}`);
};
