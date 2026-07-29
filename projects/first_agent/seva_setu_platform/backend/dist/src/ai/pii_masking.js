"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.maskPII = maskPII;
function maskPII(text) {
    if (!text)
        return text;
    let masked = text.replace(/\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/g, "XXXX-XXXX-XXXX");
    masked = masked.replace(/\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b/g, "XXXXX0000X");
    masked = masked.replace(/\b[6-9]\d{9}\b/g, "XXXXXX0000");
    masked = masked.replace(/\b(A\/C|Account)\s?:?\s?\d{9,18}\b/ig, "$1: XXXX-XXXX-XXXX");
    return masked;
}
//# sourceMappingURL=pii_masking.js.map