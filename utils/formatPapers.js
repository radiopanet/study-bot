const papers = require('../data/papers.json');

function getPapersForSubject(subject) {
  subject = subject.toLowerCase();
  if (!papers[subject]) return `❌ Sorry, no papers found for "${subject}".`;

  const grade12 = papers[subject]['grade_12'];
  if (!grade12 || grade12.length === 0) return `⚠️ No Grade 12 papers available for ${subject}.`;

  let response = `📄 *${subject.toUpperCase()} Grade 12 Papers:*\n\n`;
  grade12.forEach((paper, index) => {
    response += `${index + 1}. ${paper.name}\n🔗 ${paper.link}\n\n`;
  });

  response += `0. 🔙 Back to Menu`;

  return response.trim();
}

module.exports = { getPapersForSubject };
