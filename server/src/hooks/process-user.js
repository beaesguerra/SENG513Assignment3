// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html

const adjectives = ['yummy', 'blueberry', 'chocolate', 'vanilla', 'strawberry', 'raspberry', 'mango'];
const nouns = ['cupcake', 'macaron', 'ice cream', 'cookie', 'pie', 'cakepop', 'cheesecake', 'lollipop', 'gumdrop', 'jelly bean', 'gummy bear'];

function generateRandomNickName() {
  const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adjective} ${noun}`;
}

// eslint-disable-next-line no-unused-vars
module.exports = function (options = {}) {
  return async context => {
    context.data = {
      nickname: generateRandomNickName()
    }
    return context;
  };
};
