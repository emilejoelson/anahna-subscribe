import jwt from "jsonwebtoken";

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const formatAddresses = (addresses: any[]) => {
  if (!addresses || addresses.length === 0) {
    return [];
  }
  return addresses.map((addr: any) => ({
    ...addr,
    location:
      addr.location && !addr.location.type
        ? { ...addr.location, type: "Point" }
        : addr.location,
  }));
};

export const generateAccessToken = (userId: string) => {
  return jwt.sign(
    { userId },
    process.env.JWT_ACCESS_SECRET || "access-secret-key",
    { expiresIn: "60m" }
  );
};

export const generateRefreshToken = (userId: string) => {
  return jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET || "refresh-secret-key",
    { expiresIn: "7d" }
  );
};
