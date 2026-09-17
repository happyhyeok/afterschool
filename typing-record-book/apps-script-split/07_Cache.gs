function cacheKey_(namespace) {
  const parts = Array.prototype.slice.call(arguments, 1).map((value) => String(value || "").trim());
  const digest = parts.length ? digestKey_(parts.join("\u0000")) : "all";
  return ["trb", namespace, digest, CACHE_VERSION].join(":");
}

function digestKey_(value) {
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, value, Utilities.Charset.UTF_8);
  return bytes
    .slice(0, 12)
    .map((byte) => (byte < 0 ? byte + 256 : byte).toString(16).padStart(2, "0"))
    .join("");
}

function cacheGet_(key) {
  try {
    const value = CacheService.getScriptCache().get(key);
    return value ? JSON.parse(value) : null;
  } catch (error) {
    return null;
  }
}

function cachePut_(key, value, ttl) {
  try {
    CacheService.getScriptCache().put(key, JSON.stringify(value), ttl);
  } catch (error) {
    // Cache failures must not make the API fail.
  }
}

function cacheRemove_(key) {
  try {
    CacheService.getScriptCache().remove(key);
  } catch (error) {
    // Cache failures must not make the API fail.
  }
}
