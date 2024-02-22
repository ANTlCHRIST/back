const { v4: uuidv4 } = require('uuid');

const generateRandom = async () => {
  const randomCode = uuidv4().replace(/-/g, '').substring(0, 16);
  const formattedCode =
    randomCode.substring(0, 3) + '-' +
    randomCode.substring(3, 7) + '-' +
    randomCode.substring(7, 12) + '-' +
    randomCode.substring(12);
  return formattedCode;
};

const generateID = async (model) => {
  while (true) {
    const randomCode = await generateRandom();

    const cek = await model.findByPk(randomCode);

    if (!cek) return randomCode;
  }
};

module.exports = {
  generateID
};
