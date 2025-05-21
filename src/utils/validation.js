const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const validatePhone = (phone) => {
  const re = /^[0-9]{7,15}$/;
  return re.test(phone);
};

const validateIdCard = (idCard) => {
  const idCardRegex = /^[0-9]{9,12}$/;
  return idCardRegex.test(idCard.trim());
};

module.exports = {
  validateEmail,
  validatePhone,
  validateIdCard,
};
