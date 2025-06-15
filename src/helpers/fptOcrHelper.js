const axios = require("axios");
const FormData = require('form-data');

const FPT_OCR_URL = "https://api.fpt.ai/vision/idr/vnm";

const extractCCCD = async (fileBuffer, mimetype, originalname) => {
  const formData = new FormData();
  formData.append("image", fileBuffer, {
    filename: originalname,
    contentType: mimetype,
  });

  const { data } = await axios.post(
    FPT_OCR_URL,
    formData,
    {
      headers: {
        ...formData.getHeaders(),
        "api-key": process.env.FPT_OCR_KEY
      },
      timeout: 15000,
    }
  );

  const card = data.data[0];
  return {
    idCard: card.id,
    fullName: card.name,
    dob: card.dob,
    address: card.address,
    sex: card.sex, // "Nam"/"Nu"
  };
};

module.exports = {
  extractCCCD,
};
