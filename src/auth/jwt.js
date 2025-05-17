import JWT from "jsonwebtoken";

export const createTokenPair = async (
  payload,
  accessTokenKey,
  refreshTokenKey,
  accessTokenLife,
  refreshTokenLife
) => {
  try {
    // Tạo access token
    const accessToken = await JWT.sign(payload, accessTokenKey, {
      algorithm: "HS256",
      expiresIn: accessTokenLife,
    });

    // Tạo refresh token
    const refreshToken = await JWT.sign(payload, refreshTokenKey, {
      algorithm: "HS256",
      expiresIn: refreshTokenLife,
    });

    return { accessToken, refreshToken };
  } catch (error) {
    console.error("Error creating token pair:", error.message);
    throw new Error("Failed to create token pair");
  }
};

export const generateToken = async (userInfo, secretSignature, tokenLife) => {
  try {
    const token = await JWT.sign(userInfo, secretSignature, {
      expiresIn: tokenLife,
      algorithm: 'HS256'
    })
    return token
  } catch (error) {
    throw new Error(error)
  }
}


export const verifyToken = async (token, secretSignature) => {
  try {
    return JWT.verify(token, secretSignature);
  } catch (error) {
    throw new Error(`Token verification failed: ${error.message}`);
  }
};
