require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const { getPapersForSubject } = require('./utils/formatPapers');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

const PORT = process.env.PORT || 3000;

// Subject number-to-name map
const subjectMap = {
  '1': 'math',
  '2': 'life-science'
};

// Shared menu message
const menuMessage = `📚 *Available Subjects:*\n1. Math\n2. Life Science\n\nType the *number* of the subject to get papers.`;

app.post('/whatsapp', (req, res) => {
  const incomingMsg = req.body.Body.trim();
  const lowerMsg = incomingMsg.toLowerCase();

  let response = "👋 Welcome to StudyBot!\nType `menu` to see available subjects.";

  if (['menu', 'papers', 'start', '0'].includes(lowerMsg)) {
    response = menuMessage;
  } else if (subjectMap[lowerMsg]) {
    const subject = subjectMap[lowerMsg];
    response = getPapersForSubject(subject);
  } else {
    response = `❌ Invalid option.\nPlease type \`menu\` to see available subjects and respond with the number.`;
  }

  res.set('Content-Type', 'text/xml');
  res.send(`
    <Response>
      <Message>${response}</Message>
    </Response>
  `);
});

app.listen(PORT, () => {
  console.log(`✅ StudyBot server running on port ${PORT}`);
});
