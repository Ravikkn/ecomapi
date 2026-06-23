const isSrvDnsError = (error, uri) => {
  return (
    Boolean(uri) &&
    uri.startsWith("mongodb+srv://") &&
    error?.code === "EREFUSED" &&
    error?.syscall === "querySrv"
  );
};

export const getPrimaryMongoUri = () => process.env.MONGO_URI;

export const getFallbackMongoUri = () =>
  process.env.MONGO_URI_LOCAL || process.env.MONGO_URI_FALLBACK || "";

export const formatMongoConnectionError = (error, attemptedUri) => {
  if (isSrvDnsError(error, attemptedUri)) {
    const fallbackHint = getFallbackMongoUri()
      ? "The app is configured to try a fallback URI next."
      : "Add `MONGO_URI_LOCAL=mongodb://127.0.0.1:27017/ecomapi` to `.env` for a local fallback, or replace the Atlas URI with a standard non-SRV `mongodb://...` connection string.";

    return new Error(
      `MongoDB Atlas SRV lookup failed. Your DNS/network refused the SRV query for the Atlas cluster. ${fallbackHint}`,
    );
  }

  return error;
};

export const shouldRetryWithFallback = (error, attemptedUri) => {
  return Boolean(getFallbackMongoUri()) && isSrvDnsError(error, attemptedUri);
};
