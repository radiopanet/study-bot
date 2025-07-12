require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const supabase = require('./supabase');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

const PORT = process.env.PORT || 3000;

// In-memory cache to map numbers (1, 2, 3...) to subject IDs
let subjectMap = [];

async function fetchSubjects() {
  const { data, error } = await supabase
    .from('subjects')
    .select('id, name, code');

  if (error) {
    console.error('Failed to fetch subjects:', error.message);
    return [];
  }

  subjectMap = data;
  return data;
}

async function getSubjectMenu() {
  const subjects = await fetchSubjects();
  if (!subjects.length) return '⚠️ No subjects available.';

  let message = '📚 *Available Subjects:*\n';
  subjects.forEach((subject, index) => {
    message += `${index + 1}. ${subject.name}\n`;
  });
  message += `\nType the *number* of the subject to get past papers.`;

  return message;
}

async function getPapersBySubjectIndex(index) {
  const subject = subjectMap[index - 1];
  if (!subject) return `❌ Invalid subject number. Type \`menu\` to try again.`;

  const { data: papers, error } = await supabase
    .from('papers')
    .select('name, link')
    .eq('subject_id', subject.id)
    .order('name', { ascending: false });

  if (error) {
    console.error('Error fetching papers:', error.message);
    return `❌ Failed to fetch papers for ${subject.name}`;
  }

  if (!papers.length) {
    return `⚠️ No papers found for *${subject.name}*.`;
  }

  let response = `📄 *${subject.name.toUpperCase()} Grade 12 Papers:*\n\n`;
  papers.forEach((paper, i) => {
    response += `${i + 1}. ${paper.name}\n🔗 ${paper.link}\n\n`;
  });

  response += `0. 🔙 Back to Menu`;

  return response;
}

function escapeXML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}


app.post('/whatsapp', async (req, res) => {
  const incomingMsg = req.body.Body.trim();
  const userMsg = incomingMsg.toLowerCase();

  console.log(userMsg);
  let response = '👋 Welcome to StudyBot!\nType `menu` to get started.';

  if (['menu', 'start', 'papers', '0'].includes(userMsg)) {
    response = await getSubjectMenu();
  } else if (/^\d+$/.test(userMsg)) {
    const index = parseInt(userMsg);
    response = await getPapersBySubjectIndex(index);
  } else {
    response = `❌ Invalid input. Please type \`menu\` to see available subjects.`;
  }
  
  res.set('Content-Type', 'text/xml');
  res.send(`
    <Response>
      <Message>${escapeXML(response)}</Message>
    </Response>
  `);

  console.log(response);
});

app.listen(PORT, () => {
  console.log(`✅ StudyBot running on port ${PORT}`);
});
