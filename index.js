require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

const PORT = process.env.PORT || 3000;

const questions = require('./data/questions.json');
const sessionFile = path.join(__dirname, 'users/sessions.json');

function loadSessions() {
  try {
    const data = fs.readFileSync(sessionFile, 'utf-8');
    return data ? JSON.parse(data) : {};
  } catch (err) {
    console.error("Session load error:", err.message);
    return {};
  }
}

function saveSessions(sessions) {
  fs.writeFileSync(sessionFile, JSON.stringify(sessions, null, 2));
}

function startQuiz(userId, subject) {
  const userSessions = loadSessions();

  if (!questions[subject]) {
    return `❌ Subject not found. Available: math, life sciences, etc.`;
  }

  userSessions[userId] = {
    subject,
    score: 0,
    currentIndex: 0
  };
  saveSessions(userSessions);

  const q = questions[subject][0];
  return `🧪 ${subject.toUpperCase()} Quiz Started!\nQ1: ${q.question}\n${q.options.join('\n')}\n\nReply with A, B, C or D`;
}

function handleQuizAnswer(userId, input) {
  const userSessions = loadSessions();
  const session = userSessions[userId];
  const subject = session.subject;
  const currentQ = questions[subject][session.currentIndex];
  const isCorrect = input.toUpperCase() === currentQ.answer;

  if (isCorrect) session.score++;
  session.currentIndex++;

  const done = session.currentIndex >= questions[subject].length;
  saveSessions(userSessions);

  if (done) {
    const score = session.score;
    delete userSessions[userId];
    saveSessions(userSessions);
    return `✅ Quiz Complete!\nYour score: ${score}/${questions[subject].length}`;
  } else {
    const nextQ = questions[subject][session.currentIndex];
    return `Q${session.currentIndex + 1}: ${nextQ.question}\n${nextQ.options.join('\n')}\n\nReply with A, B, C or D`;
  }
}

app.post('/whatsapp', (req, res) => {
  const incomingMsg = req.body.Body.trim();
  const userId = req.body.From;

  let response = "Hi 👋 Send `menu` to get started.";
  const sessions = loadSessions();

  const lowerMsg = incomingMsg.toLowerCase();

  if (lowerMsg === 'menu') {
    response = `📚 *Subjects Available:*\n- math\n- life sciences\n\nSend \`quiz math\` to begin.`;
  } else if (lowerMsg.startsWith('quiz')) {
    const subject = lowerMsg.split(' ')[1];
    response = startQuiz(userId, subject);
  } else if (sessions[userId]) {
    response = handleQuizAnswer(userId, incomingMsg);
  }

  res.set('Content-Type', 'text/xml');
  res.send(`
    <Response>
      <Message>${response}</Message>
    </Response>
  `);
});

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
