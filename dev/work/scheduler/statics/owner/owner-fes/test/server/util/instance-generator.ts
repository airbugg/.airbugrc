import * as btoa from 'btoa';

export function createInstanceFrom(content) {
  return `dl3xosbn1Zyge14tDpVOxv6yNAEgLUQ4TrqUZAEmFRc.${btoa(
    JSON.stringify(content),
  )}`;
}
